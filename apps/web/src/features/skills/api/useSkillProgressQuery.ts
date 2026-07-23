import { useQuery } from "@tanstack/react-query";
import { mapSkillProgressResponseDtoToModel } from "../../../entities/skill-intelligence/model";
import { getSkillProgressRequest } from "../../../shared/api/skillApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useSkillProgressQuery() {
  return useQuery({
    queryKey: queryKeys.skills.progress,
    queryFn: async ({ signal }) =>
      mapSkillProgressResponseDtoToModel(await getSkillProgressRequest(signal)),
  });
}
