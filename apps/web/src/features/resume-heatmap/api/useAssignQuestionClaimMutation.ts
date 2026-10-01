import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/api/queryKeys";
import { assignResumeQuestionClaimRequest } from "../../../shared/api/resumeHeatmapApi";

type Variables = { interviewRecordQuestionId: string; achievementId: string | null };

/** Moves an interview question onto a resume claim, or off all claims, then refreshes the heatmap. */
export function useAssignQuestionClaimMutation(versionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ interviewRecordQuestionId, achievementId }: Variables) =>
      assignResumeQuestionClaimRequest(versionId, interviewRecordQuestionId, achievementId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.heatmapRoot(versionId) }),
        queryClient.invalidateQueries({ queryKey: ["resumes", "heatmap-overlay-targets", versionId] }),
      ]);
    },
  });
}
