import { Link } from "react-router-dom";
import type { ReviewQueueItemModel } from "../../entities/review-queue/model";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { QuestionStatusBadge } from "../../shared/ui/QuestionStatusBadge";
import { QueueActionButtons } from "./QueueActionButtons";

type ReviewQueueItemProps = {
  item: ReviewQueueItemModel;
  onSkip: () => void;
  onDone: () => void;
  pendingAction?: "skip" | "done" | null;
};

export function ReviewQueueItem({
  item,
  onSkip,
  onDone,
  pendingAction = null,
}: ReviewQueueItemProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const disabled = pendingAction !== null;
  const priorityText = item.priorityLabel ?? (isKorean ? "우선순위 미정" : "Priority pending");
  const timingText = item.scheduledLabel ?? (isKorean ? "일정 없음" : "No schedule");
  const reasonTypeText = item.reasonTypeLabel.toLowerCase();
  const isStudyLane =
    reasonTypeText.includes("depth") ||
    reasonTypeText.includes("skill") ||
    reasonTypeText.includes("깊이") ||
    reasonTypeText.includes("스킬");
  const executionLane = item.sourceAnswerAttemptId
    ? isKorean
      ? "답변 준비됨"
      : "Answer-ready"
    : isStudyLane
      ? isKorean
        ? "학습 필요"
        : "Needs study"
      : isKorean
        ? "빠른 재시도"
        : "Quick retry";

  return (
    <article className="list-item-card review-queue-item-card">
      <div className="list-item-card__content">
        <div className="review-queue-item-card__topline">
          <div className="list-item-card__meta">
            <span>{item.reasonTypeLabel}</span>
            <QuestionStatusBadge status={item.statusLabel} />
          </div>
          <span className="detail-chip detail-chip--accent">{executionLane}</span>
        </div>
        <h3 className="list-item-card__title">{item.questionTitle}</h3>
        <p className="list-item-card__body">{item.reasonDetail}</p>
        <div className="review-queue-item-card__chips">
          <span className="detail-chip detail-chip--accent">{priorityText}</span>
          <span className="detail-chip">{timingText}</span>
        </div>
        {(item.relatedSkillLabels ?? []).length > 0 ? (
          <div className="chip-list review-queue-item-card__skills">
            {(item.relatedSkillLabels ?? []).map((skill) => (
              <span className="detail-chip" key={skill}>
                {skill}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="list-item-card__actions">
        <Link
          className="secondary-button"
          to={routeConfig.questionDetail.buildPath({ questionId: item.questionId })}
        >
          {isKorean ? "검토" : "Inspect"}
        </Link>
        <Link
          className="primary-button"
          to={routeConfig.answerEditor.buildPath({ questionId: item.questionId })}
        >
          {isKorean ? "지금 연습" : "Practice now"}
        </Link>
        {item.sourceAnswerAttemptId ? (
          <Link
            className="secondary-button"
            to={routeConfig.resultAnalysis.buildPath({ answerAttemptId: item.sourceAnswerAttemptId })}
          >
            {isKorean ? "최신 결과" : "Latest result"}
          </Link>
        ) : null}
      </div>
      <div className="review-queue-item-card__footer">
        <p className="review-queue-item-card__note">
          {isKorean
            ? "지금 끝낼 수 있으면 처리하고, 아니면 미루세요."
            : "Resolve now only if you can finish it; otherwise defer."}
        </p>
        <QueueActionButtons
          disabled={disabled}
          onDone={onDone}
          onSkip={onSkip}
          pendingAction={pendingAction}
        />
      </div>
    </article>
  );
}
