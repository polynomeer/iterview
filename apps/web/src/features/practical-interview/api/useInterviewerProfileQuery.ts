import { useQuery } from "@tanstack/react-query";
import { mapInterviewerProfileDtoToModel } from "../../../entities/practical-interview/model";
import { getInterviewerProfileRequest } from "../../../shared/api/practicalInterviewApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useInterviewerProfileQuery(recordId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.interviewRecords.interviewerProfile(recordId ?? ""),
    queryFn: async ({ signal }) =>
      mapInterviewerProfileDtoToModel(await getInterviewerProfileRequest(recordId ?? "", signal)),
    enabled: Boolean(recordId) && enabled,
  });
}
