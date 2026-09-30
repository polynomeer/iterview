import { PracticalInterviewReviewWorkspace } from "./review/PracticalInterviewReviewWorkspace";

/** `/interview/records/:recordId/simulate`: the review workspace with the replay launcher open. */
export function PracticalInterviewSimulatePage() {
  return <PracticalInterviewReviewWorkspace route="simulate" />;
}
