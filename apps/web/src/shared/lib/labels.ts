import type { AppLocale } from "../i18n";
import type { sharedLabels } from "../i18n/catalog/sharedLabels";
import { formatMessage } from "../i18n/format";

type LabelKey = keyof (typeof sharedLabels)["en"];

function label(locale: AppLocale, key: LabelKey) {
  return formatMessage(locale, `sharedLabels.${key}`);
}

const DIFFICULTY: Record<string, LabelKey> = {
  EASY: "difficultyEasy",
  MEDIUM: "difficultyMedium",
  HARD: "difficultyHard",
};

const SKILL_CATEGORY: Record<string, LabelKey> = {
  CS: "skillCs",
  BACKEND: "skillBackend",
  DATABASE: "skillDatabase",
  SYSTEM_DESIGN: "skillSystemDesign",
  ARCHITECTURE: "skillArchitecture",
  TESTING: "skillTesting",
};

const SEVERITY: Record<string, { key: LabelKey; tone: "danger" | "warning" | "neutral" }> = {
  HIGH: { key: "severityHigh", tone: "danger" },
  CRITICAL: { key: "severityCritical", tone: "danger" },
  MEDIUM: { key: "severityMedium", tone: "warning" },
  LOW: { key: "severityLow", tone: "neutral" },
};

const WEAKNESS_TAG: Record<string, LabelKey> = {
  missing_metric: "weakMissingMetric",
  missing_metrics: "weakMissingMetric",
  missing_tradeoff: "weakMissingTradeoff",
  missing_star_shape: "weakMissingStructure",
};

const MATERIAL_TYPE: Record<string, LabelKey> = {
  article: "materialArticle",
  blog: "materialArticle",
  video: "materialVideo",
  book: "materialBook",
  docs: "materialDocs",
  doc: "materialDocs",
  documentation: "materialDocs",
  course: "materialCourse",
  paper: "materialPaper",
  podcast: "materialPodcast",
};

function titleCase(code: string) {
  return code
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Maps API difficulty codes (EASY/MEDIUM/HARD) to user words; unknown values pass through. */
export function difficultyLabel(value: string | null | undefined, locale: AppLocale) {
  if (!value) {
    return null;
  }
  const key = DIFFICULTY[value.toUpperCase()];
  return key ? label(locale, key) : value;
}

/** Maps skill category codes (SYSTEM_DESIGN, …) to user words; unknown codes are title-cased. */
export function skillCategoryLabel(code: string | null | undefined, locale: AppLocale) {
  if (!code) {
    return null;
  }
  const key = SKILL_CATEGORY[code.toUpperCase()];
  return key ? label(locale, key) : titleCase(code);
}

/** Weakness tags from answer analysis (missing_metric, …) in words; unknown codes lose their underscores. */
export function weaknessTagLabel(tag: string, locale: AppLocale) {
  const key = WEAKNESS_TAG[tag.toLowerCase()];
  return key ? label(locale, key) : tag.replace(/_/g, " ");
}

/** Learning material types (article, video, …) in words; free-text types pass through. */
export function materialTypeLabel(value: string | null | undefined, locale: AppLocale) {
  if (!value) {
    return null;
  }
  const key = MATERIAL_TYPE[value.trim().toLowerCase()];
  return key ? label(locale, key) : value;
}

/** Tone for a 0–100 score: below 50 needs work, below 75 is improving, otherwise solid. */
export function scoreTone(score: number | null | undefined): "neutral" | "danger" | "warning" | "success" {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return "neutral";
  }
  if (score < 50) {
    return "danger";
  }
  return score < 75 ? "warning" : "success";
}

/** Maps risk severity codes to a user word plus a tone; unknown values pass through as neutral. */
export function severityLabel(value: string | null | undefined, locale: AppLocale) {
  if (!value) {
    return null;
  }
  const entry = SEVERITY[value.toUpperCase()];
  return entry ? { label: label(locale, entry.key), tone: entry.tone } : { label: value, tone: "neutral" as const };
}

/** Appends the Korean subject particle: 이 after a final consonant (구체성이), 가 otherwise (구조가). */
export function withSubjectParticle(word: string) {
  const last = word.trim().replace(/["”’')\]]+$/, "").slice(-1);
  const code = last.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) {
    return `${word}이(가)`;
  }
  return `${word}${code % 28 === 0 ? "가" : "이"}`;
}

const PARSING: Record<string, { key: LabelKey; tone: "success" | "warning" | "danger" | "neutral" | "accent" }> = {
  COMPLETED: { key: "parsingCompleted", tone: "success" },
  PROCESSING: { key: "parsingProcessing", tone: "accent" },
  PENDING: { key: "parsingPending", tone: "neutral" },
  FAILED: { key: "parsingFailed", tone: "danger" },
};

/** Resume version parsing status (completed/processing/pending/failed) as a user word plus a tone. */
export function parsingStatusLabel(status: string | null | undefined, locale: AppLocale) {
  const entry = PARSING[(status ?? "").toUpperCase()];
  return entry
    ? { label: label(locale, entry.key), tone: entry.tone }
    : { label: label(locale, "parsingUnknown"), tone: "neutral" as const };
}
