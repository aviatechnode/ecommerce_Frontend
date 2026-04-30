import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api/axios";


/* =========================================================
TYPES
========================================================= */

type CheckoutPayload = {
  couponCode?: string;
  addressId?: string;
  address?: {
    type?: "DELIVERY" | "BILLING";
    street: string;
    city: string;
    state: string;
    lga: string;
    phone: string;
    country?: string;
    landmark?: string;
    postalCode?: string;
  };
};

type CheckoutResponse = {
  message: string;
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    paymentStatus: string;
    status: string;
  };
  payment: {
    id: string;
    reference: string;
    amount: number;
    status: string;
  };
  shippingFee: number;
  distanceKm: number;
  metrics: {
    actualWeight: number;
    volumetricWeight: number;
    chargeableWeight: number;
  };
};

type InitializePaymentResponse = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

type CheckoutState = {
  loading: boolean;
  success: boolean;
  error: string | null;

  order: CheckoutResponse["order"] | null;
  payment: CheckoutResponse["payment"] | null;

  shippingFee: number;
  distanceKm: number;

  paymentAuthorizationUrl: string | null;
  paymentReference: string | null;
};

/* =========================================================
HELPER: GENERATE IDEMPOTENCY KEY
========================================================= */

const generateIdempotencyKey = () => {
  return `checkout_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 12)}`;
};

/* =========================================================
THUNK: CHECKOUT
========================================================= */

export const createCheckout = createAsyncThunk<
  CheckoutResponse,
  CheckoutPayload,
  { rejectValue: string }
>(
  "checkout/createCheckout",
  async (payload, { rejectWithValue }) => {
    try {
      const idempotencyKey = generateIdempotencyKey();

      const response = await api.post<CheckoutResponse>(
        "/api/checkout",
        payload,
        {
          headers: {
            "Idempotency-Key": idempotencyKey,
          },
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Checkout failed"
      );
    }
  }
);

/* =========================================================
THUNK: INITIALIZE PAYMENT
========================================================= */

export const initializePayment = createAsyncThunk<
  InitializePaymentResponse,
  { orderId: string },
  { rejectValue: string }
>(
  "checkout/initializePayment",
  async ({ orderId }, { rejectWithValue }) => {
    try {
      const response =
        await api.post<InitializePaymentResponse>(
          "/api/payments/initialize",
          { orderId },
          {
            withCredentials: true,
          }
        );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Payment initialization failed"
      );
    }
  }
);

/* =========================================================
INITIAL STATE
========================================================= */

const initialState: CheckoutState = {
  loading: false,
  success: false,
  error: null,

  order: null,
  payment: null,

  shippingFee: 0,
  distanceKm: 0,

  paymentAuthorizationUrl: null,
  paymentReference: null,
};

/* =========================================================
SLICE
========================================================= */

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    resetCheckoutState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;

      state.order = null;
      state.payment = null;

      state.shippingFee = 0;
      state.distanceKm = 0;

      state.paymentAuthorizationUrl = null;
      state.paymentReference = null;
    },

    clearCheckoutError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    /* ===============================
       CREATE CHECKOUT
    =============================== */

    builder.addCase(createCheckout.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });

    builder.addCase(
      createCheckout.fulfilled,
      (
        state,
        action: PayloadAction<CheckoutResponse>
      ) => {
        state.loading = false;
        state.success = true;

        state.order = action.payload.order;
        state.payment = action.payload.payment;

        state.shippingFee = action.payload.shippingFee;
        state.distanceKm = action.payload.distanceKm;
      }
    );

    builder.addCase(
      createCheckout.rejected,
      (state, action) => {
        state.loading = false;
        state.success = false;
        state.error =
          action.payload || "Checkout failed";
      }
    );

    /* ===============================
       INITIALIZE PAYMENT
    =============================== */

    builder.addCase(
      initializePayment.pending,
      (state) => {
        state.loading = true;
        state.error = null;
      }
    );

    builder.addCase(
      initializePayment.fulfilled,
      (
        state,
        action: PayloadAction<InitializePaymentResponse>
      ) => {
        state.loading = false;

        state.paymentAuthorizationUrl =
          action.payload.authorization_url;

        state.paymentReference =
          action.payload.reference;
      }
    );

    builder.addCase(
      initializePayment.rejected,
      (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          "Payment initialization failed";
      }
    );
  },
});

/* =========================================================
EXPORTS
========================================================= */

export const {
  resetCheckoutState,
  clearCheckoutError,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;