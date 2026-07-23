import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HomePage } from "../pages/home/HomePage";
import { PracticePage } from "../pages/practice/PracticePage";
import { SkillsPage } from "../pages/skills/SkillsPage";
import { ReviewQueuePage } from "../pages/review-queue/ReviewQueuePage";
import { QuestionDetailPage } from "../pages/question-detail/QuestionDetailPage";
import { QuestionTreePage } from "../pages/question-tree/QuestionTreePage";
import { AnswerEditorPage } from "../pages/answer-editor/AnswerEditorPage";
import { ResultAnalysisPage } from "../pages/result-analysis/ResultAnalysisPage";
import { ArchivePage } from "../pages/archive/ArchivePage";
import { FeedPage } from "../pages/feed/FeedPage";
import { ProfilePage } from "../pages/profile/ProfilePage";
import { ResumePage } from "../pages/resume/ResumePage";
import { ResumeAnalysisPage } from "../pages/resume-analysis/ResumeAnalysisPage";
import { ResumeTailorLandingPage } from "../pages/resume-tailor/ResumeTailorLandingPage";
import { ResumeTailorJobPostingsPage } from "../pages/resume-tailor/ResumeTailorJobPostingsPage";
import { ResumeTailorAnalysisListPage } from "../pages/resume-tailor/ResumeTailorAnalysisListPage";
import { ResumeTailorAnalysisDetailPage } from "../pages/resume-tailor/ResumeTailorAnalysisDetailPage";
import { ResumeHeatmapPage } from "../pages/resume-heatmap/ResumeHeatmapPage";
import { ResumeHeatmapAnchorPage } from "../pages/resume-heatmap/ResumeHeatmapAnchorPage";
import { ResumeEditorPage } from "../pages/resume-editor/ResumeEditorPage";
import { InterviewPage } from "../pages/interview/InterviewPage";
import { InterviewSessionPage } from "../pages/interview-session/InterviewSessionPage";
import { InterviewResultPage } from "../pages/interview-result/InterviewResultPage";
import { PracticalInterviewListPage } from "../pages/practical-interviews/PracticalInterviewListPage";
import { PracticalInterviewReviewPage } from "../pages/practical-interviews/PracticalInterviewReviewPage";
import { LoginPage } from "../pages/login/LoginPage";
import { SignupPage } from "../pages/signup/SignupPage";
import { routeConfig } from "../shared/config/routes";
import { AppLayout } from "../widgets/layout/AppLayout";
import { ProtectedRoute } from "./router/ProtectedRoute";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: routeConfig.home.path,
        element: <HomePage />,
      },
      {
        path: routeConfig.practice.path,
        element: <PracticePage />,
      },
      {
        path: routeConfig.questionDetail.path,
        element: <QuestionDetailPage />,
      },
      {
        path: routeConfig.questionTree.path,
        element: <QuestionTreePage />,
      },
      {
        path: routeConfig.feed.path,
        element: <FeedPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: routeConfig.skills.path,
            element: <SkillsPage />,
          },
          {
            path: routeConfig.reviewQueue.path,
            element: <ReviewQueuePage />,
          },
          {
            path: routeConfig.answerEditor.path,
            element: <AnswerEditorPage />,
          },
          {
            path: routeConfig.resultAnalysis.path,
            element: <ResultAnalysisPage />,
          },
          {
            path: routeConfig.archive.path,
            element: <ArchivePage />,
          },
          {
            path: routeConfig.profile.path,
            element: <ProfilePage />,
          },
          {
            path: routeConfig.resume.path,
            element: <ResumePage />,
          },
          {
            path: routeConfig.resumeAnalysis.path,
            element: <ResumeAnalysisPage />,
          },
          {
            path: routeConfig.resumeHeatmap.path,
            element: <ResumeHeatmapPage />,
          },
          {
            path: routeConfig.resumeEditor.path,
            element: <ResumeEditorPage />,
          },
          {
            path: routeConfig.resumeHeatmapAnchor.path,
            element: <ResumeHeatmapAnchorPage />,
          },
          {
            path: routeConfig.resumeTailor.path,
            element: <ResumeTailorLandingPage />,
          },
          {
            path: routeConfig.resumeTailorJobPostings.path,
            element: <ResumeTailorJobPostingsPage />,
          },
          {
            path: routeConfig.resumeTailorAnalysisList.path,
            element: <ResumeTailorAnalysisListPage />,
          },
          {
            path: routeConfig.resumeTailorAnalysisDetail.path,
            element: <ResumeTailorAnalysisDetailPage />,
          },
          {
            path: routeConfig.interview.path,
            element: <InterviewPage />,
          },
          {
            path: routeConfig.practicalInterviews.path,
            element: <PracticalInterviewListPage />,
          },
          {
            path: routeConfig.practicalInterviewUpload.path,
            element: <PracticalInterviewListPage />,
          },
          {
            path: routeConfig.practicalInterviewDetail.path,
            element: <PracticalInterviewReviewPage />,
          },
          {
            path: routeConfig.practicalInterviewTranscript.path,
            element: <PracticalInterviewReviewPage />,
          },
          {
            path: routeConfig.practicalInterviewQuestion.path,
            element: <PracticalInterviewReviewPage />,
          },
          {
            path: routeConfig.practicalInterviewSimulate.path,
            element: <PracticalInterviewReviewPage />,
          },
          {
            path: "/interview",
            element: <InterviewPage />,
          },
          {
            path: routeConfig.interviewSession.path,
            element: <InterviewSessionPage />,
          },
          {
            path: "/interview/sessions/:sessionId",
            element: <InterviewSessionPage />,
          },
          {
            path: routeConfig.interviewSessionResult.path,
            element: <InterviewResultPage />,
          },
          {
            path: "/interview/sessions/:sessionId/result",
            element: <InterviewResultPage />,
          },
        ],
      },
      {
        path: routeConfig.login.path,
        element: <LoginPage />,
      },
      {
        path: routeConfig.signup.path,
        element: <SignupPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
