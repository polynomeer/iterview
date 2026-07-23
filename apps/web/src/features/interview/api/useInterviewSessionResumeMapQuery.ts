import { useQuery } from "@tanstack/react-query";
import { mapInterviewSessionResumeMapResponseDtoToModel } from "../../../entities/interview/model";
import { getInterviewSessionResumeMapRequest } from "../../../shared/api/interviewApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useInterviewSessionResumeMapQuery(sessionId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.interviewSessions.resumeMap(sessionId ?? ""),
    queryFn: async ({ signal }) =>
      mapInterviewSessionResumeMapResponseDtoToModel(
        await getInterviewSessionResumeMapRequest(sessionId ?? "", signal),
      ),
    enabled: Boolean(sessionId) && enabled,
  });
}
