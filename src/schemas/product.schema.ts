import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2),
  brandId: z.string(),
  categoryId: z.string(),
  price: z.string(),
  stock: z.string(),
  sku: z.string(),
});

export type ProductFormValues = z.infer<typeof productSchema>;