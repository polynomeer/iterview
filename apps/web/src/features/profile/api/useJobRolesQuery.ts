import { useQuery } from "@tanstack/react-query";
import { getJobRolesRequest } from "../../../shared/api/authApi";
import { queryKeys } from "../../../shared/api/queryKeys";

/** Job roles a profile can pick; reference data that rarely changes. */
export function useJobRolesQuery() {
  return useQuery({
    queryKey: queryKeys.auth.jobRoles,
    queryFn: ({ signal }) => getJobRolesRequest(signal),
    staleTime: 60 * 60 * 1000,
  });
}
