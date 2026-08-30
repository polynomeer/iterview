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
      <p className="page-card__body">
        {isKorean
          ? "경로는 하나만 고르세요. 즉시 수정, 나중 재시도, 혹은 답변이 충분히 안정된 뒤 아카이브 검토입니다."
          : "Choose one path only: immediate revision, later retry, or archive review after the answer is stable enough."}
      </p>
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
      <div className="result-next-action-card__principles" role="list" aria-label={isKorean ? "다음 액션 원칙" : "Next action principles"}>
        <span role="listitem">{isKorean ? "답변 전체를 고치기 전에 가장 약한 가지를 다시 읽으세요." : "Re-read the weakest branch before editing the whole answer."}</span>
        <span role="listitem">{isKorean ? "표현 문제는 즉시 재시도로, 근거가 얇으면 더 깊은 꼬리질문으로 가세요." : "Use immediate retry for phrasing issues and follow-up depth for thin evidence."}</span>
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
