import { create } from "zustand";

export type TeacherType = {
  id: string;
  name: string;
};

interface SelectedTeacherStore {
  selectedTeachers: TeacherType[];
  setSelectedTeachers: (teachers: TeacherType[]) => void;
  onSelectTeacher: (teacher: TeacherType) => void;
  onDeleteTeacher: (teacher: TeacherType) => void;
}

export const useSelectTeachers = create<SelectedTeacherStore>((set) => ({
  selectedTeachers: [],
  setSelectedTeachers: (teachers) =>
    set({
      selectedTeachers: teachers,
    }),
  onSelectTeacher: (teacher) =>
    set((state) => ({
      selectedTeachers: [...state.selectedTeachers, teacher],
    })),
  onDeleteTeacher: (teacher) =>
    set((state) => ({
      selectedTeachers: state.selectedTeachers.filter(
        (item) => item.id !== teacher.id
      ),
    })),
}));
