// store/selectors.ts
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./store";

/* SAFE BASE SELECTOR */
export const selectRoles = (state: RootState) =>
  state.roles?.roles ?? [];

export const selectRoleLoading = (state: RootState) =>
  state.roles?.loading ?? false;

/* FLAT OUTPUT (NO TREE LOGIC) */
export const selectRoleList = createSelector(
  [selectRoles],
  (roles) => roles
);