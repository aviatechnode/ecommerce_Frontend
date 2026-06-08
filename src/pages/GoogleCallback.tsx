import { useEffect } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useLazyMeQuery } from "../services/authApi";
import { setCsrfToken } from "../lib/csrf";

export default function GoogleCallback() {
  const navigate =
    useNavigate();

  const [params] =
    useSearchParams();

  const [getMe] =
    useLazyMeQuery();

  useEffect(() => {
    const run = async () => {
      try {
        const accessToken =
          params.get(
            "accessToken"
          );

        const csrfToken =
          params.get(
            "csrfToken"
          );

        if (!accessToken) {
          navigate("/auth", {
            replace: true,
          });

          return;
        }

        /////////////////////////////////////
        // Store Tokens
        /////////////////////////////////////

        sessionStorage.setItem(
          "accessToken",
          accessToken
        );

        if (csrfToken) {
          setCsrfToken(
            csrfToken
          );
        }

        /////////////////////////////////////
        // Verify Session
        /////////////////////////////////////

        const result =
          await getMe().unwrap();

        if (!result?.user) {
          navigate("/auth", {
            replace: true,
          });

          return;
        }

        /////////////////////////////////////
        // ALWAYS GO HOME
        /////////////////////////////////////

        navigate("/", {
          replace: true,
        });
      } catch (error) {
        console.error(
          "Google callback error:",
          error
        );

        sessionStorage.removeItem(
          "accessToken"
        );

        navigate("/auth", {
          replace: true,
        });
      }
    };

    run();
  }, [
    params,
    navigate,
    getMe,
  ]);

  return (
    <div className="text-center mt-20">
      Signing you in...
    </div>
  );
}