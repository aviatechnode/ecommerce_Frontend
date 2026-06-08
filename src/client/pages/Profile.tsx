import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  User,
  MapPin,
  ShoppingBag,
  Settings,
  LogOut,
  Phone,
  Edit2,
  Trash2,
  Plus,
  Loader2,
  X,
  ChevronRight,
  Star,
  Package,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Moon,
  Mail,
} from "lucide-react";

import {
  useMeQuery,
  useSignoutMutation,
} from "../../services/authApi";

import {
  useGetMyAddressesQuery,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  type CreateAddressPayload,
  type UpdateAddressPayload,
} from "../../services/addressApi";

import { useGetCartQuery } from "../../services/cartApi";
import {
  useGetStatesQuery,
  useGetLgasByStateQuery,
} from "../../services/locationApi";

type Tab = "overview" | "addresses" | "orders" | "settings";

// Navigation items
const NAVIGATION_ITEMS = [
  { id: "overview" as const, label: "Overview", icon: User, description: "View your profile stats" },
  { id: "addresses" as const, label: "Addresses", icon: MapPin, description: "Manage delivery locations" },
  { id: "orders" as const, label: "Orders", icon: ShoppingBag, description: "Track your purchases" },
  { id: "settings" as const, label: "Settings", icon: Settings, description: "Customize preferences" },
];

// ============================================
// ADDRESS ACTIONS HOOK
// ============================================
const useAddressActions = () => {
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();
  const [setDefaultAddress, { isLoading: isSettingDefault }] = useSetDefaultAddressMutation();
  const { refetch } = useGetMyAddressesQuery();

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm("Are you sure you want to delete this address?")) return;
      try {
        await deleteAddress(id).unwrap();
        await refetch();
      } catch (error) {
        console.error("Failed to delete address:", error);
        throw error;
      }
    },
    [deleteAddress, refetch]
  );

  const handleSetDefault = useCallback(
    async (id: string) => {
      try {
        await setDefaultAddress(id).unwrap();
        await refetch();
      } catch (error) {
        console.error("Failed to set default address:", error);
        throw error;
      }
    },
    [setDefaultAddress, refetch]
  );

  return {
    handleDelete,
    handleSetDefault,
    isDeleting,
    isSettingDefault,
  };
};

// ============================================
// ADDRESS FORM MODAL
// ============================================
interface AddressFormData {
  name: string;
  phone: string;
  stateId: string;
  lgaId: string;
  city: string;
  area: string;
  street: string;
  landmark: string;
  isDefault: boolean;
}

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingAddress?: any;
}

const AddressFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  editingAddress,
}: AddressFormModalProps) => {
  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();

  // Fetch real states from API
  const { data: states = [], isLoading: isLoadingStates } = useGetStatesQuery();
  
  const [formData, setFormData] = useState<AddressFormData>({
    name: "",
    phone: "",
    stateId: "",
    lgaId: "",
    city: "",
    area: "",
    street: "",
    landmark: "",
    isDefault: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});

  // Fetch LGAs based on selected state
  const { data: availableLGAs = [], isLoading: isLoadingLGAs } = useGetLgasByStateQuery(
    formData.stateId,
    { skip: !formData.stateId }
  );

  useEffect(() => {
    if (editingAddress) {
      setFormData({
        name: editingAddress.name || "",
        phone: editingAddress.phone || "",
        stateId: editingAddress.stateId || "",
        lgaId: editingAddress.lgaId || "",
        city: editingAddress.city || "",
        area: editingAddress.area || "",
        street: editingAddress.street || "",
        landmark: editingAddress.landmark || "",
        isDefault: editingAddress.isDefault || false,
      });
    } else {
      setFormData({
        name: "",
        phone: "",
        stateId: "",
        lgaId: "",
        city: "",
        area: "",
        street: "",
        landmark: "",
        isDefault: false,
      });
    }
    setErrors({});
  }, [editingAddress, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddressFormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.stateId) newErrors.stateId = "Please select a state";
    if (!formData.lgaId) newErrors.lgaId = "Please select an LGA";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.street.trim()) newErrors.street = "Street address is required";

    if (formData.phone && !/^[\d+\s-]{8,15}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const fullAddress = `${formData.street}${formData.area ? `, ${formData.area}` : ""}${
      formData.city ? `, ${formData.city}` : ""
    }`.trim();

    try {
      if (editingAddress) {
        const payload: UpdateAddressPayload = {
          id: editingAddress.id,
          name: formData.name,
          phone: formData.phone,
          stateId: formData.stateId,
          lgaId: formData.lgaId,
          city: formData.city,
          area: formData.area || null,
          street: formData.street,
          landmark: formData.landmark || null,
          isDefault: formData.isDefault,
        };
        await updateAddress(payload).unwrap();
      } else {
        const payload: CreateAddressPayload = {
          name: formData.name,
          phone: formData.phone,
          stateId: formData.stateId,
          lgaId: formData.lgaId,
          city: formData.city,
          area: formData.area || null,
          street: formData.street,
          landmark: formData.landmark || null,
          fullAddress,
          isDefault: formData.isDefault,
        };
        await createAddress(payload).unwrap();
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save address:", error);
    }
  };

  const handleChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));

    if (field === "stateId") {
      setFormData(prev => ({ ...prev, lgaId: "" }));
    }
  };

  if (!isOpen) return null;

  const isLoading = isCreating || isUpdating || isLoadingStates;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

        <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl transform transition-all duration-300 scale-100 opacity-100 animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Fill in the delivery details below
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-all duration-200"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`w-full rounded-xl border-2 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                      errors.name ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Recipient full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={`w-full rounded-xl border-2 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                      errors.phone ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Phone number for delivery"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    value={formData.stateId}
                    onChange={(e) => handleChange("stateId", e.target.value)}
                    className={`w-full rounded-xl border-2 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                      errors.stateId ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    disabled={isLoadingStates}
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state.id} value={state.id}>{state.name}</option>
                    ))}
                  </select>
                  {errors.stateId && (
                    <p className="mt-1 text-xs text-red-500">{errors.stateId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    LGA *
                  </label>
                  <select
                    value={formData.lgaId}
                    onChange={(e) => handleChange("lgaId", e.target.value)}
                    disabled={!formData.stateId || isLoadingLGAs}
                    className={`w-full rounded-xl border-2 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.lgaId ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <option value="">Select LGA</option>
                    {availableLGAs.map(lga => (
                      <option key={lga.id} value={lga.id}>{lga.name}</option>
                    ))}
                  </select>
                  {errors.lgaId && (
                    <p className="mt-1 text-xs text-red-500">{errors.lgaId}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City/Town *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className={`w-full rounded-xl border-2 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                      errors.city ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="City or town name"
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Area (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => handleChange("area", e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:border-gray-300"
                    placeholder="Neighborhood or area"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => handleChange("street", e.target.value)}
                  className={`w-full rounded-xl border-2 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                    errors.street ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="House number, street name"
                />
                {errors.street && (
                  <p className="mt-1 text-xs text-red-500">{errors.street}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => handleChange("landmark", e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:border-gray-300"
                  placeholder="Nearby landmark (e.g., opposite mall)"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => handleChange("isDefault", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700 font-medium">
                  Set as default address
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border-2 border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-emerald-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 disabled:opacity-50"
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                {editingAddress ? "Update Address" : "Save Address"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ADDRESS CARD COMPONENT
// ============================================
const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isDeleting,
  isSettingDefault,
}: {
  address: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  isDeleting: boolean;
  isSettingDefault: boolean;
}) => {
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleDelete = async () => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    try {
      await onDelete(address.id);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSetDefault = async () => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    try {
      await onSetDefault(address.id);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="group relative p-6 border border-gray-100 rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-white">
      <div className="flex justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="font-bold text-gray-900 text-lg">{address.name}</span>
            {address.isDefault && (
              <span className="inline-flex items-center gap-1 text-xs bg-linear-to-r from-emerald-50 to-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-semibold">
                <Star size={12} fill="currentColor" />
                Default
              </span>
            )}
          </div>

          <div className="text-gray-600 leading-relaxed mb-3">
            {address.fullAddress}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Phone size={14} />
              {address.phone}
            </div>
            {address.state && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin size={14} />
                {address.state.name}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 items-start opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {!address.isDefault && (
            <button
              onClick={handleSetDefault}
              disabled={isActionLoading || isSettingDefault}
              className="text-sm border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 font-medium"
            >
              {isActionLoading && isSettingDefault ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "Set Default"
              )}
            </button>
          )}

          <button
            onClick={() => onEdit(address.id)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-all"
            aria-label="Edit address"
          >
            <Edit2 size={16} className="text-gray-600" />
          </button>

          <button
            onClick={handleDelete}
            disabled={isActionLoading || isDeleting}
            className="p-2 rounded-xl hover:bg-red-50 transition-all disabled:opacity-50"
            aria-label="Delete address"
          >
            {isActionLoading && isDeleting ? (
              <Loader2 size={16} className="animate-spin text-red-600" />
            ) : (
              <Trash2 size={16} className="text-red-500" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// STAT CARD
// ============================================
const StatCard = ({ label, value, icon: Icon, trend }: { label: string; value: number; icon: any; trend?: string }) => (
  <div className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium mb-2">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className="text-xs text-emerald-600 mt-2 font-medium">{trend}</p>
        )}
      </div>
      <div className="p-3 bg-linear-to-br from-emerald-50 to-emerald-50 rounded-2xl group-hover:scale-110 transition-transform duration-200">
        <Icon size={24} className="text-emerald-600" />
      </div>
    </div>
  </div>
);

// ============================================
// INFO ROW
// ============================================
const InfoRow = ({ label, value, icon: Icon }: { label: string; value: string; icon: any }) => (
  <div className="flex items-center py-4 border-b border-gray-100 last:border-0 group hover:bg-gray-50/50 px-4 -mx-4 rounded-xl transition-all">
    <div className="w-12">
      <Icon size={18} className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-gray-900 mt-1">{value}</p>
    </div>
    <ChevronRight size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>
);

// ============================================
// SKELETON LOADER
// ============================================
const ProfileSkeleton = () => (
  <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="animate-pulse">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-48 bg-gray-200 rounded-lg" />
              <div className="h-4 w-64 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  <div className="h-5 w-5 bg-gray-200 rounded" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
                    <div className="h-3 w-32 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <div className="flex items-center gap-3 px-5 py-4">
                  <div className="h-5 w-5 bg-gray-200 rounded" />
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-9 space-y-6">
            <div className="grid sm:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-gray-200 rounded" />
                      <div className="h-8 w-12 bg-gray-200 rounded" />
                    </div>
                    <div className="h-12 w-12 bg-gray-200 rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30">
                <div className="h-5 w-32 bg-gray-200 rounded mb-1" />
                <div className="h-4 w-48 bg-gray-200 rounded" />
              </div>
              <div className="p-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center py-4 border-b border-gray-100 last:border-0">
                    <div className="w-12">
                      <div className="h-5 w-5 bg-gray-200 rounded" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-16 bg-gray-200 rounded" />
                      <div className="h-4 w-40 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ============================================
// ERROR STATE
// ============================================
const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
    <div className="text-center max-w-md">
      <div className="bg-red-50 rounded-full p-4 w-20 h-20 mx-auto mb-6">
        <X size={48} className="text-red-600 mx-auto" />
      </div>
      <p className="text-gray-900 font-semibold text-lg mb-2">Oops! Something went wrong</p>
      <p className="text-gray-500 mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-linear-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl transition-all"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================
export default function CustomerProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  // Fetch user data
  const { data: meData, isLoading: isUserLoading, error: userError, refetch: refetchUser } = useMeQuery();
  const user = meData?.user;

  // Fetch addresses
  const { data: addressData, isLoading: isAddressesLoading, error: addressesError, refetch: refetchAddresses } = useGetMyAddressesQuery();
  
  // Fetch cart
  const { data: cartData, isLoading: isCartLoading, error: cartError } = useGetCartQuery();
  
  // Auth actions
  const [signout, { isLoading: isSigningOut }] = useSignoutMutation();
  
  // Address actions
  const { handleDelete, handleSetDefault, isDeleting, isSettingDefault } = useAddressActions();

  const addresses = useMemo(() => addressData?.addresses ?? [], [addressData]);
  const isLoading = isUserLoading || isAddressesLoading || isCartLoading;

  // Sync active tab with URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab") as Tab;
    if (tabParam && ["overview", "addresses", "orders", "settings"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleLogout = useCallback(async () => {
    try {
      await signout().unwrap();
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  }, [signout]);

  const handleAddAddress = useCallback(() => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  }, []);

  const handleEditAddress = useCallback((id: string) => {
    const address = addresses.find(a => a.id === id);
    if (address) {
      setEditingAddress(address);
      setIsAddressModalOpen(true);
    }
  }, [addresses]);

  const handleAddressSuccess = useCallback(async () => {
    await refetchAddresses();
  }, [refetchAddresses]);

  if (userError) {
    return <ErrorState message="Failed to load user profile" onRetry={refetchUser} />;
  }
  if (addressesError) {
    return <ErrorState message="Failed to load addresses" onRetry={refetchAddresses} />;
  }
  if (cartError) {
    return <ErrorState message="Failed to load cart information" />;
  }
  if (isLoading) {
    return <ProfileSkeleton />;
  }
  if (!user) {
    return <ErrorState message="Please sign in to view your profile" onRetry={() => (window.location.href = "/login")} />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-linear-to-br from-emerald-600 to-emerald-600 flex items-center justify-center shadow-lg">
                <span className="font-bold text-xl text-white">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-white">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-2xl text-gray-900">{user.name}</h1>
              <p className="text-gray-500 text-sm mt-1">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <aside className="col-span-12 lg:col-span-3">
            <nav className="bg-white rounded-2xl shadow-sm overflow-hidden sticky top-32 border border-gray-100">
              {NAVIGATION_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-5 py-4 text-left
                      transition-all duration-200 relative
                      ${isActive
                        ? "bg-linear-to-r from-emerald-50 to-emerald-50 text-emerald-700 font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    <Icon size={20} className={isActive ? "text-emerald-600" : ""} />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>
                    </div>
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-emerald-600 to-emerald-600 rounded-r-full" />
                    )}
                  </button>
                );
              })}

              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  disabled={isSigningOut}
                  className="w-full flex items-center gap-3 px-5 py-4 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
                >
                  {isSigningOut ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
                  {isSigningOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="col-span-12 lg:col-span-9">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-3 gap-5">
                  <StatCard label="Total Orders" value={0} icon={Package} trend="+0% from last month" />
                  <StatCard label="Addresses" value={addresses.length} icon={MapPin} />
                  <StatCard label="Cart Items" value={cartData?.totals?.totalItems ?? 0} icon={ShoppingBag} />
                </div>

                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
                    <h2 className="font-bold text-gray-900">Profile Information</h2>
                    <p className="text-sm text-gray-500 mt-1">Your personal details and account settings</p>
                  </div>
                  <div className="p-6">
                    <InfoRow label="Full Name" value={user.name} icon={User} />
                    <InfoRow label="Email Address" value={user.email} icon={Mail} />
                    <InfoRow label="Role" value={user.roleName} icon={Shield} />
                  </div>
                </section>
              </div>
            )}

            {activeTab === "addresses" && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
                  <div>
                    <h2 className="font-bold text-gray-900">My Addresses</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your delivery locations ({addresses.length})</p>
                  </div>
                  <button
                    onClick={handleAddAddress}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200"
                  >
                    <Plus size={18} />
                    Add New Address
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="bg-gray-50 rounded-full p-6 w-28 h-28 mx-auto mb-6">
                      <MapPin size={64} className="text-gray-300 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses saved yet</h3>
                    <p className="text-gray-500 mb-6">Add your first address to start shopping</p>
                    <button
                      onClick={handleAddAddress}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl transition-all"
                    >
                      <Plus size={18} />
                      Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {addresses.map((address) => (
                      <AddressCard
                        key={address.id}
                        address={address}
                        onEdit={handleEditAddress}
                        onDelete={handleDelete}
                        onSetDefault={handleSetDefault}
                        isDeleting={isDeleting}
                        isSettingDefault={isSettingDefault}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === "orders" && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-full p-8 w-32 h-32 mx-auto mb-6">
                  <ShoppingBag size={64} className="text-gray-400 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  When you place your first order, it will appear here. Start exploring our products!
                </p>
              </section>
            )}

            {activeTab === "settings" && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="text-center mb-8">
                  <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4">
                    <Settings size={48} className="text-gray-600 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Settings Coming Soon</h3>
                  <p className="text-gray-500">
                    Account preferences, notification settings, and more will be available here
                  </p>
                </div>

                <div className="grid gap-4 max-w-2xl mx-auto">
                  {[
                    { icon: Bell, label: "Notifications", description: "Manage your alert preferences" },
                    { icon: Moon, label: "Appearance", description: "Light or dark mode" },
                    { icon: CreditCard, label: "Payment Methods", description: "Add or remove payment options" },
                    { icon: Globe, label: "Language & Region", description: "Customize your experience" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group">
                      <div className="p-2 bg-gray-100 rounded-xl group-hover:bg-emerald-100 transition-all">
                        <item.icon size={20} className="text-gray-600 group-hover:text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                      <ChevronRight size={18} className="text-gray-300" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      <AddressFormModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        }}
        onSuccess={handleAddressSuccess}
        editingAddress={editingAddress}
      />
    </div>
  );
}