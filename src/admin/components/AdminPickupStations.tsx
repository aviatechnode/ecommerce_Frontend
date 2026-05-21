import { useMemo, useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";

import {
  useCreatePickupStationMutation,
  useDeletePickupStationMutation,
  useGetPickupStationsQuery,
  useTogglePickupStationMutation,
  useUpdatePickupStationMutation,
} from "../../services/pickupStationApi";

import { useGetStatesQuery, useGetLgasByStateQuery } from "../../services/locationApi";
import { useGetAllCouriersQuery } from "../../services/courierApi";

import type {
  CreatePickupStationDTO,
  PickupStation,
  UpdatePickupStationDTO,
} from "../../types/pickupStationTypes";

/* =========================================================
   FORM STATE INTERFACE
========================================================= */
interface PickupStationFormState {
  name: string;
  courierId: string;
  stateId: string;
  lgaId: string;
  address: string;
  landmark: string;
  phone: string;
  latitude: string;
  longitude: string;
  openingHours: string;
  isActive: boolean;
}

const initialFormState: PickupStationFormState = {
  name: "",
  courierId: "",
  stateId: "",
  lgaId: "",
  address: "",
  landmark: "",
  phone: "",
  latitude: "",
  longitude: "",
  openingHours: "",
  isActive: true,
};

/* =========================================================
   UTILITIES
========================================================= */
const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 4) return cleaned;
  if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 11)}`;
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    alert(`Copied "${text}" to clipboard`);
  } catch (err) {
    console.error("Copy failed", err);
  }
};

/* =========================================================
   COMPONENT
========================================================= */
const AdminPickupStations = () => {
  const [page, setPage] = useState(1);
  const [stateFilter, setStateFilter] = useState<string | undefined>(undefined);
  const [lgaFilter, setLgaFilter] = useState<string | undefined>(undefined);
  const [courierFilter, setCourierFilter] = useState<string | undefined>(undefined);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingStation, setEditingStation] = useState<PickupStation | null>(null);
  const [formData, setFormData] = useState<PickupStationFormState>(initialFormState);

  // Fetch dynamic data
  const { data: states = [], isLoading: statesLoading } = useGetStatesQuery();
  const { data: couriers = [], isLoading: couriersLoading } = useGetAllCouriersQuery();
  const { data: lgas = [], isLoading: lgasLoading } = useGetLgasByStateQuery(formData.stateId, {
    skip: !formData.stateId,
  });

  const queryParams = useMemo(
    () => ({
      page,
      limit: 20,
      stateId: stateFilter,
      lgaId: lgaFilter,
      courierId: courierFilter,
      search: searchTerm || undefined,
      isActive: activeFilter,
    }),
    [page, stateFilter, lgaFilter, courierFilter, searchTerm, activeFilter]
  );

  // Debug: Log the query params
  useEffect(() => {
    console.log("Query Params:", queryParams);
  }, [queryParams]);

  // The backend returns { data: PickupStation[], meta: { total, page, limit, totalPages } }
  const { data: stationsResponse, isLoading, isFetching, refetch, error } = useGetPickupStationsQuery(queryParams);
  
  // Extract the actual array and pagination meta
  const stations = (stationsResponse as any)?.data ?? [];
  const meta = (stationsResponse as any)?.meta;
  const hasNextPage = meta ? meta.page < meta.totalPages : false;
  const totalCount = meta?.total ?? 0;

  // Debug: Log the response
  useEffect(() => {
    console.log("Stations response:", stationsResponse);
    console.log("Stations array:", stations);
    console.log("Meta:", meta);
    console.log("Error:", error);
  }, [stationsResponse, error]);
  
  const [createPickupStation, { isLoading: creating }] = useCreatePickupStationMutation();
  const [updatePickupStation, { isLoading: updating }] = useUpdatePickupStationMutation();
  const [togglePickupStation, { isLoading: toggling }] = useTogglePickupStationMutation();
  const [deletePickupStation, { isLoading: deleting }] = useDeletePickupStationMutation();

  // Reset LGA in filter when state changes
  useEffect(() => {
    setLgaFilter(undefined);
  }, [stateFilter]);

  /* ---------------------------------------------------------
     Form helpers
  --------------------------------------------------------- */
  const resetForm = () => {
    setFormData(initialFormState);
    setEditingStation(null);
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
    // Reset LGA when state changes in form
    if (name === "stateId") {
      setFormData((prev) => ({ ...prev, lgaId: "" }));
    }
  };

  const handleEdit = (station: PickupStation) => {
    setEditingStation(station);
    setFormData({
      name: station.name,
      courierId: station.courierId,
      stateId: station.stateId,
      lgaId: station.lgaId,
      address: station.address,
      landmark: station.landmark || "",
      phone: station.phone || "",
      latitude: station.latitude?.toString() || "",
      longitude: station.longitude?.toString() || "",
      openingHours: station.openingHours || "",
      isActive: station.isActive,
    });
    setShowCreateForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------------------------------------------------------
     Transform to DTO
  --------------------------------------------------------- */
  const buildCreatePayload = (): CreatePickupStationDTO => {
    const payload: CreatePickupStationDTO = {
      name: formData.name.trim(),
      courierId: formData.courierId,
      stateId: formData.stateId,
      lgaId: formData.lgaId,
      address: formData.address.trim(),
      isActive: formData.isActive,
    };

    if (formData.landmark) payload.landmark = formData.landmark.trim();
    if (formData.phone) payload.phone = formData.phone.trim();
    if (formData.latitude) payload.latitude = parseFloat(formData.latitude);
    if (formData.longitude) payload.longitude = parseFloat(formData.longitude);
    if (formData.openingHours) payload.openingHours = formData.openingHours;

    return payload;
  };

  const buildUpdatePayload = (): UpdatePickupStationDTO => {
    const payload: UpdatePickupStationDTO = {};

    if (formData.name !== editingStation?.name) payload.name = formData.name.trim();
    if (formData.courierId !== editingStation?.courierId) payload.courierId = formData.courierId;
    if (formData.stateId !== editingStation?.stateId) payload.stateId = formData.stateId;
    if (formData.lgaId !== editingStation?.lgaId) payload.lgaId = formData.lgaId;
    if (formData.address !== editingStation?.address) payload.address = formData.address.trim();
    if (formData.landmark !== (editingStation?.landmark || "")) payload.landmark = formData.landmark.trim() || undefined;
    if (formData.phone !== (editingStation?.phone || "")) payload.phone = formData.phone.trim() || undefined;
    
    const newLat = formData.latitude ? parseFloat(formData.latitude) : undefined;
    if (newLat !== editingStation?.latitude) payload.latitude = newLat;
    
    const newLng = formData.longitude ? parseFloat(formData.longitude) : undefined;
    if (newLng !== editingStation?.longitude) payload.longitude = newLng;
    
    if (formData.openingHours !== (editingStation?.openingHours || "")) payload.openingHours = formData.openingHours || undefined;
    if (formData.isActive !== editingStation?.isActive) payload.isActive = formData.isActive;

    return payload;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("Station name is required");
      return;
    }
    if (!formData.courierId) {
      alert("Please select a courier");
      return;
    }
    if (!formData.stateId) {
      alert("Please select a state");
      return;
    }
    if (!formData.lgaId) {
      alert("Please select an LGA");
      return;
    }
    if (!formData.address.trim()) {
      alert("Address is required");
      return;
    }

    try {
      if (editingStation) {
        const payload = buildUpdatePayload();
        if (Object.keys(payload).length === 0) {
          alert("No changes to update");
          return;
        }
        const result = await updatePickupStation({ id: editingStation.id, data: payload }).unwrap();
        console.log("Update result:", result);
        alert("Pickup station updated successfully");
      } else {
        const payload = buildCreatePayload();
        console.log("Creating with payload:", payload);
        const result = await createPickupStation(payload).unwrap();
        console.log("Create result:", result);
        alert("Pickup station created successfully");
      }
      resetForm();
      setShowCreateForm(false);
      // Reset to page 1 and refetch
      setPage(1);
      await refetch();
    } catch (error) {
      console.error("Submit error:", error);
      alert(editingStation ? "Failed to update pickup station" : "Failed to create pickup station");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (!window.confirm(`${currentStatus ? "Deactivate" : "Activate"} this pickup station?`)) return;
    try {
      await togglePickupStation(id).unwrap();
      alert(`Pickup station ${currentStatus ? "deactivated" : "activated"} successfully`);
      await refetch();
    } catch (error) {
      console.error(error);
      alert("Failed to toggle station status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this pickup station? This action cannot be undone.")) return;
    try {
      await deletePickupStation(id).unwrap();
      alert("Pickup station deleted successfully");
      await refetch();
    } catch (error) {
      console.error(error);
      alert("Failed to delete pickup station");
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  // Helper to get state name by ID
  const getStateName = (stateId: string) => {
    const state = states.find(s => s.id === stateId);
    return state?.name || stateId;
  };

  // Helper to get courier name by ID
  const getCourierName = (courierId: string) => {
    const courier = couriers.find(c => c.id === courierId);
    return courier?.name || courierId;
  };

  /* ---------------------------------------------------------
     Render
  --------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">📍 Pickup Station Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage pickup locations for courier services across Nigeria.
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
            {showCreateForm ? "✖ Close Form" : "➕ Create Pickup Station"}
          </button>
        </div>

        {/* CREATE/EDIT FORM */}
        {showCreateForm && (
          <form
            onSubmit={handleSubmit}
            className="space-y-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all lg:p-8"
          >
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingStation ? "✏️ Edit Pickup Station" : "✨ New Pickup Station"}
              </h2>
              <p className="text-sm text-gray-500">
                {editingStation ? "Update the station details below." : "Fill in the details to create a new pickup station."}
              </p>
            </div>

            {/* SECTION 1: BASIC INFO */}
            <div>
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">Basic Information</h3>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Station Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Ikeja City Mall Pickup Point"
                    required
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Courier <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="courierId"
                    value={formData.courierId}
                    onChange={handleInputChange}
                    required
                    disabled={couriersLoading}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                  >
                    <option value="">{couriersLoading ? "Loading couriers..." : "Select Courier"}</option>
                    {couriers.map((courier) => (
                      <option key={courier.id} value={courier.id}>
                        {courier.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      setFormData((prev) => ({ ...prev, phone: formatted }));
                    }}
                    placeholder="0801 234 5678"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    Active (available for pickup)
                  </label>
                </div>
              </div>
            </div>

            {/* SECTION 2: LOCATION */}
            <div className="rounded-xl bg-gray-50 p-5">
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">📍 Location Details</h3>
              <div className="grid gap-5 sm:grid-cols-2">
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
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                  >
                    <option value="">{statesLoading ? "Loading states..." : "Select State"}</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    LGA <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="lgaId"
                    value={formData.lgaId}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.stateId || lgasLoading}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                  >
                    <option value="">
                      {!formData.stateId 
                        ? "Select state first" 
                        : lgasLoading 
                          ? "Loading LGAs..." 
                          : "Select LGA"}
                    </option>
                    {lgas.map((lga) => (
                      <option key={lga.id} value={lga.id}>
                        {lga.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Street address, building name, floor/suite number"
                    required
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Landmark (Optional)</label>
                  <input
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleInputChange}
                    placeholder="e.g., Opposite the mall, Near the fountain"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Opening Hours</label>
                  <input
                    name="openingHours"
                    value={formData.openingHours}
                    onChange={handleInputChange}
                    placeholder="Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: GEO COORDINATES */}
            <div>
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">🗺️ Geographic Coordinates (Optional)</h3>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Latitude</label>
                  <input
                    name="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="e.g., 6.6018"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Longitude</label>
                  <input
                    name="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="e.g., 3.3515"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                type="submit"
                disabled={creating || updating}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {(creating || updating) ? "⏳ Saving..." : editingStation ? "✅ Update Station" : "✅ Create Station"}
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
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 pr-8 text-sm shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 min-w-[200px]"
              />
            </div>
            <select
              value={stateFilter || ""}
              onChange={(e) => setStateFilter(e.target.value || undefined)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
            >
              <option value="">All States</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
            <select
              value={lgaFilter || ""}
              onChange={(e) => setLgaFilter(e.target.value || undefined)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
              disabled={!stateFilter}
            >
              <option value="">All LGAs</option>
              {lgas.map((lga) => (
                <option key={lga.id} value={lga.id}>
                  {lga.name}
                </option>
              ))}
            </select>
            <select
              value={courierFilter || ""}
              onChange={(e) => setCourierFilter(e.target.value || undefined)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
            >
              <option value="">All Couriers</option>
              {couriers.map((courier) => (
                <option key={courier.id} value={courier.id}>
                  {courier.name}
                </option>
              ))}
            </select>
            <select
              value={activeFilter === undefined ? "" : activeFilter.toString()}
              onChange={(e) => {
                const val = e.target.value;
                setActiveFilter(val === "" ? undefined : val === "true");
              }}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
            >
              <option value="">All Status</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-gray-50"
            >
              🔄 Refresh
            </button>
            {(stateFilter || lgaFilter || courierFilter || searchTerm || activeFilter !== undefined) && (
              <button
                type="button"
                onClick={() => {
                  setStateFilter(undefined);
                  setLgaFilter(undefined);
                  setCourierFilter(undefined);
                  setSearchTerm("");
                  setActiveFilter(undefined);
                  setPage(1);
                }}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
              >
                ✖ Clear Filters
              </button>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {isFetching && "🔄 Updating..."}
            {!isFetching && !isLoading && `📊 ${totalCount} station(s)`}
          </div>
        </div>

        {/* STATIONS TABLE */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-green-600"></div>
                        <span className="ml-2">Loading pickup stations...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!isLoading && stations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      ✨ No pickup stations found. Create your first station above.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  stations.map((station: PickupStation) => (
                    <tr key={station.id} className="transition hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{station.name}</span>
                          {station.id === editingStation?.id && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                              Editing
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          Courier: {getCourierName(station.courierId)}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                        <div>{getStateName(station.stateId)}</div>
                        <div className="text-xs text-gray-500">{station.lgaId}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="max-w-xs truncate">{station.address}</div>
                        {station.landmark && (
                          <div className="text-xs text-gray-500">📍 {station.landmark}</div>
                        )}
                        {station.openingHours && (
                          <div className="text-xs text-gray-400 mt-1">🕒 {station.openingHours}</div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {station.phone || "—"}
                        {station.phone && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(station.phone!)}
                            className="ml-2 text-blue-500 hover:text-blue-700"
                            title="Copy phone number"
                          >
                            📋
                          </button>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeColor(station.isActive)}`}>
                          {station.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(station)}
                            disabled={toggling}
                            className="rounded-md px-2 py-1 text-blue-600 transition hover:bg-blue-50 hover:text-blue-800"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(station.id, station.isActive)}
                            disabled={toggling}
                            className={`rounded-md px-2 py-1 transition ${
                              station.isActive
                                ? "text-yellow-600 hover:bg-yellow-50 hover:text-yellow-800"
                                : "text-green-600 hover:bg-green-50 hover:text-green-800"
                            }`}
                          >
                            {station.isActive ? "🔴 Deactivate" : "🟢 Activate"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(station.id)}
                            disabled={deleting}
                            className="rounded-md px-2 py-1 text-red-600 transition hover:bg-red-50 hover:text-red-800 disabled:opacity-50"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNextPage}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{page}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNextPage}
                  className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPickupStations;