import axios from "axios";
import { getCsrfToken } from "../lib/csrf";



const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// attach CSRF before every request
api.interceptors.request.use((config) => {
  const token = getCsrfToken();

  if (token) {
    config.headers["x-csrf-token"] = token;
  }

  return config;
});