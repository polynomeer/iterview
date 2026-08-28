import type { ResumeAnalysisModel } from "../../entities/resume/model";
import { routeConfig } from "../../shared/config/routes";
import { InsightCard } from "../../shared/ui/InsightCard";
import { ResumeSectionCard } from "./ResumeSectionCard";

type ResumeRiskListProps = {
  risks: ResumeAnalysisModel["risks"];
  sectionId?: string;
};

export function ResumeRiskList({ risks, sectionId }: ResumeRiskListProps) {
  return (
    <ResumeSectionCard count={risks.length} eyebrow="이력서 리스크" sectionId={sectionId} title="더 명확히 방어해야 할 주장과 주제">
      {risks.length === 0 ? (
        <p className="page-card__body">활성 버전에서 확인된 이력서 리스크가 없습니다.</p>
      ) : (
        <div className="stack-list">
          {risks.map((risk) => (
            <InsightCard
              action={
                risk.linkedQuestionId
                  ? {
                      label: "질문 열기",
                      to: routeConfig.questionDetail.buildPath({ questionId: risk.linkedQuestionId }),
                    }
                  : undefined
              }
              body={risk.description}
              key={risk.id}
              label={risk.severityLabel}
              title={risk.title}
              tone="warning"
            />
          ))}
        </div>
      )}
    </ResumeSectionCard>
  );
}
