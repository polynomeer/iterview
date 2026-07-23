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
    <ResumeSectionCard count={risks.length} eyebrow="Resume risks" sectionId={sectionId} title="Claims and topics to defend more clearly">
      {risks.length === 0 ? (
        <p className="page-card__body">No resume risks are available for the active version.</p>
      ) : (
        <div className="stack-list">
          {risks.map((risk) => (
            <InsightCard
              action={
                risk.linkedQuestionId
                  ? {
                      label: "Open question",
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
