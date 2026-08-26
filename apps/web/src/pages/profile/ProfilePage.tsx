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
  const { t } = useLocale();
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
    experienceYears >= 7 ? "Staff Backend Engineer" : experienceYears >= 4 ? "Senior Backend Engineer" : "Backend Engineer";
  const readinessTopics = [
    { label: "Backend depth", score: 92 },
    { label: "Problem solving", score: 85 },
    { label: "Distributed systems", score: 78 },
    { label: "Communication", score: 75 },
  ];
  const relatedQuestions = [
    { title: "Design a high-throughput settlement system.", score: 85, label: "System Design" },
    { title: "How would you ensure idempotency in transaction processing?", score: 82, label: "System Design" },
    { title: "Why did you choose Kafka for audit logs?", score: 80, label: "Behavioral" },
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
              <span className="page-card__label">Profile workspace</span>
              <span className="question-status-badge question-status-badge--accent">Control surface</span>
            </div>
            <p className="profile-workspace-surface__breadcrumbs">
              Identity
              <span>/</span>
              Practice defaults
              <span>/</span>
              Resume launchers
            </p>
            <h2 className="profile-workspace-surface__title">Keep account controls calm and separate</h2>
            <p className="profile-workspace-surface__body">
              This page should feel like a setup console for interview practice: confirm who you are, define scoring defaults,
              and keep resume work one step away from account edits.
            </p>
          </div>
          <div className="profile-workspace-surface__stats">
            <article className="profile-workspace-surface__stat">
              <span>Primary role</span>
              <strong>{roleLabel}</strong>
            </article>
            <article className="profile-workspace-surface__stat">
              <span>Target companies</span>
              <strong>{targetCompanyCount}</strong>
            </article>
            <article className="profile-workspace-surface__stat">
              <span>Daily load</span>
              <strong>{normalizedDailyQuestionCount}</strong>
            </article>
            <article className="profile-workspace-surface__stat">
              <span>Target score</span>
              <strong>{scoreThresholdLabel}</strong>
            </article>
          </div>
        </div>
        <div className="profile-workspace-surface__chips">
          <span className="detail-chip">{`${t("profile.language")} ${languageLabel}`}</span>
          {currentProfile?.retryEnabled ? <span className="detail-chip detail-chip--accent">Retry queue enabled</span> : null}
          {currentProfile?.jobRole ? <span className="detail-chip">{currentProfile.jobRole}</span> : null}
          {currentProfile?.passScoreThreshold ? <span className="detail-chip">{`Pass line ${currentProfile.passScoreThreshold}%`}</span> : null}
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
                    <span className="page-card__label">Career context snapshot</span>
                    <h2 className="page-card__title">Keep your current role, target role, and company focus visible at a glance</h2>
                    <p className="page-card__body">
                      This should read like the top of an interview workspace, not an account form. The goal is to
                      keep your professional story legible before you jump into editing or practice.
                    </p>
                  </div>
                  <span className="detail-chip detail-chip--accent">Context map</span>
                </div>
                <div className="career-context-overview-card__metrics">
                  <article className="career-context-overview-card__metric">
                    <span>Current role</span>
                    <strong>{roleLabel}</strong>
                    <p>{currentCompanyLabel}</p>
                  </article>
                  <article className="career-context-overview-card__metric">
                    <span>Experience</span>
                    <strong>{experienceYears > 0 ? `${experienceYears.toFixed(1)}` : "0.0"}</strong>
                    <p>Years</p>
                  </article>
                  <article className="career-context-overview-card__metric">
                    <span>Target role</span>
                    <strong>{targetRoleLabel}</strong>
                    <p>Next level</p>
                  </article>
                  <article className="career-context-overview-card__metric">
                    <span>Target companies</span>
                    <strong>{targetCompanies.length}</strong>
                    <p>{targetCompanies.length > 0 ? targetCompanies.slice(0, 3).join(" · ") : "No companies yet"}</p>
                  </article>
                </div>
                <div className="career-context-overview-card__readiness">
                  <div className="career-context-overview-card__readiness-summary">
                    <span className="page-card__label">Interview readiness by topic</span>
                    <p>Use this as a context layer for the rest of the page so strengths and weak areas are visible before editing identity details.</p>
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
                  <span className="detail-chip detail-chip--accent">Launchers</span>
                </div>
                <div className="profile-workspace-groups">
                  <div className="profile-workspace-group">
                    <div className="profile-workspace-group__header">
                      <span className="profile-workspace-group__label">Resume workspace</span>
                      <p className="profile-workspace-group__body">
                        Move into source-of-truth review, resume evidence checks, and skills mapped
                        from resume claims.
                      </p>
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
                      <span className="profile-workspace-group__label">Interview workspace</span>
                      <p className="profile-workspace-group__body">
                        Jump directly into the mock interview flow after the setup surface is
                        stable.
                      </p>
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
                    <span className="page-card__label">Project detail</span>
                    <h2 className="page-card__title">Dreamus Settlement System</h2>
                  </div>
                  <span className="detail-chip">Featured project</span>
                </div>
                <div className="career-context-detail-rail__meta">
                  <strong>{roleLabel}</strong>
                  <span>{experienceYears > 0 ? `${Math.max(1, Math.round(experienceYears * 12))} months of active context` : "Current context"}</span>
                </div>
                <p className="page-card__body">
                  Use one representative project as the source of truth anchor for why your backend decisions, trade-offs,
                  and follow-up answers are credible.
                </p>
                <div className="career-context-detail-rail__section">
                  <span className="career-context-detail-rail__label">Key contributions</span>
                  <div className="career-context-detail-rail__list">
                    <div>Designed scalable transaction processing architecture.</div>
                    <div>Implemented idempotent flows and operational audit logging.</div>
                    <div>Improved system reliability with queue-backed recovery patterns.</div>
                  </div>
                </div>
                <div className="career-context-detail-rail__section">
                  <span className="career-context-detail-rail__label">Related interview questions</span>
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
                    Practice this context
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
                    <span className="page-card__label">Operations</span>
                    <h2 className="page-card__title">Move from identity into settings and company preparation on purpose</h2>
                    <p className="page-card__body">
                      Practice defaults, appearance, review behavior, and company targeting now have their own workspaces.
                    </p>
                  </div>
                  <span className="detail-chip detail-chip--accent">Separated controls</span>
                </div>
                <div className="profile-workspace-groups">
                  <div className="profile-workspace-group">
                    <div className="profile-workspace-group__header">
                      <span className="profile-workspace-group__label">Settings workspace</span>
                      <p className="profile-workspace-group__body">
                        Adjust scoring defaults, language, appearance, and review notification behavior.
                      </p>
                    </div>
                    <div className="page-card__actions">
                      <Link className="primary-button" to={routeConfig.settings.buildPath()}>
                        Open settings
                      </Link>
                      <Link className="secondary-button" to={routeConfig.scheduledReviews.buildPath()}>
                        Scheduled reviews
                      </Link>
                    </div>
                  </div>
                  <div className="profile-workspace-group">
                    <div className="profile-workspace-group__header">
                      <span className="profile-workspace-group__label">Company preparation</span>
                      <p className="profile-workspace-group__body">
                        Keep company lanes and preparation priorities outside the account editing surface.
                      </p>
                    </div>
                    <div className="page-card__actions">
                      <Link className="secondary-button" to={routeConfig.targetCompanies.buildPath()}>
                        Open target companies
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
