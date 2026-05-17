import { useState, useMemo } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Pencil,
  Trash2,
  UploadCloud,
  Search,
  RefreshCw,
  Plus,
  X,
  Loader2,
} from "lucide-react";

import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  type Category,
} from "../../services/categoryApi";

/* =========================================================
   HELPERS
========================================================= */
const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const generateCode = (text: string) =>
  text.toUpperCase().replace(/\s+/g, "").slice(0, 8) +
  "-" +
  Math.floor(Math.random() * 9999);

/* =========================================================
   CLOUDINARY UPLOAD
========================================================= */
const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  );

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${
      import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    }/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Upload failed");
  }
  return data.secure_url;
};

/* =========================================================
   FORM STATE INTERFACE
========================================================= */
interface CategoryFormState {
  name: string;
  parentId: string | null;
  type: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

const initialFormState: CategoryFormState = {
  name: "",
  parentId: null,
  type: "general",
  description: "",
  imageUrl: "",
  sortOrder: 0,
  isActive: true,
};

/* =========================================================
   COMPONENT
========================================================= */
const AdminCategories = () => {
  const [search, setSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CategoryFormState>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    data: categories = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetCategoriesQuery();

  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();

  const isSubmitting = creating || updating;
  const loading = isLoading || isSubmitting || deleting;

  /* ---------------------------------------------------------
     Filtered categories (search)
  --------------------------------------------------------- */
  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  /* ---------------------------------------------------------
     Form helpers
  --------------------------------------------------------- */
  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
  };

  const handleCloseForm = () => {
    resetForm();
    setShowCreateForm(false);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    return formData.name.trim() !== "";
  };

  /* ---------------------------------------------------------
     Image upload
  --------------------------------------------------------- */
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const imageUrl = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, imageUrl }));
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  /* ---------------------------------------------------------
     Submit (create or update)
  --------------------------------------------------------- */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid()) return;

    const payload = {
      name: formData.name.trim(),
      slug: slugify(formData.name),
      code: generateCode(formData.name),
      type: formData.type,
      description: formData.description || undefined,
      imageUrl: formData.imageUrl || undefined,
      sortOrder: Number(formData.sortOrder) || 0,
      isActive: formData.isActive,
      parentId: formData.parentId || null,
    };

    try {
      if (editingId) {
        await updateCategory({ id: editingId, data: payload }).unwrap();
        alert("Category updated successfully");
      } else {
        await createCategory(payload).unwrap();
        alert("Category created successfully");
      }
      resetForm();
      setShowCreateForm(false);
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to save category");
    }
  };

  /* ---------------------------------------------------------
     Edit
  --------------------------------------------------------- */
  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      parentId: category.parentId ?? null,
      type: category.type || "general",
      description: category.description ?? "",
      imageUrl: category.imageUrl ?? "",
      sortOrder: category.sortOrder ?? 0,
      isActive: category.isActive ?? true,
    });
    setShowCreateForm(true);
    // Smooth scroll to form
    document.getElementById("category-form")?.scrollIntoView({ behavior: "smooth" });
  };

  /* ---------------------------------------------------------
     Delete
  --------------------------------------------------------- */
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this category? This action is permanent.")) return;
    try {
      await deleteCategory(id).unwrap();
      alert("Category deleted successfully");
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to delete category");
    }
  };

  /* ---------------------------------------------------------
     Error message
  --------------------------------------------------------- */
  const errorMessage =
    (error as any)?.data?.message ||
    (error as any)?.error ||
    null;

  /* ---------------------------------------------------------
     Render
  --------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              📁 Category Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Organize your products with hierarchical categories.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {showCreateForm ? <X size={18} /> : <Plus size={18} />}
            {showCreateForm ? "Close Form" : "Add Category"}
          </button>
        </div>

        {/* ERROR BANNER */}
        {errorMessage && (
          <div className="rounded-2xl bg-red-50 p-4 text-red-700">
            ❌ {errorMessage}
          </div>
        )}

        {/* CREATE / EDIT FORM */}
        {showCreateForm && (
          <form
            id="category-form"
            onSubmit={handleSubmit}
            className="space-y-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all lg:p-8"
          >
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingId ? "✏️ Edit Category" : "➕ New Category"}
              </h2>
              <p className="text-sm text-gray-500">
                {editingId
                  ? "Update the category details below."
                  : "Fill in the details to create a new product category."}
              </p>
            </div>

            {/* SECTION 1: BASIC INFO */}
            <div>
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">
                Basic Information
              </h3>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Brake Pads"
                    required
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Parent Category
                  </label>
                  <select
                    name="parentId"
                    value={formData.parentId ?? ""}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                  >
                    <option value="">None (Top Level)</option>
                    {categories
                      .filter((c) => c.id !== editingId)
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                  >
                    <option value="general">General</option>
                    <option value="engine">Engine</option>
                    <option value="brake">Brake</option>
                    <option value="suspension">Suspension</option>
                    <option value="electrical">Electrical</option>
                    <option value="filter">Filter</option>
                    <option value="body">Body</option>
                    <option value="lubricant">Lubricant</option>
                    <option value="transmission">Transmission</option>
                    <option value="drivetrain">Drivetrain</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    name="sortOrder"
                    value={formData.sortOrder}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: IMAGE */}
            <div className="rounded-xl bg-gray-50 p-5">
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">
                🖼️ Category Image
              </h3>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Upload Image
                  </label>
                  <div className="flex items-center gap-3">
                    <UploadCloud size={18} className="text-gray-400" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="block text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-green-700 hover:file:bg-green-100"
                    />
                    {uploading && (
                      <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                        <Loader2 size={14} className="animate-spin" />
                        Uploading...
                      </span>
                    )}
                  </div>
                </div>
                {formData.imageUrl && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Preview</div>
                    <img
                      src={formData.imageUrl}
                      alt="Category preview"
                      className="h-20 w-20 rounded-lg border border-gray-200 object-cover shadow-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 3: DESCRIPTION & STATUS */}
            <div>
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">
                📝 Additional Info
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of the category"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    Active (visible in store)
                  </label>
                </div>
              </div>
            </div>

            {/* FORM ACTIONS */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                type="submit"
                disabled={!isFormValid() || isSubmitting || uploading}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? "✅ Update Category" : "💾 Save Category"}
              </button>
              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ACTION BAR & FILTERS */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-1 flex-wrap gap-3">
            <div className="relative flex-1 min-w-50">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
              />
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-gray-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {isFetching && "🔄 Updating..."}
          </div>
        </div>

        {/* CATEGORIES TABLE */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Parent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Products
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                        <span className="ml-2">Loading categories...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && filteredCategories.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      📂 No categories found. {search ? "Try a different search term." : "Create your first category above."}
                    </td>
                  </tr>
                )}
                {!loading &&
                  filteredCategories.map((category) => {
                    const parent = categories.find((c) => c.id === category.parentId);
                    return (
                      <tr key={category.id} className="transition hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {category.name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                            {category.type}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {parent?.name || "—"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {category._count?.products || 0}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                          <button
                            type="button"
                            onClick={() => handleEdit(category)}
                            className="mr-2 inline-flex items-center gap-1 rounded-md px-3 py-1 text-blue-600 transition hover:bg-blue-50 hover:text-blue-800"
                            title="Edit"
                          >
                            <Pencil size={16} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(category.id)}
                            disabled={deleting}
                            className="inline-flex items-center gap-1 rounded-md px-3 py-1 text-red-600 transition hover:bg-red-50 hover:text-red-800 disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER SUMMARY */}
        <div className="rounded-2xl bg-white p-4 text-center text-sm text-gray-500 shadow-sm">
          🗂️ Total categories:{" "}
          <span className="font-semibold">{filteredCategories.length}</span>
          {search && filteredCategories.length !== categories.length && (
            <span className="ml-2 text-gray-400">
              (filtered from {categories.length})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;