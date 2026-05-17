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
api.interceptors.request.use((config) => {
  const token = getCsrfToken();

  console.log("CSRF TOKEN:", token);

  config.headers = config.headers || {};

  if (token) {
    config.headers["x-csrf-token"] = token;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(
      "RESPONSE CSRF HEADER:",
      response.headers["x-csrf-token"]
    );

    console.log(
      "RESPONSE BODY CSRF:",
      response.data?.csrfToken
    );

    const headerToken =
      response.headers["x-csrf-token"];

    if (headerToken) {
      setCsrfToken(headerToken);
    }

    const bodyToken =
      response.data?.csrfToken;

    if (bodyToken) {
      setCsrfToken(bodyToken);
    }

    return response;
  },
  (error) => {
    console.log(
      "ERROR RESPONSE:",
      error.response?.data
    );

    return Promise.reject(error);
  }
);