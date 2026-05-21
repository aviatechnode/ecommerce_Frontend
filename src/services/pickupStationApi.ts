import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "../api/axiosBaseQuery";

//////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////

export interface PickupStation {
  id: string;

  name: string;

  courierId: string;

  stateId: string;

  lgaId: string;

  address: string;

  landmark?: string;

  phone?: string;

  latitude?: number;

  longitude?: number;

  openingHours?: string;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;
}

//////////////////////////////////////////////////////////
// DTOs
//////////////////////////////////////////////////////////

export interface CreatePickupStationDTO {
  name: string;

  courierId: string;

  stateId: string;

  lgaId: string;

  address: string;

  landmark?: string;

  phone?: string;

  latitude?: number;

  longitude?: number;

  openingHours?: string;

  isActive?: boolean;
}

export interface UpdatePickupStationDTO
  extends Partial<CreatePickupStationDTO> {}

//////////////////////////////////////////////////////////
// SHIPPING
//////////////////////////////////////////////////////////

export const ShippingMethod = {
  STANDARD: "STANDARD",
  EXPRESS: "EXPRESS",
  SAME_DAY: "SAME_DAY",
  PICKUP_STATION: "PICKUP_STATION",
} as const;

export type ShippingMethod =
  (typeof ShippingMethod)[keyof typeof ShippingMethod];

export interface ShipmentDeliveryDTO {
  shippingMethod: ShippingMethod;

  pickupStationId?: string;
}

//////////////////////////////////////////////////////////
// FILTERS
//////////////////////////////////////////////////////////

export interface PickupStationQueryParams {
  page?: number;

  limit?: number;

  stateId?: string;

  lgaId?: string;

  courierId?: string;

  search?: string;

  isActive?: boolean;
}

//////////////////////////////////////////////////////////
// API
//////////////////////////////////////////////////////////

export const pickupStationApi =
  createApi({
    reducerPath: "pickupStationApi",

    baseQuery: axiosBaseQuery(),

    tagTypes: [
      "PickupStations",
      "PickupStation",
    ],

    endpoints: (builder) => ({
      //////////////////////////////////////////////////////
      // CREATE
      //////////////////////////////////////////////////////

      createPickupStation:
        builder.mutation<
          PickupStation,
          CreatePickupStationDTO
        >({
          query: (data) => ({
            url: "/api/pickup-stations",

            method: "POST",

            data,
          }),

          invalidatesTags: [
            "PickupStations",
          ],
        }),

      //////////////////////////////////////////////////////
      // GET ALL
      //////////////////////////////////////////////////////

      getPickupStations:
        builder.query<
          PickupStation[],
          PickupStationQueryParams | void
        >({
          query: (params) => ({
            url: "/api/pickup-stations",

            method: "GET",

            params,
          }),

          providesTags: [
            "PickupStations",
          ],
        }),

      //////////////////////////////////////////////////////
      // GET ACTIVE
      //////////////////////////////////////////////////////

      getActivePickupStations:
        builder.query<
          PickupStation[],
          {
            stateId?: string;

            lgaId?: string;

            courierId?: string;
          }
        >({
          query: (params) => ({
            url: "/api/pickup-stations/active",

            method: "GET",

            params,
          }),

          providesTags: [
            "PickupStations",
          ],
        }),

      //////////////////////////////////////////////////////
      // GET BY ID
      //////////////////////////////////////////////////////

      getPickupStationById:
        builder.query<
          PickupStation,
          string
        >({
          query: (id) => ({
            url: `/api/pickup-stations/${id}`,

            method: "GET",
          }),

          providesTags: (
            _result,
            _error,
            id
          ) => [
            {
              type: "PickupStation",

              id,
            },
          ],
        }),

      //////////////////////////////////////////////////////
      // UPDATE
      //////////////////////////////////////////////////////

      updatePickupStation:
        builder.mutation<
          PickupStation,
          {
            id: string;

            data: UpdatePickupStationDTO;
          }
        >({
          query: ({
            id,
            data,
          }) => ({
            url: `/api/pickup-stations/${id}`,

            method: "PUT",

            data,
          }),

          invalidatesTags: (
            _result,
            _error,
            arg
          ) => [
            "PickupStations",
            {
              type:
                "PickupStation",

              id: arg.id,
            },
          ],
        }),

      //////////////////////////////////////////////////////
      // TOGGLE ACTIVE
      //////////////////////////////////////////////////////

      togglePickupStation:
        builder.mutation<
          PickupStation,
          string
        >({
          query: (id) => ({
            url: `/api/pickup-stations/${id}/toggle`,

            method: "PATCH",
          }),

          invalidatesTags: (
            _result,
            _error,
            id
          ) => [
            "PickupStations",
            {
              type:
                "PickupStation",

              id,
            },
          ],
        }),

      //////////////////////////////////////////////////////
      // DELETE
      //////////////////////////////////////////////////////

      deletePickupStation:
        builder.mutation<
          {
            message: string;
          },
          string
        >({
          query: (id) => ({
            url: `/api/pickup-stations/${id}`,

            method: "DELETE",
          }),

          invalidatesTags: [
            "PickupStations",
          ],
        }),

      //////////////////////////////////////////////////////
      // VALIDATE DELIVERY
      //////////////////////////////////////////////////////

      validateDelivery:
        builder.mutation<
          {
            valid: boolean;

            message?: string;
          },
          ShipmentDeliveryDTO
        >({
          query: (data) => ({
            url: "/api/pickup-stations/validate-delivery",

            method: "POST",

            data,
          }),
        }),
    }),
  });

//////////////////////////////////////////////////////////
// EXPORT HOOKS
//////////////////////////////////////////////////////////

export const {
  useCreatePickupStationMutation,

  useGetPickupStationsQuery,

  useGetActivePickupStationsQuery,

  useGetPickupStationByIdQuery,

  useUpdatePickupStationMutation,

  useTogglePickupStationMutation,

  useDeletePickupStationMutation,

  useValidateDeliveryMutation,
} = pickupStationApi;