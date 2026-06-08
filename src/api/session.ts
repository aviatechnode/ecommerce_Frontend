import { authApi } from "../services/authApi";

export const bootstrapAuth = async (dispatch: any) => {
  try {
    const hasCookie = document.cookie.includes("refreshToken");

    if (!hasCookie) return;

    await dispatch(authApi.endpoints.refresh.initiate());
  } catch {}
};