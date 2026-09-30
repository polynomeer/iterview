import { getActiveResumeVersion } from "../../../entities/resume/model";
import { useResumeListQuery } from "../api/useResumeListQuery";

/**
 * The one resume version the whole app works against (ADR 0074 Phase 4). Screens read it
 * here instead of offering their own version pickers; the sidebar switcher changes it.
 */
export function useActiveResumeVersion() {
  const resumeListQuery = useResumeListQuery();
  const resumes = resumeListQuery.data?.items ?? [];

  return {
    active: getActiveResumeVersion(resumeListQuery.data),
    resumes,
    hasAnyVersion: resumes.some((resume) => resume.versions.length > 0),
    isLoading: resumeListQuery.isLoading,
    isError: resumeListQuery.isError,
    error: resumeListQuery.error,
    refetch: resumeListQuery.refetch,
  };
}
