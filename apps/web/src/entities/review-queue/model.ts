import type { ReviewQueueResponseDto } from "../../shared/types/review-queue";
import { toArray } from "../../shared/lib/collection";
import { formatApiDateTime } from "../../shared/lib/date";
import { getCurrentAppLocale } from "../../shared/i18n/locale";

export type ReviewQueueItemModel = {
  id: string;
  questionId: string;
  questionTitle: string;
  scheduledLabel: string | null;
  reasonTypeLabel: string;
  reasonDetail: string;
  priorityLabel: string | null;
  relatedSkillLabels: string[];
  sourceAnswerAttemptId: string | null;
  statusLabel: string;
};

export type ReviewQueueModel = {
  items: ReviewQueueItemModel[];
};

function formatReasonLabel(reasonType?: string | null) {
  const isKorean = getCurrentAppLocale() === "ko";
  switch (reasonType) {
    case "low_total":
      return isKorean ? "전체 점수 낮음" : "Low overall score";
    case "low_depth":
      return isKorean ? "꼬리질문 깊이 부족" : "Low follow-up depth";
    case "stale_answer":
      return isKorean ? "재시도 필요" : "Needs a fresh retry";
    case "weak_skill":
      return isKorean ? "스킬 커버리지 부족" : "Weak skill coverage";
    default:
      return isKorean ? "예약된 복습" : "Scheduled review";
  }
}

function formatReasonDetail(reasonType?: string | null) {
  const isKorean = getCurrentAppLocale() === "ko";
  switch (reasonType) {
    case "low_total":
      return isKorean
        ? "마지막 전체 점수에서 충분한 숙련도가 확인되지 않아 이 질문이 다시 큐에 들어왔습니다."
        : "This question is back in the queue because the last overall score did not show enough mastery.";
    case "low_depth":
      return isKorean
        ? "꼬리질문 깊이가 아직 얕아서 이 항목은 한 번 더 점검이 필요합니다."
        : "This item needs another pass because the follow-up depth is still shallow.";
    case "stale_answer":
      return isKorean
        ? "이전에 답변한 적은 있지만, 다시 복습이 필요할 만큼 오래된 답변입니다."
        : "You have answered this before, but it is old enough to need another review.";
    case "weak_skill":
      return isKorean
        ? "연결된 스킬 프로필에 아직 공백이 보여서 이 질문이 다시 예약되었습니다."
        : "The related skill profile still shows a gap, so this question is scheduled again.";
    default:
      return isKorean
        ? "이 질문은 반복 복습 루프의 일부로 예약되었습니다."
        : "This question is scheduled as part of your recurring review loop.";
  }
}

export function mapReviewQueueResponseDtoToModel(
  response: ReviewQueueResponseDto,
): ReviewQueueModel {
  const isKorean = getCurrentAppLocale() === "ko";
  return {
    items: toArray(response).map((item) => ({
      id: String(item.id),
      questionId: String(item.questionId),
      questionTitle: item.questionTitle,
      scheduledLabel: formatApiDateTime(item.scheduledFor),
      reasonTypeLabel: formatReasonLabel(item.reasonType),
      reasonDetail: formatReasonDetail(item.reasonType),
      priorityLabel:
        item.priority === null || item.priority === undefined
          ? null
          : isKorean
            ? `우선순위 ${item.priority}`
            : `Priority ${item.priority}`,
      relatedSkillLabels: [],
      sourceAnswerAttemptId: null,
      statusLabel: item.status ?? (isKorean ? "대기" : "pending"),
    })),
  };
}
