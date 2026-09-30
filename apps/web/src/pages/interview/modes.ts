import type { MessageKey } from "../../shared/i18n/messages";
import type { CreateInterviewSessionRequestDto } from "../../shared/types/interview";

export type InterviewMode = NonNullable<CreateInterviewSessionRequestDto["interviewMode"]>;

export const INTERVIEW_MODES: Array<{ id: InterviewMode; label: MessageKey; description: MessageKey }> = [
  { id: "quick_screen", label: "interview.modeQuickScreen", description: "interview.modeQuickScreenDescription" },
  { id: "mock_30", label: "interview.modeMock30", description: "interview.modeMock30Description" },
  { id: "mock_60", label: "interview.modeMock60", description: "interview.modeMock60Description" },
  { id: "free_interview", label: "interview.modeFreeInterview", description: "interview.modeFreeInterviewDescription" },
  { id: "full_coverage", label: "interview.modeFullCoverage", description: "interview.modeFullCoverageDescription" },
];

/** The localized name of an interview mode code, falling back to the server label. */
export function interviewModeLabel(mode: string, fallback: string, t: (key: MessageKey) => string) {
  const entry = INTERVIEW_MODES.find((candidate) => candidate.id === mode);
  return entry ? t(entry.label) : fallback;
}
