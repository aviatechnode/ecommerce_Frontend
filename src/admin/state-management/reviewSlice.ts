import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

//////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////

export interface Review {
  id: string;
  productId: string;
  userId: string;
  title?: string | null;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface ReviewState {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  loading: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  reviews: [],
  averageRating: 0,
  totalReviews: 0,
  loading: false,
  error: null,
};

//////////////////////////////////////////////////////////
// ✅ ASYNC THUNKS (FIXED)
//////////////////////////////////////////////////////////

// GET reviews
export const fetchReviews = createAsyncThunk(
  "reviews/fetchReviews",
  async (productId: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/reviews/product/${productId}`);
      return res.data.reviews;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Error fetching reviews");
    }
  }
);

// GET summary
export const fetchRatingSummary = createAsyncThunk(
  "reviews/fetchSummary",
  async (productId: string, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `/api/reviews/product/${productId}/summary`
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Error fetching summary");
    }
  }
);

// CREATE
export const createReview = createAsyncThunk(
  "reviews/createReview",
  async (
    data: { productId: string; title?: string; rating: number; comment: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post(`/api/reviews`, data);
      return res.data.review;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Error creating review");
    }
  }
);

// UPDATE
export const updateReview = createAsyncThunk(
  "reviews/updateReview",
  async (
    { id, data }: { id: string; data: any },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.put(`/api/reviews/${id}`, data);
      return res.data.review;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Error updating review");
    }
  }
);

// DELETE
export const deleteReview = createAsyncThunk(
  "reviews/deleteReview",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/reviews/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Error deleting review");
    }
  }
);

//////////////////////////////////////////////////////////
// SLICE
//////////////////////////////////////////////////////////

const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // SUMMARY
      .addCase(fetchRatingSummary.fulfilled, (state, action) => {
        state.averageRating = action.payload.averageRating;
        state.totalReviews = action.payload.totalReviews;
      })

      // CREATE
      .addCase(createReview.fulfilled, (state, action) => {
        state.reviews.unshift(action.payload);
        state.totalReviews += 1;
      })

      // UPDATE
      .addCase(updateReview.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(
          (r) => r.id === action.payload.id
        );
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
      })

      // DELETE
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(
          (r) => r.id !== action.payload
        );
        state.totalReviews -= 1;
      });
  },
});

export default reviewSlice.reducer;