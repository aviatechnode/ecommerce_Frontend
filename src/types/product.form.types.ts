import { z } from "zod";
import { createProductSchema } from "../schemas/product.schema";

export type ProductFormValues = z.infer<typeof createProductSchema>;