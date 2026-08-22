import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useCreateResumeQuestionHeatmapLinkMutation } from "../../features/resume-heatmap/api/useCreateResumeQuestionHeatmapLinkMutation";
import { useResumeQuestionHeatmapOverlayTargetsQuery } from "../../features/resume-heatmap/api/useResumeQuestionHeatmapOverlayTargetsQuery";
import { useResumeQuestionHeatmapQuery } from "../../features/resume-heatmap/api/useResumeQuestionHeatmapQuery";
import { useUpdateResumeQuestionHeatmapLinkMutation } from "../../features/resume-heatmap/api/useUpdateResumeQuestionHeatmapLinkMutation";
import { useResumeVersionDetailQuery } from "../../features/resume/api/useResumeVersionDetailQuery";
import { useResumeVersionSnapshotsQuery } from "../../features/resume/api/useResumeVersionSnapshotsQuery";
import { getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { FeedbackNotice } from "../../shared/ui/FeedbackNotice";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import {
  buildAnchorId,
  buildAnchorOptions,
  getAnchorPreview,
  readFiltersFromSearchParams,
  sortOverlayTargetsForDisplay,
  splitDocumentBlocks,
} from "./heatmapUtils";

type RemapDraft = {
  anchorType: string;
  anchorRecordId: string | null;
  anchorKey: string | null;
  overlayTargetType: string | null;
  overlayFieldPath: string | null;
  overlaySentenceIndex: string;
  overlayTextSnippet: string | null;
  confidenceScore: string;
};

export function ResumeHeatmapAnchorPage() {
  const { versionId, anchorType, anchorId } = useParams<{
    versionId: string;
    anchorType: string;
    anchorId: string;
  }>();
  const safeVersionId = versionId ?? "";
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readFiltersFromSearchParams(searchParams), [searchParams]);
  const selectedTargetKey = searchParams.get("selectedTargetKey");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, RemapDraft>>({});
  const [manualLinkIds, setManualLinkIds] = useState<Record<string, string>>({});
  const versionQuery = useResumeVersionDetailQuery(versionId ?? null);
  const snapshotsQuery = useResumeVersionSnapshotsQuery(versionId ?? null);
  const heatmapQuery = useResumeQuestionHeatmapQuery(versionId ?? null, filters);
  const overlayTargetsQuery = useResumeQuestionHeatmapOverlayTargetsQuery(versionId ?? null, filters);
  const createLinkMutation = useCreateResumeQuestionHeatmapLinkMutation(versionId ?? null);
  const updateLinkMutation = useUpdateResumeQuestionHeatmapLinkMutation(versionId ?? null);

  const selectedAnchor = useMemo(() => {
    if (!heatmapQuery.data || !anchorType || !anchorId) {
      return null;
    }

    return (
      heatmapQuery.data.items.find((item) => {
        const itemId = item.anchorRecordId ?? item.anchorKey ?? item.id;
        return item.anchorType === anchorType && itemId === anchorId;
      }) ?? null
    );
  }, [anchorId, anchorType, heatmapQuery.data]);

  const anchorPreview = selectedAnchor
    ? getAnchorPreview(
        selectedAnchor.anchorType,
        selectedAnchor.anchorRecordId,
        selectedAnchor.anchorKey,
        snapshotsQuery.data,
      )
    : null;
  const anchorOptions = useMemo(
    () => (snapshotsQuery.data ? buildAnchorOptions(snapshotsQuery.data) : []),
    [snapshotsQuery.data],
  );
  const overlayTargets = useMemo(() => {
    if (!selectedAnchor || !overlayTargetsQuery.data) {
      return [];
    }

    return sortOverlayTargetsForDisplay(
      overlayTargetsQuery.data.items.filter(
        (item) =>
          item.anchorType === selectedAnchor.anchorType &&
          item.anchorRecordId === selectedAnchor.anchorRecordId &&
          item.anchorKey === selectedAnchor.anchorKey,
      ),
    );
  }, [overlayTargetsQuery.data, selectedAnchor]);

  const selectedOverlayTarget =
    overlayTargets.find((item) => item.targetKey === selectedTargetKey) ?? null;
  const displayedQuestions =
    selectedOverlayTarget?.linkedQuestions ?? selectedAnchor?.linkedQuestions ?? [];
  const editingQuestion =
    displayedQuestions.find((item) => item.interviewRecordQuestionId === editingQuestionId) ?? null;

  function toggleSelectedTarget(targetKey: string) {
    const next = new URLSearchParams(searchParams);
    if (selectedTargetKey === targetKey) {
      next.delete("selectedTargetKey");
    } else {
      next.set("selectedTargetKey", targetKey);
    }
    setSearchParams(next);
  }

  function openRemapEditor(questionId: string) {
    if (!selectedAnchor) {
      return;
    }

    const sourceQuestion =
      displayedQuestions.find((item) => item.interviewRecordQuestionId === questionId) ?? null;
    setEditingQuestionId(questionId);
    setDrafts((current) => ({
      ...current,
      [questionId]:
        current[questionId] ?? {
          anchorType: selectedAnchor.anchorType,
          anchorRecordId: selectedAnchor.anchorRecordId,
          anchorKey: selectedAnchor.anchorKey,
          overlayTargetType: selectedOverlayTarget?.targetType ?? null,
          overlayFieldPath: selectedOverlayTarget?.fieldPath ?? null,
          overlaySentenceIndex: selectedOverlayTarget?.sentenceIndex?.toString() ?? "",
          overlayTextSnippet: selectedOverlayTarget?.textSnippet ?? null,
          confidenceScore: sourceQuestion?.confidenceScore?.toString() ?? "",
        },
    }));
  }

  async function handleSaveRemap(questionId: string) {
    const draft = drafts[questionId];
    if (!draft) {
      return;
    }

    const nextLink = await createLinkMutation.mutateAsync({
      interviewRecordQuestionId: questionId,
      anchorType: draft.anchorType,
      anchorRecordId: draft.anchorRecordId,
      anchorKey: draft.anchorKey,
      overlayTargetType: draft.overlayTargetType,
      overlayFieldPath: draft.overlayFieldPath,
      overlaySentenceIndex: draft.overlaySentenceIndex ? Number(draft.overlaySentenceIndex) : null,
      overlayTextSnippet: draft.overlayTextSnippet,
      confidenceScore: draft.confidenceScore ? Number(draft.confidenceScore) : null,
    });

    setManualLinkIds((current) => ({ ...current, [questionId]: nextLink.id }));
    setEditingQuestionId(null);
    await Promise.all([heatmapQuery.refetch(), overlayTargetsQuery.refetch()]);
  }

  async function handleDeactivateManualLink(questionId: string) {
    const linkId = manualLinkIds[questionId];
    if (!linkId) {
      return;
    }

    await updateLinkMutation.mutateAsync({
      linkId,
      payload: {
        active: false,
      },
    });

    setManualLinkIds((current) => {
      const next = { ...current };
      delete next[questionId];
      return next;
    });
    await Promise.all([heatmapQuery.refetch(), overlayTargetsQuery.refetch()]);
  }

  if (
    versionQuery.isLoading ||
    heatmapQuery.isLoading ||
    overlayTargetsQuery.isLoading ||
    snapshotsQuery.isLoading
  ) {
    return (
      <PageContainer
        description="Loading the selected resume anchor and its linked interview questions."
        eyebrow="Resume Heatmap"
        title="Preparing anchor detail"
      >
        <LoadingStateCard
          body="Loading routed interview question links for this resume anchor."
          title="Preparing anchor detail"
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
    !overlayTargetsQuery.data ||
    !selectedAnchor
  ) {
    const error =
      versionQuery.error ??
      heatmapQuery.error ??
      overlayTargetsQuery.error ??
      snapshotsQuery.error;

    return (
      <PageContainer
        description="This detailed heatmap anchor view could not be loaded."
        eyebrow="Resume Heatmap"
        title="Anchor unavailable"
      >
        <ErrorStateCard
          body={
            error instanceof Error
              ? error.message
              : "The selected resume anchor could not be loaded."
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
          title="Unable to load anchor detail"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      actions={
        <>
          <Link
            className="secondary-button"
            to={routeConfig.resumeHeatmap.buildPath({ versionId: safeVersionId })}
          >
            Back to heatmap
          </Link>
          <Link className="secondary-button" to={routeConfig.resume.buildPath()}>
            Back to resumes
          </Link>
        </>
      }
      description="Use this detail view for deeper analysis and link correction without cluttering the main resume reading surface."
      eyebrow="Resume Heatmap"
      title={selectedAnchor.label}
    >
      <div className="page-stack resume-heatmap-anchor-workspace">
        {createLinkMutation.error instanceof Error ? (
          <FeedbackNotice
            details={getErrorDetails(createLinkMutation.error)}
            message={createLinkMutation.error.message}
            tone="error"
          />
        ) : null}
        {updateLinkMutation.error instanceof Error ? (
          <FeedbackNotice
            details={getErrorDetails(updateLinkMutation.error)}
            message={updateLinkMutation.error.message}
            tone="error"
          />
        ) : null}

        <section className="resume-heatmap-anchor-workspace-surface">
          <div className="resume-heatmap-anchor-workspace-surface__header">
            <div className="resume-heatmap-anchor-workspace-surface__intro">
              <div className="resume-heatmap-anchor-workspace-surface__eyebrow-row">
                <p className="resume-heatmap-anchor-workspace-surface__breadcrumbs">
                  <span>Resume heatmap</span>
                  <span>/</span>
                  <span>{selectedAnchor.anchorTypeLabel}</span>
                  <span>/</span>
                  <span>Repair workspace</span>
                </p>
                <span className="question-status-badge question-status-badge--neutral">
                  Heat {selectedAnchor.heatScoreLabel}
                </span>
              </div>
              <h2 className="resume-heatmap-anchor-workspace-surface__title">
                {anchorPreview?.title ?? selectedAnchor.label}
              </h2>
              <p className="resume-heatmap-anchor-workspace-surface__body">
                Detailed anchor review is where one resume claim is decomposed into routed
                highlights, linked questions, and manual remaps until the source-of-truth is
                precise enough to survive DFS-style follow-up questioning.
              </p>
            </div>
            <div className="resume-heatmap-anchor-workspace-surface__stats">
              <article className="resume-heatmap-anchor-workspace-surface__stat">
                <span>Questions</span>
                <strong>{selectedAnchor.directQuestionCount}</strong>
              </article>
              <article className="resume-heatmap-anchor-workspace-surface__stat">
                <span>Follow-ups</span>
                <strong>{selectedAnchor.followUpCount}</strong>
              </article>
              <article className="resume-heatmap-anchor-workspace-surface__stat">
                <span>Weak answers</span>
                <strong>{selectedAnchor.weaknessCount}</strong>
              </article>
              <article className="resume-heatmap-anchor-workspace-surface__stat">
                <span>Highlights</span>
                <strong>{overlayTargets.length}</strong>
              </article>
            </div>
          </div>
          <div className="resume-heatmap-anchor-workspace-surface__chips">
            <span className="detail-chip">{selectedAnchor.anchorTypeLabel}</span>
            <span className="detail-chip">
              {selectedOverlayTarget
                ? `Focused target: ${selectedOverlayTarget.targetTypeLabel}`
                : "Focused target: anchor-level review"}
            </span>
            <span className="detail-chip">
              {displayedQuestions.length} linked questions in current scope
            </span>
          </div>
        </section>

        <section className="resume-heatmap-anchor-plan">
          <article className="page-card page-card--muted">
            <span className="page-card__label">Detailed anchor review</span>
            <h2 className="page-card__title">{anchorPreview?.title ?? selectedAnchor.label}</h2>
            {anchorPreview?.description ? (
              <div className="resume-heatmap-document__body">
                {splitDocumentBlocks(anchorPreview.description).map((block, index) => (
                  <p
                    className="resume-heatmap-document__paragraph"
                    key={`${selectedAnchor.id}-${index}`}
                  >
                    {block}
                  </p>
                ))}
              </div>
            ) : null}
            <div className="resume-heatmap-inline-summary">
              <span className="detail-chip">{selectedAnchor.anchorTypeLabel}</span>
              <span className="detail-chip">Heat {selectedAnchor.heatScoreLabel}</span>
              <span className="detail-chip">Questions {selectedAnchor.directQuestionCount}</span>
              <span className="detail-chip">Follow-ups {selectedAnchor.followUpCount}</span>
              <span className="detail-chip">Weak {selectedAnchor.weaknessCount}</span>
            </div>
          </article>

          <article className="page-card resume-heatmap-anchor-plan__signals">
            <div className="section-heading">
              <div>
                <p className="section-heading__eyebrow">Repair plan</p>
                <h2 className="page-card__title">What to fix on this anchor</h2>
              </div>
            </div>
            <div className="resume-heatmap-signal-list">
              <div className="resume-heatmap-signal-list__item">
                <span>Primary risk</span>
                <strong>
                  {selectedAnchor.weaknessCount > 0
                    ? "Weak answers indicate the current source-of-truth is not specific enough."
                    : "No weak answers in this slice, so verify breadth and consistency instead."}
                </strong>
              </div>
              <div className="resume-heatmap-signal-list__item">
                <span>Follow-up depth</span>
                <strong>
                  {selectedAnchor.followUpCount} chained follow-ups were already observed on this
                  claim.
                </strong>
              </div>
              <div className="resume-heatmap-signal-list__item">
                <span>Current focus</span>
                <strong>
                  {selectedOverlayTarget
                    ? selectedOverlayTarget.textSnippet ?? selectedOverlayTarget.fieldPath ?? "Selected highlight"
                    : "Select a routed highlight to narrow the claim to sentence or keyword level."}
                </strong>
              </div>
            </div>
          </article>
        </section>

        {overlayTargets.length > 0 ? (
          <section className="page-card">
            <span className="page-card__label">Overlay targets</span>
            <h2 className="page-card__title">Choose a specific routed highlight</h2>
            <div className="resume-heatmap-document__overlay-flow">
              {overlayTargets.map((target) => (
                <button
                  aria-pressed={selectedTargetKey === target.targetKey}
                  className={`resume-heatmap-document__overlay resume-heatmap-document__overlay--${target.heatTone} ${selectedTargetKey === target.targetKey ? "resume-heatmap-document__overlay--selected" : ""}`}
                  key={target.targetKey}
                  onClick={() => toggleSelectedTarget(target.targetKey)}
                  type="button"
                >
                  <span className="resume-heatmap-document__overlay-label">{target.targetTypeLabel}</span>
                  <strong>{target.textSnippet ?? target.fieldPath ?? target.targetKey}</strong>
                  <span className="resume-heatmap-document__overlay-meta">
                    {target.questionCount} questions
                    {target.followUpCount > 0 ? ` · ${target.followUpCount} follow-ups` : ""}
                    {target.weaknessCount > 0 ? ` · weak ${target.weaknessCount}` : ""}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section className="page-card">
          <span className="page-card__label">Linked questions</span>
          <h2 className="page-card__title">
            {selectedOverlayTarget
              ? `Questions linked to ${selectedOverlayTarget.targetTypeLabel.toLowerCase()} target`
              : "Questions linked to this anchor"}
          </h2>
          {displayedQuestions.length === 0 ? (
            <EmptyStateCard
              body="No linked questions are available for this anchor under the current filter set."
              title="No linked questions"
            />
          ) : (
            <div className="page-stack">
              {displayedQuestions.map((question) => (
                <article className="page-card page-card--muted" key={question.id}>
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">{question.questionTypeLabel}</p>
                      <h3 className="page-card__title">{question.text}</h3>
                    </div>
                    <div className="resume-status-badges">
                      {question.isFollowUp ? (
                        <span className="question-status-badge question-status-badge--accent">
                          Follow-up
                        </span>
                      ) : null}
                      {question.pressureQuestion ? (
                        <span className="question-status-badge question-status-badge--warning">
                          Pressure
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
                    {question.confidenceLabel ? ` · Confidence ${question.confidenceLabel}` : ""}
                  </p>
                  {question.weaknessTags.length > 0 ? (
                    <div className="filter-chip-row">
                      {question.weaknessTags.map((tag) => (
                        <span className="detail-chip" key={`${question.id}-${tag}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
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
                    <button
                      className="secondary-button"
                      onClick={() => openRemapEditor(question.interviewRecordQuestionId)}
                      type="button"
                    >
                      Fix link
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {editingQuestion ? (
          <section className="page-card">
            <span className="page-card__label">Fix link</span>
            <h2 className="page-card__title">Correct this question mapping</h2>
            {(() => {
              const question = editingQuestion;
              const draft = drafts[question.interviewRecordQuestionId];
              const activeOptions = anchorOptions.filter(
                (option) => option.anchorType === (draft?.anchorType ?? selectedAnchor.anchorType),
              );
              const overlayOptions = overlayTargetsQuery.data.items.filter(
                (item) =>
                  item.anchorType === (draft?.anchorType ?? selectedAnchor.anchorType) &&
                  item.anchorRecordId === (draft?.anchorRecordId ?? selectedAnchor.anchorRecordId) &&
                  item.anchorKey === (draft?.anchorKey ?? selectedAnchor.anchorKey),
              );

              return (
                <article className="page-card page-card--muted">
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">{question.questionTypeLabel}</p>
                      <h3 className="page-card__title">{question.text}</h3>
                    </div>
                  </div>
                  <div className="resume-heatmap-remap">
                    <label className="form-field">
                      <span className="form-field__label">Anchor type</span>
                      <select
                        className="form-field__input"
                        onChange={(event) => {
                          const nextType = event.target.value;
                          const fallbackOption =
                            anchorOptions.find((option) => option.anchorType === nextType) ?? null;
                          setDrafts((current) => ({
                            ...current,
                            [question.interviewRecordQuestionId]: {
                              ...current[question.interviewRecordQuestionId],
                              anchorType: nextType,
                              anchorRecordId: fallbackOption?.anchorRecordId ?? null,
                              anchorKey: fallbackOption?.anchorKey ?? null,
                              overlayTargetType: null,
                              overlayFieldPath: null,
                              overlaySentenceIndex: "",
                              overlayTextSnippet: null,
                            },
                          }));
                        }}
                        value={draft?.anchorType ?? selectedAnchor.anchorType}
                      >
                        {["summary", "project", "experience", "skill", "competency"].map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="form-field">
                      <span className="form-field__label">Resume anchor</span>
                      <select
                        className="form-field__input"
                        onChange={(event) => {
                          const selectedOption =
                            activeOptions.find((option) => option.id === event.target.value) ?? null;
                          setDrafts((current) => ({
                            ...current,
                            [question.interviewRecordQuestionId]: {
                              ...current[question.interviewRecordQuestionId],
                              anchorRecordId: selectedOption?.anchorRecordId ?? null,
                              anchorKey: selectedOption?.anchorKey ?? null,
                              overlayTargetType: null,
                              overlayFieldPath: null,
                              overlaySentenceIndex: "",
                              overlayTextSnippet: null,
                            },
                          }));
                        }}
                        value={buildAnchorId(
                          draft?.anchorType ?? selectedAnchor.anchorType,
                          draft?.anchorRecordId ?? selectedAnchor.anchorRecordId,
                          draft?.anchorKey ?? selectedAnchor.anchorKey,
                        )}
                      >
                        {activeOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="form-field">
                      <span className="form-field__label">Overlay target</span>
                      <select
                        className="form-field__input"
                        onChange={(event) => {
                          const value = event.target.value;
                          const selectedOption =
                            overlayOptions.find((option) => option.targetKey === value) ?? null;
                          setDrafts((current) => ({
                            ...current,
                            [question.interviewRecordQuestionId]: {
                              ...current[question.interviewRecordQuestionId],
                              overlayTargetType: selectedOption?.targetType ?? null,
                              overlayFieldPath: selectedOption?.fieldPath ?? null,
                              overlaySentenceIndex: selectedOption?.sentenceIndex?.toString() ?? "",
                              overlayTextSnippet: selectedOption?.textSnippet ?? null,
                            },
                          }));
                        }}
                        value={
                          overlayOptions.find(
                            (option) =>
                              option.targetType === draft?.overlayTargetType &&
                              option.fieldPath === draft?.overlayFieldPath &&
                              (option.sentenceIndex?.toString() ?? "") ===
                                (draft?.overlaySentenceIndex ?? "") &&
                              (option.textSnippet ?? null) === (draft?.overlayTextSnippet ?? null),
                          )?.targetKey ?? ""
                        }
                      >
                        <option value="">Anchor only</option>
                        {overlayOptions.map((option) => (
                          <option key={option.targetKey} value={option.targetKey}>
                            {option.targetTypeLabel}: {option.textSnippet ?? option.fieldPath ?? option.targetKey}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="form-field">
                      <span className="form-field__label">Confidence score</span>
                      <input
                        className="form-field__input"
                        max="1"
                        min="0"
                        onChange={(event) => {
                          setDrafts((current) => ({
                            ...current,
                            [question.interviewRecordQuestionId]: {
                              ...current[question.interviewRecordQuestionId],
                              confidenceScore: event.target.value,
                            },
                          }));
                        }}
                        step="0.01"
                        type="number"
                        value={draft?.confidenceScore ?? ""}
                      />
                    </label>

                    <div className="page-card__actions">
                      <button
                        className="primary-button"
                        disabled={createLinkMutation.isPending}
                        onClick={() => {
                          void handleSaveRemap(question.interviewRecordQuestionId);
                        }}
                        type="button"
                      >
                        {createLinkMutation.isPending ? "Saving..." : "Save manual remap"}
                      </button>
                      <button
                        className="secondary-button"
                        onClick={() => setEditingQuestionId(null)}
                        type="button"
                      >
                        Close editor
                      </button>
                      {question.linkSource === "manual" && manualLinkIds[question.interviewRecordQuestionId] ? (
                        <button
                          className="secondary-button"
                          disabled={updateLinkMutation.isPending}
                          onClick={() => {
                            void handleDeactivateManualLink(question.interviewRecordQuestionId);
                          }}
                          type="button"
                        >
                          Deactivate manual override
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })()}
          </section>
        ) : null}
      </div>
    </PageContainer>
  );
}
