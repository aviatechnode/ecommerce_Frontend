import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "../api/axiosBaseQuery";

export const fitmentApi = createApi({
  reducerPath: "fitmentApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: [
    "FitmentConfig",
    "FitmentRule",
    "ProductFitment",
    "FitmentIndex",
    "FitmentLog",
  ],

  endpoints: (builder) => ({
    // CONFIGS
    getConfigs: builder.query<
      any[],
      void
    >({
      query: () => ({
        url: "/api/fitments/configs",
        method: "GET",
      }),

      providesTags: ["FitmentConfig"],
    }),

    createConfig: builder.mutation<
      any,
      any
    >({
      query: (data) => ({
        url: "/api/fitments/configs",
        method: "POST",
        data,
      }),

      invalidatesTags: [
        "FitmentConfig",
      ],
    }),

    updateConfig: builder.mutation<
      any,
      {
        id: string;
        data: any;
      }
    >({
      query: ({
        id,
        data,
      }) => ({
        url: `/api/fitments/configs/${id}`,
        method: "PUT",
        data,
      }),

      invalidatesTags: [
        "FitmentConfig",
      ],
    }),

    deleteConfig: builder.mutation<
      void,
      string
    >({
      query: (id) => ({
        url: `/api/fitments/configs/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: [
        "FitmentConfig",
      ],
    }),
    // RULES
    getRules: builder.query<
      any[],
      void
    >({
      query: () => ({
        url: "/api/fitments/rules",
      }),

      providesTags: [
        "FitmentRule",
      ],
    }),

    createRule: builder.mutation<
      any,
      any
    >({
      query: (data) => ({
        url: "/api/fitments/rules",
        method: "POST",
        data,
      }),

      invalidatesTags: [
        "FitmentRule",
      ],
    }),

    updateRule: builder.mutation<
      any,
      {
        id: string;
        data: any;
      }
    >({
      query: ({
        id,
        data,
      }) => ({
        url: `/api/fitments/rules/${id}`,
        method: "PUT",
        data,
      }),

      invalidatesTags: [
        "FitmentRule",
      ],
    }),

    deleteRule: builder.mutation<
      void,
      string
    >({
      query: (id) => ({
        url: `/api/fitments/rules/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: [
        "FitmentRule",
      ],
    }),
    // PRODUCT FITMENTS
    getProductFitments:
      builder.query<
        any[],
        string
      >({
        query: (
          productId
        ) => ({
          url: `/api/fitments/product/${productId}`,
        }),

        providesTags: (
          _,
          __,
          productId
        ) => [
          {
            type:
              "ProductFitment",
            id: productId,
          },
        ],
      }),

    createProductFitment:
      builder.mutation<
        any,
        any
      >({
        query: (data) => ({
          url: "/api/fitments",
          method: "POST",
          data,
        }),

        invalidatesTags: [
          "ProductFitment",
        ],
      }),

    updateProductFitment:
      builder.mutation<
        any,
        {
          id: string;
          data: any;
        }
      >({
        query: ({
          id,
          data,
        }) => ({
          url: `/api/fitments/${id}`,
          method: "PUT",
          data,
        }),

        invalidatesTags: [
          "ProductFitment",
        ],
      }),

    deleteProductFitment:
      builder.mutation<
        void,
        string
      >({
        query: (id) => ({
          url: `/api/fitments/${id}`,
          method: "DELETE",
        }),

        invalidatesTags: [
          "ProductFitment",
        ],
      }),
    // INDEX
    getProductIndex:
      builder.query<
        any[],
        string
      >({
        query: (
          productId
        ) => ({
          url: `/api/fitments/product/${productId}/index`,
        }),

        providesTags: (
          _,
          __,
          productId
        ) => [
          {
            type:
              "FitmentIndex",
            id: productId,
          },
        ],
      }),
    // LOGS
    getLogs: builder.query<
      any[],
      string | undefined
    >({
      query: (
        productId
      ) => ({
        url:
          "/api/fitments/logs",

        params:
          productId
            ? {
                productId,
              }
            : undefined,
      }),

      providesTags: [
        "FitmentLog",
      ],
    }),
  }),
});

export const {
  // CONFIGS
  useGetConfigsQuery,
  useCreateConfigMutation,
  useUpdateConfigMutation,
  useDeleteConfigMutation,
  // RULES
  useGetRulesQuery,
  useCreateRuleMutation,
  useUpdateRuleMutation,
  useDeleteRuleMutation,
  // PRODUCT FITMENTS
  useGetProductFitmentsQuery,
  useCreateProductFitmentMutation,
  useUpdateProductFitmentMutation,
  useDeleteProductFitmentMutation,
  // INDEX
  useGetProductIndexQuery,
  // LOGS
  useGetLogsQuery,
} = fitmentApi;