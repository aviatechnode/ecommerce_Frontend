// src/api/product.api.ts
import { api } from "../api/axios";

export const productApi = {
  getProducts: () => api.get("/api/products"),
  getProduct: (id: string) => api.get(`/api/products/${id}`),

  createProduct: (formData: FormData) =>
    api.post("/api/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateProduct: (id: string, formData: FormData) =>
    api.put(`/api/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteProduct: (id: string) =>
    api.delete(`/api/products/${id}`),
};