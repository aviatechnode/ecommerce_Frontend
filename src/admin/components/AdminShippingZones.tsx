import React, { useState, useCallback, useMemo, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  CheckBadgeIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

// =========================================================
// API HOOKS AND TYPES (adjust paths as needed)
// =========================================================
import {
  useGetShippingZonesQuery,
  useCreateShippingZoneMutation,
  useUpdateShippingZoneMutation,
  useToggleShippingZoneStatusMutation,
  useDeleteShippingZoneMutation,
  type ShippingZone,
  type State,
  type LGA,
} from '../../services/shippingZoneApi';

import {
  useGetStatesQuery,
  useGetLgasByStateQuery,
  type StateOption,
} from '../../services/locationApi';
// TYPES
interface NotificationState {
  message: string;
  type: 'success' | 'error';
}

// =========================================================
// SUBCOMPONENT: State & LGA Selector
// =========================================================
interface StateLgaSelectorProps {
  state: StateOption;
  isSelected: boolean;
  onStateToggle: (stateId: string, checked: boolean) => void;
  selectedLgaIds: string[];
  onLgaToggle: (lgaId: string, checked: boolean) => void;
  onRegisterLgaState: (lgaId: string, stateId: string) => void;
}

const StateLgaSelector: React.FC<StateLgaSelectorProps> = ({
  state,
  isSelected,
  onStateToggle,
  selectedLgaIds,
  onLgaToggle,
  onRegisterLgaState,
}) => {
  const { data: lgas, isLoading, error } = useGetLgasByStateQuery(state.id, {
    skip: !isSelected,
  });

  useEffect(() => {
    if (lgas && lgas.length > 0) {
      lgas.forEach((lga) => {
        onRegisterLgaState(lga.id, state.id);
      });
    }
  }, [lgas, state.id, onRegisterLgaState]);

  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onStateToggle(state.id, e.target.checked);
  };

  const selectedLgasForState = useMemo(() => {
    if (!lgas) return [];
    return lgas.filter((lga) => selectedLgaIds.includes(lga.id));
  }, [lgas, selectedLgaIds]);

  const allLgasSelected = lgas && lgas.length > 0 && selectedLgasForState.length === lgas.length;

  const handleToggleAllLgas = () => {
    if (!lgas) return;
    if (allLgasSelected) {
      lgas.forEach((lga) => {
        if (selectedLgaIds.includes(lga.id)) {
          onLgaToggle(lga.id, false);
        }
      });
    } else {
      lgas.forEach((lga) => {
        if (!selectedLgaIds.includes(lga.id)) {
          onLgaToggle(lga.id, true);
        }
      });
    }
  };

  return (
    <div className="border rounded-lg p-3 mb-3 bg-gray-50">
      <label className="flex items-center space-x-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleStateChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <span className="font-medium text-gray-900">{state.name}</span>
      </label>

      {isSelected && (
        <div className="ml-6 mt-3 pl-2 border-l-2 border-gray-200">
          {isLoading && <p className="text-sm text-gray-500">Loading LGAs...</p>}
          {error && <p className="text-sm text-red-500">Failed to load LGAs</p>}
          {lgas && lgas.length === 0 && (
            <p className="text-sm text-gray-500">No LGAs found for this state.</p>
          )}
          {lgas && lgas.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">Local Government Areas</span>
                <button
                  type="button"
                  onClick={handleToggleAllLgas}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {allLgasSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {lgas.map((lga) => (
                  <label key={lga.id} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedLgaIds.includes(lga.id)}
                      onChange={(e) => onLgaToggle(lga.id, e.target.checked)}
                      className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">{lga.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =========================================================
// MAIN COMPONENT: Shipping Zones Manager
// =========================================================
export const ShippingZonesManager: React.FC = () => {
  // Queries
  const {
    data: zones = [],
    isLoading: isLoadingZones,
    error: zonesError,
    refetch: refetchZones,
  } = useGetShippingZonesQuery();
  const { data: states = [], isLoading: isLoadingStates } = useGetStatesQuery();

  // Mutations
  const [createZone, { isLoading: isCreating }] = useCreateShippingZoneMutation();
  const [updateZone, { isLoading: isUpdating }] = useUpdateShippingZoneMutation();
  const [toggleStatus, { isLoading: isToggling }] = useToggleShippingZoneStatusMutation();
  const [deleteZone, { isLoading: isDeleting }] = useDeleteShippingZoneMutation();

  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Notification state (replaces toast)
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Form state
  const [formName, setFormName] = useState('');
  const [selectedStateIds, setSelectedStateIds] = useState<string[]>([]);
  const [selectedLgaIds, setSelectedLgaIds] = useState<string[]>([]);
  const [lgaToStateMap, setLgaToStateMap] = useState<Record<string, string>>({});

  const registerLgaState = useCallback((lgaId: string, stateId: string) => {
    setLgaToStateMap((prev) => ({ ...prev, [lgaId]: stateId }));
  }, []);

  const resetForm = () => {
    setFormName('');
    setSelectedStateIds([]);
    setSelectedLgaIds([]);
    setLgaToStateMap({});
    setEditingZone(null);
  };

  const handleCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (zone: ShippingZone) => {
    setEditingZone(zone);
    setFormName(zone.name);
    const stateIds = zone.states.map((s: State) => s.id);
    const lgaIds = zone.lgas.map((l: LGA) => l.id);
    setSelectedStateIds(stateIds);
    setSelectedLgaIds(lgaIds);
    const newMap: Record<string, string> = {};
    zone.lgas.forEach((lga: LGA) => {
      newMap[lga.id] = lga.stateId;
    });
    setLgaToStateMap((prev) => ({ ...prev, ...newMap }));
    setIsModalOpen(true);
  };

  const handleStateToggle = (stateId: string, checked: boolean) => {
    if (checked) {
      setSelectedStateIds((prev) => [...prev, stateId]);
    } else {
      setSelectedStateIds((prev) => prev.filter((id) => id !== stateId));
      const lgaIdsToRemove = Object.entries(lgaToStateMap)
        .filter(([, stId]) => stId === stateId)
        .map(([lgaId]) => lgaId);
      if (lgaIdsToRemove.length > 0) {
        setSelectedLgaIds((prev) => prev.filter((id) => !lgaIdsToRemove.includes(id)));
      }
    }
  };

  const handleLgaToggle = (lgaId: string, checked: boolean) => {
    if (checked) {
      setSelectedLgaIds((prev) => [...prev, lgaId]);
    } else {
      setSelectedLgaIds((prev) => prev.filter((id) => id !== lgaId));
    }
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      showNotification('Zone name is required', 'error');
      return;
    }

    const payload = {
      name: formName.trim(),
      stateIds: selectedStateIds,
      lgaIds: selectedLgaIds,
    };

    try {
      if (editingZone) {
        await updateZone({ id: editingZone.id, data: payload }).unwrap();
        showNotification('Shipping zone updated successfully', 'success');
      } else {
        await createZone(payload).unwrap();
        showNotification('Shipping zone created successfully', 'success');
      }
      setIsModalOpen(false);
      resetForm();
      refetchZones();
    } catch (err: unknown) {
      console.error(err);
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message || 'Operation failed. Please try again.';
      showNotification(errorMessage, 'error');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleStatus({ id, isActive: !currentStatus }).unwrap();
      showNotification(`Zone ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message || 'Failed to update status';
      showNotification(errorMessage, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteZone(deleteConfirmId).unwrap();
      showNotification('Shipping zone deleted successfully', 'success');
      setDeleteConfirmId(null);
      refetchZones();
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message || 'Failed to delete zone';
      showNotification(errorMessage, 'error');
    }
  };

  // Loading & error states
  if (isLoadingZones || isLoadingStates) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (zonesError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-700">Failed to load shipping zones. Please refresh the page.</p>
        <button onClick={() => refetchZones()} className="mt-2 text-sm text-red-600 underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Inline notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {notification.message}
          <button
            onClick={() => setNotification(null)}
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipping Zones</h1>
          <p className="text-gray-500 mt-1">Manage regions, states, and LGAs for shipping rules</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Zone
        </button>
      </div>

      {/* Zones Grid */}
      {zones.length === 0 ? (
        <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No shipping zones created yet.</p>
          <button
            onClick={handleCreate}
            className="mt-3 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Create your first zone
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{zone.name}</h3>
                    <div className="flex items-center mt-1">
                      {zone.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckBadgeIcon className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <XCircleIcon className="h-3 w-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(zone)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md hover:bg-gray-100"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(zone.id, zone.isActive)}
                      disabled={isToggling}
                      className="p-1.5 text-gray-500 hover:text-amber-600 rounded-md hover:bg-gray-100"
                      title={zone.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {zone.isActive ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(zone.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 rounded-md hover:bg-gray-100"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium">States:</span>{' '}
                    <span className="text-gray-700">
                      {zone.states.length > 0 ? zone.states.map((s) => s.name).join(', ') : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">LGAs:</span>{' '}
                    <span className="text-gray-700">
                      {zone.lgas.length > 0 ? zone.lgas.length.toLocaleString() : '—'}
                    </span>
                  </div>
                  <div className="pt-2 text-xs text-gray-400">
                    Created: {new Date(zone.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center border-b pb-3">
                    <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                      {editingZone ? 'Edit Shipping Zone' : 'Create Shipping Zone'}
                    </Dialog.Title>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zone Name *
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., North Region, Lagos Metro"
                    />
                  </div>

                  <div className="mt-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      States & Local Government Areas
                    </label>
                    <div className="max-h-96 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                      {states.length === 0 ? (
                        <p className="text-gray-500 text-sm">No states available.</p>
                      ) : (
                        states.map((state) => (
                          <StateLgaSelector
                            key={state.id}
                            state={state}
                            isSelected={selectedStateIds.includes(state.id)}
                            onStateToggle={handleStateToggle}
                            selectedLgaIds={selectedLgaIds}
                            onLgaToggle={handleLgaToggle}
                            onRegisterLgaState={registerLgaState}
                          />
                        ))
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Select states and optionally pick specific LGAs. If no LGAs are selected for a state, it means the entire state is included.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isCreating || isUpdating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating || isUpdating ? 'Saving...' : editingZone ? 'Update Zone' : 'Create Zone'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Modal */}
      <Transition appear show={!!deleteConfirmId} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setDeleteConfirmId(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                    Delete Shipping Zone
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this shipping zone? This action cannot be undone.
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default ShippingZonesManager;