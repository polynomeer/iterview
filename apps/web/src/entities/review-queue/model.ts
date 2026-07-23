import type { ReviewQueueResponseDto } from "../../shared/types/review-queue";
import { toArray } from "../../shared/lib/collection";
import { formatApiDateTime } from "../../shared/lib/date";

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
  switch (reasonType) {
    case "low_total":
      return "Low overall score";
    case "low_depth":
      return "Low follow-up depth";
    case "stale_answer":
      return "Needs a fresh retry";
    case "weak_skill":
      return "Weak skill coverage";
    default:
      return "Scheduled review";
  }
}

function formatReasonDetail(reasonType?: string | null) {
  switch (reasonType) {
    case "low_total":
      return "This question is back in the queue because the last overall score did not show enough mastery.";
    case "low_depth":
      return "This item needs another pass because the follow-up depth is still shallow.";
    case "stale_answer":
      return "You have answered this before, but it is old enough to need another review.";
    case "weak_skill":
      return "The related skill profile still shows a gap, so this question is scheduled again.";
    default:
      return "This question is scheduled as part of your recurring review loop.";
  }
}

export function mapReviewQueueResponseDtoToModel(
  response: ReviewQueueResponseDto,
): ReviewQueueModel {
  return {
    items: toArray(response).map((item) => ({
      id: String(item.id),
      questionId: String(item.questionId),
      questionTitle: item.questionTitle,
      scheduledLabel: formatApiDateTime(item.scheduledFor),
      reasonTypeLabel: formatReasonLabel(item.reasonType),
      reasonDetail: formatReasonDetail(item.reasonType),
      priorityLabel:
        item.priority === null || item.priority === undefined ? null : `Priority ${item.priority}`,
      relatedSkillLabels: [],
      sourceAnswerAttemptId: null,
      statusLabel: item.status ?? "pending",
    })),
  };
}
