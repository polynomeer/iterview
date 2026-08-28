import type { QuestionTreeResponseDto } from "../../shared/types/question-tree";
import { getCurrentAppLocale } from "../../shared/i18n/locale";

export type QuestionTreeNodeModel = {
  id: string;
  title: string;
  depth: number;
  difficulty: string;
  relationshipType: string | null;
  parentQuestionId: string | null;
  status: string;
  isRoot: boolean;
};

export type QuestionTreeModel = {
  rootQuestionId: string | null;
  nodes: QuestionTreeNodeModel[];
};

function flattenTree(
  node: QuestionTreeResponseDto["root"],
  parentQuestionId: string | null,
): QuestionTreeNodeModel[] {
  if (!node) {
    return [];
  }

  const isKorean = getCurrentAppLocale() === "ko";
  const id = String(node.questionId);
  const currentNode: QuestionTreeNodeModel = {
    id,
    title: node.title ?? (isKorean ? "꼬리질문" : "Follow-up question"),
    depth: node.depth ?? 0,
    difficulty: node.difficulty ?? (isKorean ? "일반" : "General"),
    relationshipType: node.relationshipType ?? null,
    parentQuestionId,
    status: node.nodeStatus ?? (isKorean ? "미응답" : "unanswered"),
    isRoot: parentQuestionId === null,
  };

  return [currentNode, ...(node.children ?? []).flatMap((child) => flattenTree(child, id))];
}

export function mapQuestionTreeResponseDtoToModel(
  response: QuestionTreeResponseDto,
): QuestionTreeModel {
  const rootQuestionId =
    response.root?.questionId === null || response.root?.questionId === undefined
      ? null
      : String(response.root.questionId);

  return {
    rootQuestionId,
    nodes: flattenTree(response.root ?? null, null),
  };
}
