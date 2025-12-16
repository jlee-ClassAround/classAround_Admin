import { Chapter, Lesson } from '@/generated/cojooboo';
import { create } from 'zustand';

export type ChapterType = Chapter & {
    lessons: Lesson[];
};
// export interface ChapterType {
//   id: string;
//   title: string;
//   description?: string;
//   isPublished: boolean;
//   lessons: LessonType[];
// }

type LessonType = Lesson;
// interface LessonType {
//   id: string;
//   title: string;
//   description?: string;
//   videoUrl?: string;
//   isPublished: boolean;
// }

interface CourseEditorState {
    chapters: ChapterType[];
    selectedChapterIndex: number | null;
    selectedLessonIndex: number | null;
    isChapterModalOpened: boolean;
    isLessonModalOpened: boolean;

    setChapters: (chapters: ChapterType[]) => void;

    addChapter: (chapter: ChapterType) => void;
    editChapter: (chapterIndex: number, chapter: ChapterType) => void;
    deleteChapter: (chapterIndex: number) => void;

    addLesson: (chapterIndex: number, lesson: LessonType) => void;
    editLesson: (chapterIndex: number, lessonIndex: number, lesson: LessonType) => void;
    deleteLesson: (chapterIndex: number, lessonIndex: number) => void;

    openChapterModal: (chapterIndex?: number) => void;
    closeChapterModal: () => void;

    openLessonModal: (chapterIndex: number, lessonIndex?: number) => void;
    closeLessonModal: () => void;
}

export const useCourseEditorStore = create<CourseEditorState>((set) => ({
    chapters: [],
    selectedChapterIndex: null,
    selectedLessonIndex: null,
    isChapterModalOpened: false,
    isLessonModalOpened: false,

    setChapters: (chapters) => set({ chapters }),

    addChapter: (chapter) => set((state) => ({ chapters: [...state.chapters, chapter] })),
    editChapter: (chapterIndex, chapter) =>
        set((state) => {
            const updatedChapters = [...state.chapters];
            updatedChapters[chapterIndex] = { ...chapter };
            return {
                chapters: updatedChapters,
            };
        }),
    deleteChapter: (chapterIndex) =>
        set((state) => ({
            chapters: state.chapters.filter((_, index) => index !== chapterIndex),
        })),

    addLesson: (chapterIndex, lesson) =>
        set((state) => {
            const updatedChapters = [...state.chapters];
            updatedChapters[chapterIndex].lessons = [
                ...updatedChapters[chapterIndex].lessons,
                lesson,
            ];
            return {
                chapters: updatedChapters,
            };
        }),
    editLesson: (chapterIndex, lessonIndex, lesson) =>
        set((state) => {
            const updatedChapters = [...state.chapters];
            updatedChapters[chapterIndex].lessons[lessonIndex] = { ...lesson };
            return {
                chapters: updatedChapters,
            };
        }),
    deleteLesson: (chapterIndex, lessonIndex) =>
        set((state) => {
            const updatedChapters = [...state.chapters];
            updatedChapters[chapterIndex].lessons = updatedChapters[chapterIndex].lessons.filter(
                (_, index) => index !== lessonIndex
            );
            return {
                chapters: updatedChapters,
            };
        }),

    openChapterModal: (chapterIndex) =>
        set({
            selectedChapterIndex: typeof chapterIndex !== undefined ? chapterIndex : null,
            isChapterModalOpened: true,
        }),
    closeChapterModal: () => set({ selectedChapterIndex: null, isChapterModalOpened: false }),

    openLessonModal: (chapterIndex, lessonIndex) =>
        set({
            selectedChapterIndex: chapterIndex,
            selectedLessonIndex: typeof lessonIndex !== undefined ? lessonIndex : null,
            isLessonModalOpened: true,
        }),
    closeLessonModal: () =>
        set({
            selectedChapterIndex: null,
            selectedLessonIndex: null,
            isLessonModalOpened: false,
        }),
}));
