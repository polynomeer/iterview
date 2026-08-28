import { Link } from "react-router-dom";
import type { ArchiveItemModel } from "../../entities/archive/model";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";

type ArchiveListItemProps = {
  item: ArchiveItemModel;
};

export function ArchiveListItem({ item }: ArchiveListItemProps) {
  const { t } = useLocale();
  const evidencePoints = [
    item.totalAttemptCountLabel
      ? { label: "시도", value: item.totalAttemptCountLabel }
      : null,
    item.archivedAtLabel ? { label: "보관 시점", value: item.archivedAtLabel } : null,
    item.sourceLabel ? { label: "출처", value: item.sourceLabel } : null,
    item.bestScoreLabel ? { label: "신호", value: item.bestScoreLabel } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <article className="list-item-card archive-list-item">
      <div className="list-item-card__content">
        <div className="list-item-card__meta">
          <span>{item.archivedStatusLabel}</span>
          <span>{item.difficultyLabel}</span>
          {item.sourceBadgeLabel ? (
            <span className="question-status-badge question-status-badge--neutral">{item.sourceBadgeLabel}</span>
          ) : null}
          {item.isFollowUp ? (
            <span className="question-status-badge question-status-badge--accent">{t("archive.followUp")}</span>
          ) : null}
        </div>
        <h3 className="list-item-card__title">{item.questionTitle}</h3>
        <p className="list-item-card__body">{item.summary}</p>
        {item.bestScoreLabel ? (
          <p className="archive-list-item__score">{item.bestScoreLabel}</p>
        ) : null}
        <div className="archive-list-item__chips">
          {item.totalAttemptCountLabel ? <span className="detail-chip">{item.totalAttemptCountLabel}</span> : null}
          {item.archivedAtLabel ? <span className="detail-chip">{item.archivedAtLabel}</span> : null}
          {item.sourceLabel ? <span className="detail-chip detail-chip--accent">{item.sourceLabel}</span> : null}
        </div>
        <p className="resume-section__helper">
          {[item.totalAttemptCountLabel, item.archivedAtLabel, item.sourceLabel].filter(Boolean).join(" · ")}
        </p>
        {item.sourceSessionId ? (
          <p className="resume-section__helper">{t("archive.sessionSourceAvailable")}</p>
        ) : null}
        <div className="archive-list-item__supporting">
          {evidencePoints.map((point) => (
            <article className="archive-list-item__supporting-item" key={`${item.id}-${point.label}`}>
              <span>{point.label}</span>
              <strong>{point.value}</strong>
            </article>
          ))}
        </div>
      </div>
      <div className="list-item-card__actions">
        <Link
          className="secondary-button"
          to={routeConfig.questionDetail.buildPath({ questionId: item.questionId })}
        >
          {t("archive.viewQuestion")}
        </Link>
        {item.sourceSessionId ? (
          <Link
            className="primary-button"
            to={routeConfig.interviewSession.buildPath({ sessionId: item.sourceSessionId })}
          >
            {t("archive.viewSession")}
          </Link>
        ) : null}
      </div>
    </article>
  );
}
