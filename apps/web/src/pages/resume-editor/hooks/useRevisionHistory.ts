import { useEffect, useState } from "react";
import {
  useResumeEditorRevisionDetailQuery,
  useResumeEditorRevisionsQuery,
  useResumeEditorTrackedChangesQuery,
} from "../../../features/resume-editor/api/useResumeEditorSecondaryQueries";
import type { EditorTab } from "../editorTypes";

export function useRevisionHistory(versionId: string | undefined, currentTab: EditorTab) {
  const revisionsQuery = useResumeEditorRevisionsQuery(versionId ?? null, currentTab === "history");
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | null>(null);
  const [compareFromRevisionId, setCompareFromRevisionId] = useState<string | null>(null);
  const [compareToRevisionId, setCompareToRevisionId] = useState<string | null>(null);
  const revisionDetailQuery = useResumeEditorRevisionDetailQuery(
    versionId ?? null,
    selectedRevisionId,
    currentTab === "history" && Boolean(selectedRevisionId),
  );
  const trackedChangesQuery = useResumeEditorTrackedChangesQuery(
    versionId ?? null,
    compareFromRevisionId,
    compareToRevisionId,
    currentTab === "history" && Boolean(compareFromRevisionId && compareToRevisionId),
  );

  useEffect(() => {
    if (revisionsQuery.data && revisionsQuery.data.length > 0) {
      setSelectedRevisionId((current) => current ?? revisionsQuery.data[0].id);
      setCompareToRevisionId((current) => current ?? revisionsQuery.data[0].id);
      setCompareFromRevisionId((current) => current ?? revisionsQuery.data[1]?.id ?? revisionsQuery.data[0].id);
    }
  }, [revisionsQuery.data]);

  return {
    revisionsQuery,
    selectedRevisionId,
    setSelectedRevisionId,
    compareFromRevisionId,
    setCompareFromRevisionId,
    compareToRevisionId,
    setCompareToRevisionId,
    revisionDetailQuery,
    trackedChangesQuery,
  };
}
