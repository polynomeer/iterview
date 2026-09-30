import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { useResumeVersionSnapshotsQuery } from "../../features/resume/api/useResumeVersionSnapshotsQuery";
import {
  useImportResumeEditorMarkdownMutation,
  usePatchResumeEditorDocumentOperationsMutation,
  useResumeEditorMergePreviewMutation,
  useUpdateResumeEditorDocumentMutation,
} from "../../features/resume-editor/api/useResumeEditorDocumentMutations";
import {
  useCreateResumeEditorCommentMutation,
  useCreateResumeEditorCommentReplyMutation,
  useCreateResumeEditorQuestionCardMutation,
  useResumeEditorQuestionSuggestionsMutation,
  useResumeEditorRewriteSuggestionsMutation,
  useUpdateResumeEditorCommentMutation,
  useUpdateResumeEditorQuestionCardMutation,
} from "../../features/resume-editor/api/useResumeEditorAnnotationMutations";
import { useResumeEditorPresenceMutation } from "../../features/resume-editor/api/useResumeEditorPresenceMutation";
import {
  useResumeEditorPrintPreviewQuery,
  useResumeEditorRevisionDetailQuery,
  useResumeEditorRevisionsQuery,
  useResumeEditorTrackedChangesQuery,
} from "../../features/resume-editor/api/useResumeEditorSecondaryQueries";
import { useResumeEditorWorkspaceQuery } from "../../features/resume-editor/api/useResumeEditorWorkspaceQuery";
import { ResumeEditorPage } from "../../pages/resume-editor/ResumeEditorPage";
import { mockMatchMedia, renderWithProviders } from "../utils";

vi.mock("../../features/resume-editor/api/useResumeEditorWorkspaceQuery", () => ({
  useResumeEditorWorkspaceQuery: vi.fn(),
}));
vi.mock("../../features/resume/api/useResumeVersionSnapshotsQuery", () => ({
  useResumeVersionSnapshotsQuery: vi.fn(),
}));
vi.mock("../../features/resume-editor/api/useResumeEditorDocumentMutations", () => ({
  useImportResumeEditorMarkdownMutation: vi.fn(),
  usePatchResumeEditorDocumentOperationsMutation: vi.fn(),
  useResumeEditorMergePreviewMutation: vi.fn(),
  useUpdateResumeEditorDocumentMutation: vi.fn(),
}));
vi.mock("../../features/resume-editor/api/useResumeEditorAnnotationMutations", () => ({
  useCreateResumeEditorCommentMutation: vi.fn(),
  useCreateResumeEditorCommentReplyMutation: vi.fn(),
  useCreateResumeEditorQuestionCardMutation: vi.fn(),
  useResumeEditorQuestionSuggestionsMutation: vi.fn(),
  useResumeEditorRewriteSuggestionsMutation: vi.fn(),
  useUpdateResumeEditorCommentMutation: vi.fn(),
  useUpdateResumeEditorQuestionCardMutation: vi.fn(),
}));
vi.mock("../../features/resume-editor/api/useResumeEditorPresenceMutation", () => ({
  useResumeEditorPresenceMutation: vi.fn(),
}));
vi.mock("../../features/resume-editor/api/useResumeEditorSecondaryQueries", () => ({
  useResumeEditorPrintPreviewQuery: vi.fn(),
  useResumeEditorRevisionDetailQuery: vi.fn(),
  useResumeEditorRevisionsQuery: vi.fn(),
  useResumeEditorTrackedChangesQuery: vi.fn(),
}));

describe("ResumeEditorPage", () => {
  it("renders the editor workspace and can save a draft", () => {
    mockMatchMedia(true);
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    const saveMutateAsync = vi.fn().mockResolvedValue(undefined);
    const createCommentMutateAsync = vi.fn().mockResolvedValue(undefined);
    const createQuestionCardMutateAsync = vi.fn().mockResolvedValue(undefined);
    const questionSuggestionsMutateAsync = vi.fn().mockResolvedValue(undefined);
    const rewriteSuggestionsMutateAsync = vi.fn().mockResolvedValue(undefined);

    vi.mocked(useResumeEditorWorkspaceQuery).mockReturnValue({
      data: {
        workspaceId: "workspace-1",
        resumeVersionId: "version-1",
        sourceVersionNo: 3,
        sourceFileName: "backend-resume.pdf",
        workspaceStatus: "draft",
        workspaceStatusLabel: "Draft",
        revisionNo: 5,
        documentModel: "rich_tree",
        selectionCapabilities: {
          supportsRichTree: true,
          supportsOperations: true,
          supportsInlineSelections: true,
          supportsContextualComments: true,
          supportsContextualQuestionCards: true,
          supportsContextualSuggestions: true,
        },
        contextMenuActions: ["comment", "question_card", "rewrite"],
        supportedViewModes: ["edit", "review", "print-preview", "history"],
        document: {
          markdownSource: "# Resume\n\nBuilt resilient backend APIs.",
          layoutMetadata: {},
          rootNodeId: "node-1",
          tableOfContents: [
            {
              id: "toc-1",
              nodeId: "node-1",
              title: "Summary",
              depth: 0,
              fieldPath: "profile.summaryText",
            },
          ],
          nodes: [
            {
              nodeId: "node-1",
              parentNodeId: null,
              nodeType: "paragraph",
              nodeTypeLabel: "Paragraph",
              text: "Built resilient backend APIs.",
              textRuns: [],
              children: [],
              collapsed: false,
              depth: 0,
              sourceAnchorType: "summary",
              sourceAnchorTypeLabel: "Summary",
              sourceAnchorRecordId: null,
              sourceAnchorKey: "summary",
              fieldPath: "profile.summaryText",
              displayOrder: 0,
              metadata: {},
            },
          ],
          blocks: [
            {
              blockId: "block-1",
              blockType: "paragraph",
              blockTypeLabel: "Paragraph",
              title: "Summary",
              textValue: "Built resilient backend APIs.",
              lines: ["Built resilient backend APIs."],
              sourceAnchorType: "summary",
              sourceAnchorTypeLabel: "Summary",
              sourceAnchorRecordId: null,
              sourceAnchorKey: "summary",
              fieldPath: "profile.summaryText",
              displayOrder: 0,
              metadata: {},
              inlineMarks: [],
            },
          ],
        },
        questionCards: [
          {
            id: "card-1",
            blockId: "block-1",
            fieldPath: "profile.summaryText",
            selectionStartOffset: null,
            selectionEndOffset: null,
            selectedText: "Built resilient backend APIs.",
            title: "Tradeoff prompt",
            questionText: "What tradeoffs did you manage while building these APIs?",
            questionType: "behavioral",
            questionTypeLabel: "Behavioral",
            sourceType: "manual",
            sourceTypeLabel: "Manual",
            linkedQuestionId: null,
            status: "active",
            statusLabel: "Active",
            followUpSuggestions: [],
            createdAtLabel: "Mar 18, 2026",
            updatedAtLabel: "Mar 18, 2026",
          },
        ],
        comments: [
          {
            id: "comment-1",
            blockId: "block-1",
            fieldPath: "profile.summaryText",
            selectionStartOffset: null,
            selectionEndOffset: null,
            selectedText: "Built resilient backend APIs.",
            body: "Clarify what made the APIs resilient.",
            status: "open",
            statusLabel: "Open",
            resolvedAtLabel: null,
            replyCount: 0,
            replies: [],
            createdAtLabel: "Mar 18, 2026",
            updatedAtLabel: "Mar 18, 2026",
          },
        ],
        commentSummary: {
          totalCount: 1,
          openCount: 1,
          resolvedCount: 0,
          totalReplyCount: 0,
        },
        questionCardSummary: {
          totalCount: 1,
          activeCount: 1,
          archivedCount: 0,
        },
        heatmapAvailable: true,
        heatmapSummary: {
          totalAnchors: 3,
          totalLinkedQuestions: 5,
          hottestAnchorLabel: "Summary",
          mostFollowedUpAnchorLabel: "Summary",
          weakestAnchorLabel: "Project A",
        },
        activePresence: [
          {
            sessionKey: "presence-1",
            userId: "user-1",
            userLabel: "Alex",
            viewMode: "edit",
            selectedBlockId: "block-1",
            isCurrentUser: true,
            updatedAtLabel: "Mar 18, 2026",
          },
        ],
        latestRevision: {
          id: "revision-5",
          revisionNo: 5,
          changeSource: "manual_edit",
          changeSourceLabel: "Manual Edit",
          changeSummary: {
            addedBlockCount: 0,
            removedBlockCount: 0,
            updatedBlockCount: 1,
            inlineMarkDelta: 0,
            changedBlockIds: ["block-1"],
          },
          createdAtLabel: "Mar 18, 2026",
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useResumeVersionSnapshotsQuery).mockReturnValue({
      data: {
        profile: {
          summaryText: "Built APIs and delivery systems.",
        },
        skills: [{ label: "TypeScript" }],
        experiences: [],
        projects: [],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useUpdateResumeEditorDocumentMutation).mockReturnValue({
      mutateAsync: saveMutateAsync,
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as never);
    vi.mocked(useImportResumeEditorMarkdownMutation).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as never);
    vi.mocked(usePatchResumeEditorDocumentOperationsMutation).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as never);
    vi.mocked(useResumeEditorMergePreviewMutation).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
      isError: false,
      error: null,
      data: null,
      reset: vi.fn(),
    } as never);
    vi.mocked(useCreateResumeEditorCommentMutation).mockReturnValue({
      mutateAsync: createCommentMutateAsync,
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as never);
    vi.mocked(useUpdateResumeEditorCommentMutation).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as never);
    vi.mocked(useCreateResumeEditorCommentReplyMutation).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as never);
    vi.mocked(useCreateResumeEditorQuestionCardMutation).mockReturnValue({
      mutateAsync: createQuestionCardMutateAsync,
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as never);
    vi.mocked(useUpdateResumeEditorQuestionCardMutation).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as never);
    vi.mocked(useResumeEditorQuestionSuggestionsMutation).mockReturnValue({
      mutateAsync: questionSuggestionsMutateAsync,
      isPending: false,
      isError: false,
      error: null,
      data: {
        selectionAnchor: {
          nodeId: "node-1",
          anchorPath: "node-1",
          fieldPath: "profile.summaryText",
          selectionStartOffset: 0,
          selectionEndOffset: 9,
          selectedText: "# Resume#",
          anchorQuote: "# Resume#",
          sentenceIndex: null,
        },
        selectedText: "# Resume#",
        suggestions: [
          {
            id: "qs-1",
            title: "Ask about API tradeoffs",
            questionText: "What tradeoffs shaped this API design?",
            questionType: "behavioral",
            questionTypeLabel: "Behavioral",
            rationale: "The selection references a core summary claim.",
            followUpSuggestions: [],
          },
        ],
      },
      reset: vi.fn(),
    } as never);
    vi.mocked(useResumeEditorRewriteSuggestionsMutation).mockReturnValue({
      mutateAsync: rewriteSuggestionsMutateAsync,
      isPending: false,
      isError: false,
      error: null,
      data: {
        suggestions: [
          {
            id: "rw-1",
            focusArea: "Specificity",
            suggestedText: "Built resilient backend APIs with measurable latency improvements.",
            rationale: "Makes the summary more concrete.",
          },
        ],
      },
      reset: vi.fn(),
    } as never);
    vi.mocked(useResumeEditorPresenceMutation).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as never);
    vi.mocked(useResumeEditorPrintPreviewQuery).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useResumeEditorRevisionsQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useResumeEditorRevisionDetailQuery).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useResumeEditorTrackedChangesQuery).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<ResumeEditorPage />} path="/resume/:versionId/claims" />
      </Routes>,
      { route: "/resume/version-1/claims" },
    );

    expect(screen.queryByText("Write the resume until every line can survive DFS follow-up pressure")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    expect(screen.queryByText("Immutable source resume context")).not.toBeInTheDocument();
    expect(screen.queryByText("Workspace presence")).not.toBeInTheDocument();
    expect(screen.getByText("Annotated preview")).toBeInTheDocument();
    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(screen.getByText("Row editor")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show fallback anchors" })).toBeInTheDocument();
    expect(screen.getAllByText("Built resilient backend APIs.").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    expect(saveMutateAsync).toHaveBeenCalledTimes(1);

    const editableLine = screen.getByRole("textbox", { name: "Editable line 1" });
    const blankLine = screen.getByRole("textbox", { name: "Editable line 2" });
    expect(blankLine).toBeInTheDocument();
    fireEvent.keyDown(blankLine, { key: "Backspace" });
    expect(screen.queryByRole("textbox", { name: "Editable line 3" })).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Editable line 2" })).toHaveTextContent(
      "Built resilient backend APIs.",
    );
    fireEvent.focus(editableLine);
    expect(screen.queryByText("Current line")).not.toBeInTheDocument();
    const editorSurface = screen
      .getByText("Edit each row directly")
      .closest(".page-card")
      ?.querySelector(".resume-editor-document-preview__body");
    expect(editorSurface).not.toBeNull();
    if (editorSurface) {
      fireEvent.mouseDown(editorSurface);
    }
    expect(screen.queryByText("Selection tools")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Preview line menu 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Turn into →" }));
    fireEvent.click(screen.getByRole("button", { name: "Heading 1" }));
    expect(editableLine).toHaveTextContent("Resume");
    Object.defineProperty(editableLine, "innerText", {
      configurable: true,
      value: "Resume\nDetails",
    });
    fireEvent.input(editableLine);
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    fireEvent.click(screen.getByRole("button", { name: "Preview line menu 1" }));
    expect(screen.getByRole("button", { name: "Turn into →" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Comment" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create card" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Suggest rewrite" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Comment" }));
    expect(screen.getByText("Comment on the current selection")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Inline comment"), {
      target: { value: "Inline note for this line." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save inline comment" }));
    expect(createCommentMutateAsync).toHaveBeenCalledWith({
      blockId: "block-1",
      selectionAnchor: {
        nodeId: "node-1",
        anchorPath: "node-1",
        fieldPath: "profile.summaryText",
        selectionStartOffset: 2,
        selectionEndOffset: 21,
        selectedText: "Resume<br />Details",
        anchorQuote: "Resume<br />Details",
        sentenceIndex: null,
      },
      fieldPath: "profile.summaryText",
      selectionStartOffset: null,
      selectionEndOffset: null,
      selectedText: "Resume<br />Details",
      body: "Inline note for this line.",
    });
    fireEvent.click(screen.getByRole("button", { name: "Preview line menu 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Suggest rewrite" }));
    expect(screen.getByText("Selection-based wording options")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Preview line menu 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Turn into →" }));
    fireEvent.click(screen.getByRole("button", { name: "Quote" }));
    expect(editableLine).toHaveTextContent("Resume");

    fireEvent.click(screen.getByRole("button", { name: "Preview line menu 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Turn into →" }));
    fireEvent.click(screen.getByRole("button", { name: "Heading 2" }));
    expect(editableLine).toHaveTextContent("Resume");
    fireEvent.click(screen.getByRole("button", { name: "Preview line menu 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Create card" }));
    expect(screen.getByText("Create a prompt from the current selection")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Inline question card text"), {
      target: { value: "Inline card question" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save inline card" }));
    expect(createQuestionCardMutateAsync).toHaveBeenCalledWith({
      blockId: "block-1",
      selectionAnchor: {
        nodeId: "node-1",
        anchorPath: "node-1",
        fieldPath: "profile.summaryText",
        selectionStartOffset: 3,
        selectionEndOffset: 22,
        selectedText: "Resume<br />Details",
        anchorQuote: "Resume<br />Details",
        sentenceIndex: null,
      },
      fieldPath: "profile.summaryText",
      selectionStartOffset: null,
      selectionEndOffset: null,
      selectedText: "Resume<br />Details",
      title: null,
      questionText: "Inline card question",
      questionType: "behavioral",
      linkedQuestionId: null,
      followUpSuggestions: [],
    });

    fireEvent.click(screen.getByRole("button", { name: "Preview line menu 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Suggest rewrite" }));
    fireEvent.click(screen.getByRole("button", { name: "Preview line menu 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Create card" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Open full panel" })[0]);
    expect(screen.getAllByText("Question cards").length).toBeGreaterThan(0);
    expect(rewriteSuggestionsMutateAsync).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Review" }));
    expect(screen.queryByRole("textbox", { name: "Editable line 1" })).not.toBeInTheDocument();
    expect(screen.getByText("Reading surface")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /Comments/ })[0]);
    expect(screen.getByText("Comment threads")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("New comment"), {
      target: { value: "Tighten this summary for platform work." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add comment" }));
    expect(createCommentMutateAsync).toHaveBeenLastCalledWith({
      blockId: "block-1",
      selectionAnchor: {
        nodeId: "node-1",
        anchorPath: "node-1",
        fieldPath: "profile.summaryText",
        selectionStartOffset: 3,
        selectionEndOffset: 22,
        selectedText: "Resume<br />Details",
        anchorQuote: "Resume<br />Details",
        sentenceIndex: null,
      },
      fieldPath: "profile.summaryText",
      selectionStartOffset: null,
      selectionEndOffset: null,
      selectedText: "Resume<br />Details",
      body: "Tighten this summary for platform work.",
    });

    fireEvent.click(screen.getByRole("button", { name: "Question cards" }));
    fireEvent.change(screen.getByLabelText("Question text"), {
      target: { value: "What tradeoffs did you manage while building these APIs?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create question card" }));
    expect(createQuestionCardMutateAsync).toHaveBeenLastCalledWith({
      blockId: "block-1",
      selectionAnchor: {
        nodeId: "node-1",
        anchorPath: "node-1",
        fieldPath: "profile.summaryText",
        selectionStartOffset: 3,
        selectionEndOffset: 22,
        selectedText: "Resume<br />Details",
        anchorQuote: "Resume<br />Details",
        sentenceIndex: null,
      },
      fieldPath: "profile.summaryText",
      selectionStartOffset: null,
      selectionEndOffset: null,
      selectedText: "Resume<br />Details",
      title: null,
      questionText: "What tradeoffs did you manage while building these APIs?",
      questionType: "behavioral",
      linkedQuestionId: null,
      followUpSuggestions: [],
    });

    fireEvent.click(screen.getByRole("button", { name: "More" }));
    fireEvent.click(screen.getByRole("button", { name: "Source" }));
    expect(screen.getByText("Immutable source resume context")).toBeInTheDocument();
  }, 15_000);
});
