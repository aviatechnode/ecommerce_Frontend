import type { ProductVariant } from "../schemas/product.schema";

export interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  unitPrice?: number;

  variant?: ProductVariant;
}

export interface Cart {
  items: CartItem[];
}

export interface CartResponse {
  cart: Cart;
}