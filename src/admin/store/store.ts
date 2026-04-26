import { configureStore } from "@reduxjs/toolkit";

import roleReducer from "../state-management/roleSlice";
import categoryReducer from "../state-management/categorySlice";
import productReducer from "../state-management/productSlice";
import brandReducer from "../state-management/brandSlice"
import warehouseReducer from "../state-management/warehouseSlice"
export const store = configureStore({
  reducer: {
    roles: roleReducer,
    categories: categoryReducer,
    products: productReducer,
    brands: brandReducer,
    warehouses: warehouseReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;