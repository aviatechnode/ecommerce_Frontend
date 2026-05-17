import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../api/axiosBaseQuery";

//////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////

export interface ShippingItem {
  variantId: string;
  quantity: number;
}

export interface CalculateShippingOptionsPayload {
  items: ShippingItem[];
  destinationStateId: string;
  destinationLgaId: string;
}

export interface CreateShipmentPayload {
  orderId: string;
  selectedCourierId: string;
  selectedWarehouseId: string;
  calculatedFee: number;
}

export interface UpdateShipmentPayload {
  id: string;
  status: string;
  trackingNo?: string;
  estimatedDeliveryDays?: number;
}

export interface CreateShippingRatePayload {
  [key: string]: any;
}

//////////////////////////////////////////////////////////
// API
//////////////////////////////////////////////////////////

export const shippingApi = createApi({
  reducerPath: "shippingApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Shipping", "Rates", "Warehouses", "Couriers"],

  endpoints: (builder) => ({
    /**
     * POST /shipping/calculate
     */
    calculateShippingOptions: builder.mutation({
      query: (body: CalculateShippingOptionsPayload) => ({
        url: "/shipping/calculate",
        method: "POST",
        data: body,
      }),
    }),

    /**
     * POST /shipping/shipments
     */
    createShipment: builder.mutation({
      query: (body: CreateShipmentPayload) => ({
        url: "/shipping/shipments",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Shipping"],
    }),

    /**
     * PATCH /shipping/shipments/:id
     */
    updateShipment: builder.mutation({
      query: ({ id, ...body }: UpdateShipmentPayload) => ({
        url: `/shipping/shipments/${id}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Shipping"],
    }),

    /**
     * GET /shipping/track/:orderId
     */
    trackShipment: builder.query({
      query: (orderId: string) => ({
        url: `/shipping/track/${orderId}`,
        method: "GET",
      }),
      providesTags: ["Shipping"],
    }),

    /**
     * GET /shipping/rates
     */
    getShippingRates: builder.query({
      query: () => ({
        url: "/shipping/rates",
        method: "GET",
      }),
      providesTags: ["Rates"],
    }),

    /**
     * POST /shipping/rates
     */
    createShippingRate: builder.mutation({
      query: (body: CreateShippingRatePayload) => ({
        url: "/shipping/rates",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Rates"],
    }),

    /**
     * GET /shipping/warehouses
     */
    getWarehouses: builder.query({
      query: () => ({
        url: "/shipping/warehouses",
        method: "GET",
      }),
      providesTags: ["Warehouses"],
    }),

    /**
     * GET /shipping/couriers
     */
    getCouriers: builder.query({
      query: () => ({
        url: "/shipping/couriers",
        method: "GET",
      }),
      providesTags: ["Couriers"],
    }),
  }),
});

//////////////////////////////////////////////////////////
// EXPORT HOOKS
//////////////////////////////////////////////////////////

export const {
  useCalculateShippingOptionsMutation,
  useCreateShipmentMutation,
  useUpdateShipmentMutation,
  useTrackShipmentQuery,
  useGetShippingRatesQuery,
  useCreateShippingRateMutation,
  useGetWarehousesQuery,
  useGetCouriersQuery,
} = shippingApi;