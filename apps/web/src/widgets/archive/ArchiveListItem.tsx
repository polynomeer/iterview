import { Link } from "react-router-dom";
import type { ArchiveItemModel } from "../../entities/archive/model";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";

type ArchiveListItemProps = {
  item: ArchiveItemModel;
  isSelected?: boolean;
  onSelect?: () => void;
};

export function ArchiveListItem({ item, isSelected = false, onSelect }: ArchiveListItemProps) {
  const { locale, t } = useLocale();
  const isKorean = locale === "ko";
  const evidencePoints = [
    item.totalAttemptCountLabel
      ? { label: "시도", value: item.totalAttemptCountLabel }
      : null,
    item.archivedAtLabel ? { label: "보관 시점", value: item.archivedAtLabel } : null,
    item.sourceLabel ? { label: "출처", value: item.sourceLabel } : null,
    item.bestScoreLabel ? { label: "신호", value: item.bestScoreLabel } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <article
      className={`list-item-card archive-list-item archive-browser-row ${isSelected ? "archive-browser-row--selected" : ""}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (!onSelect) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      <div aria-hidden="true" className="archive-browser-row__select">
        <span>{isSelected ? "✓" : ""}</span>
      </div>
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
        <div className="archive-browser-row__chips">
          {item.totalAttemptCountLabel ? <span className="detail-chip">{item.totalAttemptCountLabel}</span> : null}
          {item.sourceLabel ? <span className="detail-chip detail-chip--accent">{item.sourceLabel}</span> : null}
        </div>
      </div>
      <div className="archive-browser-row__metric">
        <span>{isKorean ? "최고 점수" : "Best score"}</span>
        <strong>{item.bestScoreLabel ?? "-"}</strong>
      </div>
      <div className="archive-browser-row__metric">
        <span>{isKorean ? "보관 시점" : "Archived at"}</span>
        <strong>{item.archivedAtLabel ?? "-"}</strong>
      </div>
      <div className="archive-browser-row__related">
        {evidencePoints.slice(0, 2).map((point) => (
          <article className="archive-list-item__supporting-item" key={`${item.id}-${point.label}`}>
            <span>{point.label}</span>
            <strong>{point.value}</strong>
          </article>
        ))}
      </div>
      <div className="list-item-card__actions archive-browser-row__actions">
        <Link
          className="secondary-button"
          onClick={(event) => event.stopPropagation()}
          to={routeConfig.questionDetail.buildPath({ questionId: item.questionId })}
        >
          {t("archive.viewQuestion")}
        </Link>
        {item.sourceSessionId ? (
          <Link
            className="primary-button"
            onClick={(event) => event.stopPropagation()}
            to={routeConfig.interviewSession.buildPath({ sessionId: item.sourceSessionId })}
          >
            {t("archive.viewSession")}
          </Link>
        ) : null}
      </div>
    </article>
  );
}
