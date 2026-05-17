import { useState } from "react";
import type { ChangeEvent } from "react";
import { X, Upload, Image, Video, AlertCircle } from "lucide-react";
import {
  useFormContext,
  useFieldArray,
} from "react-hook-form";

import type { ProductFormValues } from "../../types/product.form.types";
import type { ProductMedia } from "../store/productBuilderStore";

/* =========================================================
   CONSTANTS
========================================================= */
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

/* =========================================================
   COMPONENT
========================================================= */
function StepMedia({
  nextStep,
  prevStep,
}: {
  nextStep: () => void;
  prevStep: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { control } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "medias",
  });

  /* ---------------------------------------------------------
     Upload handler
  --------------------------------------------------------- */
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    setUploadError(null);

    try {
      const fileArray = Array.from(files);
      const uploadPromises = fileArray.map(async (file, idx) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(CLOUDINARY_API_URL, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        if (!data?.secure_url) {
          throw new Error("Invalid response from Cloudinary");
        }

        const media: ProductMedia = {
          url: data.secure_url,
          type: file.type.startsWith("video") ? "VIDEO" : "IMAGE",
          position: fields.length + idx,
        };
        return media;
      });

      const uploadedMedia = await Promise.all(uploadPromises);
      uploadedMedia.forEach((media) => append(media));
      e.target.value = ""; // reset input
    } catch (err) {
      console.error("Upload failed", err);
      setUploadError(err instanceof Error ? err.message : "Failed to upload one or more files");
    } finally {
      setUploading(false);
    }
  };

  /* ---------------------------------------------------------
     Remove media
  --------------------------------------------------------- */
  const removeMedia = (index: number) => {
    remove(index);
  };

  /* ---------------------------------------------------------
     Render
  --------------------------------------------------------- */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">Product Media</h2>
        <p className="text-sm text-gray-500">
          Upload product images or videos. First image becomes primary.
        </p>
      </div>

      {/* UPLOAD AREA */}
      <label className="group block cursor-pointer rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition hover:border-green-500 hover:bg-green-50/20">
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
        {uploading ? (
          <div className="space-y-2">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
            <p className="text-sm text-gray-600">Uploading to Cloudinary...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="mx-auto h-8 w-8 text-gray-400 group-hover:text-green-600" />
            <p className="font-medium text-gray-700">Click or drag files to upload</p>
            <p className="text-xs text-gray-500">JPG, PNG, MP4 (max 10MB each)</p>
          </div>
        )}
      </label>

      {/* ERROR DISPLAY */}
      {uploadError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* EMPTY STATE */}
      {fields.length === 0 && !uploading && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
          <Image className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          No media uploaded yet
        </div>
      )}

      {/* MEDIA GRID */}
      {fields.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {fields.map((media, index) => (
            <div
              key={media.id}
              className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeMedia(index)}
                className="absolute right-2 top-2 z-10 rounded-full bg-red-600 p-1 text-white opacity-0 transition-opacity hover:bg-red-700 focus:opacity-100 group-hover:opacity-100"
                aria-label="Remove media"
              >
                <X size={14} />
              </button>

              {/* Media preview */}
              <div className="aspect-square w-full overflow-hidden bg-gray-100">
                {media.type === "IMAGE" ? (
                  <img
                    src={media.url}
                    alt={`Product media ${index + 1}`}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <video
                    src={media.url}
                    className="h-full w-full object-cover"
                    controls
                  />
                )}
              </div>

              {/* Type badge */}
              <div className="flex items-center justify-between border-t border-gray-100 px-2 py-1.5 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  {media.type === "IMAGE" ? (
                    <Image size={12} />
                  ) : (
                    <Video size={12} />
                  )}
                  <span>{media.type}</span>
                </div>
                {index === 0 && (
                  <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                    Primary
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NAVIGATION BUTTONS */}
      <div className="flex justify-between border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={prevStep}
          className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          disabled={uploading || fields.length === 0}
          className="rounded-lg bg-linear-to-r from-green-600 to-green-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:hover:scale-100"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default StepMedia;