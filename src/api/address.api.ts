import { api } from "../api/axios";

/* =========================================================
ADDRESS API
========================================================= */

export const addressApi = {
  create: (data: any) => api.post("/address", data),

  getAll: () => api.get("/address"),

  getOne: (id: string) => api.get(`/address/${id}`),

  update: (id: string, data: any) =>
    api.patch(`/address/${id}`, data),

  remove: (id: string) => api.delete(`/address/${id}`),

  setDefault: (id: string) =>
    api.patch(`/address/${id}/default`),
};