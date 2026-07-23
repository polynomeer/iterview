import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signupRequest } from "../../../shared/api/authApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import { useAuth } from "../../../shared/auth/useAuth";

export function useSignupMutation() {
  const queryClient = useQueryClient();
  const { setAccessToken } = useAuth();

  return useMutation({
    mutationFn: signupRequest,
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
