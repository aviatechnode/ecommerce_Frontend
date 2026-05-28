import { z } from "zod";

/* =========================================================
HELPERS
========================================================= */

const toNumber = (val: unknown) => {
  if (val === null || val === undefined || val === "") return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
};

const toString = (val: unknown) => {
  if (typeof val !== "string") return undefined;
  const v = val.trim();
  return v.length ? v : undefined;
};

/* =========================================================
SHIPPING RATE SCHEMAS
========================================================= */

export const createShippingRateSchema = z.object({
  courierId: z.string().uuid("Invalid courier ID format"),
  zoneId: z.string().uuid("Invalid zone ID format"),
  name: z.string().min(1, "Name is required"),
  minWeight: z.preprocess(toNumber, z.number().min(0, "Minimum weight cannot be negative")),
  maxWeight: z.preprocess(toNumber, z.number().positive("Maximum weight must be greater than 0")),
  baseFee: z.preprocess(toNumber, z.number().min(0, "Base fee cannot be negative")),
  perKgFee: z.preprocess(toNumber, z.number().min(0, "Per kg fee cannot be negative")),
  volumetricDivisor: z.preprocess(toNumber, z.number().positive("Volumetric divisor must be greater than 0").default(5000)),
  fixedFee: z.preprocess(toNumber, z.number().optional().nullable()),
  remoteAreaSurcharge: z.preprocess(toNumber, z.number().optional().nullable()),
  insurancePercent: z.preprocess(toNumber, z.number().min(0, "Insurance percent cannot be negative").default(0)),
  priority: z.preprocess(toNumber, z.number().int("Priority must be an integer").min(0, "Priority cannot be negative").default(0)),
  supportsCOD: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateShippingRateSchema = createShippingRateSchema.partial();

export const shippingRateIdParamSchema = z.object({
  id: z.string().uuid("Invalid shipping rate ID format"),
});

export type CreateShippingRateInput = z.infer<typeof createShippingRateSchema>;
export type UpdateShippingRateInput = z.infer<typeof updateShippingRateSchema>;

/* =========================================================
MEDIA SCHEMA
========================================================= */

export const productMediaSchema = z.object({
  id: z.string().uuid().optional(),
  url: z.string().min(1),
  type: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  position: z.preprocess((v) => (v ?? 0), z.number().int().nonnegative()),
});

/* =========================================================
INVENTORY
========================================================= */

export const productInventorySchema = z.object({
  id: z.string().uuid().optional(),
  warehouseId: z.string().uuid(),
  stock: z.preprocess(toNumber, z.number().int().default(0)),
  reserved: z.preprocess(toNumber, z.number().int().default(0)),
  threshold: z.preprocess(toNumber, z.number().int().optional()).optional(),
});

/* =========================================================
VARIANT ATTRIBUTES
========================================================= */

export const variantAttributeSchema = z.object({
  id: z.string().uuid().optional(),
  valueId: z.string().uuid(),
});

/* =========================================================
VARIANT
========================================================= */

export const productVariantSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  sku: z.string().min(1).transform((v) => v.toUpperCase()),
  price: z.preprocess(toNumber, z.number().nonnegative()),
  costPrice: z.preprocess(toNumber, z.number().optional()).optional(),
  compareAtPrice: z.preprocess(toNumber, z.number().optional()).optional(),
  weight: z.preprocess(toNumber, z.number().optional()).optional(),
  length: z.preprocess(toNumber, z.number().optional()).optional(),
  width: z.preprocess(toNumber, z.number().optional()).optional(),
  height: z.preprocess(toNumber, z.number().optional()).optional(),
  barcode: z.preprocess(toString, z.string().optional()),
  isActive: z.boolean().default(true),

  attributes: z.array(variantAttributeSchema).default([]),
  inventories: z.array(productInventorySchema).default([]),
});

/* =========================================================
OEM
========================================================= */

export const oemSchema = z.object({
  id: z.string().uuid().optional(),
  oemNumber: z.string().min(1),
});

/* =========================================================
SPECIFICATION
========================================================= */

export const specificationSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  value: z.string().min(1),
});

/* =========================================================
FITMENT
========================================================= */

export const fitmentSchema = z.object({
  id: z.string().uuid().optional(),
  level: z.enum(["MAKE", "MODEL", "GENERATION", "ENGINE", "TRIM"]).default("TRIM"),
  makeId: z.string().uuid().optional(),
  modelId: z.string().uuid().optional(),
  generationId: z.string().uuid().optional(),
  engineId: z.string().uuid().optional(),
  trimId: z.string().uuid().optional(),
  yearStart: z.preprocess(toNumber, z.number().int().optional()).optional(),
  yearEnd: z.preprocess(toNumber, z.number().int().optional()).optional(),
  notes: z.string().optional(),
  position: z.string().optional(),
  quantityRequired: z.preprocess(toNumber, z.number().int().optional()).optional(),
  isUniversal: z.boolean().default(false),
});

/* =========================================================
CORE PRODUCT (CREATE ONLY)
========================================================= */

export const createProductSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  brandId: z.string().uuid(),
  categoryId: z.string().uuid(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  searchKeywords: z.string().optional(),

  oemNumbers: z.array(oemSchema).default([]),
  specifications: z.array(specificationSchema).default([]),
  productFitments: z.array(fitmentSchema).default([]),
  medias: z.array(productMediaSchema).default([]),
  variants: z.array(productVariantSchema).default([]),
});

/* =========================================================
UPDATE PRODUCT
========================================================= */

export const updateProductSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  brandId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  searchKeywords: z.string().optional(),
  // Add nested fields (all optional)
  oemNumbers: z.array(oemSchema).optional(),
  specifications: z.array(specificationSchema).optional(),
  productFitments: z.array(fitmentSchema).optional(),
  medias: z.array(productMediaSchema).optional(),
  variants: z.array(productVariantSchema).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

/* =========================================================
🔽 ADD THESE EXPORTS (FIXES YOUR IMPORTS)
========================================================= */
export type ProductVariant = z.infer<typeof productVariantSchema>;
export type Media = z.infer<typeof productMediaSchema>;
export type ProductSpecification = z.infer<typeof specificationSchema>;
export type ProductFitment = z.infer<typeof fitmentSchema>;
export type ProductOEM = z.infer<typeof oemSchema>;