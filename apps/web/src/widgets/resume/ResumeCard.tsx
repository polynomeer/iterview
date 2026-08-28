import type { ResumeModel } from "../../entities/resume/model";
import { ResumeVersionList } from "./ResumeVersionList";

type ResumeCardProps = {
  resume: ResumeModel;
  isSelected: boolean;
  pendingUploadResumeId: string | null;
  selectedVersionId: string | null;
  onSelectResume: (resumeId: string) => void;
  onUploadVersion: (resumeId: string, file: File) => void;
  onSelectVersion: (versionId: string) => void;
};

export function ResumeCard({
  resume,
  isSelected,
  pendingUploadResumeId,
  selectedVersionId,
  onSelectResume,
  onUploadVersion,
  onSelectVersion,
}: ResumeCardProps) {
  return (
    <section
      className={`page-card ${isSelected ? "page-card--selected" : ""}`}
      onClick={() => onSelectResume(resume.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelectResume(resume.id);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">이력서</p>
          <h2 className="page-card__title">{resume.title}</h2>
        </div>
        <div className="resume-card__header-actions">
          <span className="section-heading__count">{resume.versions.length}</span>
          {isSelected ? (
            <label className="secondary-button resume-upload-button">
              <input
                accept="application/pdf"
                className="resume-upload-button__input"
                disabled={pendingUploadResumeId === resume.id}
                onChange={(event) => {
                  event.stopPropagation();
                  const file = event.target.files?.[0];
                  if (file) {
                    onUploadVersion(resume.id, file);
                  }
                  event.target.value = "";
                }}
                onClick={(event) => {
                  event.stopPropagation();
                }}
                type="file"
              />
              {pendingUploadResumeId === resume.id ? "업로드 중..." : "PDF 업로드"}
            </label>
          ) : null}
        </div>
      </div>
      <ResumeVersionList
        onSelectVersion={onSelectVersion}
        selectedVersionId={selectedVersionId}
        versions={resume.versions}
      />
    </section>
  );
}
