// store/hooks.ts
import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./categoryStore";

/* =========================================
   TYPED HOOKS
========================================= */

// use instead of useDispatch
export const useAppDispatch = () => useDispatch<AppDispatch>();

// use instead of useSelector
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;