import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginRequest } from "../../../shared/api/authApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import { useAuth } from "../../../shared/auth/useAuth";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const { setAccessToken } = useAuth();

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: async (response) => {
      setAccessToken(response.accessToken);
      queryClient.removeQueries({ queryKey: queryKeys.auth.currentUser });
      await queryClient.resetQueries({
        predicate: (query) => query.queryKey[0] !== queryKeys.auth.root[0],
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser });
    },
  });
}
