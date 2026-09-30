import { PracticalInterviewReviewWorkspace } from "./review/PracticalInterviewReviewWorkspace";

/** `/interview/records/:recordId`: the review workspace with the lane from `?tab=`. */
export function PracticalInterviewOverviewPage() {
  return <PracticalInterviewReviewWorkspace route="overview" />;
}
