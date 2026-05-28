import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../api/axiosBaseQuery";

// TYPES
export type ShipmentStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "ARRIVED_AT_HUB"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED"
  | "RETURNED"
  | "CANCELLED";

export interface ShipmentEvent {
  id: string;

  shipmentId: string;

  status: ShipmentStatus;

  title: string;

  description?: string | null;

  location?: string | null;

  createdAt: string;
}

export interface CreateShipmentEventPayload {
  shipmentId: string;

  status: ShipmentStatus;

  title: string;

  description?: string | null;

  location?: string | null;
}

export interface UpdateShipmentEventPayload {
  status?: ShipmentStatus;

  title?: string;

  description?: string | null;

  location?: string | null;
}

interface ApiResponse<T> {
  success: boolean;

  message?: string;

  data: T;
}

// API
export const shipmentEventApi = createApi({
  reducerPath: "shipmentEventApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["ShipmentEvent"],

  endpoints: (builder) => ({
    /**
     * CREATE EVENT
     */
    createShipmentEvent: builder.mutation<
      ApiResponse<ShipmentEvent>,
      CreateShipmentEventPayload
    >({
      query: (data) => ({
        url: "/api/shipment-events",

        method: "POST",

        data,
      }),

      invalidatesTags: (_result, _error, arg) => [
        {
          type: "ShipmentEvent",
          id: arg.shipmentId,
        },
      ],
    }),

    /**
     * GET ALL EVENTS FOR SHIPMENT
     */
    getShipmentEvents: builder.query<
      ApiResponse<ShipmentEvent[]>,
      string
    >({
      query: (shipmentId) => ({
        url: `/api/shipment-events/shipment/${shipmentId}`,

        method: "GET",
      }),

      providesTags: (_result, _error, shipmentId) => [
        {
          type: "ShipmentEvent",
          id: shipmentId,
        },
      ],
    }),

    /**
     * GET SINGLE EVENT
     */
    getShipmentEventById: builder.query<
      ApiResponse<ShipmentEvent>,
      string
    >({
      query: (id) => ({
        url: `/api/shipment-events/${id}`,

        method: "GET",
      }),

      providesTags: (_result, _error, id) => [
        {
          type: "ShipmentEvent",
          id,
        },
      ],
    }),

    /**
     * UPDATE EVENT
     */
    updateShipmentEvent: builder.mutation<
      ApiResponse<ShipmentEvent>,
      {
        id: string;

        data: UpdateShipmentEventPayload;
      }
    >({
      query: ({ id, data }) => ({
        url: `/api/shipment-events/${id}`,

        method: "PATCH",

        data,
      }),

      invalidatesTags: (_result, _error, arg) => [
        {
          type: "ShipmentEvent",
          id: arg.id,
        },
      ],
    }),

    /**
     * DELETE EVENT
     */
    deleteShipmentEvent: builder.mutation<
      ApiResponse<null>,
      string
    >({
      query: (id) => ({
        url: `/api/shipment-events/${id}`,

        method: "DELETE",
      }),

      invalidatesTags: (_result, _error, id) => [
        {
          type: "ShipmentEvent",
          id,
        },
      ],
    }),
  }),
});

// EXPORT HOOKS
export const {
  useCreateShipmentEventMutation,

  useGetShipmentEventsQuery,

  useGetShipmentEventByIdQuery,

  useUpdateShipmentEventMutation,

  useDeleteShipmentEventMutation,
} = shipmentEventApi;