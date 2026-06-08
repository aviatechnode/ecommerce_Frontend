import { Link, useNavigate, useParams } from "react-router-dom";
import { useVerifyEmailQuery } from "../../services/authApi";
import { useEffect, useState } from "react";

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [status, setStatus] =
    useState<"loading" | "success" | "error">("loading");

  const [message, setMessage] = useState("");

  // ✅ RTK Query runs automatically when token exists
  const { isLoading, isError, isSuccess, error } =
    useVerifyEmailQuery(token ?? "", {
      skip: !token,
    });

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }
  }, [token]);

  useEffect(() => {
    if (isLoading) {
      setStatus("loading");
      setMessage("Verifying your email, please wait...");
    }

    if (isSuccess) {
      setStatus("success");
      setMessage("Email verified successfully!");

      const timer = setTimeout(() => {
        navigate("/auth");
      }, 3000);

      return () => clearTimeout(timer);
    }

    if (isError) {
      setStatus("error");

      const errMsg =
        (error as any)?.data?.message ||
        "Verification failed.";

      setMessage(errMsg);
    }
  }, [isLoading, isSuccess, isError, error, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
        </div>

        <div className={`rounded-md p-4 ${
          status === "loading" ? "bg-blue-50" : status === "success" ? "bg-green-50" : "bg-red-50"
        }`}>
          <div className="text-sm text-center">
            {status === "loading" && "Verifying your email, please wait..."}
            {status === "success" && <span className="text-green-700">{message}</span>}
            {status === "error" && <span className="text-red-700">{message}</span>}
          </div>
        </div>

        {(status === "error" || status === "success") && (
          <div className="text-center">
            <Link to="/auth" className="text-indigo-600 hover:text-indigo-500">
              Go to sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}