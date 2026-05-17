import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { useGetStatesQuery } from "../../services/locationApi";
import {
  useGetWarehousesQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
} from "../../services/warehouseApi";
import type { Warehouse, WarehousePayload } from "../../services/warehouseApi";

import {
  Pencil,
  Trash2,
  Loader2,
  Plus,
  X,
  RefreshCw,
} from "lucide-react";

/* =========================================================
   FORM STATE INTERFACE
========================================================= */
interface WarehouseFormState extends WarehousePayload {
  // No extra fields needed for now
}

const initialFormState: WarehouseFormState = {
  name: "",
  stateId: "",
  city: "",
};

/* =========================================================
   COMPONENT
========================================================= */
const AdminWarehouses = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<WarehouseFormState>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);

  // RTK Query hooks
  const {
    data: warehouses = [],
    isLoading: loading,
    isFetching,
    error: queryError,
    refetch,
  } = useGetWarehousesQuery();

  const {
    data: states = [],
    isLoading: statesLoading,
    isError: statesError,
  } = useGetStatesQuery();

  const [createWarehouse, { isLoading: isCreating }] = useCreateWarehouseMutation();
  const [updateWarehouse, { isLoading: isUpdating }] = useUpdateWarehouseMutation();
  const [deleteWarehouse, { isLoading: isDeleting }] = useDeleteWarehouseMutation();

  const isSubmitting = isCreating || isUpdating;

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
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.stateId.trim() !== "" &&
      formData.city.trim() !== ""
    );
  };

  /* ---------------------------------------------------------
     Submit handler (create or update)
  --------------------------------------------------------- */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid()) return;

    try {
      if (editingId) {
        await updateWarehouse({ id: editingId, data: formData }).unwrap();
        alert("Warehouse updated successfully");
      } else {
        await createWarehouse(formData).unwrap();
        alert("Warehouse created successfully");
      }
      resetForm();
      setShowCreateForm(false);
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || err?.message || "Something went wrong");
    }
  };

  /* ---------------------------------------------------------
     Edit handler
  --------------------------------------------------------- */
  const handleEdit = (warehouse: Warehouse) => {
    setEditingId(warehouse.id);
    setFormData({
      name: warehouse.name,
      stateId: warehouse.stateId,
      city: warehouse.city,
    });
    setShowCreateForm(true);
    // Scroll to form
    document.getElementById("warehouse-form")?.scrollIntoView({ behavior: "smooth" });
  };

  /* ---------------------------------------------------------
     Delete handler
  --------------------------------------------------------- */
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this warehouse?")) return;
    try {
      await deleteWarehouse(id).unwrap();
      alert("Warehouse deleted successfully");
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || err?.message || "Delete failed");
    }
  };

  /* ---------------------------------------------------------
     Helper to get error message
  --------------------------------------------------------- */
  const getErrorMessage = () => {
    if (queryError) {
      if (typeof queryError === "object" && "data" in queryError) {
        return (queryError as any)?.data?.message || "Failed to load warehouses";
      }
      return "Failed to load warehouses";
    }
    return null;
  };

  const errorMessage = getErrorMessage();

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
              🏚️ Warehouse Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Create, manage, and track warehouse locations across states.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {showCreateForm ? <X size={18} /> : <Plus size={18} />}
            {showCreateForm ? "Close Form" : "Add Warehouse"}
          </button>
        </div>

        {/* CREATE / EDIT FORM */}
        {showCreateForm && (
          <form
            id="warehouse-form"
            onSubmit={handleSubmit}
            className="space-y-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all lg:p-8"
          >
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingId ? "✏️ Edit Warehouse" : "➕ New Warehouse"}
              </h2>
              <p className="text-sm text-gray-500">
                {editingId
                  ? "Update the warehouse details below."
                  : "Fill in the details to add a new warehouse location."}
              </p>
            </div>

            {/* Form Fields */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Warehouse Name */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Warehouse Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Lagos Main Warehouse"
                  required
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                />
              </div>

              {/* State */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  name="stateId"
                  value={formData.stateId}
                  onChange={handleInputChange}
                  required
                  disabled={statesLoading}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200 disabled:bg-gray-100"
                >
                  <option value="">
                    {statesLoading ? "Loading states..." : "Select a state"}
                  </option>
                  {states.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
                {statesError && (
                  <p className="mt-1 text-xs text-red-500">
                    Failed to load states. Please refresh.
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g., Ikeja"
                  required
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                type="submit"
                disabled={!isFormValid() || isSubmitting || statesLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? "✅ Update Warehouse" : "💾 Save Warehouse"}
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
          <div className="flex flex-wrap gap-3">
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

        {/* WAREHOUSES TABLE */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    State
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    City
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
                        <span className="ml-2">Loading warehouses...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && errorMessage && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-red-500">
                      ❌ {errorMessage}
                    </td>
                  </tr>
                )}
                {!loading && !errorMessage && warehouses.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                      🏭 No warehouses found. Create your first warehouse above.
                    </td>
                  </tr>
                )}
                {!loading &&
                  !errorMessage &&
                  warehouses.map((warehouse) => (
                    <tr key={warehouse.id} className="transition hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {warehouse.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {warehouse.state?.name || "—"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {warehouse.city}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <button
                          type="button"
                          onClick={() => handleEdit(warehouse)}
                          className="mr-2 inline-flex items-center gap-1 rounded-md px-3 py-1 text-blue-600 transition hover:bg-blue-50 hover:text-blue-800"
                          title="Edit"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(warehouse.id)}
                          disabled={isDeleting}
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

        {/* Footer / Summary */}
        <div className="rounded-2xl bg-white p-4 text-center text-sm text-gray-500 shadow-sm">
          🏬 Total warehouses: <span className="font-semibold">{warehouses.length}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminWarehouses;