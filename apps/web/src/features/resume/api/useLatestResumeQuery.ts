import { useQuery } from "@tanstack/react-query";
import { mapLatestResumeResponseDtoToModel } from "../../../entities/resume/model";
import { getLatestResumeRequest } from "../../../shared/api/resumeApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useLatestResumeQuery() {
  return useQuery({
    queryKey: queryKeys.resumes.latest,
    queryFn: async ({ signal }) =>
      mapLatestResumeResponseDtoToModel(await getLatestResumeRequest(signal)),
  });
}
