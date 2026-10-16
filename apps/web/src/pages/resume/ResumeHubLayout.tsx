import { useState } from "react";
import { Outlet, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom";
import type { ResumeModel, ResumeVersionModel } from "../../entities/resume/model";
import { useActivateResumeVersionMutation } from "../../features/resume/api/useActivateResumeVersionMutation";
import { useActiveResumeVersion } from "../../features/resume/model/useActiveResumeVersion";
import { useResumeVersionSnapshotsQuery } from "../../features/resume/api/useResumeVersionSnapshotsQuery";
import { useResumeVersionStatus } from "../../features/resume/model/useResumeVersionStatus";
import { getErrorDetails, optionalErrorMessage, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { parsingStatusLabel } from "../../shared/lib/labels";
import { Badge, Button, ButtonLink, Callout, ErrorState, Icon, PageSkeleton, Progress, TabLinks } from "../../shared/ui/primitives";
import { evidenceStatus } from "../resume-claims/claimModel";
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

/** "N / M 항목에 근거": claims with all four evidence fields written. Hidden until claims exist. */
function EvidenceCoverage({ versionId }: { versionId: string }) {
  const { t } = useLocale();
  const snapshotsQuery = useResumeVersionSnapshotsQuery(versionId);
  const claims = snapshotsQuery.data?.achievements ?? [];
  if (claims.length === 0) {
    return null;
  }
  const done = claims.filter((claim) => evidenceStatus(claim.evidence) === "ready").length;
  return (
    <p className="resume-hub__coverage">
      <span className="resume-hub__coverage-bar">
        <Progress label={t("resumeHub.coverageLabel", { done, total: claims.length })} tone="neutral" value={(done / claims.length) * 100} />
      </span>
      <span className="resume-hub__coverage-count">
        {done} / {claims.length}
      </span>
      <span>{t("resumeHub.coverageSuffix")}</span>
    </p>
  );
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
    { to: routeConfig.resumeOverview.buildPath({ versionId }), label: t("resumeHub.tabOverview"), end: true },
    { to: routeConfig.resumeEditor.buildPath({ versionId }), label: t("resumeHub.tabClaims") },
    { to: routeConfig.resumeHeatmap.buildPath({ versionId }), label: t("resumeHub.tabHeatmap") },
    { to: routeConfig.resumeTailorAnalysisList.buildPath({ versionId }), label: t("resumeHub.tabTailor") },
    { to: routeConfig.resumeVersions.buildPath({ versionId }), label: t("resumeHub.tabVersions") },
  ];

  return (
    <div className="ui-page resume-hub">
      <header className="resume-hub__bar">
        <div className="resume-hub__row">
          <div className="resume-hub__identity">
            <h1 className="resume-hub__title">
              <button
                aria-haspopup="dialog"
                className="resume-hub__switch"
                onClick={() => setSwitcherOpen(true)}
                title={t("resumeHub.switchVersion")}
                type="button"
              >
                {resume.title}
                <Icon name="chevronDown" size={16} />
              </button>
            </h1>
            <p className="resume-hub__meta">
              <span>{version.versionNumberLabel}</span>
              {version.fileNameLabel ? <span>{version.fileNameLabel}</span> : null}
              {version.uploadedAtLabel ? <span>{t("resumeHub.uploadedAt", { uploadedAtLabel: version.uploadedAtLabel })}</span> : null}
            </p>
          </div>
          <div className="resume-hub__badges">
            {version.isActive ? <Badge tone="success">{t("resumeHub.activeVersion")}</Badge> : null}
            {version.parsingStatus !== "completed" ? (
              <Badge dot tone={parsing.tone}>
                {parsing.label}
              </Badge>
            ) : null}
          </div>
          <EvidenceCoverage versionId={versionId} />
        </div>
        <div className="resume-hub__tabs">
          <TabLinks items={tabs} label={t("resumeHub.resumeViews")} />
        </div>
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
