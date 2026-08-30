import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mapCurrentUserDtoToProfileModel } from "../../entities/profile/model";
import { useUpdateProfileMutation } from "../../features/profile/api/useUpdateProfileMutation";
import { useUploadProfileImageMutation } from "../../features/profile/api/useUploadProfileImageMutation";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { routeConfig } from "../../shared/config/routes";
import { getErrorDetails } from "../../shared/api/errors";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { SectionPanel, useLayoutMode } from "../../shared/ui/layout";
import { useLocale } from "../../shared/i18n";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { ProfileDesktopLayout, ProfileMobileLayout } from "./ProfileLayouts";
import {
  ProfileEditForm,
  ProfileSummaryCard,
} from "../../widgets/profile";

export function ProfilePage() {
  const currentUserQuery = useCurrentUserQuery();
  const { isDesktop } = useLayoutMode();
  const { locale, t } = useLocale();
  const isKorean = locale === "ko";
  const updateProfileMutation = useUpdateProfileMutation();
  const uploadProfileImageMutation = useUploadProfileImageMutation();
  const [nickname, setNickname] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [profileImageStatus, setProfileImageStatus] = useState<string | null>(null);
  const currentProfile = currentUserQuery.data
    ? mapCurrentUserDtoToProfileModel(currentUserQuery.data)
    : null;
  const targetCompanyCount = targetCompanies.length;
  const normalizedDailyQuestionCount = currentProfile?.dailyQuestionCount || "0";
  const scoreThresholdLabel = currentProfile?.targetScoreThreshold ? `${currentProfile.targetScoreThreshold}%` : t("profile.notSet");
  const languageLabel = currentProfile?.preferredLanguage === "ko" ? t("common.languageKorean") : t("common.languageEnglish");
  const roleLabel = currentProfile?.jobRole ?? t("profile.notSet");
  const experienceYears = Number(yearsOfExperience || currentProfile?.yearsOfExperience || "0");
  const currentCompanyLabel = targetCompanies[0] ?? "Dreamus";
  const targetRoleLabel =
    experienceYears >= 7
      ? (isKorean ? "Staff Backend Engineer" : "Staff Backend Engineer")
      : experienceYears >= 4
        ? (isKorean ? "Senior Backend Engineer" : "Senior Backend Engineer")
        : (isKorean ? "Backend Engineer" : "Backend Engineer");
  const readinessTopics = [
    { label: isKorean ? "Backend 깊이" : "Backend depth", score: 92 },
    { label: isKorean ? "문제 해결" : "Problem solving", score: 85 },
    { label: isKorean ? "분산 시스템" : "Distributed systems", score: 78 },
    { label: isKorean ? "커뮤니케이션" : "Communication", score: 75 },
  ];
  const relatedQuestions = [
    {
      title: isKorean ? "고처리량 정산 시스템을 어떻게 설계하겠습니까?" : "Design a high-throughput settlement system.",
      score: 85,
      label: "System Design",
    },
    {
      title: isKorean ? "트랜잭션 처리에서 멱등성을 어떻게 보장하겠습니까?" : "How would you ensure idempotency in transaction processing?",
      score: 82,
      label: "System Design",
    },
    {
      title: isKorean ? "감사 로그에 Kafka를 선택한 이유는 무엇입니까?" : "Why did you choose Kafka for audit logs?",
      score: 80,
      label: isKorean ? "행동" : "Behavioral",
    },
  ];

  useEffect(() => {
    if (!currentUserQuery.data) {
      return;
    }

    const profile = mapCurrentUserDtoToProfileModel(currentUserQuery.data);

    setNickname(profile.nickname);
    setJobRole(profile.jobRole);
    setYearsOfExperience(profile.yearsOfExperience);
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

  return (
    <PageContainer
      description={t("profile.pageDescription")}
      eyebrow={t("profile.pageEyebrow")}
      title={t("profile.pageTitle")}
    >
      <section className="page-card profile-workspace-surface">
        <div className="profile-workspace-surface__header">
          <div className="profile-workspace-surface__intro">
            <div className="profile-workspace-surface__eyebrow-row">
              <span className="page-card__label">{t("profile.workspaceTag")}</span>
              <span className="question-status-badge question-status-badge--accent">{t("profile.controlSurface")}</span>
            </div>
            <p className="profile-workspace-surface__breadcrumbs">
              {isKorean ? "정체성" : "Identity"}
              <span>/</span>
              {isKorean ? "연습 기본값" : "Practice defaults"}
              <span>/</span>
              {isKorean ? "이력서 바로가기" : "Resume launchers"}
            </p>
            <h2 className="profile-workspace-surface__title">{t("profile.workspaceTitleLong")}</h2>
            <p className="profile-workspace-surface__body">{t("profile.workspaceBodyLong")}</p>
          </div>
          <div className="profile-workspace-surface__stats">
            <article className="profile-workspace-surface__stat">
              <span>{t("profile.primaryRole")}</span>
              <strong>{roleLabel}</strong>
            </article>
            <article className="profile-workspace-surface__stat">
              <span>{t("settings.targetCompanies")}</span>
              <strong>{targetCompanyCount}</strong>
            </article>
            <article className="profile-workspace-surface__stat">
              <span>{t("settings.dailyLoad")}</span>
              <strong>{normalizedDailyQuestionCount}</strong>
            </article>
            <article className="profile-workspace-surface__stat">
              <span>{t("profile.targetScore")}</span>
              <strong>{scoreThresholdLabel}</strong>
            </article>
          </div>
        </div>
        <div className="profile-workspace-surface__chips">
          <span className="detail-chip">{`${t("profile.language")} ${languageLabel}`}</span>
          {currentProfile?.retryEnabled ? <span className="detail-chip detail-chip--accent">{t("profile.retryQueueEnabled")}</span> : null}
          {currentProfile?.jobRole ? <span className="detail-chip">{currentProfile.jobRole}</span> : null}
          {currentProfile?.passScoreThreshold ? <span className="detail-chip">{`${t("profile.passLinePrefix")} ${currentProfile.passScoreThreshold}%`}</span> : null}
        </div>
      </section>
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
            const profileModel = currentProfile ?? mapCurrentUserDtoToProfileModel(currentUserQuery.data);
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
                profile={profileModel}
              />
            );
            const overviewCard = (
              <SectionPanel className="career-context-overview-card" variant="muted">
                <div className="career-context-overview-card__header">
                  <div>
                    <span className="page-card__label">{t("profile.careerSnapshot")}</span>
                    <h2 className="page-card__title">{t("profile.careerSnapshotTitle")}</h2>
                    <p className="page-card__body">{t("profile.careerSnapshotBody")}</p>
                  </div>
                  <span className="detail-chip detail-chip--accent">{t("profile.contextMap")}</span>
                </div>
                <div className="career-context-overview-card__metrics">
                  <article className="career-context-overview-card__metric">
                    <span>{t("profile.currentRole")}</span>
                    <strong>{roleLabel}</strong>
                    <p>{currentCompanyLabel}</p>
                  </article>
                  <article className="career-context-overview-card__metric">
                    <span>{t("profile.experience")}</span>
                    <strong>{experienceYears > 0 ? `${experienceYears.toFixed(1)}` : "0.0"}</strong>
                    <p>{t("profile.years")}</p>
                  </article>
                  <article className="career-context-overview-card__metric">
                    <span>{t("profile.targetRole")}</span>
                    <strong>{targetRoleLabel}</strong>
                    <p>{t("profile.nextLevel")}</p>
                  </article>
                  <article className="career-context-overview-card__metric">
                    <span>{t("settings.targetCompanies")}</span>
                    <strong>{targetCompanies.length}</strong>
                    <p>{targetCompanies.length > 0 ? targetCompanies.slice(0, 3).join(" · ") : t("profile.noCompaniesYet")}</p>
                  </article>
                </div>
                <div className="career-context-overview-card__readiness">
                  <div className="career-context-overview-card__readiness-summary">
                    <span className="page-card__label">{t("profile.readinessByTopic")}</span>
                    <p>{t("profile.readinessByTopicBody")}</p>
                  </div>
                  <div className="career-context-overview-card__bars">
                    {readinessTopics.map((topic) => (
                      <div className="career-context-overview-card__bar-row" key={topic.label}>
                        <span>{topic.label}</span>
                        <div className="career-context-overview-card__bar-track">
                          <div className="career-context-overview-card__bar-fill" style={{ width: `${topic.score}%` }} />
                        </div>
                        <strong>{topic.score}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionPanel>
            );
            const resumeCard = (
              <SectionPanel className="profile-workspace-card" variant="muted">
                <div className="profile-workspace-card__header">
                  <div>
                    <span className="page-card__label">{t("profile.workspaceLabel")}</span>
                    <h2 className="page-card__title">{t("profile.workspaceTitle")}</h2>
                    <p className="page-card__body">{t("profile.workspaceBody")}</p>
                  </div>
                  <span className="detail-chip detail-chip--accent">{t("profile.launcherTag")}</span>
                </div>
                <div className="profile-workspace-groups">
                  <div className="profile-workspace-group">
                    <div className="profile-workspace-group__header">
                      <span className="profile-workspace-group__label">{t("profile.resumeWorkspace")}</span>
                      <p className="profile-workspace-group__body">{t("profile.resumeWorkspaceBody")}</p>
                    </div>
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
                    <div className="profile-workspace-group__header">
                      <span className="profile-workspace-group__label">{t("profile.interviewWorkspace")}</span>
                      <p className="profile-workspace-group__body">{t("profile.interviewWorkspaceBody")}</p>
                    </div>
                    <div className="page-card__actions">
                      <Link className="primary-button" to={routeConfig.interview.buildPath()}>
                        {t("profile.interviewSession")}
                      </Link>
                    </div>
                  </div>
                </div>
              </SectionPanel>
            );
            const contextRailCard = (
              <SectionPanel className="career-context-detail-rail" variant="muted">
                <div className="career-context-detail-rail__header">
                  <div>
                    <span className="page-card__label">{t("profile.projectDetail")}</span>
                    <h2 className="page-card__title">Dreamus Settlement System</h2>
                  </div>
                  <span className="detail-chip">{t("profile.featuredProject")}</span>
                </div>
                <div className="career-context-detail-rail__meta">
                  <strong>{roleLabel}</strong>
                  <span>{experienceYears > 0 ? `${Math.max(1, Math.round(experienceYears * 12))}${isKorean ? t("profile.contextMonthsSuffix") : ` ${t("profile.contextMonthsSuffix")}`}` : t("profile.currentContext")}</span>
                </div>
                <p className="page-card__body">{t("profile.projectDetailBody")}</p>
                <div className="career-context-detail-rail__section">
                  <span className="career-context-detail-rail__label">{t("profile.keyContributions")}</span>
                  <div className="career-context-detail-rail__list">
                    <div>{t("profile.contribution1")}</div>
                    <div>{t("profile.contribution2")}</div>
                    <div>{t("profile.contribution3")}</div>
                  </div>
                </div>
                <div className="career-context-detail-rail__section">
                  <span className="career-context-detail-rail__label">{t("profile.relatedInterviewQuestions")}</span>
                  <div className="career-context-detail-rail__questions">
                    {relatedQuestions.map((question) => (
                      <article className="career-context-detail-rail__question" key={question.title}>
                        <div>
                          <strong>{question.title}</strong>
                          <span>{question.label}</span>
                        </div>
                        <b>{question.score}</b>
                      </article>
                    ))}
                  </div>
                </div>
                <div className="page-card__actions">
                  <Link className="primary-button" to={routeConfig.practice.buildPath()}>
                    {t("profile.practiceThisContext")}
                  </Link>
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
            const operationsCard = (
              <SectionPanel className="profile-workspace-card" variant="muted">
                <div className="profile-workspace-card__header">
                  <div>
                    <span className="page-card__label">{t("profile.operations")}</span>
                    <h2 className="page-card__title">{t("profile.operationsTitle")}</h2>
                    <p className="page-card__body">{t("profile.operationsBody")}</p>
                  </div>
                  <span className="detail-chip detail-chip--accent">{t("profile.separatedControls")}</span>
                </div>
                <div className="profile-workspace-groups">
                  <div className="profile-workspace-group">
                    <div className="profile-workspace-group__header">
                      <span className="profile-workspace-group__label">{t("profile.settingsWorkspace")}</span>
                      <p className="profile-workspace-group__body">{t("profile.settingsWorkspaceBody")}</p>
                    </div>
                    <div className="page-card__actions">
                      <Link className="primary-button" to={routeConfig.settings.buildPath()}>
                        {t("profile.openSettings")}
                      </Link>
                      <Link className="secondary-button" to={routeConfig.scheduledReviews.buildPath()}>
                        {t("sidebar.scheduledReviews")}
                      </Link>
                    </div>
                  </div>
                  <div className="profile-workspace-group">
                    <div className="profile-workspace-group__header">
                      <span className="profile-workspace-group__label">{t("profile.companyPreparation")}</span>
                      <p className="profile-workspace-group__body">{t("profile.companyPreparationBody")}</p>
                    </div>
                    <div className="page-card__actions">
                      <Link className="secondary-button" to={routeConfig.targetCompanies.buildPath()}>
                        {t("profile.openTargetCompanies")}
                      </Link>
                    </div>
                  </div>
                </div>
              </SectionPanel>
            );

            if (!isDesktop) {
              return (
                <ProfileMobileLayout
                  contextRailCard={contextRailCard}
                  overviewCard={overviewCard}
                  operationsCard={operationsCard}
                  profileForm={profileForm}
                  resumeCard={resumeCard}
                  summaryCard={summaryCard}
                />
              );
            }

            return (
              <ProfileDesktopLayout
                contextRailCard={contextRailCard}
                overviewCard={overviewCard}
                operationsCard={operationsCard}
                profileForm={profileForm}
                resumeCard={resumeCard}
                summaryCard={summaryCard}
              />
            );
          })()
        : null}
    </PageContainer>
  );
}
