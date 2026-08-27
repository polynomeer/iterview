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
import { useLayoutMode } from "../../shared/ui/layout";
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
  const { isDesktop } = useLayoutMode();
  const { theme, setTheme } = useTheme();
  const { setLocale, t } = useLocale();
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
      <section className="page-card settings-workspace-surface">
        <div className="settings-workspace-surface__header">
          <div className="settings-workspace-surface__intro">
              <div className="settings-workspace-surface__eyebrow-row">
              <span className="page-card__label">{t("settings.systemControls")}</span>
              <span className="question-status-badge question-status-badge--accent">{t("settings.operationalDefaults")}</span>
            </div>
            <h2 className="settings-workspace-surface__title">
              {t("settings.workspaceTitle")}
            </h2>
            <p className="settings-workspace-surface__body">{t("settings.workspaceBody")}</p>
          </div>
          <div className="settings-workspace-surface__stats">
            <article>
              <span>{t("settings.dailyLoad")}</span>
              <strong>{dailyLoad}</strong>
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
              <span>{t("settings.targetCompanies")}</span>
              <strong>{targetCompanyCount}</strong>
            </article>
          </div>
        </div>
        <div className="settings-workspace-surface__guidance">
          <article className="settings-workspace-surface__guidance-card">
            <span>{t("settings.controlRule")}</span>
            <strong>{t("settings.controlRuleBody")}</strong>
          </article>
          <article className="settings-workspace-surface__guidance-card">
            <span>{t("settings.scopeSplit")}</span>
            <strong>{t("settings.scopeSplitBody")}</strong>
          </article>
        </div>
      </section>

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
        <div className={`settings-layout ${isDesktop ? "settings-layout--desktop" : ""}`}>
          <main className="page-stack">
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

            <ThemeSettingsCard onChange={setTheme} value={theme} />

            <section className="page-card settings-local-panel">
              <div className="section-heading">
                <div>
                  <p className="section-heading__eyebrow">{t("settings.reviewBehavior")}</p>
                  <h2 className="page-card__title">{t("settings.reviewBehaviorTitle")}</h2>
                  <p className="page-card__body">{t("settings.reviewBehaviorBody")}</p>
                </div>
                <span className="section-heading__count section-heading__count--text">{t("settings.localOnly")}</span>
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
          </main>

          <aside className="page-stack settings-layout__rail">
            <section className="page-card settings-health-rail">
              <div className="section-heading section-heading--compact">
                <div>
                  <p className="section-heading__eyebrow">{t("settings.configurationHealth")}</p>
                  <h2 className="page-card__title">{t("settings.configurationHealthTitle")}</h2>
                </div>
              </div>
              <div className="settings-health-rail__list">
                <article className="settings-health-rail__item">
                  <span>{t("settings.dailyLoad")}</span>
                  <strong>{dailyLoad === "0" ? t("settings.dailyLoadHintTitle") : `${t("settings.dailyLoadHintCurrentPrefix")} ${dailyLoad}`}</strong>
                  <p>{t("settings.dailyLoadHintBody")}</p>
                </article>
                <article className="settings-health-rail__item">
                  <span>{t("settings.retryBehavior")}</span>
                  <strong>{retryEnabled ? t("settings.retryBehaviorActive") : t("settings.retryBehaviorDisabled")}</strong>
                  <p>{t("settings.retryBehaviorBody")}</p>
                </article>
                <article className="settings-health-rail__item">
                  <span>{t("settings.workspaceLinkage")}</span>
                  <strong>{`${targetCompanyCount} ${t("settings.linkedCompanyLanesSuffix")}`}</strong>
                  <p>{t("settings.workspaceLinkageBody")}</p>
                </article>
              </div>
            </section>

            <section className="page-card settings-health-rail">
              <div className="section-heading section-heading--compact">
                <div>
                  <p className="section-heading__eyebrow">{t("settings.nextRoutes")}</p>
                  <h2 className="page-card__title">{t("settings.nextRoutesTitle")}</h2>
                </div>
              </div>
              <div className="page-card__actions">
                <Link className="secondary-button" to={routeConfig.reviewQueue.buildPath()}>
                  {t("settings.openReviewQueue")}
                </Link>
                <Link className="secondary-button" to={routeConfig.scheduledReviews.buildPath()}>
                  {t("sidebar.scheduledReviews")}
                </Link>
                <Link className="secondary-button" to={routeConfig.targetCompanies.buildPath()}>
                  {t("settings.targetCompaniesRoute")}
                </Link>
              </div>
            </section>
          </aside>
        </div>
      ) : null}
    </PageContainer>
  );
}

export default SettingsPage;
