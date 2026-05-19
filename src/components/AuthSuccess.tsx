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
    <div className="w-full max-w-xs mx-auto bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-5 text-center">
      <div className="flex justify-center mb-3">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle size={24} className="text-emerald-600" />
        </div>
      </div>
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <p className="text-gray-500 text-xs mt-1 mb-4">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-1.5 text-sm rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md hover:shadow-lg transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}