import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";

export default function GoogleCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuthStore();

  useEffect(() => {
    const token = params.get("token");

    if (token) {
      loginWithGoogle(token)
        .then(() => navigate("/", { replace: true }))
        .catch(() => navigate("/auth", { replace: true }));
    } else {
      navigate("/auth", { replace: true });
    }
  }, [params, navigate, loginWithGoogle]);

  return <div className="text-center mt-20">Signing you in with Google...</div>;
}