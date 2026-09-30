/** Interview formats a record can be tagged with: [code, Korean, English]. */
export const INTERVIEW_TYPES: Array<[string, string, string]> = [
  ["onsite", "대면", "Onsite"],
  ["virtual", "화상", "Video"],
  ["phone", "전화", "Phone"],
  ["behavioral", "인성 면접", "Behavioral"],
  ["system_design", "시스템 디자인", "System design"],
];

/** The localized format name, or null for codes the user never picked (e.g. general, practical). */
export function interviewTypeLabel(code: string, isKorean: boolean) {
  const entry = INTERVIEW_TYPES.find(([value]) => value === code);
  return entry ? (isKorean ? entry[1] : entry[2]) : null;
}
