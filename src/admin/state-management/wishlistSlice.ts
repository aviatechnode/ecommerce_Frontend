import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

//////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////

export interface Product {
  id: string;
  name: string;
  price?: number;
  medias?: { url: string }[];
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
}

export interface Wishlist {
  id: string;
  items: WishlistItem[];
}

interface WishlistState {
  wishlist: Wishlist | null;
  loading: boolean;
  error: string | null;
}

//////////////////////////////////////////////////////////
// INITIAL STATE
//////////////////////////////////////////////////////////

const initialState: WishlistState = {
  wishlist: null,
  loading: false,
  error: null,
};

//////////////////////////////////////////////////////////
// THUNKS
//////////////////////////////////////////////////////////

/* GET WISHLIST */
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/wishlist");
      return res.data.wishlist;
    } catch (err: any) {
      console.error("Fetch wishlist error:", err?.response);

      return rejectWithValue(
        err?.response?.data?.message || "Failed to load wishlist"
      );
    }
  }
);

/* ADD TO WISHLIST */
export const addToWishlist = createAsyncThunk(
  "wishlist/add",
  async (productId: string, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/wishlist", { productId });
      return res.data.item;
    } catch (err: any) {
      console.error("Add wishlist error:", err?.response);

      return rejectWithValue(
        err?.response?.data?.message || "Failed to add to wishlist"
      );
    }
  }
);

/* REMOVE ITEM */
export const removeWishlistItem = createAsyncThunk(
  "wishlist/remove",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/wishlist/${id}`);
      return id;
    } catch (err: any) {
      console.error("Remove wishlist error:", err?.response);

      return rejectWithValue(
        err?.response?.data?.message || "Failed to remove item"
      );
    }
  }
);

/* CLEAR WISHLIST */
export const clearWishlist = createAsyncThunk(
  "wishlist/clear",
  async (_, { rejectWithValue }) => {
    try {
      await api.delete("/api/wishlist");
      return true;
    } catch (err: any) {
      console.error("Clear wishlist error:", err?.response);

      return rejectWithValue(
        err?.response?.data?.message || "Failed to clear wishlist"
      );
    }
  }
);

/* 🔥 TOGGLE WISHLIST (NEW) */
export const toggleWishlist = createAsyncThunk(
  "wishlist/toggle",
  async (productId: string, { getState, dispatch, rejectWithValue }: any) => {
    try {
      const state = getState().wishlist;
      const existing = state.wishlist?.items.find(
        (item: WishlistItem) => item.productId === productId
      );

      if (existing) {
        await dispatch(removeWishlistItem(existing.id)).unwrap();
        return { removed: true, productId };
      } else {
        const item = await dispatch(addToWishlist(productId)).unwrap();
        return { added: true, item };
      }
    } catch (err: any) {
      return rejectWithValue(
        err?.message || "Failed to toggle wishlist"
      );
    }
  }
);

//////////////////////////////////////////////////////////
// SLICE
//////////////////////////////////////////////////////////

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      //////////////////////////////////////////////////////////
      // FETCH
      //////////////////////////////////////////////////////////

      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload;
      })

      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      //////////////////////////////////////////////////////////
      // ADD
      //////////////////////////////////////////////////////////

      .addCase(addToWishlist.fulfilled, (state, action) => {
        if (!state.wishlist) {
          state.wishlist = { id: "", items: [] };
        }

        // prevent duplicates (extra safety)
        const exists = state.wishlist.items.some(
          (item) => item.productId === action.payload.productId
        );

        if (!exists) {
          state.wishlist.items.push(action.payload);
        }
      })

      //////////////////////////////////////////////////////////
      // REMOVE
      //////////////////////////////////////////////////////////

      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        if (!state.wishlist) return;

        state.wishlist.items = state.wishlist.items.filter(
          (item) => item.id !== action.payload
        );
      })

      //////////////////////////////////////////////////////////
      // CLEAR
      //////////////////////////////////////////////////////////

      .addCase(clearWishlist.fulfilled, (state) => {
        if (!state.wishlist) return;

        state.wishlist.items = [];
      })

      //////////////////////////////////////////////////////////
      // 🔥 TOGGLE (NEW)
      //////////////////////////////////////////////////////////

      .addCase(toggleWishlist.fulfilled, (state, action) => {
        if (!state.wishlist) {
          state.wishlist = { id: "", items: [] };
        }

        if (action.payload?.added) {
          const exists = state.wishlist.items.some(
            (item) => item.productId === action.payload.item.productId
          );

          if (!exists) {
            state.wishlist.items.push(action.payload.item);
          }
        }

        if (action.payload?.removed) {
          state.wishlist.items = state.wishlist.items.filter(
            (item) => item.productId !== action.payload.productId
          );
        }
      });
  },
});

export default wishlistSlice.reducer;