import { useQuery } from "@tanstack/react-query";
import { mapResumeVersionExtractionDtoToModel } from "../../../entities/resume/model";
import { getResumeVersionExtractionRequest } from "../../../shared/api/resumeApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useResumeVersionExtractionQuery(versionId: string | null, shouldPoll = false) {
  return useQuery({
    queryKey: versionId
      ? queryKeys.resumes.extraction(versionId)
      : [...queryKeys.resumes.root, "extraction", "inactive"],
    queryFn: async ({ signal }) =>
      mapResumeVersionExtractionDtoToModel(await getResumeVersionExtractionRequest(versionId ?? "", signal)),
    enabled: Boolean(versionId),
    refetchInterval: (query) => {
      if (!shouldPoll) {
        return false;
      }

      const rawStatus = query.state.data?.rawParsingStatus;
      const extractionStatus = query.state.data?.extractionStatus;

      if (rawStatus === "pending" || rawStatus === "processing") {
        return 2_500;
      }

      return extractionStatus === "pending" || extractionStatus === "processing" ? 2_500 : false;
    },
  });
}
