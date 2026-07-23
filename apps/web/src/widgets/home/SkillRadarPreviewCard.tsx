import type { HomeModel } from "../../entities/home/model";
import { SkillSummaryBlock } from "../../shared/ui/SkillSummaryBlock";

type SkillRadarPreviewCardProps = {
  items: HomeModel["skillRadarPreview"];
};

export function SkillRadarPreviewCard({ items }: SkillRadarPreviewCardProps) {
  return (
    <SkillSummaryBlock
      emptyMessage="Skill radar data is not available yet. Keep answering questions to build category-level readiness."
      eyebrow="Skill radar"
      items={items.map((item) => ({
        id: item.id,
        label: item.label,
        value: item.scoreLabel,
        helperText: item.helperText,
        tone: "accent",
      }))}
      title="Current readiness by skill"
    />
  );
}
