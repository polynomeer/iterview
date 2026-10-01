import { useQuery } from "@tanstack/react-query";
import { getLibraryRequest } from "../../../shared/api/libraryApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useLibraryQuery() {
  return useQuery({
    queryKey: queryKeys.library.root,
    queryFn: ({ signal }) => getLibraryRequest(signal),
  });
}
