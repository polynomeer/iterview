import { useQuery } from "@tanstack/react-query";
import { mapArchiveResponseDtoToModel } from "../../../entities/archive/model";
import { getArchiveRequest } from "../../../shared/api/archiveApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import type { ArchiveQueryParams } from "../../../shared/types/archive";

export function useArchiveQuery(params: ArchiveQueryParams) {
  return useQuery({
    queryKey: queryKeys.archive.list(params),
    queryFn: async ({ signal }) => mapArchiveResponseDtoToModel(await getArchiveRequest(params, signal)),
  });
}
