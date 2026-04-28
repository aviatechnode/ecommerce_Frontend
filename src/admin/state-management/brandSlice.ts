import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

/* =========================================================
PRISMA-ALIGNED TYPE
========================================================= */

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  isFeatured: boolean;
}

/* =========================================================
STATE TYPE (THIS FIXES "never[]")
========================================================= */

interface BrandState {
  brands: Brand[];
  loading: boolean;
  error: string | null;
}

/* =========================================================
INITIAL STATE
========================================================= */

const initialState: BrandState = {
  brands: [],
  loading: false,
  error: null,
};

/* =========================================================
ASYNC THUNK
========================================================= */

export const fetchBrands = createAsyncThunk<
  Brand[],
  void,
  { rejectValue: string }
>("brands/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/api/brands");
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch brands");
  }
});

/* =========================================================
SLICE
========================================================= */

const brandSlice = createSlice({
  name: "brands",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* FETCH PENDING */
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      /* FETCH SUCCESS */
      .addCase(
        fetchBrands.fulfilled,
        (state, action: PayloadAction<Brand[]>) => {
          state.loading = false;
          state.brands = action.payload;
        }
      )

      /* FETCH ERROR */
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unknown error";
      });
  },
});

export default brandSlice.reducer;