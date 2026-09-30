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
  const isKorean = locale === "ko";
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { resumes, isLoading, isError, error, refetch } = useActiveResumeVersion();
  const status = useResumeVersionStatus(versionId);
  const activateMutation = useActivateResumeVersionMutation();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  if (isLoading) {
    return <PageSkeleton label={isKorean ? "이력서를 불러오는 중" : "Loading your resume"} />;
  }

  if (isError) {
    return (
      <ErrorState
        actions={
          <Button onClick={() => void refetch()} variant="primary">
            {t("common.tryAgain")}
          </Button>
        }
        body={userFacingErrorMessage(error, isKorean ? "이력서 목록을 불러오지 못했어요." : "The resume list could not be loaded.")}
        details={getErrorDetails(error)}
        size="page"
        title={isKorean ? "이력서를 불러올 수 없어요" : "Unable to load your resume"}
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
            {isKorean ? "내 이력서로" : "Go to my resume"}
          </ButtonLink>
        }
        body={isKorean ? "삭제되었거나 다른 계정의 이력서일 수 있어요." : "It may have been deleted or belong to another account."}
        icon="search"
        size="page"
        title={isKorean ? "이 이력서 버전을 찾을 수 없어요" : "We couldn't find this resume version"}
      />
    );
  }

  // The polled detail is fresher than the list while parsing runs.
  const version = status.versionQuery.data?.id === versionId ? { ...listed, ...status.versionQuery.data } : listed;
  const parsing = parsingStatusLabel(version.parsingStatus, locale);
  const activateError = optionalErrorMessage(activateMutation.error, isKorean ? "활성화하지 못했어요. 다시 시도하세요." : "We couldn't activate it. Try again.");
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
            {version.uploadedAtLabel ? <span>{isKorean ? `${version.uploadedAtLabel} 업로드` : `Uploaded ${version.uploadedAtLabel}`}</span> : null}
          </p>
        </div>
        <div className="resume-hub__badges">
          {version.isActive ? (
            <Badge dot tone="accent">
              {isKorean ? "사용 중인 버전" : "Active version"}
            </Badge>
          ) : null}
          {version.parsingStatus !== "completed" ? (
            <Badge dot tone={parsing.tone}>
              {parsing.label}
            </Badge>
          ) : null}
        </div>
        <Button aria-haspopup="dialog" icon="resume" onClick={() => setSwitcherOpen(true)} size="sm">
          {isKorean ? "버전 바꾸기" : "Switch version"}
        </Button>
      </header>

      {!version.isActive ? (
        <Callout
          title={isKorean ? "지금 사용 중인 버전이 아니에요" : "This isn't your active version"}
          tone="warning"
        >
          <p>
            {isKorean
              ? "질문 추천, 면접, 답변 평가는 사용 중인 버전을 기준으로 해요."
              : "Question picks, interviews, and answer grading use the active version."}
          </p>
          {activateError ? <p className="ui-tone-text--danger">{activateError}</p> : null}
          <Button
            disabled={!version.canActivate}
            loading={activateMutation.isPending}
            onClick={() => activateMutation.mutate(versionId)}
            size="sm"
          >
            {isKorean ? "이 버전 사용하기" : "Use this version"}
          </Button>
        </Callout>
      ) : null}

      <TabLinks items={tabs} label={isKorean ? "이력서 보기" : "Resume views"} />

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
