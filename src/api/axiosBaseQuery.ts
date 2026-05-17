import type {
  BaseQueryFn,
} from "@reduxjs/toolkit/query";

import type {
  AxiosError,
  AxiosRequestConfig,
} from "axios";

import { api } from "./axios";

type AxiosBaseQueryArgs = {
  url: string;

  method?: AxiosRequestConfig["method"];

  data?: AxiosRequestConfig["data"];

  params?: AxiosRequestConfig["params"];
};

type AxiosBaseQueryError = {
  status?: number;

  data?: unknown;
};

export const axiosBaseQuery =
  (): BaseQueryFn<
    AxiosBaseQueryArgs,
    unknown,
    AxiosBaseQueryError
  > =>
  async ({
    url,
    method,
    data,
    params,
  }) => {
    try {
      const result = await api({
        url,
        method,
        data,
        params,
      });

      return {
        data: result.data,
      };
    } catch (axiosError) {
      const err =
        axiosError as AxiosError;

      return {
        error: {
          status:
            err.response?.status,

          data:
            err.response?.data ||
            err.message,
        },
      };
    }
  };