import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadProfileImageRequest } from "../../../shared/api/authApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useUploadProfileImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadProfileImageRequest,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser }),
        queryClient.invalidateQueries({ queryKey: queryKeys.home.root }),
      ]);
    },
  });
}
