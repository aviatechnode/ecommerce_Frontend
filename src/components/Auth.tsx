import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import AuthSuccess from "../components/AuthSuccess"; // ✅ NEW
import { useAuthStore } from "../store/AuthStore";

type Mode = "form" | "verify" | "loginSuccess";

export default function Auth() {
  const { signin, signup } = useAuthStore();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [mode, setMode] = useState<Mode>("form");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: {
    name?: string;
    email: string;
    password: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await signup(data.name as string, data.email, data.password);

        // ✅ Switch to verification screen
        setMode("verify");

      } else {
        await signin(data.email, data.password);

        // ✅ Show success screen
        setMode("loginSuccess");

        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:8080/api/auth/google";
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-100 text-black">
      
      {/* ✅ FORM */}
      {mode === "form" && (
        <AuthForm
          isSignUp={isSignUp}
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onGoogleSignIn={handleGoogleSignIn}
          onToggleMode={() => setIsSignUp((prev) => !prev)}
          onForgotPassword={() => navigate("/reset-request")}
        />
      )}

      {/* ✅ EMAIL VERIFICATION SCREEN */}
      {mode === "verify" && (
        <AuthSuccess
          title="Verify Your Email"
          message="Your account has been created successfully. A verification link has been sent to your email. Please check your inbox and verify your account before logging in."
          actionText="Back to Sign In"
          onAction={() => {
            setIsSignUp(false);
            setMode("form");
          }}
        />
      )}

      {/* ✅ LOGIN SUCCESS SCREEN */}
      {mode === "loginSuccess" && (
        <AuthSuccess
          title="Welcome Back!"
          message="Login successful. Redirecting to dashboard..."
        />
      )}
    </div>
  );
}