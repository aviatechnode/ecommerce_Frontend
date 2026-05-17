// // store/store.ts
// import { configureStore } from "@reduxjs/toolkit";
// import roleReducer from "../state-management/roleSlice";

// /* =========================================================
//    STORE
// ========================================================= */

// export const store = configureStore({
//   reducer: {
//     roles: roleReducer,
//   },

//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: false, // safer for axios/prisma-like payloads
//     }),
// });

// /* =========================================================
//    TYPES (CRITICAL)
// ========================================================= */

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;