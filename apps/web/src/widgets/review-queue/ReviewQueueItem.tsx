import { Link } from "react-router-dom";
import type { ReviewQueueItemModel } from "../../entities/review-queue/model";
import { routeConfig } from "../../shared/config/routes";
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
  const disabled = pendingAction !== null;
  const priorityText = item.priorityLabel ?? "Priority pending";
  const timingText = item.scheduledLabel ?? "No schedule";
  const executionLane = item.sourceAnswerAttemptId
    ? "Answer-ready"
    : item.reasonTypeLabel.toLowerCase().includes("depth") || item.reasonTypeLabel.toLowerCase().includes("skill")
      ? "Needs study"
      : "Quick retry";

  return (
    <article className="list-item-card review-queue-item-card">
      <div className="list-item-card__content">
        <div className="review-queue-item-card__topline">
          <div className="list-item-card__meta">
            <span>{item.reasonTypeLabel}</span>
            {item.priorityLabel ? <span>{item.priorityLabel}</span> : null}
            {item.scheduledLabel ? <span>{item.scheduledLabel}</span> : null}
            <QuestionStatusBadge status={item.statusLabel} />
          </div>
          <span className="detail-chip detail-chip--accent">{executionLane}</span>
        </div>
        <h3 className="list-item-card__title">{item.questionTitle}</h3>
        <p className="list-item-card__body">{item.reasonDetail}</p>
        <div className="review-queue-item-card__decision-grid">
          <article className="review-queue-item-card__decision-card">
            <span>Priority signal</span>
            <strong>{priorityText}</strong>
          </article>
          <article className="review-queue-item-card__decision-card">
            <span>Timing</span>
            <strong>{timingText}</strong>
          </article>
          <article className="review-queue-item-card__decision-card">
            <span>Best next move</span>
            <strong>{executionLane}</strong>
          </article>
        </div>
        <div className="review-queue-item-card__supporting">
          {item.priorityLabel ? (
            <article className="review-queue-item-card__supporting-item">
              <span>Priority</span>
              <strong>{item.priorityLabel}</strong>
            </article>
          ) : null}
          {item.scheduledLabel ? (
            <article className="review-queue-item-card__supporting-item">
              <span>Scheduled</span>
              <strong>{item.scheduledLabel}</strong>
            </article>
          ) : null}
        </div>
        <div className="review-queue-item-card__chips">
          {item.priorityLabel ? <span className="detail-chip detail-chip--accent">{item.priorityLabel}</span> : null}
          {item.scheduledLabel ? <span className="detail-chip">{item.scheduledLabel}</span> : null}
        </div>
        {(item.relatedSkillLabels ?? []).length > 0 ? (
          <div className="chip-list">
            {(item.relatedSkillLabels ?? []).map((skill) => (
              <span className="detail-chip detail-chip--accent" key={skill}>
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
          Inspect
        </Link>
        <Link
          className="primary-button"
          to={routeConfig.answerEditor.buildPath({ questionId: item.questionId })}
        >
          Practice now
        </Link>
        {item.sourceAnswerAttemptId ? (
          <Link
            className="secondary-button"
            to={routeConfig.resultAnalysis.buildPath({ answerAttemptId: item.sourceAnswerAttemptId })}
          >
            Latest result
          </Link>
        ) : null}
      </div>
      <div className="review-queue-item-card__footer">
        <div className="review-queue-item-card__footer-copy">
          <p className="review-queue-item-card__note">
            Resolve now only if you can finish the answer loop; otherwise defer intentionally.
          </p>
          <span className="review-queue-item-card__footer-hint">
            The queue should shrink because the branch became clearer, not because it was hidden.
          </span>
        </div>
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
