import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { api } from "../../api/axios";

/* =========================================================
TYPES (MATCH PRISMA RESPONSE ONLY)
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
  parent?: Category | null;

  children?: Category[];

  _count?: {
    products: number;
  };
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

/* =========================================================
STATE
========================================================= */

interface CategoryState {
  categories: Category[];
  category: Category | null;
  tree: CategoryTreeNode[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  category: null,
  tree: [],
  loading: false,
  error: null,
};

/* =========================================================
HELPER
========================================================= */

const getError = (err: any) =>
  err?.response?.data?.message ||
  err?.response?.data?.errors ||
  "Something went wrong";

/* =========================================================
ASYNC ACTIONS
========================================================= */

// GET ALL
export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/categories");
      return res.data as Category[];
    } catch (err: any) {
      return rejectWithValue(getError(err));
    }
  }
);

// GET TREE
export const fetchCategoryTree = createAsyncThunk(
  "categories/fetchTree",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/categories/tree");
      return res.data as CategoryTreeNode[];
    } catch (err: any) {
      return rejectWithValue(getError(err));
    }
  }
);

/* =========================================================
CREATE CATEGORY (FIXED TYPES)
========================================================= */

export const createCategory = createAsyncThunk(
  "categories/create",
  async (
    data: {
      name: string;
      parentId?: string | null;

      // optional UI fields only
      description?: string;
      imageUrl?: string;
      type?: string;
      level?: number;
      sortOrder?: number;
      isActive?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post("/api/categories", data);
      return res.data.category as Category;
    } catch (err: any) {
      return rejectWithValue(getError(err));
    }
  }
);

/* =========================================================
UPDATE CATEGORY (FIXED TYPES)
========================================================= */

export const updateCategory = createAsyncThunk(
  "categories/update",
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        parentId?: string | null;

        description?: string;
        imageUrl?: string;

        isActive?: boolean;
        sortOrder?: number;
        level?: number;

        type?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.put(`/api/categories/${id}`, data);
      return res.data.category as Category;
    } catch (err: any) {
      return rejectWithValue(getError(err));
    }
  }
);

/* =========================================================
DELETE CATEGORY
========================================================= */

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/categories/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(getError(err));
    }
  }
);

/* =========================================================
SLICE
========================================================= */

const categorySlice = createSlice({
  name: "categories",
  initialState,

  reducers: {
    clearCategory: (state) => {
      state.category = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* FETCH ALL */
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCategories.fulfilled,
        (state, action: PayloadAction<Category[]>) => {
          state.loading = false;
          state.categories = action.payload;
        }
      )
      .addCase(fetchCategories.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* TREE */
      .addCase(
        fetchCategoryTree.fulfilled,
        (state, action: PayloadAction<CategoryTreeNode[]>) => {
          state.tree = action.payload;
        }
      )

      /* CREATE */
      .addCase(
        createCategory.fulfilled,
        (state, action: PayloadAction<Category>) => {
          state.categories.push(action.payload);
        }
      )

      /* UPDATE */
      .addCase(
        updateCategory.fulfilled,
        (state, action: PayloadAction<Category>) => {
          state.categories = state.categories.map((c) =>
            c.id === action.payload.id ? action.payload : c
          );

          if (state.category?.id === action.payload.id) {
            state.category = action.payload;
          }
        }
      )

      /* DELETE */
      .addCase(
        deleteCategory.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.categories = state.categories.filter(
            (c) => c.id !== action.payload
          );

          if (state.category?.id === action.payload) {
            state.category = null;
          }
        }
      );
  },
});

export const { clearCategory } = categorySlice.actions;
export default categorySlice.reducer;