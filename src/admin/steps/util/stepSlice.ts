import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface StepState {
  value: number;
}

const initialState: StepState = {
  value: 1,
};

const stepSlice = createSlice({
  name: 'step',
  initialState,
  reducers: {
    nextStep: (state) => {
      state.value = Math.min(7, state.value + 1);
    },
    prevStep: (state) => {
      state.value = Math.max(1, state.value - 1);
    },
    goToStep: (state, action: PayloadAction<number>) => {
      state.value = Math.min(7, Math.max(1, action.payload));
    },
    resetStep: (state) => {
      state.value = 1;
    },
  },
});

export const { nextStep, prevStep, goToStep, resetStep } = stepSlice.actions;
export default stepSlice.reducer;