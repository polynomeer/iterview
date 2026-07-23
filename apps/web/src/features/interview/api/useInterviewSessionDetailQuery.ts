import { useQuery } from "@tanstack/react-query";
import { mapInterviewSessionDetailResponseDtoToModel } from "../../../entities/interview/model";
import { getInterviewSessionDetailRequest } from "../../../shared/api/interviewApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useInterviewSessionDetailQuery(sessionId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.interviewSessions.detail(sessionId ?? ""),
    queryFn: async ({ signal }) =>
      mapInterviewSessionDetailResponseDtoToModel(
        await getInterviewSessionDetailRequest(sessionId ?? "", signal),
      ),
    enabled: Boolean(sessionId),
  });
}
