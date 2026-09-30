import { PracticalInterviewReviewWorkspace } from "./review/PracticalInterviewReviewWorkspace";

/** `/interview/records/:recordId/questions/:questionId`: the review workspace focused on one question. */
export function PracticalInterviewQuestionPage() {
  return <PracticalInterviewReviewWorkspace route="question" />;
}
