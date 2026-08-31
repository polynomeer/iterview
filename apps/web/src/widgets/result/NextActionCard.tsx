import { Link } from "react-router-dom";
import { useLocale } from "../../shared/i18n";

type NextActionCardProps = {
  progressStatusLabel: string | null;
  archiveDecisionLabel: string | null;
  nextReviewLabel: string | null;
  archivePath: string;
  questionPath: string;
  answerPath: string;
};

export function NextActionCard({
  progressStatusLabel,
  archiveDecisionLabel,
  nextReviewLabel,
  archivePath,
  questionPath,
  answerPath,
}: NextActionCardProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const showArchiveAction = archiveDecisionLabel?.toLowerCase().includes("archive") ?? false;

  return (
    <section className="page-card result-next-action-card">
      <div className="result-next-action-card__topline">
        <span className="page-card__label">{isKorean ? "다음 단계" : "Next step"}</span>
        <span className="question-status-badge question-status-badge--accent">{isKorean ? "실행 레인" : "Action lane"}</span>
      </div>
      <h2 className="page-card__title">{isKorean ? "이 결과 이후 무엇을 할지" : "What to do after this result"}</h2>
      <div className="result-next-action-card__summary-row" role="list" aria-label={isKorean ? "다음 액션 요약" : "Next action summary"}>
        {progressStatusLabel ? (
          <span className="result-next-action-card__summary-item" role="listitem">{isKorean ? `상태 ${progressStatusLabel}` : `Status ${progressStatusLabel}`}</span>
        ) : null}
        {archiveDecisionLabel ? (
          <span className="result-next-action-card__summary-item result-next-action-card__summary-item--accent" role="listitem">
            {isKorean ? `판정 ${archiveDecisionLabel}` : `Decision ${archiveDecisionLabel}`}
          </span>
        ) : null}
        {nextReviewLabel ? (
          <span className="result-next-action-card__summary-item" role="listitem">{isKorean ? `복습 ${nextReviewLabel}` : `Review ${nextReviewLabel}`}</span>
        ) : null}
      </div>
      <div className="result-next-action-card__decision-grid">
        <article className="result-next-action-card__decision-item result-next-action-card__decision-item--accent">
          <span>{isKorean ? "즉시 재시도" : "Immediate retry"}</span>
          <strong>{isKorean ? "핵심은 맞고 표현만 느슨할 때" : "When the core idea is right but phrasing is loose"}</strong>
        </article>
        <article className="result-next-action-card__decision-item">
          <span>{isKorean ? "나중 재시도" : "Retry later"}</span>
          <strong>{isKorean ? "근거와 꼬리질문을 더 보강해야 할 때" : "When evidence and follow-ups need more work"}</strong>
        </article>
      </div>
      <div className="page-card__actions">
        <Link className="secondary-button" to={questionPath}>
          {isKorean ? "질문으로 돌아가기" : "Go back to question"}
        </Link>
        <Link className="secondary-button" to={answerPath}>
          {isKorean ? "답변 수정" : "Revise answer"}
        </Link>
        {nextReviewLabel ? (
          <span className="secondary-button secondary-button--static">
            {isKorean ? "나중에 재시도" : "Retry later"}
          </span>
        ) : null}
        {showArchiveAction ? (
          <Link className="primary-button" to={archivePath}>
            {isKorean ? "아카이브로 이동" : "Go to archive"}
          </Link>
        ) : (
          <Link className="primary-button" to={answerPath}>
            {isKorean ? "이 질문 다시 풀기" : "Try this question again"}
          </Link>
        )}
      </div>
    </section>
  );
}
