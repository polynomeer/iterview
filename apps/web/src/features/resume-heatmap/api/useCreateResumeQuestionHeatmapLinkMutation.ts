import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mapResumeQuestionHeatmapLinkDtoToModel } from "../../../entities/resume-heatmap/model";
import { queryKeys } from "../../../shared/api/queryKeys";
import { createResumeQuestionHeatmapLinkRequest } from "../../../shared/api/resumeHeatmapApi";
import type { CreateResumeQuestionHeatmapLinkRequestDto } from "../../../shared/types/resumeHeatmap";

export function useCreateResumeQuestionHeatmapLinkMutation(versionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateResumeQuestionHeatmapLinkRequestDto) =>
      mapResumeQuestionHeatmapLinkDtoToModel(
        await createResumeQuestionHeatmapLinkRequest(versionId ?? "", payload),
      ),
    onSuccess: async () => {
      if (!versionId) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.resumes.heatmapRoot(versionId),
      });
      await queryClient.invalidateQueries({
        queryKey: ["resumes", "heatmap-overlay-targets", versionId],
      });
    },
  });
}
