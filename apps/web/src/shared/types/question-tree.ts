export type QuestionTreeNodeDto = {
  questionId: string | number;
  title?: string | null;
  difficulty?: string | null;
  depth?: number | null;
  relationshipType?: string | null;
  nodeStatus?: string | null;
  children?: QuestionTreeNodeDto[] | null;
};

export type QuestionTreeResponseDto = {
  root?: QuestionTreeNodeDto | null;
};
