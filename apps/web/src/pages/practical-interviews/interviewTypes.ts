import type { MessageKey } from "../../shared/i18n";

/** Interview formats a record can be tagged with: code → catalog key for its label. */
export const INTERVIEW_TYPES: Record<string, MessageKey> = {
  onsite: "practicalRecords.typeOnsite",
  virtual: "practicalRecords.typeVirtual",
  phone: "practicalRecords.typePhone",
  behavioral: "practicalRecords.typeBehavioral",
  system_design: "practicalRecords.typeSystemDesign",
};

/** The format's catalog key, or null for codes the user never picked (e.g. general, practical). */
export function interviewTypeLabelKey(code: string): MessageKey | null {
  return INTERVIEW_TYPES[code] ?? null;
}
