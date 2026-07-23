import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../shared/auth/useAuth";

export function useLogout() {
  const queryClient = useQueryClient();
  const { clearSession } = useAuth();

  return () => {
    clearSession();
    queryClient.clear();
  };
}
