import { configureStore } from "@reduxjs/toolkit";

import roleReducer from "../state-management/roleSlice";
import categoryReducer from "../state-management/categorySlice";
import productReducer from "../state-management/productSlice";
import brandReducer from "../state-management/brandSlice"
import warehouseReducer from "../state-management/warehouseSlice"
import fitmentReducer from "../state-management/fitmentSlice"
import cartReducer from "../state-management/cartSlice"
import wishlistReducer from "../state-management/wishlistSlice"
export const store = configureStore({
  reducer: {
    roles: roleReducer,
    categories: categoryReducer,
    adminProducts: productReducer,
    brands: brandReducer,
    warehouses: warehouseReducer,
    fitments: fitmentReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;