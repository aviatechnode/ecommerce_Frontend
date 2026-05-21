import { createApi } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { api } from "../api/axios";

type ApiError = {
  status?: number;
  data?: unknown;
};

export type StateOption = {
  id: string;
  name: string;
};

export type LgaOption = {
  id: string;
  name: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
    },
    unknown,
    ApiError
  > =>
  async ({ url, method = "GET", data, params }) => {
    try {
      const result = await api({
        url,
        method,
        data,
        params,
      });

      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;

      return {
        error: {
          status: err.response?.status,
          data: err.response?.data,
        },
      };
    }
  };

export const locationApi = createApi({
  reducerPath: "locationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Location"],
  endpoints: (builder) => ({
    getStates: builder.query<StateOption[], void>({
      query: () => ({
        url: "/api/locations/states",
      }),
      transformResponse: (response: ApiResponse<StateOption[]>) =>
        response.data,
      providesTags: ["Location"],
    }),

    getLgasByState: builder.query<LgaOption[], string>({
      query: (stateId) => ({
        url: `/api/locations/states/${stateId}/lgas`,
      }),
      transformResponse: (response: ApiResponse<LgaOption[]>) =>
        response.data,
      providesTags: ["Location"],
    }),
  }),
});

export const {
  useGetStatesQuery,
  useGetLgasByStateQuery,
} = locationApi;