import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "../api/axiosBaseQuery";

import type {
  CreateProductInput,
} from "../schemas/product.schema";

/* =========================================================
PRODUCT TYPE
========================================================= */

export type Product = CreateProductInput & {
  id: string;

  slug: string;

  createdAt: string;
  updatedAt: string;

  viewCount: number;
  soldCount: number;
};

/* =========================================================
UPDATE PAYLOAD
========================================================= */

export interface UpdateProductPayload {
  id: string;

  data: Partial<CreateProductInput>;
}

/* =========================================================
API RESPONSES
========================================================= */

export interface ProductsResponse {
  success?: boolean;

  message?: string;

  products: Product[];
}

export interface ProductResponse {
  success?: boolean;

  message?: string;

  product: Product;
}

export interface DeleteProductResponse {
  success?: boolean;

  message?: string;
}

/* =========================================================
API
========================================================= */

export const productApi = createApi({
  reducerPath: "productApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["Products", "Product"],

  endpoints: (builder) => ({
    /* =====================================================
    GET PRODUCTS
    ===================================================== */

    getProducts: builder.query<Product[], void>({
      query: () => ({
        url: "/api/products",

        method: "GET",
      }),

      transformResponse: (
        response: ProductsResponse
      ) => response.products ?? [],

      providesTags: (result) =>
        result
          ? [
              ...result.map((product) => ({
                type: "Product" as const,

                id: product.id,
              })),

              {
                type: "Products" as const,

                id: "LIST",
              },
            ]
          : [
              {
                type: "Products" as const,

                id: "LIST",
              },
            ],
    }),

    /* =====================================================
    GET PRODUCT
    ===================================================== */

    getProduct: builder.query<Product, string>({
      query: (id) => ({
        url: `/api/products/${id}`,

        method: "GET",
      }),

      transformResponse: (
        response: ProductResponse
      ) => response.product,

      providesTags: (_, __, id) => [
        {
          type: "Product",

          id,
        },
      ],
    }),

    /* =====================================================
    CREATE PRODUCT
    ===================================================== */

    createProduct: builder.mutation<
      Product,
      CreateProductInput
    >({
      query: (data) => ({
        url: "/api/products",

        method: "POST",

        data,
      }),

      transformResponse: (
        response: ProductResponse
      ) => response.product,

      async onQueryStarted(
        _,
        { dispatch, queryFulfilled }
      ) {
        try {
          const { data: created } =
            await queryFulfilled;

          dispatch(
            productApi.util.updateQueryData(
              "getProducts",
              undefined,
              (draft) => {
                draft.unshift(created);
              }
            )
          );
        } catch {
          // ignore optimistic failure
        }
      },

      invalidatesTags: [
        {
          type: "Products",

          id: "LIST",
        },
      ],
    }),

    /* =====================================================
    UPDATE PRODUCT
    ===================================================== */

    updateProduct: builder.mutation<
      Product,
      UpdateProductPayload
    >({
      query: ({ id, data }) => ({
        url: `/api/products/${id}`,

        method: "PUT",

        data,
      }),

      transformResponse: (
        response: ProductResponse
      ) => response.product,

      async onQueryStarted(
        { id, data },
        { dispatch, queryFulfilled }
      ) {
        const patchSingle = dispatch(
          productApi.util.updateQueryData(
            "getProduct",
            id,
            (draft) => {
              Object.assign(draft, data);
            }
          )
        );

        const patchList = dispatch(
          productApi.util.updateQueryData(
            "getProducts",
            undefined,
            (draft) => {
              const existing = draft.find(
                (p) => p.id === id
              );

              if (existing) {
                Object.assign(existing, data);
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchSingle.undo();

          patchList.undo();
        }
      },

      invalidatesTags: (_, __, arg) => [
        {
          type: "Product",

          id: arg.id,
        },

        {
          type: "Products",

          id: "LIST",
        },
      ],
    }),

    /* =====================================================
    DELETE PRODUCT
    ===================================================== */

    deleteProduct: builder.mutation<
      DeleteProductResponse,
      string
    >({
      query: (id) => ({
        url: `/api/products/${id}`,

        method: "DELETE",
      }),

      async onQueryStarted(
        id,
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          productApi.util.updateQueryData(
            "getProducts",
            undefined,
            (draft) => {
              return draft.filter(
                (p) => p.id !== id
              );
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },

      invalidatesTags: (_, __, id) => [
        {
          type: "Product",

          id,
        },

        {
          type: "Products",

          id: "LIST",
        },
      ],
    }),
  }),
});

/* =========================================================
HOOKS
========================================================= */

export const {
  useGetProductsQuery,
  useGetProductQuery,

  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;