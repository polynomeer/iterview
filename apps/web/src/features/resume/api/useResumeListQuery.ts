import { useQuery } from "@tanstack/react-query";
import { mapResumeListResponseDtoToModel } from "../../../entities/resume/model";
import { getResumesRequest } from "../../../shared/api/resumeApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useResumeListQuery() {
  return useQuery({
    queryKey: queryKeys.resumes.list,
    queryFn: async ({ signal }) => mapResumeListResponseDtoToModel(await getResumesRequest(signal)),
  });
}
