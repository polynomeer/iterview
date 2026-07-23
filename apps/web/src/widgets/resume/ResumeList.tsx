import type { ResumeModel } from "../../entities/resume/model";
import { ResumeCard } from "./ResumeCard";

type ResumeListProps = {
  items: ResumeModel[];
  selectedResumeId: string | null;
  pendingUploadResumeId: string | null;
  selectedVersionId: string | null;
  onSelectResume: (resumeId: string) => void;
  onUploadVersion: (resumeId: string, file: File) => void;
  onSelectVersion: (versionId: string) => void;
  layout?: "stack" | "grid";
};

export function ResumeList({
  items,
  selectedResumeId,
  pendingUploadResumeId,
  selectedVersionId,
  onSelectResume,
  onUploadVersion,
  onSelectVersion,
  layout = "stack",
}: ResumeListProps) {
  return (
    <div className={layout === "grid" ? "card-grid" : "stack-list"}>
      {items.map((resume) => (
        <ResumeCard
          isSelected={selectedResumeId === resume.id}
          key={resume.id}
          onSelectResume={onSelectResume}
          onSelectVersion={onSelectVersion}
          onUploadVersion={onUploadVersion}
          pendingUploadResumeId={pendingUploadResumeId}
          selectedVersionId={selectedVersionId}
          resume={resume}
        />
      ))}
    </div>
  );
}
