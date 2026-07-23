import { useQuery } from "@tanstack/react-query";
import { mapResumeEditorWorkspaceDtoToModel } from "../../../entities/resume-editor/model";
import { getResumeEditorWorkspaceRequest } from "../../../shared/api/resumeEditorApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useResumeEditorWorkspaceQuery(versionId: string | null) {
  return useQuery({
    queryKey: versionId ? queryKeys.resumes.editor(versionId) : ["resumes", "editor", "missing"],
    queryFn: async ({ signal }) => {
      if (!versionId) {
        throw new Error("Resume version id is required.");
      }

      const response = await getResumeEditorWorkspaceRequest(versionId, signal);

      return mapResumeEditorWorkspaceDtoToModel(response);
    },
    enabled: Boolean(versionId),
  });
}
