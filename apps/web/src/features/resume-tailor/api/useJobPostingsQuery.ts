import { useQuery } from "@tanstack/react-query";
import { mapJobPostingListDtoToModel } from "../../../entities/resume-tailor/model";
import { getJobPostingsRequest } from "../../../shared/api/resumeTailorApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useJobPostingsQuery() {
  return useQuery({
    queryKey: queryKeys.jobPostings.list,
    queryFn: async ({ signal }) => mapJobPostingListDtoToModel(await getJobPostingsRequest(signal)),
  });
}
