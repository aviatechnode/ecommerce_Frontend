import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../api/axiosBaseQuery";
import type { CreateProductInput } from "../schemas/product.schema";

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
UPDATE PAYLOAD (ACCEPTS ANY SUBSET OF PRODUCT FIELDS)
========================================================= */

export interface UpdateProductPayload {
  id: string;
  data: Partial<CreateProductInput>;
}

/* =========================================================
API RESPONSES
========================================================= */

export interface ProductsResponse {
  products: Product[];
}

export interface ProductResponse {
  product: Product;
}

export interface DeleteProductResponse {
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

      transformResponse: (res: ProductsResponse) => res.products ?? [],

      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({
                type: "Product" as const,
                id: p.id,
              })),
              { type: "Products" as const, id: "LIST" },
            ]
          : [{ type: "Products" as const, id: "LIST" }],
    }),

    /* =====================================================
    GET PRODUCT
    ===================================================== */

    getProduct: builder.query<Product, string>({
      query: (id) => ({
        url: `/api/products/${id}`,
        method: "GET",
      }),

      transformResponse: (res: ProductResponse) => res.product,

      providesTags: (_, __, id) => [
        { type: "Product", id },
      ],
    }),

    /* =====================================================
    CREATE PRODUCT
    ===================================================== */

    createProduct: builder.mutation<Product, CreateProductInput>({
      query: (data) => ({
        url: "/api/products",
        method: "POST",
        data,
      }),

      transformResponse: (res: ProductResponse) => res.product,

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data: created } = await queryFulfilled;

          dispatch(
            productApi.util.updateQueryData(
              "getProducts",
              undefined,
              (draft) => {
                draft.unshift(created);
              }
            )
          );
        } catch {}
      },

      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),

    /* =====================================================
    UPDATE PRODUCT (FULL REPLACEMENT OF ANY FIELD)
    ===================================================== */

    updateProduct: builder.mutation<Product, UpdateProductPayload>({
      query: ({ id, data }) => ({
        url: `/api/products/${id}`,
        method: "PATCH",
        data,
      }),

      transformResponse: (res: ProductResponse) => res.product,

      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        // Optimistic update for single product cache
        const patchSingle = dispatch(
          productApi.util.updateQueryData("getProduct", id, (draft) => {
            Object.assign(draft, data);
          })
        );

        // Optimistic update for products list cache
        const patchList = dispatch(
          productApi.util.updateQueryData("getProducts", undefined, (draft) => {
            const existing = draft.find((p) => p.id === id);
            if (existing) {
              Object.assign(existing, data);
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchSingle.undo();
          patchList.undo();
        }
      },

      invalidatesTags: (_, __, arg) => [
        { type: "Product", id: arg.id },
        { type: "Products", id: "LIST" },
      ],
    }),

    /* =====================================================
    DELETE PRODUCT
    ===================================================== */

    deleteProduct: builder.mutation<DeleteProductResponse, string>({
      query: (id) => ({
        url: `/api/products/${id}`,
        method: "DELETE",
      }),

      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          productApi.util.updateQueryData("getProducts", undefined, (draft) => {
            return draft.filter((p) => p.id !== id);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },

      invalidatesTags: (_, __, id) => [
        { type: "Product", id },
        { type: "Products", id: "LIST" },
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