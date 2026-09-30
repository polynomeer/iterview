import { PracticalInterviewReviewWorkspace } from "./review/PracticalInterviewReviewWorkspace";

/** `/interview/records/:recordId/transcript`: the review workspace on the transcript lane. */
export function PracticalInterviewTranscriptPage() {
  return <PracticalInterviewReviewWorkspace route="transcript" />;
}
