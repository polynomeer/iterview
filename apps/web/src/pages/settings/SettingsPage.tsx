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

const NOTIFICATION_PRESET_LABELS: Record<NotificationPreset, string> = {
  "focus-only": "Focus only",
  balanced: "Balanced",
  quiet: "Quiet",
};

const SETTINGS_STORAGE_KEY = "iterview-settings-workspace";

export function SettingsPage() {
  const currentUserQuery = useCurrentUserQuery();
  const updateSettingsMutation = useUpdateSettingsMutation();
  const { isDesktop } = useLayoutMode();
  const { theme, setTheme } = useTheme();
  const { setLocale } = useLocale();
  const [targetScoreThreshold, setTargetScoreThreshold] = useState("");
  const [passScoreThreshold, setPassScoreThreshold] = useState("");
  const [retryEnabled, setRetryEnabled] = useState(true);
  const [dailyQuestionCount, setDailyQuestionCount] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<AppLocale>("en");
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
      setSettingsStatus("Settings saved.");
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

    setLocalSettingsStatus("Local review and notification preferences saved.");
  }

  const currentProfile = currentUserQuery.data
    ? mapCurrentUserDtoToProfileModel(currentUserQuery.data)
    : null;
  const targetCompanyCount = currentProfile?.targetCompanies.length ?? 0;
  const dailyLoad = dailyQuestionCount || currentProfile?.dailyQuestionCount || "0";
  const languageLabel = preferredLanguage === "ko" ? "Korean" : "English";

  return (
    <PageContainer
      actions={
        <>
          <Link className="secondary-button" to={routeConfig.profile.buildPath()}>
            Open profile
          </Link>
          <Link className="secondary-button" to={routeConfig.scheduledReviews.buildPath()}>
            Open scheduled reviews
          </Link>
        </>
      }
      description="Control practice defaults, local appearance, and review behavior without mixing these operational settings into the identity-focused profile workspace."
      eyebrow="Workspace controls"
      title="Practice settings workspace"
    >
      <section className="page-card settings-workspace-surface">
        <div className="settings-workspace-surface__header">
          <div className="settings-workspace-surface__intro">
            <div className="settings-workspace-surface__eyebrow-row">
              <span className="page-card__label">System controls</span>
              <span className="question-status-badge question-status-badge--accent">Operational defaults</span>
            </div>
            <h2 className="settings-workspace-surface__title">
              Keep study preferences, personalization, and review behavior in one dedicated control room
            </h2>
            <p className="settings-workspace-surface__body">
              Settings shape how you practice, retry, and schedule work. They should live beside review planning and
              account context, but not inside the identity editing flow itself.
            </p>
          </div>
          <div className="settings-workspace-surface__stats">
            <article>
              <span>Daily load</span>
              <strong>{dailyLoad}</strong>
            </article>
            <article>
              <span>Language</span>
              <strong>{languageLabel}</strong>
            </article>
            <article>
              <span>Retry queue</span>
              <strong>{retryEnabled ? "Enabled" : "Paused"}</strong>
            </article>
            <article>
              <span>Target companies</span>
              <strong>{targetCompanyCount}</strong>
            </article>
          </div>
        </div>
        <div className="settings-workspace-surface__guidance">
          <article className="settings-workspace-surface__guidance-card">
            <span>Control rule</span>
            <strong>Change defaults here first, then verify the impact in review and practice workspaces.</strong>
          </article>
          <article className="settings-workspace-surface__guidance-card">
            <span>Scope split</span>
            <strong>Profile is for identity. Settings is for how the interview system behaves around you.</strong>
          </article>
        </div>
      </section>

      {currentUserQuery.isLoading ? (
        <LoadingStateCard body="Loading your current settings and local workspace preferences." title="Preparing settings" />
      ) : null}

      {currentUserQuery.isError ? (
        <ErrorStateCard
          body={
            currentUserQuery.error instanceof Error
              ? currentUserQuery.error.message
              : "The settings workspace could not be loaded."
          }
          details={getErrorDetails(currentUserQuery.error)}
          onAction={() => {
            void currentUserQuery.refetch();
          }}
          title="Unable to load settings"
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
                  <p className="section-heading__eyebrow">Review behavior</p>
                  <h2 className="page-card__title">Tune local reminder timing and interruption level</h2>
                  <p className="page-card__body">
                    These controls are local to this browser. Use them to reduce review noise during deep rehearsal
                    windows without changing the shared backend profile.
                  </p>
                </div>
                <span className="section-heading__count section-heading__count--text">Local only</span>
              </div>
              <div className="auth-form">
                <label className="form-field">
                  <span className="form-field__label">Notification preset</span>
                  <select
                    className="form-field__input"
                    onChange={(event) => {
                      setNotificationPreset(event.target.value as NotificationPreset);
                    }}
                    value={notificationPreset}
                  >
                    {Object.entries(NOTIFICATION_PRESET_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  <span className="form-field__label">Review reminder lead (minutes)</span>
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
                    <span className="form-field__label">Quiet hours start</span>
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
                    <span className="form-field__label">Quiet hours end</span>
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
                    Save local review settings
                  </button>
                </div>
              </div>
            </section>
          </main>

          <aside className="page-stack settings-layout__rail">
            <section className="page-card settings-health-rail">
              <div className="section-heading section-heading--compact">
                <div>
                  <p className="section-heading__eyebrow">Configuration health</p>
                  <h2 className="page-card__title">Recommended tweaks before the next review cycle</h2>
                </div>
              </div>
              <div className="settings-health-rail__list">
                <article className="settings-health-rail__item">
                  <span>Daily load</span>
                  <strong>{dailyLoad === "0" ? "Set a realistic daily question target" : `Current target ${dailyLoad}`}</strong>
                  <p>Match the review schedule to the actual number of questions you can defend in one day.</p>
                </article>
                <article className="settings-health-rail__item">
                  <span>Retry behavior</span>
                  <strong>{retryEnabled ? "Retry queue active" : "Retry queue disabled"}</strong>
                  <p>Disable only if you are intentionally running a source-of-truth repair week instead of retry execution.</p>
                </article>
                <article className="settings-health-rail__item">
                  <span>Workspace linkage</span>
                  <strong>{`${targetCompanyCount} linked company lanes`}</strong>
                  <p>Make sure settings, scheduling, and company preparation still point to the same workload reality.</p>
                </article>
              </div>
            </section>

            <section className="page-card settings-health-rail">
              <div className="section-heading section-heading--compact">
                <div>
                  <p className="section-heading__eyebrow">Next routes</p>
                  <h2 className="page-card__title">Jump back into the workspaces these settings affect</h2>
                </div>
              </div>
              <div className="page-card__actions">
                <Link className="secondary-button" to={routeConfig.reviewQueue.buildPath()}>
                  Review queue
                </Link>
                <Link className="secondary-button" to={routeConfig.scheduledReviews.buildPath()}>
                  Scheduled reviews
                </Link>
                <Link className="secondary-button" to={routeConfig.targetCompanies.buildPath()}>
                  Target companies
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
