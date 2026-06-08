import { createApi } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";

import { axiosBaseQuery } from "../api/axiosBaseQuery";

///////////////////////////////////////////////////////////
// TYPES
///////////////////////////////////////////////////////////

export interface User {
  id: string;
  email: string;
  name: string;
  roleName: string;
  permissions: string[];
}

export interface AuthResponse {
  accessToken: string;
  csrfToken: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  name: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

///////////////////////////////////////////////////////////
// API
///////////////////////////////////////////////////////////

export const authApi = createApi({
  reducerPath: "authApi",

  baseQuery: axiosBaseQuery() as BaseQueryFn,

  tagTypes: ["Auth"],

  endpoints: (builder) => ({
    ///////////////////////////////////////////////////////
    // SIGNUP
    ///////////////////////////////////////////////////////

    signup: builder.mutation<AuthResponse, SignupPayload>({
      query: (body) => ({
        url: "/api/auth/signup",
        method: "POST",
        data: body,
      }),

      invalidatesTags: ["Auth"],
    }),

    ///////////////////////////////////////////////////////
    // SIGNIN
    ///////////////////////////////////////////////////////

    signin: builder.mutation<AuthResponse, LoginPayload>({
      query: (body) => ({
        url: "/api/auth/signin",
        method: "POST",
        data: body,
      }),

      invalidatesTags: ["Auth"],
    }),

    ///////////////////////////////////////////////////////
    // REFRESH TOKEN
    ///////////////////////////////////////////////////////

    refresh: builder.mutation<
      { accessToken: string; csrfToken: string },
      void
    >({
      query: () => ({
        url: "/api/auth/refresh",
        method: "POST",
      }),
    }),

    ///////////////////////////////////////////////////////
    // LOGOUT
    ///////////////////////////////////////////////////////

    signout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/api/auth/signout",
        method: "POST",
      }),

      invalidatesTags: ["Auth"],
    }),

    ///////////////////////////////////////////////////////
    // CURRENT USER
    ///////////////////////////////////////////////////////

    me: builder.query<{ user: User }, void>({
      query: () => ({
        url: "/api/auth/me",
        method: "GET",
      }),

      providesTags: ["Auth"],
    }),

    ///////////////////////////////////////////////////////
    // EMAIL VERIFY
    ///////////////////////////////////////////////////////

    verifyEmail: builder.query<{ message: string }, string>({
      query: (token) => ({
        url: `/api/auth/verify-email/${token}`,
        method: "GET",
      }),
    }),
    ///////////////////////////////////////////////////////
    // FORGOT PASSWORD
    ///////////////////////////////////////////////////////

    forgotPassword: builder.mutation<
      { message: string },
      ForgotPasswordPayload
    >({
      query: (body) => ({
        url: "/api/auth/forgot-password",
        method: "POST",
        data: body,
      }),
    }),

    ///////////////////////////////////////////////////////
    // RESET PASSWORD
    ///////////////////////////////////////////////////////

    resetPassword: builder.mutation<
      { message: string },
      ResetPasswordPayload
    >({
      query: (body) => ({
        url: "/api/auth/reset-password",
        method: "POST",
        data: body,
      }),
    }),

    ///////////////////////////////////////////////////////
    // GOOGLE LOGIN URL
    ///////////////////////////////////////////////////////

    googleLogin: builder.query<string, void>({
      queryFn() {
        return {
          data: `${import.meta.env.VITE_API_URL}/api/auth/google`,
        };
      },
    }),
  }),
});

///////////////////////////////////////////////////////////
// EXPORT HOOKS
///////////////////////////////////////////////////////////

export const {
  useSignupMutation,
  useSigninMutation,
  useRefreshMutation,
  useSignoutMutation,
  useMeQuery,
  useLazyMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailQuery,
  useGoogleLoginQuery,
} = authApi;