import { createApi } from "@reduxjs/toolkit/query/react";
import { api } from "../api/axios";

/* =========================================
TYPES
========================================= */

export type CheckoutAddressPayload = {
  name: string;
  phone: string;

  stateId: string;
  lgaId: string;

  city: string;

  area?: string | null;
  street: string;
  landmark?: string | null;
};

export type CheckoutPayload = {
  couponCode?: string;
  addressId?: string;
  address?: CheckoutAddressPayload;
};

export type OrderItem = {
  id: string;
  productName: string;
  variantName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
};

export type CheckoutOrder = {
  id: string;
  orderNumber: string;

  status: string;
  paymentStatus: string;

  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  totalAmount: number;

  currency: string;

  items?: OrderItem[];
};

export type CheckoutPayment = {
  id: string;
  reference: string;
  provider: string;
  amount: number;
  status: string;
};

export type CheckoutResponse = {
  message: string;

  order: CheckoutOrder;
  payment: CheckoutPayment;

  shippingFee: number;
  courier: string;
  distanceKm: number;
};

export type DuplicateCheckoutResponse = {
  message: string;
  data: CheckoutResponse;
};

export type InitializePaymentPayload = {
  orderId: string;
};

export type InitializePaymentResponse = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export type CouponPreviewPayload = {
  code: string;
  orderAmount: number;
};

export type CouponPreview = {
  valid: boolean;
  discount: number;
  finalAmount: number;
  message?: string;
};

export type ApiErrorResponse = {
  message: string;
  errors?: any;
};

/* =========================================
HELPERS
========================================= */

const generateIdempotencyKey = () =>
  `checkout_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 10)}`;

/* =========================================
BASE QUERY
========================================= */

const axiosBaseQuery =
  () =>
  async ({
    url,
    method,
    data,
    headers,
  }: {
    url: string;
    method: string;
    data?: unknown;
    headers?: Record<string, string>;
  }) => {
    try {
      const result = await api({
        url,
        method,
        data,
        headers,
        withCredentials: true,
      });

      return {
        data: result.data,
      };
    } catch (axiosError: any) {
      return {
        error: {
          status: axiosError.response?.status ?? 500,
          data: {
            message:
              axiosError.response?.data?.message ||
              "Something went wrong",

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
    /* =========================================
    CREATE CHECKOUT
    ========================================= */

    createCheckout: builder.mutation<
      CheckoutResponse | DuplicateCheckoutResponse,
      CheckoutPayload
    >({
      query: (body) => ({
        url: "/api/checkout",
        method: "POST",
        data: body,

        headers: {
          "Idempotency-Key": generateIdempotencyKey(),
        },
      }),

      invalidatesTags: ["Checkout"],

      transformResponse: (
        response: CheckoutResponse | DuplicateCheckoutResponse
      ) => response,

      transformErrorResponse: (response: any): ApiErrorResponse => ({
        message:
          response?.data?.message || "Checkout failed",

        errors: response?.data?.errors,
      }),
    }),

    /* =========================================
    INITIALIZE PAYMENT
    ========================================= */

    initializePayment: builder.mutation<
      InitializePaymentResponse,
      InitializePaymentPayload
    >({
      query: (body) => ({
        url: "/api/payments/initialize",
        method: "POST",
        data: body,
      }),

      transformErrorResponse: (response: any): ApiErrorResponse => ({
        message:
          response?.data?.message ||
          "Failed to initialize payment",
      }),
    }),

    /* =========================================
    PREVIEW COUPON
    ========================================= */

    previewCoupon: builder.mutation<
      CouponPreview,
      CouponPreviewPayload
    >({
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

      transformErrorResponse: (
        err: any
      ): CouponPreview => ({
        valid: false,
        discount: 0,
        finalAmount: 0,
        message:
          err?.data?.message ||
          err?.data ||
          "Invalid coupon",
      }),

      invalidatesTags: ["Coupon"],
    }),
  }),
});

/* =========================================
EXPORT HOOKS
========================================= */

export const {
  useCreateCheckoutMutation,
  useInitializePaymentMutation,
  usePreviewCouponMutation,
} = checkoutApi;