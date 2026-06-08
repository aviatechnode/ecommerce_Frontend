import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;

  setSidebarOpen: (v: boolean) => void;

  modal: string | null;

  openModal: (id: string) => void;

  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,

  setSidebarOpen: (v) =>
    set({ sidebarOpen: v }),

  modal: null,

  openModal: (id) =>
    set({ modal: id }),

  closeModal: () =>
    set({ modal: null }),
}));