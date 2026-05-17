import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import AuthSuccess from "../components/AuthSuccess";

import {
  useMeQuery,
  useSigninMutation,
  useSignupMutation,
  useGoogleMutation,
} from "../services/authApi";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const oauthSuccess = searchParams.get("oauth") === "success";
  const oauthToken = searchParams.get("token"); // if backend sends token

  /* ================= RTK QUERIES ================= */

  const { data: user, isLoading: meLoading } = useMeQuery();

  const [signin, { isLoading: signingIn, error: signinError }] =
    useSigninMutation();

  const [signup, { isLoading: signingUp, error: signupError }] =
    useSignupMutation();

  const [googleLogin] = useGoogleMutation();

  /* ================= OAUTH ================= */

  useEffect(() => {
    if (oauthSuccess && oauthToken) {
      googleLogin({ token: oauthToken });
    }
  }, [oauthSuccess, oauthToken, googleLogin]);

  /* ================= REDIRECT IF LOGGED IN ================= */

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  /* ================= SUBMIT ================= */

  const handleSubmit = async (data: {
    name?: string;
    email: string;
    password: string;
  }) => {
    try {
      if (isSignUp) {
        await signup({
          name: data.name!,
          email: data.email,
          password: data.password,
        }).unwrap();
      } else {
        await signin({
          email: data.email,
          password: data.password,
        }).unwrap();
      }
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  /* ================= UI STATE ================= */

  const loading = meLoading || signingIn || signingUp;
  const error =
    (signinError as any)?.data?.message ||
    (signupError as any)?.data?.message ||
    null;

  /* ================= UI ================= */

  if (user) {
    return (
      <AuthSuccess title="Success" message="You are already logged in" />
    );
  }

  return (
    <div className="flex items-start justify-center min-h-screen px-4 pt-8 bg-gray-50 text-black">

      {/* ================= FORM ================= */}
      {!loading && (
        <AuthForm
          isSignUp={isSignUp}
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onGoogleSignIn={() => navigate("/api/auth/google")} // optional redirect flow
          onToggleMode={() => setIsSignUp((p) => !p)}
          onForgotPassword={() => navigate("/reset-request")}
        />
      )}

      {/* ================= LOADING ================= */}
      {signingIn && (
        <AuthSuccess title="Signing In" message="Please wait..." />
      )}

      {signingUp && (
        <AuthSuccess title="Creating Account" message="Please wait..." />
      )}
    </div>
  );
}