import { create } from "zustand";

interface ApplyCourseDialogState {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useApplyCourseDialog = create<ApplyCourseDialogState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
