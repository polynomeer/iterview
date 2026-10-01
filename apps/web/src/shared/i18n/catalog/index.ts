// Namespaces split out of messages.ts so screens can own their strings (docs/09 §4.6).
// Each entry is { en, ko } with identical keys; the catalog test checks the parity.
import { authScreen } from "./authScreen";
import { explore } from "./explore";
import { answerEditor } from "./answerEditor";
import { appShell } from "./appShell";
import { home } from "./home";
import { library } from "./library";
import { interviewModel } from "./interviewModel";
import { interviewResult } from "./interviewResult";
import { interviewSession } from "./interviewSession";
import { mockInterview } from "./mockInterview";
import { modelCommon } from "./modelCommon";
import { practicalModel } from "./practicalModel";
import { practicalRecords } from "./practicalRecords";
import { questionModel } from "./questionModel";
import { questionWorkspace } from "./questionWorkspace";
import { recordReview } from "./recordReview";
import { resultAnalysis } from "./resultAnalysis";
import { resultModel } from "./resultModel";
import { resumeClaims } from "./resumeClaims";
import { resumeEditor } from "./resumeEditor";
import { resumeHeatmap } from "./resumeHeatmap";
import { resumeHub } from "./resumeHub";
import { resumeModel } from "./resumeModel";
import { resumeTailor } from "./resumeTailor";
import { reviewModel } from "./reviewModel";
import { reviewQueue } from "./reviewQueue";
import { settings } from "./settings";
import { sharedLabels } from "./sharedLabels";
import { shell } from "./shell";
import { skillMap } from "./skillMap";

export const catalog = {
  explore,
  authScreen,
  settingsPage: settings,
  resumeEditor,
  resumeClaims,
  home,
  library,
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
  recordReview,
  resumeHub,
  resumeHeatmap,
  resumeTailor,
  mockInterview,
  interviewSession,
  interviewResult,
  practicalRecords,
} as const;
