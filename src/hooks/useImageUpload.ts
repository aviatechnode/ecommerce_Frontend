import { useState } from "react";

export const useImageUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFiles = (selected: FileList | File[]) => {
    const fileArray = Array.from(selected);

    setFiles((prev) => [...prev, ...fileArray]);

    const previews = fileArray.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...previews]);
  };

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const reset = () => {
    setFiles([]);
    setPreviewUrls([]);
  };

  return {
    files,
    previewUrls,
    handleFiles,
    removeImage,
    reset,
  };
};