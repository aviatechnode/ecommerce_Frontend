// src/state-management/productSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productApi } from "../product-api";

/* ================= TYPES ================= */
interface ProductState {
  products: any[];
  product: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  product: null,
  loading: false,
  error: null,
};

/* ================= HELPERS ================= */
const handleError = (err: any) =>
  err?.response?.data?.message || "Something went wrong";

/* ================= THUNKS ================= */

/* GET ALL PRODUCTS */
export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await productApi.getProducts();
      return res.data.products;
    } catch (err: any) {
      return rejectWithValue(handleError(err));
    }
  }
);

/* GET SINGLE PRODUCT */
export const fetchProduct = createAsyncThunk(
  "products/fetchOne",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await productApi.getProduct(id);
      return res.data.product;
    } catch (err: any) {
      return rejectWithValue(handleError(err));
    }
  }
);

/* CREATE PRODUCT (FIXED: JSON + FILES HANDLED PROPERLY) */
export const createProduct = createAsyncThunk(
  "products/create",
  async (payload: FormData, { rejectWithValue }) => {
    try {
      const res = await productApi.createProduct(payload);
      return res.data.product;
    } catch (err: any) {
      return rejectWithValue(handleError(err));
    }
  }
);

/* UPDATE PRODUCT */
export const updateProduct = createAsyncThunk(
  "products/update",
  async (
    { id, formData }: { id: string; formData: FormData },
    { rejectWithValue }
  ) => {
    try {
      const res = await productApi.updateProduct(id, formData);
      return res.data.product;
    } catch (err: any) {
      return rejectWithValue(handleError(err));
    }
  }
);

/* DELETE PRODUCT */
export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await productApi.deleteProduct(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(handleError(err));
    }
  }
);

/* ================= SLICE ================= */

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProduct: (state) => {
      state.product = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ================= FETCH ALL ================= */
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= FETCH ONE ================= */
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= CREATE ================= */
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= UPDATE ================= */
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) state.products[index] = action.payload;

        if (state.product?.id === action.payload.id) {
          state.product = action.payload;
        }
      })

      /* ================= DELETE ================= */
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(
          (p) => p.id !== action.payload
        );
      });
  },
});

export const { clearProduct, clearError } = productSlice.actions;
export default productSlice.reducer;