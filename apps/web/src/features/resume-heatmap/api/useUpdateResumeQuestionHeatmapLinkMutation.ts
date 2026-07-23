import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mapResumeQuestionHeatmapLinkDtoToModel } from "../../../entities/resume-heatmap/model";
import { queryKeys } from "../../../shared/api/queryKeys";
import { updateResumeQuestionHeatmapLinkRequest } from "../../../shared/api/resumeHeatmapApi";
import type { UpdateResumeQuestionHeatmapLinkRequestDto } from "../../../shared/types/resumeHeatmap";

type Params = {
  linkId: string;
  payload: UpdateResumeQuestionHeatmapLinkRequestDto;
};

export function useUpdateResumeQuestionHeatmapLinkMutation(versionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId, payload }: Params) =>
      mapResumeQuestionHeatmapLinkDtoToModel(
        await updateResumeQuestionHeatmapLinkRequest(versionId ?? "", linkId, payload),
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
