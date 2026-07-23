import { useQuery } from "@tanstack/react-query";
import { mapHomeResponseDtoToModel } from "../../../entities/home/model";
import { getHomeRequest } from "../../../shared/api/homeApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useHomeQuery() {
  return useQuery({
    queryKey: queryKeys.home.detail,
    queryFn: async ({ signal }) => mapHomeResponseDtoToModel(await getHomeRequest(signal)),
  });
}
