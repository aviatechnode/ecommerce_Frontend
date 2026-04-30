import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface WishlistCountState {
  count: number;

  setCount: (count: number) => void;
  increment: () => void;
  decrement: () => void;
  reset: () => void;

  // sync helper from Redux/API
  syncFromItems: (itemsLength: number) => void;
}

export const useWishlistCountStore = create<WishlistCountState>()(
  devtools((set) => ({
    count: 0,

    setCount: (count) => set({ count }),

    increment: () =>
      set((state) => ({ count: state.count + 1 })),

    decrement: () =>
      set((state) => ({
        count: Math.max(0, state.count - 1),
      })),

    reset: () => set({ count: 0 }),

    syncFromItems: (itemsLength) =>
      set({ count: itemsLength }),
  }))
);