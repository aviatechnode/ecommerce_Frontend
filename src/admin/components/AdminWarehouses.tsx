// src/admin/pages/AdminWarehouses.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchWarehouses } from "../state-management/warehouseSlice";
import { api } from "../../api/axios";

import type { RootState, AppDispatch } from "../store/store";

import { Pencil, Trash2, Warehouse } from "lucide-react";
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

  useEffect(() => {
    dispatch(fetchWarehouses());
  }, [dispatch]);

  const resetForm = () => {
    setForm({ name: "", state: "", city: "" });
    setEditingId(null);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(`/api/warehouses/${editingId}`, form);
      } else {
        await api.post(`/api/warehouses`, form);
      }

      dispatch(fetchWarehouses());
      resetForm();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error");
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
    if (!confirm("Delete warehouse?")) return;

    await api.delete(`/api/warehouses/${id}`);
    dispatch(fetchWarehouses());
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="bg-green-600 p-2 rounded-lg text-white">
          <Warehouse size={20} />
        </div>
        <h1 className="text-2xl font-bold">Warehouse Management</h1>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border space-y-4">

        <div className="grid md:grid-cols-3 gap-4">

          <input
            placeholder="Warehouse Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded"
            required
          />

          <select
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            className="border p-2 rounded"
            required
          >
            <option value="">Select State</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>

          <input
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="border p-2 rounded"
            required
          />

        </div>

        <div className="flex gap-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded">
            {editingId ? "Update" : "Create"}
          </button>

          {editingId && (
            <button type="button" onClick={resetForm} className="border px-4 py-2 rounded">
              Cancel
            </button>
          )}
        </div>

      </form>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">State</th>
              <th className="p-3">City</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {warehouses.map((w: any) => (
              <tr key={w.id} className="border-t">
                <td className="p-3">{w.name}</td>
                <td className="p-3">{w.state}</td>
                <td className="p-3">{w.city}</td>

                <td className="p-3 text-right">
                  <button onClick={() => handleEdit(w)} className="mr-2">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(w.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && <p className="p-4">Loading...</p>}
        {error && <p className="p-4 text-red-500">{error}</p>}
      </div>

    </div>
  );
};

export default AdminWarehouses;