import type { ResumeQuestionHeatmapModel, ResumeQuestionHeatmapOverlayTargetModel } from "../../entities/resume-heatmap/model";
import type { ResumeSnapshotModel } from "../../entities/resume/model";
import type { ResumeQuestionHeatmapFiltersDto } from "../../shared/types/resumeHeatmap";

export type AnchorOption = {
  id: string;
  anchorType: string;
  anchorRecordId: string | null;
  anchorKey: string | null;
  label: string;
  description: string | null;
};

export type AnchorPreview = {
  title: string;
  description: string | null;
};

export function buildAnchorId(
  anchorType: string,
  anchorRecordId: string | null,
  anchorKey: string | null,
) {
  if (anchorRecordId) {
    return `${anchorType}:${anchorRecordId}`;
  }

  if (anchorKey) {
    return `${anchorType}:${anchorKey}`;
  }

  return anchorType;
}

export function splitDocumentBlocks(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function sortOverlayTargetsForDisplay<
  T extends { targetType: string | null; sentenceIndex: number | null; targetKey: string },
>(items: T[]) {
  const weight = { block: 0, sentence: 1, phrase: 2, keyword: 3 } as const;

  return [...items].sort((left, right) => {
    const leftWeight = weight[(left.targetType ?? "block") as keyof typeof weight] ?? 9;
    const rightWeight = weight[(right.targetType ?? "block") as keyof typeof weight] ?? 9;

    if (leftWeight !== rightWeight) {
      return leftWeight - rightWeight;
    }

    if ((left.sentenceIndex ?? 999) !== (right.sentenceIndex ?? 999)) {
      return (left.sentenceIndex ?? 999) - (right.sentenceIndex ?? 999);
    }

    return left.targetKey.localeCompare(right.targetKey);
  });
}

export function readFiltersFromSearchParams(
  searchParams: URLSearchParams,
): ResumeQuestionHeatmapFiltersDto {
  const scope = searchParams.get("scope");
  const targetType = searchParams.get("targetType");

  return {
    scope:
      scope === "main" || scope === "follow_up" || scope === "all"
        ? scope
        : "all",
    weakOnly: searchParams.get("weakOnly") === "true",
    companyName: searchParams.get("companyName") ?? "",
    interviewDateFrom: searchParams.get("interviewDateFrom") ?? "",
    interviewDateTo: searchParams.get("interviewDateTo") ?? "",
    targetType:
      targetType === "block" ||
      targetType === "sentence" ||
      targetType === "phrase" ||
      targetType === "keyword"
        ? targetType
        : undefined,
  };
}

export function writeFiltersToSearchParams(
  searchParams: URLSearchParams,
  filters: ResumeQuestionHeatmapFiltersDto,
) {
  const next = new URLSearchParams(searchParams);

  if (filters.scope && filters.scope !== "all") {
    next.set("scope", filters.scope);
  } else {
    next.delete("scope");
  }

  if (filters.weakOnly) {
    next.set("weakOnly", "true");
  } else {
    next.delete("weakOnly");
  }

  if (filters.companyName) {
    next.set("companyName", filters.companyName);
  } else {
    next.delete("companyName");
  }

  if (filters.interviewDateFrom) {
    next.set("interviewDateFrom", filters.interviewDateFrom);
  } else {
    next.delete("interviewDateFrom");
  }

  if (filters.interviewDateTo) {
    next.set("interviewDateTo", filters.interviewDateTo);
  } else {
    next.delete("interviewDateTo");
  }

  if (filters.targetType) {
    next.set("targetType", filters.targetType);
  } else {
    next.delete("targetType");
  }

  return next;
}

export function buildAnchorOptions(snapshots: ResumeSnapshotModel): AnchorOption[] {
  const options: AnchorOption[] = [];

  if (snapshots.profile?.summaryText || snapshots.profile?.headline) {
    options.push({
      id: buildAnchorId("summary", null, "summary"),
      anchorType: "summary",
      anchorRecordId: null,
      anchorKey: "summary",
      label: snapshots.profile.headline ?? snapshots.profile.fullName ?? "Resume summary",
      description: snapshots.profile.summaryText ?? null,
    });
  }

  snapshots.projects.forEach((project) => {
    if (!project.sourceRecordId) {
      return;
    }

    options.push({
      id: buildAnchorId("project", project.sourceRecordId, null),
      anchorType: "project",
      anchorRecordId: project.sourceRecordId,
      anchorKey: null,
      label: project.title,
      description: project.contentText ?? project.summary,
    });
  });

  snapshots.experiences.forEach((experience) => {
    if (!experience.sourceRecordId) {
      return;
    }

    options.push({
      id: buildAnchorId("experience", experience.sourceRecordId, null),
      anchorType: "experience",
      anchorRecordId: experience.sourceRecordId,
      anchorKey: null,
      label: `${experience.companyName} · ${experience.roleName}`,
      description: experience.impactText ?? experience.summary,
    });
  });

  snapshots.skills.forEach((skill) => {
    if (!skill.sourceRecordId) {
      return;
    }

    options.push({
      id: buildAnchorId("skill", skill.sourceRecordId, null),
      anchorType: "skill",
      anchorRecordId: skill.sourceRecordId,
      anchorKey: null,
      label: skill.label,
      description: skill.helperText ?? skill.value,
    });
  });

  snapshots.competencies.forEach((competency) => {
    if (!competency.sourceRecordId) {
      return;
    }

    options.push({
      id: buildAnchorId("competency", competency.sourceRecordId, null),
      anchorType: "competency",
      anchorRecordId: competency.sourceRecordId,
      anchorKey: null,
      label: competency.title,
      description: competency.description,
    });
  });

  return options;
}

export function getAnchorPreview(
  anchorType: string,
  anchorRecordId: string | null,
  anchorKey: string | null,
  snapshots: ResumeSnapshotModel | undefined,
): AnchorPreview | null {
  if (!snapshots) {
    return null;
  }

  if (anchorType === "summary" && snapshots.profile) {
    return {
      title: snapshots.profile.headline ?? snapshots.profile.fullName ?? "Resume summary",
      description:
        snapshots.profile.summaryText ??
        snapshots.profile.yearsOfExperienceText ??
        "Top-level parsed resume summary",
    };
  }

  if (anchorType === "project") {
    const project = snapshots.projects.find(
      (item) => item.sourceRecordId === anchorRecordId || item.id === anchorRecordId,
    );

    if (project) {
      return {
        title: project.title,
        description: project.contentText ?? project.summary,
      };
    }
  }

  if (anchorType === "experience") {
    const experience = snapshots.experiences.find(
      (item) => item.sourceRecordId === anchorRecordId || item.id === anchorRecordId,
    );

    if (experience) {
      return {
        title: `${experience.companyName} · ${experience.roleName}`,
        description: experience.impactText ?? experience.summary,
      };
    }
  }

  if (anchorType === "skill") {
    const skill = snapshots.skills.find(
      (item) => item.sourceRecordId === anchorRecordId || item.id === anchorRecordId,
    );

    if (skill) {
      return {
        title: skill.label,
        description: skill.helperText ?? skill.value,
      };
    }
  }

  if (anchorType === "competency") {
    const competency = snapshots.competencies.find(
      (item) => item.sourceRecordId === anchorRecordId || item.id === anchorRecordId,
    );

    if (competency) {
      return {
        title: competency.title,
        description: competency.description,
      };
    }
  }

  if (anchorKey) {
    return {
      title: anchorKey,
      description: null,
    };
  }

  return null;
}

type HeatmapItem = ResumeQuestionHeatmapModel["items"][number];
type OverlayTarget = ResumeQuestionHeatmapOverlayTargetModel;

export type HeatmapGroup = "summary" | "project" | "experience" | "skill" | "competency" | "other";

export type HeatmapAnchor = {
  item: HeatmapItem;
  group: HeatmapGroup;
  title: string;
  meta: string | null;
  body: string[];
  overlayTargets: OverlayTarget[];
  /** Weak answers weigh most, then follow-ups, pressure questions, and plain questions. */
  pressure: number;
};

export function pressureScore(item: Pick<HeatmapItem, "weaknessCount" | "followUpCount" | "pressureQuestionCount" | "directQuestionCount">) {
  return item.weaknessCount * 5 + item.followUpCount * 3 + item.pressureQuestionCount * 2 + item.directQuestionCount;
}

/** The path segment the anchor detail route uses for an item. */
export function anchorPathId(item: Pick<HeatmapItem, "anchorRecordId" | "anchorKey" | "id">) {
  return item.anchorRecordId ?? item.anchorKey ?? item.id;
}

/** Highlights that actually drew questions, one per distinct text (the most questioned wins). */
function questionedTargets(targets: OverlayTarget[]) {
  const byText = new Map<string, OverlayTarget>();
  targets
    .filter((target) => target.questionCount > 0)
    .forEach((target) => {
      const key = `${target.targetType}:${(target.textSnippet ?? target.targetKey).trim()}`;
      const current = byText.get(key);
      if (!current || target.questionCount > current.questionCount) {
        byText.set(key, target);
      }
    });
  return sortOverlayTargetsForDisplay([...byText.values()]);
}

/**
 * Joins heatmap items with the parsed resume text and their overlay highlights, most pressured
 * first. Items without a matching snapshot still appear, using the heatmap's own snippet.
 */
export function buildHeatmapAnchors(
  heatmap: ResumeQuestionHeatmapModel,
  overlays: OverlayTarget[],
  snapshots: ResumeSnapshotModel | undefined,
): HeatmapAnchor[] {
  const overlaysById = new Map<string, OverlayTarget[]>();
  overlays.forEach((target) => {
    const key = buildAnchorId(target.anchorType, target.anchorRecordId, target.anchorKey);
    overlaysById.set(key, [...(overlaysById.get(key) ?? []), target]);
  });

  return heatmap.items
    .map((item) => {
      const preview = getAnchorPreview(item.anchorType, item.anchorRecordId, item.anchorKey, snapshots);
      const experience = item.anchorType === "experience" ? snapshots?.experiences.find((entry) => entry.sourceRecordId === item.anchorRecordId) : undefined;
      const project = item.anchorType === "project" ? snapshots?.projects.find((entry) => entry.sourceRecordId === item.anchorRecordId) : undefined;
      const group: HeatmapGroup = (["summary", "project", "experience", "skill", "competency"] as const).find((type) => type === item.anchorType) ?? "other";
      return {
        item,
        group,
        title: preview && preview.title !== item.anchorKey ? preview.title : item.label,
        meta: project?.dateLabel ?? experience?.dateLabel ?? null,
        body: splitDocumentBlocks(preview?.description ?? item.snippet),
        overlayTargets: questionedTargets(overlaysById.get(item.id) ?? []),
        pressure: pressureScore(item),
      };
    })
    .sort((left, right) => right.pressure - left.pressure);
}
