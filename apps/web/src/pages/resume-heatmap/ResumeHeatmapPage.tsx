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
  return (
    <div className="resume-heatmap-comment-popover" role="dialog">
      <div className="resume-heatmap-comment-popover__header">
        <div>
          <p className="section-heading__eyebrow">Related interview questions</p>
          <h4 className="page-card__title">
            {target.targetTypeLabel} · {target.questionCount}
          </h4>
        </div>
        <button className="secondary-button" onClick={onClose} type="button">
          Close
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
                    Follow-up
                  </span>
                ) : null}
                {question.weakAnswer ? (
                  <span className="question-status-badge question-status-badge--warning">
                    Weak answer
                  </span>
                ) : null}
              </div>
            </div>
            <p className="resume-tailor-muted">
              {question.interviewDateLabel ?? "Interview date unavailable"}
            </p>
            <div className="page-card__actions">
              <Link
                className="secondary-button"
                to={routeConfig.practicalInterviewQuestion.buildPath({
                  recordId: question.sourceInterviewRecordId,
                  questionId: question.interviewRecordQuestionId,
                })}
              >
                Open interview review
              </Link>
              {question.linkedQuestionId ? (
                <Link
                  className="secondary-button"
                  to={routeConfig.questionDetail.buildPath({
                    questionId: question.linkedQuestionId,
                  })}
                >
                  Open study question
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
            Open detailed analysis
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ResumeHeatmapPage() {
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
        description="Choose a parsed resume version before opening the interview heatmap."
        eyebrow="Resume Heatmap"
        title="Heatmap unavailable"
      >
        <EmptyStateCard
          action={{ label: "Open resumes", to: routeConfig.resume.buildPath() }}
          body="The heatmap route needs a resume version id."
          title="Missing resume version"
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
        description="Loading parsed resume anchors and linked interview questions."
        eyebrow="Resume Heatmap"
        title="Preparing interview heatmap"
      >
        <LoadingStateCard
          body="Loading the resume document and routed interview question overlays."
          title="Preparing interview heatmap"
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
        description="The resume interview heatmap could not be loaded."
        eyebrow="Resume Heatmap"
        title="Heatmap unavailable"
      >
        <ErrorStateCard
          body={
            error instanceof Error
              ? error.message
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
          title="Unable to load resume interview heatmap"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      actions={
        <>
          <Link className="secondary-button" to={routeConfig.resume.buildPath()}>
            Back to resumes
          </Link>
          <Link className="secondary-button" to={routeConfig.practicalInterviews.buildPath()}>
            Open practical interviews
          </Link>
        </>
      }
      description="Use the resume itself as the main review surface. Click a highlighted block or sentence to open its related interview questions in place."
      eyebrow="Resume Heatmap"
      title={versionQuery.data.fileNameLabel}
    >
      <div className="page-stack resume-heatmap-workspace">
        <section className="resume-heatmap-workspace-surface">
          <div className="resume-heatmap-workspace-surface__header">
            <div className="resume-heatmap-workspace-surface__intro">
              <div className="resume-heatmap-workspace-surface__eyebrow-row">
                <p className="resume-heatmap-workspace-surface__breadcrumbs">
                  <span>Resume intelligence</span>
                  <span>/</span>
                  <span>Question routing</span>
                </p>
                <span className="question-status-badge question-status-badge--neutral">
                  Parsing: {versionQuery.data.parsingStatusLabel}
                </span>
              </div>
              <h2 className="resume-heatmap-workspace-surface__title">
                Interview heatmap overview
              </h2>
              <p className="resume-heatmap-workspace-surface__body">
                Resume heatmap is not a decorative chart. It is the repair queue for source-of-truth
                claims that triggered repeated follow-ups, weak answers, and pressure questions.
              </p>
            </div>
            <div className="resume-heatmap-workspace-surface__stats">
              <article className="resume-heatmap-workspace-surface__stat">
                <span>Repair targets</span>
                <strong>{heatmapQuery.data.summary.totalAnchors}</strong>
              </article>
              <article className="resume-heatmap-workspace-surface__stat">
                <span>Linked questions</span>
                <strong>{heatmapQuery.data.summary.totalLinkedQuestions}</strong>
              </article>
              <article className="resume-heatmap-workspace-surface__stat">
                <span>Weak answers</span>
                <strong>{heatmapQuery.data.filterSummary.weakQuestionCount}</strong>
              </article>
              <article className="resume-heatmap-workspace-surface__stat">
                <span>Routed highlights</span>
                <strong>{overlayTargetCount}</strong>
              </article>
            </div>
          </div>
          <div className="resume-heatmap-workspace-surface__chips">
            <span className="detail-chip">
              Weakest anchor: {heatmapQuery.data.summary.weakestAnchorLabel ?? "Not available"}
            </span>
            <span className="detail-chip">
              Most follow-ups:{" "}
              {heatmapQuery.data.summary.mostFollowedUpAnchorLabel ?? "Not available"}
            </span>
            <span className="detail-chip">
              Hottest anchor: {heatmapQuery.data.summary.hottestAnchorLabel ?? "Not available"}
            </span>
          </div>
        </section>

        <section className="resume-heatmap-priority-board">
          <article className="page-card resume-heatmap-priority-board__main">
            <div className="section-heading">
              <div>
                <p className="section-heading__eyebrow">Repair queue</p>
                <h3 className="page-card__title">Start with the most fragile claims</h3>
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
                          {section.groupLabel} · {section.anchorTypeLabel}
                        </p>
                        <h4 className="page-card__title">{section.title}</h4>
                      </div>
                      <span className="question-status-badge question-status-badge--neutral">
                        Heat {section.heatScoreLabel}
                      </span>
                    </div>
                    <p className="resume-tailor-muted">
                      Weak {section.weaknessCount} · Follow-ups {section.followUpCount} · Pressure{" "}
                      {section.pressureQuestionCount} · Questions {section.directQuestionCount}
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
                        Open repair workspace
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
                <p className="section-heading__eyebrow">Coverage signals</p>
                <h3 className="page-card__title">What this pass should answer</h3>
              </div>
            </div>
            <div className="resume-heatmap-signal-list">
              <div className="resume-heatmap-signal-list__item">
                <span>Weak answers</span>
                <strong>
                  {heatmapQuery.data.filterSummary.weakQuestionCount} answers need stronger
                  evidence and clearer reasoning.
                </strong>
              </div>
              <div className="resume-heatmap-signal-list__item">
                <span>Pressure moments</span>
                <strong>
                  {heatmapQuery.data.filterSummary.pressureQuestionCount} questions pushed beyond
                  surface-level claims.
                </strong>
              </div>
              <div className="resume-heatmap-signal-list__item">
                <span>Company coverage</span>
                <strong>
                  {heatmapQuery.data.filterSummary.distinctCompanyCount} interview contexts are
                  currently mapped into this version.
                </strong>
              </div>
            </div>
          </article>
        </section>

        <section className="page-card page-card--muted">
          <div className="section-heading">
            <div>
              <p className="section-heading__eyebrow">Resume-centered review</p>
              <h2 className="page-card__title">Filters and routing controls</h2>
            </div>
          </div>
          <p className="page-card__body">
            Keep the original resume untouched while changing the analysis lens. Narrow the queue
            to a specific interview pattern before drilling into each anchor.
          </p>
          <div className="filter-chip-row">
            {HEATMAP_SCOPES.map((item) => (
              <button
                className={`detail-chip detail-chip--interactive ${filters.scope === item.value ? "detail-chip--active" : ""}`}
                key={item.value}
                onClick={() => updateFilters({ ...filters, scope: item.value })}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="resume-heatmap-filters">
            <label className="form-field form-field--checkbox">
              <span className="form-field__label">Weak only</span>
              <input
                checked={Boolean(filters.weakOnly)}
                onChange={(event) => updateFilters({ ...filters, weakOnly: event.target.checked })}
                type="checkbox"
              />
            </label>
            <label className="form-field">
              <span className="form-field__label">Company</span>
              <input
                className="form-field__input"
                list="resume-heatmap-companies"
                onChange={(event) => updateFilters({ ...filters, companyName: event.target.value })}
                placeholder="Filter by company"
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
              <span className="form-field__label">Interview date from</span>
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
              <span className="form-field__label">Interview date to</span>
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
              All target types
            </button>
            {heatmapQuery.data.filterSummary.availableTargetTypes.map((targetType) => (
              <button
                className={`detail-chip detail-chip--interactive ${filters.targetType === targetType ? "detail-chip--active" : ""}`}
                key={targetType}
                onClick={() => updateFilters({ ...filters, targetType })}
                type="button"
              >
                {TARGET_TYPE_LABELS[targetType]} (
                {heatmapQuery.data.filterSummary.targetTypeCounts[targetType] ?? 0})
              </button>
            ))}
          </div>
        </section>

        {sections.length === 0 ? (
          <EmptyStateCard
            action={{ label: "Open practical interviews", to: routeConfig.practicalInterviews.buildPath() }}
            body={
              heatmapQuery.data.filterSummary.totalQuestions > 0
                ? "No resume anchors match the current filter set."
                : "The heatmap appears after practical interview questions have been mapped back onto this resume version."
            }
            title="No mapped interview questions for this view"
          />
        ) : (
          <div className="resume-heatmap-single-page">
            {groupedSections.map(([groupLabel, groupSections]) => (
              <section className="page-stack resume-heatmap-group" key={groupLabel}>
                <div className="section-heading">
                  <div>
                    <p className="section-heading__eyebrow">Resume section</p>
                    <h2 className="page-card__title">{groupLabel}</h2>
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
                          <p className="section-heading__eyebrow">{section.anchorTypeLabel}</p>
                          <h3 className="page-card__title">{section.title}</h3>
                          {section.metaLabel ? (
                            <p className="resume-tailor-muted">{section.metaLabel}</p>
                          ) : null}
                        </div>
                        <span className="question-status-badge question-status-badge--neutral">
                          Heat {section.heatScoreLabel}
                        </span>
                      </div>
                      <div className="resume-heatmap-inline-summary">
                        <span className="detail-chip">Questions {section.directQuestionCount}</span>
                        <span className="detail-chip">Follow-ups {section.followUpCount}</span>
                        <span className="detail-chip">Pressure {section.pressureQuestionCount}</span>
                        <span className="detail-chip">Weak {section.weaknessCount}</span>
                      </div>
                      <div className="resume-heatmap-document__body">
                        {(section.bodyBlocks.length > 0
                          ? section.bodyBlocks
                          : ["No parsed source text is available for this anchor yet."]
                        ).map((block, index) => (
                          <p className="resume-heatmap-document__paragraph" key={`${section.id}-${index}`}>
                            {block}
                          </p>
                        ))}
                      </div>
                      {section.overlayTargets.length > 0 ? (
                        <div className="resume-heatmap-document__group">
                          <p className="resume-tailor-muted">
                            Click a highlighted block, sentence, phrase, or keyword to open related questions in place.
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
                                          {target.targetTypeLabel}
                                        </span>
                                        <strong>{target.textSnippet ?? target.fieldPath ?? target.targetKey}</strong>
                                        <span className="resume-heatmap-document__overlay-meta">
                                          {target.questionCount} questions
                                          {target.followUpCount > 0 ? ` · ${target.followUpCount} follow-ups` : ""}
                                          {target.pressureQuestionCount > 0
                                            ? ` · pressure ${target.pressureQuestionCount}`
                                            : ""}
                                          {target.weaknessCount > 0 ? ` · weak ${target.weaknessCount}` : ""}
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
                          Open detailed analysis
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
