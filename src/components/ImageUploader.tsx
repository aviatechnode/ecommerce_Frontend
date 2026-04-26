import { useRef } from "react";

type Props = {
  previewUrls: string[];
  onFiles: (files: FileList | File[]) => void;
  onRemove: (index: number) => void;
};

const ImageUploader = ({ previewUrls, onFiles, onRemove }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full">
      {/* Upload Box */}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed p-6 rounded-xl cursor-pointer text-center hover:bg-gray-50"
      >
        <p className="text-gray-500">Click or drag images here</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        accept="image/*"
        onChange={(e) => e.target.files && onFiles(e.target.files)}
      />

      {/* Preview */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {previewUrls.map((url, index) => (
          <div key={index} className="relative">
            <img
              src={url}
              className="w-full h-24 object-cover rounded-lg"
            />

            <button
              onClick={() => onRemove(index)}
              className="absolute top-1 right-1 bg-black text-white text-xs px-2 py-1 rounded"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;