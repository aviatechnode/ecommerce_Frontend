// src/admin/pages/AdminBrands.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "../store/store";

import {
  fetchBrands,
} from "../state-management/brandSlice";



import { Pencil, Trash2, Tag } from "lucide-react";
import { api } from "../../api/axios";

const AdminBrands = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { brands, loading, error } = useSelector(
    (state: RootState) => state.brands
  );

  const [form, setForm] = useState({
    name: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  /* ================= RESET ================= */
  const resetForm = () => {
    setForm({ name: "" });
    setEditingId(null);
  };

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = form.name.trim();
    if (!name) return;

    try {
      setSubmitting(true);

      if (editingId) {
        await api.put(`/api/brands/${editingId}`, { name });
      } else {
        await api.post(`/api/brands`, { name });
      }

      await dispatch(fetchBrands());
      resetForm();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (brand: any) => {
    setEditingId(brand.id);
    setForm({ name: brand.name });
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this brand?")) return;

    try {
      await api.delete(`/api/brands/${id}`);
      dispatch(fetchBrands());
    } catch (err: any) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="bg-green-600 p-2 rounded-lg text-white">
          <Tag size={20} />
        </div>
        <h1 className="text-2xl font-bold">Brand Management</h1>
      </div>

      {/* ================= FORM ================= */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-5 rounded-2xl shadow-sm border space-y-4"
      >
        <h2 className="font-semibold text-gray-700">
          {editingId ? "Edit Brand" : "Create Brand"}
        </h2>

        <div className="flex gap-3">

          <input
            placeholder="Brand Name"
            value={form.name}
            onChange={(e) =>
              setForm({ name: e.target.value })
            }
            className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-green-500 outline-none"
            required
          />

          <div className="flex gap-2">

            <button
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              {submitting
                ? "Processing..."
                : editingId
                ? "Update"
                : "Create"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="border px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            )}

          </div>

        </div>
      </form>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

        <div className="p-4 border-b font-semibold">
          Brands Table
        </div>

        {loading && <p className="p-4">Loading...</p>}
        {error && <p className="p-4 text-red-500">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Products</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {brands.map((brand: any) => (
                <tr
                  key={brand.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-3 font-medium">
                    {brand.name}
                  </td>

                  <td className="p-3 text-gray-500">
                    {brand.slug}
                  </td>

                  <td className="p-3">
                    {brand._count?.products || 0}
                  </td>

                  <td className="p-3">
                    <div className="flex justify-end gap-2">

                      <button
                        onClick={() => handleEdit(brand)}
                        className="p-2 rounded hover:bg-gray-100"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(brand.id)}
                        className="p-2 rounded hover:bg-red-50 text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}

              {!loading && brands.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center p-6 text-gray-400"
                  >
                    No brands found
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

      </div>

    </div>
  );
};

export default AdminBrands;