import { configureStore } from "@reduxjs/toolkit";

import roleReducer from "../state-management/roleSlice";
import categoryReducer from "../state-management/categorySlice";
import productReducer from "../state-management/productSlice";
import brandReducer from "../state-management/brandSlice"
import warehouseReducer from "../state-management/warehouseSlice"
import fitmentReducer from "../state-management/fitmentSlice"
import cartReducer from "../state-management/cartSlice"
import wishlistReducer from "../state-management/wishlistSlice"
import reviewsReducer from "../state-management/reviewSlice"
import addressReducer from "../state-management/address.slice"
import checkoutReducer from "../state-management/checkoutSlice"
import { useDispatch } from "react-redux";

export const useAppDispatch: () => AppDispatch = useDispatch;

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
    reviews: reviewsReducer,
    address: addressReducer,
    checkout: checkoutReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;