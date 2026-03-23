import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/axios";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const verify = async () => {
      try {
        await api.get(`/api/auth/verify-email/${token}`);
        setStatus("success");

        setTimeout(() => {
          navigate("/");
        }, 2000);
      } catch (err) {
        setStatus("error");
      }
    };

    if (token) verify();
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      {status === "verifying" && <p>Verifying your email...</p>}
      {status === "success" && <p>Email verified! Redirecting...</p>}
      {status === "error" && <p>Invalid or expired verification link.</p>}
    </div>
  );
}