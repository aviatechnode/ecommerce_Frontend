import { useGetCartQuery } from "../../services/cartApi";

/* =========================
   TYPES (adjust if needed)
========================= */

interface CartItem {
  id: string;
  quantity: number;
}

interface Cart {
  cart: {
    items: CartItem[];
  };
}

/* =========================
   HOOK
========================= */

export const useCartCount = (): number => {
  const { data } = useGetCartQuery();

  const items = (data as Cart | undefined)?.cart?.items ?? [];

  return items.reduce((sum, item) => sum + item.quantity, 0);
};

