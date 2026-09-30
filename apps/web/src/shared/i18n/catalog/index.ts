// Namespaces split out of messages.ts so screens can own their strings (docs/09 §4.6).
// Each entry is { en, ko } with identical keys; the catalog test checks the parity.
import { answerEditor } from "./answerEditor";
import { home } from "./home";
import { questionWorkspace } from "./questionWorkspace";
import { resultAnalysis } from "./resultAnalysis";
import { resumeEditor } from "./resumeEditor";
import { reviewQueue } from "./reviewQueue";
import { settings } from "./settings";
import { shell } from "./shell";
import { skillMap } from "./skillMap";

export const catalog = {
  settingsPage: settings,
  resumeEditor,
  home,
  questionWorkspace,
  answerEditor,
  resultAnalysis,
  reviewQueue,
  skillMap,
  shell,
} as const;
