import type { HomeModel } from "../../entities/home/model";
import type { AppLocale } from "../../shared/i18n";
import { scoreTone, skillCategoryLabel } from "../../shared/lib/labels";

export type WeakArea = { code: string; label: string; score: number; tone: "danger" | "warning" };

/**
 * Measured skill areas that are not yet strong, weakest first. A score of 0 means the area has
 * not been measured yet (see the home readiness preview), so it is left out.
 */
export function weakAreas(home: HomeModel | undefined, locale: AppLocale): WeakArea[] {
  return (home?.skillReadiness ?? [])
    .filter((skill) => Boolean(skill.score) && scoreTone(skill.score) !== "success")
    .map((skill) => ({
      code: skill.code,
      label: skillCategoryLabel(skill.code, locale) ?? skill.code,
      score: Math.round(skill.score ?? 0),
      tone: scoreTone(skill.score) === "danger" ? ("danger" as const) : ("warning" as const),
    }))
    .sort((left, right) => left.score - right.score);
}
