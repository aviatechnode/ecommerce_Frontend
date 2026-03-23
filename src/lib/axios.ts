import axios, { AxiosHeaders } from "axios";

/* =========================================================
   AXIOS INSTANCE
========================================================= */

export const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

/* =========================================================
   CSRF MANAGER (SAFE + NON-SCATTERED)
========================================================= */

class CSRFManager {
  private token: string | null = null;
  private promise: Promise<string> | null = null;

  async getToken(): Promise<string> {
    if (this.token) return this.token;

    if (!this.promise) {
      this.promise = api.get("/api/csrf-token").then((res) => {
        this.token = res.data.csrfToken;
        return this.token!;
      });
    }

    return this.promise;
  }

  clear() {
    this.token = null;
    this.promise = null;
  }
}

const csrf = new CSRFManager();

/* =========================================================
   REQUEST INTERCEPTOR
========================================================= */

api.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();

  /* -----------------------------
     ATTACH ACCESS TOKEN (optional)
  ----------------------------- */
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    if (!config.headers) config.headers = new AxiosHeaders();

    if (config.headers instanceof AxiosHeaders) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  /* -----------------------------
     ATTACH CSRF TOKEN
  ----------------------------- */
  const isAuthRoute = config.url?.includes("/auth/google");

  if (method !== "get" && !isAuthRoute) {
    const token = await csrf.getToken();

    if (!config.headers) config.headers = new AxiosHeaders();

    if (config.headers instanceof AxiosHeaders) {
      config.headers.set("x-csrf-token", token);
    }
  }

  return config;
});

/* =========================================================
   RESPONSE INTERCEPTOR (OPTIONAL BUT POWERFUL)
   → AUTO REFRESH TOKEN
========================================================= */

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // If access token expired → try refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const { data } = await api.post("/api/auth/refresh");

        const newAccessToken = data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);

        // Retry original request
        if (!originalRequest.headers) {
          originalRequest.headers = new AxiosHeaders();
        }

        if (originalRequest.headers instanceof AxiosHeaders) {
          originalRequest.headers.set(
            "Authorization",
            `Bearer ${newAccessToken}`
          );
        }

        return api(originalRequest);
      } catch (err) {
        // Refresh failed → logout
        localStorage.removeItem("accessToken");
        csrf.clear();

        window.location.href = "/auth";
      }
    }

    return Promise.reject(error);
  }
);