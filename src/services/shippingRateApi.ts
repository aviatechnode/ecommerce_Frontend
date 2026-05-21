import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../api/axiosBaseQuery";


// TYPES
export interface ShippingRate {
  id: string;

  courierId: string;

  zoneId: string;

  name: string;

  minWeight: number;

  maxWeight: number;

  baseFee: number;

  perKgFee: number;

  volumetricDivisor: number;

  fixedFee?: number | null;

  remoteAreaSurcharge?: number | null;

  insurancePercent: number;

  estimatedDaysMin: number;

  estimatedDaysMax: number;

  supportsCOD: boolean;

  isActive: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;

  message?: string;

  data: T;
}


// PAYLOADS
export interface CreateShippingRatePayload {
  courierId: string;

  zoneId: string;

  name: string;

  minWeight: number;

  maxWeight: number;

  baseFee: number;

  perKgFee: number;

  volumetricDivisor?: number;

  fixedFee?: number | null;

  remoteAreaSurcharge?: number | null;

  insurancePercent?: number;

  estimatedDaysMin: number;

  estimatedDaysMax: number;

  supportsCOD?: boolean;

  isActive?: boolean;
}

export interface UpdateShippingRatePayload
  extends Partial<CreateShippingRatePayload> {}

export interface FindBestRatePayload {
  courierId: string;

  zoneId: string;

  weight: number;
}

//API
export const shippingRateApi =
  createApi({
    reducerPath:
      "shippingRateApi",

    baseQuery:
      axiosBaseQuery(),

    tagTypes: ["ShippingRate"],

    endpoints: (builder) => ({
      /**
       * CREATE
       */
      createShippingRate:
        builder.mutation<
          ApiResponse<ShippingRate>,
          CreateShippingRatePayload
        >({
          query: (data) => ({
            url:
              "/api/shipping-rates",

            method: "POST",

            data,
          }),

          invalidatesTags: [
            "ShippingRate",
          ],
        }),

      /**
       * GET ALL
       */
      getShippingRates:
        builder.query<
          ApiResponse<
            ShippingRate[]
          >,
          void
        >({
          query: () => ({
            url:
              "/api/shipping-rates",

            method: "GET",
          }),

          providesTags: [
            "ShippingRate",
          ],
        }),

      /**
       * GET BY ID
       */
      getShippingRateById:
        builder.query<
          ApiResponse<ShippingRate>,
          string
        >({
          query: (id) => ({
            url: `/api/shipping-rates/${id}`,

            method: "GET",
          }),

          providesTags: (
            _result,
            _error,
            id
          ) => [
            {
              type:
                "ShippingRate",

              id,
            },
          ],
        }),

      /**
       * UPDATE
       */
      updateShippingRate:
        builder.mutation<
          ApiResponse<ShippingRate>,
          {
            id: string;

            data: UpdateShippingRatePayload;
          }
        >({
          query: ({
            id,
            data,
          }) => ({
            url: `/api/shipping-rates/${id}`,

            method: "PATCH",

            data,
          }),

          invalidatesTags: (
            _result,
            _error,
            arg
          ) => [
            "ShippingRate",
            {
              type:
                "ShippingRate",

              id: arg.id,
            },
          ],
        }),

      /**
       * TOGGLE ACTIVE
       */
      toggleShippingRate:
        builder.mutation<
          ApiResponse<ShippingRate>,
          string
        >({
          query: (id) => ({
            url: `/api/shipping-rates/${id}/toggle-active`,

            method: "PATCH",
          }),

          invalidatesTags: (
            _result,
            _error,
            id
          ) => [
            "ShippingRate",
            {
              type:
                "ShippingRate",

              id,
            },
          ],
        }),

      /**
       * DELETE
       */
      deleteShippingRate:
        builder.mutation<
          ApiResponse<null>,
          string
        >({
          query: (id) => ({
            url: `/api/shipping-rates/${id}`,

            method: "DELETE",
          }),

          invalidatesTags: [
            "ShippingRate",
          ],
        }),

      /**
       * FIND BEST RATE
       */
      findBestShippingRate:
        builder.mutation<
          ApiResponse<ShippingRate>,
          FindBestRatePayload
        >({
          query: (data) => ({
            url:
              "/api/shipping-rates/find-best-rate",

            method: "POST",

            data,
          }),
        }),
    }),
  });

// HOOKS
export const {
  useCreateShippingRateMutation,

  useGetShippingRatesQuery,

  useGetShippingRateByIdQuery,

  useUpdateShippingRateMutation,

  useToggleShippingRateMutation,

  useDeleteShippingRateMutation,

  useFindBestShippingRateMutation,
} = shippingRateApi;