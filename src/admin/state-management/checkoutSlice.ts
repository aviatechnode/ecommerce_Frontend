import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

/* =========================================================
TYPES
========================================================= */

type Address = {
  id: string;
  street: string;
  city: string;
  state: string;
  lga: string;
  phone: string;
  isDefault?: boolean;
};

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

  /* ORDER */
  order: CheckoutResponse["order"] | null;
  payment: CheckoutResponse["payment"] | null;

  /* SHIPPING */
  shippingFee: number;
  distanceKm: number;

  /* PAYMENT */
  paymentAuthorizationUrl: string | null;
  paymentReference: string | null;

  /* ADDRESS SYSTEM (NEW) */
  selectedAddressId: string | null;
  useNewAddress: boolean;
  newAddressDraft: CheckoutPayload["address"] | null;
  savedAddresses: Address[];

  /* COUPON SYSTEM (NEW) */
  couponCode: string;
  couponPreview: CouponPreview | null;
};

/* =========================================================
HELPER
========================================================= */

const generateIdempotencyKey = () =>
  `checkout_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

/* =========================================================
THUNKS
========================================================= */

/* CHECKOUT */
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

    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || "Checkout failed"
    );
  }
});

/* INITIALIZE PAYMENT */
export const initializePayment = createAsyncThunk<
  InitializePaymentResponse,
  { orderId: string },
  { rejectValue: string }
>("checkout/initializePayment", async ({ orderId }, { rejectWithValue }) => {
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
});

/* COUPON PREVIEW (REAL-TIME UX) */
export const previewCoupon = createAsyncThunk<
  CouponPreview,
  { code: string; orderAmount: number },
  { rejectValue: string }
>("checkout/previewCoupon", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post("/api/coupon/apply", payload, {
      withCredentials: true,
    });

    return {
      valid: true,
      discount: res.data.discount,
      finalAmount: res.data.finalAmount,
    };
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.message || "Invalid coupon");
  }
});

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

  /* ADDRESS */
  selectedAddressId: null,
  useNewAddress: false,
  newAddressDraft: null,
  savedAddresses: [],

  /* COUPON */
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
    /* RESET */
    resetCheckoutState: () => initialState,

    clearCheckoutError: (state) => {
      state.error = null;
    },

    /* ADDRESS */
    setSelectedAddress: (state, action: PayloadAction<string>) => {
      state.selectedAddressId = action.payload;
      state.useNewAddress = false;
    },

    enableNewAddress: (state) => {
      state.useNewAddress = true;
      state.selectedAddressId = null;
    },

    setNewAddressDraft: (state, action: PayloadAction<any>) => {
      state.newAddressDraft = action.payload;
    },

    setSavedAddresses: (state, action: PayloadAction<Address[]>) => {
      state.savedAddresses = action.payload;
    },

    /* COUPON */
    setCouponCode: (state, action: PayloadAction<string>) => {
      state.couponCode = action.payload;
    },

    clearCoupon: (state) => {
      state.couponCode = "";
      state.couponPreview = null;
    },
  },

  extraReducers: (builder) => {
    /* CHECKOUT */
    builder.addCase(createCheckout.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(createCheckout.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;

      state.order = action.payload.order;
      state.payment = action.payload.payment;
      state.shippingFee = action.payload.shippingFee;
      state.distanceKm = action.payload.distanceKm;
    });

    builder.addCase(createCheckout.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Checkout failed";
    });

    /* PAYMENT */
    builder.addCase(initializePayment.fulfilled, (state, action) => {
      state.paymentAuthorizationUrl = action.payload.authorization_url;
      state.paymentReference = action.payload.reference;
    });

    /* COUPON */
    builder.addCase(previewCoupon.fulfilled, (state, action) => {
      state.couponPreview = action.payload;
    });

    builder.addCase(previewCoupon.rejected, (state, action) => {
      state.couponPreview = {
        valid: false,
        discount: 0,
        finalAmount: 0,
        message: action.payload || "Invalid coupon",
      };
    });
  },
});

/* =========================================================
EXPORTS
========================================================= */

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