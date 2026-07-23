import { useQuery } from "@tanstack/react-query";
import { mapResumeVersionDtoToDetailModel } from "../../../entities/resume/model";
import { getResumeVersionDetailRequest } from "../../../shared/api/resumeApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useResumeVersionDetailQuery(versionId: string | null, shouldPoll = false) {
  return useQuery({
    queryKey: versionId ? queryKeys.resumes.versionDetail(versionId) : [...queryKeys.resumes.root, "version-detail", "inactive"],
    queryFn: async ({ signal }) =>
      mapResumeVersionDtoToDetailModel(await getResumeVersionDetailRequest(versionId ?? "", signal)),
    enabled: Boolean(versionId),
    refetchInterval: (query) => {
      if (!shouldPoll) {
        return false;
      }

      const status = query.state.data?.parsingStatus;

      return status === "pending" || status === "processing" ? 2_500 : false;
    },
  });
}
