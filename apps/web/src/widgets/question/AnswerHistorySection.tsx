import { Link } from "react-router-dom";
import type { AnswerHistoryModel } from "../../entities/answer-history/model";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { ScoreBadge } from "../../shared/ui/ScoreBadge";

type AnswerHistorySectionProps = {
  history: AnswerHistoryModel;
};

export function AnswerHistorySection({ history }: AnswerHistorySectionProps) {
  const { t } = useLocale();

  return (
    <section className="page-card question-detail-section-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{t("answer.historyEyebrow")}</p>
          <h2 className="page-card__title">{t("answer.historyTitle")}</h2>
          <p className="page-card__body">
            Compare only the most recent attempts you can still learn from instead of rereading every past answer.
          </p>
        </div>
        <span className="section-heading__count">{history.items.length}</span>
      </div>
      <div className="stack-list">
        {history.items.map((item) => (
          <article className="list-item-card question-history-card" key={item.answerAttemptId}>
            <div className="list-item-card__content">
              <div className="list-item-card__meta">
                <span>{item.submittedAtLabel}</span>
                {item.progressStatusLabel ? <span>{item.progressStatusLabel}</span> : null}
              </div>
              <h3 className="list-item-card__title">{item.evaluationResultLabel ?? t("answer.attemptSummary")}</h3>
              {item.totalScoreLabel ? (
                <ScoreBadge
                  tone={
                    item.evaluationResultLabel === "PASS"
                      ? "positive"
                      : item.evaluationResultLabel === "FAIL"
                        ? "warning"
                        : "neutral"
                  }
                  value={item.totalScoreLabel.replace("Score ", "")}
                />
              ) : null}
              {item.evaluationResultLabel && item.totalScoreLabel ? (
                <p className="list-item-card__body">
                  <span>{item.totalScoreLabel}</span>
                  {` · ${t("answer.compareLatest")}`}
                </p>
              ) : null}
            </div>
            <div className="list-item-card__actions">
              <Link
                className="primary-button"
                to={routeConfig.resultAnalysis.buildPath({ answerAttemptId: item.answerAttemptId })}
              >
                {t("answer.viewResult")}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
