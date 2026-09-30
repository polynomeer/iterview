import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import type { ResumeQuestionHeatmapQuestionModel } from "../../entities/resume-heatmap/model";
import { useCreateResumeQuestionHeatmapLinkMutation } from "../../features/resume-heatmap/api/useCreateResumeQuestionHeatmapLinkMutation";
import { useResumeQuestionHeatmapOverlayTargetsQuery } from "../../features/resume-heatmap/api/useResumeQuestionHeatmapOverlayTargetsQuery";
import { useResumeQuestionHeatmapQuery } from "../../features/resume-heatmap/api/useResumeQuestionHeatmapQuery";
import { useUpdateResumeQuestionHeatmapLinkMutation } from "../../features/resume-heatmap/api/useUpdateResumeQuestionHeatmapLinkMutation";
import { useResumeVersionSnapshotsQuery } from "../../features/resume/api/useResumeVersionSnapshotsQuery";
import { getErrorDetails, optionalErrorMessage, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import {
  Button,
  ButtonLink,
  Callout,
  Card,
  CardHeader,
  Dialog,
  EmptyState,
  ErrorState,
  Field,
  PageSkeleton,
  Select,
} from "../../shared/ui/primitives";
import { HeatBadge, LinkedQuestionRow, PressureCounts, useHeatmapCopy } from "./heatmapParts";
import {
  anchorPathId,
  buildAnchorId,
  buildAnchorOptions,
  buildHeatmapAnchors,
  readFiltersFromSearchParams,
  type AnchorOption,
} from "./heatmapUtils";
import "./heatmap.css";

const ANCHOR_TYPES = ["summary", "project", "experience", "skill", "competency"] as const;

type OverlayOption = NonNullable<ReturnType<typeof useResumeQuestionHeatmapOverlayTargetsQuery>["data"]>["items"][number];

type LinkDraft = { anchorId: string; targetKey: string };

/** Move one interview question to the resume claim (and optionally the exact line) it really targeted. */
function FixLinkDialog({
  question,
  initial,
  anchorOptions,
  overlayOptions,
  pending,
  error,
  onSave,
  onClose,
}: {
  question: ResumeQuestionHeatmapQuestionModel;
  initial: LinkDraft;
  anchorOptions: AnchorOption[];
  overlayOptions: OverlayOption[];
  pending: boolean;
  error: string | null;
  onSave: (anchor: AnchorOption, overlay: OverlayOption | null) => void;
  onClose: () => void;
}) {
  const { copy, group, target: targetLabel } = useHeatmapCopy();
  const [draft, setDraft] = useState(initial);
  const anchor = anchorOptions.find((option) => option.id === draft.anchorId) ?? null;
  const overlays = anchor
    ? overlayOptions.filter((item) => buildAnchorId(item.anchorType, item.anchorRecordId, item.anchorKey) === anchor.id)
    : [];
  const overlay = overlays.find((item) => item.targetKey === draft.targetKey) ?? null;

  return (
    <Dialog
      closeLabel={copy("닫기", "Close")}
      description={question.text}
      footer={
        <>
          <Button onClick={onClose} variant="ghost">
            {copy("취소", "Cancel")}
          </Button>
          <Button disabled={!anchor} loading={pending} onClick={() => anchor && onSave(anchor, overlay)} variant="primary">
            {copy("연결 저장", "Save link")}
          </Button>
        </>
      }
      onClose={onClose}
      open
      title={copy("질문이 겨냥한 이력서 부분 고치기", "Fix what this question targeted")}
    >
      <div className="heatmap-link-form">
        {error ? <Callout tone="danger">{error}</Callout> : null}
        <Field label={copy("이력서 항목", "Resume item")}>
          {(control) => (
            <Select {...control} onChange={(event) => setDraft({ anchorId: event.target.value, targetKey: "" })} value={draft.anchorId}>
              {ANCHOR_TYPES.map((type) => {
                const options = anchorOptions.filter((option) => option.anchorType === type);
                return options.length > 0 ? (
                  <optgroup key={type} label={group(type)}>
                    {options.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                ) : null;
              })}
            </Select>
          )}
        </Field>
        <Field hint={copy("비워 두면 항목 전체에 연결돼요.", "Leave empty to link the whole item.")} label={copy("정확한 부분 (선택)", "Exact part (optional)")}>
          {(control) => (
            <Select {...control} disabled={overlays.length === 0} onChange={(event) => setDraft({ ...draft, targetKey: event.target.value })} value={draft.targetKey}>
              <option value="">{copy("항목 전체", "Whole item")}</option>
              {overlays.map((item) => (
                <option key={item.targetKey} value={item.targetKey}>
                  {`${targetLabel(item.targetType)}: ${item.textSnippet ?? item.fieldPath ?? item.targetKey}`}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
    </Dialog>
  );
}

/** One resume claim: its text, the parts interviewers hit, and every question that landed on it. */
export function ResumeHeatmapAnchorPage() {
  const { copy, target: targetLabel } = useHeatmapCopy();
  const { versionId = "", anchorType, anchorId } = useParams<{ versionId: string; anchorType: string; anchorId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readFiltersFromSearchParams(searchParams), [searchParams]);
  const selectedTargetKey = searchParams.get("selectedTargetKey");
  const snapshotsQuery = useResumeVersionSnapshotsQuery(versionId);
  const heatmapQuery = useResumeQuestionHeatmapQuery(versionId, filters);
  const overlayTargetsQuery = useResumeQuestionHeatmapOverlayTargetsQuery(versionId, filters);
  const createLinkMutation = useCreateResumeQuestionHeatmapLinkMutation(versionId);
  const updateLinkMutation = useUpdateResumeQuestionHeatmapLinkMutation(versionId);
  const [editingId, setEditingId] = useState<string | null>(null);
  // Links created here can be undone in this session; the API has no list of manual links yet.
  const [manualLinkIds, setManualLinkIds] = useState<Record<string, string>>({});
  const heatmapPath = routeConfig.resumeHeatmap.buildPath({ versionId });

  const anchor = useMemo(() => {
    if (!heatmapQuery.data) {
      return null;
    }
    return (
      buildHeatmapAnchors(heatmapQuery.data, overlayTargetsQuery.data?.items ?? [], snapshotsQuery.data).find(
        (candidate) => candidate.item.anchorType === anchorType && anchorPathId(candidate.item) === anchorId,
      ) ?? null
    );
  }, [anchorId, anchorType, heatmapQuery.data, overlayTargetsQuery.data, snapshotsQuery.data]);
  const anchorOptions = useMemo(() => (snapshotsQuery.data ? buildAnchorOptions(snapshotsQuery.data) : []), [snapshotsQuery.data]);

  if (heatmapQuery.isLoading || overlayTargetsQuery.isLoading || snapshotsQuery.isLoading) {
    return <PageSkeleton label={copy("이력서 항목을 불러오는 중", "Loading the resume item")} />;
  }

  if (heatmapQuery.isError || overlayTargetsQuery.isError) {
    const error = heatmapQuery.error ?? overlayTargetsQuery.error;
    return (
      <ErrorState
        actions={
          <Button onClick={() => void Promise.all([heatmapQuery.refetch(), overlayTargetsQuery.refetch()])} variant="primary">
            {copy("다시 시도", "Try again")}
          </Button>
        }
        body={userFacingErrorMessage(error, copy("이 항목을 불러오지 못했어요.", "This item could not be loaded."))}
        details={getErrorDetails(error)}
        title={copy("항목을 불러올 수 없어요", "Unable to load this item")}
      />
    );
  }

  if (!anchor) {
    return (
      <EmptyState
        actions={
          <ButtonLink to={heatmapPath} variant="primary">
            {copy("압박 지도로", "Back to the pressure map")}
          </ButtonLink>
        }
        body={copy("현재 필터에서는 이 항목에 연결된 질문이 없어요.", "No questions are linked to this item under the current filters.")}
        icon="search"
        title={copy("이 항목을 찾을 수 없어요", "We couldn't find this item")}
      />
    );
  }

  const { item } = anchor;
  const selectedTarget = anchor.overlayTargets.find((target) => target.targetKey === selectedTargetKey) ?? null;
  const questions = selectedTarget?.linkedQuestions ?? item.linkedQuestions;
  const editing = questions.find((question) => question.interviewRecordQuestionId === editingId) ?? null;
  const linkError =
    optionalErrorMessage(createLinkMutation.error, copy("연결을 저장하지 못했어요.", "We couldn't save the link.")) ??
    optionalErrorMessage(updateLinkMutation.error, copy("연결을 되돌리지 못했어요.", "We couldn't undo the link."));

  function selectTarget(targetKey: string | null) {
    const params = new URLSearchParams(searchParams);
    if (targetKey) {
      params.set("selectedTargetKey", targetKey);
    } else {
      params.delete("selectedTargetKey");
    }
    setSearchParams(params, { replace: true });
  }

  async function saveLink(question: ResumeQuestionHeatmapQuestionModel, target: AnchorOption, overlay: OverlayOption | null) {
    try {
      const link = await createLinkMutation.mutateAsync({
        interviewRecordQuestionId: question.interviewRecordQuestionId,
        anchorType: target.anchorType,
        anchorRecordId: target.anchorRecordId,
        anchorKey: target.anchorKey,
        overlayTargetType: overlay?.targetType ?? null,
        overlayFieldPath: overlay?.fieldPath ?? null,
        overlaySentenceIndex: overlay?.sentenceIndex ?? null,
        overlayTextSnippet: overlay?.textSnippet ?? null,
        confidenceScore: question.confidenceScore,
      });
      setManualLinkIds((current) => ({ ...current, [question.interviewRecordQuestionId]: link.id }));
      setEditingId(null);
      await Promise.all([heatmapQuery.refetch(), overlayTargetsQuery.refetch()]);
    } catch {
      // Rendered through `linkError`.
    }
  }

  async function undoLink(questionId: string) {
    const linkId = manualLinkIds[questionId];
    if (!linkId) {
      return;
    }
    try {
      await updateLinkMutation.mutateAsync({ linkId, payload: { active: false } });
      setManualLinkIds(({ [questionId]: _removed, ...rest }) => rest);
      await Promise.all([heatmapQuery.refetch(), overlayTargetsQuery.refetch()]);
    } catch {
      // Rendered through `linkError`.
    }
  }

  return (
    <div className="heatmap-detail">
      <div>
        <ButtonLink size="sm" to={heatmapPath} variant="ghost">
          {copy("← 압박 지도", "← Pressure map")}
        </ButtonLink>
      </div>
      <header className="heatmap-detail__head">
        <h2 className="heatmap-detail__title">{anchor.title}</h2>
        <HeatBadge tone={item.heatTone} />
      </header>
      <p className="resume-muted">
        <PressureCounts followUps={item.followUpCount} pressure={item.pressureQuestionCount} questions={item.directQuestionCount} weak={item.weaknessCount} />
      </p>
      {linkError && !editing ? <Callout tone="danger">{linkError}</Callout> : null}

      <Card aria-labelledby="heatmap-source-title" padded>
        <h3 className="resume-card-title" id="heatmap-source-title">
          {copy("이력서 원문", "Resume text")}
        </h3>
        {anchor.body.length > 0 ? (
          <div className="heatmap-anchor__body">
            {anchor.body.map((block, index) => (
              <p key={index}>{block}</p>
            ))}
          </div>
        ) : (
          <p className="resume-muted">{copy("추출된 원문이 없어요.", "No extracted text.")}</p>
        )}
        {anchor.overlayTargets.length > 0 ? (
          <div aria-label={copy("질문을 받은 부분으로 좁히기", "Narrow to a part that drew questions")} className="heatmap-targets" role="group">
            {anchor.overlayTargets.map((target) => {
              const isSelected = target.targetKey === selectedTargetKey;
              return (
                <button
                  aria-pressed={isSelected}
                  className={`heatmap-target heatmap-target--${target.heatTone}`}
                  key={target.targetKey}
                  onClick={() => selectTarget(isSelected ? null : target.targetKey)}
                  type="button"
                >
                  <span className="heatmap-target__type">{targetLabel(target.targetType)}</span>
                  <span className="heatmap-target__text">{target.textSnippet ?? target.fieldPath ?? target.targetKey}</span>
                  <span className="heatmap-target__count">{copy(`질문 ${target.questionCount}`, `${target.questionCount} q`)}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </Card>

      <Card aria-labelledby="heatmap-questions-title">
        <CardHeader
          meta={selectedTarget ? `“${selectedTarget.textSnippet ?? selectedTarget.targetKey}”` : undefined}
          title={<span id="heatmap-questions-title">{copy(`받은 질문 ${questions.length}`, `Questions received ${questions.length}`)}</span>}
        />
        {questions.length === 0 ? (
          <p className="resume-muted resume-card-pad">{copy("연결된 질문이 없어요.", "No linked questions.")}</p>
        ) : (
          questions.map((question) => (
            <LinkedQuestionRow
              action={
                <>
                  <Button onClick={() => setEditingId(question.interviewRecordQuestionId)} size="sm" variant="ghost">
                    {copy("연결 고치기", "Fix link")}
                  </Button>
                  {manualLinkIds[question.interviewRecordQuestionId] ? (
                    <Button loading={updateLinkMutation.isPending} onClick={() => void undoLink(question.interviewRecordQuestionId)} size="sm" variant="ghost">
                      {copy("되돌리기", "Undo")}
                    </Button>
                  ) : null}
                </>
              }
              key={question.id}
              question={question}
            />
          ))
        )}
      </Card>

      {editing ? (
        <FixLinkDialog
          anchorOptions={anchorOptions}
          error={linkError}
          initial={{ anchorId: buildAnchorId(item.anchorType, item.anchorRecordId, item.anchorKey), targetKey: selectedTarget?.targetKey ?? "" }}
          onClose={() => setEditingId(null)}
          onSave={(target, overlay) => void saveLink(editing, target, overlay)}
          overlayOptions={overlayTargetsQuery.data?.items ?? []}
          pending={createLinkMutation.isPending}
          question={editing}
        />
      ) : null}
    </div>
  );
}
