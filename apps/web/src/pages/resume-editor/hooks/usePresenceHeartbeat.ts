import { useEffect } from "react";
import { useResumeEditorPresenceMutation } from "../../../features/resume-editor/api/useResumeEditorPresenceMutation";
import type { EditorTab, ResumeEditorWorkspace } from "../editorTypes";

/** Announces this editor session (view mode + selected block) now and every 20s. */
export function usePresenceHeartbeat({
  versionId,
  workspace,
  currentTab,
  selectedBlockId,
  sessionKey,
}: {
  versionId: string | undefined;
  workspace: ResumeEditorWorkspace | undefined;
  currentTab: EditorTab;
  selectedBlockId: string | null;
  sessionKey: string;
}) {
  const presenceMutation = useResumeEditorPresenceMutation(versionId ?? null);
  const sendPresence = presenceMutation.mutateAsync;

  useEffect(() => {
    if (!versionId || !workspace) {
      return;
    }

    void sendPresence({
      sessionKey,
      viewMode: currentTab,
      selectedBlockId,
    });

    const intervalId = window.setInterval(() => {
      void sendPresence({
        sessionKey,
        viewMode: currentTab,
        selectedBlockId,
      });
    }, 20000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [currentTab, selectedBlockId, sendPresence, sessionKey, versionId, workspace?.workspaceId]);
}
