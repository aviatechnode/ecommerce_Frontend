import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCsrfToken, getCsrfToken } from "../lib/csrf";

/* ================= USER ================= */

export interface User {
  id: string;
  email: string;
  name: string;
  roleName: string;
  permissions: string[];
  isSuperAdmin: boolean;
}

/* ================= BASE QUERY ================= */

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",

  prepareHeaders: (headers) => {
    const csrf = getCsrfToken();

    if (csrf) {
      headers.set("x-csrf-token", csrf);
    }

    return headers;
  },
});

/* ================= SAFE BASE QUERY (handles refresh) ================= */

const baseQueryWithReauth: typeof baseQuery = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // 🔥 if unauthorized → try refresh once
  if (result.error?.status === 401) {
    const refresh = await baseQuery(
      { url: "/api/auth/refresh", method: "POST" },
      api,
      extraOptions
    );

    if (refresh.data && (refresh.data as any).csrfToken) {
      setCsrfToken((refresh.data as any).csrfToken);
    }

    // retry original request
    result = await baseQuery(args, api, extraOptions);
  }

  return result;
};

/* ================= API ================= */

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth"],

  endpoints: (builder) => ({
    /* ================= ME ================= */
    me: builder.query<User, void>({
      query: () => "/api/auth/me",
      transformResponse: (res: any): User => ({
        ...res.user,
        isSuperAdmin: res.user.roleName === "SUPER_ADMIN",
      }),
      providesTags: ["Auth"],
    }),

    /* ================= SIGNIN ================= */
    signin: builder.mutation<
      User,
      { email: string; password: string }
    >({
      query: (body) => ({
        url: "/api/auth/signin",
        method: "POST",
        body,
      }),

      async onQueryStarted(_, { queryFulfilled }) {
        const { data } = await queryFulfilled;

        setCsrfToken((data as any).csrfToken);
      },

      invalidatesTags: ["Auth"],
    }),

    /* ================= SIGNUP ================= */
    signup: builder.mutation<
      User,
      { name: string; email: string; password: string }
    >({
      query: (body) => ({
        url: "/api/auth/signup",
        method: "POST",
        body,
      }),

      async onQueryStarted(_, { queryFulfilled }) {
        const { data } = await queryFulfilled;

        setCsrfToken((data as any).csrfToken);
      },

      invalidatesTags: ["Auth"],
    }),

    /* ================= GOOGLE ================= */
    google: builder.mutation<User, { token: string }>({
      query: (body) => ({
        url: "/api/auth/google",
        method: "POST",
        body,
      }),

      async onQueryStarted(_, { queryFulfilled }) {
        const { data } = await queryFulfilled;

        if ((data as any).csrfToken) {
          setCsrfToken((data as any).csrfToken);
        }
      },

      invalidatesTags: ["Auth"],
    }),

    /* ================= SIGNOUT ================= */
    signout: builder.mutation<void, void>({
      query: () => ({
        url: "/api/auth/signout",
        method: "POST",
      }),

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          setCsrfToken(null);
          localStorage.removeItem("accessToken");

          dispatch(authApi.util.resetApiState());
        }
      },
    }),
  }),
});

/* ================= EXPORT HOOKS ================= */

export const {
  useMeQuery,
  useSigninMutation,
  useSignupMutation,
  useGoogleMutation,
  useSignoutMutation,
} = authApi;