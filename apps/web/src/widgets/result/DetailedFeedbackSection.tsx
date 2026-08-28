import type { ResultAnalysisModel } from "../../entities/result/model";
import { useLocale } from "../../shared/i18n";

type DetailedFeedbackSectionProps = {
  result: ResultAnalysisModel;
};

function PointList({
  title,
  items,
  tone = "neutral",
}: {
  title: string;
  items: string[];
  tone?: "positive" | "neutral" | "warning";
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <article className={`feedback-card feedback-card--${tone === "warning" ? "improving" : tone}`}>
      <h3 className="list-item-card__title">{title}</h3>
      <ul className="feedback-bullet-list">
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

export function DetailedFeedbackSection({ result }: DetailedFeedbackSectionProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const hasNarrative =
    Boolean(result.detailedFeedback) ||
    Boolean(result.strengthSummary) ||
    Boolean(result.weaknessSummary) ||
    Boolean(result.recommendedNextStep) ||
    result.strengthPoints.length > 0 ||
    result.improvementPoints.length > 0 ||
    result.missedPoints.length > 0;

  return (
    <section className="page-card result-analysis-section-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "상세 피드백" : "Detailed feedback"}</p>
          <h2 className="page-card__title">{isKorean ? "이 답변을 개선하는 방법" : "How to improve this answer"}</h2>
          <p className="page-card__body">
            {isKorean
              ? "이 영역을 핵심 개선 내러티브로 읽고, 아래의 작은 카드는 이를 뒷받침하는 근거로 활용하세요."
              : "Read this as the main improvement narrative, then use the smaller cards below as supporting evidence."}
          </p>
        </div>
      </div>

      {!hasNarrative ? (
        <p className="page-card__body">
          {isKorean ? "이번 시도에는 아직 상세 분석이 없습니다." : "Detailed analysis is not available for this attempt yet."}
        </p>
      ) : (
        <div className="page-stack">
          {result.detailedFeedback ? (
            <div className="result-analysis-narrative">
              <p className="page-card__body">{result.detailedFeedback}</p>
              {(result.narrativeLocale || result.narrativeModelLabel) && (
                <div className="list-item-card__meta">
                  {result.narrativeLocale ? <span>{result.narrativeLocale.toUpperCase()}</span> : null}
                  {result.narrativeModelLabel ? <span>{result.narrativeModelLabel}</span> : null}
                </div>
              )}
            </div>
          ) : null}

          <div className="stack-list">
            {result.strengthSummary ? (
              <article className="feedback-card feedback-card--positive">
                <h3 className="list-item-card__title">{isKorean ? "강점 요약" : "Strength summary"}</h3>
                <p className="list-item-card__body">{result.strengthSummary}</p>
              </article>
            ) : null}
            {result.weaknessSummary ? (
              <article className="feedback-card feedback-card--improving">
                <h3 className="list-item-card__title">{isKorean ? "약점 요약" : "Weakness summary"}</h3>
                <p className="list-item-card__body">{result.weaknessSummary}</p>
              </article>
            ) : null}
            {result.recommendedNextStep ? (
              <article className="feedback-card feedback-card--neutral">
                <h3 className="list-item-card__title">{isKorean ? "권장 다음 단계" : "Recommended next step"}</h3>
                <p className="list-item-card__body">{result.recommendedNextStep}</p>
              </article>
            ) : null}
          </div>

          <div className="stack-list">
            <PointList items={result.strengthPoints} title={isKorean ? "잘한 점" : "What went well"} tone="positive" />
            <PointList items={result.improvementPoints} title={isKorean ? "보완할 점" : "What to improve"} tone="warning" />
            <PointList items={result.missedPoints} title={isKorean ? "놓친 점" : "What you missed"} tone="neutral" />
          </div>
        </div>
      )}
    </section>
  );
}
