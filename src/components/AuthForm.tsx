import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

interface AuthFormProps {
  isSignUp: boolean;
  loading: boolean;
  error: string | null;
  onSubmit: (data: {
    name?: string;
    email: string;
    password: string;
  }) => Promise<void>;
  onGoogleSignIn: () => void;
  onToggleMode: () => void;
  onForgotPassword: () => void;
}

export default function AuthForm({
  isSignUp,
  loading,
  error,
  onSubmit,
  onGoogleSignIn,
  onToggleMode,
  onForgotPassword,
}: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    onSubmit({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-[90%] max-w-87.5 backdrop-blur-lg bg-opacity-90">
      <h2 className="text-2xl font-bold text-center mb-4">
        {isSignUp ? "Sign Up" : "Sign In"}
      </h2>

      {error && (
        <p className="text-red-500 text-center font-semibold mb-2">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {isSignUp && (
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              name="name"
              placeholder="Full Name"
              required
              className="p-2 pl-10 border rounded bg-gray-100 text-black w-full focus:ring-2 focus:ring-green-400"
            />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="p-2 pl-10 border rounded bg-gray-100 text-black w-full focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            className="p-2 pl-10 pr-10 border rounded bg-gray-100 text-black w-full focus:ring-2 focus:ring-green-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`p-2 bg-green-500 text-white rounded w-full text-sm font-medium ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
          }`}
        >
          {loading
            ? isSignUp
              ? "Signing Up..."
              : "Signing In..."
            : isSignUp
            ? "Sign Up"
            : "Sign In"}
        </button>
      </form>

      {/* Google Button */}
      <div className="flex justify-center mt-3">
        <button
          onClick={onGoogleSignIn}
          className="p-2 bg-red-600 text-white rounded w-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-700"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M24 9.5c3.9 0 7.1 1.3 9.7 3.7l7.3-7.3C36.8 2 30.8 0 24 0 14.6 0 6.6 5.3 2.3 13.1l8.5 6.6c2-5.9 7.6-10.2 13.2-10.2z" />
            <path fill="#34A853" d="M46.1 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.5c-.7 3.8-2.8 6.9-5.8 9.1l8.5 6.6c5-4.7 7.9-11.6 7.9-19z" />
            <path fill="#FBBC05" d="M10.8 28.3c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8L2.3 13.1C.8 16.3 0 20 0 24s.8 7.7 2.3 10.9l8.5-6.6z" />
            <path fill="#EA4335" d="M24 48c6.5 0 12-2.1 16.1-5.7l-8.5-6.6c-2.3 1.6-5.2 2.5-7.7 2.5-5.7 0-11.2-4.3-13.2-10.2l-8.5 6.6C6.6 42.7 14.6 48 24 48z" />
          </svg>
          <span>Sign in with Google</span>
        </button>
      </div>

      <p className="mt-2 text-center">
        <button onClick={onForgotPassword} className="text-green-500 hover:underline">
          Forgot password?
        </button>
      </p>

      <p className="mt-2 text-center">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button onClick={onToggleMode} className="text-green-500 hover:underline">
          {isSignUp ? "Sign In" : "Sign Up"}
        </button>
      </p>
    </div>
  );
}