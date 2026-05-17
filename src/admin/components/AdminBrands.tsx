import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import {
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  type Brand,
} from "../../services/brandApi";

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import {
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  Plus,
  X,
  Loader2,
} from "lucide-react";

/* =========================================================
   FORM STATE INTERFACE
========================================================= */
interface BrandFormState {
  name: string;
}

const initialFormState: BrandFormState = {
  name: "",
};

/* =========================================================
   COMPONENT
========================================================= */
const AdminBrands = () => {
  const [search, setSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<BrandFormState>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    data: brands = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetBrandsQuery();

  const [createBrand, { isLoading: creating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: updating }] = useUpdateBrandMutation();
  const [deleteBrand, { isLoading: deleting }] = useDeleteBrandMutation();

  const isSubmitting = creating || updating;
  const loading = isLoading || isSubmitting || deleting;

  /* ---------------------------------------------------------
     Filtered brands (search)
  --------------------------------------------------------- */
  const filteredBrands = useMemo(() => {
    return brands.filter((brand) =>
      brand.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [brands, search]);

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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    return formData.name.trim() !== "";
  };

  /* ---------------------------------------------------------
     Submit (create or update)
  --------------------------------------------------------- */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid()) return;

    try {
      if (editingId) {
        await updateBrand({
          id: editingId,
          data: { name: formData.name.trim() },
        }).unwrap();
        alert("Brand updated successfully");
      } else {
        await createBrand({ name: formData.name.trim() }).unwrap();
        alert("Brand created successfully");
      }
      resetForm();
      setShowCreateForm(false);
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || "Operation failed");
    }
  };

  /* ---------------------------------------------------------
     Edit
  --------------------------------------------------------- */
  const handleEdit = (brand: Brand) => {
    setEditingId(brand.id);
    setFormData({ name: brand.name });
    setShowCreateForm(true);
    document.getElementById("brand-form")?.scrollIntoView({ behavior: "smooth" });
  };

  /* ---------------------------------------------------------
     Delete
  --------------------------------------------------------- */
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this brand? This action is permanent.")) return;
    try {
      await deleteBrand(id).unwrap();
      alert("Brand deleted successfully");
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || "Delete failed");
    }
  };

  /* ---------------------------------------------------------
     Error message
  --------------------------------------------------------- */
  const errorMessage: string | null =
    error
      ? (error as FetchBaseQueryError & { data?: any })?.data?.message ??
        "Failed to load brands"
      : null;

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
              🏷️ Brand Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Create, manage, and organize product brands.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {showCreateForm ? <X size={18} /> : <Plus size={18} />}
            {showCreateForm ? "Close Form" : "Add Brand"}
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
            id="brand-form"
            onSubmit={handleSubmit}
            className="space-y-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all lg:p-8"
          >
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingId ? "✏️ Edit Brand" : "➕ New Brand"}
              </h2>
              <p className="text-sm text-gray-500">
                {editingId
                  ? "Update the brand details below."
                  : "Fill in the details to add a new product brand."}
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Brand Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Toyota"
                required
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              />
              <p className="mt-1 text-xs text-gray-400">
                Slug and product association will be generated automatically.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? "✅ Update Brand" : "💾 Save Brand"}
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
                placeholder="Search brands..."
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

        {/* BRANDS TABLE */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Slug
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
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                      <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                        <span className="ml-2">Loading brands...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && filteredBrands.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                      🏷️ No brands found. {search ? "Try a different search term." : "Create your first brand above."}
                    </td>
                  </tr>
                )}
                {!loading &&
                  filteredBrands.map((brand) => (
                    <tr key={brand.id} className="transition hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {brand.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {brand.slug}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {brand._count?.products || 0}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <button
                          type="button"
                          onClick={() => handleEdit(brand)}
                          className="mr-2 inline-flex items-center gap-1 rounded-md px-3 py-1 text-blue-600 transition hover:bg-blue-50 hover:text-blue-800"
                          title="Edit"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(brand.id)}
                          disabled={deleting}
                          className="inline-flex items-center gap-1 rounded-md px-3 py-1 text-red-600 transition hover:bg-red-50 hover:text-red-800 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER SUMMARY */}
        <div className="rounded-2xl bg-white p-4 text-center text-sm text-gray-500 shadow-sm">
          🏷️ Total brands:{" "}
          <span className="font-semibold">{filteredBrands.length}</span>
          {search && filteredBrands.length !== brands.length && (
            <span className="ml-2 text-gray-400">
              (filtered from {brands.length})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBrands;