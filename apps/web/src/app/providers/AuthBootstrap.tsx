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
  const isKorean = locale === "ko";
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
                isKorean ? "다음 재시도에 대비해 저장된 토큰 유지" : "Keep the saved token ready for the next retry",
                isKorean ? "현재 사용자 엔드포인트 다시 확인" : "Re-check the current user endpoint",
                isKorean ? "API가 응답하면 앱 자동 재개" : "Resume the app automatically after the API responds",
              ]
            : undefined
        }
        description={
          phase === "retrying"
            ? isKorean
              ? "세션 복구에 일시적인 문제가 있어 자동으로 다시 시도합니다."
              : "We hit a temporary session restore issue and will retry automatically."
            : isKorean
              ? "보호된 화면을 열기 전에 세션을 복구하고 있습니다."
              : "Restoring your session before the app opens protected areas."
        }
        nextBody={
          isKorean
            ? "세션이 확인되는 즉시 프로필, 이력서 인텔리전스, 피드 등 보호된 화면이 다시 열립니다."
            : "Profile, resume intelligence, feed, and other protected screens will reopen as soon as the session is confirmed."
        }
        statusBody={
          phase === "retrying"
            ? isKorean
              ? "백그라운드에서 저장된 세션을 다시 시도하는 동안 앱은 로딩 화면을 유지합니다."
              : "The app is holding on the loading screen while it retries your saved session in the background."
            : isKorean
              ? "저장된 세션을 확인하고 현재 사용자를 불러오고 있습니다."
              : "Checking the saved session and loading your current user."
        }
        statusEyebrow={phase === "retrying" ? (isKorean ? "재시도 중" : "Retrying") : isKorean ? "불러오는 중" : "Loading"}
        statusMeta={
          phase === "retrying"
            ? isKorean
              ? `${autoRestoreAttempts + 1}/${MAX_AUTO_RESTORE_ATTEMPTS}번째 재시도가 약 ${Math.floor(
                  AUTO_RESTORE_DELAY_MS / 1000,
                )}초 후 시작됩니다.`
              : `Retry ${autoRestoreAttempts + 1} of ${MAX_AUTO_RESTORE_ATTEMPTS} starts in about ${Math.floor(
                  AUTO_RESTORE_DELAY_MS / 1000,
                )} seconds.`
            : autoRestoreAttempts > 0
              ? isKorean
                ? `API가 응답하면 ${autoRestoreAttempts}번의 재시도 후 복구됩니다.`
                : `Recovered after ${autoRestoreAttempts} retry attempt${autoRestoreAttempts === 1 ? "" : "s"} if the API responds now.`
              : undefined
        }
        statusTitle={phase === "retrying" ? (isKorean ? "세션 복구 재시도 중" : "Retrying session restore") : isKorean ? "다시 로그인하는 중" : "Signing you back in"}
        title={phase === "retrying" ? (isKorean ? "계정을 다시 연결하는 중" : "Reconnecting your account") : isKorean ? "계정을 불러오는 중" : "Loading your account"}
      />
    );
  }

  if (phase === "paused" && currentUserQuery.isError) {
    return (
      <AuthRecoveryScreen
        description={
          isKorean
            ? "저장된 세션을 아직 복구하지 못해, 추가 API 기반 화면을 열기 전에 앱을 잠시 멈췄습니다."
            : "The saved session could not be restored yet, so the app is paused before opening additional API-driven screens."
        }
        errorBody={
          currentUserQuery.error instanceof Error
            ? currentUserQuery.error.message
            : isKorean
              ? "현재 세션을 복구하지 못했습니다."
              : "The current session could not be restored."
        }
        errorTitle={isKorean ? "저장된 세션을 확인할 수 없습니다" : "We could not verify your saved session"}
        onClearSession={logout}
        onRetry={() => {
          clearRetryLoop();
          setAutoRestoreAttempts(0);
          startRetryLoop();
        }}
        retrySummary={
          isKorean
            ? `자동 재시도는 ${MAX_AUTO_RESTORE_ATTEMPTS}회 후 중단되었습니다. 새로고침 없이 다시 시도할 수 있습니다.`
            : `Automatic retry stopped after ${MAX_AUTO_RESTORE_ATTEMPTS} attempts. You can retry again without refreshing the app.`
        }
        title={isKorean ? "세션 복구 일시 중지" : "Session restore paused"}
      />
    );
  }

  return <>{children}</>;
}
