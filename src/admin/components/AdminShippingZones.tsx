import React, { useState, type ChangeEvent, useEffect } from "react";
import {
  useCreateZoneMutation,
  useGetAllZonesQuery,
  useUpdateZoneMutation,
  useToggleZoneStatusMutation,
  useDeleteZoneMutation,
  useGetAllStateMappingsQuery,
  useDeleteStateMappingMutation,
  useBulkAssignStatesMutation,
  useClearZoneStatesMutation,
  useGetAllLGAMappingsQuery,
  useDeleteLGAMappingMutation,
  useBulkAssignLGAsMutation,
  useClearZoneLGAsMutation,
  useGetLGAsByZoneQuery,
} from "../../services/shippingZoneApi";

// Location API hooks
import {
  useGetStatesQuery,
  useGetLgasByStateQuery,
  type StateOption,
  type LgaOption,
} from "../../services/locationApi";

// Shared zone type
import type { ShippingZone, ShippingZoneLGA, ShippingZoneState } from "../../types/shipping-zone.types";

// ----------------------------------------------------------------------
// Helper: Normalize API responses that may be { data: T[] } or T[]
// ----------------------------------------------------------------------
function normalizeArray<T>(raw: T[] | { data: T[] } | undefined): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && "data" in raw && Array.isArray(raw.data)) {
    return raw.data;
  }
  return [];
}

// ----------------------------------------------------------------------
// Form state interface
// ----------------------------------------------------------------------
interface ZoneFormState {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

const initialZoneForm: ZoneFormState = {
  name: "",
  code: "",
  description: "",
  isActive: true,
};

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
const AdminShippingZones: React.FC = () => {
  // UI state
  const [activeTab, setActiveTab] = useState<"zones" | "stateMappings" | "lgaMappings">("zones");
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [zoneForm, setZoneForm] = useState<ZoneFormState>(initialZoneForm);

  // Assignment modals state
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [showStateAssigner, setShowStateAssigner] = useState(false);
  const [showLGAAssigner, setShowLGAAssigner] = useState(false);
  const [bulkStateIds, setBulkStateIds] = useState("");
  const [bulkLgaIds, setBulkLgaIds] = useState("");

  // Interactive selection state
  const [selectedStateIds, setSelectedStateIds] = useState<string[]>([]);
  const [selectedLgaIds, setSelectedLgaIds] = useState<string[]>([]);
  const [selectedStateForLga, setSelectedStateForLga] = useState<string>("");

  // ----------------------------------------------------------------------
  // Queries
  // ----------------------------------------------------------------------
  const {
    data: zones = [],
    isLoading: zonesLoading,
    refetch: refetchZones,
  } = useGetAllZonesQuery();

  const {
    data: stateMappingsRaw,
    isLoading: stateMappingsLoading,
    refetch: refetchStateMappings,
    error: stateMappingsError,
  } = useGetAllStateMappingsQuery();

  const {
    data: lgaMappingsRaw,
    isLoading: lgaMappingsLoading,
    refetch: refetchLgaMappings,
    error: lgaMappingsError,
  } = useGetAllLGAMappingsQuery();

  // Normalize responses
  const stateMappings: ShippingZoneState[] = normalizeArray(stateMappingsRaw);
  const lgaMappings: ShippingZoneLGA[] = normalizeArray(lgaMappingsRaw);

  // LGAs for the currently selected zone
  const { data: zoneLGAsRaw = [] } = useGetLGAsByZoneQuery(selectedZoneId ?? "", {
    skip: !selectedZoneId,
  });
  const zoneLGAs: ShippingZoneLGA[] = normalizeArray(zoneLGAsRaw);

  // Location data
  const { data: allStatesRaw = [], isLoading: statesLoading } = useGetStatesQuery();
  const allStates: StateOption[] = normalizeArray(allStatesRaw);

  const { data: lgasByStateRaw = [], isLoading: lgasLoading } = useGetLgasByStateQuery(
    selectedStateForLga,
    { skip: !selectedStateForLga }
  );
  const lgasByState: LgaOption[] = normalizeArray(lgasByStateRaw);

  // ----------------------------------------------------------------------
  // Mutations
  // ----------------------------------------------------------------------
  const [createZone, { isLoading: creatingZone }] = useCreateZoneMutation();
  const [updateZone, { isLoading: updatingZone }] = useUpdateZoneMutation();
  const [toggleZoneStatus] = useToggleZoneStatusMutation();
  const [deleteZone] = useDeleteZoneMutation();

  const [deleteStateMapping] = useDeleteStateMappingMutation();
  const [bulkAssignStates, { isLoading: bulkAssigningStates }] = useBulkAssignStatesMutation();
  const [clearZoneStates] = useClearZoneStatesMutation();

  const [deleteLgaMapping] = useDeleteLGAMappingMutation();
  const [bulkAssignLgas, { isLoading: bulkAssigningLgas }] = useBulkAssignLGAsMutation();
  const [clearZoneLgas] = useClearZoneLGAsMutation();

  // Debug logging (optional)
  useEffect(() => {
    console.log("State mappings:", stateMappings);
    console.log("LGA mappings:", lgaMappings);
  }, [stateMappings, lgaMappings]);

  // ----------------------------------------------------------------------
  // Zone form handlers
  // ----------------------------------------------------------------------
  const resetZoneForm = () => {
    setZoneForm(initialZoneForm);
    setEditingZone(null);
  };

  const handleZoneInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setZoneForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateOrUpdateZone = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editingZone) {
        await updateZone({ id: editingZone.id, data: zoneForm }).unwrap();
        alert("Zone updated successfully");
      } else {
        await createZone(zoneForm).unwrap();
        alert("Zone created successfully");
      }
      resetZoneForm();
      setShowZoneModal(false);
      refetchZones();
    } catch (err: any) {
      console.error(err);
      alert(err?.data?.message || "Failed to save zone");
    }
  };

  const handleToggleStatus = async (zone: ShippingZone) => {
    try {
      await toggleZoneStatus(zone.id).unwrap();
      refetchZones();
    } catch (err) {
      console.error(err);
      alert("Failed to toggle status");
    }
  };

  const handleDeleteZone = async (id: string) => {
    if (
      !window.confirm(
        "Delete this zone? This will also remove all state and LGA mappings."
      )
    )
      return;
    try {
      await deleteZone(id).unwrap();
      alert("Zone deleted");
      refetchZones();
      if (selectedZoneId === id) {
        setSelectedZoneId(null);
        setShowStateAssigner(false);
        setShowLGAAssigner(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete zone");
    }
  };

  const openEditModal = (zone: ShippingZone) => {
    setEditingZone(zone);
    setZoneForm({
      name: zone.name,
      code: zone.code,
      description: zone.description ?? "",
      isActive: zone.isActive,
    });
    setShowZoneModal(true);
  };

  // ----------------------------------------------------------------------
  // State mapping handlers
  // ----------------------------------------------------------------------
  const handleDeleteStateMapping = async (id: string) => {
    if (!window.confirm("Remove this state from the zone?")) return;
    try {
      await deleteStateMapping(id).unwrap();
      alert("State mapping removed");
      await refetchStateMappings();
    } catch (err) {
      console.error(err);
      alert("Failed to remove state mapping");
    }
  };

  const handleAssignSelectedStates = async () => {
    if (!selectedZoneId) return;
    if (selectedStateIds.length === 0) {
      alert("Select at least one state to assign");
      return;
    }
    try {
      await bulkAssignStates({ zoneId: selectedZoneId, stateIds: selectedStateIds }).unwrap();
      alert("States assigned successfully");
      setSelectedStateIds([]);
      await refetchStateMappings();
    } catch (err) {
      console.error(err);
      alert("Bulk assign failed");
    }
  };

  const handleBulkAssignStates = async () => {
    if (!selectedZoneId) return;
    const stateIds = bulkStateIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (stateIds.length === 0) {
      alert("Enter at least one state ID");
      return;
    }
    try {
      await bulkAssignStates({ zoneId: selectedZoneId, stateIds }).unwrap();
      alert("States assigned successfully");
      setBulkStateIds("");
      await refetchStateMappings();
    } catch (err) {
      console.error(err);
      alert("Bulk assign failed");
    }
  };

  const handleClearZoneStates = async () => {
    if (!selectedZoneId) return;
    if (!window.confirm("Remove ALL state assignments from this zone?")) return;
    try {
      await clearZoneStates(selectedZoneId).unwrap();
      alert("All states removed from zone");
      await refetchStateMappings();
    } catch (err) {
      console.error(err);
      alert("Failed to clear states");
    }
  };

  const toggleStateSelection = (stateId: string) => {
    setSelectedStateIds((prev) =>
      prev.includes(stateId) ? prev.filter((id) => id !== stateId) : [...prev, stateId]
    );
  };

  const toggleAllStates = () => {
    const alreadyAssignedStateIds = stateMappings
      .filter((m) => m.zoneId === selectedZoneId)
      .map((m) => m.stateId);
    const availableStates = allStates.filter((s) => !alreadyAssignedStateIds.includes(s.id));
    if (selectedStateIds.length === availableStates.length) {
      setSelectedStateIds([]);
    } else {
      setSelectedStateIds(availableStates.map((s) => s.id));
    }
  };

  // ----------------------------------------------------------------------
  // LGA mapping handlers
  // ----------------------------------------------------------------------
  const handleDeleteLgaMapping = async (id: string) => {
    if (!window.confirm("Remove this LGA from the zone?")) return;
    try {
      await deleteLgaMapping(id).unwrap();
      alert("LGA mapping removed");
      await refetchLgaMappings();
    } catch (err) {
      console.error(err);
      alert("Failed to remove LGA mapping");
    }
  };

  const handleAssignSelectedLgas = async () => {
    if (!selectedZoneId) return;
    if (selectedLgaIds.length === 0) {
      alert("Select at least one LGA to assign");
      return;
    }
    try {
      await bulkAssignLgas({ zoneId: selectedZoneId, lgaIds: selectedLgaIds }).unwrap();
      alert("LGAs assigned successfully");
      setSelectedLgaIds([]);
      await refetchLgaMappings();
    } catch (err) {
      console.error(err);
      alert("Bulk assign failed");
    }
  };

  const handleBulkAssignLgas = async () => {
    if (!selectedZoneId) return;
    const lgaIds = bulkLgaIds
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lgaIds.length === 0) {
      alert("Enter at least one LGA ID");
      return;
    }
    try {
      await bulkAssignLgas({ zoneId: selectedZoneId, lgaIds }).unwrap();
      alert("LGAs assigned successfully");
      setBulkLgaIds("");
      await refetchLgaMappings();
    } catch (err) {
      console.error(err);
      alert("Bulk assign failed");
    }
  };

  const handleClearZoneLgas = async () => {
    if (!selectedZoneId) return;
    if (!window.confirm("Remove ALL LGA assignments from this zone?")) return;
    try {
      await clearZoneLgas(selectedZoneId).unwrap();
      alert("All LGAs removed from zone");
      await refetchLgaMappings();
    } catch (err) {
      console.error(err);
      alert("Failed to clear LGAs");
    }
  };

  const toggleLgaSelection = (lgaId: string) => {
    setSelectedLgaIds((prev) =>
      prev.includes(lgaId) ? prev.filter((id) => id !== lgaId) : [...prev, lgaId]
    );
  };

  const toggleAllLgas = () => {
    const alreadyAssignedLgaIds = zoneLGAs.map((m) => m.lgaId);
    const availableLgas = lgasByState.filter((l) => !alreadyAssignedLgaIds.includes(l.id));
    if (selectedLgaIds.length === availableLgas.length) {
      setSelectedLgaIds([]);
    } else {
      setSelectedLgaIds(availableLgas.map((l) => l.id));
    }
  };

  const closeStateAssigner = () => {
    setShowStateAssigner(false);
    setSelectedZoneId(null);
    setBulkStateIds("");
    setSelectedStateIds([]);
  };

  const closeLGAAssigner = () => {
    setShowLGAAssigner(false);
    setSelectedZoneId(null);
    setBulkLgaIds("");
    setSelectedLgaIds([]);
    setSelectedStateForLga("");
  };

  // ----------------------------------------------------------------------
  // Render helpers
  // ----------------------------------------------------------------------
  const getStatusBadge = (isActive: boolean) => (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );


  const [rotateDeg, setRotateDeg] = useState(0);

const handleRefresh = async () => {
  // Spin the icon once
  setRotateDeg(prev => prev + 360);
  // Refresh data
  await Promise.all([refetchStateMappings(), refetchLgaMappings()]);
  // Reset rotation after animation ends (0.4s)
  setTimeout(() => setRotateDeg(prev => prev % 360), 400);
};

  // ----------------------------------------------------------------------
  // Main JSX
  // ----------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              📦 Shipping Zones Manager
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage zones, state assignments, and LGA assignments.
            </p>
          </div>
          <div className="flex gap-2">
  <button
    type="button"
    onClick={() => {
      resetZoneForm();
      setShowZoneModal(true);
    }}
    className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:shadow-md"
  >
    ➕ Create Zone
  </button>

  <button
    onClick={handleRefresh}
    className="rounded-xl px-3 py-2 text-xs shadow transition-all hover:scale-105"
    title="Refresh mappings"
  >
    <span
      className="inline-block"
      style={{
        transform: `rotate(${rotateDeg}deg)`,
        transition: "transform 0.4s ease-out",
      }}
    >
      🔄
    </span>
    Refresh
  </button>
</div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 bg-white px-4">
          {(["zones", "stateMappings", "lgaMappings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "zones" && "🏷️ Zones"}
              {tab === "stateMappings" && "🗺️ State Mappings"}
              {tab === "lgaMappings" && "📍 LGA Mappings"}
            </button>
          ))}
        </div>

        {/* ==================== ZONES TAB ==================== */}
        {activeTab === "zones" && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {zonesLoading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        Loading zones...
                      </td>
                    </tr>
                  )}
                  {!zonesLoading && zones.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        No zones yet. Click "Create Zone" to start.
                      </td>
                    </tr>
                  )}
                  {!zonesLoading &&
                    zones.map((zone) => (
                      <tr key={zone.id} className="transition hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {zone.name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-gray-600">
                          {zone.code}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {getStatusBadge(zone.isActive)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {zone.description || "—"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm space-x-2">
                          <button
                            onClick={() => openEditModal(zone)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(zone)}
                            className="text-yellow-600 hover:text-yellow-800"
                          >
                            {zone.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedZoneId(zone.id);
                              setShowStateAssigner(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            Assign States
                          </button>
                          <button
                            onClick={() => {
                              setSelectedZoneId(zone.id);
                              setShowLGAAssigner(true);
                            }}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            Assign LGAs
                          </button>
                          <button
                            onClick={() => handleDeleteZone(zone.id)}
                            className="text-red-600 hover:text-red-800"
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
        )}

        {/* ==================== STATE MAPPINGS TAB ==================== */}
        {activeTab === "stateMappings" && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {stateMappingsError && (
              <div className="bg-red-50 p-4 text-red-700 border-b border-red-200">
                <strong>⚠️ Backend routing error</strong><br />
                The endpoint <code className="bg-red-100 px-1">/api/shipping-zones/states</code> is returning a 500 error.
                <br />
                <span className="text-sm">
                  This usually happens when your Express routes are misordered – collection routes must come before single‑item routes.
                  <br />
                  Fix: Move <code>router.get('/states', getAllStateMappings)</code> <strong>above</strong> <code>router.get('/states/:id', ...)</code>.
                </span>
                <br />
                <button
                  onClick={() => refetchStateMappings()}
                  className="mt-2 text-xs bg-red-100 px-2 py-1 rounded"
                >
                  Retry
                </button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Zone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      State
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stateMappingsLoading && (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
                        Loading mappings...
                      </td>
                    </tr>
                  )}
                  {!stateMappingsLoading && !stateMappingsError && stateMappings.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
                        No state assignments found.
                        <button
                          onClick={() => refetchStateMappings()}
                          className="ml-2 text-blue-600 underline"
                        >
                          Refresh
                        </button>
                      </td>
                    </tr>
                  )}
                  {!stateMappingsLoading &&
                    !stateMappingsError &&
                    stateMappings.map((mapping) => (
                      <tr key={mapping.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {mapping.zone?.name ?? mapping.zoneId ?? "Unknown"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {mapping.state?.name ?? mapping.stateId ?? "Unknown"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteStateMapping(mapping.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== LGA MAPPINGS TAB ==================== */}
        {activeTab === "lgaMappings" && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {lgaMappingsError && (
              <div className="bg-red-50 p-4 text-red-700 border-b border-red-200">
                ⚠️ Error loading LGA mappings: {JSON.stringify(lgaMappingsError)}
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Zone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      LGA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      State
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lgaMappingsLoading && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                        Loading LGA mappings...
                      </td>
                    </tr>
                  )}
                  {!lgaMappingsLoading && lgaMappings.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                        No LGA assignments found.
                        <button
                          onClick={() => refetchLgaMappings()}
                          className="ml-2 text-blue-600 underline"
                        >
                          Refresh
                        </button>
                      </td>
                    </tr>
                  )}
                  {!lgaMappingsLoading &&
                    lgaMappings.map((mapping) => (
                      <tr key={mapping.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {mapping.zone?.name ?? mapping.zoneId ?? "Unknown"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {mapping.lga?.name ?? mapping.lgaId ?? "Unknown"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {mapping.lga?.state?.name ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteLgaMapping(mapping.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== MODAL: Create/Edit Zone ==================== */}
        {showZoneModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
              <form onSubmit={handleCreateOrUpdateZone} className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">
                  {editingZone ? "Edit Zone" : "New Zone"}
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name *
                  </label>
                  <input
                    name="name"
                    value={zoneForm.name}
                    onChange={handleZoneInputChange}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Code *
                  </label>
                  <input
                    name="code"
                    value={zoneForm.code}
                    onChange={handleZoneInputChange}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={zoneForm.description}
                    onChange={handleZoneInputChange}
                    rows={2}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={zoneForm.isActive}
                    onChange={handleZoneInputChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label className="text-sm text-gray-700">Active</label>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowZoneModal(false);
                      resetZoneForm();
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingZone || updatingZone}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                  >
                    {creatingZone || updatingZone ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== MODAL: State Assigner ==================== */}
        {showStateAssigner && selectedZoneId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold">Manage States for Zone</h2>
              <p className="text-sm text-gray-500">
                Zone ID: <code className="bg-gray-100 px-1 rounded">{selectedZoneId}</code>
              </p>

              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Available States</h3>
                  <button
                    type="button"
                    onClick={toggleAllStates}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {(() => {
                      const alreadyAssigned = stateMappings
                        .filter((m) => m.zoneId === selectedZoneId)
                        .map((m) => m.stateId);
                      const available = allStates.filter(
                        (s) => !alreadyAssigned.includes(s.id)
                      );
                      return selectedStateIds.length === available.length
                        ? "Deselect All"
                        : "Select All";
                    })()}
                  </button>
                </div>
                {statesLoading ? (
                  <p className="text-sm text-gray-500">Loading states...</p>
                ) : allStates.length === 0 ? (
                  <p className="text-sm text-gray-500">No states found.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {allStates.map((state) => {
                      const isAlreadyAssigned = stateMappings.some(
                        (m) => m.zoneId === selectedZoneId && m.stateId === state.id
                      );
                      if (isAlreadyAssigned) return null;
                      return (
                        <label key={state.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedStateIds.includes(state.id)}
                            onChange={() => toggleStateSelection(state.id)}
                            className="rounded border-gray-300"
                          />
                          {state.name}
                        </label>
                      );
                    })}
                  </div>
                )}
                <button
                  onClick={handleAssignSelectedStates}
                  disabled={selectedStateIds.length === 0 || bulkAssigningStates}
                  className="mt-3 w-full bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                >
                  Assign Selected ({selectedStateIds.length})
                </button>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium">
                  Bulk Assign (comma‑separated State IDs)
                </label>
                <div className="flex gap-2 mt-1">
                  <input
                    value={bulkStateIds}
                    onChange={(e) => setBulkStateIds(e.target.value)}
                    placeholder="state-uuid-1, state-uuid-2"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
                  />
                  <button
                    onClick={handleBulkAssignStates}
                    disabled={bulkAssigningStates}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    Assign
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleClearZoneStates}
                  className="text-red-600 text-sm hover:underline"
                >
                  Remove all states from this zone
                </button>
              </div>

              <div className="border-t pt-2">
                <h3 className="font-medium mb-2">Current State Assignments</h3>
                <div className="max-h-40 overflow-y-auto">
                  {stateMappings.filter((m) => m.zoneId === selectedZoneId).length ===
                  0 ? (
                    <p className="text-sm text-gray-500">No states assigned yet.</p>
                  ) : (
                    <ul className="divide-y">
                      {stateMappings
                        .filter((m) => m.zoneId === selectedZoneId)
                        .map((m) => (
                          <li key={m.id} className="flex justify-between py-2">
                            <span>{m.state?.name ?? m.stateId}</span>
                            <button
                              onClick={() => handleDeleteStateMapping(m.id)}
                              className="text-red-600 text-sm"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={closeStateAssigner}
                  className="rounded-lg border border-gray-300 px-4 py-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== MODAL: LGA Assigner ==================== */}
        {showLGAAssigner && selectedZoneId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold">Manage LGAs for Zone</h2>
              <p className="text-sm text-gray-500">
                Zone ID: <code className="bg-gray-100 px-1 rounded">{selectedZoneId}</code>
              </p>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Select State to load LGAs
                </label>
                <select
                  value={selectedStateForLga}
                  onChange={(e) => {
                    setSelectedStateForLga(e.target.value);
                    setSelectedLgaIds([]);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="">-- Choose a state --</option>
                  {allStates.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedStateForLga && (
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">LGAs in selected state</h3>
                    <button
                      type="button"
                      onClick={toggleAllLgas}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {(() => {
                        const alreadyAssigned = zoneLGAs.map((m) => m.lgaId);
                        const available = lgasByState.filter(
                          (l) => !alreadyAssigned.includes(l.id)
                        );
                        return selectedLgaIds.length === available.length
                          ? "Deselect All"
                          : "Select All";
                      })()}
                    </button>
                  </div>
                  {lgasLoading ? (
                    <p className="text-sm text-gray-500">Loading LGAs...</p>
                  ) : lgasByState.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No LGAs found for this state.
                    </p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {lgasByState.map((lga) => {
                        const isAlreadyAssigned = zoneLGAs.some(
                          (m) => m.lgaId === lga.id
                        );
                        if (isAlreadyAssigned) return null;
                        return (
                          <label key={lga.id} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedLgaIds.includes(lga.id)}
                              onChange={() => toggleLgaSelection(lga.id)}
                              className="rounded border-gray-300"
                            />
                            {lga.name}
                          </label>
                        );
                      })}
                    </div>
                  )}
                  <button
                    onClick={handleAssignSelectedLgas}
                    disabled={selectedLgaIds.length === 0 || bulkAssigningLgas}
                    className="mt-3 w-full bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                  >
                    Assign Selected ({selectedLgaIds.length})
                  </button>
                </div>
              )}

              <div className="border-t pt-4">
                <label className="block text-sm font-medium">
                  Bulk Assign (comma‑separated LGA IDs)
                </label>
                <div className="flex gap-2 mt-1">
                  <input
                    value={bulkLgaIds}
                    onChange={(e) => setBulkLgaIds(e.target.value)}
                    placeholder="lga-uuid-1, lga-uuid-2"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
                  />
                  <button
                    onClick={handleBulkAssignLgas}
                    disabled={bulkAssigningLgas}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    Assign
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleClearZoneLgas}
                  className="text-red-600 text-sm hover:underline"
                >
                  Remove all LGAs from this zone
                </button>
              </div>

              <div className="border-t pt-2">
                <h3 className="font-medium mb-2">Current LGA Assignments</h3>
                <div className="max-h-40 overflow-y-auto">
                  {zoneLGAs.length === 0 ? (
                    <p className="text-sm text-gray-500">No LGAs assigned yet.</p>
                  ) : (
                    <ul className="divide-y">
                      {zoneLGAs.map((m) => (
                        <li key={m.id} className="flex justify-between py-2">
                          <span>
                            {m.lga?.name ?? m.lgaId}
                            {m.lga?.state && (
                              <span className="text-xs text-gray-500 ml-2">
                                ({m.lga.state.name})
                              </span>
                            )}
                          </span>
                          <button
                            onClick={() => handleDeleteLgaMapping(m.id)}
                            className="text-red-600 text-sm"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={closeLGAAssigner}
                  className="rounded-lg border border-gray-300 px-4 py-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminShippingZones;