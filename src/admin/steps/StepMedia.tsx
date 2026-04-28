import { useState } from "react";
import { useProductBuilder, type Media } from "../store/productBuilderStore";
import { X } from "lucide-react";

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

export default function StepMedia() {
  const { medias, setMedias, nextStep, prevStep } = useProductBuilder();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    setUploading(true);

    const files = Array.from(e.target.files);
    const uploadedMedia: Media[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      try {
        const res = await fetch(CLOUDINARY_API_URL, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (data.secure_url) {
          uploadedMedia.push({
            url: data.secure_url,
            type: file.type.startsWith("video") ? "VIDEO" : "IMAGE",
            position: i,
          });
        }
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }

    setMedias([...medias, ...uploadedMedia]);
    setUploading(false);
  };

  const removeMedia = (index: number) => {
    const updated = medias.filter((_, i) => i !== index);
    setMedias(updated);
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Product Media
        </h2>
        <p className="text-sm text-gray-500">
          Upload product images or videos. First image will be primary.
        </p>
      </div>

      {/* UPLOAD BOX */}
      <label className="block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-green-500 transition bg-gray-50">

        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <p className="text-gray-600">Uploading files...</p>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-700 font-medium">
              Click to upload or drag & drop
            </p>
            <p className="text-xs text-gray-500">
              JPG, PNG, MP4 supported
            </p>
          </div>
        )}
      </label>

      {/* EMPTY STATE */}
      {medias.length === 0 && !uploading && (
        <div className="text-center text-gray-500 text-sm border rounded-lg p-4">
          No media uploaded yet
        </div>
      )}

      {/* PREVIEW GRID */}
      {medias.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

          {medias.map((media, i) => (
            <div
              key={i}
              className="relative border rounded-lg overflow-hidden bg-white shadow-sm"
            >

              {/* REMOVE BUTTON */}
                <button
                  onClick={() => removeMedia(i)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
                >
                  <X size={14} />
                </button>

              {/* IMAGE / VIDEO */}
              {media.type === "IMAGE" ? (
                <img
                  src={media.url}
                  className="h-40 w-full object-cover"
                />
              ) : (
                <video
                  src={media.url}
                  className="h-40 w-full object-cover"
                  controls
                />
              )}

              {/* LABEL */}
              <div className="p-2 text-xs text-gray-500">
                {media.type}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NAVIGATION */}
      <div className="flex justify-between pt-4 border-t">

        <button
          onClick={prevStep}
          className="px-5 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          Back
        </button>

        <button
          onClick={nextStep}
          disabled={uploading || medias.length === 0}
          className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}