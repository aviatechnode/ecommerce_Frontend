import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

let csrfToken: string | null = null;

// Fetch CSRF token
export const initCSRF = async () => {
  try {
    const res = await api.get("/api/csrf-token");
    csrfToken = res.data.csrfToken;
  } catch (err) {
    console.error("Failed to fetch CSRF token", err);
  }
};

// Attach CSRF automatically
api.interceptors.request.use((config) => {
if (csrfToken && config.method?.toLowerCase() !== "get") {
    config.headers["x-csrf-token"] = csrfToken;
  }
  return config;
});