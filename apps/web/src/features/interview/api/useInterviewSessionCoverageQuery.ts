import { useQuery } from "@tanstack/react-query";
import { mapInterviewSessionCoverageResponseDtoToModel } from "../../../entities/interview/model";
import { getInterviewSessionCoverageRequest } from "../../../shared/api/interviewApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useInterviewSessionCoverageQuery(sessionId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.interviewSessions.coverage(sessionId ?? ""),
    queryFn: async ({ signal }) =>
      mapInterviewSessionCoverageResponseDtoToModel(
        await getInterviewSessionCoverageRequest(sessionId ?? "", signal),
      ),
    enabled: Boolean(sessionId) && enabled,
  });
}
