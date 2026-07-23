import { useQuery } from "@tanstack/react-query";
import { mapSkillGapResponseDtoToModel } from "../../../entities/skill-intelligence/model";
import { getSkillGapRequest } from "../../../shared/api/skillApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useSkillGapQuery() {
  return useQuery({
    queryKey: queryKeys.skills.gaps,
    queryFn: async ({ signal }) => mapSkillGapResponseDtoToModel(await getSkillGapRequest(signal)),
  });
}
