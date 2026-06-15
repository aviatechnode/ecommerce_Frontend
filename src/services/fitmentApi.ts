import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../api/axiosBaseQuery";

import type {
  FitmentServiceConfig,
  UpdateFitmentServiceConfigDto,

  FitmentTypeRule,
  CreateFitmentTypeRuleDto,
  UpdateFitmentTypeRuleDto,

  OEMReference,
  CreateOEMReferenceDto,
  UpdateOEMReferenceDto,

  CrossReference,
  CreateCrossReferenceDto,
  UpdateCrossReferenceDto,

  ProductFitment,
  CreateProductFitmentDto,
  UpdateProductFitmentDto,
  PaginatedResponse,

  FitmentResolutionQuery,
  FitmentResolutionResult,

  FitmentResolutionLog,
} from "../types/fitment.types";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export const fitmentApi = createApi({
  reducerPath: "fitmentApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    "FitmentConfig",
    "FitmentRule",
    "OEMReference",
    "CrossReference",
    "ProductFitment",
    "FitmentLog",
  ],

  endpoints: (builder) => ({
    // ======================
    // CONFIG
    // ======================

    getConfig: builder.query<FitmentServiceConfig, void>({
      query: () => ({
        url: "/api/fitments/config",
        method: "GET",
      }),
      transformResponse: (
        response: ApiResponse<FitmentServiceConfig>
      ) => response.data,
      providesTags: ["FitmentConfig"],
    }),

    updateConfig: builder.mutation<
      FitmentServiceConfig,
      UpdateFitmentServiceConfigDto
    >({
      query: (data) => ({
        url: "/api/fitments/config",
        method: "PATCH",
        data,
      }),
      transformResponse: (
        response: ApiResponse<FitmentServiceConfig>
      ) => response.data,
      invalidatesTags: ["FitmentConfig"],
    }),

    // ======================
    // FITMENT RULES
    // ======================

    getRules: builder.query<FitmentTypeRule[], void>({
      query: () => ({
        url: "/api/fitments/rules",
        method: "GET",
      }),
      transformResponse: (
        response: ApiResponse<FitmentTypeRule[]>
      ) => response.data,
      providesTags: ["FitmentRule"],
    }),

    createRule: builder.mutation<
      FitmentTypeRule,
      CreateFitmentTypeRuleDto
    >({
      query: (data) => ({
        url: "/api/fitments/rules",
        method: "POST",
        data,
      }),
      transformResponse: (
        response: ApiResponse<FitmentTypeRule>
      ) => response.data,
      invalidatesTags: ["FitmentRule"],
    }),

    updateRule: builder.mutation<
      FitmentTypeRule,
      { id: string; data: UpdateFitmentTypeRuleDto }
    >({
      query: ({ id, data }) => ({
        url: `/api/fitments/rules/${id}`,
        method: "PATCH",
        data,
      }),
      transformResponse: (
        response: ApiResponse<FitmentTypeRule>
      ) => response.data,
      invalidatesTags: ["FitmentRule"],
    }),

    deleteRule: builder.mutation<FitmentTypeRule, string>({
      query: (id) => ({
        url: `/api/fitments/rules/${id}`,
        method: "DELETE",
      }),
      transformResponse: (
        response: ApiResponse<FitmentTypeRule>
      ) => response.data,
      invalidatesTags: ["FitmentRule"],
    }),

    // ======================
    // OEM REFERENCES
    // ======================

    getOEMReferences: builder.query<OEMReference[], void>({
      query: () => ({
        url: "/api/fitments/oem-references",
        method: "GET",
      }),
      transformResponse: (
        response: ApiResponse<OEMReference[]>
      ) => response.data,
      providesTags: ["OEMReference"],
    }),

    createOEMReference: builder.mutation<
      OEMReference,
      CreateOEMReferenceDto
    >({
      query: (data) => ({
        url: "/api/fitments/oem-references",
        method: "POST",
        data,
      }),
      transformResponse: (
        response: ApiResponse<OEMReference>
      ) => response.data,
      invalidatesTags: ["OEMReference"],
    }),

    updateOEMReference: builder.mutation<
      OEMReference,
      { id: string; data: UpdateOEMReferenceDto }
    >({
      query: ({ id, data }) => ({
        url: `/api/fitments/oem-references/${id}`,
        method: "PATCH",
        data,
      }),
      transformResponse: (
        response: ApiResponse<OEMReference>
      ) => response.data,
      invalidatesTags: ["OEMReference"],
    }),

    deleteOEMReference: builder.mutation<OEMReference, string>({
      query: (id) => ({
        url: `/api/fitments/oem-references/${id}`,
        method: "DELETE",
      }),
      transformResponse: (
        response: ApiResponse<OEMReference>
      ) => response.data,
      invalidatesTags: ["OEMReference"],
    }),

    // ======================
    // CROSS REFERENCES
    // ======================

    getCrossReferences: builder.query<CrossReference[], void>({
      query: () => ({
        url: "/api/fitments/cross-references",
        method: "GET",
      }),
      transformResponse: (
        response: ApiResponse<CrossReference[]>
      ) => response.data,
      providesTags: ["CrossReference"],
    }),

    createCrossReference: builder.mutation<
      CrossReference,
      CreateCrossReferenceDto
    >({
      query: (data) => ({
        url: "/api/fitments/cross-references",
        method: "POST",
        data,
      }),
      transformResponse: (
        response: ApiResponse<CrossReference>
      ) => response.data,
      invalidatesTags: ["CrossReference"],
    }),

    updateCrossReference: builder.mutation<
      CrossReference,
      { id: string; data: UpdateCrossReferenceDto }
    >({
      query: ({ id, data }) => ({
        url: `/api/fitments/cross-references/${id}`,
        method: "PATCH",
        data,
      }),
      transformResponse: (
        response: ApiResponse<CrossReference>
      ) => response.data,
      invalidatesTags: ["CrossReference"],
    }),

    deleteCrossReference: builder.mutation<CrossReference, string>({
      query: (id) => ({
        url: `/api/fitments/cross-references/${id}`,
        method: "DELETE",
      }),
      transformResponse: (
        response: ApiResponse<CrossReference>
      ) => response.data,
      invalidatesTags: ["CrossReference"],
    }),

    // ======================
    // PRODUCT FITMENTS
    // ======================

    getFitments: builder.query<
      PaginatedResponse<ProductFitment>,
      Record<string, unknown>
    >({
      query: (params) => ({
        url: "/api/fitments/fitments",
        method: "GET",
        params,
      }),
      providesTags: ["ProductFitment"],
    }),

    createFitment: builder.mutation<
      ProductFitment,
      CreateProductFitmentDto
    >({
      query: (data) => ({
        url: "/api/fitments/fitments",
        method: "POST",
        data,
      }),
      transformResponse: (
        response: ApiResponse<ProductFitment>
      ) => response.data,
      invalidatesTags: ["ProductFitment"],
    }),

    updateFitment: builder.mutation<
      ProductFitment,
      { id: string; data: UpdateProductFitmentDto }
    >({
      query: ({ id, data }) => ({
        url: `/api/fitments/fitments/${id}`,
        method: "PATCH",
        data,
      }),
      transformResponse: (
        response: ApiResponse<ProductFitment>
      ) => response.data,
      invalidatesTags: ["ProductFitment"],
    }),

    deleteFitment: builder.mutation<ProductFitment, string>({
      query: (id) => ({
        url: `/api/fitments/fitments/${id}`,
        method: "DELETE",
      }),
      transformResponse: (
        response: ApiResponse<ProductFitment>
      ) => response.data,
      invalidatesTags: ["ProductFitment"],
    }),

    // ======================
    // FITMENT RESOLUTION
    // ======================

    resolveFitment: builder.mutation<
      FitmentResolutionResult,
      FitmentResolutionQuery
    >({
      query: (data) => ({
        url: "/api/fitments/resolve",
        method: "POST",
        data,
      }),
      transformResponse: (
        response: ApiResponse<FitmentResolutionResult>
      ) => response.data,
    }),

    // ======================
    // INDEX
    // ======================

    rebuildIndex: builder.mutation<void, void>({
      query: () => ({
        url: "/api/fitments/rebuild-index",
        method: "POST",
      }),
    }),

    // ======================
    // LOGS
    // ======================

    getLogs: builder.query<
      FitmentResolutionLog[],
      { productId?: string }
    >({
      query: (params) => ({
        url: "/api/fitments/logs",
        method: "GET",
        params,
      }),
      transformResponse: (
        response: ApiResponse<FitmentResolutionLog[]>
      ) => response.data,
      providesTags: ["FitmentLog"],
    }),
  }),
});

export const {
  useGetConfigQuery,
  useUpdateConfigMutation,

  useGetRulesQuery,
  useCreateRuleMutation,
  useUpdateRuleMutation,
  useDeleteRuleMutation,

  useGetOEMReferencesQuery,
  useCreateOEMReferenceMutation,
  useUpdateOEMReferenceMutation,
  useDeleteOEMReferenceMutation,

  useGetCrossReferencesQuery,
  useCreateCrossReferenceMutation,
  useUpdateCrossReferenceMutation,
  useDeleteCrossReferenceMutation,

  useGetFitmentsQuery,
  useCreateFitmentMutation,
  useUpdateFitmentMutation,
  useDeleteFitmentMutation,

  useResolveFitmentMutation,

  useRebuildIndexMutation,

  useGetLogsQuery,
} = fitmentApi;