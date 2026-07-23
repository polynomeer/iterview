import { useCallback, useEffect, useRef, useState, type PropsWithChildren } from "react";
import { ApiClientError } from "../../shared/api/errors";
import { AuthLoadingScreen } from "../../shared/ui/AuthLoadingScreen";
import { AuthRecoveryScreen } from "../../shared/ui/AuthRecoveryScreen";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useAuth } from "../../shared/auth/useAuth";
import { useLocale, normalizeAppLocale } from "../../shared/i18n";
import { useLogout } from "../../features/auth/useLogout";

const MAX_AUTO_RESTORE_ATTEMPTS = 3;
const AUTO_RESTORE_DELAY_MS = 2_500;
const MIN_INITIAL_LOADING_MS = 2_200;
type RestorePhase = "initial-loading" | "retrying" | "paused" | "ready";

export function AuthBootstrap({ children }: PropsWithChildren) {
  const { accessToken } = useAuth();
  const currentUserQuery = useCurrentUserQuery();
  const logout = useLogout();
  const { locale, setLocale } = useLocale();
  const retryTimeoutRef = useRef<number | null>(null);
  const retryLoopActiveRef = useRef(false);
  const initialLoadingStartedAtRef = useRef(Date.now());
  const [autoRestoreAttempts, setAutoRestoreAttempts] = useState(0);
  const [phase, setPhase] = useState<RestorePhase>("initial-loading");

  useEffect(() => {
    if (currentUserQuery.error instanceof ApiClientError && currentUserQuery.error.status === 401) {
      logout();
    }
  }, [currentUserQuery.error, logout]);

  useEffect(() => {
    const preferredLanguage = normalizeAppLocale(currentUserQuery.data?.settings?.preferredLanguage);

    if (preferredLanguage && preferredLanguage !== locale) {
      setLocale(preferredLanguage);
    }
  }, [currentUserQuery.data?.settings?.preferredLanguage, locale, setLocale]);

  useEffect(() => {
    return () => {
      retryLoopActiveRef.current = false;
      if (retryTimeoutRef.current !== null) {
        window.clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, []);

  const clearRetryLoop = useCallback(() => {
    retryLoopActiveRef.current = false;
    if (retryTimeoutRef.current !== null) {
      window.clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const startRetryLoop = useCallback(() => {
    if (retryLoopActiveRef.current) {
      return;
    }

    retryLoopActiveRef.current = true;

    void (async () => {
      const elapsed = Date.now() - initialLoadingStartedAtRef.current;
      const initialDelay = Math.max(0, MIN_INITIAL_LOADING_MS - elapsed);

      if (initialDelay > 0) {
        await new Promise<void>((resolve) => {
          retryTimeoutRef.current = window.setTimeout(() => {
            retryTimeoutRef.current = null;
            resolve();
          }, initialDelay);
        });
      }

      if (!retryLoopActiveRef.current) {
        return;
      }

      setPhase("retrying");

      for (let attempt = 0; attempt < MAX_AUTO_RESTORE_ATTEMPTS; attempt += 1) {
        await new Promise<void>((resolve) => {
          retryTimeoutRef.current = window.setTimeout(() => {
            retryTimeoutRef.current = null;
            resolve();
          }, AUTO_RESTORE_DELAY_MS);
        });

        if (!retryLoopActiveRef.current) {
          return;
        }

        setAutoRestoreAttempts(attempt + 1);
        const result = await currentUserQuery.refetch();

        if (result.status === "success") {
          clearRetryLoop();
          setAutoRestoreAttempts(0);
          setPhase("ready");
          return;
        }
      }

      clearRetryLoop();
      setPhase("paused");
    })();
  }, [clearRetryLoop, currentUserQuery]);

  useEffect(() => {
    if (!accessToken) {
      clearRetryLoop();
      initialLoadingStartedAtRef.current = Date.now();
      setAutoRestoreAttempts(0);
      setPhase("initial-loading");
      return;
    }

    if (currentUserQuery.isSuccess) {
      clearRetryLoop();
      initialLoadingStartedAtRef.current = Date.now();
      setAutoRestoreAttempts(0);
      setPhase("ready");
      return;
    }

    if (currentUserQuery.isLoading && autoRestoreAttempts === 0 && phase !== "retrying") {
      initialLoadingStartedAtRef.current = Date.now();
      setPhase("initial-loading");
      return;
    }

    if (
      currentUserQuery.isError &&
      !(currentUserQuery.error instanceof ApiClientError && currentUserQuery.error.status === 401) &&
      phase !== "retrying" &&
      phase !== "paused"
    ) {
      startRetryLoop();
    }
  }, [
    accessToken,
    autoRestoreAttempts,
    clearRetryLoop,
    currentUserQuery.error,
    currentUserQuery.isError,
    currentUserQuery.isLoading,
    currentUserQuery.isSuccess,
    phase,
    startRetryLoop,
  ]);

  if (!accessToken) {
    return <>{children}</>;
  }

  if (phase === "initial-loading" || phase === "retrying") {
    return (
      <AuthLoadingScreen
        checks={
          autoRestoreAttempts > 0
            ? [
                "Keep the saved token ready for the next retry",
                "Re-check the current user endpoint",
                "Resume the app automatically after the API responds",
              ]
            : undefined
        }
        description={
          phase === "retrying"
            ? "We hit a temporary session restore issue and will retry automatically."
            : "Restoring your session before the app opens protected areas."
        }
        nextBody="Profile, resume intelligence, feed, and other protected screens will reopen as soon as the session is confirmed."
        statusBody={
          phase === "retrying"
            ? "The app is holding on the loading screen while it retries your saved session in the background."
            : "Checking the saved session and loading your current user."
        }
        statusEyebrow={phase === "retrying" ? "Retrying" : "Loading"}
        statusMeta={
          phase === "retrying"
            ? `Retry ${autoRestoreAttempts + 1} of ${MAX_AUTO_RESTORE_ATTEMPTS} starts in about ${Math.floor(
                AUTO_RESTORE_DELAY_MS / 1000,
              )} seconds.`
            : autoRestoreAttempts > 0
              ? `Recovered after ${autoRestoreAttempts} retry attempt${autoRestoreAttempts === 1 ? "" : "s"} if the API responds now.`
              : undefined
        }
        statusTitle={phase === "retrying" ? "Retrying session restore" : "Signing you back in"}
        title={phase === "retrying" ? "Reconnecting your account" : "Loading your account"}
      />
    );
  }

  if (phase === "paused" && currentUserQuery.isError) {
    return (
      <AuthRecoveryScreen
        description="The saved session could not be restored yet, so the app is paused before opening additional API-driven screens."
        errorBody={
          currentUserQuery.error instanceof Error
            ? currentUserQuery.error.message
            : "The current session could not be restored."
        }
        errorTitle="We could not verify your saved session"
        onClearSession={logout}
        onRetry={() => {
          clearRetryLoop();
          setAutoRestoreAttempts(0);
          startRetryLoop();
        }}
        retrySummary={`Automatic retry stopped after ${MAX_AUTO_RESTORE_ATTEMPTS} attempts. You can retry again without refreshing the app.`}
        title="Session restore paused"
      />
    );
  }

  return <>{children}</>;
}
