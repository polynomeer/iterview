import { useQuery } from "@tanstack/react-query";
import { mapJobPostingDtoToModel } from "../../../entities/resume-tailor/model";
import { getJobPostingDetailRequest } from "../../../shared/api/resumeTailorApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useJobPostingDetailQuery(jobPostingId: string | null, enabled = true) {
  return useQuery({
    queryKey: jobPostingId
      ? queryKeys.jobPostings.detail(jobPostingId)
      : [...queryKeys.jobPostings.root, "detail", "inactive"],
    queryFn: async ({ signal }) =>
      mapJobPostingDtoToModel(await getJobPostingDetailRequest(jobPostingId ?? "", signal)),
    enabled: Boolean(jobPostingId) && enabled,
  });
}
