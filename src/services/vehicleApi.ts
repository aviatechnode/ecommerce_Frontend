import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../api/axiosBaseQuery";

import type {
  VehicleMake,
  VehicleModel,
  VehicleGeneration,
  VehicleEngine,
  VehicleTrim,
  PaginatedResponse,
  CreateVehicleMakeDto,
  UpdateVehicleMakeDto,
  CreateVehicleModelDto,
  UpdateVehicleModelDto,
  CreateVehicleGenerationDto,
  UpdateVehicleGenerationDto,
  CreateVehicleEngineDto,
  UpdateVehicleEngineDto,
  CreateVehicleTrimDto,
  UpdateVehicleTrimDto,
} from "../types/vehicle-types";

export const vehicleApi = createApi({
  reducerPath: "vehicleApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    "VehicleMake",
    "VehicleModel",
    "VehicleGeneration",
    "VehicleEngine",
    "VehicleTrim",
  ],
  endpoints: (builder) => ({
    // ///////////////
    // VEHICLE MAKE
    // ///////////////
    getMakes: builder.query<PaginatedResponse<VehicleMake>, Record<string, unknown>>({
      query: (params) => ({
        url: "/vehicles/makes",
        method: "GET",
        params,
      }),
      providesTags: ["VehicleMake"],
    }),

    getMakeById: builder.query<VehicleMake, string>({
      query: (id) => ({
        url: `/vehicles/makes/${id}`,
        method: "GET",
      }),
      providesTags: ["VehicleMake"],
    }),

    createMake: builder.mutation<VehicleMake, CreateVehicleMakeDto>({
      query: (data) => ({
        url: "/vehicles/makes",
        method: "POST",
        data,
      }),
      invalidatesTags: ["VehicleMake"],
    }),

    updateMake: builder.mutation<VehicleMake, { id: string; data: UpdateVehicleMakeDto }>({
      query: ({ id, data }) => ({
        url: `/vehicles/makes/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["VehicleMake"],
    }),

    deleteMake: builder.mutation<VehicleMake, string>({
      query: (id) => ({
        url: `/vehicles/makes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["VehicleMake"],
    }),

    // ///////////////
    // VEHICLE MODEL
    // ///////////////
    getModels: builder.query<PaginatedResponse<VehicleModel>, Record<string, unknown>>({
      query: (params) => ({
        url: "/vehicles/models",
        method: "GET",
        params,
      }),
      providesTags: ["VehicleModel"],
    }),

    getModelById: builder.query<VehicleModel, string>({
      query: (id) => ({
        url: `/vehicles/models/${id}`,
        method: "GET",
      }),
      providesTags: ["VehicleModel"],
    }),

    createModel: builder.mutation<VehicleModel, CreateVehicleModelDto>({
      query: (data) => ({
        url: "/vehicles/models",
        method: "POST",
        data,
      }),
      invalidatesTags: ["VehicleModel"],
    }),

    updateModel: builder.mutation<VehicleModel, { id: string; data: UpdateVehicleModelDto }>({
      query: ({ id, data }) => ({
        url: `/vehicles/models/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["VehicleModel"],
    }),

    deleteModel: builder.mutation<VehicleModel, string>({
      query: (id) => ({
        url: `/vehicles/models/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["VehicleModel"],
    }),

    // ///////////////
    // VEHICLE GENERATION
    // ///////////////
    getGenerations: builder.query<PaginatedResponse<VehicleGeneration>, Record<string, unknown>>({
      query: (params) => ({
        url: "/vehicles/generations",
        method: "GET",
        params,
      }),
      providesTags: ["VehicleGeneration"],
    }),

    getGenerationById: builder.query<VehicleGeneration, string>({
      query: (id) => ({
        url: `/vehicles/generations/${id}`,
        method: "GET",
      }),
      providesTags: ["VehicleGeneration"],
    }),

    createGeneration: builder.mutation<VehicleGeneration, CreateVehicleGenerationDto>({
      query: (data) => ({
        url: "/vehicles/generations",
        method: "POST",
        data,
      }),
      invalidatesTags: ["VehicleGeneration"],
    }),

    updateGeneration: builder.mutation<
      VehicleGeneration,
      { id: string; data: UpdateVehicleGenerationDto }
    >({
      query: ({ id, data }) => ({
        url: `/vehicles/generations/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["VehicleGeneration"],
    }),

    deleteGeneration: builder.mutation<VehicleGeneration, string>({
      query: (id) => ({
        url: `/vehicles/generations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["VehicleGeneration"],
    }),

    // ///////////////
    // VEHICLE ENGINE
    // ///////////////
    getEngines: builder.query<PaginatedResponse<VehicleEngine>, Record<string, unknown>>({
      query: (params) => ({
        url: "/vehicles/engines",
        method: "GET",
        params,
      }),
      providesTags: ["VehicleEngine"],
    }),

    getEngineById: builder.query<VehicleEngine, string>({
      query: (id) => ({
        url: `/vehicles/engines/${id}`,
        method: "GET",
      }),
      providesTags: ["VehicleEngine"],
    }),

    createEngine: builder.mutation<VehicleEngine, CreateVehicleEngineDto>({
      query: (data) => ({
        url: "/vehicles/engines",
        method: "POST",
        data,
      }),
      invalidatesTags: ["VehicleEngine"],
    }),

    updateEngine: builder.mutation<VehicleEngine, { id: string; data: UpdateVehicleEngineDto }>({
      query: ({ id, data }) => ({
        url: `/vehicles/engines/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["VehicleEngine"],
    }),

    deleteEngine: builder.mutation<VehicleEngine, string>({
      query: (id) => ({
        url: `/vehicles/engines/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["VehicleEngine"],
    }),

    // ///////////////
    // VEHICLE TRIM
    // ///////////////
    getTrims: builder.query<PaginatedResponse<VehicleTrim>, Record<string, unknown>>({
      query: (params) => ({
        url: "/vehicles/trims",
        method: "GET",
        params,
      }),
      providesTags: ["VehicleTrim"],
    }),

    getTrimById: builder.query<VehicleTrim, string>({
      query: (id) => ({
        url: `/vehicles/trims/${id}`,
        method: "GET",
      }),
      providesTags: ["VehicleTrim"],
    }),

    createTrim: builder.mutation<VehicleTrim, CreateVehicleTrimDto>({
      query: (data) => ({
        url: "/vehicles/trims",
        method: "POST",
        data,
      }),
      invalidatesTags: ["VehicleTrim"],
    }),

    updateTrim: builder.mutation<VehicleTrim, { id: string; data: UpdateVehicleTrimDto }>({
      query: ({ id, data }) => ({
        url: `/vehicles/trims/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["VehicleTrim"],
    }),

    deleteTrim: builder.mutation<VehicleTrim, string>({
      query: (id) => ({
        url: `/vehicles/trims/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["VehicleTrim"],
    }),
  }),
});

export const {
  // Vehicle Make
  useGetMakesQuery,
  useGetMakeByIdQuery,
  useCreateMakeMutation,
  useUpdateMakeMutation,
  useDeleteMakeMutation,

  // Vehicle Model
  useGetModelsQuery,
  useGetModelByIdQuery,
  useCreateModelMutation,
  useUpdateModelMutation,
  useDeleteModelMutation,

  // Vehicle Generation
  useGetGenerationsQuery,
  useGetGenerationByIdQuery,
  useCreateGenerationMutation,
  useUpdateGenerationMutation,
  useDeleteGenerationMutation,

  // Vehicle Engine
  useGetEnginesQuery,
  useGetEngineByIdQuery,
  useCreateEngineMutation,
  useUpdateEngineMutation,
  useDeleteEngineMutation,

  // Vehicle Trim
  useGetTrimsQuery,
  useGetTrimByIdQuery,
  useCreateTrimMutation,
  useUpdateTrimMutation,
  useDeleteTrimMutation,
} = vehicleApi;