import { Link } from "react-router-dom";
import { getErrorDetails, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { EditorHeader } from "./components/EditorHeader";
import { ImportMarkdownDialog } from "./components/ImportMarkdownDialog";
import { MergePreviewPanel } from "./components/MergePreviewPanel";
import { DocumentWorkspace } from "./components/tabs/DocumentWorkspace";
import { HeatmapTab } from "./components/tabs/HeatmapTab";
import { HistoryTab } from "./components/tabs/HistoryTab";
import { PrintPreviewTab } from "./components/tabs/PrintPreviewTab";
import { WorkspaceSurface } from "./components/WorkspaceSurface";
import { useResumeEditorController } from "./hooks/useResumeEditorController";

export function ResumeEditorPage() {
  const ctrl = useResumeEditorController();
  const {
    isKorean,
    versionId,
    safeVersionId,
    currentTab,
    workspaceQuery,
    updateDocumentMutation,
    importMarkdownMutation,
    mergePreviewMessage,
    saveCurrentDraft,
    importMarkdownOpen,
  } = ctrl;

  if (!versionId) {
    return (
      <PageContainer
        description={isKorean ? "먼저 이력서 버전을 선택하세요." : "Choose a resume version first."}
        eyebrow={isKorean ? "이력서 에디터" : "Resume Editor"}
        title={isKorean ? "에디터를 열 수 없습니다" : "Editor unavailable"}
      >
        <EmptyStateCard
          action={{ label: isKorean ? "이력서 열기" : "Open resumes", to: routeConfig.resume.buildPath() }}
          body={isKorean ? "에디터 경로에는 이력서 버전 ID가 필요합니다." : "The editor route requires a resume version id."}
          title={isKorean ? "이력서 버전이 없습니다" : "Missing resume version"}
        />
      </PageContainer>
    );
  }

  if (workspaceQuery.isLoading) {
    return (
      <PageContainer
        description={isKorean ? "변경 불가능한 이력서 버전에서 에디터 작업공간을 준비하고 있습니다." : "Bootstrapping the resume editor workspace from the immutable resume version."}
        eyebrow={isKorean ? "이력서 에디터" : "Resume Editor"}
        title={isKorean ? "작업공간 준비 중" : "Preparing workspace"}
      >
        <LoadingStateCard
          body={isKorean ? "초안 작업공간, 주석, 리비전 맥락을 불러오는 중입니다." : "Loading the draft workspace, annotations, and revision context."}
          title={isKorean ? "이력서 에디터 준비 중" : "Preparing resume editor"}
        />
      </PageContainer>
    );
  }

  if (workspaceQuery.isError || !workspaceQuery.data) {
    return (
      <PageContainer
        description={isKorean ? "이력서 에디터 작업공간을 불러오지 못했습니다." : "The resume editor workspace could not be loaded."}
        eyebrow={isKorean ? "이력서 에디터" : "Resume Editor"}
        title={isKorean ? "작업공간을 열 수 없습니다" : "Workspace unavailable"}
      >
        <ErrorStateCard
          body={
            userFacingErrorMessage(workspaceQuery.error, isKorean
                ? "이력서 에디터 작업공간을 불러오지 못했습니다."
                : "The resume editor workspace could not be loaded.")
          }
          details={getErrorDetails(workspaceQuery.error)}
          onAction={() => {
            void workspaceQuery.refetch();
          }}
          title={isKorean ? "이력서 에디터 작업공간을 불러올 수 없습니다" : "Unable to load resume editor workspace"}
        />
      </PageContainer>
    );
  }

  const workspace = workspaceQuery.data;

  return (
    <PageContainer
      actions={
        <>
          <Link className="secondary-button" to={routeConfig.resume.buildPath()}>
            {isKorean ? "이력서로 돌아가기" : "Back to resumes"}
          </Link>
          {workspace.heatmapAvailable ? (
            <Link className="secondary-button" to={routeConfig.resumeHeatmap.buildPath({ versionId: safeVersionId })}>
              {isKorean ? "히트맵 열기" : "Open heatmap"}
            </Link>
          ) : null}
          <button
            className="primary-button"
            disabled={updateDocumentMutation.isPending || importMarkdownMutation.isPending}
            onClick={() => {
              void saveCurrentDraft("manual_edit");
            }}
            type="button"
          >
            {updateDocumentMutation.isPending || importMarkdownMutation.isPending
              ? isKorean
                ? "저장 중..."
                : "Saving..."
              : isKorean
                ? "초안 저장"
                : "Save draft"}
          </button>
        </>
      }
      description={isKorean ? "이력서 기준 문서를 작성하고, 각 주장을 댓글, 질문 카드, 연결된 인터뷰 맥락으로 압박 테스트하세요." : "Author the resume source of truth, then pressure-test each claim with comments, question cards, and linked interview context."}
      eyebrow={isKorean ? "기준 문서 에디터" : "Source of truth editor"}
      title={workspace.sourceFileName}
    >
      <div className="page-stack">
        <WorkspaceSurface ctrl={ctrl} workspace={workspace} />

        <EditorHeader ctrl={ctrl} workspace={workspace} />

        {importMarkdownOpen ? <ImportMarkdownDialog ctrl={ctrl} workspace={workspace} /> : null}

        {mergePreviewMessage ? <MergePreviewPanel ctrl={ctrl} workspace={workspace} /> : null}

        {currentTab === "edit" || currentTab === "review" ? (
          <DocumentWorkspace ctrl={ctrl} workspace={workspace} />
        ) : null}

        {currentTab === "heatmap" ? <HeatmapTab ctrl={ctrl} workspace={workspace} /> : null}

        {currentTab === "print-preview" ? <PrintPreviewTab ctrl={ctrl} /> : null}

        {currentTab === "history" ? <HistoryTab ctrl={ctrl} /> : null}
      </div>
    </PageContainer>
  );
}
