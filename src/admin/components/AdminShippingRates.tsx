import { useMemo, useState, useEffect } from "react";
import type { ChangeEvent } from "react";

import {
  useCreateShippingRateMutation,
  useGetShippingRatesQuery,
  useUpdateShippingRateMutation,
  useToggleShippingRateMutation,
  useDeleteShippingRateMutation,
  useFindBestShippingRateMutation,
  type ShippingRate,
} from "../../services/shippingRateApi";

import { useGetAllCouriersQuery } from "../../services/courierApi";
import { useGetAllZonesQuery } from "../../services/shippingZoneApi";

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------
interface ShippingRateFormState {
  courierId: string;
  zoneId: string;
  name: string;
  minWeight: string;
  maxWeight: string;
  baseFee: string;
  perKgFee: string;
  volumetricDivisor: string;
  fixedFee: string;
  remoteAreaSurcharge: string;
  insurancePercent: string;
  estimatedDaysMin: string;
  estimatedDaysMax: string;
  supportsCOD: boolean;
  isActive: boolean;
}

const initialFormState: ShippingRateFormState = {
  courierId: "",
  zoneId: "",
  name: "",
  minWeight: "0",
  maxWeight: "",
  baseFee: "",
  perKgFee: "",
  volumetricDivisor: "5000",
  fixedFee: "",
  remoteAreaSurcharge: "",
  insurancePercent: "0",
  estimatedDaysMin: "1",
  estimatedDaysMax: "5",
  supportsCOD: false,
  isActive: true,
};

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------
const AdminShippingRates = () => {
  // Pagination & filters
  const [page, setPage] = useState(1);
  const [filterCourierId, setFilterCourierId] = useState<string>("");
  const [filterZoneId, setFilterZoneId] = useState<string>("");
  const [filterActive, setFilterActive] = useState<boolean | "all">("all");
  const itemsPerPage = 10;

  // UI state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ShippingRateFormState>(initialFormState);

  // RTK Query hooks
  const { data: ratesData, isLoading: ratesLoading, refetch } = useGetShippingRatesQuery();
  const [createRate, { isLoading: creating }] = useCreateShippingRateMutation();
  const [updateRate, { isLoading: updating }] = useUpdateShippingRateMutation();
  const [toggleRate, { isLoading: toggling }] = useToggleShippingRateMutation();
  const [deleteRate, { isLoading: deleting }] = useDeleteShippingRateMutation();
  const [findBestRate, { data: bestRateData, isLoading: findingBest }] = useFindBestShippingRateMutation();

  const { data: couriers, isLoading: couriersLoading } = useGetAllCouriersQuery();
  const { data: zones, isLoading: zonesLoading } = useGetAllZonesQuery();

  const allRates = ratesData?.data ?? [];

  // Filtering & pagination
  const filteredRates = useMemo(() => {
    return allRates.filter((rate) => {
      if (filterCourierId && rate.courierId !== filterCourierId) return false;
      if (filterZoneId && rate.zoneId !== filterZoneId) return false;
      if (filterActive !== "all" && rate.isActive !== filterActive) return false;
      return true;
    });
  }, [allRates, filterCourierId, filterZoneId, filterActive]);

  const totalPages = Math.ceil(filteredRates.length / itemsPerPage);
  const paginatedRates = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredRates.slice(start, start + itemsPerPage);
  }, [filteredRates, page, itemsPerPage]);

  useEffect(() => setPage(1), [filterCourierId, filterZoneId, filterActive]);

  // Form helpers
  const resetForm = () => setFormData(initialFormState);

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

  const buildCreatePayload = () => ({
    courierId: formData.courierId,
    zoneId: formData.zoneId,
    name: formData.name,
    minWeight: parseFloat(formData.minWeight),
    maxWeight: parseFloat(formData.maxWeight),
    baseFee: parseFloat(formData.baseFee),
    perKgFee: parseFloat(formData.perKgFee),
    volumetricDivisor: parseFloat(formData.volumetricDivisor) || 5000,
    fixedFee: formData.fixedFee ? parseFloat(formData.fixedFee) : null,
    remoteAreaSurcharge: formData.remoteAreaSurcharge ? parseFloat(formData.remoteAreaSurcharge) : null,
    insurancePercent: parseFloat(formData.insurancePercent) || 0,
    estimatedDaysMin: parseInt(formData.estimatedDaysMin, 10),
    estimatedDaysMax: parseInt(formData.estimatedDaysMax, 10),
    supportsCOD: formData.supportsCOD,
    isActive: formData.isActive,
  });

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.courierId || !formData.zoneId || !formData.name) {
      alert("Courier, Zone and Name are required.");
      return;
    }
    try {
      await createRate(buildCreatePayload()).unwrap();
      alert("Shipping rate created successfully");
      resetForm();
      setShowCreateForm(false);
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to create shipping rate");
    }
  };

  const openEditModal = (rate: ShippingRate) => {
    setEditingId(rate.id);
    setFormData({
      courierId: rate.courierId,
      zoneId: rate.zoneId,
      name: rate.name,
      minWeight: rate.minWeight.toString(),
      maxWeight: rate.maxWeight.toString(),
      baseFee: rate.baseFee.toString(),
      perKgFee: rate.perKgFee.toString(),
      volumetricDivisor: rate.volumetricDivisor.toString(),
      fixedFee: rate.fixedFee?.toString() ?? "",
      remoteAreaSurcharge: rate.remoteAreaSurcharge?.toString() ?? "",
      insurancePercent: rate.insurancePercent.toString(),
      estimatedDaysMin: rate.estimatedDaysMin.toString(),
      estimatedDaysMax: rate.estimatedDaysMax.toString(),
      supportsCOD: rate.supportsCOD,
      isActive: rate.isActive,
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      await updateRate({
        id: editingId,
        data: buildCreatePayload(),
      }).unwrap();
      alert("Shipping rate updated successfully");
      setEditModalOpen(false);
      setEditingId(null);
      resetForm();
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to update shipping rate");
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await toggleRate(id).unwrap();
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to toggle active status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this shipping rate permanently?")) return;
    try {
      await deleteRate(id).unwrap();
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to delete shipping rate");
    }
  };

  // Find best rate state
  const [bestRatePayload, setBestRatePayload] = useState({
    courierId: "",
    zoneId: "",
    weight: "",
  });

  const handleFindBest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bestRatePayload.courierId || !bestRatePayload.zoneId || !bestRatePayload.weight) {
      alert("Courier, Zone and Weight are required");
      return;
    }
    try {
      await findBestRate({
        courierId: bestRatePayload.courierId,
        zoneId: bestRatePayload.zoneId,
        weight: parseFloat(bestRatePayload.weight),
      }).unwrap();
    } catch (err) {
      console.error(err);
      alert("Error finding best rate");
    }
  };

  const getCourierName = (id: string) => couriers?.find((c) => c.id === id)?.name ?? id;
  const getZoneName = (id: string) => zones?.find((z) => z.id === id)?.name ?? id;

  const isLoading = ratesLoading || couriersLoading || zonesLoading;

  // Helper to render form fields (used in both create and edit)
  const renderFormFields = () => (
    <>
      {/* Basic info */}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Courier <span className="text-red-500">*</span>
          </label>
          <select
            name="courierId"
            value={formData.courierId}
            onChange={handleInputChange}
            required
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          >
            <option value="">Select courier</option>
            {couriers?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Shipping Zone <span className="text-red-500">*</span>
          </label>
          <select
            name="zoneId"
            value={formData.zoneId}
            onChange={handleInputChange}
            required
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          >
            <option value="">Select zone</option>
            {zones?.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name} ({z.code})
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Rate Name <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Express Delivery"
            required
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Weight & Pricing */}
      <div className="rounded-xl bg-gray-50 p-5">
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">
          ⚖️ Weight & Pricing
        </h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Min Weight (kg)</label>
            <input
              type="number"
              step="any"
              name="minWeight"
              value={formData.minWeight}
              onChange={handleInputChange}
              required
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Max Weight (kg)</label>
            <input
              type="number"
              step="any"
              name="maxWeight"
              value={formData.maxWeight}
              onChange={handleInputChange}
              required
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Base Fee (₦)</label>
            <input
              type="number"
              step="any"
              name="baseFee"
              value={formData.baseFee}
              onChange={handleInputChange}
              required
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Per kg Fee (₦)</label>
            <input
              type="number"
              step="any"
              name="perKgFee"
              value={formData.perKgFee}
              onChange={handleInputChange}
              required
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Volumetric Divisor</label>
            <input
              type="number"
              step="any"
              name="volumetricDivisor"
              value={formData.volumetricDivisor}
              onChange={handleInputChange}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Fixed Fee (₦)</label>
            <input
              type="number"
              step="any"
              name="fixedFee"
              value={formData.fixedFee}
              onChange={handleInputChange}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Remote Area Surcharge (₦)</label>
            <input
              type="number"
              step="any"
              name="remoteAreaSurcharge"
              value={formData.remoteAreaSurcharge}
              onChange={handleInputChange}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Insurance (%)</label>
            <input
              type="number"
              step="any"
              name="insurancePercent"
              value={formData.insurancePercent}
              onChange={handleInputChange}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Delivery estimates */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Est. Days (Min)</label>
          <input
            type="number"
            name="estimatedDaysMin"
            value={formData.estimatedDaysMin}
            onChange={handleInputChange}
            required
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Est. Days (Max)</label>
          <input
            type="number"
            name="estimatedDaysMax"
            value={formData.estimatedDaysMax}
            onChange={handleInputChange}
            required
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500"
          />
        </div>
      </div>

      {/* Boolean flags */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="supportsCOD"
            checked={formData.supportsCOD}
            onChange={handleInputChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Supports Cash on Delivery
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleInputChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Active
        </label>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              🚚 Shipping Rates Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Define, update and manage shipping rates per courier and zone.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {showCreateForm ? "✖ Close Form" : "➕ Create Rate"}
          </button>
        </div>

        {/* CREATE FORM */}
        {showCreateForm && (
          <form onSubmit={handleCreate} className="space-y-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg lg:p-8">
            {renderFormFields()}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? "⏳ Saving..." : "✅ Save Rate"}
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

        {/* FILTER BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <select
              value={filterCourierId}
              onChange={(e) => setFilterCourierId(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-blue-500"
            >
              <option value="">All Couriers</option>
              {couriers?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={filterZoneId}
              onChange={(e) => setFilterZoneId(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-blue-500"
            >
              <option value="">All Zones</option>
              {zones?.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
            <select
              value={filterActive === "all" ? "" : filterActive ? "active" : "inactive"}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "active") setFilterActive(true);
                else if (val === "inactive") setFilterActive(false);
                else setFilterActive("all");
              }}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-gray-50"
            >
              🔄 Refresh
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {paginatedRates.length} of {filteredRates.length} rates
          </div>
        </div>

        {/* RATES TABLE */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Courier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Zone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Weight Range</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Base + PerKg</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Est. Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {isLoading && (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                        <span className="ml-2">Loading rates...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!isLoading && paginatedRates.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                      ✨ No shipping rates found. Create your first rate above.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  paginatedRates.map((rate) => (
                    <tr key={rate.id} className="transition hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{rate.name}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{getCourierName(rate.courierId)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{getZoneName(rate.zoneId)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {rate.minWeight} – {rate.maxWeight} kg
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        ₦{rate.baseFee} + ₦{rate.perKgFee}/kg
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {rate.estimatedDaysMin}–{rate.estimatedDaysMax}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            rate.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {rate.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <button
                          onClick={() => openEditModal(rate)}
                          className="mr-2 rounded-md px-2 py-1 text-blue-600 transition hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(rate.id)}
                          disabled={toggling}
                          className="mr-2 rounded-md px-2 py-1 text-yellow-600 transition hover:bg-yellow-50"
                        >
                          {rate.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(rate.id)}
                          disabled={deleting}
                          className="rounded-md px-2 py-1 text-red-600 transition hover:bg-red-50"
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

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
              </p>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                  className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* FIND BEST RATE TOOL */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">🔍 Find Best Rate</h2>
          <p className="mb-4 text-sm text-gray-500">
            Enter courier, zone and weight to get the best matching rate.
          </p>
          <form onSubmit={handleFindBest} className="flex flex-wrap items-end gap-4">
            <div className="w-64">
              <label className="block text-sm font-medium text-gray-700">Courier</label>
              <select
                value={bestRatePayload.courierId}
                onChange={(e) => setBestRatePayload((prev) => ({ ...prev, courierId: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500"
              >
                <option value="">Select</option>
                {couriers?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-64">
              <label className="block text-sm font-medium text-gray-700">Zone</label>
              <select
                value={bestRatePayload.zoneId}
                onChange={(e) => setBestRatePayload((prev) => ({ ...prev, zoneId: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500"
              >
                <option value="">Select</option>
                {zones?.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
              <input
                type="number"
                step="any"
                value={bestRatePayload.weight}
                onChange={(e) => setBestRatePayload((prev) => ({ ...prev, weight: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={findingBest}
              className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {findingBest ? "Searching..." : "Find Best Rate"}
            </button>
          </form>
          {bestRateData?.data && (
            <div className="mt-4 rounded-lg bg-green-50 p-4 text-green-800">
              <p className="font-semibold">Best Rate Found:</p>
              <p>
                {bestRateData.data.name} – ₦{bestRateData.data.baseFee} + ₦{bestRateData.data.perKgFee}/kg, est.{" "}
                {bestRateData.data.estimatedDaysMin}–{bestRateData.data.estimatedDaysMax} days
              </p>
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 border-b border-gray-200 bg-white px-6 py-4">
              <h3 className="text-xl font-semibold text-gray-800">Edit Shipping Rate</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="absolute right-6 top-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-6 p-6">
              {renderFormFields()}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2 font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShippingRates;