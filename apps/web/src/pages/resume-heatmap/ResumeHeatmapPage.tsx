import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useResumeQuestionHeatmapOverlayTargetsQuery } from "../../features/resume-heatmap/api/useResumeQuestionHeatmapOverlayTargetsQuery";
import { useResumeQuestionHeatmapQuery } from "../../features/resume-heatmap/api/useResumeQuestionHeatmapQuery";
import { useResumeVersionDetailQuery } from "../../features/resume/api/useResumeVersionDetailQuery";
import { useResumeVersionSnapshotsQuery } from "../../features/resume/api/useResumeVersionSnapshotsQuery";
import { getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { useLocale } from "../../shared/i18n";
import { PageContainer } from "../../shared/ui/PageContainer";
import type { ResumeQuestionHeatmapFiltersDto } from "../../shared/types/resumeHeatmap";
import {
  HEATMAP_SCOPES,
  TARGET_TYPE_LABELS,
  buildAnchorId,
  getAnchorPreview,
  readFiltersFromSearchParams,
  sortOverlayTargetsForDisplay,
  splitDocumentBlocks,
  writeFiltersToSearchParams,
} from "./heatmapUtils";

type HeatmapAnchorSection = {
  id: string;
  groupLabel: string;
  title: string;
  metaLabel: string | null;
  anchorTypeLabel: string;
  heatScoreLabel: string;
  heatTone: "low" | "medium" | "high" | "critical";
  bodyBlocks: string[];
  directQuestionCount: number;
  followUpCount: number;
  pressureQuestionCount: number;
  weaknessCount: number;
  overlayTargets: NonNullable<
    ReturnType<typeof useResumeQuestionHeatmapOverlayTargetsQuery>["data"]
  >["items"];
  anchorType: string;
  anchorRecordId: string | null;
  anchorKey: string | null;
};

function localizeHeatmapLabel(value: string | null | undefined, isKorean: boolean) {
  if (!value || !isKorean) {
    return value ?? "";
  }

  const normalized = value.trim();
  const dictionary: Record<string, string> = {
    Profile: "프로필",
    Projects: "프로젝트",
    Experience: "경력",
    Skills: "스킬",
    Competencies: "역량",
    "Other linked anchors": "기타 연결 앵커",
    Project: "프로젝트",
    Sentence: "문장",
    block: "블록",
    sentence: "문장",
    keyword: "키워드",
    Completed: "완료",
    summary: "요약",
    project: "프로젝트",
    experience: "경력",
    skill: "스킬",
    competency: "역량",
    "System Design": "시스템 설계",
    Heuristic: "휴리스틱",
  };

  return dictionary[normalized] ?? value;
}

function localizeScopeLabel(value: string, isKorean: boolean) {
  if (!isKorean) {
    return value;
  }

  switch (value) {
    case "All":
      return "전체";
    case "Main questions":
      return "메인 질문";
    case "Follow-up only":
      return "꼬리질문만";
    default:
      return value;
  }
}

function OverlayQuestionPopover({
  versionId,
  section,
  target,
  onClose,
}: {
  versionId: string;
  section: HeatmapAnchorSection;
  target: HeatmapAnchorSection["overlayTargets"][number];
  onClose: () => void;
}) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  return (
    <div className="resume-heatmap-comment-popover" role="dialog">
      <div className="resume-heatmap-comment-popover__header">
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "연결된 면접 질문" : "Related interview questions"}</p>
          <h4 className="page-card__title">
            {localizeHeatmapLabel(target.targetTypeLabel, isKorean)} · {target.questionCount}
          </h4>
        </div>
        <button className="secondary-button" onClick={onClose} type="button">
          {isKorean ? "닫기" : "Close"}
        </button>
      </div>
      {target.textSnippet ? <p className="resume-tailor-muted">"{target.textSnippet}"</p> : null}
      <div className="page-stack">
        {target.linkedQuestions.slice(0, 3).map((question) => (
          <article className="page-card page-card--muted" key={`${target.targetKey}-${question.id}`}>
            <div className="section-heading">
              <div>
                <p className="section-heading__eyebrow">{question.questionTypeLabel}</p>
                <h5 className="page-card__title">{question.text}</h5>
              </div>
              <div className="resume-status-badges">
                {question.isFollowUp ? (
                  <span className="question-status-badge question-status-badge--accent">
                    {isKorean ? "꼬리질문" : "Follow-up"}
                  </span>
                ) : null}
                {question.weakAnswer ? (
                  <span className="question-status-badge question-status-badge--warning">
                    {isKorean ? "약한 답변" : "Weak answer"}
                  </span>
                ) : null}
              </div>
            </div>
            <p className="resume-tailor-muted">
              {question.interviewDateLabel ?? (isKorean ? "면접 일자 없음" : "Interview date unavailable")}
            </p>
            <div className="page-card__actions">
              <Link
                className="secondary-button"
                to={routeConfig.practicalInterviewQuestion.buildPath({
                  recordId: question.sourceInterviewRecordId,
                  questionId: question.interviewRecordQuestionId,
                })}
              >
                {isKorean ? "면접 리뷰 열기" : "Open interview review"}
              </Link>
              {question.linkedQuestionId ? (
                <Link
                  className="secondary-button"
                  to={routeConfig.questionDetail.buildPath({
                    questionId: question.linkedQuestionId,
                  })}
                >
                  {isKorean ? "학습 질문 열기" : "Open study question"}
                </Link>
              ) : null}
            </div>
          </article>
        ))}
        <div className="page-card__actions">
          <Link
            className="primary-button"
            to={routeConfig.resumeHeatmapAnchor.buildPath({
              versionId,
              anchorId: section.anchorKey ?? section.anchorRecordId ?? section.id,
              anchorType: section.anchorType,
            })}
          >
            {isKorean ? "상세 분석 열기" : "Open detailed analysis"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ResumeHeatmapPage() {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const { versionId } = useParams<{ versionId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readFiltersFromSearchParams(searchParams), [searchParams]);
  const selectedAnchorId = searchParams.get("selectedAnchor");
  const selectedTargetKey = searchParams.get("selectedTargetKey");
  const versionQuery = useResumeVersionDetailQuery(versionId ?? null);
  const snapshotsQuery = useResumeVersionSnapshotsQuery(versionId ?? null);
  const heatmapQuery = useResumeQuestionHeatmapQuery(versionId ?? null, filters);
  const overlayTargetsQuery = useResumeQuestionHeatmapOverlayTargetsQuery(versionId ?? null, filters);

  const sections = useMemo<HeatmapAnchorSection[]>(() => {
    if (!heatmapQuery.data) {
      return [];
    }

    const itemsById = new Map(heatmapQuery.data.items.map((item) => [item.id, item]));
    const overlayByAnchorId = new Map<string, HeatmapAnchorSection["overlayTargets"]>();

    overlayTargetsQuery.data?.items.forEach((target) => {
      const key = buildAnchorId(target.anchorType, target.anchorRecordId, target.anchorKey);
      const current = overlayByAnchorId.get(key) ?? [];
      current.push(target);
      overlayByAnchorId.set(key, current);
    });

    const built: HeatmapAnchorSection[] = [];
    const snapshots = snapshotsQuery.data;

    if (snapshots?.profile) {
      const id = buildAnchorId("summary", null, "summary");
      const item = itemsById.get(id);
      if (item) {
        const preview = getAnchorPreview("summary", null, "summary", snapshots);
        built.push({
          id,
          groupLabel: "Profile",
          title: preview?.title ?? item.label,
          metaLabel: null,
          anchorTypeLabel: item.anchorTypeLabel,
          heatScoreLabel: item.heatScoreLabel,
          heatTone: item.heatTone,
          bodyBlocks: splitDocumentBlocks(preview?.description ?? item.snippet),
          directQuestionCount: item.directQuestionCount,
          followUpCount: item.followUpCount,
          pressureQuestionCount: item.pressureQuestionCount,
          weaknessCount: item.weaknessCount,
          overlayTargets: sortOverlayTargetsForDisplay(overlayByAnchorId.get(id) ?? []),
          anchorType: item.anchorType,
          anchorRecordId: item.anchorRecordId,
          anchorKey: item.anchorKey,
        });
      }
    }

    snapshots?.projects.forEach((project) => {
      const id = buildAnchorId("project", project.sourceRecordId, null);
      const item = itemsById.get(id);

      if (!item) {
        return;
      }

      built.push({
        id,
        groupLabel: "Projects",
        title: project.title,
        metaLabel: project.dateLabel,
        anchorTypeLabel: item.anchorTypeLabel,
        heatScoreLabel: item.heatScoreLabel,
        heatTone: item.heatTone,
        bodyBlocks: splitDocumentBlocks(project.contentText ?? project.summary ?? item.snippet),
        directQuestionCount: item.directQuestionCount,
        followUpCount: item.followUpCount,
        pressureQuestionCount: item.pressureQuestionCount,
        weaknessCount: item.weaknessCount,
        overlayTargets: sortOverlayTargetsForDisplay(overlayByAnchorId.get(id) ?? []),
        anchorType: item.anchorType,
        anchorRecordId: item.anchorRecordId,
        anchorKey: item.anchorKey,
      });
    });

    snapshots?.experiences.forEach((experience) => {
      const id = buildAnchorId("experience", experience.sourceRecordId, null);
      const item = itemsById.get(id);

      if (!item) {
        return;
      }

      built.push({
        id,
        groupLabel: "Experience",
        title: `${experience.companyName} · ${experience.roleName}`,
        metaLabel: experience.dateLabel,
        anchorTypeLabel: item.anchorTypeLabel,
        heatScoreLabel: item.heatScoreLabel,
        heatTone: item.heatTone,
        bodyBlocks: splitDocumentBlocks(experience.impactText ?? experience.summary ?? item.snippet),
        directQuestionCount: item.directQuestionCount,
        followUpCount: item.followUpCount,
        pressureQuestionCount: item.pressureQuestionCount,
        weaknessCount: item.weaknessCount,
        overlayTargets: sortOverlayTargetsForDisplay(overlayByAnchorId.get(id) ?? []),
        anchorType: item.anchorType,
        anchorRecordId: item.anchorRecordId,
        anchorKey: item.anchorKey,
      });
    });

    snapshots?.skills.forEach((skill) => {
      const id = buildAnchorId("skill", skill.sourceRecordId, null);
      const item = itemsById.get(id);

      if (!item) {
        return;
      }

      built.push({
        id,
        groupLabel: "Skills",
        title: skill.label,
        metaLabel: skill.helperText ?? null,
        anchorTypeLabel: item.anchorTypeLabel,
        heatScoreLabel: item.heatScoreLabel,
        heatTone: item.heatTone,
        bodyBlocks: splitDocumentBlocks(skill.value ?? item.snippet),
        directQuestionCount: item.directQuestionCount,
        followUpCount: item.followUpCount,
        pressureQuestionCount: item.pressureQuestionCount,
        weaknessCount: item.weaknessCount,
        overlayTargets: sortOverlayTargetsForDisplay(overlayByAnchorId.get(id) ?? []),
        anchorType: item.anchorType,
        anchorRecordId: item.anchorRecordId,
        anchorKey: item.anchorKey,
      });
    });

    snapshots?.competencies.forEach((competency) => {
      const id = buildAnchorId("competency", competency.sourceRecordId, null);
      const item = itemsById.get(id);

      if (!item) {
        return;
      }

      built.push({
        id,
        groupLabel: "Competencies",
        title: competency.title,
        metaLabel: null,
        anchorTypeLabel: item.anchorTypeLabel,
        heatScoreLabel: item.heatScoreLabel,
        heatTone: item.heatTone,
        bodyBlocks: splitDocumentBlocks(competency.description ?? item.snippet),
        directQuestionCount: item.directQuestionCount,
        followUpCount: item.followUpCount,
        pressureQuestionCount: item.pressureQuestionCount,
        weaknessCount: item.weaknessCount,
        overlayTargets: sortOverlayTargetsForDisplay(overlayByAnchorId.get(id) ?? []),
        anchorType: item.anchorType,
        anchorRecordId: item.anchorRecordId,
        anchorKey: item.anchorKey,
      });
    });

    const knownIds = new Set(built.map((item) => item.id));
    heatmapQuery.data.items.forEach((item) => {
      if (knownIds.has(item.id)) {
        return;
      }

      built.push({
        id: item.id,
        groupLabel: "Other linked anchors",
        title: item.label,
        metaLabel: item.anchorTypeLabel,
        anchorTypeLabel: item.anchorTypeLabel,
        heatScoreLabel: item.heatScoreLabel,
        heatTone: item.heatTone,
        bodyBlocks: splitDocumentBlocks(item.snippet),
        directQuestionCount: item.directQuestionCount,
        followUpCount: item.followUpCount,
        pressureQuestionCount: item.pressureQuestionCount,
        weaknessCount: item.weaknessCount,
        overlayTargets: sortOverlayTargetsForDisplay(overlayByAnchorId.get(item.id) ?? []),
        anchorType: item.anchorType,
        anchorRecordId: item.anchorRecordId,
        anchorKey: item.anchorKey,
      });
    });

    return built;
  }, [heatmapQuery.data, overlayTargetsQuery.data, snapshotsQuery.data]);

  const groupedSections = useMemo(() => {
    const groups = new Map<string, HeatmapAnchorSection[]>();
    sections.forEach((section) => {
      const current = groups.get(section.groupLabel) ?? [];
      current.push(section);
      groups.set(section.groupLabel, current);
    });
    return [...groups.entries()];
  }, [sections]);

  const prioritySections = useMemo(
    () =>
      [...sections]
        .sort((left, right) => {
          const leftScore =
            left.weaknessCount * 5 +
            left.followUpCount * 3 +
            left.pressureQuestionCount * 2 +
            left.directQuestionCount;
          const rightScore =
            right.weaknessCount * 5 +
            right.followUpCount * 3 +
            right.pressureQuestionCount * 2 +
            right.directQuestionCount;

          return rightScore - leftScore;
        })
        .slice(0, 3),
    [sections],
  );

  const overlayTargetCount = useMemo(
    () => sections.reduce((count, section) => count + section.overlayTargets.length, 0),
    [sections],
  );

  function updateFilters(nextFilters: ResumeQuestionHeatmapFiltersDto) {
    const next = writeFiltersToSearchParams(searchParams, nextFilters);
    next.delete("selectedAnchor");
    next.delete("selectedTargetKey");
    setSearchParams(next);
  }

  function toggleSelectedTarget(anchorId: string, targetKey: string) {
    const next = new URLSearchParams(searchParams);

    if (selectedAnchorId === anchorId && selectedTargetKey === targetKey) {
      next.delete("selectedAnchor");
      next.delete("selectedTargetKey");
    } else {
      next.set("selectedAnchor", anchorId);
      next.set("selectedTargetKey", targetKey);
    }

    setSearchParams(next);
  }

  if (!versionId) {
    return (
      <PageContainer
        description={isKorean ? "면접 히트맵을 열기 전에 파싱된 이력서 버전을 선택하세요." : "Choose a parsed resume version before opening the interview heatmap."}
        eyebrow={isKorean ? "이력서 히트맵" : "Resume Heatmap"}
        title={isKorean ? "히트맵을 열 수 없습니다" : "Heatmap unavailable"}
      >
        <EmptyStateCard
          action={{ label: isKorean ? "이력서 열기" : "Open resumes", to: routeConfig.resume.buildPath() }}
          body={isKorean ? "히트맵 경로에는 이력서 버전 ID가 필요합니다." : "The heatmap route needs a resume version id."}
          title={isKorean ? "이력서 버전이 없습니다" : "Missing resume version"}
        />
      </PageContainer>
    );
  }

  if (
    versionQuery.isLoading ||
    heatmapQuery.isLoading ||
    overlayTargetsQuery.isLoading ||
    snapshotsQuery.isLoading
  ) {
    return (
      <PageContainer
        description={isKorean ? "파싱된 이력서 앵커와 연결된 면접 질문을 불러오는 중입니다." : "Loading parsed resume anchors and linked interview questions."}
        eyebrow={isKorean ? "이력서 히트맵" : "Resume Heatmap"}
        title={isKorean ? "면접 히트맵 준비 중" : "Preparing interview heatmap"}
      >
        <LoadingStateCard
          body={isKorean ? "이력서 문서와 라우팅된 면접 질문 오버레이를 불러오는 중입니다." : "Loading the resume document and routed interview question overlays."}
          title={isKorean ? "면접 히트맵 준비 중" : "Preparing interview heatmap"}
        />
      </PageContainer>
    );
  }

  if (
    versionQuery.isError ||
    heatmapQuery.isError ||
    overlayTargetsQuery.isError ||
    snapshotsQuery.isError ||
    !versionQuery.data ||
    !heatmapQuery.data ||
    !overlayTargetsQuery.data
  ) {
    const error =
      versionQuery.error ??
      heatmapQuery.error ??
      overlayTargetsQuery.error ??
      snapshotsQuery.error;

    return (
      <PageContainer
        description={isKorean ? "이력서 면접 히트맵을 불러오지 못했습니다." : "The resume interview heatmap could not be loaded."}
        eyebrow={isKorean ? "이력서 히트맵" : "Resume Heatmap"}
        title={isKorean ? "히트맵을 열 수 없습니다" : "Heatmap unavailable"}
      >
        <ErrorStateCard
          body={
            error instanceof Error
              ? error.message
              : isKorean
                ? "면접 히트맵을 불러오지 못했습니다."
                : "The interview heatmap could not be loaded."
          }
          details={getErrorDetails(error)}
          onAction={() => {
            void Promise.all([
              versionQuery.refetch(),
              heatmapQuery.refetch(),
              overlayTargetsQuery.refetch(),
              snapshotsQuery.refetch(),
            ]);
          }}
          title={isKorean ? "이력서 면접 히트맵을 불러올 수 없습니다" : "Unable to load resume interview heatmap"}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      actions={
        <>
          <Link className="secondary-button" to={routeConfig.resume.buildPath()}>
            {isKorean ? "이력서로 돌아가기" : "Back to resumes"}
          </Link>
          <Link className="secondary-button" to={routeConfig.practicalInterviews.buildPath()}>
            {isKorean ? "실전 면접 열기" : "Open practical interviews"}
          </Link>
        </>
      }
      description={isKorean ? "이력서 자체를 보강 보드로 사용하세요. 가장 뜨거운 주장, 약한 답변, 라우팅된 질문을 정확한 source of truth 줄까지 되짚어가세요." : "Use the resume itself as a repair board. Follow the hottest claims, weak answers, and routed questions back to the exact source line."}
      eyebrow={isKorean ? "Source of truth 히트맵" : "Source-of-truth heatmap"}
      title={versionQuery.data.fileNameLabel}
    >
      <div className="page-stack resume-heatmap-workspace">
        <section className="resume-heatmap-workspace-surface">
          <div className="resume-heatmap-workspace-surface__header">
            <div className="resume-heatmap-workspace-surface__intro">
              <div className="resume-heatmap-workspace-surface__eyebrow-row">
                <p className="resume-heatmap-workspace-surface__breadcrumbs">
                  <span>Source of truth</span>
                  <span>/</span>
                  <span>{isKorean ? "보강 큐" : "Repair queue"}</span>
                  <span>/</span>
                  <span>{isKorean ? "질문 라우팅" : "Question routing"}</span>
                </p>
                <span className="question-status-badge question-status-badge--neutral">
                  {isKorean ? "파싱" : "Parsing"}: {localizeHeatmapLabel(versionQuery.data.parsingStatusLabel, isKorean)}
                </span>
              </div>
              <h2 className="resume-heatmap-workspace-surface__title">
                {isKorean ? "어떤 이력서 주장이 면접 압박에서 먼저 무너지는지 히트맵으로 찾으세요" : "Use the heatmap to find which resume claims break first under interview pressure"}
              </h2>
              <p className="resume-heatmap-workspace-surface__body">
                {isKorean ? "이 화면은 장식용 분석이 아닙니다. 실제 면접 경로에서 반복된 꼬리질문, 약한 답변, 압박 질문을 유발한 주장을 보강하는 큐입니다." : "This is not decorative analytics. It is the repair queue for claims that triggered repeated follow-ups, weak answers, and pressure questions across real interview paths."}
              </p>
            </div>
            <div className="resume-heatmap-workspace-surface__stats">
              <article className="resume-heatmap-workspace-surface__stat">
                <span>{isKorean ? "보강 대상" : "Repair targets"}</span>
                <strong>{heatmapQuery.data.summary.totalAnchors}</strong>
              </article>
              <article className="resume-heatmap-workspace-surface__stat">
                <span>{isKorean ? "연결된 질문" : "Linked questions"}</span>
                <strong>{heatmapQuery.data.summary.totalLinkedQuestions}</strong>
              </article>
              <article className="resume-heatmap-workspace-surface__stat">
                <span>{isKorean ? "약한 답변" : "Weak answers"}</span>
                <strong>{heatmapQuery.data.filterSummary.weakQuestionCount}</strong>
              </article>
              <article className="resume-heatmap-workspace-surface__stat">
                <span>{isKorean ? "라우팅 하이라이트" : "Routed highlights"}</span>
                <strong>{overlayTargetCount}</strong>
              </article>
            </div>
          </div>
          <div className="resume-heatmap-workspace-surface__guidance" aria-label={isKorean ? "히트맵 보강 가이드" : "Heatmap repair guidance"}>
            <article className="resume-heatmap-workspace-surface__guidance-card">
              <span>{isKorean ? "우선순위 원칙" : "Priority rule"}</span>
              <strong>{isKorean ? "약한 답변과 높은 꼬리질문 압력이 함께 붙은 주장부터 보강하세요." : "Repair the claim that combines weak answers with heavy follow-up pressure first."}</strong>
            </article>
            <article className="resume-heatmap-workspace-surface__guidance-card">
              <span>{isKorean ? "라우팅 원칙" : "Routing rule"}</span>
              <strong>{isKorean ? "열기 전에 왜 뜨거워졌는지 질문 패턴이 분명해졌는지 먼저 확인하세요." : "Open the anchor only after the question pattern behind the heat is obvious."}</strong>
            </article>
            <article className="resume-heatmap-workspace-surface__guidance-card">
              <span>{isKorean ? "이탈 원칙" : "Exit rule"}</span>
              <strong>{isKorean ? "취약한 주장 하나라도 더 깔끔한 source of truth 버전을 확보하면 편집으로 돌아가세요." : "Return to editing once one fragile claim has a cleaner source-of-truth version."}</strong>
            </article>
          </div>
          <div className="resume-heatmap-workspace-surface__chips">
            <span className="detail-chip">
              {isKorean ? "가장 약한 앵커" : "Weakest anchor"}: {heatmapQuery.data.summary.weakestAnchorLabel ?? (isKorean ? "없음" : "Not available")}
            </span>
            <span className="detail-chip">
              {isKorean ? "가장 많은 꼬리질문" : "Most follow-ups"}:{" "}
              {heatmapQuery.data.summary.mostFollowedUpAnchorLabel ?? (isKorean ? "없음" : "Not available")}
            </span>
            <span className="detail-chip">
              {isKorean ? "가장 뜨거운 앵커" : "Hottest anchor"}: {heatmapQuery.data.summary.hottestAnchorLabel ?? (isKorean ? "없음" : "Not available")}
            </span>
          </div>
        </section>

        <section className="resume-heatmap-priority-board">
          <article className="page-card resume-heatmap-priority-board__main">
            <div className="section-heading">
              <div>
                <p className="section-heading__eyebrow">{isKorean ? "보강 큐" : "Repair queue"}</p>
                <h3 className="page-card__title">{isKorean ? "가장 취약한 주장부터 시작하세요" : "Start with the most fragile claims"}</h3>
              </div>
            </div>
            <div className="resume-heatmap-priority-board__list">
              {prioritySections.map((section, index) => (
                <article className="resume-heatmap-priority-item" key={section.id}>
                  <div className="resume-heatmap-priority-item__rank">{index + 1}</div>
                  <div className="resume-heatmap-priority-item__body">
                    <div className="resume-heatmap-document__header">
                      <div>
                        <p className="section-heading__eyebrow">
                          {localizeHeatmapLabel(section.groupLabel, isKorean)} · {localizeHeatmapLabel(section.anchorTypeLabel, isKorean)}
                        </p>
                        <h4 className="page-card__title">{section.title}</h4>
                      </div>
                      <span className="question-status-badge question-status-badge--neutral">
                        {isKorean ? "열도" : "Heat"} {section.heatScoreLabel}
                      </span>
                    </div>
                    <p className="resume-tailor-muted">
                      {isKorean ? "약함" : "Weak"} {section.weaknessCount} · {isKorean ? "꼬리질문" : "Follow-ups"} {section.followUpCount} · {isKorean ? "압박" : "Pressure"} {section.pressureQuestionCount} · {isKorean ? "질문" : "Questions"} {section.directQuestionCount}
                    </p>
                    <div className="page-card__actions">
                      <Link
                        className="secondary-button"
                        to={routeConfig.resumeHeatmapAnchor.buildPath({
                          versionId,
                          anchorType: section.anchorType,
                          anchorId: section.anchorRecordId ?? section.anchorKey ?? section.id,
                        })}
                      >
                        {isKorean ? "보강 워크스페이스 열기" : "Open repair workspace"}
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="page-card page-card--muted resume-heatmap-priority-board__side">
            <div className="section-heading">
              <div>
                <p className="section-heading__eyebrow">{isKorean ? "커버리지 신호" : "Coverage signals"}</p>
                <h3 className="page-card__title">{isKorean ? "이번 패스에서 무엇을 보강할지 이 신호로 결정하세요" : "Use these signals to decide what to repair in this pass"}</h3>
              </div>
            </div>
            <div className="resume-heatmap-signal-list">
              <div className="resume-heatmap-signal-list__item">
                <span>{isKorean ? "약한 답변" : "Weak answers"}</span>
                <strong>
                  {isKorean
                    ? `${heatmapQuery.data.filterSummary.weakQuestionCount}개의 답변이 더 강한 근거와 더 명확한 논리를 필요로 합니다.`
                    : `${heatmapQuery.data.filterSummary.weakQuestionCount} answers need stronger evidence and clearer reasoning.`}
                </strong>
              </div>
              <div className="resume-heatmap-signal-list__item">
                <span>{isKorean ? "압박 순간" : "Pressure moments"}</span>
                <strong>
                  {isKorean
                    ? `${heatmapQuery.data.filterSummary.pressureQuestionCount}개의 질문이 표면적인 주장을 넘어 더 깊게 밀어붙였습니다.`
                    : `${heatmapQuery.data.filterSummary.pressureQuestionCount} questions pushed beyond surface-level claims.`}
                </strong>
              </div>
              <div className="resume-heatmap-signal-list__item">
                <span>{isKorean ? "회사 커버리지" : "Company coverage"}</span>
                <strong>
                  {isKorean
                    ? `${heatmapQuery.data.filterSummary.distinctCompanyCount}개의 면접 컨텍스트가 현재 이 버전에 매핑되어 있습니다.`
                    : `${heatmapQuery.data.filterSummary.distinctCompanyCount} interview contexts are currently mapped into this version.`}
                </strong>
              </div>
            </div>
          </article>
        </section>

        <section className="page-card page-card--muted">
          <div className="section-heading">
            <div>
              <p className="section-heading__eyebrow">{isKorean ? "보강 필터" : "Repair filters"}</p>
              <h2 className="page-card__title">{isKorean ? "이력서 자체는 건드리지 않고 분석 시야만 바꾸세요" : "Change the analysis lens without changing the resume itself"}</h2>
            </div>
          </div>
          <p className="page-card__body">
            {isKorean
              ? "원본 이력서는 그대로 두고, 보강 큐를 한 번에 하나의 면접 패턴으로 좁혀가세요."
              : "Keep the underlying resume untouched while narrowing the repair queue to one interview pattern at a time."}
          </p>
          <div className="filter-chip-row">
            {HEATMAP_SCOPES.map((item) => (
              <button
                className={`detail-chip detail-chip--interactive ${filters.scope === item.value ? "detail-chip--active" : ""}`}
                key={item.value}
                onClick={() => updateFilters({ ...filters, scope: item.value })}
                type="button"
              >
                {localizeScopeLabel(item.label, isKorean)}
              </button>
            ))}
          </div>
          <div className="resume-heatmap-filters">
            <label className="form-field form-field--checkbox">
              <span className="form-field__label">{isKorean ? "약한 답변만" : "Weak only"}</span>
              <input
                checked={Boolean(filters.weakOnly)}
                onChange={(event) => updateFilters({ ...filters, weakOnly: event.target.checked })}
                type="checkbox"
              />
            </label>
            <label className="form-field">
              <span className="form-field__label">{isKorean ? "회사" : "Company"}</span>
              <input
                className="form-field__input"
                list="resume-heatmap-companies"
                onChange={(event) => updateFilters({ ...filters, companyName: event.target.value })}
                placeholder={isKorean ? "회사로 필터" : "Filter by company"}
                type="text"
                value={filters.companyName ?? ""}
              />
              <datalist id="resume-heatmap-companies">
                {heatmapQuery.data.filterSummary.companyNames.map((companyName) => (
                  <option key={companyName} value={companyName} />
                ))}
              </datalist>
            </label>
            <label className="form-field">
              <span className="form-field__label">{isKorean ? "면접 시작일" : "Interview date from"}</span>
              <input
                className="form-field__input"
                onChange={(event) =>
                  updateFilters({ ...filters, interviewDateFrom: event.target.value })
                }
                type="date"
                value={filters.interviewDateFrom ?? ""}
              />
            </label>
            <label className="form-field">
              <span className="form-field__label">{isKorean ? "면접 종료일" : "Interview date to"}</span>
              <input
                className="form-field__input"
                onChange={(event) =>
                  updateFilters({ ...filters, interviewDateTo: event.target.value })
                }
                type="date"
                value={filters.interviewDateTo ?? ""}
              />
            </label>
          </div>
          <div className="filter-chip-row">
            <button
              className={`detail-chip detail-chip--interactive ${!filters.targetType ? "detail-chip--active" : ""}`}
              onClick={() => updateFilters({ ...filters, targetType: undefined })}
              type="button"
            >
              {isKorean ? "전체 타깃 유형" : "All target types"}
            </button>
            {heatmapQuery.data.filterSummary.availableTargetTypes.map((targetType) => (
              <button
                className={`detail-chip detail-chip--interactive ${filters.targetType === targetType ? "detail-chip--active" : ""}`}
                key={targetType}
                onClick={() => updateFilters({ ...filters, targetType })}
                type="button"
              >
                {localizeHeatmapLabel(TARGET_TYPE_LABELS[targetType], isKorean)} (
                {heatmapQuery.data.filterSummary.targetTypeCounts[targetType] ?? 0})
              </button>
            ))}
          </div>
        </section>

        {sections.length === 0 ? (
          <EmptyStateCard
            action={{ label: isKorean ? "실전 면접 열기" : "Open practical interviews", to: routeConfig.practicalInterviews.buildPath() }}
            body={
              heatmapQuery.data.filterSummary.totalQuestions > 0
                ? isKorean
                  ? "현재 필터와 일치하는 이력서 앵커가 없습니다."
                  : "No resume anchors match the current filter set."
                : isKorean
                  ? "히트맵은 실전 면접 질문이 이 이력서 버전으로 다시 매핑된 뒤 나타납니다."
                  : "The heatmap appears after practical interview questions have been mapped back onto this resume version."
            }
            title={isKorean ? "이 화면에 매핑된 면접 질문이 없습니다" : "No mapped interview questions for this view"}
          />
        ) : (
          <div className="resume-heatmap-single-page">
            {groupedSections.map(([groupLabel, groupSections]) => (
              <section className="page-stack resume-heatmap-group" key={groupLabel}>
                <div className="section-heading">
                  <div>
                    <p className="section-heading__eyebrow">{isKorean ? "이력서 섹션" : "Resume section"}</p>
                    <h2 className="page-card__title">{localizeHeatmapLabel(groupLabel, isKorean)}</h2>
                  </div>
                </div>
                <div className="page-stack resume-heatmap-group__stack">
                  {groupSections.map((section) => (
                    <article
                      className={`page-card resume-heatmap-document__surface resume-heatmap-document__surface--${section.heatTone}`}
                      key={section.id}
                    >
                      <div className="resume-heatmap-document__header">
                        <div>
                          <p className="section-heading__eyebrow">{localizeHeatmapLabel(section.anchorTypeLabel, isKorean)}</p>
                          <h3 className="page-card__title">{section.title}</h3>
                          {section.metaLabel ? (
                            <p className="resume-tailor-muted">{section.metaLabel}</p>
                          ) : null}
                        </div>
                        <span className="question-status-badge question-status-badge--neutral">
                          {isKorean ? "열도" : "Heat"} {section.heatScoreLabel}
                        </span>
                      </div>
                      <div className="resume-heatmap-inline-summary">
                        <span className="detail-chip">{isKorean ? "질문" : "Questions"} {section.directQuestionCount}</span>
                        <span className="detail-chip">{isKorean ? "꼬리질문" : "Follow-ups"} {section.followUpCount}</span>
                        <span className="detail-chip">{isKorean ? "압박" : "Pressure"} {section.pressureQuestionCount}</span>
                        <span className="detail-chip">{isKorean ? "약함" : "Weak"} {section.weaknessCount}</span>
                      </div>
                      <div className="resume-heatmap-document__body">
                        {(section.bodyBlocks.length > 0
                          ? section.bodyBlocks
                          : [isKorean ? "이 앵커에는 아직 파싱된 source of truth 텍스트가 없습니다." : "No parsed source text is available for this anchor yet."]
                        ).map((block, index) => (
                          <p className="resume-heatmap-document__paragraph" key={`${section.id}-${index}`}>
                            {block}
                          </p>
                        ))}
                      </div>
                      {section.overlayTargets.length > 0 ? (
                        <div className="resume-heatmap-document__group">
                          <p className="resume-tailor-muted">
                            {isKorean ? "하이라이트된 블록, 문장, 구문, 키워드를 눌러 이 위치에서 관련 질문을 여세요." : "Click a highlighted block, sentence, phrase, or keyword to open related questions in place."}
                          </p>
                          <div className="resume-heatmap-document__overlay-flow">
                            {section.overlayTargets.map((target) => {
                              const isKeyword = target.targetType === "keyword";
                              const isSelected =
                                selectedAnchorId === section.id &&
                                selectedTargetKey === target.targetKey;

                              return (
                                <div className="resume-heatmap-document__overlay-entry" key={target.targetKey}>
                                  <button
                                    aria-pressed={isSelected}
                                    className={
                                      isKeyword
                                        ? `detail-chip detail-chip--interactive resume-heatmap-document__keyword resume-heatmap-document__keyword--${target.heatTone} ${isSelected ? "detail-chip--active" : ""}`
                                        : `resume-heatmap-document__overlay resume-heatmap-document__overlay--${target.heatTone} ${isSelected ? "resume-heatmap-document__overlay--selected" : ""}`
                                    }
                                    onClick={() => toggleSelectedTarget(section.id, target.targetKey)}
                                    type="button"
                                  >
                                    {!isKeyword ? (
                                      <>
                                        <span className="resume-heatmap-document__overlay-label">
                                          {localizeHeatmapLabel(target.targetTypeLabel, isKorean)}
                                        </span>
                                        <strong>{target.textSnippet ?? target.fieldPath ?? target.targetKey}</strong>
                                        <span className="resume-heatmap-document__overlay-meta">
                                          {target.questionCount} {isKorean ? "질문" : "questions"}
                                          {target.followUpCount > 0 ? ` · ${target.followUpCount} ${isKorean ? "꼬리질문" : "follow-ups"}` : ""}
                                          {target.pressureQuestionCount > 0
                                            ? ` · ${isKorean ? "압박" : "pressure"} ${target.pressureQuestionCount}`
                                            : ""}
                                          {target.weaknessCount > 0 ? ` · ${isKorean ? "약함" : "weak"} ${target.weaknessCount}` : ""}
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        {target.textSnippet ?? target.targetKey}
                                        {" · "}
                                        {target.questionCount}
                                      </>
                                    )}
                                  </button>
                                  {isSelected ? (
                                    <OverlayQuestionPopover
                                      onClose={() => toggleSelectedTarget(section.id, target.targetKey)}
                                      versionId={versionId}
                                      section={section}
                                      target={target}
                                    />
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                      <div className="page-card__actions">
                        <Link
                          className="secondary-button"
                          to={routeConfig.resumeHeatmapAnchor.buildPath({
                            versionId,
                            anchorType: section.anchorType,
                            anchorId: section.anchorRecordId ?? section.anchorKey ?? section.id,
                          })}
                        >
                          {isKorean ? "상세 분석 열기" : "Open detailed analysis"}
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
