import { create } from "zustand";

interface Store {
  step: "CART" | "REVIEW" | "PROCESSING" | "SUCCESS" | "FAILED";

  orderId: string | null;
  paymentReference: string | null;

  setStep: (step: Store["step"]) => void;

  setCheckoutData: (data: {
    orderId: string;
    paymentReference: string;
  }) => void;

  reset: () => void;
}

export const useCheckoutStore = create<Store>((set) => ({
  step: "CART",

  orderId: null,
  paymentReference: null,

  setStep: (step) => set({ step }),

  setCheckoutData: ({ orderId, paymentReference }) =>
    set({
      orderId,
      paymentReference,
      step: "PROCESSING",
    }),

  reset: () =>
    set({
      step: "CART",
      orderId: null,
      paymentReference: null,
    }),
}));