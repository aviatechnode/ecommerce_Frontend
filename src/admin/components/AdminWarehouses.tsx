// src/admin/pages/AdminWarehouses.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchWarehouses } from "../state-management/warehouseSlice";
import { api } from "../../api/axios";

import type { RootState, AppDispatch } from "../store/store";

import { Pencil, Trash2, Warehouse, Loader2 } from "lucide-react";
import { NIGERIAN_STATES } from "../constants/nigerianStates";

const AdminWarehouses = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { warehouses, loading, error } = useSelector(
    (state: RootState) => state.warehouses
  );

  const [form, setForm] = useState({
    name: "",
    state: "",
    city: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchWarehouses());
  }, [dispatch]);

  const resetForm = () => {
    setForm({ name: "", state: "", city: "" });
    setEditingId(null);
  };

  const isFormValid = form.name && form.state && form.city;

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    try {
      setSubmitting(true);

      if (editingId) {
        await api.put(`/api/warehouses/${editingId}`, form);
      } else {
        await api.post(`/api/warehouses`, form);
      }

      dispatch(fetchWarehouses());
      resetForm();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (w: any) => {
    setEditingId(w.id);
    setForm({
      name: w.name,
      state: w.state,
      city: w.city,
    });
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this warehouse?"
    );
    if (!confirmed) return;

    try {
      await api.delete(`/api/warehouses/${id}`);
      dispatch(fetchWarehouses());
    } catch (err: any) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="bg-green-600 p-2 rounded-lg text-white">
          <Warehouse size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Warehouse Management</h1>
          <p className="text-sm text-gray-500">
            Create and manage warehouse locations
          </p>
        </div>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-5 rounded-xl border shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">
            {editingId ? "Edit Warehouse" : "Add New Warehouse"}
          </h2>

          {editingId && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
              Editing Mode
            </span>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">

          {/* NAME */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Warehouse Name</label>
            <input
              placeholder="e.g. Lagos Main Warehouse"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="border p-2 rounded w-full focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>

          {/* STATE */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">State</label>
            <select
              value={form.state}
              onChange={(e) =>
                setForm({ ...form, state: e.target.value })
              }
              className="border p-2 rounded w-full focus:ring-2 focus:ring-green-500 outline-none"
              required
            >
              <option value="">Select State</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {/* CITY */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">City</label>
            <input
              placeholder="e.g. Ikeja"
              value={form.city}
              onChange={(e) =>
                setForm({ ...form, city: e.target.value })
              }
              className="border p-2 rounded w-full focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2">
          <button
            disabled={!isFormValid || submitting}
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
          >
            {submitting && <Loader2 className="animate-spin" size={16} />}
            {editingId ? "Update Warehouse" : "Create Warehouse"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="border px-4 py-2 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* TABLE */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

        {/* TABLE HEADER */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-gray-700">
            All Warehouses
          </h2>
          <span className="text-sm text-gray-500">
            {warehouses.length} total
          </span>
        </div>

        {/* STATES */}
        {loading ? (
          <div className="p-6 flex items-center gap-2 text-gray-500">
            <Loader2 className="animate-spin" size={18} />
            Loading warehouses...
          </div>
        ) : error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : warehouses.length === 0 ? (
          <div className="p-6 text-gray-500 text-center">
            No warehouses found. Create one above.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">State</th>
                <th className="p-3 text-left">City</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {warehouses.map((w: any) => (
                <tr
                  key={w.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium">{w.name}</td>
                  <td className="p-3">{w.state}</td>
                  <td className="p-3">{w.city}</td>

                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(w)}
                      className="p-1 rounded hover:bg-blue-50 text-blue-600"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(w.id)}
                      className="p-1 rounded hover:bg-red-50 text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminWarehouses;