import type { ResumeClaimEvidenceModel, ResumeSnapshotModel } from "../../entities/resume/model";
import type { ResumeQuestionHeatmapModel } from "../../entities/resume-heatmap/model";

export type Claim = ResumeSnapshotModel["achievements"][number];
export type HeatmapItem = ResumeQuestionHeatmapModel["items"][number];
export type EvidenceField = "situation" | "role" | "measurement" | "result";
export type EvidenceStatus = "ready" | "partial" | "empty";

export const EVIDENCE_FIELDS: EvidenceField[] = ["situation", "role", "measurement", "result"];

const NUMBER = /\d/;

export function answeredCount(evidence: Pick<ResumeClaimEvidenceModel, EvidenceField>) {
  return EVIDENCE_FIELDS.filter((field) => evidence[field].trim().length > 0).length;
}

export function evidenceStatus(evidence: Pick<ResumeClaimEvidenceModel, EvidenceField>): EvidenceStatus {
  const answered = answeredCount(evidence);
  return answered === EVIDENCE_FIELDS.length ? "ready" : answered === 0 ? "empty" : "partial";
}

/**
 * The empty field an interviewer reaches first. A claim with a number gets asked how it was measured;
 * without one, what changed comes first.
 */
export function riskiestEmptyField(claim: Claim, evidence: Pick<ResumeClaimEvidenceModel, EvidenceField>): EvidenceField | null {
  const hasNumber = Boolean(claim.metricText) || NUMBER.test(claim.title);
  const order: EvidenceField[] = hasNumber
    ? ["measurement", "result", "situation", "role"]
    : ["result", "situation", "role", "measurement"];
  return order.find((field) => evidence[field].trim().length === 0) ?? null;
}

/** Heatmap links anchor to projects and experiences; questions inside one carry the claim they are about (ADR 0084). */
export function claimHeatmapItem(claim: Claim, items: HeatmapItem[]): HeatmapItem | null {
  const byAnchor = (type: string, id?: string) =>
    id ? items.find((item) => item.anchorType === type && item.anchorRecordId === id) ?? null : null;
  return byAnchor("project", claim.projectId) ?? byAnchor("experience", claim.experienceId);
}

export type ClaimGroup = { key: string; title: string | null; meta: string | null; claims: Claim[] };

/** Claims under their project, else their experience, in resume order. */
export function groupClaims(snapshot: ResumeSnapshotModel): ClaimGroup[] {
  const groups = new Map<string, ClaimGroup>();
  for (const claim of snapshot.achievements) {
    const project = claim.projectId ? snapshot.projects.find((item) => item.id === claim.projectId) : undefined;
    const experience = claim.experienceId ? snapshot.experiences.find((item) => item.id === claim.experienceId) : undefined;
    const key = project ? `project-${project.id}` : experience ? `experience-${experience.id}` : "other";
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        title: project?.title ?? experience?.companyName ?? null,
        meta: (project?.dateLabel || experience?.dateLabel) ?? null,
        claims: [],
      });
    }
    groups.get(key)!.claims.push(claim);
  }
  return [...groups.values()];
}

export type ClaimQuestions = {
  /** Questions about this claim. */
  own: HeatmapItem["linkedQuestions"];
  /** Questions about the same project or experience that no claim took; they can be moved onto this one. */
  unassigned: HeatmapItem["linkedQuestions"];
};

export function claimQuestions(claim: Claim, item: HeatmapItem | null): ClaimQuestions {
  const questions = item?.linkedQuestions ?? [];
  return {
    own: questions.filter((question) => question.achievementId === claim.id),
    unassigned: questions.filter((question) => question.achievementId === null),
  };
}
