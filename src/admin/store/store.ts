import { shipmentApi } from './../../services/shipmentApi';
import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";

/* ================= EXISTING SLICES ================= */

import roleReducer from "../state-management/roleSlice";
/* ================= RTK QUERY ================= */

import { checkoutApi } from "../../services/checkoutApi";
import { locationApi } from "../../services/locationApi";
import { authApi } from "../../services/authApi";
import { adminApi } from "../../services/adminApi";
import { categoryApi } from "../../services/categoryApi";
import { couponApi } from "../../services/couponApi";
import { warehouseApi } from "../../services/warehouseApi";
import { brandApi } from "../../services/brandApi";
import { productApi } from "../../services/productApi";
import { cartApi } from "../../services/cartApi";
import { wishlistApi } from "../../services/wishlistApi";
import { reviewApi } from "../../services/reviewApi";
import { addressApi } from "../../services/addressApi";
import { feedbackApi } from '../../services/feedbackApi';
import { auditLogApi } from '../../services/auditLogApi';
import { fitmentApi } from '../../services/fitmentApi';
import { shippingRateApi } from '../../services/shippingRateApi';
import { courierApi } from '../../services/courierApi';
import { shippingZoneApi } from '../../services/shippingZoneApi';
import { pickupStationApi } from '../../services/pickupStationApi';
import stepReducer from '../../admin/steps/util/stepSlice';

/* ================= STORE ================= */

export const store = configureStore({
  reducer: {
    roles: roleReducer,
     step: stepReducer,
    
    /* RTK Query reducers */
    [authApi.reducerPath]: authApi.reducer,
    [checkoutApi.reducerPath]: checkoutApi.reducer,
    [locationApi.reducerPath]: locationApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [couponApi.reducerPath]: couponApi.reducer,
    [warehouseApi.reducerPath]:warehouseApi.reducer,
    [brandApi.reducerPath]: brandApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [wishlistApi.reducerPath]: wishlistApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [addressApi.reducerPath]: addressApi.reducer,
    [feedbackApi.reducerPath]: feedbackApi.reducer,
    [auditLogApi.reducerPath]: auditLogApi.reducer,
    [fitmentApi.reducerPath]: fitmentApi.reducer,
    [shippingRateApi.reducerPath]: shippingRateApi.reducer,
    [courierApi.reducerPath]:courierApi.reducer,
    [shippingZoneApi.reducerPath]: shippingZoneApi.reducer,
    [pickupStationApi.reducerPath]: pickupStationApi.reducer,
    [shipmentApi.reducerPath]: shipmentApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      checkoutApi.middleware,
      locationApi.middleware,
      authApi.middleware,
      adminApi.middleware,
      categoryApi.middleware,
      couponApi.middleware,
      warehouseApi.middleware,
      brandApi.middleware,
      productApi.middleware,
      cartApi.middleware,
      wishlistApi.middleware,
      reviewApi.middleware,
      addressApi.middleware,
      feedbackApi.middleware,
      auditLogApi.middleware,
      fitmentApi.middleware,
      shippingRateApi.middleware,
      courierApi.middleware,
      shippingZoneApi.middleware,
      pickupStationApi.middleware,
      shipmentApi.middleware,
    ),
});

/* ================= TYPES ================= */

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/* ================= HOOK ================= */

export const useAppDispatch = () => useDispatch<AppDispatch>();