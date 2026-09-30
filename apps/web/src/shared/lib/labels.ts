import type { AppLocale } from "../i18n";

type Localized = Record<AppLocale, string>;

const DIFFICULTY: Record<string, Localized> = {
  EASY: { ko: "쉬움", en: "Easy" },
  MEDIUM: { ko: "보통", en: "Medium" },
  HARD: { ko: "어려움", en: "Hard" },
};

const SKILL_CATEGORY: Record<string, Localized> = {
  CS: { ko: "CS 기초", en: "CS fundamentals" },
  BACKEND: { ko: "백엔드", en: "Backend" },
  DATABASE: { ko: "데이터베이스", en: "Database" },
  SYSTEM_DESIGN: { ko: "시스템 설계", en: "System design" },
  ARCHITECTURE: { ko: "아키텍처", en: "Architecture" },
  TESTING: { ko: "테스트", en: "Testing" },
};

const SEVERITY: Record<string, Localized & { tone: "danger" | "warning" | "neutral" }> = {
  HIGH: { ko: "높음", en: "High", tone: "danger" },
  CRITICAL: { ko: "매우 높음", en: "Critical", tone: "danger" },
  MEDIUM: { ko: "보통", en: "Medium", tone: "warning" },
  LOW: { ko: "낮음", en: "Low", tone: "neutral" },
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
  return DIFFICULTY[value.toUpperCase()]?.[locale] ?? value;
}

/** Maps skill category codes (SYSTEM_DESIGN, …) to user words; unknown codes are title-cased. */
export function skillCategoryLabel(code: string | null | undefined, locale: AppLocale) {
  if (!code) {
    return null;
  }
  return SKILL_CATEGORY[code.toUpperCase()]?.[locale] ?? titleCase(code);
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
  return entry ? { label: entry[locale], tone: entry.tone } : { label: value, tone: "neutral" as const };
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
