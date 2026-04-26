import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

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

// Fetch fitments
export const fetchFitments = createAsyncThunk('fitments/fetchFitments', async () => {
  const response = await axios.get('/api/fitments');
  return response.data;
});

// Create fitment
export const createFitment = createAsyncThunk(
  'fitments/createFitment',
  async (data: any) => {
    const response = await axios.post('/api/fitments', data);
    return response.data;
  }
);

// Update fitment
export const updateFitment = createAsyncThunk(
  'fitments/updateFitment',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await axios.put(`/api/fitments/${id}`, data);
    return response.data;
  }
);

// Delete fitment
export const deleteFitment = createAsyncThunk(
  'fitments/deleteFitment',
  async (id: string) => {
    await axios.delete(`/api/fitments/${id}`);
    return id;
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
      .addCase(updateFitment.fulfilled, (state, action) => {
        const index = state.fitments.findIndex((fitment) => fitment.id === action.payload.id);
        if (index >= 0) {
          state.fitments[index] = action.payload;
        }
      })
      .addCase(deleteFitment.fulfilled, (state, action) => {
        state.fitments = state.fitments.filter((fitment) => fitment.id !== action.payload);
      });
  }
});

export default fitmentSlice.reducer;