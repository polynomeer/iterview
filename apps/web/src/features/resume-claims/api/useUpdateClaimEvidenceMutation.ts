import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mapClaimEvidence, type ResumeSnapshotModel } from "../../../entities/resume/model";
import { queryKeys } from "../../../shared/api/queryKeys";
import { updateResumeAchievementEvidenceRequest } from "../../../shared/api/resumeApi";
import type { UpdateResumeAchievementEvidenceRequestDto } from "../../../shared/types/resume";

type Variables = { achievementId: string; evidence: UpdateResumeAchievementEvidenceRequestDto };

/** Saves one claim's evidence and writes the answer back into the version's snapshot cache. */
export function useUpdateClaimEvidenceMutation(versionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ achievementId, evidence }: Variables) =>
      updateResumeAchievementEvidenceRequest(versionId, achievementId, evidence),
    onSuccess: (saved, { achievementId }) => {
      queryClient.setQueryData<ResumeSnapshotModel>(queryKeys.resumes.snapshots(versionId), (snapshot) =>
        snapshot
          ? {
              ...snapshot,
              achievements: snapshot.achievements.map((claim) =>
                claim.id === achievementId ? { ...claim, evidence: mapClaimEvidence(saved.evidence) } : claim,
              ),
            }
          : snapshot,
      );
    },
  });
}
