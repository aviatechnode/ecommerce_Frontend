export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  brand: { id: string; name: string };
  category: { id: string; name: string };
  medias: { url: string }[];
  variants: Variant[];
}

export interface Variant {
  id: string;
  name: string;
  sku: string;
  price: string;
  inventories: Inventory[];
}

export interface Inventory {
  stock: number;
  warehouse: {
    name: string;
  };
}