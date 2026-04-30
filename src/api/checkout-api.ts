import { api } from "./axios";

export const checkoutApi = {
  checkout: async () => {
    const idempotencyKey = crypto.randomUUID();

    return api.post(
      "/api/checkout",
      {},
      {
        headers: {
          "x-idempotency-key": idempotencyKey,
        },
      }
    );
  },
};