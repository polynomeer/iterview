import { useQuery } from "@tanstack/react-query";
import { mapFeedResponseDtoToModel } from "../../../entities/feed/model";
import { getFeedRequest } from "../../../shared/api/feedApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useFeedQuery() {
  return useQuery({
    queryKey: queryKeys.feed.detail,
    queryFn: async ({ signal }) => mapFeedResponseDtoToModel(await getFeedRequest(signal)),
  });
}
