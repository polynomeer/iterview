import { useMutation } from "@tanstack/react-query";
import { createResumeEditorPresenceRequest } from "../../../shared/api/resumeEditorApi";
import type { CreateResumeEditorPresenceRequestDto } from "../../../shared/types/resumeEditor";

export function useResumeEditorPresenceMutation(versionId: string | null) {
  return useMutation({
    mutationFn: async (payload: CreateResumeEditorPresenceRequestDto) => {
      if (!versionId) {
        throw new Error("Resume version id is required.");
      }

      return createResumeEditorPresenceRequest(versionId, payload);
    },
  });
}
