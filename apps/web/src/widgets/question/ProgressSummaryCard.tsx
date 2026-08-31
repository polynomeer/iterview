import type { QuestionDetailModel } from "../../entities/question/model";
import { useLocale } from "../../shared/i18n";

type ProgressSummaryCardProps = {
  progress: NonNullable<QuestionDetailModel["userProgressSummary"]>;
};

export function ProgressSummaryCard({ progress }: ProgressSummaryCardProps) {
  const { locale, t } = useLocale();
  const isKorean = locale === "ko";

  return (
    <section className="page-card question-detail-section-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{t("question.progressEyebrow")}</p>
          <h2 className="page-card__title">{t("question.progressTitle")}</h2>
          <p className="page-card__body">
            {isKorean
              ? "다음 답변을 열 가치가 있는지 이 카드로만 판독하세요."
              : "Use this card only to decide whether the next answer pass is worth opening."}
          </p>
        </div>
        <span className="section-heading__count section-heading__count--text">{progress.status}</span>
      </div>
      <div className="stats-grid">
        <article className="stat-tile">
          <p className="stat-tile__label">{t("question.attempts")}</p>
          <strong className="stat-tile__value">{progress.attemptsCount}</strong>
        </article>
        <article className="stat-tile">
          <p className="stat-tile__label">{t("question.bestScore")}</p>
          <strong className="stat-tile__value stat-tile__value--small">{progress.bestScoreLabel}</strong>
        </article>
        <article className="stat-tile stat-tile--wide">
          <p className="stat-tile__label">{t("question.lastReviewed")}</p>
          <strong className="stat-tile__value stat-tile__value--small">{progress.lastReviewedLabel}</strong>
        </article>
        {progress.nextReviewLabel ? (
          <article className="stat-tile stat-tile--wide">
            <p className="stat-tile__label">{t("question.nextReview")}</p>
            <strong className="stat-tile__value stat-tile__value--small">{progress.nextReviewLabel}</strong>
          </article>
        ) : null}
        {progress.masteryLevelLabel ? (
          <article className="stat-tile">
            <p className="stat-tile__label">{t("question.mastery")}</p>
            <strong className="stat-tile__value stat-tile__value--small">{progress.masteryLevelLabel}</strong>
          </article>
        ) : null}
      </div>
      <div className="question-progress-card__chips" role="list" aria-label={isKorean ? "질문 진행 신호" : "Question progress signals"}>
        <span className="detail-chip">{`${t("question.attempts")} ${progress.attemptsCount}`}</span>
        <span className="detail-chip detail-chip--accent">{`${t("question.bestPrefix")} ${progress.bestScoreLabel}`}</span>
        {progress.nextReviewLabel ? <span className="detail-chip">{`${t("question.nextPrefix")} ${progress.nextReviewLabel}`}</span> : null}
        {progress.masteryLevelLabel ? <span className="detail-chip">{progress.masteryLevelLabel}</span> : null}
      </div>
    </section>
  );
}
