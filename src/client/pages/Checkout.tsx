import React, { useState, useEffect } from "react";
import {
  useGetMyAddressesQuery,
  useCreateAddressMutation,
  useDeleteAddressMutation,
  type Address,
} from "../../services/addressApi";
import {
  useCreateCheckoutMutation,
  useInitializePaymentMutation,
  usePreviewCouponMutation,
} from "../../services/checkoutApi";
import { useGetCartQuery } from "../../services/cartApi";
import {
  useGetStatesQuery,
  useGetLgasByStateQuery,
} from "../../services/locationApi";
import { ChevronLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ================= TYPES ================= */
interface AddressFormData {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  lga: string;
  area?: string;
  landmark?: string;
  isDefault: boolean;
}
interface CartItemForDisplay {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  unitPrice?: number;
}

/* ================= HELPER ================= */
const buildFullAddress = (
  street: string,
  area: string | undefined,
  city: string,
  lgaName: string,
  stateName: string
): string => {
  const parts = [street];
  if (area) parts.push(area);
  parts.push(city, lgaName, stateName);
  return parts.join(", ");
};

// Transform raw cart item from API to display format
const transformCartItem = (item: any): CartItemForDisplay => ({
  id: item.id,
  name: item.variant?.product?.name ?? "Product",
  price: item.unitPrice ?? 0,
  quantity: item.quantity,
  unitPrice: item.unitPrice,
  image: item.variant?.product?.medias?.[0]?.url,
});

/* ================= REUSABLE COMPONENTS ================= */
const LoadingSpinner: React.FC<{ size?: "sm" | "md" | "lg" }> = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };
  return (
    <div
      className={`${sizeClasses[size]} border-2 border-white border-t-transparent rounded-full animate-spin`}
    />
  );
};

// Skeleton Components
const AddressSectionSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
    <div className="h-7 bg-gray-200 rounded w-48 mb-4"></div>
    <div className="space-y-3">
      <div className="p-4 border-2 border-gray-200 rounded-lg">
        <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-48 mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-40"></div>
      </div>
      <div className="p-4 border-2 border-gray-200 rounded-lg">
        <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-48 mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-40"></div>
      </div>
    </div>
  </div>
);

const OrderSummarySkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
    <div className="h-7 bg-gray-200 rounded w-36 mb-4"></div>
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="w-12 h-12 bg-gray-200 rounded"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="h-5 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="flex gap-3">
        <div className="w-12 h-12 bg-gray-200 rounded"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="h-5 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
    <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="border-t border-gray-200 pt-2 mt-2">
        <div className="flex justify-between">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  </div>
);

const CouponSectionSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
    <div className="h-7 bg-gray-200 rounded w-36 mb-4"></div>
    <div className="flex gap-3">
      <div className="flex-1 h-10 bg-gray-200 rounded"></div>
      <div className="w-20 h-10 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const AddressCard: React.FC<{
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}> = ({ address, isSelected, onSelect, onDelete, isDeleting }) => {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? "border-green-500 bg-green-50"
          : "border-gray-200 hover:border-green-300"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{address.name}</p>
          <p className="text-sm text-gray-600">{address.street}</p>
          <p className="text-sm text-gray-600">
            {address.city}, {address.state?.name}, {address.lga?.name}
          </p>
          <p className="text-sm text-gray-600">Phone: {address.phone}</p>
          {address.landmark && (
            <p className="text-xs text-gray-500">Landmark: {address.landmark}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {address.isDefault && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Default
            </span>
          )}
          {isSelected && (
            <svg
              className="w-5 h-5 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z"
              />
            </svg>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={isDeleting}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Delete address"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const AddressSection: React.FC<{
  savedAddresses: Address[];
  addressLoading: boolean;
  selectedAddressId: string | null;
  useNewAddress: boolean;
  onAddressSelect: (id: string) => void;
  onNewAddressToggle: () => void;
  onDeleteAddress: (id: string) => void;
  deletingAddressId: string | null;
  newAddressForm: AddressFormData;
  onNewAddressChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSaveNewAddress: () => void;
  creatingAddress: boolean;
  states: { id: string; name: string }[];
  statesLoading: boolean;
  lgas: { id: string; name: string }[];
  lgasLoading: boolean;
}> = ({
  savedAddresses,
  addressLoading,
  selectedAddressId,
  useNewAddress,
  onAddressSelect,
  onNewAddressToggle,
  onDeleteAddress,
  deletingAddressId,
  newAddressForm,
  onNewAddressChange,
  onSaveNewAddress,
  creatingAddress,
  states,
  statesLoading,
  lgas,
  lgasLoading,
}) => {
  if (addressLoading) {
    return <AddressSectionSkeleton />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Address</h2>
      {savedAddresses.length > 0 ? (
        <>
          <div className="space-y-3 mb-4">
            {savedAddresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                isSelected={selectedAddressId === address.id && !useNewAddress}
                onSelect={() => onAddressSelect(address.id)}
                onDelete={() => onDeleteAddress(address.id)}
                isDeleting={deletingAddressId === address.id}
              />
            ))}
          </div>
          <button
            onClick={onNewAddressToggle}
            className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Address
          </button>
        </>
      ) : (
        <button
          onClick={onNewAddressToggle}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-green-600 hover:border-green-400 transition-colors"
        >
          + Add Delivery Address
        </button>
      )}
      {useNewAddress && (
        <div className="mt-4 space-y-3">
          <h3 className="font-medium text-gray-900">New Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              name="name"
              value={newAddressForm.name}
              onChange={onNewAddressChange}
              placeholder="Full name *"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <input
              type="tel"
              name="phone"
              value={newAddressForm.phone}
              onChange={onNewAddressChange}
              placeholder="Phone number *"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <input
              type="text"
              name="street"
              value={newAddressForm.street}
              onChange={onNewAddressChange}
              placeholder="Street address *"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <input
              type="text"
              name="area"
              value={newAddressForm.area}
              onChange={onNewAddressChange}
              placeholder="Area (optional)"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <input
              type="text"
              name="city"
              value={newAddressForm.city}
              onChange={onNewAddressChange}
              placeholder="City *"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <select
              name="state"
              value={newAddressForm.state}
              onChange={onNewAddressChange}
              disabled={statesLoading}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">{statesLoading ? "Loading states..." : "Select State"}</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
            <select
              name="lga"
              value={newAddressForm.lga}
              onChange={onNewAddressChange}
              disabled={!newAddressForm.state || lgasLoading}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">
                {lgasLoading
                  ? "Loading LGAs..."
                  : newAddressForm.state
                  ? "Select LGA"
                  : "Select state first"}
              </option>
              {lgas.map((lga) => (
                <option key={lga.id} value={lga.id}>
                  {lga.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="landmark"
              value={newAddressForm.landmark}
              onChange={onNewAddressChange}
              placeholder="Landmark (optional)"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <label className="flex items-center gap-2 col-span-full">
              <input
                type="checkbox"
                name="isDefault"
                checked={newAddressForm.isDefault}
                onChange={onNewAddressChange}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Set as default address</span>
            </label>
          </div>
          <button
            onClick={onSaveNewAddress}
            disabled={creatingAddress}
            className="mt-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {creatingAddress && <LoadingSpinner size="sm" />}
            {creatingAddress ? "Saving..." : "Save Address"}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            This address will be saved to your account and can be reused later.
          </p>
        </div>
      )}
    </div>
  );
};

const OrderSummary: React.FC<{
  cartItems: CartItemForDisplay[];
  cartSubtotal: number;
  shippingFee: number;
  couponPreview: any;
  couponCode: string;
  finalAmount: number;
  onRemoveCoupon: () => void;
  cartLoading?: boolean;
}> = ({
  cartItems,
  cartSubtotal,
  shippingFee,
  couponPreview,
  couponCode,
  finalAmount,
  onRemoveCoupon,
  cartLoading,
}) => {
  if (cartLoading) {
    return <OrderSummarySkeleton />;
  }

  const getItemPrice = (item: CartItemForDisplay) => item.unitPrice ?? item.price;
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
      <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex gap-3">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="text-sm text-gray-600">
                Qty: {item.quantity} × ₦{getItemPrice(item).toLocaleString()}
              </p>
            </div>
            <p className="font-medium">
              ₦{(getItemPrice(item) * item.quantity).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>₦{cartSubtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping Fee</span>
          <span>₦{shippingFee.toLocaleString()}</span>
        </div>
        {couponPreview?.valid && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({couponCode})</span>
            <span>-₦{couponPreview.discount.toLocaleString()}</span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>₦{finalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
      {couponPreview?.valid && (
        <button
          onClick={onRemoveCoupon}
          className="mt-3 text-sm text-red-500 hover:text-red-600"
        >
          Remove coupon
        </button>
      )}
    </div>
  );
};

const CouponSection: React.FC<{
  couponCode: string;
  setCouponCode: (value: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  couponApplying: boolean;
  couponPreview: any;
}> = ({
  couponCode,
  setCouponCode,
  onApplyCoupon,
  onRemoveCoupon,
  couponApplying,
  couponPreview,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Coupon Code</h2>
      <div className="flex gap-3">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          placeholder="Enter coupon code"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          disabled={!!couponPreview?.valid}
        />
        {couponPreview?.valid ? (
          <button
            onClick={onRemoveCoupon}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Remove
          </button>
        ) : (
          <button
            onClick={onApplyCoupon}
            disabled={couponApplying || !couponCode.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {couponApplying && <LoadingSpinner size="sm" />}
            Apply
          </button>
        )}
      </div>
      {couponPreview && !couponPreview.valid && couponPreview.message && (
        <p className="mt-2 text-sm text-red-500">{couponPreview.message}</p>
      )}
      {couponPreview?.valid && (
        <p className="mt-2 text-sm text-green-600">
          {couponPreview.discount.toLocaleString()} discount applied!
        </p>
      )}
    </div>
  );
};

/* ================= MAIN PAGE ================= */
const CheckoutPage: React.FC = () => {
  // Fetch cart data
  const {
    data: cartData,
    isLoading: cartLoading,
    isError: cartError,
    error: cartErrorObj,
  } = useGetCartQuery();

  // Address queries
  const {
    data: addressesData,
    isLoading: addressLoading,
    refetch: refetchAddresses,
  } = useGetMyAddressesQuery();
  const savedAddresses = addressesData?.addresses ?? [];

  const [createAddress, { isLoading: creatingAddress }] = useCreateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [createCheckout, { isLoading: placeOrderLoading }] = useCreateCheckoutMutation();
  const [initializePayment, { isLoading: paymentInitializing }] = useInitializePaymentMutation();
  const [previewCoupon, { isLoading: couponApplying }] = usePreviewCouponMutation();
  const navigate = useNavigate();

  // Location queries
  const {
    data: states = [],
    isLoading: statesLoading,
    isError: statesError,
  } = useGetStatesQuery();
  const [selectedStateId, setSelectedStateId] = useState<string>("");
  const {
    data: lgas = [],
    isLoading: lgasLoading,
    isFetching: lgasFetching,
  } = useGetLgasByStateQuery(selectedStateId, {
    skip: !selectedStateId,
  });

  // Local state
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponPreview, setCouponPreview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<any>(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);

  const [newAddressForm, setNewAddressForm] = useState<AddressFormData>({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    lga: "",
    area: "",
    landmark: "",
    isDefault: false,
  });

  // When state selection changes, reset LGA and fetch new LGAs (handled by RTK query skip)
  useEffect(() => {
    if (newAddressForm.state !== selectedStateId) {
      setSelectedStateId(newAddressForm.state);
      // Reset lga field when state changes
      if (newAddressForm.lga) {
        setNewAddressForm((prev) => ({ ...prev, lga: "" }));
      }
    }
  }, [newAddressForm.state, selectedStateId]);

  // Extract real cart data
  const rawCartItems = cartData?.cart?.items ?? [];
  const cartItemsDisplay = rawCartItems.map(transformCartItem);
  const cartSubtotal = cartData?.totals?.subtotal ?? 0;
  const initialShipping = cartData?.shipping ?? 0;

  // Update shipping and final amount when cart loads
  useEffect(() => {
    if (!cartLoading && cartData) {
      setShippingFee(initialShipping);
      setFinalAmount(initialShipping + cartSubtotal - (couponPreview?.discount || 0));
    }
  }, [cartLoading, cartData, couponPreview, initialShipping, cartSubtotal]);

  // Auto-select default address when addresses load
  useEffect(() => {
    if (!addressLoading && savedAddresses.length > 0 && !selectedAddressId) {
      const defaultAddr = savedAddresses.find((addr) => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else {
        setSelectedAddressId(savedAddresses[0].id);
      }
    }
  }, [addressLoading, savedAddresses, selectedAddressId]);

  // Show skeleton loader only when cart or address is loading initially
  if (cartLoading || addressLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <div className="h-9 bg-gray-200 rounded w-32 animate-pulse mb-2"></div>
              <div className="h-5 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <AddressSectionSkeleton />
              <CouponSectionSkeleton />
            </div>
            <div className="space-y-6">
              <OrderSummarySkeleton />
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error handling for cart
  if (cartError) {
    const errorMsg =
      (cartErrorObj as any)?.data?.message || "Failed to load your cart. Please try again.";
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-center">
          <p>{errorMsg}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty cart
  if (cartItemsDisplay.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600">Your cart is empty.</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 text-green-600 hover:text-green-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  /* ================= HANDLERS ================= */
  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id);
    setUseNewAddress(false);
  };

  const handleNewAddressToggle = () => {
    setUseNewAddress(true);
    setSelectedAddressId(null);
  };

  const handleNewAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setNewAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveNewAddress = async () => {
    if (
      !newAddressForm.name ||
      !newAddressForm.phone ||
      !newAddressForm.street ||
      !newAddressForm.city ||
      !newAddressForm.state ||
      !newAddressForm.lga
    ) {
      setError("Please fill all required fields");
      return;
    }

    // Find state and LGA names for building full address
    const selectedState = states.find((s) => s.id === newAddressForm.state);
    const selectedLga = lgas.find((l) => l.id === newAddressForm.lga);

    if (!selectedState || !selectedLga) {
      setError("Invalid state or LGA selection");
      return;
    }

    const fullAddress = buildFullAddress(
      newAddressForm.street,
      newAddressForm.area,
      newAddressForm.city,
      selectedLga.name,
      selectedState.name
    );

    try {
      const result = await createAddress({
        name: newAddressForm.name,
        phone: newAddressForm.phone,
        stateId: newAddressForm.state,
        lgaId: newAddressForm.lga,
        city: newAddressForm.city,
        area: newAddressForm.area,
        street: newAddressForm.street,
        landmark: newAddressForm.landmark,
        fullAddress,
        isDefault: newAddressForm.isDefault,
      }).unwrap();

      await refetchAddresses();
      setSelectedAddressId(result.address.id);
      setUseNewAddress(false);
      setError(null);
      setNewAddressForm({
        name: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        lga: "",
        area: "",
        landmark: "",
        isDefault: false,
      });
      // Reset selected state id for LGA dropdown
      setSelectedStateId("");
    } catch (err: any) {
      setError(err?.data?.message || "Failed to save address");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this address? This action cannot be undone."
    );
    if (!confirmDelete) return;

    setDeletingAddressId(addressId);
    try {
      await deleteAddress(addressId).unwrap();
      await refetchAddresses();
      
      // If the deleted address was selected, clear selection
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err?.data?.message || "Failed to delete address");
    } finally {
      setDeletingAddressId(null);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const result = await previewCoupon({
        code: couponCode,
        orderAmount: cartSubtotal + shippingFee,
      }).unwrap();
      setCouponPreview(result);
      setError(null);
    } catch (err: any) {
      setCouponPreview({ valid: false, message: err?.message || "Invalid coupon" });
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponPreview(null);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId && !useNewAddress) {
      setError("Please select or add a delivery address");
      return;
    }

    setError(null);

    try {
      const payload: any = {};

      if (useNewAddress) {
        if (
          !newAddressForm.name ||
          !newAddressForm.phone ||
          !newAddressForm.street ||
          !newAddressForm.city ||
          !newAddressForm.state ||
          !newAddressForm.lga
        ) {
          setError("Please complete the new address form");
          return;
        }

        const selectedState = states.find((s) => s.id === newAddressForm.state);
        const selectedLga = lgas.find((l) => l.id === newAddressForm.lga);

        if (!selectedState || !selectedLga) {
          setError("Invalid state or LGA selection");
          return;
        }

        const fullAddress = buildFullAddress(
          newAddressForm.street,
          newAddressForm.area,
          newAddressForm.city,
          selectedLga.name,
          selectedState.name
        );

        payload.address = {
          name: newAddressForm.name,
          phone: newAddressForm.phone,
          stateId: newAddressForm.state,
          lgaId: newAddressForm.lga,
          city: newAddressForm.city,
          area: newAddressForm.area,
          street: newAddressForm.street,
          landmark: newAddressForm.landmark,
          fullAddress,
        };
      } else if (selectedAddressId) {
        payload.addressId = selectedAddressId;
      } else {
        setError("No address selected");
        return;
      }

      if (couponPreview?.valid) {
        payload.couponCode = couponCode;
      }

      const checkoutResult = await createCheckout(payload).unwrap();
      const orderData = (checkoutResult as any).order || (checkoutResult as any).data?.order;
      if (!orderData) throw new Error("Invalid checkout response");

      setShippingFee((checkoutResult as any).shippingFee ?? 0);
      setSuccessOrder(orderData);

      const paymentResult = await initializePayment({
        orderId: orderData.id,
      }).unwrap();

      window.location.href = paymentResult.authorization_url;
    } catch (err: any) {
      setError(err?.data?.message || err?.message || "Failed to place order");
    }
  };

  // Success / redirecting view
  if (successOrder && paymentInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-600 mb-4">
            Your order #{successOrder.orderNumber} has been created successfully.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Redirecting you to complete payment...
          </p>
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 mt-1">Complete your purchase securely</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-green-600 transition-colors border border-gray-300 rounded-lg hover:border-green-500"
          >
           <ChevronLeft size={20} className="group-hover:-translate-x-1 transition" />
            Back
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        )}

        {/* Show location API error if needed */}
        {statesError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Failed to load states. Please refresh the page.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AddressSection
              savedAddresses={savedAddresses}
              addressLoading={addressLoading}
              selectedAddressId={selectedAddressId}
              useNewAddress={useNewAddress}
              onAddressSelect={handleAddressSelect}
              onNewAddressToggle={handleNewAddressToggle}
              onDeleteAddress={handleDeleteAddress}
              deletingAddressId={deletingAddressId}
              newAddressForm={newAddressForm}
              onNewAddressChange={handleNewAddressChange}
              onSaveNewAddress={handleSaveNewAddress}
              creatingAddress={creatingAddress}
              states={states}
              statesLoading={statesLoading}
              lgas={lgas}
              lgasLoading={lgasLoading || lgasFetching}
            />
            <CouponSection
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              couponApplying={couponApplying}
              couponPreview={couponPreview}
            />
          </div>

          <div className="space-y-6">
            <OrderSummary
              cartItems={cartItemsDisplay}
              cartSubtotal={cartSubtotal}
              shippingFee={shippingFee}
              couponPreview={couponPreview}
              couponCode={couponCode}
              finalAmount={finalAmount}
              onRemoveCoupon={handleRemoveCoupon}
              cartLoading={cartLoading}
            />
            <button
              onClick={handlePlaceOrder}
              disabled={
                placeOrderLoading ||
                paymentInitializing ||
                (!selectedAddressId && !useNewAddress) ||
                (useNewAddress &&
                  (!newAddressForm.name ||
                    !newAddressForm.phone ||
                    !newAddressForm.street ||
                    !newAddressForm.city ||
                    !newAddressForm.state ||
                    !newAddressForm.lga))
              }
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {(placeOrderLoading || paymentInitializing) && <LoadingSpinner size="sm" />}
              {placeOrderLoading || paymentInitializing ? "Processing..." : "Place Order"}
            </button>
            <p className="text-xs text-gray-500 text-center">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
              Your payment information is securely processed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;