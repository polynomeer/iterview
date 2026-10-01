// 보관함 (ADR 0083). Mirrors apps/api/docs/04-api-contracts.md § Library.

export type LibraryQuestionDto = {
  questionId: number;
  title: string;
  categoryName: string | null;
  difficultyLevel: string;
};

export type QuestionNoteDto = {
  body: string;
  updatedAt: string;
};

export type QuestionLibraryStateDto = {
  questionId: number;
  bookmarked: boolean;
  bookmarkedAt: string | null;
  note: QuestionNoteDto | null;
};

export type LibraryResponseDto = {
  bookmarks: Array<{ question: LibraryQuestionDto; bookmarkedAt: string; hasNote: boolean }>;
  notes: Array<{ question: LibraryQuestionDto; body: string; updatedAt: string; bookmarked: boolean }>;
  materials: Array<{
    materialId: number;
    title: string;
    materialType: string;
    sourceName: string | null;
    contentUrl: string | null;
    estimatedMinutes: number | null;
    question: LibraryQuestionDto;
  }>;
};
