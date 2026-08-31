import type { ResultAnalysisModel } from "../../entities/result/model";
import { useLocale } from "../../shared/i18n";

type ModelAnswerSectionProps = {
  result: ResultAnalysisModel;
};

export function ModelAnswerSection({ result }: ModelAnswerSectionProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  if (!result.modelAnswer) {
    return null;
  }

  return (
    <section className="page-card result-analysis-section-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "모범 답변" : "Model answer"}</p>
          <h2 className="page-card__title">{isKorean ? "권장 강답안" : "Suggested strong answer"}</h2>
        </div>
      </div>
      <div className="result-model-answer">
        <div className="list-item-card__meta">
          <span>{result.modelAnswer.sourceType}</span>
          {result.modelAnswer.contentLocale ? <span>{result.modelAnswer.contentLocale.toUpperCase()}</span> : null}
          {result.modelAnswer.llmModel ? <span>{result.modelAnswer.llmModel}</span> : null}
        </div>
        <p className="result-model-answer__body">{result.modelAnswer.text}</p>
      </div>
    </section>
  );
}
