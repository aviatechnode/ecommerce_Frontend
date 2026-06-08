// AdminShippingRates.tsx
import React, { useState, Fragment } from 'react';
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
// API HOOKS AND TYPES
// =========================================================
import {
  useGetZoneRatesQuery,
  useCreateShippingRateMutation,
  useToggleShippingRateMutation,
  useDeleteShippingRateMutation,
  useCalculateShippingRateMutation,
  DeliveryMethod,
  type ShippingRate,
  type CreateShippingRateDto,
} from '../../services/shippingRateApi';

import {
  useGetShippingZoneByIdQuery,
  useGetShippingZonesQuery,
  type ShippingZone,
} from '../../services/shippingZoneApi';

// =========================================================
// TYPES
// =========================================================
interface NotificationState {
  message: string;
  type: 'success' | 'error';
}

interface ShippingRatesManagerProps {
  zoneId?: string; // now optional – if not provided, show zone selector
  onBack?: () => void;
}

interface RateFormData {
  name: string;
  deliveryMethod: string;
  baseFee: number;
  currency: string;
  minWeight: number | '';
  maxWeight: number | '';
  weightFee: number | '';
  minDistanceKm: number | '';
  maxDistanceKm: number | '';
  distanceFeeKm: number | '';
  minOrderValue: number | '';
  maxOrderValue: number | '';
  estimatedDaysMin: number | '';
  estimatedDaysMax: number | '';
  priority: number;
}

const defaultFormData: RateFormData = {
  name: '',
  deliveryMethod: DeliveryMethod.STANDARD,
  baseFee: 0,
  currency: 'NGN', // Changed to Nigerian Naira
  minWeight: '',
  maxWeight: '',
  weightFee: '',
  minDistanceKm: '',
  maxDistanceKm: '',
  distanceFeeKm: '',
  minOrderValue: '',
  maxOrderValue: '',
  estimatedDaysMin: '',
  estimatedDaysMax: '',
  priority: 0,
};

// =========================================================
// MAIN COMPONENT
// =========================================================
export const ShippingRatesManager: React.FC<ShippingRatesManagerProps> = ({
  zoneId: propZoneId,
  onBack,
}) => {
  // If zoneId is not provided, fetch all zones and let user select one
  const { data: allZones = [] } = useGetShippingZonesQuery(undefined, {
    skip: !!propZoneId,
  });

  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(propZoneId || null);
  const activeZoneId = selectedZoneId || propZoneId;

  const {
    data: rates = [],
    isLoading: isLoadingRates,
    error: ratesError,
    refetch: refetchRates,
  } = useGetZoneRatesQuery(activeZoneId!, { skip: !activeZoneId });

  const { data: zone } = useGetShippingZoneByIdQuery(activeZoneId!, { skip: !activeZoneId });

  const [createRate, { isLoading: isCreating }] = useCreateShippingRateMutation();
  const [toggleRate, { isLoading: isToggling }] = useToggleShippingRateMutation();
  const [deleteRate, { isLoading: isDeleting }] = useDeleteShippingRateMutation();
  const [calculateRate, { data: calculationResult, isLoading: isCalculating }] =
    useCalculateShippingRateMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [formData, setFormData] = useState<RateFormData>(defaultFormData);
  const [calcParams, setCalcParams] = useState({
    weight: '',
    distanceKm: '',
    orderValue: '',
    deliveryMethod: '' as string,
  });

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingRate(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (rate: ShippingRate) => {
    setEditingRate(rate);
    setFormData({
      name: rate.name,
      deliveryMethod: rate.deliveryMethod,
      baseFee: parseFloat(rate.baseFee),
      currency: rate.currency,
      minWeight: rate.minWeight ?? '',
      maxWeight: rate.maxWeight ?? '',
      weightFee: rate.weightFee ? parseFloat(rate.weightFee) : '',
      minDistanceKm: rate.minDistanceKm ?? '',
      maxDistanceKm: rate.maxDistanceKm ?? '',
      distanceFeeKm: rate.distanceFeeKm ? parseFloat(rate.distanceFeeKm) : '',
      minOrderValue: rate.minOrderValue ? parseFloat(rate.minOrderValue) : '',
      maxOrderValue: rate.maxOrderValue ? parseFloat(rate.maxOrderValue) : '',
      estimatedDaysMin: rate.estimatedDaysMin ?? '',
      estimatedDaysMax: rate.estimatedDaysMax ?? '',
      priority: rate.priority,
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (field: keyof RateFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!activeZoneId) {
      showNotification('Please select a shipping zone first', 'error');
      return;
    }
    if (!formData.name.trim()) {
      showNotification('Rate name is required', 'error');
      return;
    }
    if (formData.baseFee < 0) {
      showNotification('Base fee must be non-negative', 'error');
      return;
    }

    const payload: CreateShippingRateDto = {
      zoneId: activeZoneId,
      name: formData.name.trim(),
      deliveryMethod: formData.deliveryMethod as any,
      baseFee: formData.baseFee,
      currency: formData.currency || 'NGN', // Fallback to NGN
      priority: formData.priority,
    };

    if (formData.minWeight !== '') payload.minWeight = Number(formData.minWeight);
    if (formData.maxWeight !== '') payload.maxWeight = Number(formData.maxWeight);
    if (formData.weightFee !== '') payload.weightFee = Number(formData.weightFee);
    if (formData.minDistanceKm !== '') payload.minDistanceKm = Number(formData.minDistanceKm);
    if (formData.maxDistanceKm !== '') payload.maxDistanceKm = Number(formData.maxDistanceKm);
    if (formData.distanceFeeKm !== '') payload.distanceFeeKm = Number(formData.distanceFeeKm);
    if (formData.minOrderValue !== '') payload.minOrderValue = Number(formData.minOrderValue);
    if (formData.maxOrderValue !== '') payload.maxOrderValue = Number(formData.maxOrderValue);
    if (formData.estimatedDaysMin !== '') payload.estimatedDaysMin = Number(formData.estimatedDaysMin);
    if (formData.estimatedDaysMax !== '') payload.estimatedDaysMax = Number(formData.estimatedDaysMax);

    try {
      if (editingRate) {
        showNotification('Editing rates is not supported yet. Please delete and recreate.', 'error');
        return;
      } else {
        await createRate(payload).unwrap();
        showNotification('Shipping rate created successfully', 'success');
      }
      setIsModalOpen(false);
      resetForm();
      refetchRates();
    } catch (err: unknown) {
      console.error(err);
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message || 'Operation failed. Please try again.';
      showNotification(errorMessage, 'error');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleRate({ id, isActive: !currentStatus }).unwrap();
      showNotification(`Rate ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
      refetchRates();
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message || 'Failed to update status';
      showNotification(errorMessage, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteRate(deleteConfirmId).unwrap();
      showNotification('Shipping rate deleted successfully', 'success');
      setDeleteConfirmId(null);
      refetchRates();
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message || 'Failed to delete rate';
      showNotification(errorMessage, 'error');
    }
  };

  const handleCalculate = async () => {
    if (!activeZoneId) {
      showNotification('Please select a shipping zone first', 'error');
      return;
    }
    const payload: any = { zoneId: activeZoneId };
    if (calcParams.deliveryMethod) payload.deliveryMethod = calcParams.deliveryMethod;
    if (calcParams.weight) payload.weight = parseFloat(calcParams.weight);
    if (calcParams.distanceKm) payload.distanceKm = parseFloat(calcParams.distanceKm);
    if (calcParams.orderValue) payload.orderValue = parseFloat(calcParams.orderValue);
    try {
      await calculateRate(payload).unwrap();
    } catch (err) {
      showNotification('Calculation failed. Check your parameters.', 'error');
    }
  };

  // Zone selector (if no zoneId passed)
  if (!propZoneId) {
    if (allZones.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-gray-500">Loading zones...</p>
        </div>
      );
    }
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Shipping Rates</h1>
        <p className="mb-2 text-gray-600">Select a shipping zone to manage its rates:</p>
        <select
          value={selectedZoneId || ''}
          onChange={(e) => setSelectedZoneId(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="">-- Choose a zone --</option>
          {allZones.map((zone: ShippingZone) => (
            <option key={zone.id} value={zone.id}>
              {zone.name}
            </option>
          ))}
        </select>
        {selectedZoneId && (
          <div className="mt-6">
            <ShippingRatesManager zoneId={selectedZoneId} onBack={() => setSelectedZoneId(null)} />
          </div>
        )}
      </div>
    );
  }

  // Loading & error states for rates
  if (isLoadingRates) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (ratesError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-700">Failed to load shipping rates. Please refresh.</p>
        <button onClick={() => refetchRates()} className="mt-2 text-sm text-red-600 underline">
          Try again
        </button>
      </div>
    );
  }

  // Main view
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {notification.message}
          <button onClick={() => setNotification(null)} className="ml-4 text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                ← Back
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              Shipping Rates {zone ? `for ${zone.name}` : ''}
            </h1>
          </div>
          <p className="text-gray-500 mt-1">Define delivery methods, fees, and rules per zone</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Rate
        </button>
      </div>

      {/* Rates Table */}
      {rates.length === 0 ? (
        <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No shipping rates defined for this zone.</p>
          <button
            onClick={openCreateModal}
            className="mt-3 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Create your first rate
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rates.map((rate) => (
                <tr key={rate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rate.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{rate.deliveryMethod.replace('_', ' ')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{rate.baseFee} {rate.currency}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{rate.priority}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {rate.isActive ? (
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => openEditModal(rate)} className="text-gray-500 hover:text-blue-600" title="Edit">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleToggleStatus(rate.id, rate.isActive)} disabled={isToggling} className="text-gray-500 hover:text-amber-600" title={rate.isActive ? 'Deactivate' : 'Activate'}>
                        {rate.isActive ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      </button>
                      <button onClick={() => setDeleteConfirmId(rate.id)} className="text-gray-500 hover:text-red-600" title="Delete">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Calculator Section */}
      <div className="mt-10 bg-white border rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Calculate Shipping Fee</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
            <input
              type="number" step="0.1"
              value={calcParams.weight}
              onChange={(e) => setCalcParams((p) => ({ ...p, weight: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g., 2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Distance (km)</label>
            <input
              type="number" step="1"
              value={calcParams.distanceKm}
              onChange={(e) => setCalcParams((p) => ({ ...p, distanceKm: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g., 15"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Order Value</label>
            <input
              type="number" step="0.01"
              value={calcParams.orderValue}
              onChange={(e) => setCalcParams((p) => ({ ...p, orderValue: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g., 50.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Delivery Method (optional)</label>
            <select
              value={calcParams.deliveryMethod}
              onChange={(e) => setCalcParams((p) => ({ ...p, deliveryMethod: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Any</option>
              {Object.values(DeliveryMethod).map((method) => (
                <option key={method} value={method}>{method.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <button
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isCalculating ? 'Calculating...' : 'Calculate Fee'}
            </button>
          </div>
        </div>
        {calculationResult && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">
              Estimated Fee: <strong>{calculationResult.fee} {calculationResult.currency}</strong>
            </p>
            <p className="text-xs text-green-700 mt-1">
              Using rate: {calculationResult.rate.name} ({calculationResult.rate.deliveryMethod})
            </p>
          </div>
        )}
      </div>

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
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center border-b pb-3">
                    <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                      {editingRate ? 'Edit Shipping Rate' : 'Create Shipping Rate'}
                    </Dialog.Title>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rate Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Delivery Method *</label>
                      <select
                        value={formData.deliveryMethod}
                        onChange={(e) => handleFormChange('deliveryMethod', e.target.value)}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                      >
                        {Object.values(DeliveryMethod).map((method) => (
                          <option key={method} value={method}>
                            {method.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Base Fee *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.baseFee}
                        onChange={(e) => handleFormChange('baseFee', parseFloat(e.target.value) || 0)}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Currency</label>
                      <input
                        type="text"
                        value={formData.currency}
                        onChange={(e) => handleFormChange('currency', e.target.value)}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                        placeholder="NGN"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority</label>
                      <input
                        type="number"
                        value={formData.priority}
                        onChange={(e) => handleFormChange('priority', parseInt(e.target.value) || 0)}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-800 mb-2">Weight Range (kg)</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">Min Weight</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.minWeight}
                          onChange={(e) => handleFormChange('minWeight', e.target.value === '' ? '' : parseFloat(e.target.value))}
                          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Max Weight</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.maxWeight}
                          onChange={(e) => handleFormChange('maxWeight', e.target.value === '' ? '' : parseFloat(e.target.value))}
                          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Fee per kg</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.weightFee}
                          onChange={(e) => handleFormChange('weightFee', e.target.value === '' ? '' : parseFloat(e.target.value))}
                          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-800 mb-2">Distance Range (km)</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">Min Distance</label>
                        <input
                          type="number"
                          step="1"
                          value={formData.minDistanceKm}
                          onChange={(e) => handleFormChange('minDistanceKm', e.target.value === '' ? '' : parseFloat(e.target.value))}
                          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Max Distance</label>
                        <input
                          type="number"
                          step="1"
                          value={formData.maxDistanceKm}
                          onChange={(e) => handleFormChange('maxDistanceKm', e.target.value === '' ? '' : parseFloat(e.target.value))}
                          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Fee per km</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.distanceFeeKm}
                          onChange={(e) => handleFormChange('distanceFeeKm', e.target.value === '' ? '' : parseFloat(e.target.value))}
                          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-800 mb-2">Order Value Range</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">Min Order Value</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.minOrderValue}
                          onChange={(e) => handleFormChange('minOrderValue', e.target.value === '' ? '' : parseFloat(e.target.value))}
                          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Max Order Value</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.maxOrderValue}
                          onChange={(e) => handleFormChange('maxOrderValue', e.target.value === '' ? '' : parseFloat(e.target.value))}
                          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-800 mb-2">Estimated Delivery (days)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">Min days</label>
                        <input
                          type="number"
                          step="1"
                          value={formData.estimatedDaysMin}
                          onChange={(e) => handleFormChange('estimatedDaysMin', e.target.value === '' ? '' : parseInt(e.target.value))}
                          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Max days</label>
                        <input
                          type="number"
                          step="1"
                          value={formData.estimatedDaysMax}
                          onChange={(e) => handleFormChange('estimatedDaysMax', e.target.value === '' ? '' : parseInt(e.target.value))}
                          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isCreating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isCreating ? 'Saving...' : editingRate ? 'Update Rate' : 'Create Rate'}
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
                    Delete Shipping Rate
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this rate? This action cannot be undone.
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
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

export default ShippingRatesManager;