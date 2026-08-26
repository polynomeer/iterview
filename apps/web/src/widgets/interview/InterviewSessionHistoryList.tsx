import { Link } from "react-router-dom";
import type { InterviewSessionListItemModel } from "../../entities/interview/model";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";

type InterviewSessionHistoryListProps = {
  items: InterviewSessionListItemModel[];
};

export function InterviewSessionHistoryList({ items }: InterviewSessionHistoryListProps) {
  const { t } = useLocale();

  return (
    <div className="interview-session-history">
      <div className="card-grid card-grid--two-column interview-session-history__grid">
        {items.map((item) => (
          <article className="list-item-card interview-session-history__item" key={item.id}>
            <div className="list-item-card__content">
              <div className="interview-session-history__header">
                <div className="list-item-card__meta">
                  <span>{item.sessionTypeLabel}</span>
                  <span>{item.interviewModeLabel}</span>
                  <span>{item.statusLabel}</span>
                  {item.resumeVersionId ? <span>{t("interview.withResumeContext")}</span> : <span>{t("interview.withoutResumeContext")}</span>}
                </div>
                <div className="interview-session-history__actions">
                  <Link
                    className="primary-button"
                    to={routeConfig.interviewSession.buildPath({ sessionId: item.id })}
                  >
                    {t("common.openSession")}
                  </Link>
                </div>
              </div>
              <h3 className="list-item-card__title">{`${item.sessionTypeLabel} ${t("interview.sessionSuffix")}`}</h3>
              <p className="list-item-card__body">
                {[
                  item.startedAtLabel ? `${t("interview.startedPrefix")} ${item.startedAtLabel}` : null,
                  item.endedAtLabel ? `${t("interview.endedPrefix")} ${item.endedAtLabel}` : t("interview.inProgress"),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <div className="insight-card__meta">
                <span className="insight-card__chip">{`${item.questionCount} ${t("interview.questionsCount")}`}</span>
                <span className="insight-card__chip">{`${item.answeredCount} ${t("interview.answeredCount")}`}</span>
                {item.averageScoreLabel ? (
                  <span className="insight-card__chip">{`${t("interview.averagePrefix")} ${item.averageScoreLabel}`}</span>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
