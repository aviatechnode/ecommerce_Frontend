import { createApi } from "@reduxjs/toolkit/query/react";
import { api } from "../api/axios"; // your axios instance
import type {
  Coupon,
  CreateCouponDto,
  UpdateCouponDto,
  ListCouponsParams,
  ApiResponse,
  CouponValidationResult,
  CouponStats,
  CartContext,
} from "../types/coupon-types";

/* =========================================================
   AXIOS BASE QUERY (kept as is)
========================================================= */
const axiosBaseQuery = () => async ({ url, method, data, params }: any) => {
  try {
    const result = await api({ url, method, data, params });
    return { data: result.data };
  } catch (axiosError: any) {
    return {
      error: {
        status: axiosError.response?.status || 500,
        data: axiosError.response?.data || axiosError.message,
      },
    };
  }
};

/* =========================================================
   NORMALIZER: converts raw API coupon to typed Coupon
========================================================= */
const normalizeCoupon = (raw: any): Coupon => {
  // Helper to safely parse ISO date strings to Date objects
  const toDate = (val: any): Date | null => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  // Helper to convert string to number, preserving null/undefined
  const toNumber = (val: any): number | null => {
    if (val === undefined || val === null) return null;
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? null : num;
  };

  // Helper for required number fields (non-null)
  const toRequiredNumber = (val: any): number => {
    const num = typeof val === 'string' ? parseInt(val, 10) : val;
    return isNaN(num) ? 0 : num;
  };

  return {
    id: raw.id,
    code: raw.code,
    name: raw.name,
    description: raw.description ?? null,
    type: raw.type,
    scope: raw.scope,
    priority: toRequiredNumber(raw.priority),
    internalNotes: raw.internalNotes ?? null,
    amountOff: toNumber(raw.amountOff),
    percentOff: toNumber(raw.percentOff),
    maxDiscountAmount: toNumber(raw.maxDiscountAmount),
    freeShipping: Boolean(raw.freeShipping),
    minimumOrderAmount: toNumber(raw.minimumOrderAmount),
    minimumItemQuantity: toNumber(raw.minimumItemQuantity),
    firstOrderOnly: Boolean(raw.firstOrderOnly),
    appliesTo: raw.appliesTo,
    status: raw.status,
    startsAt: toDate(raw.startsAt),
    expiresAt: toDate(raw.expiresAt),
    usageLimit: toNumber(raw.usageLimit),
    perUserLimit: toRequiredNumber(raw.perUserLimit),
    isStackable: Boolean(raw.isStackable),
    excludeSaleItems: Boolean(raw.excludeSaleItems),
    productIds: Array.isArray(raw.productIds) ? raw.productIds : [],
    categoryIds: Array.isArray(raw.categoryIds) ? raw.categoryIds : [],
    customerIds: Array.isArray(raw.customerIds) ? raw.customerIds : [],
    metadata: raw.metadata && typeof raw.metadata === 'object' ? raw.metadata : null,
    createdAt: toDate(raw.createdAt)!,
    updatedAt: toDate(raw.updatedAt)!,
    deletedAt: toDate(raw.deletedAt),
    createdBy: raw.createdBy ?? null,
  };
};

/* =========================================================
   RTK QUERY API
========================================================= */
export const couponApi = createApi({
  reducerPath: "couponApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Coupon", "CouponList"],

  endpoints: (builder) => ({
    // CREATE
    createCoupon: builder.mutation<Coupon, CreateCouponDto>({
      query: (body) => ({
        url: "/api/coupons",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: ApiResponse<Coupon>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || "Failed to create coupon");
        }
        return normalizeCoupon(response.data);
      },
      invalidatesTags: [{ type: "CouponList", id: "LIST" }],
    }),

    // UPDATE
    updateCoupon: builder.mutation<Coupon, { id: string; data: UpdateCouponDto }>({
      query: ({ id, data }) => ({
        url: `/api/coupons/${id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: ApiResponse<Coupon>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || "Failed to update coupon");
        }
        return normalizeCoupon(response.data);
      },
      invalidatesTags: (_, __, { id }) => [
        { type: "Coupon", id },
        { type: "CouponList", id: "LIST" },
      ],
    }),

    // LIST
    listCoupons: builder.query<
      { coupons: Coupon[]; total: number; page: number; limit: number },
      ListCouponsParams
    >({
      query: (params) => ({
        url: "/api/coupons",
        method: "GET",
        params: {
          status: params.status,
          isActive: params.isActive?.toString(),
          page: params.page?.toString(),
          limit: params.limit?.toString(),
        },
      }),
      transformResponse: (response: ApiResponse & { coupons?: any[]; total?: number; page?: number; limit?: number }) => {
        if (!response.success) {
          throw new Error(response.message || "Failed to fetch coupons");
        }
        const coupons = (response.coupons || []).map(normalizeCoupon);
        return {
          coupons,
          total: response.total || 0,
          page: response.page || 1,
          limit: response.limit || 10,
        };
      },
      providesTags: (result) =>
        result
          ? [
              { type: "CouponList", id: "LIST" },
              ...result.coupons.map((c) => ({ type: "Coupon" as const, id: c.id })),
            ]
          : [{ type: "CouponList", id: "LIST" }],
    }),

    // GET BY ID
    getCouponById: builder.query<Coupon, string>({
      query: (id) => ({
        url: `/api/coupons/${id}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<Coupon>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || "Coupon not found");
        }
        return normalizeCoupon(response.data);
      },
      providesTags: (_, __, id) => [{ type: "Coupon", id }],
    }),

    // GET BY CODE
    getCouponByCode: builder.query<Coupon, string>({
      query: (code) => ({
        url: `/api/coupons/code/${code}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<Coupon>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || "Coupon not found");
        }
        return normalizeCoupon(response.data);
      },
      providesTags: (_, __, code) => [{ type: "Coupon", id: code }],
    }),

    // VALIDATE
    validateCoupon: builder.mutation<CouponValidationResult, { code: string; context: CartContext }>({
      query: (body) => ({
        url: "/api/coupons/validate",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: ApiResponse<CouponValidationResult>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || "Validation failed");
        }
        // If the result contains a coupon object, normalize it
        if (response.data.coupon) {
          response.data.coupon = normalizeCoupon(response.data.coupon);
        }
        return response.data;
      },
    }),

    // DELETE (soft delete)
    deleteCoupon: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api/coupons/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse) => {
        if (!response.success) {
          throw new Error(response.message || "Failed to delete coupon");
        }
        return { message: response.message || "Coupon deleted" };
      },
      invalidatesTags: (_, __, id) => [
        { type: "Coupon", id },
        { type: "CouponList", id: "LIST" },
      ],
    }),

    // COUPON STATS
    getCouponStats: builder.query<CouponStats, string>({
      query: (id) => ({
        url: `/api/coupons/${id}/stats`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<CouponStats>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || "Failed to fetch stats");
        }
        return response.data;
      },
      providesTags: (_, __, id) => [{ type: "Coupon", id }],
    }),

    // MAINTENANCE: EXPIRE COUPONS
    expireCoupons: builder.mutation<{ expired: number }, void>({
      query: () => ({
        url: "/api/coupons/maintenance/expire",
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<{ expired: number }>) => {
        if (!response.success) {
          throw new Error(response.message || "Failed to expire coupons");
        }
        return { expired: response.expired ?? 0 };
      },
      invalidatesTags: [{ type: "CouponList", id: "LIST" }],
    }),

    // MAINTENANCE: RELEASE RESERVATIONS
    releaseReservations: builder.mutation<{ released: number }, void>({
      query: () => ({
        url: "/api/coupons/maintenance/release",
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<{ released: number }>) => {
        if (!response.success) {
          throw new Error(response.message || "Failed to release reservations");
        }
        return { released: response.released ?? 0 };
      },
      invalidatesTags: [{ type: "CouponList", id: "LIST" }],
    }),
  }),
});

// Auto-generated hooks
export const {
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useListCouponsQuery,
  useLazyListCouponsQuery,
  useGetCouponByIdQuery,
  useLazyGetCouponByIdQuery,
  useGetCouponByCodeQuery,
  useLazyGetCouponByCodeQuery,
  useValidateCouponMutation,
  useDeleteCouponMutation,
  useGetCouponStatsQuery,
  useLazyGetCouponStatsQuery,
  useExpireCouponsMutation,
  useReleaseReservationsMutation,
} = couponApi;