import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema } from "../../../schemas/product.schema";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "../../../services/productApi";
import type { z } from "zod";

export type CreateProductFormValues = z.input<typeof createProductSchema>;
type CreateProductInput = z.infer<typeof createProductSchema>;

export const emptyProduct: CreateProductFormValues = {
  name: "",
  brandId: "",
  categoryId: "",
  description: "",
  isActive: true,
  isFeatured: false,
  searchKeywords: "",
  oemNumbers: [],
  specifications: [],
  productFitments: [],
  medias: [],
  variants: [],
};

/**
 * Recursively removes server-only fields (id, createdAt, updatedAt, deletedAt).
 * Does NOT remove warehouseId.
 */
function stripServerFields<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map((item) => stripServerFields(item)) as T;
  }
  if (data && typeof data === "object" && data !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Only remove exact id, createdAt, updatedAt, deletedAt
      if (!["id", "createdAt", "updatedAt", "deletedAt"].includes(key)) {
        result[key] = stripServerFields(value);
      }
    }
    return result as T;
  }
  return data;
}

/**
 * Maps API product to form values.
 * Keeps warehouseId exactly as returned from the backend.
 */
function mapApiProductToForm(product: any): CreateProductFormValues {
  const stripped = stripServerFields(product);
  console.log("Mapped product for form:", stripped); // Debug

  return {
    name: stripped.name ?? "",
    description: stripped.description ?? "",
    brandId: stripped.brandId ?? "",
    categoryId: stripped.categoryId ?? "",
    isActive: stripped.isActive ?? true,
    isFeatured: stripped.isFeatured ?? false,
    searchKeywords: stripped.searchKeywords ?? "",
    oemNumbers: stripped.oemNumbers ?? [],
    specifications: stripped.specifications ?? [],
    productFitments: stripped.productFitments ?? [],
    medias: stripped.medias ?? [],
    variants: (stripped.variants || []).map((variant: any) => ({
      name: variant.name,
      sku: variant.sku,
      price: variant.price,
      costPrice: variant.costPrice,
      compareAtPrice: variant.compareAtPrice,
      weight: variant.weight,
      length: variant.length,
      width: variant.width,
      height: variant.height,
      barcode: variant.barcode,
      isActive: variant.isActive ?? true,
      attributes: (variant.attributes || []).map((attr: any) => ({
        valueId: attr.valueId,
      })),
      inventories: (variant.inventories || []).map((inv: any) => {
        // warehouseId is a direct field from Prisma (foreign key)
        const warehouseId = inv.warehouseId ?? inv.warehouse?.id ?? "";
        console.log(`Inventory warehouseId: ${warehouseId}`); // Debug
        return {
          warehouseId,
          stock: inv.stock ?? 0,
          reserved: inv.reserved ?? 0,
          threshold: inv.threshold ?? 0,
        };
      }),
    })),
  };
}

/**
 * Cleans variant for API submission.
 */
function cleanVariant(variant: any): any | null {
  if (!variant.name || !variant.sku || variant.price === undefined) {
    return null;
  }
  return {
    name: variant.name,
    sku: variant.sku,
    price: Number(variant.price),
    costPrice: variant.costPrice !== undefined ? Number(variant.costPrice) : undefined,
    compareAtPrice: variant.compareAtPrice !== undefined ? Number(variant.compareAtPrice) : undefined,
    weight: variant.weight !== undefined ? Number(variant.weight) : undefined,
    length: variant.length !== undefined ? Number(variant.length) : undefined,
    width: variant.width !== undefined ? Number(variant.width) : undefined,
    height: variant.height !== undefined ? Number(variant.height) : undefined,
    barcode: variant.barcode || undefined,
    isActive: variant.isActive ?? true,
    attributes: (variant.attributes || [])
      .filter((attr: any) => attr.valueId)
      .map(({ valueId }: any) => ({ valueId })),
    inventories: (variant.inventories || [])
      .filter((inv: any) => inv.warehouseId && inv.stock !== undefined)
      .map((inv: any) => ({
        warehouseId: inv.warehouseId,
        stock: Number(inv.stock),
        reserved: inv.reserved !== undefined ? Number(inv.reserved) : 0,
        threshold: inv.threshold !== undefined ? Number(inv.threshold) : undefined,
      })),
  };
}

/**
 * Sanitizes form values for API submission.
 */
export function sanitizeProductForApi(values: CreateProductFormValues): CreateProductInput {
  const emptyToUndef = (val: any) => (val === "" ? undefined : val);

  const result: any = {
    name: values.name?.trim() || undefined,
    description: emptyToUndef(values.description),
    brandId: values.brandId?.trim() || undefined,
    categoryId: values.categoryId?.trim() || undefined,
    isActive: values.isActive ?? true,
    isFeatured: values.isFeatured ?? false,
    searchKeywords: emptyToUndef(values.searchKeywords),
    oemNumbers: (values.oemNumbers || [])
      .filter((oem) => oem.oemNumber?.trim())
      .map(({ oemNumber }) => ({ oemNumber: oemNumber.trim() })),
    specifications: (values.specifications || [])
      .filter((spec) => spec.name?.trim() && spec.value?.trim())
      .map(({ name, value }) => ({ name: name.trim(), value: value.trim() })),
    productFitments: (values.productFitments || [])
      .filter((fit) => fit.trimId || fit.makeId || fit.isUniversal)
      .map((fit) => ({
        level: fit.level,
        makeId: fit.makeId || undefined,
        modelId: fit.modelId || undefined,
        generationId: fit.generationId || undefined,
        engineId: fit.engineId || undefined,
        trimId: fit.trimId || undefined,
        yearStart: fit.yearStart ? Number(fit.yearStart) : undefined,
        yearEnd: fit.yearEnd ? Number(fit.yearEnd) : undefined,
        notes: emptyToUndef(fit.notes),
        position: emptyToUndef(fit.position),
        quantityRequired: fit.quantityRequired ? Number(fit.quantityRequired) : undefined,
        isUniversal: fit.isUniversal ?? false,
      })),
    medias: (values.medias || [])
      .filter((media) => media.url?.trim())
      .map(({ url, type, position }) => ({
        url: url.trim(),
        type: type || "IMAGE",
        position: position ?? 0,
      })),
    variants: (values.variants || [])
      .map(cleanVariant)
      .filter((v) => v !== null),
  };

  Object.keys(result).forEach((key) => {
    if (result[key] === undefined) delete result[key];
  });

  return result as CreateProductInput;
}

export function useProductForm() {
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  const form = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: emptyProduct,
    mode: "onChange",
  });

  const resetFormWithProduct = (product: any) => {
    const mapped = mapApiProductToForm(product);
    console.log("Final form reset data:", mapped);
    form.reset(mapped);
  };

  const save = async (productId?: string): Promise<any> => {
    const values = form.getValues();
    const sanitized = sanitizeProductForApi(values);
    if (!productId) {
      const result = await createProduct(sanitized).unwrap();
      return result;
    } else {
      const result = await updateProduct({ id: productId, data: sanitized }).unwrap();
      return result;
    }
  };

  return {
    form,
    resetFormWithProduct,
    save,
    ...form,
  };
}