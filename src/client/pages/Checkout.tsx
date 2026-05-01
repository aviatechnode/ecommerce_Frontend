import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import type { UnknownAction, ThunkDispatch } from "@reduxjs/toolkit";
import {
  createCheckout,
  initializePayment,
  previewCoupon,
  resetCheckoutState,
  clearCheckoutError,
  setSelectedAddress,
  enableNewAddress,
  setSavedAddresses,
  setCouponCode,
  clearCoupon,
} from "../../admin/state-management/checkoutSlice";
import { api } from "../../api/axios";
import type { RootState } from "../../admin/store/store";

/* =========================================================
TYPES & HELPERS
========================================================= */
interface AddressFormData {
  street: string;
  city: string;
  state: string;
  lga: string;
  phone: string;
  country?: string;
  landmark?: string;
  postalCode?: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  unitPrice?: number;
}

type AppDispatch = ThunkDispatch<RootState, unknown, UnknownAction>;

/* =========================================================
CUSTOM HOOK
========================================================= */
const useCheckout = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Checkout state
  const checkoutState = useSelector((state: RootState) => state.checkout);
  const {
    loading,
    success,
    error,
    order,
    payment,
    shippingFee: shippingFeeState,
    paymentAuthorizationUrl,
    selectedAddressId,
    useNewAddress,
    savedAddresses,
    couponCode,
    couponPreview,
  } = checkoutState;

  // Cart state - adjusted to your cart slice structure
  const cartData = useSelector((state: RootState) => state.cart.cart);
  const cartItems = (cartData?.items as CartItem[]) ?? [];
  const cartSubtotal = useSelector((state: RootState) => state.cart.totals.subtotal);

  // Local state
  const [newAddressForm, setNewAddressForm] = useState<AddressFormData>({
    street: "",
    city: "",
    state: "",
    lga: "",
    phone: "",
    country: "Nigeria",
    landmark: "",
    postalCode: "",
  });
  const [addressLoading, setAddressLoading] = useState(false);
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponInput, setCouponInput] = useState(couponCode);
  const [placeOrderLoading, setPlaceOrderLoading] = useState(false);

  // Fetch saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      setAddressLoading(true);
      try {
        const response = await api.get("/api/addresses", {
          withCredentials: true,
        });
        dispatch(setSavedAddresses(response.data.addresses));
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
      } finally {
        setAddressLoading(false);
      }
    };
    fetchAddresses();
  }, [dispatch]);

  // Redirect to payment URL
  useEffect(() => {
    if (paymentAuthorizationUrl) {
      window.location.href = paymentAuthorizationUrl;
    }
  }, [paymentAuthorizationUrl]);

  // Reset on unmount
  useEffect(() => {
    return () => {
      dispatch(resetCheckoutState());
    };
  }, [dispatch]);

  // Auto-clear error
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearCheckoutError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Calculate final amount
  const finalAmount = useMemo(() => {
    let amount = cartSubtotal + (shippingFeeState || 0);
    if (couponPreview?.valid && couponPreview.discount) {
      amount = Math.max(0, amount - couponPreview.discount);
    }
    return amount;
  }, [cartSubtotal, shippingFeeState, couponPreview]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponApplying(true);
    try {
      const result = await dispatch(
        previewCoupon({
          code: couponInput,
          orderAmount: cartSubtotal,
        })
      );
      // Unwrap to get the payload or throw on rejection
      unwrapResult(result);
      dispatch(setCouponCode(couponInput));
    } catch (err) {
      // Error is already stored in state via rejected case
      console.error("Coupon error:", err);
    } finally {
      setCouponApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponInput("");
    dispatch(clearCoupon());
  };

  const handleAddressSelect = (addressId: string) => {
    dispatch(setSelectedAddress(addressId));
  };

  const handleNewAddressToggle = () => {
    dispatch(enableNewAddress());
  };

  const handleNewAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateNewAddress = (): boolean => {
    const required = ["street", "city", "state", "lga", "phone"];
    return required.every((field) => 
      newAddressForm[field as keyof AddressFormData]?.trim()
    );
  };

  const handlePlaceOrder = async () => {
    if (!useNewAddress && !selectedAddressId) {
      alert("Please select a delivery address");
      return;
    }
    if (useNewAddress && !validateNewAddress()) {
      alert("Please fill in all required address fields");
      return;
    }

    setPlaceOrderLoading(true);
    try {
      const payload: any = {
        couponCode: couponPreview?.valid ? couponCode : undefined,
      };

      if (useNewAddress) {
        payload.address = {
          type: "DELIVERY",
          street: newAddressForm.street,
          city: newAddressForm.city,
          state: newAddressForm.state,
          lga: newAddressForm.lga,
          phone: newAddressForm.phone,
          country: newAddressForm.country || "Nigeria",
          landmark: newAddressForm.landmark,
          postalCode: newAddressForm.postalCode,
        };
      } else if (selectedAddressId) {
        payload.addressId = selectedAddressId;
      }

      // Step 1: Create checkout
      const checkoutResult = await dispatch(createCheckout(payload)).then(unwrapResult);
      // Step 2: Initialize payment
      await dispatch(initializePayment({ orderId: checkoutResult.order.id })).then(unwrapResult);
      // Redirect will happen in useEffect
    } catch (err) {
      console.error("Checkout failed:", err);
    } finally {
      setPlaceOrderLoading(false);
    }
  };

  return {
    loading,
    success,
    error,
    order,
    payment,
    shippingFeeState,
    selectedAddressId,
    useNewAddress,
    savedAddresses,
    couponCode,
    couponPreview,
    cartItems,
    cartSubtotal,
    addressLoading,
    couponApplying,
    placeOrderLoading,
    couponInput,
    newAddressForm,
    finalAmount,
    setCouponInput,
    handleApplyCoupon,
    handleRemoveCoupon,
    handleAddressSelect,
    handleNewAddressToggle,
    handleNewAddressChange,
    handlePlaceOrder,
  };
};

/* =========================================================
COMPONENTS (unchanged from your version)
========================================================= */
const LoadingSpinner: React.FC<{ size?: "sm" | "md" | "lg" }> = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };
  return (
    <div className={`${sizeClasses[size]} border-2 border-white border-t-transparent rounded-full animate-spin`} />
  );
};

const AddressCard: React.FC<{
  address: any;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ address, isSelected, onSelect }) => {
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
          <p className="font-medium text-gray-900">{address.street}</p>
          <p className="text-sm text-gray-600">
            {address.city}, {address.state}, {address.lga}
          </p>
          <p className="text-sm text-gray-600">Phone: {address.phone}</p>
        </div>
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
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

const AddressSection: React.FC<{
  savedAddresses: any[];
  addressLoading: boolean;
  selectedAddressId: string | null;
  useNewAddress: boolean;
  onAddressSelect: (id: string) => void;
  onNewAddressToggle: () => void;
  newAddressForm: AddressFormData;
  onNewAddressChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}> = ({
  savedAddresses,
  addressLoading,
  selectedAddressId,
  useNewAddress,
  onAddressSelect,
  onNewAddressToggle,
  newAddressForm,
  onNewAddressChange,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Address</h2>
      {addressLoading ? (
        <div className="flex justify-center py-8"><LoadingSpinner /></div>
      ) : savedAddresses.length > 0 ? (
        <>
          <div className="space-y-3 mb-4">
            {savedAddresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                isSelected={selectedAddressId === address.id && !useNewAddress}
                onSelect={() => onAddressSelect(address.id)}
              />
            ))}
          </div>
          <button
            onClick={onNewAddressToggle}
            className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
            <input type="text" name="street" value={newAddressForm.street} onChange={onNewAddressChange} placeholder="Street address *" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            <input type="text" name="city" value={newAddressForm.city} onChange={onNewAddressChange} placeholder="City *" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            <input type="text" name="state" value={newAddressForm.state} onChange={onNewAddressChange} placeholder="State *" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            <input type="text" name="lga" value={newAddressForm.lga} onChange={onNewAddressChange} placeholder="LGA *" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            <input type="tel" name="phone" value={newAddressForm.phone} onChange={onNewAddressChange} placeholder="Phone number *" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            <input type="text" name="landmark" value={newAddressForm.landmark} onChange={onNewAddressChange} placeholder="Landmark (optional)" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>
        </div>
      )}
    </div>
  );
};

const OrderSummary: React.FC<{
  cartItems: CartItem[];
  cartSubtotal: number;
  shippingFee: number;
  couponPreview: any;
  couponCode: string;
  finalAmount: number;
  onRemoveCoupon: () => void;
}> = ({ cartItems, cartSubtotal, shippingFee, couponPreview, couponCode, finalAmount, onRemoveCoupon }) => {
  // Helper to get price: use unitPrice or price
  const getItemPrice = (item: CartItem) => item.unitPrice ?? item.price;
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
      <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex gap-3">
            {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />}
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="text-sm text-gray-600">Qty: {item.quantity} × ₦{getItemPrice(item).toLocaleString()}</p>
            </div>
            <p className="font-medium">₦{(getItemPrice(item) * item.quantity).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₦{cartSubtotal.toLocaleString()}</span></div>
        <div className="flex justify-between text-gray-600"><span>Shipping Fee</span><span>₦{shippingFee.toLocaleString()}</span></div>
        {couponPreview?.valid && (
          <div className="flex justify-between text-green-600"><span>Discount ({couponCode})</span><span>-₦{couponPreview.discount.toLocaleString()}</span></div>
        )}
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between text-lg font-bold text-gray-900"><span>Total</span><span>₦{finalAmount.toLocaleString()}</span></div>
        </div>
      </div>
      {couponPreview?.valid && (
        <button onClick={onRemoveCoupon} className="mt-3 text-sm text-red-500 hover:text-red-600">Remove coupon</button>
      )}
    </div>
  );
};

const CouponSection: React.FC<{
  couponInput: string;
  setCouponInput: (value: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  couponApplying: boolean;
  couponPreview: any;
}> = ({ couponInput, setCouponInput, onApplyCoupon, onRemoveCoupon, couponApplying, couponPreview }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Coupon Code</h2>
      <div className="flex gap-3">
        <input type="text" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Enter coupon code" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" disabled={!!couponPreview?.valid} />
        {couponPreview?.valid ? (
          <button onClick={onRemoveCoupon} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Remove</button>
        ) : (
          <button onClick={onApplyCoupon} disabled={couponApplying || !couponInput.trim()} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {couponApplying && <LoadingSpinner size="sm" />}Apply
          </button>
        )}
      </div>
      {couponPreview && !couponPreview.valid && couponPreview.message && <p className="mt-2 text-sm text-red-500">{couponPreview.message}</p>}
      {couponPreview?.valid && <p className="mt-2 text-sm text-green-600">{couponPreview.discount.toLocaleString()} discount applied!</p>}
    </div>
  );
};

/* =========================================================
MAIN PAGE
========================================================= */
const CheckoutPage: React.FC = () => {
  const {
    loading,
    success,
    error,
    order,
    shippingFeeState,
    savedAddresses,
    addressLoading,
    couponApplying,
    placeOrderLoading,
    couponInput,
    newAddressForm,
    finalAmount,
    cartSubtotal,
    cartItems,
    couponPreview,
    couponCode,
    selectedAddressId,
    useNewAddress,
    setCouponInput,
    handleApplyCoupon,
    handleRemoveCoupon,
    handleAddressSelect,
    handleNewAddressToggle,
    handleNewAddressChange,
    handlePlaceOrder,
  } = useCheckout();

  if (success && order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-600 mb-4">Your order #{order.orderNumber} has been created successfully.</p>
          <p className="text-sm text-gray-500 mb-6">You will be redirected to complete payment...</p>
          <div className="flex justify-center"><LoadingSpinner /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-1">Complete your purchase securely</p>
        </div>
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => {}} className="text-red-500 hover:text-red-700">×</button>
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
              newAddressForm={newAddressForm}
              onNewAddressChange={handleNewAddressChange}
            />
            <CouponSection
              couponInput={couponInput}
              setCouponInput={setCouponInput}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              couponApplying={couponApplying}
              couponPreview={couponPreview}
            />
          </div>
          <div className="space-y-6">
            <OrderSummary
              cartItems={cartItems}
              cartSubtotal={cartSubtotal}
              shippingFee={shippingFeeState}
              couponPreview={couponPreview}
              couponCode={couponCode}
              finalAmount={finalAmount}
              onRemoveCoupon={handleRemoveCoupon}
            />
            <button
              onClick={handlePlaceOrder}
              disabled={loading || placeOrderLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {(loading || placeOrderLoading) && <LoadingSpinner size="sm" />}
              {loading || placeOrderLoading ? "Processing..." : "Place Order"}
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