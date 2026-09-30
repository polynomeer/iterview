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
