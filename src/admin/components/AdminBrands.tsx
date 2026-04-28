// src/admin/pages/AdminBrands.tsx
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "../store/store";

import { fetchBrands } from "../state-management/brandSlice";

import { Pencil, Trash2, Tag, Search } from "lucide-react";
import { api } from "../../api/axios";

const AdminBrands = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { brands, loading, error } = useSelector(
    (state: RootState) => state.brands
  );

  const [form, setForm] = useState({ name: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  /* ================= FETCH ================= */
  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  /* ================= FILTER ================= */
  const filteredBrands = useMemo(() => {
    return brands.filter((b: any) =>
      b.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [brands, search]);

  /* ================= RESET ================= */
  const resetForm = () => {
    setForm({ name: "" });
    setEditingId(null);
  };

  /* ================= SUBMIT ================= */
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

    // UX improvement: bring form into view
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id: string) => {
    if (!confirm("This will permanently delete the brand.")) return;

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

      {/* ERROR */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      {/* ================= FORM ================= */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-sm border space-y-4"
      >
        <h2 className="font-semibold text-gray-800">
          {editingId ? "Edit Brand" : "Create New Brand"}
        </h2>

        <div>
          <label className="text-sm font-medium">Brand Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ name: e.target.value })}
            className="border p-2 rounded-lg w-full mt-1 focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="e.g. Toyota"
          />
        </div>

        <div className="flex gap-3">
          <button
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {submitting
              ? "Processing..."
              : editingId
              ? "Update Brand"
              : "Create Brand"}
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
      </form>

      {/* ================= SEARCH ================= */}
      <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
        <Search size={16} />
        <input
          placeholder="Search brands..."
          className="w-full outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

        <div className="p-4 border-b font-semibold">
          Brands
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading brands...
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No brands found
          </div>
        ) : (
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
                {filteredBrands.map((brand: any) => (
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
              </tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBrands;