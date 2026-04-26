import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

export interface Warehouse {
  id: string;
  name: string;
  state: string;
  city: string;
}

/* ================= STATE ================= */
interface WarehouseState {
  warehouses: Warehouse[];
  byId: Record<string, Warehouse>;
  loading: boolean;
  error: string | null;
  fetched: boolean;
}

/* ================= FETCH ================= */
export const fetchWarehouses = createAsyncThunk<
  Warehouse[],
  void,
  { rejectValue: string }
>("warehouses/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/api/warehouses");
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Error fetching warehouses"
    );
  }
});

/* ================= INITIAL STATE ================= */
const initialState: WarehouseState = {
  warehouses: [],
  byId: {},
  loading: false,
  error: null,
  fetched: false,
};

/* ================= SLICE ================= */
const warehouseSlice = createSlice({
  name: "warehouses",
  initialState,
  reducers: {
    clearWarehouseError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehouses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.loading = false;
        state.fetched = true;
        state.warehouses = action.payload;

        // 🔥 normalize for fast lookup (important for inventory systems)
        state.byId = action.payload.reduce((acc, w) => {
          acc[w.id] = w;
          return acc;
        }, {} as Record<string, Warehouse>);
      })

      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch warehouses";
      });
  },
});

export const { clearWarehouseError } = warehouseSlice.actions;
export default warehouseSlice.reducer;

/* ================= SELECTORS ================= */
export const selectWarehouses = (state: any) =>
  state.warehouses.warehouses;

export const selectWarehouseById = (id: string) => (state: any) =>
  state.warehouses.byId[id];