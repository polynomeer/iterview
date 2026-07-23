import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { clearStoredAccessToken, getStoredAccessToken, setStoredAccessToken } from "./tokenStorage";

type AuthContextValue = {
  accessToken: string | null;
  isAuthenticated: boolean;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessTokenState] = useState<string | null>(() => getStoredAccessToken());

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === null || event.key === "iterview.access-token") {
        setAccessTokenState(getStoredAccessToken());
      }
    }

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      isAuthenticated: Boolean(accessToken),
      setAccessToken: (nextAccessToken: string) => {
        setStoredAccessToken(nextAccessToken);
        setAccessTokenState(nextAccessToken);
      },
      clearSession: () => {
        clearStoredAccessToken();
        setAccessTokenState(null);
      },
    }),
    [accessToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
