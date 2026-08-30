import type { ResultAnalysisModel } from "../../entities/result/model";
import { useLocale } from "../../shared/i18n";
import { ScoreBadge } from "../../shared/ui/ScoreBadge";

type ScoreSummaryCardProps = {
  result: ResultAnalysisModel;
};

export function ScoreSummaryCard({ result }: ScoreSummaryCardProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const summaryPoints = [
    result.archiveDecisionLabel
      ? isKorean
        ? `경로 ${result.archiveDecisionLabel}`
        : `Route ${result.archiveDecisionLabel}`
      : isKorean
        ? "계속 다듬기"
        : "Keep iterating",
    result.progressStatusLabel ?? (isKorean ? "진행 상태 미표기" : "Progress not labeled"),
    result.nextReviewLabel
      ? isKorean
        ? `복습 ${result.nextReviewLabel}`
        : `Review ${result.nextReviewLabel}`
      : isKorean
        ? "즉시 재시도"
        : "Retry immediately",
  ];

  return (
    <section className="result-score-card result-score-card--workspace">
      <div className="result-score-card__topline">
        <span className="page-card__label">{isKorean ? "종합 점수" : "Overall score"}</span>
        <span className="result-score-card__eyebrow-pill">{isKorean ? "평가 리드아웃" : "Evaluation readout"}</span>
      </div>
      <p className="result-score-card__kicker">{isKorean ? "인터뷰 평가" : "Interview evaluation"}</p>
      <div className="result-score-card__hero">
        <div className="result-score-card__value">
          <ScoreBadge
            label={isKorean ? "점수" : "Score"}
            tone={result.evaluationResult === "PASS" ? "positive" : "neutral"}
            value={result.totalScore}
          />
        </div>
        <div className="result-score-card__summary-row" role="list" aria-label={isKorean ? "점수 요약" : "Score summary"}>
          {summaryPoints.map((point) => (
            <span className="result-score-card__summary-item" key={point} role="listitem">
              {point}
            </span>
          ))}
        </div>
      </div>
      <h2 className="result-score-card__title">{result.evaluationResult}</h2>
      <p className="result-score-card__subtitle">{result.questionTitle}</p>
      <p className="result-score-card__body">
        {isKorean
          ? "이 판정은 최종 성적이 아니라 가지 선택 기준으로 사용하세요. 다음 반복은 전부를 다시 쓰는 대신 가장 약한 추론 단계만 겨냥해야 합니다."
          : "Use this verdict as a branch decision, not a final grade. The next iteration should target the weakest reasoning step instead of rewriting everything."}
      </p>
      <div className="result-score-card__principles" role="list" aria-label={isKorean ? "점수 카드 원칙" : "Score card principles"}>
        <span role="listitem">{isKorean ? "점수는 최종 결과가 아니라 라우팅 정보로 읽으세요." : "Read the score as routing information, not as the final outcome."}</span>
        <span role="listitem">{isKorean ? "답변 전체를 다시 쓰기 전에 가장 약한 추론 단계를 겨냥하세요." : "Target the weakest reasoning step before rewriting the full answer."}</span>
      </div>
    </section>
  );
}
