// Namespaces split out of messages.ts so screens can own their strings (docs/09 §4.6).
// Each entry is { en, ko } with identical keys; the catalog test checks the parity.
import { answerEditor } from "./answerEditor";
import { appShell } from "./appShell";
import { home } from "./home";
import { interviewModel } from "./interviewModel";
import { modelCommon } from "./modelCommon";
import { practicalModel } from "./practicalModel";
import { practicalReview } from "./practicalReview";
import { practicalReviewPanels } from "./practicalReviewPanels";
import { questionModel } from "./questionModel";
import { questionWorkspace } from "./questionWorkspace";
import { resultAnalysis } from "./resultAnalysis";
import { resultModel } from "./resultModel";
import { resumeEditor } from "./resumeEditor";
import { resumeModel } from "./resumeModel";
import { reviewModel } from "./reviewModel";
import { reviewQueue } from "./reviewQueue";
import { settings } from "./settings";
import { sharedLabels } from "./sharedLabels";
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
  appShell,
  sharedLabels,
  modelCommon,
  questionModel,
  reviewModel,
  resumeModel,
  resultModel,
  interviewModel,
  practicalModel,
  practicalReview,
  practicalReviewPanels,
} as const;
