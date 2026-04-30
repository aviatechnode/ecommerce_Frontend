import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addressApi } from "../../api/address.api";

/* =========================================================
TYPES
========================================================= */

export interface Address {
  id: string;
  type: "DELIVERY" | "BILLING";
  street: string;
  city: string;
  state: string;
  lga: string;
  landmark?: string | null;
  postalCode?: string | null;
  phone: string;
  country: string;
  isDefault: boolean;
  createdAt?: string;
}

interface AddressState {
  items: Address[];
  loading: boolean;
  error: string | null;
}

/* =========================================================
INITIAL STATE
========================================================= */

const initialState: AddressState = {
  items: [],
  loading: false,
  error: null,
};

/* =========================================================
THUNKS
========================================================= */

// GET ALL
export const fetchAddresses = createAsyncThunk(
  "address/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await addressApi.getAll();
      return res.data.addresses;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch addresses"
      );
    }
  }
);

// CREATE
export const createAddress = createAsyncThunk(
  "address/create",
  async (data: any, thunkAPI) => {
    try {
      const res = await addressApi.create(data);
      return res.data.address;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to create address"
      );
    }
  }
);

// UPDATE
export const updateAddress = createAsyncThunk(
  "address/update",
  async (
    { id, data }: { id: string; data: any },
    thunkAPI
  ) => {
    try {
      const res = await addressApi.update(id, data);
      return res.data.address;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update address"
      );
    }
  }
);

// DELETE
export const deleteAddress = createAsyncThunk(
  "address/delete",
  async (id: string, thunkAPI) => {
    try {
      await addressApi.remove(id);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to delete address"
      );
    }
  }
);

// SET DEFAULT
export const setDefaultAddress = createAsyncThunk(
  "address/setDefault",
  async (id: string, thunkAPI) => {
    try {
      await addressApi.setDefault(id);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to set default"
      );
    }
  }
);

/* =========================================================
SLICE
========================================================= */

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      /* ================= FETCH ================= */
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ================= CREATE ================= */
      .addCase(createAddress.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

      /* ================= UPDATE ================= */
      .addCase(updateAddress.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (a) => a.id === action.payload.id
        );
        if (index !== -1) state.items[index] = action.payload;
      })

      /* ================= DELETE ================= */
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (a) => a.id !== action.payload
        );
      })

      /* ================= DEFAULT ================= */
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.items = state.items.map((a) => ({
          ...a,
          isDefault: a.id === action.payload,
        }));
      });
  },
});

export default addressSlice.reducer;