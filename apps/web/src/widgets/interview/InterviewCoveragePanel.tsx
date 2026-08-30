import { useMemo } from "react";
import type { InterviewCoverageModel, InterviewResumeMapModel } from "../../entities/interview/model";
import { useLocale } from "../../shared/i18n";

type InterviewCoveragePanelProps = {
  coverage: InterviewCoverageModel | null;
  resumeMap: InterviewResumeMapModel | null;
  onJumpToQuestion: (sessionQuestionId: string) => void;
};

export function InterviewCoveragePanel({
  coverage,
  resumeMap,
  onJumpToQuestion,
}: InterviewCoveragePanelProps) {
  const { locale, t } = useLocale();
  const isKorean = locale === "ko";
  const groupedEvidence = useMemo(() => {
    const items = resumeMap?.evidenceItems ?? [];

    return items.reduce<Record<string, InterviewResumeMapModel["evidenceItems"]>>((groups, item) => {
      const key = item.sectionLabel || (isKorean ? "이력서" : "Resume");
      groups[key] ??= [];
      groups[key].push(item);
      return groups;
    }, {});
  }, [isKorean, resumeMap]);

  if (!coverage && !resumeMap) {
    return null;
  }

  const sectionEntries = Object.entries(groupedEvidence);

  return (
    <section className="page-card">
      <span className="page-card__label">{t("interview.coverageLabel")}</span>
      <h2 className="page-card__title">{t("interview.coverageTitle")}</h2>
      <p className="page-card__body">{t("interview.coverageBody")}</p>
      {coverage ? (
        <div
          className="interview-coverage-summary__summary-row"
          role="list"
          aria-label={isKorean ? "범위 패널 요약" : "Coverage panel summary"}
        >
          <span className="interview-coverage-summary__summary-item interview-coverage-summary__summary-item--accent" role="listitem">
            {`${t("interview.coverageMode")} ${coverage.interviewModeLabel}`}
          </span>
          <span className="interview-coverage-summary__summary-item" role="listitem">
            {`${t("interview.overallCoverage")} ${coverage.overallCoveragePercent}%`}
          </span>
          <span className="interview-coverage-summary__summary-item" role="listitem">
            {`${t("interview.defendedCoverage")} ${coverage.defendedCoveragePercent}%`}
          </span>
        </div>
      ) : null}
      {coverage ? (
        <div
          className="interview-coverage-summary__principles"
          role="list"
          aria-label={isKorean ? "범위 패널 원칙" : "Coverage panel principles"}
        >
          <span role="listitem">
            {isKorean
              ? "이 수치는 전체 세션을 다시 설명하려는 용도가 아니라, 다음 복구 레인을 찾기 위한 기준입니다."
              : "Use these numbers to identify the next recovery lane, not to restate the whole session."}
          </span>
          <span role="listitem">
            {isKorean
              ? "근거가 얇다면 이력서 항목에서 연결된 질문으로 바로 이동하세요."
              : "Jump from one resume record straight into its linked question when evidence still feels thin."}
          </span>
        </div>
      ) : null}
      {sectionEntries.length > 0 ? (
        <div className="page-stack">
          {sectionEntries.map(([section, items]) => (
            <section className="page-card page-card--inset" key={section}>
              <div className="section-heading">
                <div>
                  <p className="section-heading__eyebrow">{t("interview.resumeMapLabel")}</p>
                  <h3 className="page-card__title">{section}</h3>
                </div>
                <span className="section-heading__count">{items.length}</span>
              </div>
              <div
                className="interview-coverage-panel__section-summary-row"
                role="list"
                aria-label={isKorean ? `${section} 범위 요약` : `${section} coverage summary`}
              >
                <span className="interview-coverage-panel__section-summary-item" role="listitem">
                  {isKorean ? `근거 ${items.length}개` : `${items.length} evidence item${items.length > 1 ? "s" : ""}`}
                </span>
                <span className="interview-coverage-panel__section-summary-item interview-coverage-panel__section-summary-item--accent" role="listitem">
                  {(() => {
                    const linkedQuestionCount = items.reduce((count, item) => count + item.relatedQuestions.length, 0);

                    return isKorean
                      ? `연결 질문 ${linkedQuestionCount}개`
                      : `${linkedQuestionCount} linked question${linkedQuestionCount !== 1 ? "s" : ""}`;
                  })()}
                </span>
              </div>
              <div className="stack-list">
                {items.map((item) => (
                  <article
                    className="coverage-evidence-card"
                    key={item.id}
                    onClick={() => {
                      const firstQuestion = item.relatedQuestions[0];
                      if (firstQuestion) {
                        onJumpToQuestion(firstQuestion.sessionQuestionId);
                      }
                    }}
                  >
                    <div className="coverage-evidence-card__meta">
                      <span>{item.coverageStatusLabel}</span>
                      <span>{item.sectionLabel}</span>
                      {item.label ? <span>{item.label}</span> : null}
                    </div>
                    <p className="coverage-evidence-card__snippet">"{item.snippet}"</p>
                    {item.relatedQuestions.length > 0 ? (
                      <div className="coverage-evidence-card__related">
                        <span className="coverage-evidence-card__related-label">{t("interview.relatedQuestions")}</span>
                        <div className="page-card__actions">
                          {item.relatedQuestions.map((question) => (
                            <button
                              className="secondary-button"
                              key={question.sessionQuestionId}
                              onClick={(event) => {
                                event.stopPropagation();
                                onJumpToQuestion(question.sessionQuestionId);
                              }}
                              type="button"
                            >
                              {question.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : coverage?.evidenceItems.length ? (
        <div className="stack-list">
          {coverage.evidenceItems.map((item) => (
            <article className="coverage-evidence-card" key={item.id}>
              <div className="coverage-evidence-card__meta">
                <span>{item.sectionLabel}</span>
                <span>{item.coverageStatusLabel}</span>
                {item.label ? <span>{item.label}</span> : null}
              </div>
              <p className="coverage-evidence-card__snippet">"{item.snippet}"</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
