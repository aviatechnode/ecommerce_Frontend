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
  const oauthToken = searchParams.get("token");

  const { data: user, isLoading: meLoading } = useMeQuery();
  const [signin, { isLoading: signingIn, error: signinError }] = useSigninMutation();
  const [signup, { isLoading: signingUp, error: signupError }] = useSignupMutation();
  const [googleLogin] = useGoogleMutation();

  useEffect(() => {
    if (oauthSuccess && oauthToken) {
      googleLogin({ token: oauthToken });
    }
  }, [oauthSuccess, oauthToken, googleLogin]);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

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

  const loading = meLoading || signingIn || signingUp;
  const error =
    (signinError as any)?.data?.message ||
    (signupError as any)?.data?.message ||
    null;

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <AuthSuccess title="Already logged in" message="Redirecting..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="relative z-10 w-full flex justify-center">
        {!loading && (
          <AuthForm
            isSignUp={isSignUp}
            loading={loading}
            error={error}
            onSubmit={handleSubmit}
            onGoogleSignIn={() => navigate("/api/auth/google")}
            onToggleMode={() => setIsSignUp((p) => !p)}
            onForgotPassword={() => navigate("/reset-request")}
          />
        )}

        {(signingIn || signingUp) && (
          <AuthSuccess
            title={signingIn ? "Signing In" : "Creating Account"}
            message="Please wait..."
          />
        )}
      </div>
    </div>
  );
}