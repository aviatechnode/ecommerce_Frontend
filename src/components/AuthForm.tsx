import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, User, Check, ArrowRight, X } from "lucide-react";

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

type StrengthLabel = "Very Weak" | "Weak" | "Fair" | "Good" | "Strong";

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
  const [strengthScore, setStrengthScore] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState<StrengthLabel>("Very Weak");

  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const allRulesMet = rules.length && rules.uppercase && rules.lowercase && rules.number && rules.special;

  useEffect(() => {
    let score = 0;
    if (rules.length) score++;
    if (rules.uppercase) score++;
    if (rules.lowercase) score++;
    if (rules.number) score++;
    if (rules.special) score++;
    setStrengthScore(score);

    if (score <= 1) setStrengthLabel("Very Weak");
    else if (score === 2) setStrengthLabel("Weak");
    else if (score === 3) setStrengthLabel("Fair");
    else if (score === 4) setStrengthLabel("Good");
    else setStrengthLabel("Strong");
  }, [password]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSignUp && !allRulesMet) return;

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const pwd = formData.get("password");

    if (!email || !pwd || typeof email !== "string" || typeof pwd !== "string") return;

    await onSubmit({
      ...(isSignUp && name && typeof name === "string" ? { name } : {}),
      email,
      password: pwd,
    });
  };

  const strengthPercent = (strengthScore / 5) * 100;
  const strengthColor =
    strengthScore <= 1
      ? "bg-red-500"
      : strengthScore === 2
      ? "bg-orange-500"
      : strengthScore === 3
      ? "bg-yellow-500"
      : strengthScore === 4
      ? "bg-blue-500"
      : "bg-green-500";

  return (
    <div className="w-full max-w-xs mx-auto rounded-2xl shadow-2xl p-5 transition-all duration-300">
      {/* Header */}
      <div className="text-center mb-5">
        <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
          {isSignUp ? "Create account" : "Welcome back"}
        </h2>
        <p className="text-gray-500 text-xs mt-1">
          {isSignUp ? "Join us today" : "Sign in to continue"}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 text-xs p-2 rounded-xl mb-4 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {isSignUp && (
          <div className="relative group">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition" />
            <input
              name="name"
              placeholder="Full name"
              required
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
            />
          </div>
        )}

        <div className="relative group">
          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition" />
          <input
            name="email"
            type="email"
            placeholder="Email address"
            required
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
          />
        </div>

        <div className="relative group">
          <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition" />
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>

        {/* Advanced password validation (only for sign up) */}
        {isSignUp && password && (
          <div className="space-y-2 mt-1 text-xs">
            {/* Strength bar with label */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Password strength</span>
                <span className="font-medium" style={{ color: strengthScore <= 1 ? '#ef4444' : strengthScore === 2 ? '#f97316' : strengthScore === 3 ? '#eab308' : strengthScore === 4 ? '#3b82f6' : '#22c55e' }}>
                  {strengthLabel}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${strengthColor}`}
                  style={{ width: `${strengthPercent}%` }}
                />
              </div>
            </div>

            {/* Rule checklist */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1">
              <div className="flex items-center gap-1.5">
                {rules.length ? <Check size={10} className="text-green-500" /> : <X size={10} className="text-gray-300" />}
                <span className={rules.length ? "text-green-600" : "text-gray-500"}>≥8 characters</span>
              </div>
              <div className="flex items-center gap-1.5">
                {rules.uppercase ? <Check size={10} className="text-green-500" /> : <X size={10} className="text-gray-300" />}
                <span className={rules.uppercase ? "text-green-600" : "text-gray-500"}>Uppercase</span>
              </div>
              <div className="flex items-center gap-1.5">
                {rules.lowercase ? <Check size={10} className="text-green-500" /> : <X size={10} className="text-gray-300" />}
                <span className={rules.lowercase ? "text-green-600" : "text-gray-500"}>Lowercase</span>
              </div>
              <div className="flex items-center gap-1.5">
                {rules.number ? <Check size={10} className="text-green-500" /> : <X size={10} className="text-gray-300" />}
                <span className={rules.number ? "text-green-600" : "text-gray-500"}>Number</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                {rules.special ? <Check size={10} className="text-green-500" /> : <X size={10} className="text-gray-300" />}
                <span className={rules.special ? "text-green-600" : "text-gray-500"}>Special character (!@#$% etc.)</span>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (isSignUp && !allRulesMet)}
          className="w-full mt-2 py-2 text-sm rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isSignUp ? (
            <>Sign Up <ArrowRight size={14} /></>
          ) : (
            <>Sign In <ArrowRight size={14} /></>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-2 my-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[10px] text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Google button */}
      <button
        onClick={onGoogleSignIn}
        className="w-full py-2 text-sm rounded-xl border border-gray-200 bg-white/50 flex items-center justify-center gap-2 hover:bg-gray-50 transition"
      >
        <svg className="w-4 h-4" viewBox="0 0 48 48">
          <path fill="#4285F4" d="M24 9.5c3.9 0 7.1 1.3 9.7 3.7l7.3-7.3C36.8 2 30.8 0 24 0 14.6 0 6.6 5.3 2.3 13.1l8.5 6.6c2-5.9 7.6-10.2 13.2-10.2z" />
          <path fill="#34A853" d="M46.1 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.5c-.7 3.8-2.8 6.9-5.8 9.1l8.5 6.6c5-4.7 7.9-11.6 7.9-19z" />
          <path fill="#FBBC05" d="M10.8 28.3c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8L2.3 13.1C.8 16.3 0 20 0 24s.8 7.7 2.3 10.9l8.5-6.6z" />
          <path fill="#EA4335" d="M24 48c6.5 0 12-2.1 16.1-5.7l-8.5-6.6c-2.3 1.6-5.2 2.5-7.7 2.5-5.7 0-11.2-4.3-13.2-10.2l-8.5 6.6C6.6 42.7 14.6 48 24 48z" />
        </svg>
        Continue with Google
      </button>

      <div className="mt-4 text-[11px] text-center space-y-1">
        <button onClick={onForgotPassword} className="text-emerald-600 hover:underline">
          Forgot password?
        </button>
        <p className="text-gray-500">
          {isSignUp ? "Already have an account?" : "No account?"}{" "}
          <button onClick={onToggleMode} className="text-emerald-600 font-medium hover:underline">
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}