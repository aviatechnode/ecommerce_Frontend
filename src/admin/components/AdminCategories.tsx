import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { ChangeEvent } from "react";

// ---------- Mixed icon imports ----------
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaSave,
  FaCheckCircle,
  FaFolderOpen,
} from "react-icons/fa";
import { FiUploadCloud, FiImage, FiFileText } from "react-icons/fi";
import { IoReload, IoAdd, IoClose } from "react-icons/io5";
import { ImSpinner2 } from "react-icons/im";
import { MdError } from "react-icons/md";

import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  type Category,
} from "../../services/categoryApi";

// =========================================================
// HELPERS
// =========================================================
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
    { method: "POST", body: formData }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Upload failed");
  return data.secure_url;
};

// =========================================================
// FORM STATE INTERFACE
// =========================================================
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

const INITIAL_VISIBLE_COUNT = 8; // Load 8 items initially
const LOAD_MORE_COUNT = 6; // Load 6 more each time user scrolls

// =========================================================
// COMPONENT
// =========================================================
const AdminCategories = () => {
  // ---------- Data fetching (all categories at once) ----------
  const {
    data: allCategories = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetCategoriesQuery();

  // ---------- UI state ----------
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CategoryFormState>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const tableBodyRef = useRef<HTMLTableSectionElement | null>(null);

  // ---------- Mutations ----------
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();

  const isSubmitting = creating || updating;
  
  // ---------- Filtered categories (search applied to full list) ----------
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return allCategories;
    return allCategories.filter((category) =>
      category.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [allCategories, search]);

  // ---------- Visible slice (incremental loading) ----------
  const visibleCategories = useMemo(() => {
    return filteredCategories.slice(0, visibleCount);
  }, [filteredCategories, visibleCount]);

  const hasMore = visibleCount < filteredCategories.length;

  // ---------- Reset visible count when search changes ----------
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    // Scroll back to top when searching
    if (tableBodyRef.current) {
      tableBodyRef.current.parentElement?.parentElement?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [search]);

  // ---------- Load more categories ----------
  const handleLoadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, filteredCategories.length));
    }
  }, [isFetching, hasMore, filteredCategories.length]);

  // ---------- Infinite scroll with Intersection Observer ----------
  useEffect(() => {
    if (!sentinelRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          handleLoadMore();
        }
      },
      { 
        threshold: 0.1, // Trigger when 10% of sentinel is visible
        rootMargin: "0px 0px 200px 0px" // Load 200px before reaching the end
      }
    );
    
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [handleLoadMore, hasMore, isFetching]);

  // ---------- Form handlers ----------
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

  const isFormValid = () => formData.name.trim() !== "";

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      setVisibleCount(INITIAL_VISIBLE_COUNT);
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to save category");
    }
  };

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
    document.getElementById("category-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this category? This action is permanent.")) return;
    try {
      await deleteCategory(id).unwrap();
      alert("Category deleted successfully");
      setVisibleCount(INITIAL_VISIBLE_COUNT);
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to delete category");
    }
  };

  const errorMessage = (error as any)?.data?.message || (error as any)?.error || null;

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <FaFolderOpen className="text-green-600 text-4xl" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Category Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Organize your products with hierarchical categories.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {showCreateForm ? <IoClose size={18} /> : <IoAdd size={18} />}
            {showCreateForm ? "Close Form" : "Add Category"}
          </button>
        </div>

        {/* ERROR BANNER */}
        {errorMessage && (
          <div className="rounded-2xl bg-red-50 p-4 text-red-700 flex items-center gap-2">
            <MdError size={20} />
            {errorMessage}
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
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                {editingId ? <FaEdit size={20} /> : <IoAdd size={20} />}
                {editingId ? "Edit Category" : "New Category"}
              </h2>
              <p className="text-sm text-gray-500">
                {editingId
                  ? "Update the category details below."
                  : "Fill in the details to create a new product category."}
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500 flex items-center gap-2">
                <FiFileText size={14} />
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
                    {allCategories
                      .filter((c) => c.id !== editingId)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
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
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
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

            {/* Image upload */}
            <div className="rounded-xl bg-gray-50 p-5">
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500 flex items-center gap-2">
                <FiImage size={14} />
                Category Image
              </h3>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Upload Image
                  </label>
                  <div className="flex items-center gap-3">
                    <FiUploadCloud size={18} className="text-gray-400" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="block text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-green-700 hover:file:bg-green-100"
                    />
                    {uploading && (
                      <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                        <ImSpinner2 size={14} className="animate-spin" />
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

            {/* Additional Info */}
            <div>
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500 flex items-center gap-2">
                <FiFileText size={14} />
                Additional Info
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

            {/* Form Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                type="submit"
                disabled={!isFormValid() || isSubmitting || uploading}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting && <ImSpinner2 className="h-4 w-4 animate-spin" />}
                {editingId ? (
                  <>
                    <FaCheckCircle size={16} />
                    Update Category
                  </>
                ) : (
                  <>
                    <FaSave size={16} />
                    Save Category
                  </>
                )}
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

        {/* ACTION BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-1 flex-wrap gap-3">
            <div className="relative flex-1 min-w-50">
              <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
              onClick={() => {
                setVisibleCount(INITIAL_VISIBLE_COUNT);
                refetch();
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-gray-50"
            >
              <IoReload size={16} />
              Refresh
            </button>
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            {isFetching && (
              <>
                <ImSpinner2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            )}
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
              <tbody ref={tableBodyRef} className="divide-y divide-gray-100 bg-white">
                {isLoading && !allCategories.length ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      <div className="flex justify-center items-center gap-2">
                        <ImSpinner2 className="h-6 w-6 animate-spin text-green-600" />
                        <span>Loading categories...</span>
                      </div>
                    </td>
                  </tr>
                ) : visibleCategories.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      <div className="flex justify-center items-center gap-2">
                        <FaFolderOpen size={20} />
                        No categories found.{" "}
                        {search ? "Try a different search term." : "Create your first category above."}
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {visibleCategories.map((category) => {
                      const parent = allCategories.find((c) => c.id === category.parentId);
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
                              <FaEdit size={16} />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(category.id)}
                              disabled={deleting}
                              className="inline-flex items-center gap-1 rounded-md px-3 py-1 text-red-600 transition hover:bg-red-50 hover:text-red-800 disabled:opacity-50"
                              title="Delete"
                            >
                              <FaTrash size={16} />
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Infinite Scroll Sentinel */}
          {hasMore && !isLoading && (
            <div ref={sentinelRef} className="px-6 py-4 text-center border-t border-gray-100">
              {isFetching ? (
                <div className="flex justify-center items-center gap-2 text-gray-500">
                  <ImSpinner2 className="h-5 w-5 animate-spin text-green-600" />
                  <span className="text-sm">Loading more categories...</span>
                </div>
              ) : (
                <div className="text-xs text-gray-400 py-2">
                  Scroll down to load more categories
                </div>
              )}
            </div>
          )}
          
          {/* Show message when all categories are loaded */}
          {!hasMore && visibleCategories.length > 0 && filteredCategories.length > INITIAL_VISIBLE_COUNT && (
            <div className="px-6 py-3 text-center border-t border-gray-100">
              <p className="text-xs text-gray-400">
                ✓ Loaded all {filteredCategories.length} categories
              </p>
            </div>
          )}
        </div>

        {/* FOOTER SUMMARY */}
        <div className="rounded-2xl bg-white p-4 text-center text-sm text-gray-500 shadow-sm flex items-center justify-center gap-2">
          <FaFolderOpen size={16} />
          Showing {visibleCategories.length} of {filteredCategories.length} categories
          {hasMore && " — Scroll down to load more"}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;