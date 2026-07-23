import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mapJobPostingDtoToModel } from "../../../entities/resume-tailor/model";
import { queryKeys } from "../../../shared/api/queryKeys";
import { createJobPostingRequest } from "../../../shared/api/resumeTailorApi";
import type { CreateJobPostingRequestDto } from "../../../shared/types/resumeTailor";

export function useCreateJobPostingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateJobPostingRequestDto) =>
      mapJobPostingDtoToModel(await createJobPostingRequest(payload)),
    onSuccess: async (jobPosting) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.jobPostings.list }),
        queryClient.invalidateQueries({ queryKey: queryKeys.jobPostings.detail(jobPosting.id) }),
      ]);
    },
  });
}
