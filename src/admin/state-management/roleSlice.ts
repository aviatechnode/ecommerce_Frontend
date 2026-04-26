// state-management/roleSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

export type Role = {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
};

type RoleState = {
  roles: Role[];
  loading: boolean;
  error: string | null;
};

const initialState: RoleState = {
  roles: [],
  loading: false,
  error: null,
};

/* ================= FETCH ================= */
export const fetchRoles = createAsyncThunk(
  "roles/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/admin/rbac/roles");
      return res.data as Role[];
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || "Failed to load roles");
    }
  }
);

/* ================= DELETE ================= */
export const deleteRole = createAsyncThunk(
  "roles/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/rbac/roles/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || "Delete failed");
    }
  }
);

/* ================= SLICE ================= */
const roleSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      /* FETCH */
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* DELETE */
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter((r) => r.id !== action.payload);
      });
  },
});

export default roleSlice.reducer;