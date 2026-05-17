import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCsrfToken } from "../lib/csrf";

/* =========================================================
TYPES
========================================================= */

export interface Category {
  id: string;
  name: string;
  slug: string;
  code: string;
  type: string;
  level: number;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  parentId?: string | null;
  _count?: {
    products: number;
  };
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

/* =========================================================
BASE QUERY
========================================================= */

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",

  prepareHeaders: (headers) => {
    const csrf = getCsrfToken();
    if (csrf) headers.set("x-csrf-token", csrf);
    return headers;
  },
});

/* =========================================================
API
========================================================= */

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery,
  tagTypes: ["Category", "CategoryTree"],

  endpoints: (builder) => ({

    /* ================= GET ALL ================= */
    getCategories: builder.query<Category[], void>({
      query: () => "/api/categories",
      providesTags: ["Category"],
    }),

    /* ================= GET TREE ================= */
    getCategoryTree: builder.query<CategoryTreeNode[], void>({
      query: () => "/api/categories/tree",
      providesTags: ["CategoryTree"],
    }),

    /* ================= CREATE ================= */
    createCategory: builder.mutation<
      Category,
      Partial<Category> & { name: string; parentId?: string | null }
    >({
      query: (body) => ({
        url: "/api/categories",
        method: "POST",
        body,
      }),

      invalidatesTags: ["Category", "CategoryTree"],
    }),

    /* ================= UPDATE ================= */
    updateCategory: builder.mutation<
      Category,
      { id: string; data: Partial<Category> }
    >({
      query: ({ id, data }) => ({
        url: `/api/categories/${id}`,
        method: "PUT",
        body: data,
      }),

      invalidatesTags: ["Category", "CategoryTree"],
    }),

    /* ================= DELETE ================= */
    deleteCategory: builder.mutation<string, string>({
      query: (id) => ({
        url: `/api/categories/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["Category", "CategoryTree"],
    }),
  }),
});

/* =========================================================
HOOKS
========================================================= */

export const {
  useGetCategoriesQuery,
  useGetCategoryTreeQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;