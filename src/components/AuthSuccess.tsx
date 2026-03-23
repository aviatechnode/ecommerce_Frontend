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
    <div className="bg-white shadow-lg rounded-lg p-8 w-[90%] max-w-md text-center">
      <div className="flex justify-center mb-4">
        <CheckCircle className="text-green-500" size={50} />
      </div>

      <h2 className="text-2xl font-bold mb-2">{title}</h2>

      <p className="text-gray-600 mb-6">{message}</p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}