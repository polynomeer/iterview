import { useResumeVersionAnalysisQuery } from "./useResumeVersionAnalysisQuery";

export function useActiveResumeAnalysisQuery(activeResumeVersionId: string | null) {
  return useResumeVersionAnalysisQuery(activeResumeVersionId);
}
