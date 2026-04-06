import { create } from "zustand";

/**
 * When true on the whiteboard route, AppLayout hides the global sidebar for maximum canvas space.
 */
export const useWhiteboardFocusStore = create((set) => ({
  focus: false,
  setFocus: (v) => set({ focus: Boolean(v) }),
  clearFocus: () => set({ focus: false }),
}));
