import { api } from "../api/axios";

export const productApi = {
  /* ================= GET ================= */
  getProducts: () => api.get("/api/products"),

  getProduct: (id: string) =>
    api.get(`/api/products/${id}`),

  /* ================= CREATE ================= */
  createProduct: (data: any) =>
    api.post("/api/products", data, {
      headers: {
        "Content-Type": "application/json",
      },
    }),

  /* ================= UPDATE ================= */
  updateProduct: (id: string, data: any) =>
    api.put(`/api/products/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    }),

  /* ================= DELETE ================= */
  deleteProduct: (id: string) =>
    api.delete(`/api/products/${id}`),
};