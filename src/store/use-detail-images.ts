import { create } from "zustand";

export type DetailImageType = {
  id: string;
  name: string;
  imageUrl: string;
};

interface DetailImagesState {
  images: DetailImageType[];
  setImages: (images: DetailImageType[]) => void;
  uploadImages: (images: DetailImageType[]) => void;
  deleteImages: (imageIndex: number) => void;
}

export const useDetailImagesStore = create<DetailImagesState>((set) => ({
  images: [],
  setImages: (images) => set({ images }),
  uploadImages: (images) =>
    set((state) => ({
      images: [...state.images, ...images],
    })),
  deleteImages: (imageIndex) =>
    set((state) => ({
      images: state.images.filter((_, index) => index !== imageIndex),
    })),
}));
