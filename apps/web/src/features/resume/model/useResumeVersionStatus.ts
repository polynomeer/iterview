import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/api/queryKeys";
import { useResumeVersionDetailQuery } from "../api/useResumeVersionDetailQuery";
import { useResumeVersionExtractionQuery } from "../api/useResumeVersionExtractionQuery";

const RUNNING = new Set(["pending", "processing"]);
const EXTRACTION_SETTLED = new Set(["completed", "failed", "skipped", "fallback"]);

/**
 * Polls one version's parsing and extraction while they run, and refreshes everything that
 * depends on them (resume list, snapshots, the current user's resume state) once they settle.
 * Mount it once per screen; other components can read the same queries without polling.
 */
export function useResumeVersionStatus(versionId: string | null) {
  const queryClient = useQueryClient();
  const versionQuery = useResumeVersionDetailQuery(versionId, true);
  const extractionQuery = useResumeVersionExtractionQuery(versionId, true);
  const parsingStatus = versionQuery.data?.parsingStatus ?? null;
  const extractionStatus = extractionQuery.data?.extractionStatus ?? null;
  const previousParsing = useRef<string | null>(null);
  const previousExtraction = useRef<string | null>(null);

  useEffect(() => {
    const previous = previousParsing.current;
    previousParsing.current = parsingStatus;
    if (previous && RUNNING.has(previous) && (parsingStatus === "completed" || parsingStatus === "failed")) {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.latest }),
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser }),
      ]);
    }
  }, [parsingStatus, queryClient]);

  useEffect(() => {
    const previous = previousExtraction.current;
    previousExtraction.current = extractionStatus;
    if (previous && RUNNING.has(previous) && extractionStatus && EXTRACTION_SETTLED.has(extractionStatus)) {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.latest }),
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.snapshots(versionId ?? "") }),
      ]);
    }
  }, [extractionStatus, queryClient, versionId]);

  const isParsing = parsingStatus !== null && RUNNING.has(parsingStatus);
  const isExtracting = extractionStatus !== null && RUNNING.has(extractionStatus);

  return {
    versionQuery,
    extractionQuery,
    isProcessing: isParsing || isExtracting,
    /** Snapshots exist only after parsing finished and extraction stopped running. */
    canLoadSnapshots: parsingStatus === "completed" && extractionQuery.isFetched && !isExtracting,
  };
}
