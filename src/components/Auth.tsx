import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import AuthSuccess from "../components/AuthSuccess";
import { useAuthStore } from "../store/AuthStore";

type Mode = "form" | "verify" | "loginSuccess";

export default function Auth() {
  const { signin, signup, user } = useAuthStore();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [mode, setMode] = useState<Mode>("form");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && mode === "form") {
      navigate("/", { replace: true });
    }
  }, [user, navigate, mode]);

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
        setMode("verify");
      } else {
        await signin(data.email, data.password);

        setMode("loginSuccess");

        const currentUser = useAuthStore.getState().user;

        setTimeout(() => {
          if (
            currentUser?.roleName === "ADMIN" ||
            currentUser?.roleName === "SUPER_ADMIN"
          ) {
            navigate("/admin", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        }, 1200);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `http://localhost:8080/api/auth/google`;
  };

  return (
    <div className="flex items-start justify-center min-h-screen px-4 pt-8 bg-gray-50 text-black">
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

      {mode === "verify" && (
        <AuthSuccess
          title="Verify Your Email"
          message="Check your inbox to verify your account."
          actionText="Back to Sign In"
          onAction={() => {
            setIsSignUp(false);
            setMode("form");
          }}
        />
      )}

      {mode === "loginSuccess" && (
        <AuthSuccess
          title="Welcome Back"
          message="Redirecting..."
        />
      )}
    </div>
  );
}