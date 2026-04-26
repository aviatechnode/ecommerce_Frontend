import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";

import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../state-management/categorySlice";

import { buildTree } from "../utils/categoryTree";
import CategoryTreeItem from "../components/CategoryTreeItem";

import { DndContext, closestCenter } from "@dnd-kit/core";
import { Pencil, Trash2, FolderTree } from "lucide-react";

const AdminCategories = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { categories, loading, error } = useSelector(
    (state: RootState) => state.categories
  );

  const [form, setForm] = useState({
    name: "",
    parentId: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const tree = buildTree(categories);

  const resetForm = () => {
    setForm({ name: "", parentId: "" });
    setEditingId(null);
  };

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = form.name.trim();
    if (!name) return;

    const payload: any = { name };

    if (form.parentId) {
      payload.parentId = form.parentId;
    }

    if (editingId) {
      await dispatch(updateCategory({ id: editingId, data: payload }));
    } else {
      await dispatch(createCategory(payload));
    }

    resetForm();
  };

  /* ================= DRAG ================= */
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    await dispatch(
      updateCategory({
        id: active.id,
        data: {
          parentId: over.id,
        },
      })
    );
  };

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      parentId: cat.parentId || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this category?")) {
      await dispatch(deleteCategory(id));
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="bg-green-600 p-2 rounded-lg text-white">
          <FolderTree size={20} />
        </div>
        <h1 className="text-2xl font-bold">Category Management</h1>
      </div>

      {/* ================= FORM ================= */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-5 rounded-2xl shadow-sm border space-y-4"
      >
        <h2 className="font-semibold text-gray-700">
          {editingId ? "Edit Category" : "Create Category"}
        </h2>

        <div className="grid md:grid-cols-3 gap-4">

          <input
            placeholder="Category Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="border p-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            required
          />

          <select
            value={form.parentId || ""}
            onChange={(e) =>
              setForm({ ...form, parentId: e.target.value })
            }
            className="border p-2 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">No Parent</option>

            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full">
              {editingId ? "Update" : "Create"}
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
          Categories Table
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Parent</th>
                <th className="p-3">Products</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((cat) => {
                const parent = categories.find(
                  (c) => c.id === cat.parentId
                );

                return (
                  <tr
                    key={cat.id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-3 font-medium">{cat.name}</td>

                    <td className="p-3 text-gray-500">
                      {cat.slug}
                    </td>

                    <td className="p-3">
                      {parent ? parent.name : "-"}
                    </td>

                    <td className="p-3">
                      {cat._count?.products || 0}
                    </td>

                    <td className="p-3">
                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-2 rounded hover:bg-gray-100"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 rounded hover:bg-red-50 text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>

      {/* ================= TREE ================= */}
      <div className="bg-white rounded-2xl shadow-sm border p-4">
        <div className="font-semibold mb-3">Category Tree</div>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {tree.map((node: any) => (
            <CategoryTreeItem
              key={node.id}
              node={node}
              depth={0}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </DndContext>
      </div>

    </div>
  );
};

export default AdminCategories;