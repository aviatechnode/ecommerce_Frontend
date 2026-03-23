import { create } from "zustand";
import { api } from "../api/axios";

interface User {
  id: string;
  email: string;
  name: string;
  roleName: string;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  loading: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  signout: () => void;
  signinWithGoogle: (accessToken: string) => Promise<void>;
  hasPermission: (p: string) => boolean;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,

  setUser: (user) => set({ user }),

  signin: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post(
        "/api/auth/signin",
        { email, password },
        { withCredentials: true }
      );
      set({ user: data.user });
      localStorage.setItem("accessToken", data.accessToken);
    } finally {
      set({ loading: false });
    }
  },

  signup: async (name, email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post(
        "/api/auth/signup",
        { name, email, password },
        { withCredentials: true }
      );
      set({ user: data.user });
      localStorage.setItem("accessToken", data.accessToken);
    } finally {
      set({ loading: false });
    }
  },

  signinWithGoogle: async (accessToken: string) => {
    set({ loading: true });
    try {
      // Store token locally
      localStorage.setItem("accessToken", accessToken);

      // Fetch user info from backend
      const { data } = await api.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });

      set({ user: data.user });
    } catch (err) {
      console.error("Google login failed", err);
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },

  signout: () => {
    localStorage.removeItem("accessToken");
    set({ user: null });
  },

  hasPermission: (p) => get().user?.permissions.includes(p) ?? false,
}));