import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";

import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../state-management/categorySlice";

import { Pencil, Trash2, FolderTree, UploadCloud, Search } from "lucide-react";
import type { Category } from "../state-management/categorySlice";

/* ================= HELPERS ================= */

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

const generateCode = (text: string) =>
  text.toUpperCase().replace(/\s+/g, "").slice(0, 8) +
  "-" +
  Math.floor(Math.random() * 9999);

/* ================= CLOUDINARY ================= */

const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Upload failed");

  return data.secure_url;
};

/* ================= COMPONENT ================= */

const AdminCategories = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading, error } = useSelector(
    (state: RootState) => state.categories
  );

  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    parentId: null as string | null,
    type: "general",
    description: "",
    imageUrl: "",
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  const resetForm = () => {
    setForm({
      name: "",
      parentId: null,
      type: "general",
      description: "",
      imageUrl: "",
      sortOrder: 0,
      isActive: true,
    });
    setEditingId(null);
  };

  /* ================= ACTIONS ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) return;

    const payload = {
      name: form.name.trim(),
      slug: slugify(form.name),
      code: generateCode(form.name),
      type: form.type,
      description: form.description || undefined,
      imageUrl: form.imageUrl || undefined,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
      parentId: form.parentId || null,
    };

    if (editingId) {
      await dispatch(updateCategory({ id: editingId, data: payload }));
    } else {
      await dispatch(createCategory(payload));
    }

    resetForm();
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      parentId: cat.parentId ?? null,
      type: cat.type,
      description: cat.description ?? "",
      imageUrl: cat.imageUrl ?? "",
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("This will permanently delete the category.")) return;
    await dispatch(deleteCategory(id));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="bg-green-600 p-2 rounded-lg text-white">
          <FolderTree size={20} />
        </div>
        <h1 className="text-2xl font-bold">Category Management</h1>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-sm border space-y-5"
      >
        <h2 className="font-semibold text-gray-800">
          {editingId ? "Edit Category" : "Create New Category"}
        </h2>

        {/* NAME */}
        <div>
          <label className="text-sm font-medium">Category Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded-lg w-full mt-1"
            placeholder="e.g. Brake Pads"
          />
        </div>

        {/* PARENT + TYPE */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Parent Category</label>
            <select
              value={form.parentId ?? ""}
              onChange={(e) =>
                setForm({ ...form, parentId: e.target.value || null })
              }
              className="border p-2 rounded-lg w-full mt-1"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Type</label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value })
              }
              className="border p-2 rounded-lg w-full mt-1"
            >
              <option value="general">General</option>
              <option value="engine">Engine</option>
              <option value="brake">Brake</option>
              <option value="suspension">Suspension</option>
              <option value="electrical">Electrical</option>
              <option value="filter">Filter</option>
              <option value="body">Body</option>
            </select>
          </div>
        </div>

        {/* IMAGE */}
        <div>
          <label className="text-sm font-medium">Category Image</label>
          <div className="flex items-center gap-3 mt-1">
            <UploadCloud size={18} />
            <input type="file" onChange={handleImageUpload} />
            {uploading && <span className="text-sm">Uploading...</span>}
          </div>

          {form.imageUrl && (
            <img
              src={form.imageUrl}
              className="w-24 h-24 object-cover rounded mt-3 border"
            />
          )}
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="border p-2 rounded-lg w-full mt-1"
            rows={3}
          />
        </div>

        {/* SORT + ACTIVE */}
        <div className="flex items-center justify-between">
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) =>
              setForm({ ...form, sortOrder: Number(e.target.value) })
            }
            className="border p-2 rounded-lg w-32"
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm({ ...form, isActive: e.target.checked })
              }
            />
            Active
          </label>
        </div>

        <div className="flex gap-3">
          <button
            disabled={loading || uploading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {editingId ? "Update Category" : "Create Category"}
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

      {/* SEARCH */}
      <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
        <Search size={16} />
        <input
          placeholder="Search categories..."
          className="w-full outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading categories...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No categories found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Parent</th>
                <th className="p-3">Products</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.map((cat) => {
                const parent = categories.find(
                  (c) => c.id === cat.parentId
                );

                return (
                  <tr key={cat.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{cat.name}</td>
                    <td className="p-3">{cat.type}</td>
                    <td className="p-3">{parent?.name || "-"}</td>
                    <td className="p-3">{cat._count?.products || 0}</td>

                    <td className="p-3 text-right flex justify-end gap-3">
                      <button onClick={() => handleEdit(cat)}>
                        <Pencil size={16} />
                      </button>

                      <button onClick={() => handleDelete(cat.id)}>
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;