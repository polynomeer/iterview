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
      className={`page-card resume-card ${isSelected ? "page-card--selected resume-card--selected" : ""}`}
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
      <div className="section-heading resume-card__header">
        <div className="resume-card__heading">
          <p className="section-heading__eyebrow">이력서</p>
          <h2 className="page-card__title">{resume.title}</h2>
          <p className="page-card__body resume-card__caption">
            {isSelected
              ? "현재 화면에 선택된 이력서 묶음입니다."
              : "클릭해서 이 이력서 묶음과 버전을 자세히 봅니다."}
          </p>
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
      <div className="resume-card__versions">
        <ResumeVersionList
          onSelectVersion={onSelectVersion}
          selectedVersionId={selectedVersionId}
          versions={resume.versions}
        />
      </div>
    </section>
  );
}
