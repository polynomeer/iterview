import { Suspense, lazy, type ReactNode } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routeConfig } from "../shared/config/routes";
import { LoadingStateCard } from "../shared/ui/LoadingStateCard";
import { PageContainer } from "../shared/ui/PageContainer";
import { AppLayout } from "../widgets/layout/AppLayout";
import { ProtectedRoute } from "./router/ProtectedRoute";

const HomePage = lazy(() => import("../pages/home/HomePage").then((module) => ({ default: module.HomePage })));
const PracticePage = lazy(() => import("../pages/practice/PracticePage").then((module) => ({ default: module.PracticePage })));
const SkillsPage = lazy(() => import("../pages/skills/SkillsPage").then((module) => ({ default: module.SkillsPage })));
const ReviewQueuePage = lazy(() => import("../pages/review-queue/ReviewQueuePage").then((module) => ({ default: module.ReviewQueuePage })));
const ScheduledReviewsPage = lazy(() => import("../pages/scheduled-reviews/ScheduledReviewsPage").then((module) => ({ default: module.ScheduledReviewsPage })));
const QuestionDetailPage = lazy(() => import("../pages/question-detail/QuestionDetailPage").then((module) => ({ default: module.QuestionDetailPage })));
const QuestionTreePage = lazy(() => import("../pages/question-tree/QuestionTreePage").then((module) => ({ default: module.QuestionTreePage })));
const AnswerEditorPage = lazy(() => import("../pages/answer-editor/AnswerEditorPage").then((module) => ({ default: module.AnswerEditorPage })));
const ResultAnalysisPage = lazy(() => import("../pages/result-analysis/ResultAnalysisPage").then((module) => ({ default: module.ResultAnalysisPage })));
const ArchivePage = lazy(() => import("../pages/archive/ArchivePage").then((module) => ({ default: module.ArchivePage })));
const FeedPage = lazy(() => import("../pages/feed/FeedPage").then((module) => ({ default: module.FeedPage })));
const NotesPage = lazy(() => import("../pages/notes/NotesPage").then((module) => ({ default: module.NotesPage })));
const BookmarksPage = lazy(() => import("../pages/bookmarks/BookmarksPage").then((module) => ({ default: module.BookmarksPage })));
const TargetCompaniesPage = lazy(() => import("../pages/target-companies/TargetCompaniesPage").then((module) => ({ default: module.TargetCompaniesPage })));
const SettingsPage = lazy(() => import("../pages/settings/SettingsPage").then((module) => ({ default: module.SettingsPage })));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage").then((module) => ({ default: module.ProfilePage })));
const ResumePage = lazy(() => import("../pages/resume/ResumePage").then((module) => ({ default: module.ResumePage })));
const ResumeAnalysisPage = lazy(() => import("../pages/resume-analysis/ResumeAnalysisPage").then((module) => ({ default: module.ResumeAnalysisPage })));
const ResumeTailorLandingPage = lazy(() => import("../pages/resume-tailor/ResumeTailorLandingPage").then((module) => ({ default: module.ResumeTailorLandingPage })));
const ResumeTailorJobPostingsPage = lazy(() => import("../pages/resume-tailor/ResumeTailorJobPostingsPage").then((module) => ({ default: module.ResumeTailorJobPostingsPage })));
const ResumeTailorAnalysisListPage = lazy(() => import("../pages/resume-tailor/ResumeTailorAnalysisListPage").then((module) => ({ default: module.ResumeTailorAnalysisListPage })));
const ResumeTailorAnalysisDetailPage = lazy(() => import("../pages/resume-tailor/ResumeTailorAnalysisDetailPage").then((module) => ({ default: module.ResumeTailorAnalysisDetailPage })));
const ResumeHeatmapPage = lazy(() => import("../pages/resume-heatmap/ResumeHeatmapPage").then((module) => ({ default: module.ResumeHeatmapPage })));
const ResumeHeatmapAnchorPage = lazy(() => import("../pages/resume-heatmap/ResumeHeatmapAnchorPage").then((module) => ({ default: module.ResumeHeatmapAnchorPage })));
const ResumeEditorPage = lazy(() => import("../pages/resume-editor/ResumeEditorPage").then((module) => ({ default: module.ResumeEditorPage })));
const InterviewPage = lazy(() => import("../pages/interview/InterviewPage").then((module) => ({ default: module.InterviewPage })));
const InterviewSessionPage = lazy(() => import("../pages/interview-session/InterviewSessionPage").then((module) => ({ default: module.InterviewSessionPage })));
const InterviewResultPage = lazy(() => import("../pages/interview-result/InterviewResultPage").then((module) => ({ default: module.InterviewResultPage })));
const PracticalInterviewListPage = lazy(() => import("../pages/practical-interviews/PracticalInterviewListPage").then((module) => ({ default: module.PracticalInterviewListPage })));
const PracticalInterviewReviewPage = lazy(() => import("../pages/practical-interviews/PracticalInterviewReviewPage").then((module) => ({ default: module.PracticalInterviewReviewPage })));
const LoginPage = lazy(() => import("../pages/login/LoginPage").then((module) => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import("../pages/signup/SignupPage").then((module) => ({ default: module.SignupPage })));

function RouteLoadingFallback() {
  return (
    <PageContainer
      description="Loading the next workspace and preparing the route-level bundle for this screen."
      eyebrow="Navigation"
      title="Opening page"
    >
      <LoadingStateCard
        body="The requested page is being loaded."
        title="Preparing screen"
      />
    </PageContainer>
  );
}

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<RouteLoadingFallback />}>{node}</Suspense>;
}

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: routeConfig.home.path,
        element: withSuspense(<HomePage />),
      },
      {
        path: routeConfig.practice.path,
        element: withSuspense(<PracticePage />),
      },
      {
        path: routeConfig.questionDetail.path,
        element: withSuspense(<QuestionDetailPage />),
      },
      {
        path: routeConfig.questionTree.path,
        element: withSuspense(<QuestionTreePage />),
      },
      {
        path: routeConfig.feed.path,
        element: withSuspense(<FeedPage />),
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: routeConfig.skills.path,
            element: withSuspense(<SkillsPage />),
          },
          {
            path: routeConfig.reviewQueue.path,
            element: withSuspense(<ReviewQueuePage />),
          },
          {
            path: routeConfig.scheduledReviews.path,
            element: withSuspense(<ScheduledReviewsPage />),
          },
          {
            path: routeConfig.answerEditor.path,
            element: withSuspense(<AnswerEditorPage />),
          },
          {
            path: routeConfig.resultAnalysis.path,
            element: withSuspense(<ResultAnalysisPage />),
          },
          {
            path: routeConfig.archive.path,
            element: withSuspense(<ArchivePage />),
          },
          {
            path: routeConfig.notes.path,
            element: withSuspense(<NotesPage />),
          },
          {
            path: routeConfig.bookmarks.path,
            element: withSuspense(<BookmarksPage />),
          },
          {
            path: routeConfig.targetCompanies.path,
            element: withSuspense(<TargetCompaniesPage />),
          },
          {
            path: routeConfig.settings.path,
            element: withSuspense(<SettingsPage />),
          },
          {
            path: routeConfig.profile.path,
            element: withSuspense(<ProfilePage />),
          },
          {
            path: routeConfig.resume.path,
            element: withSuspense(<ResumePage />),
          },
          {
            path: routeConfig.resumeAnalysis.path,
            element: withSuspense(<ResumeAnalysisPage />),
          },
          {
            path: routeConfig.resumeHeatmap.path,
            element: withSuspense(<ResumeHeatmapPage />),
          },
          {
            path: routeConfig.resumeEditor.path,
            element: withSuspense(<ResumeEditorPage />),
          },
          {
            path: routeConfig.resumeHeatmapAnchor.path,
            element: withSuspense(<ResumeHeatmapAnchorPage />),
          },
          {
            path: routeConfig.resumeTailor.path,
            element: withSuspense(<ResumeTailorLandingPage />),
          },
          {
            path: routeConfig.resumeTailorJobPostings.path,
            element: withSuspense(<ResumeTailorJobPostingsPage />),
          },
          {
            path: routeConfig.resumeTailorAnalysisList.path,
            element: withSuspense(<ResumeTailorAnalysisListPage />),
          },
          {
            path: routeConfig.resumeTailorAnalysisDetail.path,
            element: withSuspense(<ResumeTailorAnalysisDetailPage />),
          },
          {
            path: routeConfig.interview.path,
            element: withSuspense(<InterviewPage />),
          },
          {
            path: routeConfig.practicalInterviews.path,
            element: withSuspense(<PracticalInterviewListPage />),
          },
          {
            path: routeConfig.practicalInterviewUpload.path,
            element: withSuspense(<PracticalInterviewListPage />),
          },
          {
            path: routeConfig.practicalInterviewDetail.path,
            element: withSuspense(<PracticalInterviewReviewPage />),
          },
          {
            path: routeConfig.practicalInterviewTranscript.path,
            element: withSuspense(<PracticalInterviewReviewPage />),
          },
          {
            path: routeConfig.practicalInterviewQuestion.path,
            element: withSuspense(<PracticalInterviewReviewPage />),
          },
          {
            path: routeConfig.practicalInterviewSimulate.path,
            element: withSuspense(<PracticalInterviewReviewPage />),
          },
          {
            path: "/interview",
            element: withSuspense(<InterviewPage />),
          },
          {
            path: routeConfig.interviewSession.path,
            element: withSuspense(<InterviewSessionPage />),
          },
          {
            path: "/interview/sessions/:sessionId",
            element: withSuspense(<InterviewSessionPage />),
          },
          {
            path: routeConfig.interviewSessionResult.path,
            element: withSuspense(<InterviewResultPage />),
          },
          {
            path: "/interview/sessions/:sessionId/result",
            element: withSuspense(<InterviewResultPage />),
          },
        ],
      },
      {
        path: routeConfig.login.path,
        element: withSuspense(<LoginPage />),
      },
      {
        path: routeConfig.signup.path,
        element: withSuspense(<SignupPage />),
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
