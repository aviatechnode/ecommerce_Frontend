import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productApi } from "../product-api";

/* =========================================================
TYPES
========================================================= */

export interface ProductVariant {
  id?: string;

  name: string;
  sku: string;

  price: number;
  costPrice?: number;
  compareAtPrice?: number;

  weight?: number;
  length?: number;
  width?: number;
  height?: number;

  barcode?: string;
  isActive?: boolean;

  attributes?: { valueId: string }[];

  inventories?: {
    warehouseId: string;
    stock: number;
    reserved?: number;
    threshold?: number;
  }[];
}

export interface CreateProductPayload {
  name: string;
  description?: string;

  brandId: string;
  categoryId: string;

  isActive: boolean;
  isFeatured?: boolean;

  searchKeywords?: string;

  oemNumbers?: { oemNumber: string }[];

  variants?: ProductVariant[];

  specifications?: {
    name: string;
    value: string;
  }[];

  productFitments?: {
    trimId: string;
    notes?: string;
  }[];

  medias?: {
    url: string;
    type: "IMAGE" | "VIDEO";
    position?: number;
  }[];
}

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

/* =========================================================
HELPER
========================================================= */

const handleError = (err: any) =>
  err?.response?.data?.message ||
  err?.response?.data ||
  err?.message ||
  "Something went wrong";

/* =========================================================
THUNKS
========================================================= */

/* GET ALL */
export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await productApi.getProducts();
      return res.data.products;
    } catch (err) {
      return rejectWithValue(handleError(err));
    }
  }
);

/* GET ONE */
export const fetchProduct = createAsyncThunk(
  "products/fetchOne",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await productApi.getProduct(id);
      return res.data.product;
    } catch (err) {
      return rejectWithValue(handleError(err));
    }
  }
);

/* CREATE */
export const createProduct = createAsyncThunk(
  "products/create",
  async (payload: CreateProductPayload, { rejectWithValue }) => {
    try {
      const res = await productApi.createProduct(payload);
      return res.data.product;
    } catch (err) {
      return rejectWithValue(handleError(err));
    }
  }
);

/* UPDATE */
export const updateProduct = createAsyncThunk(
  "products/update",
  async (
    { id, data }: { id: string; data: Partial<CreateProductPayload> },
    { rejectWithValue }
  ) => {
    try {
      const res = await productApi.updateProduct(id, data);
      return res.data.product;
    } catch (err) {
      return rejectWithValue(handleError(err));
    }
  }
);

/* DELETE */
export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await productApi.deleteProduct(id);
      return id;
    } catch (err) {
      return rejectWithValue(handleError(err));
    }
  }
);

/* =========================================================
SLICE
========================================================= */

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

      /* FETCH ALL */
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

      /* FETCH ONE */
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* CREATE */
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

      /* UPDATE */
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.products.findIndex(
          (p) => p.id === action.payload.id
        );

        if (index !== -1) {
          state.products[index] = action.payload;
        }

        if (state.product?.id === action.payload.id) {
          state.product = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* DELETE */
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(
          (p) => p.id !== action.payload
        );

        if (state.product?.id === action.payload) {
          state.product = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProduct, clearError } = productSlice.actions;
export default productSlice.reducer;