import { useState, type ChangeEvent } from "react";

import {
  useCreateCourierMutation,
  useDeleteCourierMutation,
  useGetAllCouriersQuery,
  useToggleCourierStatusMutation,
  useUpdateCourierMutation,
} from "../../services/courierApi";

import type { Courier, CreateCourierInput, UpdateCourierInput } from "../../types/courier.types";

// FORM STATE INTERFACE (CREATE & EDIT)

interface CourierFormState {
  name: string;
  phone: string;
  email: string;
  website: string;
  isActive: boolean;
}

const initialFormState: CourierFormState = {
  name: "",
  phone: "",
  email: "",
  website: "",
  isActive: true,
};

// COMPONENT
const AdminCouriers = () => {
  const { data: couriers, isLoading, isFetching, refetch } = useGetAllCouriersQuery();
  const [createCourier, { isLoading: isCreating }] = useCreateCourierMutation();
  const [updateCourier, { isLoading: isUpdating }] = useUpdateCourierMutation();
  const [toggleStatus, { isLoading: isToggling }] = useToggleCourierStatusMutation();
  const [deleteCourier, { isLoading: isDeleting }] = useDeleteCourierMutation();

  // UI state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourier, setEditingCourier] = useState<Courier | null>(null);
  const [formData, setFormData] = useState<CourierFormState>(initialFormState);

// Form helpers
  const resetForm = () => {
    setFormData(initialFormState);
    setEditingCourier(null);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openEditForm = (courier: Courier) => {
    setEditingCourier(courier);
    setFormData({
      name: courier.name,
      phone: courier.phone || "",
      email: courier.email || "",
      website: courier.website || "",
      isActive: courier.isActive,
    });
    setShowCreateForm(true); 
  };

 
// Create / Update submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Courier name is required");
      return;
    }

    try {
      if (editingCourier) {
        const payload: UpdateCourierInput = {
          name: formData.name,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          website: formData.website || undefined,
          isActive: formData.isActive,
        };
        await updateCourier({ id: editingCourier.id, data: payload }).unwrap();
        alert("Courier updated successfully");
      } else {
        const payload: CreateCourierInput = {
          name: formData.name,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          website: formData.website || undefined,
          isActive: formData.isActive,
        };
        await createCourier(payload).unwrap();
        alert("Courier created successfully");
      }
      resetForm();
      setShowCreateForm(false);
      refetch();
    } catch (error) {
      console.error(error);
      alert(editingCourier ? "Failed to update courier" : "Failed to create courier");
    }
  };

// Toggle status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} this courier?`)) return;
    try {
      await toggleStatus(id).unwrap();
      alert(`Courier ${action}d successfully`);
      refetch();
    } catch (error) {
      console.error(error);
      alert(`Failed to ${action} courier`);
    }
  };

// Delete

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this courier? This action cannot be undone.")) return;
    try {
      await deleteCourier(id).unwrap();
      alert("Courier deleted successfully");
      refetch();
    } catch (error) {
      console.error(error);
      alert("Failed to delete courier");
    }
  };

// Render
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">🚚 Courier Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage delivery couriers, their contact info, and status.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowCreateForm((prev) => !prev);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {showCreateForm ? "✖ Close Form" : "➕ Add Courier"}
          </button>
        </div>

        {/* CREATE / EDIT FORM */}
        {showCreateForm && (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all lg:p-8"
          >
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingCourier ? "✏️ Edit Courier" : "✨ New Courier"}
              </h2>
              <p className="text-sm text-gray-500">
                {editingCourier
                  ? "Update the courier details below."
                  : "Fill in the details to add a new courier."}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Courier Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., DHL Express"
                  required
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+234 123 456 7890"
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="support@dhl.com"
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Website</label>
                <input
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://www.dhl.com"
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-blue-500 focus:ring focus:ring-blue-200"
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
                  Active (visible for shipping)
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isCreating || isUpdating
                  ? "⏳ Saving..."
                  : editingCourier
                  ? "✅ Update Courier"
                  : "✅ Save Courier"}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowCreateForm(false);
                }}
                className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ACTION BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-gray-50"
            >
              🔄 Refresh
            </button>
          </div>
          <div className="text-sm text-gray-500">{isFetching && "🔄 Updating..."}</div>
        </div>

        {/* COURIERS TABLE */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Website
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                        <span className="ml-2">Loading couriers...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!isLoading && couriers?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      ✨ No couriers found. Click "Add Courier" to create one.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  couriers?.map((courier) => (
                    <tr key={courier.id} className="transition hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {courier.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {courier.phone || "—"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {courier.email || "—"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {courier.website ? (
                          <a
                            href={courier.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {courier.website}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            courier.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {courier.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <button
                          type="button"
                          onClick={() => openEditForm(courier)}
                          disabled={isUpdating}
                          className="mr-3 rounded-md px-2 py-1 text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(courier.id, courier.isActive)}
                          disabled={isToggling}
                          className={`mr-3 rounded-md px-2 py-1 transition ${
                            courier.isActive
                              ? "text-yellow-600 hover:bg-yellow-50"
                              : "text-green-600 hover:bg-green-50"
                          } disabled:opacity-50`}
                        >
                          {courier.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(courier.id)}
                          disabled={isDeleting}
                          className="rounded-md px-2 py-1 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCouriers;