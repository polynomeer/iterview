import type { ResumeListModel } from "../../entities/resume/model";
import { getActiveResumeVersion } from "../../entities/resume/model";
import { MetricCard } from "../../shared/ui/MetricCard";

type ActiveResumeOverviewCardProps = {
  resumeList: ResumeListModel;
};

export function ActiveResumeOverviewCard({ resumeList }: ActiveResumeOverviewCardProps) {
  const activeVersion = getActiveResumeVersion(resumeList);

  if (!activeVersion) {
    return (
      <section className="page-card">
        <span className="page-card__label">Active resume</span>
        <h2 className="page-card__title">No active resume version</h2>
        <p className="page-card__body">
          Activate one of your uploaded versions to tie question analysis and scoring to your current resume context.
        </p>
      </section>
    );
  }

  const totalVersionCount =
    resumeList.items.find((resume) => resume.id === activeVersion.resumeId)?.versions.length ?? 1;

  return (
      <section className="page-card">
        <div className="section-heading">
          <div>
            <p className="section-heading__eyebrow">Active resume</p>
            <h2 className="page-card__title">Active version overview</h2>
          </div>
        </div>
      <p className="page-card__body">
        {activeVersion.resumeTitle} · {activeVersion.fileNameLabel}
      </p>
      <div className="stats-grid">
        <MetricCard label="Version" value={activeVersion.versionNumberLabel} />
        <MetricCard label="Parsing" value={activeVersion.parsingStatusLabel} tone="accent" />
        <MetricCard label="Uploaded" value={activeVersion.uploadedAtLabel ?? "Unknown"} tone="muted" />
        <MetricCard label="Versions" value={String(totalVersionCount)} tone="muted" />
      </div>
    </section>
  );
}
