import { create } from "zustand";

interface RemoveUserModalStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useRemoveUserModalStore = create<RemoveUserModalStore>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
}));
