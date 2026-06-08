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

export const axiosBaseQuery =
  (): BaseQueryFn<
    AxiosBaseQueryArgs,
    unknown,
    {
      status?: number;
      data?: unknown;
    }
  > =>
  async ({
    url,
    method,
    data,
    params,
  }) => {
    try {
      const result =
        await api({
          url,
          method,
          data,
          params,
        });

      return {
        data:
          result.data,
      };
    } catch (error) {
      const err =
        error as AxiosError;

      return {
        error: {
          status:
            err.response?.status ??
            500,

          data:
            err.response?.data ??
            err.message,
        },
      };
    }
  };