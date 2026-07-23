import { useMemo } from "react";
import type { InterviewCoverageModel, InterviewResumeMapModel } from "../../entities/interview/model";
import { useLocale } from "../../shared/i18n";
import { MetricCard } from "../../shared/ui/MetricCard";

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
  const { t } = useLocale();
  const groupedEvidence = useMemo(() => {
    const items = resumeMap?.evidenceItems ?? [];

    return items.reduce<Record<string, InterviewResumeMapModel["evidenceItems"]>>((groups, item) => {
      const key = item.sectionLabel || "Resume";
      groups[key] ??= [];
      groups[key].push(item);
      return groups;
    }, {});
  }, [resumeMap]);

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
        <div className="stats-grid">
          <MetricCard label={t("interview.coverageMode")} tone="accent" value={coverage.interviewModeLabel} />
          <MetricCard label={t("interview.overallCoverage")} tone="muted" value={`${coverage.overallCoveragePercent}%`} />
          <MetricCard label={t("interview.defendedCoverage")} tone="muted" value={`${coverage.defendedCoveragePercent}%`} />
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
