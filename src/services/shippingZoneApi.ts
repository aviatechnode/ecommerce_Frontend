import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "../api/axiosBaseQuery";

import type {
  ShippingZone,
  ShippingZoneState,
  ShippingZoneLGA,

  CreateShippingZoneInput,
  UpdateShippingZoneInput,

  CreateShippingZoneStateInput,
  UpdateShippingZoneStateInput,

  CreateShippingZoneLGAInput,
  UpdateShippingZoneLGAInput,
} from "../types/shipping-zone.types";

export const shippingZoneApi = createApi({
  reducerPath: "shippingZoneApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: [
    "ShippingZone",
    "ShippingZoneState",
    "ShippingZoneLGA",
  ],

  endpoints: (builder) => ({
    /* =========================================================
       SHIPPING ZONES
    ========================================================= */

    createZone: builder.mutation<
      ShippingZone,
      CreateShippingZoneInput
    >({
      query: (data) => ({
        url: "/api/shipping-zones",
        method: "POST",
        data,
      }),

      invalidatesTags: ["ShippingZone"],
    }),

    getAllZones: builder.query<
      ShippingZone[],
      void
    >({
      query: () => ({
        url: "/api/shipping-zones",
        method: "GET",
      }),

      providesTags: ["ShippingZone"],
    }),

    getActiveZones: builder.query<
      ShippingZone[],
      void
    >({
      query: () => ({
        url: "/api/shipping-zones/active",
        method: "GET",
      }),

      providesTags: ["ShippingZone"],
    }),

    getZoneById: builder.query<
      ShippingZone,
      string
    >({
      query: (id) => ({
        url: `/api/shipping-zones/${id}`,
        method: "GET",
      }),

      providesTags: (_r, _e, id) => [
        {
          type: "ShippingZone",
          id,
        },
      ],
    }),

    updateZone: builder.mutation<
      ShippingZone,
      {
        id: string;
        data: UpdateShippingZoneInput;
      }
    >({
      query: ({ id, data }) => ({
        url: `/api/shipping-zones/${id}`,
        method: "PUT",
        data,
      }),

      invalidatesTags: (_r, _e, { id }) => [
        {
          type: "ShippingZone",
          id,
        },
        "ShippingZone",
      ],
    }),

    toggleZoneStatus: builder.mutation<
      ShippingZone,
      string
    >({
      query: (id) => ({
        url: `/api/shipping-zones/${id}/toggle`,
        method: "PATCH",
      }),

      invalidatesTags: (_r, _e, id) => [
        {
          type: "ShippingZone",
          id,
        },
        "ShippingZone",
      ],
    }),

    deleteZone: builder.mutation<
      { message: string },
      string
    >({
      query: (id) => ({
        url: `/api/shipping-zones/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["ShippingZone"],
    }),

    /* =========================================================
       SHIPPING ZONE STATES
    ========================================================= */

    createStateMapping: builder.mutation<
      ShippingZoneState,
      CreateShippingZoneStateInput
    >({
      query: (data) => ({
        url: "/api/shipping-zones/states",
        method: "POST",
        data,
      }),

      invalidatesTags: [
        "ShippingZoneState",
        "ShippingZone",
      ],
    }),

    getAllStateMappings: builder.query<
      ShippingZoneState[],
      void
    >({
      query: () => ({
        url: "/api/shipping-zones/states",
        method: "GET",
      }),

      providesTags: ["ShippingZoneState"],
    }),

    getStateMappingById: builder.query<
      ShippingZoneState,
      string
    >({
      query: (id) => ({
        url: `/api/shipping-zones/states/${id}`,
        method: "GET",
      }),

      providesTags: (_r, _e, id) => [
        {
          type: "ShippingZoneState",
          id,
        },
      ],
    }),

    updateStateMapping: builder.mutation<
      ShippingZoneState,
      {
        id: string;
        data: UpdateShippingZoneStateInput;
      }
    >({
      query: ({ id, data }) => ({
        url: `/api/shipping-zones/states/${id}`,
        method: "PUT",
        data,
      }),

      invalidatesTags: (_r, _e, { id }) => [
        {
          type: "ShippingZoneState",
          id,
        },
        "ShippingZoneState",
      ],
    }),

    deleteStateMapping: builder.mutation<
      { message: string },
      string
    >({
      query: (id) => ({
        url: `/api/shipping-zones/states/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: [
        "ShippingZoneState",
        "ShippingZone",
      ],
    }),

    bulkAssignStates: builder.mutation<
      any,
      {
        zoneId: string;
        stateIds: string[];
      }
    >({
      query: (data) => ({
        url: "/api/shipping-zones/states/bulk",
        method: "POST",
        data,
      }),

      invalidatesTags: [
        "ShippingZoneState",
        "ShippingZone",
      ],
    }),

    clearZoneStates: builder.mutation<
      any,
      string
    >({
      query: (zoneId) => ({
        url: `/api/shipping-zones/${zoneId}/states`,
        method: "DELETE",
      }),

      invalidatesTags: [
        "ShippingZoneState",
        "ShippingZone",
      ],
    }),

    getZonesByState: builder.query<
      ShippingZoneState[],
      string
    >({
      query: (stateId) => ({
        url: `/api/shipping-zones/state/${stateId}/zones`,
        method: "GET",
      }),

      providesTags: ["ShippingZoneState"],
    }),

    /* =========================================================
       SHIPPING ZONE LGAS
    ========================================================= */

    createLGAMapping: builder.mutation<
      ShippingZoneLGA,
      CreateShippingZoneLGAInput
    >({
      query: (data) => ({
        url: "/api/shipping-zones/lgas",
        method: "POST",
        data,
      }),

      invalidatesTags: [
        "ShippingZoneLGA",
        "ShippingZone",
      ],
    }),

    getAllLGAMappings: builder.query<
      ShippingZoneLGA[],
      void
    >({
      query: () => ({
        url: "/api/shipping-zones/lgas",
        method: "GET",
      }),

      providesTags: ["ShippingZoneLGA"],
    }),

    getLGAMappingById: builder.query<
      ShippingZoneLGA,
      string
    >({
      query: (id) => ({
        url: `/api/shipping-zones/lgas/${id}`,
        method: "GET",
      }),

      providesTags: (_r, _e, id) => [
        {
          type: "ShippingZoneLGA",
          id,
        },
      ],
    }),

    updateLGAMapping: builder.mutation<
      ShippingZoneLGA,
      {
        id: string;
        data: UpdateShippingZoneLGAInput;
      }
    >({
      query: ({ id, data }) => ({
        url: `/api/shipping-zones/lgas/${id}`,
        method: "PUT",
        data,
      }),

      invalidatesTags: (_r, _e, { id }) => [
        {
          type: "ShippingZoneLGA",
          id,
        },
        "ShippingZoneLGA",
      ],
    }),

    deleteLGAMapping: builder.mutation<
      { message: string },
      string
    >({
      query: (id) => ({
        url: `/api/shipping-zones/lgas/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: [
        "ShippingZoneLGA",
        "ShippingZone",
      ],
    }),

    bulkAssignLGAs: builder.mutation<
      any,
      {
        zoneId: string;
        lgaIds: string[];
      }
    >({
      query: (data) => ({
        url: "/api/shipping-zones/lgas/bulk",
        method: "POST",
        data,
      }),

      invalidatesTags: [
        "ShippingZoneLGA",
        "ShippingZone",
      ],
    }),

    clearZoneLGAs: builder.mutation<
      any,
      string
    >({
      query: (zoneId) => ({
        url: `/api/shipping-zones/${zoneId}/lgas`,
        method: "DELETE",
      }),

      invalidatesTags: [
        "ShippingZoneLGA",
        "ShippingZone",
      ],
    }),

    getLGAsByZone: builder.query<
      ShippingZoneLGA[],
      string
    >({
      query: (zoneId) => ({
        url: `/api/shipping-zones/${zoneId}/lgas`,
        method: "GET",
      }),

      providesTags: ["ShippingZoneLGA"],
    }),

    getZonesByLGA: builder.query<
      ShippingZoneLGA[],
      string
    >({
      query: (lgaId) => ({
        url: `/api/shipping-zones/lga/${lgaId}/zones`,
        method: "GET",
      }),

      providesTags: ["ShippingZoneLGA"],
    }),
  }),
});

export const {
  /* =========================================================
     SHIPPING ZONES
  ========================================================= */

  useCreateZoneMutation,
  useGetAllZonesQuery,
  useGetActiveZonesQuery,
  useGetZoneByIdQuery,
  useUpdateZoneMutation,
  useToggleZoneStatusMutation,
  useDeleteZoneMutation,

  /* =========================================================
     SHIPPING ZONE STATES
  ========================================================= */

  useCreateStateMappingMutation,
  useGetAllStateMappingsQuery,
  useGetStateMappingByIdQuery,
  useUpdateStateMappingMutation,
  useDeleteStateMappingMutation,
  useBulkAssignStatesMutation,
  useClearZoneStatesMutation,
  useGetZonesByStateQuery,

  /* =========================================================
     SHIPPING ZONE LGAS
  ========================================================= */

  useCreateLGAMappingMutation,
  useGetAllLGAMappingsQuery,
  useGetLGAMappingByIdQuery,
  useUpdateLGAMappingMutation,
  useDeleteLGAMappingMutation,
  useBulkAssignLGAsMutation,
  useClearZoneLGAsMutation,
  useGetLGAsByZoneQuery,
  useGetZonesByLGAQuery,
} = shippingZoneApi;