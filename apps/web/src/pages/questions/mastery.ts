import type { Tone } from "../../shared/ui/primitives";

export type Mastery = "unanswered" | "weak" | "answered" | "strong";

/** Normalizes the tree/follow-up nodeStatus values sent by the API (unanswered/weak/answered/strong). */
export function toMastery(status: string | null | undefined): Mastery {
  switch ((status ?? "").toLowerCase()) {
    case "weak":
      return "weak";
    case "answered":
      return "answered";
    case "strong":
      return "strong";
    default:
      return "unanswered";
  }
}

export const MASTERY_TONE: Record<Mastery, Tone> = {
  unanswered: "neutral",
  weak: "danger",
  answered: "warning",
  strong: "success",
};

export const MASTERY_LABEL: Record<Mastery, [ko: string, en: string]> = {
  unanswered: ["미답변", "Not answered"],
  weak: ["약점", "Weak"],
  answered: ["답변함", "Answered"],
  strong: ["숙달", "Strong"],
};
