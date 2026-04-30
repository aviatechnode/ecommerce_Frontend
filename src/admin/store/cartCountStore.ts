import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface CartCountState {
  count: number;

  setCount: (count: number) => void;
  increment: (by?: number) => void;
  decrement: (by?: number) => void;
  reset: () => void;

  syncFromItems: (itemsLength: number) => void;
}

export const useCartCountStore = create<CartCountState>()(
  devtools((set) => ({
    count: 0,

    setCount: (count) => set({ count }),

    increment: (by = 1) =>
      set((state) => ({ count: state.count + by })),

    decrement: (by = 1) =>
      set((state) => ({
        count: Math.max(0, state.count - by),
      })),

    reset: () => set({ count: 0 }),

    syncFromItems: (itemsLength) =>
      set({ count: itemsLength }),
  }))
);