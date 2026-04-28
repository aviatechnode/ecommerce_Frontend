// src/store/cartSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

interface CartState {
  cart: any | null;
  totals: {
    subtotal: number;
    totalItems: number;
  };
  shipping: number;
  grandTotal: number;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  totals: {
    subtotal: 0,
    totalItems: 0,
  },
  shipping: 0,
  grandTotal: 0,
  loading: false,
  error: null,
};

//////////////////////////////////////////////////////////
// HELPERS
//////////////////////////////////////////////////////////

const recalculateTotals = (state: CartState) => {
  if (!state.cart?.items) return;

  let subtotal = 0;
  let totalItems = 0;

  for (const item of state.cart.items) {
    subtotal += Number(item.unitPrice) * item.quantity;
    totalItems += item.quantity;
  }

  state.totals = {
    subtotal,
    totalItems,
  };

  state.grandTotal = subtotal + Number(state.shipping || 0);
};

//////////////////////////////////////////////////////////
// FETCH CART (ONLY INITIAL LOAD)
//////////////////////////////////////////////////////////

export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/cart");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch cart"
      );
    }
  }
);

//////////////////////////////////////////////////////////
// ADD TO CART
//////////////////////////////////////////////////////////

export const addToCart = createAsyncThunk(
  "cart/add",
  async (
    data: { variantId: string; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post("/api/cart/add", data);

      return {
        item: res.data.item,
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add to cart"
      );
    }
  }
);

//////////////////////////////////////////////////////////
// UPDATE CART ITEM
//////////////////////////////////////////////////////////

export const updateCartItem = createAsyncThunk(
  "cart/update",
  async (
    { id, quantity }: { id: string; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      await api.put(`/api/cart/item/${id}`, {
        quantity,
      });

      return {
        id,
        quantity,
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update cart"
      );
    }
  }
);

//////////////////////////////////////////////////////////
// REMOVE CART ITEM
//////////////////////////////////////////////////////////

export const removeCartItem = createAsyncThunk(
  "cart/remove",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/cart/item/${id}`);

      return id;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to remove item"
      );
    }
  }
);

//////////////////////////////////////////////////////////
// CLEAR CART
//////////////////////////////////////////////////////////

export const clearCart = createAsyncThunk(
  "cart/clear",
  async (_, { rejectWithValue }) => {
    try {
      await api.delete("/api/cart/clear");

      return true;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to clear cart"
      );
    }
  }
);

//////////////////////////////////////////////////////////
// SLICE
//////////////////////////////////////////////////////////

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      //////////////////////////////////////////////////////////
      // FETCH CART
      //////////////////////////////////////////////////////////

      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
        state.totals = action.payload.totals;
        state.shipping = action.payload.shipping;
        state.grandTotal = action.payload.grandTotal;
      })

      .addCase(fetchCart.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      //////////////////////////////////////////////////////////
      // UPDATE CART ITEM (NO PAGE RELOAD)
      //////////////////////////////////////////////////////////

      .addCase(updateCartItem.fulfilled, (state, action) => {
        const item = state.cart?.items?.find(
          (i: any) => i.id === action.payload.id
        );

        if (item) {
          item.quantity = action.payload.quantity;
          recalculateTotals(state);
        }
      })

      //////////////////////////////////////////////////////////
      // REMOVE CART ITEM
      //////////////////////////////////////////////////////////

      .addCase(removeCartItem.fulfilled, (state, action) => {
        if (state.cart?.items) {
          state.cart.items = state.cart.items.filter(
            (item: any) => item.id !== action.payload
          );

          recalculateTotals(state);
        }
      })

      //////////////////////////////////////////////////////////
      // CLEAR CART
      //////////////////////////////////////////////////////////

      .addCase(clearCart.fulfilled, (state) => {
        if (state.cart) {
          state.cart.items = [];
        }

        state.totals = {
          subtotal: 0,
          totalItems: 0,
        };

        state.shipping = 0;
        state.grandTotal = 0;
      });
  },
});

export default cartSlice.reducer;