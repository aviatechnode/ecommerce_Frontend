import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import {
  Star,
  Send,
  Smile,
  MapPin,
} from "lucide-react";
import {
  Phone,
  Mail,
  Wrench,
  Truck,
  ShieldCheck,
} from "lucide-react";


import { useCreateFeedbackMutation } from "../../services/feedbackApi";

/* =========================================================
   TYPES & CONSTANTS
========================================================= */
type RatingKeys = "quality" | "price" | "effectiveness" | "durability";

interface Ratings {
  quality: number;
  price: number;
  effectiveness: number;
  durability: number;
}

interface FeedbackFormState {
  name: string;
  email: string;
  phoneNumber: string;
  productName: string;
  productNumber: string;
  buyAgain: string;
  concern: string;
  buyingExperience: number;
  usageDuration: string;
  ratings: Ratings;
}

const initialRatings: Ratings = {
  quality: 0,
  price: 0,
  effectiveness: 0,
  durability: 0,
};

const initialFormState: FeedbackFormState = {
  name: "",
  email: "",
  phoneNumber: "",
  productName: "",
  productNumber: "",
  buyAgain: "",
  concern: "",
  buyingExperience: 0,
  usageDuration: "",
  ratings: initialRatings,
};

const ratingCriteria: { key: RatingKeys; label: string }[] = [
  { key: "quality", label: "Quality" },
  { key: "price", label: "Price" },
  { key: "effectiveness", label: "Effectiveness" },
  { key: "durability", label: "Durability" },
];

const usageDurationOptions = [
  "More than 6 months",
  "1 to 6 months",
  "Less than 1 month",
  "First time using it",
  "Never used",
];

/* =========================================================
   LOADING SPINNER (reusable)
========================================================= */
const LoadingSpinner: React.FC<{ size?: "sm" | "md" }> = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
  };
  return (
    <div
      className={`${sizeClasses[size]} border-2 border-white border-t-transparent rounded-full animate-spin`}
    />
  );
};

/* =========================================================
   COMPONENT
========================================================= */
export default function Feedback() {
  const [createFeedback, { isLoading }] = useCreateFeedbackMutation();

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [form, setForm] = useState<FeedbackFormState>(initialFormState);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (criteria: RatingKeys, score: number) => {
    setForm((prev) => ({
      ...prev,
      ratings: { ...prev.ratings, [criteria]: score },
    }));
  };

  const handleBuyingExperienceChange = (score: number) => {
    setForm((prev) => ({ ...prev, buyingExperience: score }));
  };

  const validateForm = (): boolean => {
    const requiredFields = [
      { field: form.email, name: "Email" },
      { field: form.phoneNumber, name: "Phone Number" },
      { field: form.productName, name: "Product Name" },
      { field: form.productNumber, name: "Product Number" },
      { field: form.usageDuration, name: "Usage Duration" },
      { field: form.buyAgain, name: "Purchase again" },
    ];

    for (const { field, name } of requiredFields) {
      if (!field) {
        showToast("error", `${name} is required`);
        return false;
      }
    }

    if (form.buyingExperience === 0) {
      showToast("error", "Please rate your buying experience");
      return false;
    }

    const missingRatings = ratingCriteria.filter((c) => form.ratings[c.key] === 0);
    if (missingRatings.length) {
      showToast(
        "error",
        `Please rate: ${missingRatings.map((c) => c.label).join(", ")}`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    const feedbackPayload = {
      userName: form.name || null,
      email: form.email,
      phoneNumber: form.phoneNumber || null,
      productName: form.productName,
      productNumber: form.productNumber || null,
      usageDuration: form.usageDuration || null,
      buyAgain: form.buyAgain || null,
      buyingExperience: form.buyingExperience,
      concern: form.concern || null,
      ratings: Object.keys(form.ratings).map((key) => ({
        criteria: key,
        score: form.ratings[key as RatingKeys],
      })),
    };

    try {
      await createFeedback(feedbackPayload).unwrap();
      showToast("success", "Feedback submitted successfully!");
      setForm(initialFormState);
    } catch (error) {
      console.error("Submit error:", error);
      showToast("error", "Failed to submit feedback. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
          <div
            className={`rounded-xl px-5 py-3 shadow-lg text-white ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
      
<div className="mb-10 rounded-3xl bg-white p-8">
  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
    {/* Left Content */}
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight text-green-700 sm:text-4xl">
        Contact MOgrace Autoparts
      </h1>

      <p className="mt-3 text-base leading-7 text-gray-600">
        Have questions about parts availability, pricing, or finding the right
        fit for your vehicle? Our team is ready to help with fast support and
        reliable service. Reach out through the form below or contact us
        directly.
      </p>
    </div>

    {/* Contact Quick Actions */}
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
        <Phone className="h-5 w-5 text-gray-700" />
        <span className="text-sm font-medium text-gray-700">
          Quick Support
        </span>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
        <Truck className="h-5 w-5 text-gray-700" />
        <span className="text-sm font-medium text-gray-700">
          Delivery Help
        </span>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
        <Wrench className="h-5 w-5 text-gray-700" />
        <span className="text-sm font-medium text-gray-700">
          Auto Parts Advice
        </span>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
        <ShieldCheck className="h-5 w-5 text-gray-700" />
        <span className="text-sm font-medium text-gray-700">
          Trusted Quality
        </span>
      </div>
    </div>
  </div>
</div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CONTACT CARDS */}
          <div className="space-y-6">
            {[
              { icon: Mail, title: "Email Us", detail: "support@mograceauto.com" },
              { icon: Phone, title: "Call Us", detail: "+234 08034196752" },
              { icon: MapPin, title: "Our Location", detail: "463 Oron Road, Uyo." },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-sm p-6 transition hover:shadow-md"
              >
                <div className="flex flex-col items-center text-center">
                  <item.icon size={40} className="text-green-600 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* FEEDBACK FORM */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <Smile className="text-green-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">Product Feedback Form</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* PERSONAL & PRODUCT INFO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Name (Optional)"
                    value={form.name}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email *"
                    value={form.email}
                    onChange={handleInputChange}
                    required
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone Number *"
                    value={form.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    name="productName"
                    placeholder="Product Name *"
                    value={form.productName}
                    onChange={handleInputChange}
                    required
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    name="productNumber"
                    placeholder="Product / Part Number *"
                    value={form.productNumber}
                    onChange={handleInputChange}
                    required
                    className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* USAGE DURATION */}
                <fieldset>
                  <legend className="text-sm font-medium text-gray-900 mb-2">
                    How long have you used our product? *
                  </legend>
                  <div className="flex flex-wrap gap-5">
                    {usageDurationOptions.map((option) => (
                      <label key={option} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="radio"
                          name="usageDuration"
                          value={option}
                          checked={form.usageDuration === option}
                          onChange={(e) => handleRadioChange("usageDuration", e.target.value)}
                          className="h-4 w-4 accent-green-600 focus:ring-green-500 border-gray-300"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* BUYING EXPERIENCE */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    How would you rate the buying experience? *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => handleBuyingExperienceChange(num)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-7 w-7 transition-colors ${
                            num <= form.buyingExperience
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* RATINGS TABLE */}
                <div className="overflow-x-auto">
                  <table className="min-w-100 w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-3 text-left text-sm font-semibold text-gray-900">Criteria</th>
                        <th className="p-3 text-center text-sm font-medium text-gray-700">Not Satisfied</th>
                        <th className="p-3 text-center text-sm font-medium text-gray-700">Somewhat</th>
                        <th className="p-3 text-center text-sm font-medium text-gray-700">Satisfied</th>
                        <th className="p-3 text-center text-sm font-medium text-gray-700">Very Satisfied</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ratingCriteria.map(({ key, label }) => (
                        <tr key={key} className="border-b border-gray-200">
                          <td className="p-3 font-medium text-gray-900">{label}</td>
                          {[1, 2, 3, 4].map((score) => (
                            <td key={score} className="p-3 text-center">
                              <input
                                type="radio"
                                name={`rating-${key}`}
                                value={score}
                                checked={form.ratings[key] === score}
                                onChange={() => handleRatingChange(key, score)}
                                className="h-4 w-4 accent-green-600 focus:ring-green-500 border-gray-300"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PURCHASE AGAIN */}
                <fieldset>
                  <legend className="text-sm font-medium text-gray-900 mb-2">
                    Will you purchase our products again? *
                  </legend>
                  <div className="flex gap-6">
                    {["Yes", "No"].map((option) => (
                      <label key={option} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="radio"
                          name="buyAgain"
                          value={option}
                          checked={form.buyAgain === option}
                          onChange={(e) => handleRadioChange("buyAgain", e.target.value)}
                          className="h-4 w-4 accent-green-600 focus:ring-green-500 border-gray-300"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* CONCERN (OPTIONAL) */}
                <textarea
                  name="concern"
                  placeholder="Your concerns about the product (optional)"
                  value={form.concern}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Send size={18} />
                  )}
                  {isLoading ? "Submitting..." : "Submit Feedback"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}