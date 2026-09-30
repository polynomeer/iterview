import { useCallback, useEffect, useRef, useState, type PropsWithChildren } from "react";
import { ApiClientError, userFacingErrorMessage } from "../../shared/api/errors";
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
  const { locale, setLocale, t } = useLocale();
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
    const retrying = phase === "retrying";
    return (
      <AuthLoadingScreen
        checks={
          autoRestoreAttempts > 0
            ? [t("appShell.authRetryCheckKeepToken"), t("appShell.authRetryCheckCurrentUser"), t("appShell.authRetryCheckResume")]
            : undefined
        }
        description={retrying ? t("appShell.authRetryingDescription") : t("appShell.authRestoringDescription")}
        nextBody={t("appShell.authRestoreNextBody")}
        statusBody={retrying ? t("appShell.authRetryingStatusBody") : t("appShell.authRestoringStatusBody")}
        statusEyebrow={retrying ? t("appShell.authRetryingEyebrow") : t("common.loadingState")}
        statusMeta={
          retrying
            ? t("appShell.authRetryScheduled", {
                attempt: autoRestoreAttempts + 1,
                max: MAX_AUTO_RESTORE_ATTEMPTS,
                seconds: Math.floor(AUTO_RESTORE_DELAY_MS / 1000),
              })
            : autoRestoreAttempts > 0
              ? t(autoRestoreAttempts === 1 ? "appShell.authRecoveredAfterOneRetry" : "appShell.authRecoveredAfterRetries", {
                  count: autoRestoreAttempts,
                })
              : undefined
        }
        statusTitle={retrying ? t("appShell.authRetryingStatusTitle") : t("appShell.authRestoringStatusTitle")}
        title={retrying ? t("appShell.authRetryingTitle") : t("appShell.authRestoringTitle")}
      />
    );
  }

  if (phase === "paused" && currentUserQuery.isError) {
    return (
      <AuthRecoveryScreen
        description={t("appShell.authPausedDescription")}
        errorBody={userFacingErrorMessage(currentUserQuery.error, t("appShell.authPausedErrorFallback"))}
        errorTitle={t("appShell.authPausedErrorTitle")}
        onClearSession={logout}
        onRetry={() => {
          clearRetryLoop();
          setAutoRestoreAttempts(0);
          startRetryLoop();
        }}
        retrySummary={t("appShell.authPausedRetrySummary", { max: MAX_AUTO_RESTORE_ATTEMPTS })}
        title={t("appShell.authPausedTitle")}
      />
    );
  }

  return <>{children}</>;
}
