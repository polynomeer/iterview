import { Navigate } from "react-router-dom";
import { useActiveResumeVersion } from "../../features/resume/model/useActiveResumeVersion";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { PageSkeleton } from "../../shared/ui/primitives";

/** /resume/tailor and its old job-postings page now live in the active version's 공고 맞춤 tab. */
export function ResumeTailorRedirect() {
  const { t } = useLocale();
  const { active, resumes, isLoading } = useActiveResumeVersion();

  if (isLoading) {
    return <PageSkeleton label={t("resumeTailor.openingJobFit")} />;
  }

  const target = active ?? resumes.flatMap((resume) => resume.versions)[0];
  return <Navigate replace to={target ? routeConfig.resumeTailorAnalysisList.buildPath({ versionId: target.id }) : routeConfig.resume.buildPath()} />;
}
