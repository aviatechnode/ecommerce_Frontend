import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios';

interface FitmentState {
  fitments: any[];
  loading: boolean;
  error: string | null;
}

const initialState: FitmentState = {
  fitments: [],
  loading: false,
  error: null,
};

// Fetch fitments by productId
export const fetchFitments = createAsyncThunk(
  'fitments/fetchFitments',
  async (productId: string) => {
    const response = await api.get(`/api/fitments`, { params: { productId } });
    return response.data.data; // backend returns { success, data }
  }
);

// Create fitment for a specific product
export const createFitment = createAsyncThunk(
  'fitments/createFitment',
  async ({ productId, trimId, notes }: { productId: string; trimId: string; notes?: string }) => {
    const response = await api.post(`/api/fitments/${productId}`, { trimId, notes });
    return response.data.data;
  }
);

// Delete fitment by ID
export const deleteFitment = createAsyncThunk(
  'fitments/deleteFitment',
  async (fitmentId: string) => {
    const response = await api.delete(`/api/fitments/${fitmentId}`);
    return response.data.data.id; // assuming backend returns deleted fitment object
  }
);

const fitmentSlice = createSlice({
  name: 'fitments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFitments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFitments.fulfilled, (state, action) => {
        state.loading = false;
        state.fitments = action.payload;
      })
      .addCase(fetchFitments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch fitments';
      })
      .addCase(createFitment.fulfilled, (state, action) => {
        state.fitments.push(action.payload);
      })
      .addCase(deleteFitment.fulfilled, (state, action) => {
        state.fitments = state.fitments.filter((fitment) => fitment.id !== action.payload);
      });
  }
});

export default fitmentSlice.reducer;