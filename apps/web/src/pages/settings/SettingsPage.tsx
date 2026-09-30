import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mapCurrentUserDtoToProfileModel } from "../../entities/profile/model";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useUpdateSettingsMutation } from "../../features/profile/api/useUpdateSettingsMutation";
import { routeConfig } from "../../shared/config/routes";
import { getErrorDetails } from "../../shared/api/errors";
import { useLocale, type AppLocale } from "../../shared/i18n";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { FeedbackNotice } from "../../shared/ui/FeedbackNotice";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { useTheme } from "../../shared/theme";
import { SettingsForm, ThemeSettingsCard } from "../../widgets/profile";

type NotificationPreset = "focus-only" | "balanced" | "quiet";

const NOTIFICATION_PRESET_LABELS: Record<
  NotificationPreset,
  "settings.notificationPresetFocusOnly" | "settings.notificationPresetBalanced" | "settings.notificationPresetQuiet"
> = {
  "focus-only": "settings.notificationPresetFocusOnly",
  balanced: "settings.notificationPresetBalanced",
  quiet: "settings.notificationPresetQuiet",
};

const SETTINGS_STORAGE_KEY = "iterview-settings-workspace";

export function SettingsPage() {
  const currentUserQuery = useCurrentUserQuery();
  const updateSettingsMutation = useUpdateSettingsMutation();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();
  const isKorean = locale === "ko";
  const [targetScoreThreshold, setTargetScoreThreshold] = useState("");
  const [passScoreThreshold, setPassScoreThreshold] = useState("");
  const [retryEnabled, setRetryEnabled] = useState(true);
  const [dailyQuestionCount, setDailyQuestionCount] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<AppLocale>("ko");
  const [settingsStatus, setSettingsStatus] = useState<string | null>(null);
  const [notificationPreset, setNotificationPreset] = useState<NotificationPreset>("balanced");
  const [reviewReminderLead, setReviewReminderLead] = useState("30");
  const [quietHoursStart, setQuietHoursStart] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("07:00");
  const [localSettingsStatus, setLocalSettingsStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUserQuery.data) {
      return;
    }

    const profile = mapCurrentUserDtoToProfileModel(currentUserQuery.data);
    setTargetScoreThreshold(profile.targetScoreThreshold);
    setPassScoreThreshold(profile.passScoreThreshold);
    setRetryEnabled(profile.retryEnabled);
    setDailyQuestionCount(profile.dailyQuestionCount);
    setPreferredLanguage(profile.preferredLanguage);
  }, [currentUserQuery.data]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as {
        notificationPreset?: NotificationPreset;
        reviewReminderLead?: string;
        quietHoursStart?: string;
        quietHoursEnd?: string;
      };

      if (parsed.notificationPreset) {
        setNotificationPreset(parsed.notificationPreset);
      }
      if (parsed.reviewReminderLead) {
        setReviewReminderLead(parsed.reviewReminderLead);
      }
      if (parsed.quietHoursStart) {
        setQuietHoursStart(parsed.quietHoursStart);
      }
      if (parsed.quietHoursEnd) {
        setQuietHoursEnd(parsed.quietHoursEnd);
      }
    } catch {
      window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
    }
  }, []);

  async function handleSaveSettings() {
    setSettingsStatus(null);

    try {
      await updateSettingsMutation.mutateAsync({
        targetScoreThreshold: targetScoreThreshold ? Number(targetScoreThreshold) : undefined,
        passScoreThreshold: passScoreThreshold ? Number(passScoreThreshold) : undefined,
        retryEnabled,
        dailyQuestionCount: dailyQuestionCount ? Number(dailyQuestionCount) : undefined,
        preferredLanguage,
      });
      setLocale(preferredLanguage);
      setSettingsStatus(t("settings.saved"));
    } catch {
      return;
    }
  }

  function handleSaveLocalSettings() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({
          notificationPreset,
          reviewReminderLead,
          quietHoursStart,
          quietHoursEnd,
        }),
      );
    }

    setLocalSettingsStatus(t("settings.localSaved"));
  }

  const currentProfile = currentUserQuery.data
    ? mapCurrentUserDtoToProfileModel(currentUserQuery.data)
    : null;
  const targetCompanyCount = currentProfile?.targetCompanies.length ?? 0;
  const dailyLoad = dailyQuestionCount || currentProfile?.dailyQuestionCount || "0";
  const languageLabel = preferredLanguage === "ko" ? t("common.languageKorean") : t("common.languageEnglish");
  const configurationHealth = Math.max(
    52,
    Math.min(
      96,
      (dailyLoad !== "0" ? 20 : 8) +
        (retryEnabled ? 22 : 10) +
        (targetCompanyCount > 0 ? 20 : 8) +
        (preferredLanguage === "ko" ? 16 : 12),
    ),
  );
  const suggestedGoal = Math.max(20, (Number(dailyLoad || "0") || 0) + 15);
  const quickActions = [
    {
      title: t("settings.openProfile"),
      body: t("settings.workspaceBody"),
      to: routeConfig.profile.buildPath(),
    },
    {
      title: t("settings.openScheduledReviews"),
      body: t("settings.reviewBehaviorBody"),
      to: routeConfig.scheduledReviews.buildPath(),
    },
    {
      title: t("settings.targetCompaniesRoute"),
      body: t("settings.workspaceLinkageBody"),
      to: routeConfig.targetCompanies.buildPath(),
    },
  ];

  return (
    <PageContainer
      actions={
        <>
          <Link className="secondary-button" to={routeConfig.profile.buildPath()}>
            {t("settings.openProfile")}
          </Link>
          <Link className="secondary-button" to={routeConfig.scheduledReviews.buildPath()}>
            {t("settings.openScheduledReviews")}
          </Link>
        </>
      }
      description={t("settings.pageDescription")}
      eyebrow={t("settings.pageEyebrow")}
      title={t("settings.pageTitle")}
    >
      {currentUserQuery.isLoading ? (
        <LoadingStateCard body={t("settings.loadingBody")} title={t("settings.loadingTitle")} />
      ) : null}

      {currentUserQuery.isError ? (
        <ErrorStateCard
          body={
            currentUserQuery.error instanceof Error
              ? currentUserQuery.error.message
              : t("settings.loadErrorBody")
          }
          details={getErrorDetails(currentUserQuery.error)}
          onAction={() => {
            void currentUserQuery.refetch();
          }}
          title={t("settings.loadErrorTitle")}
        />
      ) : null}

      {!currentUserQuery.isLoading && !currentUserQuery.isError && currentUserQuery.data ? (
        <div className="page-stack settings-browser">
          <section className="settings-browser__shell">
            <header className="settings-browser__header">
              <div className="settings-browser__title-block">
                <p className="settings-browser__breadcrumbs">
                  <span>{isKorean ? "설정" : "Settings"}</span>
                  <span>/</span>
                  <span>{isKorean ? "선호도" : "Preferences"}</span>
                </p>
                <h2 className="settings-browser__title">{t("settings.workspaceTitle")}</h2>
                <p className="settings-browser__body">{t("settings.workspaceBody")}</p>
              </div>
              <div className="settings-browser__header-actions">
                <button
                  className="settings-browser__ghost-action"
                  onClick={() => {
                    if (!currentProfile) {
                      return;
                    }
                    setTargetScoreThreshold(currentProfile.targetScoreThreshold);
                    setPassScoreThreshold(currentProfile.passScoreThreshold);
                    setRetryEnabled(currentProfile.retryEnabled);
                    setDailyQuestionCount(currentProfile.dailyQuestionCount);
                    setPreferredLanguage(currentProfile.preferredLanguage);
                    setNotificationPreset("balanced");
                    setReviewReminderLead("30");
                    setQuietHoursStart("22:00");
                    setQuietHoursEnd("07:00");
                    setLocalSettingsStatus(null);
                    setSettingsStatus(null);
                  }}
                  type="button"
                >
                  {isKorean ? "기본값 복원" : "Reset to defaults"}
                </button>
                <button
                  className="primary-button"
                  disabled={updateSettingsMutation.isPending}
                  onClick={() => {
                    void handleSaveSettings();
                  }}
                  type="button"
                >
                  {updateSettingsMutation.isPending ? t("settings.savingSettings") : t("settings.saveSettings")}
                </button>
              </div>
            </header>

            <section className="settings-browser__tabs" role="tablist" aria-label={isKorean ? "설정 카테고리" : "Settings categories"}>
              <button className="settings-browser__tab settings-browser__tab--active" type="button">
                {isKorean ? "선호도" : "Preferences"}
              </button>
              <button className="settings-browser__tab" type="button">
                {isKorean ? "계정" : "Account"}
              </button>
              <button className="settings-browser__tab" type="button">
                {isKorean ? "데이터 및 개인정보" : "Data & Privacy"}
              </button>
              <button className="settings-browser__tab" type="button">
                {isKorean ? "연동" : "Integrations"}
              </button>
            </section>

            <div className="settings-browser__workspace">
              <main className="settings-browser__main">
                <div className="settings-browser__grid">
                  <SettingsForm
                    dailyQuestionCount={dailyQuestionCount}
                    errorDetails={getErrorDetails(updateSettingsMutation.error)}
                    errorMessage={updateSettingsMutation.error instanceof Error ? updateSettingsMutation.error.message : null}
                    isPending={updateSettingsMutation.isPending}
                    onDailyQuestionCountChange={setDailyQuestionCount}
                    onPassScoreThresholdChange={setPassScoreThreshold}
                    onPreferredLanguageChange={setPreferredLanguage}
                    onRetryEnabledChange={setRetryEnabled}
                    onSubmit={() => {
                      void handleSaveSettings();
                    }}
                    onTargetScoreThresholdChange={setTargetScoreThreshold}
                    passScoreThreshold={passScoreThreshold}
                    preferredLanguage={preferredLanguage}
                    retryEnabled={retryEnabled}
                    statusMessage={settingsStatus}
                    targetScoreThreshold={targetScoreThreshold}
                  />

                  <section className="page-card settings-browser__card">
                    <div className="section-heading">
                      <div>
                        <p className="section-heading__eyebrow">{t("settings.reviewBehavior")}</p>
                        <h2 className="page-card__title">{t("settings.reviewBehaviorTitle")}</h2>
                        <p className="page-card__body">{t("settings.reviewBehaviorBody")}</p>
                      </div>
                    </div>
                    <div className="auth-form">
                      <label className="form-field">
                        <span className="form-field__label">{t("settings.notificationPreset")}</span>
                        <select
                          className="form-field__input"
                          onChange={(event) => {
                            setNotificationPreset(event.target.value as NotificationPreset);
                          }}
                          value={notificationPreset}
                        >
                          {Object.entries(NOTIFICATION_PRESET_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {t(label)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="form-field">
                        <span className="form-field__label">{t("settings.reviewReminderLead")}</span>
                        <input
                          className="form-field__input"
                          inputMode="numeric"
                          onChange={(event) => {
                            setReviewReminderLead(event.target.value);
                          }}
                          value={reviewReminderLead}
                        />
                      </label>
                      <div className="content-grid content-grid--two">
                        <label className="form-field">
                          <span className="form-field__label">{t("settings.quietHoursStart")}</span>
                          <input
                            className="form-field__input"
                            onChange={(event) => {
                              setQuietHoursStart(event.target.value);
                            }}
                            type="time"
                            value={quietHoursStart}
                          />
                        </label>
                        <label className="form-field">
                          <span className="form-field__label">{t("settings.quietHoursEnd")}</span>
                          <input
                            className="form-field__input"
                            onChange={(event) => {
                              setQuietHoursEnd(event.target.value);
                            }}
                            type="time"
                            value={quietHoursEnd}
                          />
                        </label>
                      </div>
                      {localSettingsStatus ? <FeedbackNotice message={localSettingsStatus} tone="success" /> : null}
                      <div className="page-card__actions">
                        <button className="primary-button" onClick={handleSaveLocalSettings} type="button">
                          {t("settings.saveLocalSettings")}
                        </button>
                      </div>
                    </div>
                  </section>

                  <ThemeSettingsCard className="settings-browser__theme-card" onChange={setTheme} value={theme} />

                  <section className="page-card settings-browser__card">
                    <div className="section-heading">
                      <div>
                        <p className="section-heading__eyebrow">{isKorean ? "레이아웃 및 표시" : "Layout & Display"}</p>
                        <h2 className="page-card__title">{isKorean ? "현재 화면 운용 기준" : "Current display behavior"}</h2>
                      </div>
                    </div>
                    <div className="settings-browser__display-list">
                      <article>
                        <span>{isKorean ? "테마" : "Theme"}</span>
                        <strong>{theme === "workspace" ? (isKorean ? "워크스페이스" : "Workspace") : theme === "dark" ? (isKorean ? "다크" : "Dark") : "Dracula"}</strong>
                      </article>
                      <article>
                        <span>{t("settings.language")}</span>
                        <strong>{languageLabel}</strong>
                      </article>
                      <article>
                        <span>{t("settings.retryQueue")}</span>
                        <strong>{retryEnabled ? t("settings.enabled") : t("settings.paused")}</strong>
                      </article>
                      <article>
                        <span>{t("settings.dailyLoad")}</span>
                        <strong>{dailyLoad}</strong>
                      </article>
                    </div>
                  </section>
                </div>
              </main>

              <aside className="settings-browser__rail">
                <section className="page-card settings-browser__profile-card">
                  <div className="settings-browser__profile-top">
                    <div className="settings-browser__avatar">
                      {currentProfile?.displayName?.slice(0, 1) || "I"}
                    </div>
                    <div>
                      <strong>{currentProfile?.displayName}</strong>
                      <span>{currentProfile?.jobRole || t("profile.notSet")}</span>
                    </div>
                  </div>
                  <div className="settings-browser__profile-stats">
                    <article>
                      <span>{isKorean ? "언어" : "Language"}</span>
                      <strong>{languageLabel}</strong>
                    </article>
                    <article>
                      <span>{t("settings.targetCompanies")}</span>
                      <strong>{targetCompanyCount}</strong>
                    </article>
                    <article>
                      <span>{t("settings.dailyLoad")}</span>
                      <strong>{dailyLoad}</strong>
                    </article>
                  </div>
                </section>

                <section className="page-card settings-browser__health-card">
                  <div className="settings-browser__health-head">
                    <strong>{t("settings.configurationHealthTitle")}</strong>
                    <span>{configurationHealth >= 80 ? (isKorean ? "양호" : "Good") : isKorean ? "보통" : "Fair"}</span>
                  </div>
                  <div className="settings-browser__health-ring">
                    <div className="settings-browser__health-ring-value">
                      <strong>{configurationHealth}</strong>
                      <span>/100</span>
                    </div>
                  </div>
                  <p>
                    {configurationHealth >= 80
                      ? isKorean
                        ? "현재 설정은 장기적인 DFS 연습에 무리가 없습니다. 세부 알림과 목표량만 미세 조정하면 됩니다."
                        : "Your current setup is healthy for long DFS practice. Only small notification and goal tweaks remain."
                      : isKorean
                        ? "질문량, 재시도, 회사 연동 중 일부가 비어 있습니다. 반복 훈련 전에 기본값을 먼저 정리하세요."
                        : "Some of daily load, retry behavior, or company linkage is still weak. Tighten the defaults before another training cycle."}
                  </p>
                  <Link className="tertiary-link" to={routeConfig.reviewQueue.buildPath()}>
                    {t("settings.openReviewQueue")}
                  </Link>
                </section>

                <section className="page-card settings-browser__health-card">
                  <div className="settings-browser__health-head">
                    <strong>{isKorean ? "권장 조정" : "Recommended Tweaks"}</strong>
                    <span>3</span>
                  </div>
                  <div className="settings-browser__tweak-list">
                    <article className="settings-browser__tweak-item">
                      <div>
                        <strong>{isKorean ? "일일 목표 상향" : "Increase Daily Goal"}</strong>
                        <span>{isKorean ? `현재 ${dailyLoad}문제 기준입니다. ${suggestedGoal}까지 올리면 루프 밀도가 더 안정됩니다.` : `You are at ${dailyLoad} questions now. Raising toward ${suggestedGoal} improves loop density.`}</span>
                      </div>
                      <button className="secondary-button" type="button">{isKorean ? "조정" : "Adjust"}</button>
                    </article>
                    <article className="settings-browser__tweak-item">
                      <div>
                        <strong>{isKorean ? "약한 주제 집중 추가" : "Add Weak Topic Focus"}</strong>
                        <span>{isKorean ? "분산 시스템과 복구 루프를 목표 회사 준비와 연결하세요." : "Link distributed systems and recovery loops to target company preparation."}</span>
                      </div>
                      <Link className="secondary-button" to={routeConfig.targetCompanies.buildPath()}>{isKorean ? "추가" : "Add"}</Link>
                    </article>
                    <article className="settings-browser__tweak-item">
                      <div>
                        <strong>{isKorean ? "복습 알림 활성화" : "Enable Review Alerts"}</strong>
                        <span>{isKorean ? "장기 유지력을 위해 예약 복습 흐름과 알림 간격을 연결하세요." : "Connect scheduled review flow with reminder timing for long-term retention."}</span>
                      </div>
                      <Link className="secondary-button" to={routeConfig.scheduledReviews.buildPath()}>{isKorean ? "열기" : "Open"}</Link>
                    </article>
                  </div>
                </section>

                <section className="page-card settings-browser__health-card">
                  <div className="settings-browser__health-head">
                    <strong>{isKorean ? "빠른 작업" : "Quick Actions"}</strong>
                  </div>
                  <div className="settings-browser__quick-list">
                    {quickActions.map((action) => (
                      <Link className="settings-browser__quick-item" key={action.title} to={action.to}>
                        <div>
                          <strong>{action.title}</strong>
                          <span>{action.body}</span>
                        </div>
                        <span aria-hidden="true">→</span>
                      </Link>
                    ))}
                  </div>
                </section>
              </aside>
            </div>
          </section>
        </div>
      ) : null}
    </PageContainer>
  );
}

export default SettingsPage;
