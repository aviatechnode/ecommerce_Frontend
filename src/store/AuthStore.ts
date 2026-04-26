import { create } from "zustand";
import { api } from "../api/axios";
import { setCsrfToken } from "../lib/csrf";

/* ================= TYPES ================= */

export interface User {
  id: string;
  email: string;
  name: string;
  roleName: string;
  permissions: string[];
  isSuperAdmin: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  hydrated: boolean;

  initAuth: () => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  signout: () => Promise<void>;
  signinWithGoogle: (token: string) => Promise<void>;

  hasPermission: (permission: string) => boolean;
  setUser: (user: User | null) => void;
}

/* ================= STORE ================= */

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  hydrated: false,

  setUser: (user) => set({ user }),

  /* =========================================================
     INIT AUTH (BOOTSTRAP SESSION VIA REFRESH)
  ========================================================= */

  initAuth: async () => {
    try {
      set({ loading: true });

      /**
       * 🔥 STEP 1: Try refresh (restores session + CSRF)
       */
      try {
        const refreshRes = await api.post("/api/auth/refresh");
        setCsrfToken(refreshRes.data.csrfToken);
      } catch {
        // no session → continue silently
      }

      /**
       * 🔥 STEP 2: Fetch user if session exists
       */
      const { data } = await api.get("/api/auth/me");

      set({
        user: {
          ...data.user,
          isSuperAdmin: data.user.roleName === "SUPER_ADMIN",
        },
        hydrated: true,
      });
    } catch {
      set({
        user: null,
        hydrated: true,
      });
    } finally {
      set({ loading: false });
    }
  },

  /* =========================================================
     SIGNIN
  ========================================================= */

  signin: async (email, password) => {
    set({ loading: true });

    try {
      const { data } = await api.post("/api/auth/signin", {
        email,
        password,
      });

      // 🔥 CRITICAL: store CSRF
      setCsrfToken(data.csrfToken);

      // optional accessToken (not required)
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }

      set({
        user: {
          ...data.user,
          isSuperAdmin: data.user.roleName === "SUPER_ADMIN",
        },
      });
    } finally {
      set({ loading: false });
    }
  },

  /* =========================================================
     SIGNUP
  ========================================================= */

  signup: async (name, email, password) => {
    set({ loading: true });

    try {
      const { data } = await api.post("/api/auth/signup", {
        name,
        email,
        password,
      });

      // 🔥 CRITICAL: store CSRF
      setCsrfToken(data.csrfToken);

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }

      set({
        user: {
          ...data.user,
          isSuperAdmin: data.user.roleName === "SUPER_ADMIN",
        },
      });
    } finally {
      set({ loading: false });
    }
  },

  /* =========================================================
     GOOGLE LOGIN
  ========================================================= */

  signinWithGoogle: async (token) => {
    set({ loading: true });

    try {
      const { data } = await api.post("/api/auth/google", {
        token,
      });

      // 🔥 store CSRF if backend returns it
      if (data.csrfToken) {
        setCsrfToken(data.csrfToken);
      }

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }

      const me = await api.get("/api/auth/me");

      set({
        user: {
          ...me.data.user,
          isSuperAdmin: me.data.user.roleName === "SUPER_ADMIN",
        },
      });
    } catch {
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },

  /* =========================================================
     SIGNOUT
  ========================================================= */

  signout: async () => {
    try {
      await api.post("/api/auth/signout");

      localStorage.removeItem("accessToken");

      // 🔥 clear CSRF in memory
      setCsrfToken(null);

      set({
        user: null,
        hydrated: true,
      });

      window.location.replace("/auth");
    } catch {
      localStorage.removeItem("accessToken");
      setCsrfToken(null);

      set({ user: null });

      window.location.replace("/auth");
    }
  },

  /* =========================================================
     PERMISSIONS
  ========================================================= */

  hasPermission: (permission) => {
    const user = get().user;

    if (!user) return false;
    if (user.isSuperAdmin) return true;

    return user.permissions.includes(permission);
  },
}));