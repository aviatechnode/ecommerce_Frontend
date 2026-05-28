import { useMemo, useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";

import {
  useCreateShipmentMutation,
  useGetShipmentsQuery,
  useGetShipmentByIdQuery,
  useUpdateShipmentMutation,
  useUpdateShipmentStatusMutation,
  useDeleteShipmentMutation,
  useTrackShipmentQuery,
} from "../../services/shipmentApi";

import type {
  CreateShipmentInput,
  Shipment,
  ShipmentStatus,
  ShippingMethod,
  UpdateShipmentInput,
  UpdateShipmentStatusInput,
} from "../../types/shipment.types";

/* =========================================================
   FORM STATE INTERFACES
========================================================= */

interface CreateShipmentFormState {
  orderId: string;
  courierId: string;
  shippingRateId: string;
  pickupStationId: string;
  trackingNumber: string;
  status: ShipmentStatus;
  shippingMethod: ShippingMethod;
  deliveryFee: string;
  heavyItemSurcharge: string;
  supportsCOD: boolean;
  fragileFee: string;
  sameDayFee: string;
  weight: string;
  volumetricWeight: string;
  chargeableWeight: string;
  estimatedDays: string;
  shippedAt: string;
  deliveredAt: string;
  notes: string;
  failedReason: string;
}

const initialCreateFormState: CreateShipmentFormState = {
  orderId: "",
  courierId: "",
  shippingRateId: "",
  pickupStationId: "",
  trackingNumber: "",
  status: "PENDING",
  shippingMethod: "STANDARD",
  deliveryFee: "",
  heavyItemSurcharge: "",
  supportsCOD: false,
  fragileFee: "",
  sameDayFee: "",
  weight: "",
  volumetricWeight: "",
  chargeableWeight: "",
  estimatedDays: "",
  shippedAt: "",
  deliveredAt: "",
  notes: "",
  failedReason: "",
};

interface UpdateStatusFormState {
  status: ShipmentStatus;
  failedReason: string;
  shippedAt: string;
  deliveredAt: string;
  location: string;
}

const initialUpdateStatusState: UpdateStatusFormState = {
  status: "PENDING",
  failedReason: "",
  shippedAt: "",
  deliveredAt: "",
  location: "",
};

/* =========================================================
   UTILITIES
========================================================= */
const generateTrackingNumber = (): string => {
  const prefix = "TRK";
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}${random}`;
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    alert(`Copied "${text}" to clipboard`);
  } catch (err) {
    console.error("Copy failed", err);
  }
};

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString();
};

/* =========================================================
   MAIN COMPONENT
========================================================= */
const AdminShipments = () => {
  // Query filters
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | undefined>(undefined);
  const [courierFilter, setCourierFilter] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");

  // UI state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackingNumberInput, setTrackingNumberInput] = useState("");

  // Form states
  const [createForm, setCreateForm] = useState(initialCreateFormState);
  const [editForm, setEditForm] = useState<UpdateShipmentInput>({});
  const [statusForm, setStatusForm] = useState(initialUpdateStatusState);

  // Build query params
  const queryParams = useMemo(
    () => ({
      page,
      limit: 15,
      status: statusFilter,
      courierId: courierFilter || undefined,
      search: searchFilter || undefined,
    }),
    [page, statusFilter, courierFilter, searchFilter]
  );

  // API hooks
  const { data, isLoading, isFetching, refetch } = useGetShipmentsQuery(queryParams);
  const { data: shipmentDetail, refetch: refetchDetail } = useGetShipmentByIdQuery(selectedShipmentId!, {
    skip: !selectedShipmentId,
  });
  const { data: trackedShipment, refetch: refetchTrack } = useTrackShipmentQuery(trackingNumberInput, {
    skip: !trackingNumberInput || !showTrackModal,
  });

  const [createShipment, { isLoading: creating }] = useCreateShipmentMutation();
  const [updateShipment, { isLoading: updating }] = useUpdateShipmentMutation();
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateShipmentStatusMutation();
  const [deleteShipment, { isLoading: deleting }] = useDeleteShipmentMutation();

  /* ---------------------------------------------------------
     Load shipment into edit form when modal opens
  --------------------------------------------------------- */
  useEffect(() => {
    if (showEditModal && selectedShipmentId) {
      // Refetch to ensure latest data before editing
      refetchDetail();
    }
  }, [showEditModal, selectedShipmentId, refetchDetail]);

  useEffect(() => {
    if (showEditModal && shipmentDetail?.data) {
      const s = shipmentDetail.data;
      setEditForm({
        courierId: s.courierId,
        shippingRateId: s.shippingRateId ?? null,
        pickupStationId: s.pickupStationId ?? null,
        trackingNumber: s.trackingNumber,
        status: s.status,
        shippingMethod: s.shippingMethod,
        deliveryFee: s.deliveryFee,
        heavyItemSurcharge: s.heavyItemSurcharge ?? null,
        supportsCOD: s.supportsCOD,
        fragileFee: s.fragileFee ?? null,
        sameDayFee: s.sameDayFee ?? null,
        weight: s.weight ?? null,
        volumetricWeight: s.volumetricWeight ?? null,
        chargeableWeight: s.chargeableWeight ?? null,
        estimatedDays: s.estimatedDays ?? null,
        shippedAt: s.shippedAt ?? null,
        deliveredAt: s.deliveredAt ?? null,
        notes: s.notes ?? null,
        failedReason: s.failedReason ?? null,
      });
    }
  }, [showEditModal, shipmentDetail]);

  /* ---------------------------------------------------------
     Form handlers
  --------------------------------------------------------- */
  const resetCreateForm = () => setCreateForm(initialCreateFormState);

  const handleCreateInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setCreateForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value === "" ? null : value,
    }));
  };

  const handleStatusInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setStatusForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateTracking = () => {
    const newTracking = generateTrackingNumber();
    setCreateForm((prev) => ({ ...prev, trackingNumber: newTracking }));
  };

  /* ---------------------------------------------------------
     API actions
  --------------------------------------------------------- */
  const handleCreateShipment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!createForm.orderId || !createForm.courierId || !createForm.trackingNumber) {
      alert("Order ID, Courier ID, and Tracking Number are required");
      return;
    }

    const payload: CreateShipmentInput = {
      orderId: createForm.orderId,
      courierId: createForm.courierId,
      shippingRateId: createForm.shippingRateId || null,
      pickupStationId: createForm.pickupStationId || null,
      trackingNumber: createForm.trackingNumber,
      status: createForm.status,
      shippingMethod: createForm.shippingMethod,
      deliveryFee: parseFloat(createForm.deliveryFee) || 0,
      heavyItemSurcharge: createForm.heavyItemSurcharge ? parseFloat(createForm.heavyItemSurcharge) : null,
      supportsCOD: createForm.supportsCOD,
      fragileFee: createForm.fragileFee ? parseFloat(createForm.fragileFee) : null,
      sameDayFee: createForm.sameDayFee ? parseFloat(createForm.sameDayFee) : null,
      weight: createForm.weight ? parseFloat(createForm.weight) : null,
      volumetricWeight: createForm.volumetricWeight ? parseFloat(createForm.volumetricWeight) : null,
      chargeableWeight: createForm.chargeableWeight ? parseFloat(createForm.chargeableWeight) : null,
      estimatedDays: createForm.estimatedDays ? parseInt(createForm.estimatedDays, 10) : null,
      shippedAt: createForm.shippedAt || null,
      deliveredAt: createForm.deliveredAt || null,
      notes: createForm.notes || null,
      failedReason: createForm.failedReason || null,
    };

    try {
      await createShipment(payload).unwrap();
      alert("Shipment created successfully");
      resetCreateForm();
      setShowCreateForm(false);
      refetch();
    } catch (error) {
      console.error(error);
      alert("Failed to create shipment");
    }
  };

  const handleUpdateShipment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedShipmentId) return;

    try {
      await updateShipment({ id: selectedShipmentId, data: editForm }).unwrap();
      alert("Shipment updated successfully");
      setShowEditModal(false);
      setSelectedShipmentId(null);
      refetch();
    } catch (error) {
      console.error(error);
      alert("Failed to update shipment");
    }
  };

  const handleUpdateStatus = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedShipmentId) return;

    const payload: UpdateShipmentStatusInput = {
      status: statusForm.status,
      failedReason: statusForm.failedReason || null,
      shippedAt: statusForm.shippedAt || null,
      deliveredAt: statusForm.deliveredAt || null,
      location: statusForm.location || undefined,
    };

    try {
      await updateStatus({ id: selectedShipmentId, data: payload }).unwrap();
      alert("Status updated successfully");
      setShowStatusModal(false);
      setSelectedShipmentId(null);
      refetch();
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this shipment? This action cannot be undone.")) return;
    try {
      await deleteShipment(id).unwrap();
      alert("Shipment deleted successfully");
      refetch();
    } catch (error) {
      console.error(error);
      alert("Failed to delete shipment");
    }
  };

  const openStatusModal = (shipment: Shipment) => {
    setSelectedShipmentId(shipment.id);
    setStatusForm({
      status: shipment.status,
      failedReason: shipment.failedReason || "",
      shippedAt: shipment.shippedAt ? shipment.shippedAt.slice(0, 16) : "",
      deliveredAt: shipment.deliveredAt ? shipment.deliveredAt.slice(0, 16) : "",
      location: "",
    });
    setShowStatusModal(true);
  };

  const openEditModal = (id: string) => {
    setSelectedShipmentId(id);
    setShowEditModal(true);
  };

  const handleTrack = () => {
    if (!trackingNumberInput.trim()) {
      alert("Please enter a tracking number");
      return;
    }
    setShowTrackModal(true);
    refetchTrack();
  };

  const getStatusBadgeColor = (status: ShipmentStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      case "IN_TRANSIT":
        return "bg-purple-100 text-purple-800";
      case "OUT_FOR_DELIVERY":
        return "bg-orange-100 text-orange-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">📦 Shipment Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create, track, and manage shipments for customer orders.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {showCreateForm ? "✖ Close Form" : "➕ Create Shipment"}
          </button>
        </div>

        {/* CREATE FORM */}
        {showCreateForm && (
          <form
            onSubmit={handleCreateShipment}
            className="space-y-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all lg:p-8"
          >
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-gray-800">✈️ New Shipment</h2>
              <p className="text-sm text-gray-500">Fill in the shipment details below.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Required fields */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Order ID <span className="text-red-500">*</span>
                </label>
                <input
                  name="orderId"
                  value={createForm.orderId}
                  onChange={handleCreateInputChange}
                  required
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Courier ID <span className="text-red-500">*</span>
                </label>
                <input
                  name="courierId"
                  value={createForm.courierId}
                  onChange={handleCreateInputChange}
                  required
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tracking Number</label>
                <div className="flex gap-2">
                  <input
                    name="trackingNumber"
                    value={createForm.trackingNumber}
                    onChange={handleCreateInputChange}
                    placeholder="Auto-generated if empty"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateTracking}
                    className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    🎲 Generate
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Shipping Method</label>
                <select
                  name="shippingMethod"
                  value={createForm.shippingMethod}
                  onChange={handleCreateInputChange}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                >
                  <option value="STANDARD">Standard</option>
                  <option value="EXPRESS">Express</option>
                  <option value="SAME_DAY">Same Day</option>
                  <option value="PICKUP_STATION">Pickup Station</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Delivery Fee ($)</label>
                <input
                  name="deliveryFee"
                  type="number"
                  step="any"
                  value={createForm.deliveryFee}
                  onChange={handleCreateInputChange}
                  required
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="supportsCOD"
                    checked={createForm.supportsCOD}
                    onChange={handleCreateInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  Supports COD
                </label>
              </div>

              {/* Optional fields */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Weight (kg)</label>
                <input
                  name="weight"
                  type="number"
                  step="any"
                  value={createForm.weight}
                  onChange={handleCreateInputChange}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Volumetric Weight (kg)</label>
                <input
                  name="volumetricWeight"
                  type="number"
                  step="any"
                  value={createForm.volumetricWeight}
                  onChange={handleCreateInputChange}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Estimated Days</label>
                <input
                  name="estimatedDays"
                  type="number"
                  value={createForm.estimatedDays}
                  onChange={handleCreateInputChange}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Shipped At</label>
                <input
                  type="datetime-local"
                  name="shippedAt"
                  value={createForm.shippedAt}
                  onChange={handleCreateInputChange}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Delivered At</label>
                <input
                  type="datetime-local"
                  name="deliveredAt"
                  value={createForm.deliveredAt}
                  onChange={handleCreateInputChange}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  value={createForm.notes}
                  onChange={handleCreateInputChange}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-50"
              >
                {creating ? "⏳ Saving..." : "✅ Create Shipment"}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetCreateForm();
                  setShowCreateForm(false);
                }}
                className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* FILTERS & ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value as ShipmentStatus || undefined)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 pr-8 text-sm shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="SHIPPED">Shipped</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="FAILED">Failed</option>
            </select>
            <input
              type="text"
              placeholder="Courier ID"
              value={courierFilter}
              onChange={(e) => setCourierFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
            />
            <input
              type="text"
              placeholder="Search (order/tracking)"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
            />
            <button
              type="button"
              onClick={() => {
                setStatusFilter(undefined);
                setCourierFilter("");
                setSearchFilter("");
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50"
            >
              Clear Filters
            </button>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50"
            >
              🔄 Refresh
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Tracking number"
              value={trackingNumberInput}
              onChange={(e) => setTrackingNumberInput(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
            />
            <button
              type="button"
              onClick={handleTrack}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              🔍 Track
            </button>
          </div>
          <div className="text-sm text-gray-500">{isFetching && "🔄 Updating..."}</div>
        </div>

        {/* SHIPMENTS TABLE */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tracking #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Courier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {isLoading && (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-green-600"></div>
                        <span className="ml-2">Loading shipments...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!isLoading && data?.data?.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                      ✨ No shipments found. Create your first shipment above.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  data?.data?.map((shipment) => (
                    <tr key={shipment.id} className="transition hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setTrackingNumberInput(shipment.trackingNumber);
                              handleTrack();
                            }}
                            className="text-blue-600 hover:underline"
                          >
                            {shipment.trackingNumber}
                          </button>
                          <button
                            onClick={() => copyToClipboard(shipment.trackingNumber)}
                            className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                            title="Copy tracking number"
                          >
                            📋
                          </button>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{shipment.orderId}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{shipment.courierId}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{shipment.shippingMethod}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeColor(shipment.status)}`}>
                          {shipment.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">${shipment.deliveryFee.toFixed(2)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{formatDate(shipment.createdAt)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <button
                          onClick={() => openStatusModal(shipment)}
                          className="rounded-md px-2 py-1 text-blue-600 transition hover:bg-blue-50"
                          title="Update status"
                        >
                          📌
                        </button>
                        <button
                          onClick={() => openEditModal(shipment.id)}
                          className="rounded-md px-2 py-1 text-indigo-600 transition hover:bg-indigo-50"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(shipment.id)}
                          disabled={deleting}
                          className="rounded-md px-2 py-1 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          title="Delete"
                        >
                          🗑️
                        </button>
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
              disabled={!data?.pagination || page >= data.pagination.totalPages}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{data?.pagination?.page ?? page}</span> of{" "}
                <span className="font-medium">{data?.pagination?.totalPages ?? 1}</span>
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
                  disabled={!data?.pagination || page >= data.pagination.totalPages}
                  className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT SHIPMENT MODAL */}
      {showEditModal && shipmentDetail?.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">Edit Shipment</h2>
            <form onSubmit={handleUpdateShipment} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Courier ID</label>
                  <input name="courierId" value={editForm.courierId || ""} onChange={handleEditInputChange} className="w-full rounded-lg border px-3 py-2" />
                </div>
                <div>
                  <label className="text-sm font-medium">Tracking Number</label>
                  <input name="trackingNumber" value={editForm.trackingNumber || ""} onChange={handleEditInputChange} className="w-full rounded-lg border px-3 py-2" />
                </div>
                <div>
                  <label className="text-sm font-medium">Shipping Method</label>
                  <select name="shippingMethod" value={editForm.shippingMethod || "STANDARD"} onChange={handleEditInputChange} className="w-full rounded-lg border px-3 py-2">
                    <option value="STANDARD">Standard</option>
                    <option value="EXPRESS">Express</option>
                    <option value="SAME_DAY">Same Day</option>
                    <option value="PICKUP_STATION">Pickup Station</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Delivery Fee ($)</label>
                  <input name="deliveryFee" type="number" step="any" value={editForm.deliveryFee || ""} onChange={handleEditInputChange} className="w-full rounded-lg border px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Notes</label>
                  <textarea name="notes" rows={2} value={editForm.notes || ""} onChange={handleEditInputChange} className="w-full rounded-lg border px-3 py-2" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="rounded-lg border border-gray-300 px-4 py-2">Cancel</button>
                <button type="submit" disabled={updating} className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {showStatusModal && selectedShipmentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">Update Shipment Status</h2>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <select name="status" value={statusForm.status} onChange={handleStatusInputChange} className="w-full rounded-lg border px-3 py-2">
                  <option value="PENDING">Pending</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
              {statusForm.status === "FAILED" && (
                <div>
                  <label className="text-sm font-medium">Failed Reason</label>
                  <input name="failedReason" value={statusForm.failedReason} onChange={handleStatusInputChange} className="w-full rounded-lg border px-3 py-2" />
                </div>
              )}
              {(statusForm.status === "SHIPPED" || statusForm.status === "IN_TRANSIT" || statusForm.status === "OUT_FOR_DELIVERY") && (
                <div>
                  <label className="text-sm font-medium">Shipped At</label>
                  <input type="datetime-local" name="shippedAt" value={statusForm.shippedAt} onChange={handleStatusInputChange} className="w-full rounded-lg border px-3 py-2" />
                </div>
              )}
              {statusForm.status === "DELIVERED" && (
                <div>
                  <label className="text-sm font-medium">Delivered At</label>
                  <input type="datetime-local" name="deliveredAt" value={statusForm.deliveredAt} onChange={handleStatusInputChange} className="w-full rounded-lg border px-3 py-2" />
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Location (optional)</label>
                <input name="location" value={statusForm.location} onChange={handleStatusInputChange} className="w-full rounded-lg border px-3 py-2" placeholder="City, warehouse, etc." />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowStatusModal(false)} className="rounded-lg border border-gray-300 px-4 py-2">Cancel</button>
                <button type="submit" disabled={updatingStatus} className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50">Update Status</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRACK SHIPMENT MODAL */}
      {showTrackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">Track Shipment</h2>
            {trackedShipment ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p><strong>Tracking #:</strong> {trackedShipment.data.trackingNumber}</p>
                  <button
                    onClick={() => copyToClipboard(trackedShipment.data.trackingNumber)}
                    className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                    title="Copy tracking number"
                  >
                    📋
                  </button>
                </div>
                <p><strong>Status:</strong> <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadgeColor(trackedShipment.data.status)}`}>{trackedShipment.data.status}</span></p>
                <p><strong>Current Location:</strong> {trackedShipment.data.events?.slice(-1)[0]?.location || "—"}</p>
                <div>
                  <strong>Events:</strong>
                  <ul className="mt-2 max-h-48 overflow-y-auto border-t pt-2 text-sm">
                    {trackedShipment.data.events?.map((ev) => (
                      <li key={ev.id} className="border-b py-2">
                        <span className="font-medium">{ev.status}</span> – {ev.title}<br />
                        <span className="text-xs text-gray-500">{formatDate(ev.createdAt)} {ev.location && `@ ${ev.location}`}</span>
                      </li>
                    ))}
                    {(!trackedShipment.data.events || trackedShipment.data.events.length === 0) && (
                      <li className="py-2 text-gray-500">No tracking events yet.</li>
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Loading tracking data...</p>
            )}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowTrackModal(false);
                  setTrackingNumberInput("");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShipments;