import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../api/axiosBaseQuery";
import type { FitmentLevel, ProductFitment, VehicleEngine, VehicleGeneration, VehicleMake, VehicleModel, VehicleTrim } from "../types/fitment.types";


export const fitmentApi = createApi({
  reducerPath: "fitmentApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: [
    "VehicleTree",
    "Fitment",
    "Products",
  ],

  endpoints: (builder) => ({
    // VEHICLE MAKES
    createMake: builder.mutation<
      VehicleMake,
      {
        name: string;

        slug?: string;

        isActive?: boolean;
      }
    >({
      query: (data) => ({
        url: "/api/fitments/makes",

        method: "POST",

        data,
      }),

      invalidatesTags: ["VehicleTree"],
    }),

    // VEHICLE MODELS
    createModel: builder.mutation<
      VehicleModel,
      {
        makeId: string;

        name: string;

        slug?: string;

        isActive?: boolean;
      }
    >({
      query: (data) => ({
        url: "/api/fitments/models",

        method: "POST",

        data,
      }),

      invalidatesTags: ["VehicleTree"],
    }),

    //////////////////////////////////////////////////////
    // VEHICLE GENERATIONS
    //////////////////////////////////////////////////////

    createGeneration: builder.mutation<
      VehicleGeneration,
      {
        modelId: string;

        name: string;

        slug?: string;

        chassisCode?: string;

        yearStart: number;

        yearEnd?: number;

        isActive?: boolean;
      }
    >({
      query: (data) => ({
        url: "/api/fitments/generations",

        method: "POST",

        data,
      }),

      invalidatesTags: ["VehicleTree"],
    }),

    //////////////////////////////////////////////////////
    // VEHICLE ENGINES
    //////////////////////////////////////////////////////

    createEngine: builder.mutation<
      VehicleEngine,
      {
        generationId: string;

        engineCode: string;

        engineName?: string;

        fuelType?: string;

        aspiration?: string;

        cylinders?: number;

        horsepower?: number;

        displacementCc?: number;

        displacementLabel?: string;

        drivetrain?: string;

        transmissionType?: string;

        isActive?: boolean;
      }
    >({
      query: (data) => ({
        url: "/api/fitments/engines",

        method: "POST",

        data,
      }),

      invalidatesTags: ["VehicleTree"],
    }),

    //////////////////////////////////////////////////////
    // VEHICLE TRIMS
    //////////////////////////////////////////////////////

    createTrim: builder.mutation<
      VehicleTrim,
      {
        engineId: string;

        name: string;

        bodyType?: string;

        doors?: number;

        isActive?: boolean;
      }
    >({
      query: (data) => ({
        url: "/api/fitments/trims",

        method: "POST",

        data,
      }),

      invalidatesTags: ["VehicleTree"],
    }),

    // ASSIGN SINGLE PRODUCT FITMENT
    assignProductFitment: builder.mutation<
      ProductFitment,
      {
        productId: string;

        level: FitmentLevel;

        makeId?: string;

        modelId?: string;

        generationId?: string;

        engineId?: string;

        trimId?: string;

        yearStart?: number;

        yearEnd?: number;

        notes?: string;

        position?: string;

        quantityRequired?: number;

        isUniversal?: boolean;
      }
    >({
      query: (data) => ({
        url: "/api/fitments/products/assign",

        method: "POST",

        data,
      }),

      invalidatesTags: [
        "Fitment",
        "Products",
      ],
    }),

    // BULK ASSIGN PRODUCT FITMENTS
    bulkAssignProductFitment:
      builder.mutation<
        {
          message: string;
        },
        {
          productId: string;

          trimIds: string[];

          notes?: string;

          position?: string;

          quantityRequired?: number;
        }
      >({
        query: (data) => ({
          url: "/api/fitments/products/bulk-assign",

          method: "POST",

          data,
        }),

        invalidatesTags: [
          "Fitment",
          "Products",
        ],
      }),

    // GET PRODUCTS BY FITMENT
    getProductsByFitment: builder.query<
      any[],
      {
        makeId?: string;

        modelId?: string;

        generationId?: string;

        engineId?: string;

        trimId?: string;

        year?: number;
      }
    >({
      query: (params) => ({
        url: "/api/fitments/products",

        method: "GET",

        params,
      }),

      providesTags: ["Products"],
    }),

    // GET VEHICLE TREE
    getVehicleTree: builder.query<
      VehicleMake[],
      void
    >({
      query: () => ({
        url: "/api/fitments/tree",

        method: "GET",
      }),

      providesTags: ["VehicleTree"],
    }),
  }),
});

// EXPORT HOOKS
export const {
  useCreateMakeMutation,

  useCreateModelMutation,

  useCreateGenerationMutation,

  useCreateEngineMutation,

  useCreateTrimMutation,

  useAssignProductFitmentMutation,

  useBulkAssignProductFitmentMutation,

  useGetProductsByFitmentQuery,

  useGetVehicleTreeQuery,
} = fitmentApi;