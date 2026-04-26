import { CheckCircle } from "lucide-react";

interface AuthSuccessProps {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export default function AuthSuccess({
  title,
  message,
  actionText,
  onAction,
}: AuthSuccessProps) {
  return (
    <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg p-5 text-center">

      <div className="flex justify-center mb-3">
        <CheckCircle size={32} className="text-green-500" />
      </div>

      <h2 className="text-lg font-semibold mb-1">{title}</h2>

      <p className="text-gray-600 text-sm mb-4">{message}</p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}