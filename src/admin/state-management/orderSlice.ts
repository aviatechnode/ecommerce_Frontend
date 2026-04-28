import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

interface OrderState {
  order: any | null;
  payment: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  order: null,
  payment: null,
  loading: false,
  error: null,
};

//////////////////////////////////////////////////////////
// CHECKOUT
//////////////////////////////////////////////////////////

export const checkout = createAsyncThunk(
  "order/checkout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/checkout");

      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Checkout failed"
      );
    }
  }
);

//////////////////////////////////////////////////////////
// INITIALIZE PAYMENT (PAYSTACK)
//////////////////////////////////////////////////////////

export const initializePayment = createAsyncThunk(
  "order/initializePayment",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/payment/initialize", {
        orderId,
      });

      return res.data; // authorization_url, reference, etc
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Payment init failed"
      );
    }
  }
);

//////////////////////////////////////////////////////////
// SLICE
//////////////////////////////////////////////////////////

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.order = null;
      state.payment = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder

      //////////////////////////////////////////////////////////
      // CHECKOUT
      //////////////////////////////////////////////////////////

      .addCase(checkout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(checkout.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload.order;
        state.payment = action.payload.payment;
      })

      .addCase(checkout.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      //////////////////////////////////////////////////////////
      // INITIALIZE PAYMENT
      //////////////////////////////////////////////////////////

      .addCase(initializePayment.pending, (state) => {
        state.loading = true;
      })

      .addCase(initializePayment.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(initializePayment.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetOrderState } = orderSlice.actions;

export default orderSlice.reducer;