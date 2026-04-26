import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

/* =========================================================
TYPES
========================================================= */

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parent?: Category | null;
  _count?: {
    products: number;
  };
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

interface CategoryState {
  categories: Category[];
  category: Category | null;
  tree: CategoryTreeNode[];
  loading: boolean;
  error: string | null;
}

/* =========================================================
INITIAL STATE
========================================================= */

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
  err.response?.data?.message || err.response?.data?.errors || "Something went wrong";

/* =========================================================
ASYNC ACTIONS
========================================================= */

// GET ALL
export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/categories");
      return res.data;
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
      return res.data;
    } catch (err: any) {
      return rejectWithValue(getError(err));
    }
  }
);

// CREATE (❗ no slug anymore)
export const createCategory = createAsyncThunk(
  "categories/create",
  async (data: { name: string; parentId?: string | null }, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/categories", data);
      return res.data.category;
    } catch (err: any) {
      return rejectWithValue(getError(err));
    }
  }
);

// UPDATE
export const updateCategory = createAsyncThunk(
  "categories/update",
  async (
    { id, data }: { id: string; data: { name?: string; parentId?: string | null } },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.put(`/api/categories/${id}`, data);
      return res.data.category;
    } catch (err: any) {
      return rejectWithValue(getError(err));
    }
  }
);

// DELETE
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

      /* FETCH */
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* TREE */
      .addCase(fetchCategoryTree.fulfilled, (state, action: PayloadAction<CategoryTreeNode[]>) => {
        state.tree = action.payload;
      })

      /* CREATE */
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.categories.push(action.payload);
      })

      /* UPDATE */
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.categories = state.categories.map((c) =>
          c.id === action.payload.id ? action.payload : c
        );
      })

      /* DELETE */
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.categories = state.categories.filter((c) => c.id !== action.payload);
      });
  },
});

export const { clearCategory } = categorySlice.actions;
export default categorySlice.reducer;