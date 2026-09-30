import type { MessageKey } from "../../shared/i18n";
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

export const MASTERY_LABEL: Record<Mastery, MessageKey> = {
  unanswered: "questionWorkspace.masteryUnanswered",
  weak: "questionWorkspace.masteryWeak",
  answered: "questionWorkspace.masteryAnswered",
  strong: "questionWorkspace.masteryStrong",
};
