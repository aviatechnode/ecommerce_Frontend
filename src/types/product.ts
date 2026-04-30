export interface ProductMedia {
  id?: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  position: number;
}

export interface Product {
  id: string;
  name: string;
  price?: number;
  medias?: ProductMedia[];
}

export interface WishlistItem {
  id: string;
  product: Product;
}