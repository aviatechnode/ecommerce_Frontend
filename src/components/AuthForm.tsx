import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, User, Check } from "lucide-react";

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

type Strength = "weak" | "medium" | "strong" | "";

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
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState<Strength>("");

  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const isStrong =
    rules.length &&
    rules.uppercase &&
    rules.lowercase &&
    rules.number &&
    rules.special;

  const calculateStrength = (pwd: string): Strength => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return "weak";
    if (score <= 4) return "medium";
    return "strong";
  };

  useEffect(() => {
    if (password) setStrength(calculateStrength(password));
    else setStrength("");
  }, [password]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  if (isSignUp && !isStrong) return;

  const formData = new FormData(event.currentTarget);

  const name = formData.get("name");
  const email = formData.get("email");
  const pwd = formData.get("password");

  // 🔥 HARD VALIDATION (prevents null going to backend)
  if (!email || !pwd || typeof email !== "string" || typeof pwd !== "string") {
    return;
  }

  await onSubmit({
    ...(isSignUp && name && typeof name === "string" ? { name } : {}),
    email,
    password: pwd,
  });
};

  const strengthPercent =
    strength === "weak"
      ? "33%"
      : strength === "medium"
      ? "66%"
      : strength === "strong"
      ? "100%"
      : "0%";

  const strengthColor =
    strength === "weak"
      ? "bg-red-500"
      : strength === "medium"
      ? "bg-yellow-500"
      : strength === "strong"
      ? "bg-green-500"
      : "bg-gray-200";

  return (
    <div className="w-full max-w-sm bg-white shadow-sm rounded-lg p-5 border border-gray-200">

      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {isSignUp ? "Create Account" : "Sign In"}
        </h2>
        <p className="text-gray-500 text-xs mt-1">
          {isSignUp ? "Create your account" : "Enter your details"}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-2 rounded mb-3 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">

        {isSignUp && (
          <div className="relative">
            <User size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="name"
              placeholder="Full Name"
              required
              className="w-full pl-8 pr-2 py-2 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-green-500 outline-none"
            />
          </div>
        )}

        <div className="relative">
          <Mail size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full pl-8 pr-2 py-2 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-green-500 outline-none"
          />
        </div>

        <div className="relative">
          <Lock size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-8 pr-8 py-2 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-green-500 outline-none"
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>

        {/* Rules */}
        {isSignUp && (
          <div className="text-[11px] space-y-1 text-gray-500">
            {[
              { label: "At least 8 characters", valid: rules.length },
              { label: "Uppercase letter", valid: rules.uppercase },
              { label: "Lowercase letter", valid: rules.lowercase },
              { label: "Number", valid: rules.number },
              { label: "Special character", valid: rules.special },
            ].map((rule, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Check size={12} className={rule.valid ? "text-green-500" : "text-gray-300"} />
                <span className={rule.valid ? "text-green-600" : ""}>
                  {rule.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Strength */}
        {isSignUp && password && (
          <div className="space-y-1">
            <div className="w-full h-1.5 bg-gray-200 rounded overflow-hidden">
              <div
                className={`h-full transition-all ${strengthColor}`}
                style={{ width: strengthPercent }}
              />
            </div>
            <p className="text-[11px] text-gray-500">Strength: {strength}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (isSignUp && !isStrong)}
          className="w-full py-2 text-sm rounded bg-green-600 text-white font-medium hover:bg-green-700 disabled:bg-green-400"
        >
          {loading
            ? isSignUp
              ? "Creating..."
              : "Signing in..."
            : isSignUp
            ? "Sign Up"
            : "Sign In"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-2 my-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[10px] text-gray-400">OR</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Google */}
      <button
        onClick={onGoogleSignIn}
        className="w-full py-2 text-sm border rounded flex items-center justify-center gap-2 hover:bg-gray-50"
      >
        <svg className="w-4 h-4" viewBox="0 0 48 48">
          <path fill="#4285F4" d="M24 9.5c3.9 0 7.1 1.3 9.7 3.7l7.3-7.3C36.8 2 30.8 0 24 0 14.6 0 6.6 5.3 2.3 13.1l8.5 6.6c2-5.9 7.6-10.2 13.2-10.2z" />
          <path fill="#34A853" d="M46.1 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.5c-.7 3.8-2.8 6.9-5.8 9.1l8.5 6.6c5-4.7 7.9-11.6 7.9-19z" />
          <path fill="#FBBC05" d="M10.8 28.3c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8L2.3 13.1C.8 16.3 0 20 0 24s.8 7.7 2.3 10.9l8.5-6.6z" />
          <path fill="#EA4335" d="M24 48c6.5 0 12-2.1 16.1-5.7l-8.5-6.6c-2.3 1.6-5.2 2.5-7.7 2.5-5.7 0-11.2-4.3-13.2-10.2l-8.5 6.6C6.6 42.7 14.6 48 24 48z" />
        </svg>
        Continue with Google
      </button>

      <div className="mt-4 text-xs text-center space-y-1.5">
        <button onClick={onForgotPassword} className="text-green-600 hover:underline">
          Forgot password?
        </button>

        <p className="text-gray-500">
          {isSignUp ? "Already have an account?" : "No account?"}{" "}
          <button onClick={onToggleMode} className="text-green-600 hover:underline">
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}