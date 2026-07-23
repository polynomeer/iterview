import { useMemo, useState } from "react";
import type {
  InterviewCoverageModel,
  InterviewResumeMapModel,
  InterviewSessionModel,
} from "../../entities/interview/model";
import type {
  ResumeMappedExperienceModel,
  ResumeMappedProjectModel,
} from "../../entities/resume/model";
import { InterviewQuestionTimeline } from "./InterviewQuestionTimeline";
import { InterviewFacetSummaryPanel } from "./InterviewFacetSummaryPanel";
import { useLocale } from "../../shared/i18n";
import { MetricCard } from "../../shared/ui/MetricCard";

type InterviewFullCoverageResultViewProps = {
  coverage: InterviewCoverageModel;
  resumeMap: InterviewResumeMapModel;
  session: InterviewSessionModel;
  experiences: ResumeMappedExperienceModel[];
  projects: ResumeMappedProjectModel[];
};

type ResumeMapEvidenceItem = InterviewResumeMapModel["evidenceItems"][number];
type AggregatedResumeEvidence = {
  sourceJoinKey: string;
  sectionLabel: string;
  label: string | null;
  coverageTone: ResumeMapEvidenceItem["coverageTone"];
  coverageStatusLabel: string;
  snippets: string[];
  facets: string[];
  relatedQuestions: ResumeMapEvidenceItem["relatedQuestions"];
};

function toStatusBadgeClass(tone: ResumeMapEvidenceItem["coverageTone"]) {
  return `question-status-badge question-status-badge--${tone}`;
}

export function InterviewFullCoverageResultView({
  coverage,
  resumeMap,
  session,
  experiences,
  projects,
}: InterviewFullCoverageResultViewProps) {
  const { t } = useLocale();
  const [pinnedJoinKey, setPinnedJoinKey] = useState<string | null>(null);

  const evidenceByJoinKey = useMemo(() => {
    const next = new Map<string, AggregatedResumeEvidence>();

    resumeMap.evidenceItems.forEach((item) => {
      if (!item.sourceJoinKey) {
        return;
      }

      const existing = next.get(item.sourceJoinKey);

      if (!existing) {
        next.set(item.sourceJoinKey, {
          sourceJoinKey: item.sourceJoinKey,
          sectionLabel: item.sectionLabel,
          label: item.label,
          coverageTone: item.coverageTone,
          coverageStatusLabel: item.coverageStatusLabel,
          snippets: [item.snippet],
          facets: item.facet ? [item.facet] : [],
          relatedQuestions: [...item.relatedQuestions],
        });
        return;
      }

      existing.snippets.push(item.snippet);
      if (item.facet && !existing.facets.includes(item.facet)) {
        existing.facets.push(item.facet);
      }
      item.relatedQuestions.forEach((question) => {
        if (!existing.relatedQuestions.some((candidate) => candidate.sessionQuestionId === question.sessionQuestionId)) {
          existing.relatedQuestions.push(question);
        }
      });
    });

    return next;
  }, [resumeMap.evidenceItems]);

  const pinnedEvidence = pinnedJoinKey ? evidenceByJoinKey.get(pinnedJoinKey) ?? null : null;

  const sortedPinnedQuestions = useMemo(
    () => [...(pinnedEvidence?.relatedQuestions ?? [])].sort((left, right) => left.orderIndex - right.orderIndex),
    [pinnedEvidence],
  );

  function jumpToSessionQuestion(sessionQuestionId: string) {
    const target = document.getElementById(`session-question-card-${sessionQuestionId}`);
    target?.scrollIntoView?.({ behavior: "smooth", block: "center" });
  }

  return (
    <section className="interview-result-coverage-layout">
      <div className="interview-result-coverage-layout__viewer">
        <section className="page-card">
          <span className="page-card__label">{t("interview.coverageSummaryLabel")}</span>
          <h2 className="page-card__title">{t("interview.coverageSummaryTitle")}</h2>
          <p className="page-card__body">{t("interview.coverageSummaryBody")}</p>
          <div className="stats-grid">
            <MetricCard label={t("interview.overallCoverage")} tone="accent" value={`${coverage.overallCoveragePercent}%`} />
            <MetricCard label={t("interview.defendedCoverage")} tone="muted" value={`${coverage.defendedCoveragePercent}%`} />
            <MetricCard label={t("interview.metricQuestion")} tone="muted" value={String(session.summary.totalQuestions)} />
            <MetricCard label={t("interview.metricAnswered")} tone="muted" value={String(session.summary.answeredQuestions)} />
            <MetricCard label={t("interview.metricSkipped")} tone="muted" value={String(session.summary.skippedQuestions)} />
            <MetricCard label={t("interview.metricRemaining")} tone="muted" value={String(session.summary.remainingQuestions)} />
          </div>
        </section>

        <div className="interview-facet-panels">
          <InterviewFacetSummaryPanel
            emptyMessage={t("interview.noFacetSummaries")}
            eyebrow={t("interview.weakFacetRecovery")}
            helperText={t("interview.weakFacetRecovery")}
            items={coverage.weakFacetSummaries}
            title={t("interview.weakFacetRecovery")}
            tone="warning"
          />
          <InterviewFacetSummaryPanel
            emptyMessage={t("interview.noFacetSummaries")}
            eyebrow={t("interview.skippedFacetRecovery")}
            helperText={t("interview.skippedFacetRecovery")}
            items={coverage.skippedFacetSummaries}
            title={t("interview.skippedFacetRecovery")}
            tone="accent"
          />
        </div>

        <section className="page-card">
          <div className="section-heading">
            <div>
              <p className="section-heading__eyebrow">{t("interview.experienceEyebrow")}</p>
              <h2 className="page-card__title">{t("interview.experienceTitle")}</h2>
            </div>
            <span className="section-heading__count">{experiences.length}</span>
          </div>
          {experiences.length === 0 ? (
            <p className="page-card__body">{t("interview.experienceEmpty")}</p>
          ) : (
            <div className="stack-list">
              {experiences.map((experience) => {
                const evidence = evidenceByJoinKey.get(experience.sourceJoinKey) ?? null;

                return (
                  <button
                    className={`resume-result-block ${evidence ? `resume-result-block--${evidence.coverageTone}` : ""} ${
                      pinnedEvidence?.sourceJoinKey === evidence?.sourceJoinKey ? "resume-result-block--selected" : ""
                    }`}
                    key={experience.id}
                    onClick={() => {
                      setPinnedJoinKey(evidence?.sourceJoinKey ?? null);
                    }}
                    type="button"
                  >
                    <div className="resume-result-block__header">
                      <div>
                        <h3 className="resume-result-block__title">
                          {[experience.companyName, experience.roleName].filter(Boolean).join(" · ")}
                        </h3>
                        <p className="resume-result-block__meta">
                          {[experience.employmentType, experience.dateLabel].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      {evidence ? (
                        <span className={toStatusBadgeClass(evidence.coverageTone)}>
                          {evidence.coverageStatusLabel}
                        </span>
                      ) : (
                        <span className="question-status-badge question-status-badge--neutral">{t("interview.unmapped")}</span>
                      )}
                    </div>
                    <p className="resume-result-block__body">{experience.summary}</p>
                    {experience.impactText ? (
                      <p className="resume-result-block__helper">{experience.impactText}</p>
                    ) : null}
                    {evidence ? (
                      <div className="resume-result-block__evidence">
                        <span className="page-card__label">{t("interview.matchedEvidence")}</span>
                        <p className="resume-result-block__snippet">"{evidence.snippets[0]}"</p>
                        {evidence.snippets.length > 1 ? (
                          <p className="resume-section__helper">
                            {evidence.snippets.length - 1} {t("interview.moreResumeSnippetsSuffix")}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                    {evidence && evidence.relatedQuestions.length > 0 ? (
                      <div className="resume-result-block__preview">
                        <span className="resume-result-block__preview-label">{t("interview.relatedQuestions")}</span>
                        {evidence.relatedQuestions.slice(0, 2).map((question) => (
                          <p className="resume-result-block__preview-item" key={question.sessionQuestionId}>
                            {question.sourceLabel} · {question.title}
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="page-card">
          <div className="section-heading">
            <div>
              <p className="section-heading__eyebrow">{t("interview.projectEyebrow")}</p>
              <h2 className="page-card__title">{t("interview.projectTitle")}</h2>
            </div>
            <span className="section-heading__count">{projects.length}</span>
          </div>
          {projects.length === 0 ? (
            <p className="page-card__body">{t("interview.projectEmpty")}</p>
          ) : (
            <div className="stack-list">
              {projects.map((project) => {
                const evidence = evidenceByJoinKey.get(project.sourceJoinKey) ?? null;

                return (
                  <button
                    className={`resume-result-block ${evidence ? `resume-result-block--${evidence.coverageTone}` : ""} ${
                      pinnedEvidence?.sourceJoinKey === evidence?.sourceJoinKey ? "resume-result-block--selected" : ""
                    }`}
                    key={project.id}
                    onClick={() => {
                      setPinnedJoinKey(evidence?.sourceJoinKey ?? null);
                    }}
                    type="button"
                  >
                    <div className="resume-result-block__header">
                      <div>
                        <h3 className="resume-result-block__title">{project.title}</h3>
                        <p className="resume-result-block__meta">
                          {[project.organizationName, project.roleName, project.dateLabel].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      {evidence ? (
                        <span className={toStatusBadgeClass(evidence.coverageTone)}>
                          {evidence.coverageStatusLabel}
                        </span>
                      ) : (
                        <span className="question-status-badge question-status-badge--neutral">{t("interview.unmapped")}</span>
                      )}
                    </div>
                    {project.categoryName ? (
                      <div className="chip-list">
                        <span className="detail-chip detail-chip--accent">{project.categoryName}</span>
                      </div>
                    ) : null}
                    <p className="resume-result-block__body">{project.summary}</p>
                    {project.contentText ? (
                      <p className="resume-result-block__helper">{project.contentText}</p>
                    ) : null}
                    {project.tags.length > 0 ? (
                      <div className="chip-list">
                        {project.tags.map((tag) => (
                          <span className="detail-chip" key={tag.id}>
                            {tag.type ? `${tag.label} · ${tag.type}` : tag.label}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {evidence ? (
                      <div className="resume-result-block__evidence">
                        <span className="page-card__label">{t("interview.matchedEvidence")}</span>
                        <p className="resume-result-block__snippet">"{evidence.snippets[0]}"</p>
                        {evidence.snippets.length > 1 ? (
                          <p className="resume-section__helper">
                            {evidence.snippets.length - 1} {t("interview.moreResumeSnippetsSuffix")}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                    {evidence && evidence.relatedQuestions.length > 0 ? (
                      <div className="resume-result-block__preview">
                        <span className="resume-result-block__preview-label">{t("interview.relatedQuestions")}</span>
                        {evidence.relatedQuestions.slice(0, 2).map((question) => (
                          <p className="resume-result-block__preview-item" key={question.sessionQuestionId}>
                            {question.sourceLabel} · {question.title}
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <div className="interview-result-coverage-layout__side">
        <section className="page-card">
          <span className="page-card__label">{t("interview.pinnedQuestions")}</span>
          <h2 className="page-card__title">{t("interview.resumeEvidenceMapping")}</h2>
          {pinnedEvidence ? (
            <div className="stack-list">
              <div className="list-item-card">
                <div className="list-item-card__content">
                  <div className="list-item-card__meta">
                    <span>{pinnedEvidence.sectionLabel}</span>
                    <span>{pinnedEvidence.coverageStatusLabel}</span>
                    {pinnedEvidence.label ? <span>{pinnedEvidence.label}</span> : null}
                    {pinnedEvidence.facets.length > 0 ? <span>{pinnedEvidence.facets.join(", ")}</span> : null}
                  </div>
                  <div className="stack-list">
                    {pinnedEvidence.snippets.map((snippet, index) => (
                      <p className="resume-result-block__snippet" key={`${pinnedEvidence.sourceJoinKey}-snippet-${index}`}>
                        "{snippet}"
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              {pinnedEvidence.relatedQuestions.length > 0 ? (
                <div className="stack-list">
                  {sortedPinnedQuestions.map((question) => (
                    <button
                      className={`list-item-card interview-result-related-question ${
                        question.isFollowUp ? "interview-result-related-question--follow-up" : ""
                      }`}
                      key={question.sessionQuestionId}
                      onClick={() => {
                        jumpToSessionQuestion(question.sessionQuestionId);
                      }}
                      type="button"
                    >
                      <div className="list-item-card__content">
                        <div className="list-item-card__meta">
                          <span>#{question.orderIndex + 1}</span>
                          <span>{question.sourceLabel}</span>
                          <span>{question.status}</span>
                          {question.isFollowUp ? (
                            <span className="question-status-badge question-status-badge--accent">Follow-up</span>
                          ) : null}
                        </div>
                        <h3 className="list-item-card__title">{question.title}</h3>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="page-card__body">No related interview questions were returned for this evidence block.</p>
              )}
            </div>
          ) : (
            <p className="page-card__body">
              Hover a highlighted resume block for a quick preview, then click it to pin all related questions here.
            </p>
          )}
        </section>

        <InterviewQuestionTimeline currentQuestionId={null} items={session.questions} />
      </div>
    </section>
  );
}
