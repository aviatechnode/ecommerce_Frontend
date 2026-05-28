import { createApi } from "@reduxjs/toolkit/query/react";
import { api } from "../api/axios";
import type { ApiErrorResponse, CheckoutPayload, CheckoutResponse, CouponPreview, CouponPreviewPayload, DuplicateCheckoutResponse } from "../types/checkout-types";

/* =========================================
HELPERS
========================================= */

const generateIdempotencyKey = () =>
  `checkout_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

/* =========================================
BASE QUERY
========================================= */

const axiosBaseQuery = () =>
  async ({ url, method, data, headers }: { url: string; method: string; data?: unknown; headers?: Record<string, string> }) => {
    try {
      const result = await api({
        url,
        method,
        data,
        headers,
        withCredentials: true,
      });
      return { data: result.data };
    } catch (axiosError: any) {
      return {
        error: {
          status: axiosError.response?.status ?? 500,
          data: {
            message: axiosError.response?.data?.message || "Something went wrong",
            errors: axiosError.response?.data?.errors,
          } satisfies ApiErrorResponse,
        },
      };
    }
  };

/* =========================================
API
========================================= */

export const checkoutApi = createApi({
  reducerPath: "checkoutApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Checkout", "Coupon"],
  endpoints: (builder) => ({
    // Single endpoint that creates order, reserves stock, creates shipment, and initializes payment
    createCheckout: builder.mutation<CheckoutResponse | DuplicateCheckoutResponse, CheckoutPayload>({
      query: (body) => ({
        url: "/api/checkout",
        method: "POST",
        data: body,
        headers: {
          "Idempotency-Key": generateIdempotencyKey(),
        },
      }),
      invalidatesTags: ["Checkout"],
    }),

    // Preview coupon before finalizing checkout
    previewCoupon: builder.mutation<CouponPreview, CouponPreviewPayload>({
      query: (body) => ({
        url: "/api/coupon/apply",
        method: "POST",
        data: body,
      }),
      transformResponse: (res: any): CouponPreview => ({
        valid: true,
        discount: Number(res.discount ?? 0),
        finalAmount: Number(res.finalAmount ?? 0),
        message: res.message || "Coupon applied",
      }),
      transformErrorResponse: (err: any): CouponPreview => ({
        valid: false,
        discount: 0,
        finalAmount: 0,
        message: err?.data?.message || err?.data || "Invalid coupon",
      }),
      invalidatesTags: ["Coupon"],
    }),
  }),
});

export const { useCreateCheckoutMutation, usePreviewCouponMutation } = checkoutApi;