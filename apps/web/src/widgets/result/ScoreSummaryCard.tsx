import type { ResultAnalysisModel } from "../../entities/result/model";
import type { CSSProperties } from "react";
import { useLocale } from "../../shared/i18n";

type ScoreSummaryCardProps = {
  result: ResultAnalysisModel;
};

export function ScoreSummaryCard({ result }: ScoreSummaryCardProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const numericScore = Number(result.totalScore);
  const scoreValue = Number.isFinite(numericScore) ? Math.max(0, Math.min(100, numericScore)) : 0;
  const scoreTone = scoreValue >= 80 ? "strong" : scoreValue >= 65 ? "steady" : "recovery";

  return (
    <section className={`result-score-card result-score-card--workspace result-score-card--${scoreTone}`}>
      <div className="result-score-card__question-context">
        <div className="result-score-card__topline">
          <span className="result-score-card__eyebrow-pill">{isKorean ? "면접 질문" : "Interview question"}</span>
          {result.archiveDecisionLabel ? <span className="result-score-card__eyebrow-pill">{result.archiveDecisionLabel}</span> : null}
        </div>
        <h2 className="result-score-card__title">{result.questionTitle}</h2>
        <p className="result-score-card__subtitle">{isKorean ? "이번 답변 평가" : "This answer attempt"}</p>
        <div className="result-score-card__meta-row">
          <span>{result.progressStatusLabel ?? (isKorean ? "분석 완료" : "Analysis complete")}</span>
          <span>{result.nextReviewLabel ?? (isKorean ? "즉시 재시도 가능" : "Retry available now")}</span>
        </div>
      </div>
      <div className="result-score-card__value" aria-label={isKorean ? `종합 점수 ${result.totalScore}점` : `Overall score ${result.totalScore}`}>
        <div className="result-score-card__score-ring" style={{ "--result-score": `${scoreValue * 3.6}deg` } as CSSProperties}>
          <strong>{result.totalScore}</strong>
          <span>/ 100</span>
        </div>
      </div>
      <div className="result-score-card__verdict">
        <span>{isKorean ? "평가 결과" : "Evaluation"}</span>
        <h3>{result.evaluationResult}</h3>
        <p>{isKorean ? "점수보다 약한 추론 단계 하나를 골라 다음 답변에서 검증하세요." : "Use the score to choose one weak reasoning step to verify in the next answer."}</p>
        <div className="result-score-card__verdict-meta">
          <span>{isKorean ? "다음 복습" : "Next review"}</span>
          <strong>{result.nextReviewLabel ?? (isKorean ? "지금" : "Now")}</strong>
        </div>
      </div>
    </section>
  );
}
