import { Link } from "react-router-dom";
import { getActiveResumeVersion } from "../../entities/resume/model";
import { useActiveResumeAnalysisQuery } from "../../features/resume/api/useActiveResumeAnalysisQuery";
import { useLatestResumeQuery } from "../../features/resume/api/useLatestResumeQuery";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { ApiClientError, getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { useLayoutMode } from "../../shared/ui/layout";
import { PageContainer } from "../../shared/ui/PageContainer";
import { WorkspaceContinuityRail } from "../../shared/ui/WorkspaceContinuityRail";
import {
  ActiveResumeOverviewCard,
  ResumeExperienceList,
  ResumeRiskList,
  ResumeSkillsCard,
} from "../../widgets/resume";

export function ResumeAnalysisPage() {
  const resumeListQuery = useResumeListQuery();
  const latestResumeQuery = useLatestResumeQuery();
  const { isDesktop } = useLayoutMode();
  const effectiveResumeList = latestResumeQuery.data ?? resumeListQuery.data;
  const activeResumeVersion = getActiveResumeVersion(effectiveResumeList);
  const analysisQuery = useActiveResumeAnalysisQuery(activeResumeVersion?.id ?? null);
  const isAnalysisUnavailable =
    analysisQuery.error instanceof ApiClientError && analysisQuery.error.status === 404;

  return (
    <PageContainer
      actions={
        <Link className="secondary-button" to={routeConfig.resume.buildPath()}>
          Open resume workspace
        </Link>
      }
      description="Review the active resume as source of truth, then find the claims that need stronger evidence before interview follow-ups begin."
      eyebrow="Source review"
      title="Inspect resume source of truth"
    >
      <WorkspaceContinuityRail
        current={{
          title: "Resume source-of-truth review",
          description: "Find which active resume claims still lack enough evidence to survive follow-up pressure.",
        }}
        downstream={[
          {
            title: "Resume editor",
            description: "Rewrite the thin claim once the risk is clear.",
            to: activeResumeVersion
              ? routeConfig.resumeEditor.buildPath({ versionId: activeResumeVersion.id })
              : routeConfig.resume.buildPath(),
          },
          {
            title: "Interview launcher",
            description: "Start a mock only after the source claim is strong enough to defend.",
            to: routeConfig.interview.buildPath(),
          },
        ]}
        upstream={[
          {
            title: "Weak nodes",
            description: "Come back here when a failing branch points to a weak resume claim.",
            to: routeConfig.weakNodes.buildPath(),
          },
        ]}
      />
      {resumeListQuery.isLoading && latestResumeQuery.isLoading ? (
        <LoadingStateCard
          body="Loading resume containers and the active version before opening analysis."
          title="Preparing resume intelligence"
        />
      ) : null}

      {resumeListQuery.isError && latestResumeQuery.isError ? (
        <ErrorStateCard
          body={
            resumeListQuery.error instanceof Error
              ? resumeListQuery.error.message
              : "The resume list could not be loaded."
          }
          details={getErrorDetails(resumeListQuery.error)}
          onAction={() => {
            void resumeListQuery.refetch();
          }}
          title="Unable to load resume analysis"
        />
      ) : null}

      {!(resumeListQuery.isLoading && latestResumeQuery.isLoading) &&
      !(resumeListQuery.isError && latestResumeQuery.isError) &&
      effectiveResumeList ? (
        <div className="page-stack">
          {!activeResumeVersion ? (
            <EmptyStateCard
              action={{
                label: "Open resume management",
                to: routeConfig.resume.buildPath(),
              }}
              body="Activate a resume version first so parsed skills, experiences, and risks have a clear source of truth."
              title="No active resume version"
            />
          ) : analysisQuery.isLoading ? (
            <LoadingStateCard
              body="Loading extracted skills, experiences, and risk signals for the active version."
              title="Analyzing active resume"
            />
          ) : isAnalysisUnavailable ? (
            <EmptyStateCard
              action={{
                label: "Back to resumes",
                to: routeConfig.resume.buildPath(),
              }}
              body="Resume analysis is not available from the backend yet. The active-version overview remains available, and the rest of the learning flow stays unblocked."
              title="Resume analysis is not supported yet"
            />
          ) : analysisQuery.isError ? (
            <ErrorStateCard
              body={
                analysisQuery.error instanceof Error
                  ? analysisQuery.error.message
                  : "Resume analysis could not be loaded."
              }
              details={getErrorDetails(analysisQuery.error)}
              onAction={() => {
                void analysisQuery.refetch();
              }}
              title="Unable to load resume insights"
            />
          ) : analysisQuery.data ? (
            (() => {
              const highRiskCount = analysisQuery.data.risks.filter((risk) =>
                risk.severityLabel.toLowerCase().includes("high"),
              ).length;
              const workspaceSummary = (
                <section className="page-card resume-analysis-workspace-surface">
                  <div className="resume-analysis-workspace-surface__header">
                    <div className="resume-analysis-workspace-surface__intro">
                      <div className="resume-analysis-workspace-surface__eyebrow-row">
                        <span className="page-card__label">Source of truth</span>
                        <span className="question-status-badge question-status-badge--accent">Defense lane</span>
                      </div>
                      <p className="resume-analysis-workspace-surface__breadcrumbs">
                        Source claim quality
                        <span>/</span>
                        Evidence density
                        <span>/</span>
                        Follow-up survivability
                      </p>
                      <h2 className="resume-analysis-workspace-surface__title">
                        Check whether the active resume can survive DFS follow-up pressure
                      </h2>
                      <p className="resume-analysis-workspace-surface__body">
                        Use this page to find thin claims, weak evidence blocks, and the exact resume sections that need stronger grounding before an interview session drills into them.
                      </p>
                    </div>
                    <div className="resume-analysis-workspace-surface__stats">
                      <article className="resume-analysis-workspace-surface__stat">
                        <span>Skills mapped</span>
                        <strong>{analysisQuery.data.skills.length}</strong>
                      </article>
                      <article className="resume-analysis-workspace-surface__stat">
                        <span>Experience blocks</span>
                        <strong>{analysisQuery.data.experiences.length}</strong>
                      </article>
                      <article className="resume-analysis-workspace-surface__stat">
                        <span>Defense risks</span>
                        <strong>{analysisQuery.data.risks.length}</strong>
                      </article>
                      <article className="resume-analysis-workspace-surface__stat">
                        <span>High-risk claims</span>
                        <strong>{highRiskCount}</strong>
                      </article>
                    </div>
                  </div>
                  <div className="resume-analysis-workspace-surface__chips">
                    <span className="detail-chip">{activeResumeVersion.versionNumberLabel}</span>
                    <span className="detail-chip detail-chip--accent">{activeResumeVersion.parsingStatusLabel}</span>
                    <span className="detail-chip">{activeResumeVersion.extractionStatusLabel}</span>
                    <span className="detail-chip">{activeResumeVersion.fileNameLabel}</span>
                  </div>
                  <div className="resume-analysis-workspace-surface__guidance">
                    <article className="resume-analysis-workspace-surface__guidance-card">
                      <span>First read</span>
                      <strong>Start with the claim most likely to fail under concrete trade-off questions.</strong>
                    </article>
                    <article className="resume-analysis-workspace-surface__guidance-card">
                      <span>Repair order</span>
                      <strong>Fix thin source text before running another mock session.</strong>
                    </article>
                  </div>
                </section>
              );

              return (
                <div className={`resume-analysis-layout ${isDesktop ? "resume-analysis-layout--desktop" : "resume-analysis-layout--mobile"}`}>
                  <section className="resume-analysis-layout__workspace-summary">{workspaceSummary}</section>
                  <div className="resume-analysis-layout__main page-stack">
                    <section className="page-card resume-analysis-priority-card">
                      <div className="section-heading">
                        <div>
                          <p className="section-heading__eyebrow">Priority read</p>
                          <h2 className="page-card__title">Start with the claims most likely to fail under follow-up</h2>
                        </div>
                      </div>
                      <div className="resume-analysis-priority-card__signals">
                        <article className="resume-analysis-priority-card__signal">
                          <span>Immediate fix target</span>
                          <strong>
                            {analysisQuery.data.risks[0]
                              ? `Focus: ${analysisQuery.data.risks[0].title}`
                              : "No urgent claim risk detected"}
                          </strong>
                        </article>
                        <article className="resume-analysis-priority-card__signal">
                          <span>Evidence coverage</span>
                          <strong>
                            {analysisQuery.data.experiences.length > 0
                              ? `${analysisQuery.data.experiences.length} experience blocks are ready for drill-down`
                              : "No extracted experience blocks yet"}
                          </strong>
                        </article>
                      </div>
                      <div className="resume-analysis-priority-card__playbook">
                        <article className="resume-analysis-priority-card__playbook-step">
                          <span>1. Pick the weakest claim</span>
                          <strong>
                            {analysisQuery.data.risks[0]
                              ? `Rework "${analysisQuery.data.risks[0].title}" until it can be defended with one concrete example`
                              : "No urgent claim failure is blocking the next mock pass"}
                          </strong>
                        </article>
                        <article className="resume-analysis-priority-card__playbook-step">
                          <span>2. Trace the evidence</span>
                          <strong>Make sure the supporting experience block contains metrics, constraints, and decisions.</strong>
                        </article>
                      </div>
                    </section>
                    <ResumeRiskList risks={analysisQuery.data.risks} />
                    <ResumeExperienceList experiences={analysisQuery.data.experiences} />
                    <ResumeSkillsCard skills={analysisQuery.data.skills} />
                  </div>
                  <aside className="resume-analysis-layout__rail page-stack">
                    <ActiveResumeOverviewCard resumeList={effectiveResumeList} />
                    <section className="page-card section-panel section-panel--muted resume-analysis-guide">
                      <span className="page-card__label">Defense guide</span>
                      <h2 className="page-card__title">Read this analysis like interview pressure</h2>
                      <p className="page-card__body">
                        A strong resume source of truth is one where every highlighted claim can expand into concrete decisions, constraints, metrics, and trade-offs when the question tree keeps drilling deeper.
                      </p>
                      <div className="resume-analysis-guide__signals">
                        <article className="resume-analysis-guide__signal">
                          <span>Immediate repair target</span>
                          <strong>
                            {analysisQuery.data.risks[0]
                              ? analysisQuery.data.risks[0].title
                              : "No high-priority claim repair is currently flagged"}
                          </strong>
                        </article>
                        <article className="resume-analysis-guide__signal">
                          <span>Before next interview</span>
                          <strong>Make the risky claim and its evidence block readable without extra explanation.</strong>
                        </article>
                      </div>
                      <div className="resume-analysis-guide__rules">
                        <div className="resume-analysis-guide__rule">
                          <strong>1. Find vague claims first</strong>
                          <span>Risk items usually point to claims that sound impressive but collapse under detail.</span>
                        </div>
                        <div className="resume-analysis-guide__rule">
                          <strong>2. Check the evidence block</strong>
                          <span>Experiences and parsed skills should expose enough context to explain how the claim happened.</span>
                        </div>
                        <div className="resume-analysis-guide__rule">
                          <strong>3. Repair before mock practice</strong>
                          <span>Tighten the source text before spending another session on weak inputs.</span>
                        </div>
                      </div>
                      <div className="page-card__actions">
                        <Link
                          className="secondary-button"
                          to={routeConfig.resumeEditor.buildPath({ versionId: activeResumeVersion.id })}
                        >
                          Edit source of truth
                        </Link>
                        <Link className="primary-button" to={routeConfig.resume.buildPath()}>
                          Review active resume
                        </Link>
                      </div>
                    </section>
                  </aside>
                </div>
              );
            })()
          ) : null}
        </div>
      ) : null}
    </PageContainer>
  );
}
