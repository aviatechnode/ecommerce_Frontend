import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../admin/store/store";

/* ================= ADDRESS ================= */
import {
  fetchAddresses,
  createAddress,
} from "../../admin/state-management/address.slice";

/* ================= RTK QUERY ================= */
import {
  useCreateCheckoutMutation,
  useInitializePaymentMutation,
  usePreviewCouponMutation,
} from "../../services/checkoutApi";

import type { RootState } from "../../admin/store/store";

/* ========================================================= */

interface AddressPayload {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  lga: string;
  area?: string | null;
  landmark?: string | null;
  isDefault?: boolean;
}

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

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  unitPrice?: number;
}

/* ========================================================= */

const useCheckout = () => {
  const dispatch = useAppDispatch();

  /* ================= RTK QUERY ================= */

  const [createCheckout, checkoutState] =
    useCreateCheckoutMutation();

  const [initializePayment] =
    useInitializePaymentMutation();

  const [previewCoupon, couponState] =
    usePreviewCouponMutation();

  /* ================= ADDRESS ================= */

  const addressState = useSelector(
    (state: RootState) => state.address
  );

  const savedAddresses = addressState.items;
  const addressLoading = addressState.loading;

  /* ================= CART ================= */

  const cartData = useSelector(
    (state: RootState) => state.cart.cart
  );

  const cartSubtotal = useSelector(
    (state: RootState) => state.cart.totals.subtotal
  );

  const cartItems: CartItem[] = useMemo(() => {
    return (cartData?.items ?? []).map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),

      name:
        item.variant?.product?.name ||
        item.variant?.name ||
        "Product",

      price: Number(item.unitPrice),

      image:
        item.variant?.product?.medias?.[0]?.url || "",
    }));
  }, [cartData]);

  /* ================= LOCAL UI STATE ================= */

  const [selectedAddressId, setSelectedAddressId] =
    useState<string | null>(null);

  const [useNewAddress, setUseNewAddress] =
    useState(false);

  const [couponCode, setCouponCode] = useState("");

  const [newAddressForm, setNewAddressForm] =
    useState<AddressFormData>({
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

  const [creatingAddress, setCreatingAddress] =
    useState(false);

  const [placeOrderLoading, setPlaceOrderLoading] =
    useState(false);

  /* ================= EFFECTS ================= */

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  useEffect(() => {
    if (checkoutState.data?.payment) {
      initializePayment({
        orderId: checkoutState.data.order.id,
      })
        .unwrap()
        .then((res) => {
          if (res.authorization_url) {
            window.location.href =
              res.authorization_url;
          }
        });
    }
  }, [checkoutState.data, initializePayment]);

  /* ================= DERIVED ================= */

  const shippingFee =
    checkoutState.data?.shippingFee || 0;

  const couponPreview = couponState.data;

  const finalAmount = useMemo(() => {
    let amount = cartSubtotal + shippingFee;

    if (couponPreview?.valid) {
      amount -= couponPreview.discount;
    }

    return Math.max(0, amount);
  }, [cartSubtotal, shippingFee, couponPreview]);

  /* ================= ACTIONS ================= */

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    await previewCoupon({
      code: couponCode,
      orderAmount: cartSubtotal,
    });
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
  };

  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id);
    setUseNewAddress(false);
  };

  const handleNewAddressToggle = () => {
    setUseNewAddress(true);
    setSelectedAddressId(null);
  };

  const handleNewAddressChange = (
  e: React.ChangeEvent<
    HTMLInputElement | HTMLSelectElement
  >
) => {
  const { name, value, type } = e.target;

  const checked =
    type === "checkbox"
      ? (e.target as HTMLInputElement).checked
      : false;

  setNewAddressForm((prev) => {
    if (name === "state") {
      return {
        ...prev,
        state: value,
        lga: "", // reset LGA when state changes
      };
    }

    return {
      ...prev,
      [name]:
        type === "checkbox" ? checked : value,
    };
  });
};

  const handleSaveNewAddress = async () => {
    setCreatingAddress(true);

    try {
      const payload: AddressPayload = {
        name: newAddressForm.name.trim(),
        phone: newAddressForm.phone.trim(),
        street: newAddressForm.street.trim(),
        city: newAddressForm.city.trim(),
        state: newAddressForm.state,
        lga: newAddressForm.lga,
        area:
          newAddressForm.area?.trim() || null,
        landmark:
          newAddressForm.landmark?.trim() || null,
        isDefault: newAddressForm.isDefault,
      };

      const created = await dispatch(
        createAddress(payload)
      ).unwrap();

      setSelectedAddressId(created.id);
      setUseNewAddress(false);

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
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) return;

    setPlaceOrderLoading(true);

    try {
      await createCheckout({
        addressId: selectedAddressId,
        couponCode:
          couponPreview?.valid
            ? couponCode
            : undefined,
      }).unwrap();
    } finally {
      setPlaceOrderLoading(false);
    }
  };

  /* ================= RETURN ================= */

  return {
    loading: checkoutState.isLoading,
    error:
      (checkoutState.error as any)?.data ||
      checkoutState.error,
    success: !!checkoutState.data,
    order: checkoutState.data?.order,

    shippingFee,
    cartSubtotal,
    cartItems,
    finalAmount,

    savedAddresses,
    addressLoading,
    selectedAddressId,
    useNewAddress,

    couponCode,
    couponPreview,
    setCouponCode,

    creatingAddress,
    placeOrderLoading,
    newAddressForm,

    handleApplyCoupon,
    handleRemoveCoupon,
    handleAddressSelect,
    handleNewAddressToggle,
    handleNewAddressChange,
    handleSaveNewAddress,
    handlePlaceOrder,
  };
};

export default useCheckout;