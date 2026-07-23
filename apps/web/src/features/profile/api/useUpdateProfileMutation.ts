import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfileRequest } from "../../../shared/api/authApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileRequest,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser }),
        queryClient.invalidateQueries({ queryKey: queryKeys.home.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.feed.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.skills.root }),
      ]);
    },
  });
}
