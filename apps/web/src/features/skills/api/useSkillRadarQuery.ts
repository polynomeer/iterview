import { useQuery } from "@tanstack/react-query";
import { mapSkillRadarResponseDtoToModel } from "../../../entities/skill-intelligence/model";
import { getSkillRadarRequest } from "../../../shared/api/skillApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useSkillRadarQuery() {
  return useQuery({
    queryKey: queryKeys.skills.radar,
    queryFn: async ({ signal }) => mapSkillRadarResponseDtoToModel(await getSkillRadarRequest(signal)),
  });
}
