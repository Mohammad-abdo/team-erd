import { create } from "zustand";

export const useSessionStore = create((set) => ({
  user: null,
  hydrated: false,
  setUser: (user) => set({ user }),
  setHydrated: (hydrated) => set({ hydrated }),
  clearSession: () => set({ user: null, hydrated: true }),
}));
