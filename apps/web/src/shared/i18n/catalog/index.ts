// Namespaces split out of messages.ts so screens can own their strings (docs/09 §4.6).
// Each entry is { en, ko } with identical keys; the catalog test checks the parity.
import { resumeEditor } from "./resumeEditor";
import { settings } from "./settings";

export const catalog = {
  settingsPage: settings,
  resumeEditor,
} as const;
