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
        <span className="page-card__label">활성 이력서</span>
        <h2 className="page-card__title">활성 이력서 버전이 없습니다</h2>
        <p className="page-card__body">
          업로드한 버전 중 하나를 활성화하면 질문 분석과 점수 흐름이 현재 이력서 기준으로 연결됩니다.
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
            <p className="section-heading__eyebrow">활성 이력서</p>
            <h2 className="page-card__title">현재 활성 버전 요약</h2>
          </div>
        </div>
      <p className="page-card__body">
        {activeVersion.resumeTitle} · {activeVersion.fileNameLabel}
      </p>
      <div className="stats-grid">
        <MetricCard label="버전" value={activeVersion.versionNumberLabel} />
        <MetricCard label="파싱" value={activeVersion.parsingStatusLabel} tone="accent" />
        <MetricCard label="업로드" value={activeVersion.uploadedAtLabel ?? "알 수 없음"} tone="muted" />
        <MetricCard label="전체 버전" value={String(totalVersionCount)} tone="muted" />
      </div>
    </section>
  );
}
