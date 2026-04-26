import { api } from "../api/axios";
import { setCsrfToken } from "./csrf";
import axios from "axios";

let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];

const processQueue = (token: string | null) => {
  queue.forEach((cb) => cb(token));
  queue = [];
};

api.interceptors.response.use(
  (response) => {
    // ✅ capture rotated CSRF token
    const newToken = response.headers["x-csrf-token"];
    if (newToken) {
      setCsrfToken(newToken);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // ❌ only retry once
    if (error.response?.status !== 403 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // 🚫 queue requests while refreshing
    if (isRefreshing) {
      return new Promise((resolve) => {
        queue.push((token) => {
          if (token) {
            originalRequest.headers["x-csrf-token"] = token;
          }
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/refresh`,
        {},
        { withCredentials: true }
      );

      const newCsrf = res.data.csrfToken;

      if (newCsrf) {
        setCsrfToken(newCsrf);
      }

      processQueue(newCsrf);

      originalRequest.headers["x-csrf-token"] = newCsrf;

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(null);

      // 🔥 session is dead → redirect
      window.location.href = "/login";

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);