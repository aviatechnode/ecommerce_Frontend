import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import {
  useCreateCouponMutation,
  useDeleteCouponMutation,
  useExpireCouponsMutation,
  useListCouponsQuery,
  useReleaseReservationsMutation,
} from "../../services/couponApi";

import type {
  CouponAppliesTo,
  CouponScope,
  CouponStatus,
  CouponType,
  CreateCouponDto,
} from "../../types/coupon-types";

/* =========================================================
   FORM STATE INTERFACE
========================================================= */
interface CouponFormState {
  code: string;
  name: string;
  description: string;
  type: CouponType;
  scope: CouponScope;
  priority: string;               // stored as string from input
  amountOff: string;
  percentOff: string;
  maxDiscountAmount: string;
  freeShipping: boolean;
  minimumOrderAmount: string;
  minimumItemQuantity: string;
  firstOrderOnly: boolean;
  appliesTo: CouponAppliesTo;
  status: CouponStatus;
  startsAt: string;
  expiresAt: string;
  usageLimit: string;
  perUserLimit: string;
  isStackable: boolean;
  excludeSaleItems: boolean;
  productIdsText: string;
  categoryIdsText: string;
  customerIdsText: string;
  metadataJson: string;
}

const initialFormState: CouponFormState = {
  code: "",
  name: "",
  description: "",
  type: "PERCENTAGE",
  scope: "ORDER_TOTAL",
  priority: "0",
  amountOff: "",
  percentOff: "",
  maxDiscountAmount: "",
  freeShipping: false,
  minimumOrderAmount: "",
  minimumItemQuantity: "",
  firstOrderOnly: false,
  appliesTo: "ALL_PRODUCTS",
  status: "DRAFT",
  startsAt: "",
  expiresAt: "",
  usageLimit: "",
  perUserLimit: "1",
  isStackable: false,
  excludeSaleItems: false,
  productIdsText: "",
  categoryIdsText: "",
  customerIdsText: "",
  metadataJson: "{}",
};

/* =========================================================
   UTILITIES
========================================================= */
const generateCouponCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  const length = 8 + Math.floor(Math.random() * 5);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
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
const AdminCoupons = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<CouponStatus | undefined>(undefined);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CouponFormState>(initialFormState);
  const [isGenerating, setIsGenerating] = useState(false);

  const queryParams = useMemo(
    () => ({ page, limit: 20, status }),
    [page, status]
  );

  const { data, isLoading, isFetching, refetch } = useListCouponsQuery(queryParams);
  const [createCoupon, { isLoading: creating }] = useCreateCouponMutation();
  const [deleteCoupon, { isLoading: deleting }] = useDeleteCouponMutation();
  const [expireCoupons, { isLoading: expiring }] = useExpireCouponsMutation();
  const [releaseReservations, { isLoading: releasing }] = useReleaseReservationsMutation();

  /* ---------------------------------------------------------
     Maintenance handlers
  --------------------------------------------------------- */
  const handleExpireCoupons = async () => {
    if (!window.confirm("Are you sure you want to expire all currently active coupons that have passed their expiration date?")) {
      return;
    }
    try {
      const result = await expireCoupons().unwrap();
      alert(`Successfully expired ${result.expired} coupon(s).`);
      refetch();
    } catch (error) {
      console.error("Failed to expire coupons:", error);
      alert("Failed to expire coupons. Check console for details.");
    }
  };

  const handleReleaseReservations = async () => {
    if (!window.confirm("Release all expired or stale coupon reservations? This may affect pending checkouts.")) {
      return;
    }
    try {
      const result = await releaseReservations().unwrap();
      alert(`Successfully released ${result.released} reservation(s).`);
      refetch();
    } catch (error) {
      console.error("Failed to release reservations:", error);
      alert("Failed to release reservations. Check console for details.");
    }
  };

  /* ---------------------------------------------------------
     Form helpers
  --------------------------------------------------------- */
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

  const handleGenerateCode = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newCode = generateCouponCode();
      setFormData((prev) => ({ ...prev, code: newCode }));
      setIsGenerating(false);
    }, 100);
  };

  /* ---------------------------------------------------------
     Transform to DTO – parse all numeric strings to numbers
  --------------------------------------------------------- */
  const buildCreatePayload = (): CreateCouponDto => {
    const payload: CreateCouponDto = {
      code: formData.code.trim(),
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      type: formData.type,
      scope: formData.scope,
      priority: parseInt(formData.priority, 10) || 0,
      freeShipping: formData.freeShipping,
      firstOrderOnly: formData.firstOrderOnly,
      appliesTo: formData.appliesTo,
      status: formData.status,
      isStackable: formData.isStackable,
      excludeSaleItems: formData.excludeSaleItems,
      perUserLimit: parseInt(formData.perUserLimit, 10) || 1,
    };

    if (formData.amountOff) payload.amountOff = parseFloat(formData.amountOff);
    if (formData.percentOff) payload.percentOff = parseFloat(formData.percentOff);
    if (formData.maxDiscountAmount) payload.maxDiscountAmount = parseFloat(formData.maxDiscountAmount);
    if (formData.minimumOrderAmount) payload.minimumOrderAmount = parseFloat(formData.minimumOrderAmount);
    if (formData.minimumItemQuantity) payload.minimumItemQuantity = parseInt(formData.minimumItemQuantity, 10);
    if (formData.usageLimit) payload.usageLimit = parseInt(formData.usageLimit, 10);
    if (formData.startsAt) payload.startsAt = new Date(formData.startsAt).toISOString();
    if (formData.expiresAt) payload.expiresAt = new Date(formData.expiresAt).toISOString();

    payload.productIds = formData.productIdsText.split(",").map((id) => id.trim()).filter(Boolean);
    payload.categoryIds = formData.categoryIdsText.split(",").map((id) => id.trim()).filter(Boolean);
    payload.customerIds = formData.customerIdsText.split(",").map((id) => id.trim()).filter(Boolean);

    try {
      payload.metadata = JSON.parse(formData.metadataJson);
    } catch {
      payload.metadata = {};
    }

    return payload;
  };

  const handleCreateCoupon = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      alert("Code and Name are required");
      return;
    }
    try {
      const payload = buildCreatePayload();
      await createCoupon(payload).unwrap();
      alert("Coupon created successfully");
      resetForm();
      setShowCreateForm(false);
      refetch();
    } catch (error) {
      console.error(error);
      alert("Failed to create coupon");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await deleteCoupon(id).unwrap();
      alert("Coupon deleted successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to delete coupon");
    }
  };

  const getStatusBadgeColor = (status: CouponStatus) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800";
      case "DRAFT": return "bg-gray-100 text-gray-800";
      case "EXPIRED": return "bg-red-100 text-red-800";
      case "PAUSED": return "bg-yellow-100 text-yellow-800";
      case "ARCHIVED": return "bg-gray-300 text-gray-700";
      default: return "bg-gray-100 text-gray-800";
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
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">🎟️ Coupon Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create, manage, and track discount coupons with ease.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {showCreateForm ? "✖ Close Form" : "➕ Create Coupon"}
          </button>
        </div>

        {/* CREATE FORM */}
        {showCreateForm && (
          <form
            onSubmit={handleCreateCoupon}
            className="space-y-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all lg:p-8"
          >
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-gray-800">✨ New Coupon</h2>
              <p className="text-sm text-gray-500">Fill in the details below to create a promotional coupon.</p>
            </div>

            {/* SECTION 1: IDENTITY */}
            <div>
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">Identity</h3>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Coupon Code <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder="e.g., SUMMER30"
                      required
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      disabled={isGenerating}
                      className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
                    >
                      {isGenerating ? "⟳" : "🎲"} Generate
                    </button>
                    {formData.code && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(formData.code)}
                        className="rounded-lg bg-gray-100 px-3 py-2.5 text-gray-600 transition hover:bg-gray-200"
                        title="Copy code"
                      >
                        📋
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Coupon Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Summer Sale 30%"
                    required
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Optional description for internal reference"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-green-500 focus:ring focus:ring-green-200"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: DISCOUNT ENGINE */}
            <div className="rounded-xl bg-gray-50 p-5">
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">💰 Discount Engine</h3>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
                    <option value="FREE_SHIPPING">Free Shipping</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Scope</label>
                  <select
                    name="scope"
                    value={formData.scope}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                  >
                    <option value="ORDER_TOTAL">Order Total</option>
                    <option value="SHIPPING_ONLY">Shipping Only</option>
                    <option value="PRODUCT_ONLY">Product Only</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
                  <input
                    name="priority"
                    type="number"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                  />
                </div>
                {formData.type === "PERCENTAGE" && (
                  <>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Percent Off (%)</label>
                      <input
                        name="percentOff"
                        type="number"
                        step="any"
                        value={formData.percentOff}
                        onChange={handleInputChange}
                        required
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Max Discount Amount</label>
                      <input
                        name="maxDiscountAmount"
                        type="number"
                        step="any"
                        value={formData.maxDiscountAmount}
                        onChange={handleInputChange}
                        placeholder="Optional cap"
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                      />
                    </div>
                  </>
                )}
                {formData.type === "FIXED_AMOUNT" && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Amount Off ($)</label>
                    <input
                      name="amountOff"
                      type="number"
                      step="any"
                      value={formData.amountOff}
                      onChange={handleInputChange}
                      required
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                    />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="freeShipping"
                      checked={formData.freeShipping}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    Free Shipping
                  </label>
                </div>
              </div>
            </div>

            {/* SECTION 3: QUALIFICATION RULES */}
            <div>
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">🎯 Qualification Rules</h3>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Minimum Order Amount</label>
                  <input
                    name="minimumOrderAmount"
                    type="number"
                    step="any"
                    value={formData.minimumOrderAmount}
                    onChange={handleInputChange}
                    placeholder="Leave empty for no minimum"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Minimum Item Quantity</label>
                  <input
                    name="minimumItemQuantity"
                    type="number"
                    value={formData.minimumItemQuantity}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="firstOrderOnly"
                      checked={formData.firstOrderOnly}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    First Order Only
                  </label>
                </div>
                <div className="lg:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Applies To</label>
                  <select
                    name="appliesTo"
                    value={formData.appliesTo}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                  >
                    <option value="ALL_PRODUCTS">All Products</option>
                    <option value="SPECIFIC_PRODUCTS">Specific Products</option>
                    <option value="SPECIFIC_CATEGORIES">Specific Categories</option>
                    <option value="SPECIFIC_CUSTOMERS">Specific Customers</option>
                  </select>
                </div>
              </div>
              {formData.appliesTo === "SPECIFIC_PRODUCTS" && (
                <div className="mt-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Product IDs (comma‑separated)</label>
                  <input
                    name="productIdsText"
                    value={formData.productIdsText}
                    onChange={handleInputChange}
                    placeholder="prod_123, prod_456"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                  />
                </div>
              )}
              {formData.appliesTo === "SPECIFIC_CATEGORIES" && (
                <div className="mt-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Category IDs (comma‑separated)</label>
                  <input
                    name="categoryIdsText"
                    value={formData.categoryIdsText}
                    onChange={handleInputChange}
                    placeholder="cat_123, cat_456"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                  />
                </div>
              )}
              {formData.appliesTo === "SPECIFIC_CUSTOMERS" && (
                <div className="mt-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Customer IDs (comma‑separated)</label>
                  <input
                    name="customerIdsText"
                    value={formData.customerIdsText}
                    onChange={handleInputChange}
                    placeholder="user_123, user_456"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                  />
                </div>
              )}
            </div>

            {/* SECTION 4: LIFECYCLE */}
            <div className="rounded-xl bg-gray-50 p-5">
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">⏱️ Lifecycle</h3>
              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PAUSED">Paused</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="datetime-local"
                    name="startsAt"
                    value={formData.startsAt}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Expiration Date</label>
                  <input
                    type="datetime-local"
                    name="expiresAt"
                    value={formData.expiresAt}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: ABUSE PREVENTION */}
            <div>
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">🛡️ Abuse Prevention</h3>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Global Usage Limit</label>
                  <input
                    name="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    placeholder="Unlimited if empty"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Per User Limit</label>
                  <input
                    name="perUserLimit"
                    type="number"
                    value={formData.perUserLimit}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="isStackable"
                      checked={formData.isStackable}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    Stackable
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="excludeSaleItems"
                      checked={formData.excludeSaleItems}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    Exclude Sale Items
                  </label>
                </div>
              </div>
            </div>

            {/* SECTION 6: METADATA */}
            <div>
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">📦 Metadata (JSON)</h3>
              <textarea
                name="metadataJson"
                value={formData.metadataJson}
                onChange={handleInputChange}
                rows={3}
                placeholder='{"campaign": "summer2025"}'
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-sm shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
              />
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {creating ? "⏳ Saving..." : "✅ Save Coupon"}
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

        {/* ACTION BAR & FILTERS */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select
                value={status || ""}
                onChange={(e) =>
                  setStatus(e.target.value ? (e.target.value as CouponStatus) : undefined)
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 pr-8 text-sm shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="EXPIRED">Expired</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-gray-50"
            >
              🔄 Refresh
            </button>
            <button
              type="button"
              onClick={handleExpireCoupons}
              disabled={expiring}
              className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-800 transition hover:bg-yellow-100 disabled:opacity-50"
            >
              ⏰ Expire Now
            </button>
            <button
              type="button"
              onClick={handleReleaseReservations}
              disabled={releasing}
              className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800 transition hover:bg-blue-100 disabled:opacity-50"
            >
              🔓 Release Reservations
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {isFetching && "🔄 Updating..."}
          </div>
        </div>

        {/* COUPONS TABLE */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Expires</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-green-600"></div>
                        <span className="ml-2">Loading coupons...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!isLoading && data?.coupons?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                      ✨ No coupons found. Create your first coupon above.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  data?.coupons?.map((coupon) => (
                    <tr key={coupon.id} className="transition hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-sm font-medium text-gray-900">{coupon.code}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{coupon.name}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{coupon.type}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeColor(coupon.status)}`}>
                          {coupon.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{coupon.priority}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <button
                          type="button"
                          onClick={() => handleDelete(coupon.id)}
                          disabled={deleting}
                          className="rounded-md px-3 py-1 text-red-600 transition hover:bg-red-50 hover:text-red-800 disabled:opacity-50"
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
              disabled={!data?.total || page >= Math.ceil(data.total / (data.limit || 20))}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{data?.page ?? page}</span> of{" "}
                <span className="font-medium">{data?.total ? Math.ceil(data.total / (data.limit || 20)) : 1}</span>
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
                  disabled={!data?.total || page >= Math.ceil(data.total / (data.limit || 20))}
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

export default AdminCoupons;