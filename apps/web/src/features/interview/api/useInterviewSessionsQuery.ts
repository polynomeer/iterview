import { useQuery } from "@tanstack/react-query";
import { mapInterviewSessionListResponseDtoToModel } from "../../../entities/interview/model";
import { getInterviewSessionsRequest } from "../../../shared/api/interviewApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useInterviewSessionsQuery() {
  return useQuery({
    queryKey: queryKeys.interviewSessions.list,
    queryFn: async ({ signal }) =>
      mapInterviewSessionListResponseDtoToModel(await getInterviewSessionsRequest(signal)),
  });
}
