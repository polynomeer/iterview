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

  return (
    <article className="list-item-card review-queue-item-card">
      <div className="list-item-card__content">
        <div className="list-item-card__meta">
          <span>{item.reasonTypeLabel}</span>
          {item.priorityLabel ? <span>{item.priorityLabel}</span> : null}
          {item.scheduledLabel ? <span>{item.scheduledLabel}</span> : null}
          <QuestionStatusBadge status={item.statusLabel} />
        </div>
        <h3 className="list-item-card__title">{item.questionTitle}</h3>
        <p className="list-item-card__body">{item.reasonDetail}</p>
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
          Detail
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
        <p className="review-queue-item-card__note">
          Resolve now only if you can finish the answer loop; otherwise defer intentionally.
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
