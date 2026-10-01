import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { ResumeSnapshotModel } from "../../entities/resume/model";
import { useResumeVersionSnapshotsQuery } from "../../features/resume/api/useResumeVersionSnapshotsQuery";
import { useUpdateClaimEvidenceMutation } from "../../features/resume-claims/api/useUpdateClaimEvidenceMutation";
import { useAssignQuestionClaimMutation } from "../../features/resume-heatmap/api/useAssignQuestionClaimMutation";
import { useResumeQuestionHeatmapQuery } from "../../features/resume-heatmap/api/useResumeQuestionHeatmapQuery";
import { getErrorDetails, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale, type MessageKey } from "../../shared/i18n";
import {
  Badge,
  Button,
  ButtonLink,
  Callout,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  Field,
  PageSkeleton,
  Segmented,
  Textarea,
  type Tone,
} from "../../shared/ui/primitives";
import { useResumeHub } from "../resume/ResumeHubLayout";
import { LinkedQuestionRow } from "../resume-heatmap/heatmapParts";
import { anchorPathId } from "../resume-heatmap/heatmapUtils";
import {
  answeredCount,
  claimHeatmapItem,
  claimQuestions,
  EVIDENCE_FIELDS,
  evidenceStatus,
  groupClaims,
  riskiestEmptyField,
  type Claim,
  type EvidenceField,
  type HeatmapItem,
} from "./claimModel";
import "./claims.css";

type Filter = "all" | "needs-evidence" | "weak";
type Draft = Record<EvidenceField, string>;

const ALL_SCOPE = { scope: "all" } as const;
const QUESTION_PREVIEW = 5;

const FIELD_COPY: Record<EvidenceField, { label: MessageKey; placeholder: MessageKey; ask: MessageKey }> = {
  situation: { label: "resumeClaims.fieldSituation", placeholder: "resumeClaims.placeholderSituation", ask: "resumeClaims.askSituation" },
  role: { label: "resumeClaims.fieldRole", placeholder: "resumeClaims.placeholderRole", ask: "resumeClaims.askRole" },
  measurement: { label: "resumeClaims.fieldMeasurement", placeholder: "resumeClaims.placeholderMeasurement", ask: "resumeClaims.askMeasurement" },
  result: { label: "resumeClaims.fieldResult", placeholder: "resumeClaims.placeholderResult", ask: "resumeClaims.askResult" },
};

/** Weak answers to this claim's own questions; other claims in the project do not count (ADR 0084). */
function weakCount(claim: Claim, item: HeatmapItem | null) {
  return claimQuestions(claim, item).own.filter((question) => question.weakAnswer).length;
}

function useClaimBadge() {
  const { t } = useLocale();
  return (claim: Claim, item: HeatmapItem | null): { tone: Tone; label: string } => {
    const status = evidenceStatus(claim.evidence);
    if (status !== "ready" && weakCount(claim, item) > 0) {
      return { tone: "danger", label: t("resumeClaims.statusWeak") };
    }
    if (status === "ready") {
      return { tone: "success", label: t("resumeClaims.statusReady") };
    }
    return status === "partial"
      ? { tone: "warning", label: t("resumeClaims.statusPartial") }
      : { tone: "neutral", label: t("resumeClaims.statusEmpty") };
  };
}

function EvidenceMeter({ done }: { done: number }) {
  const { t } = useLocale();
  return (
    <span aria-label={t("resumeClaims.meterLabel", { done })} className="claim-meter" role="img">
      {EVIDENCE_FIELDS.map((field, index) => (
        <span className={index < done ? "claim-meter__cell claim-meter__cell--done" : "claim-meter__cell"} key={field} />
      ))}
    </span>
  );
}

function ClaimList({ snapshot, heatmapItems, selectedId, onSelect }: {
  snapshot: ResumeSnapshotModel;
  heatmapItems: HeatmapItem[];
  selectedId: string | null;
  onSelect: (claimId: string) => void;
}) {
  const { t } = useLocale();
  const badge = useClaimBadge();
  const [filter, setFilter] = useState<Filter>("all");
  const claims = snapshot.achievements;
  const needsEvidence = claims.filter((claim) => evidenceStatus(claim.evidence) !== "ready");
  const weak = needsEvidence.filter((claim) => weakCount(claim, claimHeatmapItem(claim, heatmapItems)) > 0);
  const visible = new Set((filter === "weak" ? weak : filter === "needs-evidence" ? needsEvidence : claims).map((claim) => claim.id));
  const groups = groupClaims(snapshot)
    .map((group) => ({ ...group, claims: group.claims.filter((claim) => visible.has(claim.id)) }))
    .filter((group) => group.claims.length > 0);

  return (
    <Card aria-labelledby="claim-list-title" className="claim-list">
      <CardHeader
        meta={<span className="claim-list__progress">{t("resumeClaims.evidenceProgress", { done: claims.length - needsEvidence.length, total: claims.length })}</span>}
        title={<span id="claim-list-title">{t("resumeClaims.claimList")}</span>}
        titleAs="h2"
      />
      <div className="claim-list__filter">
        <Segmented
          items={[
            { id: "all", label: t("resumeClaims.filterAll", { count: claims.length }) },
            { id: "needs-evidence", label: t("resumeClaims.filterNeedsEvidence", { count: needsEvidence.length }) },
            { id: "weak", label: t("resumeClaims.filterWeak", { count: weak.length }) },
          ]}
          label={t("resumeClaims.filterLabel")}
          onChange={setFilter}
          value={filter}
        />
      </div>
      {groups.length === 0 ? <p className="claim-list__empty">{t("resumeClaims.noMatches")}</p> : null}
      {groups.map((group) => (
        <section aria-label={group.title ?? t("resumeClaims.otherGroup")} className="claim-group" key={group.key}>
          <h3 className="claim-group__title">
            {group.title ?? t("resumeClaims.otherGroup")}
            {group.meta ? <span className="claim-group__meta">{group.meta}</span> : null}
          </h3>
          <ul className="claim-group__items">
            {group.claims.map((claim) => {
              const { tone, label } = badge(claim, claimHeatmapItem(claim, heatmapItems));
              const selected = claim.id === selectedId;
              return (
                <li key={claim.id}>
                  <button
                    aria-current={selected ? "true" : undefined}
                    className={selected ? "claim-row claim-row--selected" : "claim-row"}
                    onClick={() => onSelect(claim.id)}
                    type="button"
                  >
                    <span className="claim-row__title">{claim.title}</span>
                    <Badge tone={tone}>{label}</Badge>
                    <EvidenceMeter done={answeredCount(claim.evidence)} />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </Card>
  );
}

function ClaimEditor({ claim, item, versionId }: { claim: Claim; item: HeatmapItem | null; versionId: string }) {
  const { t } = useLocale();
  const saved: Draft = { situation: claim.evidence.situation, role: claim.evidence.role, measurement: claim.evidence.measurement, result: claim.evidence.result };
  const [draft, setDraft] = useState<Draft>(saved);
  const mutation = useUpdateClaimEvidenceMutation(versionId);
  const dirty = EVIDENCE_FIELDS.some((field) => draft[field] !== saved[field]);
  const risk = riskiestEmptyField(claim, draft);
  const weak = weakCount(claim, item);
  const { own: questions, unassigned } = claimQuestions(claim, item);
  const assign = useAssignQuestionClaimMutation(versionId);

  function save() {
    if (!dirty || mutation.isPending) {
      return;
    }
    mutation.mutate({
      achievementId: claim.id,
      evidence: { situationText: draft.situation, roleText: draft.role, measurementText: draft.measurement, resultText: draft.result },
    });
  }

  const status = mutation.isError ? (
    <span className="ui-tone-text--danger">{t("resumeClaims.saveFailed")}</span>
  ) : dirty ? (
    <span>{t("resumeClaims.unsaved")}</span>
  ) : mutation.isSuccess ? (
    <span>{t("resumeClaims.saved")}</span>
  ) : null;

  return (
    <Card aria-labelledby="claim-editor-title" className="claim-editor">
      <CardHeader title={<span id="claim-editor-title">{claim.title}</span>} titleAs="h2" />
      <div className="claim-editor__body">
        {claim.sourceText && claim.sourceText !== claim.title ? (
          <p className="claim-editor__source">
            <span className="claim-editor__source-label">{t("resumeClaims.original")}</span>
            {claim.sourceText}
          </p>
        ) : null}

        {risk ? (
          <Callout tone={weak > 0 ? "danger" : "warning"}>
            <p>
              {weak > 0 ? `${t("resumeClaims.riskWeakQuestions", { weak, total: questions.length })} ` : null}
              {t("resumeClaims.riskEmptyField", { field: t(FIELD_COPY[risk].label), question: t(FIELD_COPY[risk].ask) })}
            </p>
          </Callout>
        ) : (
          <Callout title={t("resumeClaims.readyTitle")} tone="success">
            <p>{t("resumeClaims.readyBody")}</p>
          </Callout>
        )}

        <form
          className="claim-form"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          {EVIDENCE_FIELDS.map((field) => (
            <Field className="claim-form__field" hint={field === risk ? t("resumeClaims.riskHint") : undefined} key={field} label={t(FIELD_COPY[field].label)}>
              {(control) => (
                <Textarea
                  {...control}
                  className={field === risk ? "claim-form__input claim-form__input--risk" : "claim-form__input"}
                  maxLength={2000}
                  onBlur={save}
                  onChange={(event) => setDraft((current) => ({ ...current, [field]: event.target.value }))}
                  placeholder={t(FIELD_COPY[field].placeholder)}
                  rows={2}
                  value={draft[field]}
                />
              )}
            </Field>
          ))}
          <div className="claim-form__actions">
            <span aria-live="polite" className="claim-form__status">
              {status}
            </span>
            <Button disabled={!dirty} loading={mutation.isPending} type="submit" variant="primary">
              {t("resumeClaims.save")}
            </Button>
          </div>
        </form>
      </div>

      <section aria-labelledby="claim-questions-title" className="claim-questions">
        <header className="claim-questions__head">
          <h3 className="claim-questions__title" id="claim-questions-title">
            {t("resumeClaims.questionsForClaim")}
          </h3>
          {item ? (
            <ButtonLink
              size="sm"
              to={routeConfig.resumeHeatmapAnchor.buildPath({ versionId, anchorType: item.anchorType, anchorId: anchorPathId(item) })}
              variant="ghost"
            >
              {t("resumeClaims.openInMap")}
            </ButtonLink>
          ) : null}
        </header>
        {assign.isError ? <p className="claim-questions__empty ui-tone-text--danger">{t("resumeClaims.assignFailed")}</p> : null}
        {questions.length === 0 ? <p className="claim-questions__empty">{t("resumeClaims.questionsEmpty")}</p> : null}
        {questions.slice(0, QUESTION_PREVIEW).map((question) => (
          <LinkedQuestionRow
            action={
              <Button
                disabled={assign.isPending}
                onClick={() => assign.mutate({ interviewRecordQuestionId: question.interviewRecordQuestionId, achievementId: null })}
                size="sm"
                variant="ghost"
              >
                {t("resumeClaims.unassign")}
              </Button>
            }
            key={question.id}
            question={question}
          />
        ))}
        {unassigned.length > 0 ? (
          <>
            <h4 className="claim-questions__subtitle">
              {t(item?.anchorType === "experience" ? "resumeClaims.otherQuestionsInExperience" : "resumeClaims.otherQuestionsInProject", { count: unassigned.length })}
            </h4>
            {unassigned.slice(0, QUESTION_PREVIEW).map((question) => (
              <LinkedQuestionRow
                action={
                  <Button
                    disabled={assign.isPending}
                    onClick={() => assign.mutate({ interviewRecordQuestionId: question.interviewRecordQuestionId, achievementId: claim.id })}
                    size="sm"
                  >
                    {t("resumeClaims.assignHere")}
                  </Button>
                }
                key={question.id}
                question={question}
              />
            ))}
          </>
        ) : null}
      </section>
    </Card>
  );
}

/**
 * 근거 편집 (docs/09 §4.5, ADR 0081): each resume claim backed by 상황 · 내 역할 · 측정 방법 · 결과 수치,
 * with the empty field tied to the question it leaves open. The full document editor sits one link away.
 */
export function ResumeClaimsPage() {
  const { t } = useLocale();
  const { versionId } = useResumeHub();
  const [searchParams, setSearchParams] = useSearchParams();
  const snapshotsQuery = useResumeVersionSnapshotsQuery(versionId);
  const heatmapQuery = useResumeQuestionHeatmapQuery(versionId, ALL_SCOPE);
  const heatmapItems = useMemo(() => heatmapQuery.data?.items ?? [], [heatmapQuery.data]);
  const documentLink = (
    <ButtonLink icon="resume" size="sm" to={routeConfig.resumeDocumentEditor.buildPath({ versionId })}>
      {t("resumeClaims.editDocument")}
    </ButtonLink>
  );

  if (snapshotsQuery.isLoading) {
    return <PageSkeleton label={t("resumeClaims.loading")} />;
  }

  if (snapshotsQuery.isError || !snapshotsQuery.data) {
    return (
      <ErrorState
        actions={
          <Button onClick={() => void snapshotsQuery.refetch()} variant="primary">
            {t("common.tryAgain")}
          </Button>
        }
        body={userFacingErrorMessage(snapshotsQuery.error, t("resumeClaims.loadErrorBody"))}
        details={getErrorDetails(snapshotsQuery.error)}
        title={t("resumeClaims.loadErrorTitle")}
      />
    );
  }

  const snapshot = snapshotsQuery.data;
  const claims = snapshot.achievements;

  if (claims.length === 0) {
    return <EmptyState actions={documentLink} body={t("resumeClaims.emptyBody")} icon="resume" title={t("resumeClaims.emptyTitle")} />;
  }

  // Without a choice in the URL, open the first claim that still needs evidence.
  const requested = claims.find((claim) => claim.id === searchParams.get("claim"));
  const selected = requested ?? claims.find((claim) => evidenceStatus(claim.evidence) !== "ready") ?? claims[0];

  function select(claimId: string) {
    const params = new URLSearchParams(searchParams);
    params.set("claim", claimId);
    setSearchParams(params, { replace: true });
  }

  return (
    <div className="claims">
      <div className="claims__toolbar">{documentLink}</div>
      <div className="claims__grid">
        <ClaimList heatmapItems={heatmapItems} onSelect={select} selectedId={selected.id} snapshot={snapshot} />
        <ClaimEditor claim={selected} item={claimHeatmapItem(selected, heatmapItems)} key={selected.id} versionId={versionId} />
      </div>
    </div>
  );
}
