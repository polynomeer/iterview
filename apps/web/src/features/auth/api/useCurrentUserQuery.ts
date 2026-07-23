import { useQuery } from "@tanstack/react-query";
import { getCurrentUserRequest } from "../../../shared/api/authApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import { useAuth } from "../../../shared/auth/useAuth";

export function useCurrentUserQuery() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: ({ signal }) => getCurrentUserRequest(signal),
    enabled: Boolean(accessToken),
    retry: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}
