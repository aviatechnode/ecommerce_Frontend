import axios from "axios";
import { getCsrfToken } from "../lib/csrf";

const API_BASE_URL =
  import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type":
      "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token =
      getCsrfToken();

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