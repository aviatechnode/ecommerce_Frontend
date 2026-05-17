import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api/axios";
import type { NigerianState } from "../../shared/enums/enums";

/* =========================================================
TYPES (MATCH BACKEND EXACTLY)
========================================================= */

type Address = {
  id: string;
  name: string;
  phone: string;
  state: NigerianState;
  lga: string;
  city: string;
  area?: string | null;
  street: string;
  landmark?: string | null;
  fullAddress: string;
  isDefault?: boolean;
};

type CheckoutPayload = {
  couponCode?: string;
  addressId?: string;
  note?: string;
  address?: {
    name: string;
    phone: string;
    state: string;
    lga: string;
    city: string;
    area?: string | null;
    street: string;
    landmark?: string | null;
    isDefault?: boolean;
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

type CouponPreview = {
  valid: boolean;
  discount: number;
  finalAmount: number;
  message?: string;
};

type CheckoutState = {
  loading: boolean;
  success: boolean;
  error: string | null;

  order: CheckoutResponse["order"] | null;
  payment: CheckoutResponse["payment"] | null;

  shippingFee: number;
  distanceKm: number;

  metrics: CheckoutResponse["metrics"] | null;

  paymentAuthorizationUrl: string | null;
  paymentReference: string | null;

  selectedAddressId: string | null;
  useNewAddress: boolean;
  newAddressDraft: CheckoutPayload["address"] | null;
  savedAddresses: Address[];

  couponCode: string;
  couponPreview: CouponPreview | null;
};

/* =========================================================
HELPER
========================================================= */

const generateIdempotencyKey = () =>
  `checkout_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 10)}`;

/* =========================================================
THUNKS
========================================================= */

export const createCheckout = createAsyncThunk<
  CheckoutResponse,
  CheckoutPayload,
  { rejectValue: string }
>("checkout/createCheckout", async (payload, { rejectWithValue }) => {
  try {
    const idempotencyKey = generateIdempotencyKey();

    const res = await api.post("/api/checkout", payload, {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
      withCredentials: true,
    });

    // handle duplicate response format
    if (res.data?.data) {
      return rejectWithValue("Duplicate checkout request");
    }

    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || "Checkout failed"
    );
  }
});

export const initializePayment = createAsyncThunk<
  InitializePaymentResponse,
  { orderId: string },
  { rejectValue: string }
>(
  "checkout/initializePayment",
  async ({ orderId }, { rejectWithValue }) => {
    try {
      const res = await api.post(
        "/api/payments/initialize",
        { orderId },
        { withCredentials: true }
      );

      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Payment failed"
      );
    }
  }
);

export const previewCoupon = createAsyncThunk<
  CouponPreview,
  { code: string; orderAmount: number },
  { rejectValue: string }
>(
  "checkout/previewCoupon",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post(
        "/api/coupon/apply",
        payload,
        { withCredentials: true }
      );

      return {
        valid: true,
        discount: res.data.discount,
        finalAmount: res.data.finalAmount,
        message: "Coupon applied",
      };
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Invalid coupon"
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
  metrics: null,

  paymentAuthorizationUrl: null,
  paymentReference: null,

  selectedAddressId: null,
  useNewAddress: false,
  newAddressDraft: null,
  savedAddresses: [],

  couponCode: "",
  couponPreview: null,
};

/* =========================================================
SLICE
========================================================= */

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    resetCheckoutState: () => initialState,

    clearCheckoutError: (state) => {
      state.error = null;
    },

    setSelectedAddress: (
      state,
      action: PayloadAction<string>
    ) => {
      state.selectedAddressId = action.payload;
      state.useNewAddress = false;
    },

    enableNewAddress: (state) => {
      state.useNewAddress = true;
      state.selectedAddressId = null;
    },

    setNewAddressDraft: (
      state,
      action: PayloadAction<CheckoutPayload["address"]>
    ) => {
      state.newAddressDraft = action.payload;
    },

    setSavedAddresses: (
      state,
      action: PayloadAction<Address[]>
    ) => {
      state.savedAddresses = action.payload;
    },

    setCouponCode: (
      state,
      action: PayloadAction<string>
    ) => {
      state.couponCode = action.payload;
    },

    clearCoupon: (state) => {
      state.couponCode = "";
      state.couponPreview = null;
    },
  },

  extraReducers: (builder) => {
    /* ================= CHECKOUT ================= */

    builder.addCase(createCheckout.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });

    builder.addCase(
      createCheckout.fulfilled,
      (state, action) => {
        state.loading = false;
        state.success = true;

        state.order = action.payload.order;
        state.payment = action.payload.payment;
        state.shippingFee = action.payload.shippingFee;
        state.distanceKm = action.payload.distanceKm;
        state.metrics = action.payload.metrics;
      }
    );

    builder.addCase(
      createCheckout.rejected,
      (state, action) => {
        state.loading = false;
        state.error = action.payload || "Checkout failed";
      }
    );

    /* ================= PAYMENT ================= */

    builder.addCase(
      initializePayment.pending,
      (state) => {
        state.loading = true;
      }
    );

    builder.addCase(
      initializePayment.fulfilled,
      (state, action) => {
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
        state.error = action.payload || "Payment failed";
      }
    );

    /* ================= COUPON ================= */

    builder.addCase(
      previewCoupon.pending,
      (state) => {
        state.couponPreview = null;
      }
    );

    builder.addCase(
      previewCoupon.fulfilled,
      (state, action) => {
        state.couponPreview = action.payload;
      }
    );

    builder.addCase(
      previewCoupon.rejected,
      (state, action) => {
        state.couponPreview = {
          valid: false,
          discount: 0,
          finalAmount: 0,
          message:
            action.payload || "Invalid coupon",
        };
      }
    );
  },
});

export const {
  resetCheckoutState,
  clearCheckoutError,
  setSelectedAddress,
  enableNewAddress,
  setNewAddressDraft,
  setSavedAddresses,
  setCouponCode,
  clearCoupon,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;