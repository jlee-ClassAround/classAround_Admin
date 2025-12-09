import { create } from "zustand";

interface OptionModalState {
  isModalOpen: boolean;
  selectedOptionId: string | null;
}

interface OptionModalActions {
  onOpenModal: (optionId: string) => void;
  onCloseModal: () => void;
}

export const useOptionModal = create<OptionModalState & OptionModalActions>(
  (set) => ({
    isModalOpen: false,
    selectedOptionId: null,
    onOpenModal: (optionId: string) =>
      set({ isModalOpen: true, selectedOptionId: optionId }),
    onCloseModal: () => set({ isModalOpen: false, selectedOptionId: null }),
  })
);
