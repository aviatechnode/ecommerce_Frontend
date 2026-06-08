import {
  useMeQuery,
  useSigninMutation,
  useSignupMutation,
  useSignoutMutation,
  useLazyMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRefreshMutation,
  useGoogleLoginQuery,
} from "../services/authApi";

import { setCsrfToken } from "../lib/csrf";

export const useAuth = () => {
  // ✅ ONLY depend on query state, NOT sessionStorage
  const { data, isLoading } = useMeQuery();

  const [signin] = useSigninMutation();
  const [signup] = useSignupMutation();
  const [signout] = useSignoutMutation();
  const [refresh] = useRefreshMutation();
  const [getMe] = useLazyMeQuery();

  const [forgotPassword] = useForgotPasswordMutation();
  const [resetPassword] = useResetPasswordMutation();

  const { data: googleLoginUrl } = useGoogleLoginQuery();

  return {
    user: data?.user ?? null,
    isLoading,
    isAuthenticated: !!data?.user,
    googleLoginUrl,

    login: async (email: string, password: string) => {
      const res = await signin({ email, password }).unwrap();
      setCsrfToken(res.csrfToken);
    },

    register: async (name: string, email: string, password: string) => {
      const res = await signup({ name, email, password }).unwrap();
      setCsrfToken(res.csrfToken);
    },

    logout: async () => {
      await signout().unwrap();
      setCsrfToken(null);
    },

    // ⚠️ KEEP ONLY IF YOU REALLY NEED IT (rare)
    refreshSession: async () => {
      const res = await refresh().unwrap();
      setCsrfToken(res.csrfToken);
    },

    refetchUser: async () => {
      await getMe().unwrap();
    },

    forgotPassword: async (email: string) => {
      return await forgotPassword({ email }).unwrap();
    },

    resetPassword: async (token: string, password: string) => {
      return await resetPassword({ token, password }).unwrap();
    },
  };
};