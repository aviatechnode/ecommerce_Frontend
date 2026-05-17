import { z } from "zod";

/* =========================================================
HELPERS
========================================================= */

const toNumber = (val: unknown) => {
  if (
    val === null ||
    val === undefined ||
    val === ""
  ) {
    return undefined;
  }

  const n = Number(val);

  return Number.isFinite(n)
    ? n
    : undefined;
};

const toString = (val: unknown) => {
  if (typeof val !== "string") {
    return undefined;
  }

  const v = val.trim();

  return v.length
    ? v
    : undefined;
};

/* =========================================================
MEDIA SCHEMA
========================================================= */

export const productMediaSchema =
  z.object({
    id: z
      .string()
      .uuid()
      .optional(),

    url: z
      .string()
      .min(
        1,
        "Media URL is required"
      ),

    type: z
      .enum([
        "IMAGE",
        "VIDEO",
      ])
      .default("IMAGE"),

    position: z.preprocess(
      (v) =>
        v === undefined ||
        v === null
          ? 0
          : Number(v),
      z
        .number()
        .int()
        .nonnegative()
    ),
  });

/* =========================================================
VARIANT INVENTORY SCHEMA
========================================================= */

export const productInventorySchema =
  z.object({
    id: z
      .string()
      .uuid()
      .optional(),

    warehouseId: z.preprocess(
  (value) =>
    value === ""
      ? undefined
      : value,
  z.string().uuid()
),

    stock: z.preprocess(
      toNumber,
      z
        .number()
        .int()
        .default(0)
    ),

    reserved: z.preprocess(
      toNumber,
      z
        .number()
        .int()
        .default(0)
    ),

    threshold: z.preprocess(
      toNumber,
      z
        .number()
        .int()
        .optional()
    ).optional(),
  });

/* =========================================================
VARIANT ATTRIBUTE SCHEMA
========================================================= */

export const variantAttributeSchema =
  z.object({
    id: z
      .string()
      .uuid()
      .optional(),

    valueId: z
      .string()
      .uuid(),
  });

/* =========================================================
VARIANT SCHEMA
========================================================= */

export const productVariantSchema =
  z.object({
    id: z
      .string()
      .uuid()
      .optional(),

    name: z
      .string()
      .min(1),

    sku: z
      .string()
      .min(1)
      .transform((v) =>
        v.toUpperCase()
      ),

    price: z.preprocess(
      toNumber,
      z
        .number()
        .nonnegative()
    ),

    costPrice: z.preprocess(
      toNumber,
      z
        .number()
        .optional()
    ).optional(),

    compareAtPrice:
      z.preprocess(
        toNumber,
        z
          .number()
          .optional()
      ).optional(),

    weight: z.preprocess(
      toNumber,
      z
        .number()
        .optional()
    ).optional(),

    length: z.preprocess(
      toNumber,
      z
        .number()
        .optional()
    ).optional(),

    width: z.preprocess(
      toNumber,
      z
        .number()
        .optional()
    ).optional(),

    height: z.preprocess(
      toNumber,
      z
        .number()
        .optional()
    ).optional(),

    barcode: z.preprocess(
      toString,
      z
        .string()
        .optional()
    ),

    isActive: z
      .boolean()
      .default(true),

    attributes: z
      .array(
        variantAttributeSchema
      )
      .default([]),

    inventories: z
      .array(
        productInventorySchema
      )
      .default([]),
  });

/* =========================================================
OEM SCHEMA
========================================================= */

export const oemSchema =
  z.object({
    id: z
      .string()
      .uuid()
      .optional(),

    oemNumber: z
      .string()
      .min(1),
  });

/* =========================================================
SPECIFICATION SCHEMA
========================================================= */

export const specificationSchema =
  z.object({
    id: z
      .string()
      .uuid()
      .optional(),

    name: z
      .string()
      .min(1),

    value: z
      .string()
      .min(1),
  });

/* =========================================================
FITMENT SCHEMA
========================================================= */

export const fitmentSchema =
  z.object({
    id: z
      .string()
      .uuid()
      .optional(),

    trimId: z
      .string()
      .uuid(),

    notes: z
      .string()
      .optional(),
  });

/* =========================================================
MAIN PRODUCT SCHEMA
========================================================= */

export const createProductSchema =
  z.object({
    id: z
      .string()
      .uuid()
      .optional(),

    name: z
      .string()
      .min(1),

    description: z
      .string()
      .optional(),

    brandId: z
      .string()
      .uuid(),

    categoryId: z
      .string()
      .uuid(),

    isActive: z
      .boolean()
      .default(true),

    isFeatured: z
      .boolean()
      .default(false),

    searchKeywords: z
      .string()
      .optional(),

    oemNumbers: z
      .array(oemSchema)
      .default([]),

    specifications: z
      .array(
        specificationSchema
      )
      .default([]),

    productFitments: z
      .array(
        fitmentSchema
      )
      .default([]),

    medias: z
      .array(
        productMediaSchema
      )
      .default([]),

    variants: z
      .array(
        productVariantSchema
      )
      .default([]),
  });

/* =========================================================
UPDATE PRODUCT SCHEMA
========================================================= */

export const updateProductSchema =
  createProductSchema.partial();

/* =========================================================
TYPES
========================================================= */

export type ProductMedia =
  z.infer<
    typeof productMediaSchema
  >;

export type ProductInventory =
  z.infer<
    typeof productInventorySchema
  >;

export type VariantAttribute =
  z.infer<
    typeof variantAttributeSchema
  >;

export type ProductVariant =
  z.infer<
    typeof productVariantSchema
  >;

export type ProductOEMNumber =
  z.infer<
    typeof oemSchema
  >;

export type ProductSpecification =
  z.infer<
    typeof specificationSchema
  >;

export type ProductFitment =
  z.infer<
    typeof fitmentSchema
  >;

export type CreateProductInput =
  z.infer<
    typeof createProductSchema
  >;

export type UpdateProductInput =
  z.infer<
    typeof updateProductSchema
  >;