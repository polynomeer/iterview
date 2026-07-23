import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSettingsRequest } from "../../../shared/api/authApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSettingsRequest,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser }),
        queryClient.invalidateQueries({ queryKey: queryKeys.home.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.skills.root }),
      ]);
    },
  });
}
