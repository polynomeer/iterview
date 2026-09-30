import { useState } from "react";
import { Outlet, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom";
import type { ResumeModel, ResumeVersionModel } from "../../entities/resume/model";
import { useActivateResumeVersionMutation } from "../../features/resume/api/useActivateResumeVersionMutation";
import { useActiveResumeVersion } from "../../features/resume/model/useActiveResumeVersion";
import { useResumeVersionStatus } from "../../features/resume/model/useResumeVersionStatus";
import { getErrorDetails, optionalErrorMessage, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { parsingStatusLabel } from "../../shared/lib/labels";
import { Badge, Button, ButtonLink, Callout, ErrorState, PageSkeleton, TabLinks } from "../../shared/ui/primitives";
import { followVersion } from "../../widgets/layout/SidebarNavigation";
import { ResumeVersionSwitcher } from "../../widgets/layout/ResumeVersionSwitcher";
import "./resume.css";

export type ResumeHubContext = {
  versionId: string;
  resume: ResumeModel;
  version: ResumeVersionModel;
  status: ReturnType<typeof useResumeVersionStatus>;
};

/** Shared state for the tabs under /resume/:versionId. */
export function useResumeHub() {
  return useOutletContext<ResumeHubContext>();
}

/**
 * The 이력서 hub (docs/09 §4.5): one version bar, then 개요 · 근거 편집 · 면접 압박 지도 · 공고 맞춤 ·
 * 버전 관리 as route tabs. The version comes from the URL; switching it activates it app-wide.
 */
export function ResumeHubLayout() {
  const { versionId = "" } = useParams<{ versionId: string }>();
  const { t, locale } = useLocale();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { resumes, isLoading, isError, error, refetch } = useActiveResumeVersion();
  const status = useResumeVersionStatus(versionId);
  const activateMutation = useActivateResumeVersionMutation();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  if (isLoading) {
    return <PageSkeleton label={t("resumeHub.loadingYourResume")} />;
  }

  if (isError) {
    return (
      <ErrorState
        actions={
          <Button onClick={() => void refetch()} variant="primary">
            {t("common.tryAgain")}
          </Button>
        }
        body={userFacingErrorMessage(error, t("resumeHub.theResumeListCouldNot"))}
        details={getErrorDetails(error)}
        size="page"
        title={t("resumeHub.unableToLoadYourResume")}
      />
    );
  }

  const resume = resumes.find((candidate) => candidate.versions.some((item) => item.id === versionId));
  const listed = resume?.versions.find((item) => item.id === versionId);

  if (!resume || !listed) {
    return (
      <ErrorState
        actions={
          <ButtonLink to={routeConfig.resume.buildPath()} variant="primary">
            {t("resumeHub.goToMyResume")}
          </ButtonLink>
        }
        body={t("resumeHub.itMayHaveBeenDeleted")}
        icon="search"
        size="page"
        title={t("resumeHub.weCouldntFindThisResume")}
      />
    );
  }

  // The polled detail is fresher than the list while parsing runs.
  const version = status.versionQuery.data?.id === versionId ? { ...listed, ...status.versionQuery.data } : listed;
  const parsing = parsingStatusLabel(version.parsingStatus, locale);
  const activateError = optionalErrorMessage(activateMutation.error, t("resumeHub.weCouldntActivateItTry"));
  const tabs = [
    { to: routeConfig.resumeOverview.buildPath({ versionId }), label: t("nav.resumeOverview"), end: true },
    { to: routeConfig.resumeEditor.buildPath({ versionId }), label: t("nav.resumeClaims") },
    { to: routeConfig.resumeHeatmap.buildPath({ versionId }), label: t("nav.resumeHeatmap") },
    { to: routeConfig.resumeTailorAnalysisList.buildPath({ versionId }), label: t("nav.resumeTailor") },
    { to: routeConfig.resumeVersions.buildPath({ versionId }), label: t("nav.resumeVersions") },
  ];

  return (
    <div className="ui-page resume-hub">
      <header className="resume-hub__bar">
        <div className="resume-hub__identity">
          <h1 className="resume-hub__title">{resume.title}</h1>
          <p className="resume-hub__meta">
            <span>{version.versionNumberLabel}</span>
            {version.fileNameLabel ? <span>{version.fileNameLabel}</span> : null}
            {version.uploadedAtLabel ? <span>{t("resumeHub.uploadedAt", { uploadedAtLabel: version.uploadedAtLabel })}</span> : null}
          </p>
        </div>
        <div className="resume-hub__badges">
          {version.isActive ? (
            <Badge dot tone="accent">
              {t("resumeHub.activeVersion")}
            </Badge>
          ) : null}
          {version.parsingStatus !== "completed" ? (
            <Badge dot tone={parsing.tone}>
              {parsing.label}
            </Badge>
          ) : null}
        </div>
        <Button aria-haspopup="dialog" icon="resume" onClick={() => setSwitcherOpen(true)} size="sm">
          {t("resumeHub.switchVersion")}
        </Button>
      </header>

      {!version.isActive ? (
        <Callout
          title={t("resumeHub.thisIsntYourActiveVersion")}
          tone="warning"
        >
          <p>
            {t("resumeHub.questionPicksInterviewsAndAnswer")}
          </p>
          {activateError ? <p className="ui-tone-text--danger">{activateError}</p> : null}
          <Button
            disabled={!version.canActivate}
            loading={activateMutation.isPending}
            onClick={() => activateMutation.mutate(versionId)}
            size="sm"
          >
            {t("resumeHub.useThisVersion")}
          </Button>
        </Callout>
      ) : null}

      <TabLinks items={tabs} label={t("resumeHub.resumeViews")} />

      <div className="resume-hub__panel">
        <Outlet context={{ versionId, resume, version, status } satisfies ResumeHubContext} />
      </div>

      <ResumeVersionSwitcher
        onActivated={(nextId) => {
          const next = followVersion(pathname, nextId);
          if (next) {
            navigate(next);
          }
        }}
        onClose={() => setSwitcherOpen(false)}
        open={switcherOpen}
      />
    </div>
  );
}
