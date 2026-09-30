import type { ReviewQueueResponseDto } from "../../shared/types/review-queue";
import { toArray } from "../../shared/lib/collection";
import { formatApiDateTime } from "../../shared/lib/date";
import { translate, type MessageKey } from "../../shared/i18n";

export type ReviewQueueItemModel = {
  id: string;
  questionId: string;
  questionTitle: string;
  scheduledLabel: string | null;
  /** Raw ISO date/time the item is due, for due badges and the week strip. */
  scheduledAt: string | null;
  difficulty: string | null;
  priority: number | null;
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

const REASON_KEYS: Record<string, { label: MessageKey; detail: MessageKey }> = {
  low_total: { label: "reviewModel.reasonLowTotal", detail: "reviewModel.reasonLowTotalDetail" },
  low_depth: { label: "reviewModel.reasonLowDepth", detail: "reviewModel.reasonLowDepthDetail" },
  stale_answer: { label: "reviewModel.reasonStaleAnswer", detail: "reviewModel.reasonStaleAnswerDetail" },
  weak_skill: { label: "reviewModel.reasonWeakSkill", detail: "reviewModel.reasonWeakSkillDetail" },
};

function formatReasonLabel(reasonType?: string | null) {
  return translate((reasonType && REASON_KEYS[reasonType]?.label) || "reviewModel.reasonScheduled");
}

function formatReasonDetail(reasonType?: string | null) {
  return translate((reasonType && REASON_KEYS[reasonType]?.detail) || "reviewModel.reasonScheduledDetail");
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
      scheduledAt: item.scheduledFor ?? null,
      difficulty: item.questionDifficulty ?? null,
      priority: item.priority ?? null,
      reasonTypeLabel: formatReasonLabel(item.reasonType),
      reasonDetail: formatReasonDetail(item.reasonType),
      priorityLabel:
        item.priority === null || item.priority === undefined
          ? null
          : translate("reviewModel.priority", { priority: item.priority }),
      relatedSkillLabels: [],
      sourceAnswerAttemptId: null,
      statusLabel: item.status ?? translate("reviewModel.pendingStatus"),
    })),
  };
}
