import { Suspense, lazy, type ReactNode } from "react";
import { createBrowserRouter, RouterProvider, type RouteObject } from "react-router-dom";
import { routeConfig } from "../shared/config/routes";
import { useLocale } from "../shared/i18n";
import { PageSkeleton } from "../shared/ui/primitives";
import { AppLayout } from "../widgets/layout/AppLayout";
import { NotFoundPage } from "../pages/not-found/NotFoundPage";
import { ProtectedRoute } from "./router/ProtectedRoute";
import { legacyRedirectRoutes } from "./router/legacyRedirects";
import { RouteErrorBoundary } from "./router/RouteErrorBoundary";

const HomePage = lazy(() => import("../pages/home/HomePage").then((module) => ({ default: module.HomePage })));
const QuestionsIndexPage = lazy(() => import("../pages/questions/QuestionWorkspacePage").then((module) => ({ default: module.QuestionsIndexPage })));
const QuestionWorkspacePage = lazy(() => import("../pages/questions/QuestionWorkspacePage").then((module) => ({ default: module.QuestionWorkspacePage })));
const SkillMapPage = lazy(() => import("../pages/skills/SkillMapPage").then((module) => ({ default: module.SkillMapPage })));
const ReviewQueuePage = lazy(() => import("../pages/review/ReviewQueuePage").then((module) => ({ default: module.ReviewQueuePage })));
const ScheduledReviewsPage = lazy(() => import("../pages/scheduled-reviews/ScheduledReviewsPage").then((module) => ({ default: module.ScheduledReviewsPage })));
const WeakNodesPage = lazy(() => import("../pages/weak-nodes/WeakNodesPage").then((module) => ({ default: module.WeakNodesPage })));
const AnswerEditorPage = lazy(() => import("../pages/answer-editor/AnswerEditorPage").then((module) => ({ default: module.AnswerEditorPage })));
const ResultAnalysisPage = lazy(() => import("../pages/result-analysis/ResultAnalysisPage").then((module) => ({ default: module.ResultAnalysisPage })));
const ArchivePage = lazy(() => import("../pages/review/ArchivePage").then((module) => ({ default: module.ArchivePage })));
const FeedPage = lazy(() => import("../pages/feed/FeedPage").then((module) => ({ default: module.FeedPage })));
const NotesPage = lazy(() => import("../pages/notes/NotesPage").then((module) => ({ default: module.NotesPage })));
const BookmarksPage = lazy(() => import("../pages/bookmarks/BookmarksPage").then((module) => ({ default: module.BookmarksPage })));
const TargetCompaniesPage = lazy(() => import("../pages/target-companies/TargetCompaniesPage").then((module) => ({ default: module.TargetCompaniesPage })));
const SettingsPage = lazy(() => import("../pages/settings/SettingsPage").then((module) => ({ default: module.SettingsPage })));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage").then((module) => ({ default: module.ProfilePage })));
const ResumeIndexPage = lazy(() => import("../pages/resume/ResumeIndexPage").then((module) => ({ default: module.ResumeIndexPage })));
const ResumeHubLayout = lazy(() => import("../pages/resume/ResumeHubLayout").then((module) => ({ default: module.ResumeHubLayout })));
const ResumeOverviewTab = lazy(() => import("../pages/resume/ResumeOverviewTab").then((module) => ({ default: module.ResumeOverviewTab })));
const ResumeVersionsTab = lazy(() => import("../pages/resume/ResumeVersionsTab").then((module) => ({ default: module.ResumeVersionsTab })));
const ResumeTailorRedirect = lazy(() => import("../pages/resume-tailor/ResumeTailorRedirect").then((module) => ({ default: module.ResumeTailorRedirect })));
const ResumeTailorAnalysisListPage = lazy(() => import("../pages/resume-tailor/ResumeTailorAnalysisListPage").then((module) => ({ default: module.ResumeTailorAnalysisListPage })));
const ResumeTailorAnalysisDetailPage = lazy(() => import("../pages/resume-tailor/ResumeTailorAnalysisDetailPage").then((module) => ({ default: module.ResumeTailorAnalysisDetailPage })));
const ResumeHeatmapPage = lazy(() => import("../pages/resume-heatmap/ResumeHeatmapPage").then((module) => ({ default: module.ResumeHeatmapPage })));
const ResumeHeatmapAnchorPage = lazy(() => import("../pages/resume-heatmap/ResumeHeatmapAnchorPage").then((module) => ({ default: module.ResumeHeatmapAnchorPage })));
const ResumeEditorPage = lazy(() => import("../pages/resume-editor/ResumeEditorPage").then((module) => ({ default: module.ResumeEditorPage })));
const InterviewPage = lazy(() => import("../pages/interview/InterviewPage").then((module) => ({ default: module.InterviewPage })));
const InterviewSessionPage = lazy(() => import("../pages/interview-session/InterviewSessionPage").then((module) => ({ default: module.InterviewSessionPage })));
const InterviewResultPage = lazy(() => import("../pages/interview-result/InterviewResultPage").then((module) => ({ default: module.InterviewResultPage })));
const PracticalInterviewListPage = lazy(() => import("../pages/practical-interviews/PracticalInterviewListPage").then((module) => ({ default: module.PracticalInterviewListPage })));
const PracticalInterviewUploadPage = lazy(() => import("../pages/practical-interviews/PracticalInterviewUploadPage").then((module) => ({ default: module.PracticalInterviewUploadPage })));
const PracticalInterviewReviewPage = lazy(() => import("../pages/practical-interviews/PracticalInterviewReviewPage").then((module) => ({ default: module.PracticalInterviewReviewPage })));
// Development-only primitives reference; Vite drops this import from production bundles.
const UiGalleryPage = import.meta.env.DEV
  ? lazy(() => import("../pages/dev-ui-gallery/UiGalleryPage").then((module) => ({ default: module.UiGalleryPage })))
  : null;
const LoginPage = lazy(() => import("../pages/login/LoginPage").then((module) => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import("../pages/signup/SignupPage").then((module) => ({ default: module.SignupPage })));

function RouteLoadingFallback() {
  const { t } = useLocale();

  return <PageSkeleton label={t("common.openingPageTitle")} />;
}

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<RouteLoadingFallback />}>{node}</Suspense>;
}

export const appRoutes: RouteObject[] = [
  {
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        // Page-level errors render inside the shell so navigation stays available.
        errorElement: <RouteErrorBoundary />,
        children: [
          {
            path: routeConfig.home.path,
            element: withSuspense(<HomePage />),
          },
          {
            path: routeConfig.practice.path,
            element: withSuspense(<QuestionsIndexPage />),
          },
          {
            path: routeConfig.questionDetail.path,
            element: withSuspense(<QuestionWorkspacePage />),
          },
          {
            path: routeConfig.questionTree.path,
            element: withSuspense(<QuestionWorkspacePage defaultTreeOpen />),
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
                element: withSuspense(<SkillMapPage />),
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
                path: routeConfig.weakNodes.path,
                element: withSuspense(<WeakNodesPage />),
              },
              {
                path: routeConfig.answerEditor.path,
                // Focus mode: AppLayout drops the sidebar, top bar, and tab bar while answering.
                handle: { focus: true },
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
                element: withSuspense(<ResumeIndexPage />),
              },
              {
                // The 이력서 hub: one version bar with route tabs; every tab is scoped to :versionId.
                path: routeConfig.resumeOverview.path,
                element: withSuspense(<ResumeHubLayout />),
                children: [
                  { index: true, element: withSuspense(<ResumeOverviewTab />) },
                  { path: routeConfig.resumeEditor.path, element: withSuspense(<ResumeEditorPage />) },
                  { path: routeConfig.resumeHeatmap.path, element: withSuspense(<ResumeHeatmapPage />) },
                  { path: routeConfig.resumeHeatmapAnchor.path, element: withSuspense(<ResumeHeatmapAnchorPage />) },
                  { path: routeConfig.resumeTailorAnalysisList.path, element: withSuspense(<ResumeTailorAnalysisListPage />) },
                  { path: routeConfig.resumeTailorAnalysisDetail.path, element: withSuspense(<ResumeTailorAnalysisDetailPage />) },
                  { path: routeConfig.resumeVersions.path, element: withSuspense(<ResumeVersionsTab />) },
                ],
              },
              {
                path: routeConfig.resumeTailor.path,
                element: withSuspense(<ResumeTailorRedirect />),
              },
              {
                path: routeConfig.resumeTailorJobPostings.path,
                element: withSuspense(<ResumeTailorRedirect />),
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
                element: withSuspense(<PracticalInterviewUploadPage />),
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
                path: routeConfig.interviewSession.path,
                // Focus mode, like the answer editor: one question at a time with no shell chrome.
                handle: { focus: true },
                element: withSuspense(<InterviewSessionPage />),
              },
              {
                path: routeConfig.interviewSessionResult.path,
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
          ...legacyRedirectRoutes,
          ...(UiGalleryPage ? [{ path: "/__ui", element: withSuspense(<UiGalleryPage />) }] : []),
          {
            path: "*",
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
];

const router = createBrowserRouter(appRoutes);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
