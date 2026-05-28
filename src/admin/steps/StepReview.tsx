import { memo, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Package,
  Image,
  Hash,
  FileText,
  ArrowLeft,
  Send,
  TrendingUp,
  Clock,
  Tag,
  Building2,
  Loader2,
  Save,
  Copy,           // <-- added for copy button
} from "lucide-react";
import type { CreateProductFormValues } from "./util/formProvider";
import type { StepProps } from "./util/stepProps";

interface StepReviewProps extends StepProps {
  onSave: (productId?: string) => Promise<any>;
  productId?: string;
}

function StepReviewComponent({ prevStep, onSave, productId }: StepReviewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false); // <-- added for copy feedback

  const { watch } = useFormContext<CreateProductFormValues>();
  const formValues = watch();

  const isEditing = !!productId;

  const isValid = useMemo(() => {
    return !!formValues.name && !!formValues.brandId && !!formValues.categoryId;
  }, [formValues.name, formValues.brandId, formValues.categoryId]);

  const stats = useMemo(
    () => [
      { label: "Variants", value: formValues.variants?.length || 0, icon: Package, gradient: "from-blue-500 to-blue-600" },
      { label: "Images", value: formValues.medias?.length || 0, icon: Image, gradient: "from-purple-500 to-purple-600" },
      { label: "OEM Numbers", value: formValues.oemNumbers?.length || 0, icon: Hash, gradient: "from-orange-500 to-orange-600" },
      { label: "Specifications", value: formValues.specifications?.length || 0, icon: FileText, gradient: "from-green-500 to-green-600" },
    ],
    [formValues]
  );

  const productInfo = useMemo(() => {
    const totalInventory = (formValues.variants || []).reduce<number>((sum, variant) => {
      const variantStock = (variant.inventories || []).reduce<number>((invSum, inv) => {
        const stock = typeof inv.stock === 'number' ? inv.stock : Number(inv.stock) || 0;
        return invSum + stock;
      }, 0);
      return sum + variantStock;
    }, 0);

    const totalValue = (formValues.variants || []).reduce<number>((sum, variant) => {
      const stock = (variant.inventories || []).reduce<number>((invSum, inv) => {
        const s = typeof inv.stock === 'number' ? inv.stock : Number(inv.stock) || 0;
        return invSum + s;
      }, 0);
      const price = typeof variant.price === 'number' ? variant.price : Number(variant.price) || 0;
      return sum + (price * stock);
    }, 0);

    const hasAttributes = (formValues.variants || []).some((v) => (v.attributes?.length ?? 0) > 0);

    return { totalInventory, totalValue, hasAttributes };
  }, [formValues.variants]);

  // --- copy JSON handler ---
  const copyJsonToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(formValues, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy JSON:", err);
      // optional: show an error toast if needed
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!isValid) {
      setError("Missing required fields (name, brand, category)");
      return;
    }

    try {
      setLoading(true);
      await onSave(isEditing ? productId : undefined);
      setSuccess(`✨ Product "${formValues.name}" ${isEditing ? "updated" : "created"} successfully!`);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error("Submit Error:", err);
      setError(err?.data?.message || err?.message || `Failed to ${isEditing ? "update" : "create"} product`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER (unchanged) */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {isEditing ? "✏️ Review & Update Product" : "📋 Review & Create Product"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEditing ? "Confirm your changes before updating" : "Confirm all details before creating your product"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm ${
                isValid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              <div className={`h-2 w-2 rounded-full ${isValid ? "bg-green-500" : "bg-amber-500"}`} />
              {isValid ? (isEditing ? "Ready to update" : "Ready to create") : "Incomplete"}
            </div>
          </div>
        </div>

        {/* SUCCESS / ERROR / WARNING alerts (unchanged) */}
        {success && (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
            <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">{success}</p>
              <p className="mt-1 text-xs text-green-700">
                {isEditing
                  ? "Your product has been updated."
                  : "The product has been successfully added to your catalog."}
              </p>
            </div>
            <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">
              ✕
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error {isEditing ? "updating" : "creating"} product</p>
              <p className="mt-1 text-xs text-red-700">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              ✕
            </button>
          </div>
        )}

        {!isValid && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Incomplete Information</p>
              <p className="mt-1 text-xs text-amber-700">
                Please complete all required fields (Product Name, Brand, and Category) before{" "}
                {isEditing ? "updating" : "creating"}.
              </p>
            </div>
          </div>
        )}

        {/* MAIN 2-COLUMN GRID */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT COLUMN */}
          <div className="space-y-6 lg:col-span-2">
            {/* PRODUCT SUMMARY CARD (unchanged) */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 bg-linear-to-r from-gray-50 to-white px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">📊 Product Summary</h2>
                <p className="text-sm text-gray-500">Overview of your product configuration</p>
              </div>
              <div className="space-y-6 p-6">
                {/* Basic Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium uppercase tracking-wide text-gray-500">Basic Information</h3>
                  <div className="grid gap-3 rounded-lg bg-gray-50 p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <span className="text-sm font-medium text-gray-600">Product Name:</span>
                      <span className="text-sm font-medium break-all text-gray-900 sm:text-right">
                        {formValues.name || "—"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm font-medium text-gray-600">Description:</span>
                      <span className="text-sm break-all text-gray-600 sm:text-right">
                        {formValues.description
                          ? `${formValues.description.substring(0, 100)}${formValues.description.length > 100 ? "..." : ""}`
                          : "—"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm font-medium text-gray-600">Search Keywords:</span>
                      <span className="text-sm break-all text-gray-600 sm:text-right">
                        {formValues.searchKeywords || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Brand & Category (unchanged) */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium uppercase tracking-wide text-gray-500">Classification</h3>
                  <div className="grid gap-3 rounded-lg bg-gray-50 p-4 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Brand:</span>
                      <span className="text-sm font-medium text-gray-900">{formValues.brandId || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="text-sm font-medium text-gray-900">{formValues.categoryId || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Status Toggles (unchanged) */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium uppercase tracking-wide text-gray-500">Status Settings</h3>
                  <div className="flex flex-wrap gap-4 rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${formValues.isActive ? "bg-green-500" : "bg-gray-400"}`}
                      />
                      <span className="text-sm text-gray-700">{formValues.isActive ? "Active" : "Inactive"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${formValues.isFeatured ? "bg-yellow-500" : "bg-gray-400"}`}
                      />
                      <span className="text-sm text-gray-700">{formValues.isFeatured ? "Featured" : "Not Featured"}</span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid (unchanged) */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium uppercase tracking-wide text-gray-500">Content Statistics</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {stats.map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div
                          key={stat.label}
                          className={`flex items-center gap-3 rounded-xl bg-linear-to-r ${stat.gradient} p-4 shadow-sm`}
                        >
                          <div className="rounded-full bg-white/20 p-2">
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                            <p className="text-xs text-white/80">{stat.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* JSON Toggle with COPY BUTTON */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <button
                onClick={() => setShowJson((prev) => !prev)}
                className="flex w-full items-center justify-between bg-linear-to-r from-gray-50 to-white px-6 py-4 transition hover:bg-gray-50"
              >
                <span className="text-sm font-medium text-gray-700">🔧 Advanced: View Raw JSON</span>
                {showJson ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
              </button>
              {showJson && (
                <div className="border-t border-gray-200 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Raw Product Data</span>
                    <button
                      onClick={copyJsonToClipboard}
                      className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
                    >
                      <Copy className="h-3 w-3" />
                      {copied ? "Copied!" : "Copy JSON"}
                    </button>
                  </div>
                  <pre className="max-h-96 overflow-auto rounded-lg bg-gray-900 p-4 font-mono text-xs text-green-400">
                    {JSON.stringify(formValues, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Sidebar (unchanged) */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="font-semibold text-gray-900">📦 Inventory Summary</h3>
              </div>
              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Total Stock</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{productInfo.totalInventory.toLocaleString()} units</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Total Value</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">${productInfo.totalValue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Has Attributes</span>
                  </div>
                  <span className={`text-sm font-medium ${productInfo.hasAttributes ? "text-green-600" : "text-gray-400"}`}>
                    {productInfo.hasAttributes ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="font-semibold text-gray-900">✅ Requirements</h3>
              </div>
              <div className="space-y-3 p-6">
                <div className="flex items-center gap-2">
                  {formValues.name ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-gray-300" />
                  )}
                  <span className="text-sm text-gray-600">Product Name</span>
                </div>
                <div className="flex items-center gap-2">
                  {formValues.brandId ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-gray-300" />
                  )}
                  <span className="text-sm text-gray-600">Brand Selection</span>
                </div>
                <div className="flex items-center gap-2">
                  {formValues.categoryId ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-gray-300" />
                  )}
                  <span className="text-sm text-gray-600">Category Selection</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="font-semibold text-gray-900">📈 Quick Stats</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{formValues.variants?.length || 0}</p>
                  <p className="text-xs text-gray-500">Total Variants</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{formValues.specifications?.length || 0}</p>
                  <p className="text-xs text-gray-500">Specifications</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{formValues.oemNumbers?.length || 0}</p>
                  <p className="text-xs text-gray-500">OEM Numbers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{formValues.medias?.length || 0}</p>
                  <p className="text-xs text-gray-500">Media Files</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BAR (unchanged) */}
        <div className="flex flex-col-reverse gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={prevStep}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-2.5 font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Edit
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || !isValid}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-green-700 px-6 py-2.5 font-semibold text-white shadow-sm transition-all hover:scale-105 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />{" "}
                {isEditing ? "Updating Product..." : "Creating Product..."}
              </>
            ) : (
              <>
                {isEditing ? <Save className="h-4 w-4" /> : <Send className="h-4 w-4" />}{" "}
                {isEditing ? "Update Product" : "Create Product"}
              </>
            )}
          </button>
        </div>

        <div className="rounded-2xl bg-white p-4 text-center text-sm text-gray-500 shadow-sm">
          📊 Ready to publish? Review all details above before {isEditing ? "updating" : "creating"}.
        </div>
      </div>
    </div>
  );
}

const StepReview = memo(StepReviewComponent);
export default StepReview;