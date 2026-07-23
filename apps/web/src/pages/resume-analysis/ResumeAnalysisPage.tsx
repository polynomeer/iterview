import { getActiveResumeVersion } from "../../entities/resume/model";
import { useActiveResumeAnalysisQuery } from "../../features/resume/api/useActiveResumeAnalysisQuery";
import { useLatestResumeQuery } from "../../features/resume/api/useLatestResumeQuery";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { ApiClientError, getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import {
  ActiveResumeOverviewCard,
  ResumeExperienceList,
  ResumeRiskList,
  ResumeSkillsCard,
} from "../../widgets/resume";

export function ResumeAnalysisPage() {
  const resumeListQuery = useResumeListQuery();
  const latestResumeQuery = useLatestResumeQuery();
  const effectiveResumeList = latestResumeQuery.data ?? resumeListQuery.data;
  const activeResumeVersion = getActiveResumeVersion(effectiveResumeList);
  const analysisQuery = useActiveResumeAnalysisQuery(activeResumeVersion?.id ?? null);
  const isAnalysisUnavailable =
    analysisQuery.error instanceof ApiClientError && analysisQuery.error.status === 404;

  return (
    <PageContainer
      description="Review parsed resume insights, extracted evidence, and risk signals around the active resume version."
      eyebrow="Resume Analysis"
      title="Resume intelligence"
    >
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
          <ActiveResumeOverviewCard resumeList={effectiveResumeList} />

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
            <>
              <ResumeSkillsCard skills={analysisQuery.data.skills} />
              <ResumeExperienceList experiences={analysisQuery.data.experiences} />
              <ResumeRiskList risks={analysisQuery.data.risks} />
            </>
          ) : null}
        </div>
      ) : null}
    </PageContainer>
  );
}
