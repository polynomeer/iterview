import type { ResultAnalysisModel } from "../../entities/result/model";

type ModelAnswerSectionProps = {
  result: ResultAnalysisModel;
};

export function ModelAnswerSection({ result }: ModelAnswerSectionProps) {
  if (!result.modelAnswer) {
    return null;
  }

  return (
    <section className="page-card result-analysis-section-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Model answer</p>
          <h2 className="page-card__title">Suggested strong answer</h2>
          <p className="page-card__body">
            Compare this against your own answer structure instead of copying sentences directly.
          </p>
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
