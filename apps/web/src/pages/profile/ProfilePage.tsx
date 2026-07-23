import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mapCurrentUserDtoToProfileModel } from "../../entities/profile/model";
import { useUpdateProfileMutation } from "../../features/profile/api/useUpdateProfileMutation";
import { useUpdateSettingsMutation } from "../../features/profile/api/useUpdateSettingsMutation";
import { useUpdateTargetCompaniesMutation } from "../../features/profile/api/useUpdateTargetCompaniesMutation";
import { useUploadProfileImageMutation } from "../../features/profile/api/useUploadProfileImageMutation";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { routeConfig } from "../../shared/config/routes";
import { getErrorDetails } from "../../shared/api/errors";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { SectionPanel, useLayoutMode } from "../../shared/ui/layout";
import { useLocale, type AppLocale } from "../../shared/i18n";
import { useTheme } from "../../shared/theme";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { ProfileDesktopLayout, ProfileMobileLayout } from "./ProfileLayouts";
import {
  ProfileEditForm,
  ProfileSummaryCard,
  SettingsForm,
  TargetCompanySelector,
  ThemeSettingsCard,
} from "../../widgets/profile";

export function ProfilePage() {
  const currentUserQuery = useCurrentUserQuery();
  const { isDesktop } = useLayoutMode();
  const { theme, setTheme } = useTheme();
  const { setLocale, t } = useLocale();
  const updateProfileMutation = useUpdateProfileMutation();
  const updateSettingsMutation = useUpdateSettingsMutation();
  const updateTargetCompaniesMutation = useUpdateTargetCompaniesMutation();
  const uploadProfileImageMutation = useUploadProfileImageMutation();
  const [nickname, setNickname] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [targetScoreThreshold, setTargetScoreThreshold] = useState("");
  const [passScoreThreshold, setPassScoreThreshold] = useState("");
  const [retryEnabled, setRetryEnabled] = useState(true);
  const [dailyQuestionCount, setDailyQuestionCount] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<AppLocale>("en");
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [profileImageStatus, setProfileImageStatus] = useState<string | null>(null);
  const [settingsStatus, setSettingsStatus] = useState<string | null>(null);
  const [targetCompaniesStatus, setTargetCompaniesStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUserQuery.data) {
      return;
    }

    const profile = mapCurrentUserDtoToProfileModel(currentUserQuery.data);

    setNickname(profile.nickname);
    setJobRole(profile.jobRole);
    setYearsOfExperience(profile.yearsOfExperience);
    setTargetScoreThreshold(profile.targetScoreThreshold);
    setPassScoreThreshold(profile.passScoreThreshold);
    setRetryEnabled(profile.retryEnabled);
    setDailyQuestionCount(profile.dailyQuestionCount);
    setPreferredLanguage(profile.preferredLanguage);
    setTargetCompanies(profile.targetCompanies);
  }, [currentUserQuery.data]);

  async function handleSaveProfile() {
    setProfileStatus(null);
    try {
      await updateProfileMutation.mutateAsync({
        nickname: nickname || undefined,
        jobRole: jobRole || undefined,
        yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
      });
      setProfileStatus(t("profile.saved"));
    } catch {
      return;
    }
  }

  async function handleUploadProfileImage(file: File) {
    setProfileImageStatus(null);
    try {
      await uploadProfileImageMutation.mutateAsync(file);
      setProfileImageStatus(t("profile.imageUploaded"));
    } catch {
      return;
    }
  }

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

  async function handleSaveTargetCompanies() {
    setTargetCompaniesStatus(null);
    try {
      await updateTargetCompaniesMutation.mutateAsync({
        targetCompanies,
      });
      setTargetCompaniesStatus(t("profile.targetCompaniesSaved"));
    } catch {
      return;
    }
  }

  return (
    <PageContainer
      description={t("profile.pageDescription")}
      eyebrow={t("profile.pageEyebrow")}
      title={t("profile.pageTitle")}
    >
      {currentUserQuery.isLoading ? (
        <LoadingStateCard
          body={t("profile.loadingBody")}
          title={t("profile.loadingTitle")}
        />
      ) : null}

      {currentUserQuery.isError ? (
        <ErrorStateCard
          body={
            currentUserQuery.error instanceof Error
              ? currentUserQuery.error.message
              : t("profile.loadErrorBody")
          }
          details={getErrorDetails(currentUserQuery.error)}
          onAction={() => {
            void currentUserQuery.refetch();
          }}
          title={t("profile.loadErrorTitle")}
        />
      ) : null}

      {!currentUserQuery.isLoading && !currentUserQuery.isError && currentUserQuery.data
        ? (() => {
            const summaryCard = (
              <ProfileSummaryCard
                imageErrorDetails={getErrorDetails(uploadProfileImageMutation.error)}
                imageErrorMessage={
                  uploadProfileImageMutation.error instanceof Error
                    ? uploadProfileImageMutation.error.message
                    : null
                }
                imageStatusMessage={profileImageStatus}
                isUploadingImage={uploadProfileImageMutation.isPending}
                onImageSelect={(file) => {
                  void handleUploadProfileImage(file);
                }}
                profile={mapCurrentUserDtoToProfileModel(currentUserQuery.data)}
              />
            );
            const resumeCard = (
              <SectionPanel className="profile-workspace-card" variant="muted">
                <span className="page-card__label">{t("profile.workspaceLabel")}</span>
                <h2 className="page-card__title">{t("profile.workspaceTitle")}</h2>
                <p className="page-card__body">{t("profile.workspaceBody")}</p>
                <div className="profile-workspace-groups">
                  <div className="profile-workspace-group">
                    <span className="profile-workspace-group__label">Resume workspace</span>
                    <div className="page-card__actions">
                      <Link className="secondary-button" to={routeConfig.resume.buildPath()}>
                        {t("profile.resumes")}
                      </Link>
                      <Link className="secondary-button" to={routeConfig.resumeAnalysis.buildPath()}>
                        {t("profile.resumeAnalysis")}
                      </Link>
                      <Link className="secondary-button" to={routeConfig.skills.buildPath()}>
                        {t("profile.skills")}
                      </Link>
                    </div>
                  </div>
                  <div className="profile-workspace-group">
                    <span className="profile-workspace-group__label">Interview workspace</span>
                    <div className="page-card__actions">
                      <Link className="primary-button" to={routeConfig.interview.buildPath()}>
                        {t("profile.interviewSession")}
                      </Link>
                    </div>
                  </div>
                </div>
              </SectionPanel>
            );

            const profileForm = (
              <ProfileEditForm
                className="page-card--embedded"
                errorMessage={updateProfileMutation.error instanceof Error ? updateProfileMutation.error.message : null}
                errorDetails={getErrorDetails(updateProfileMutation.error)}
                isPending={updateProfileMutation.isPending}
                jobRole={jobRole}
                nickname={nickname}
                onJobRoleChange={setJobRole}
                onNicknameChange={setNickname}
                onSubmit={() => {
                  void handleSaveProfile();
                }}
                onYearsOfExperienceChange={setYearsOfExperience}
                statusMessage={profileStatus}
                yearsOfExperience={yearsOfExperience}
              />
            );
            const settingsForm = (
              <SettingsForm
                className="page-card--embedded"
                dailyQuestionCount={dailyQuestionCount}
                errorMessage={updateSettingsMutation.error instanceof Error ? updateSettingsMutation.error.message : null}
                errorDetails={getErrorDetails(updateSettingsMutation.error)}
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
            );
            const targetCompaniesForm = (
              <TargetCompanySelector
                className="page-card--embedded"
                companies={targetCompanies}
                errorMessage={
                  updateTargetCompaniesMutation.error instanceof Error
                    ? updateTargetCompaniesMutation.error.message
                    : null
                }
                errorDetails={getErrorDetails(updateTargetCompaniesMutation.error)}
                isPending={updateTargetCompaniesMutation.isPending}
                onChange={setTargetCompanies}
                onSubmit={() => {
                  void handleSaveTargetCompanies();
                }}
                statusMessage={targetCompaniesStatus}
              />
            );
            const themeSettingsCard = (
              <ThemeSettingsCard
                className="page-card--embedded"
                onChange={setTheme}
                value={theme}
              />
            );

            if (!isDesktop) {
              return (
                <ProfileMobileLayout
                  profileForm={profileForm}
                  resumeCard={resumeCard}
                  settingsForm={settingsForm}
                  summaryCard={summaryCard}
                  themeSettingsCard={themeSettingsCard}
                  targetCompaniesForm={targetCompaniesForm}
                />
              );
            }

            return (
              <ProfileDesktopLayout
                profileForm={profileForm}
                resumeCard={resumeCard}
                settingsForm={settingsForm}
                summaryCard={summaryCard}
                themeSettingsCard={themeSettingsCard}
                targetCompaniesForm={targetCompaniesForm}
              />
            );
          })()
        : null}
    </PageContainer>
  );
}
