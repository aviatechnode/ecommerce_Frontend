import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";

export default function GoogleCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { signinWithGoogle } = useAuthStore();

  useEffect(() => {
    const run = async () => {
      const token = params.get("token");

      if (!token) {
        navigate("/auth", { replace: true });
        return;
      }

      try {
        await signinWithGoogle(token);

        // ✅ Get updated user AFTER login
        const user = useAuthStore.getState().user;

        if (!user) {
          navigate("/auth", { replace: true });
          return;
        }

        // ✅ Redirect based on role
        if (user.roleName === "ADMIN" || user.roleName === "SUPER_ADMIN") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("Google callback error:", err);
        navigate("/auth", { replace: true });
      }
    };

    run();
  }, [params, navigate, signinWithGoogle]);

  return (
    <div className="text-center mt-20">
      Signing you in with Google...
    </div>
  );
}