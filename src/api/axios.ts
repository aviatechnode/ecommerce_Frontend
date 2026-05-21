import axios from "axios";
import { getCsrfToken, setCsrfToken } from "../lib/csrf";



const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// attach CSRF before every request
api.interceptors.request.use(
  async (config) => {
    const unsafeMethods = [
      "post",
      "put",
      "patch",
      "delete",
    ];

    const method =
      config.method?.toLowerCase();

    let token = getCsrfToken();

    const needsCsrf =
      unsafeMethods.includes(
        method || ""
      );

    if (needsCsrf && !token) {
      try {
        const response =
          await axios.get(
            `${API_BASE_URL}/api/auth/csrf`,
            {
              withCredentials: true,
            }
          );

        token =
          response.data.csrfToken;

        setCsrfToken(token);
      } catch (err) {
        console.error(
          "Failed to fetch CSRF",
          err
        );
      }
    }

    config.headers =
      config.headers || {};

    if (token) {
      config.headers[
        "x-csrf-token"
      ] = token;
    }

    return config;
  }
);