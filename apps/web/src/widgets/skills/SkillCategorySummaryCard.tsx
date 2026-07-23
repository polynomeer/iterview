import type { SkillRadarModel } from "../../entities/skill-intelligence/model";
import { SkillSummaryBlock } from "../../shared/ui/SkillSummaryBlock";

type SkillCategorySummaryCardProps = {
  radar: SkillRadarModel;
};

export function SkillCategorySummaryCard({ radar }: SkillCategorySummaryCardProps) {
  return (
    <SkillSummaryBlock
      emptyMessage="No category scores are available yet."
      eyebrow="Category scores"
      items={radar.categories.map((category) => ({
        id: category.id,
        label: category.label,
        value: category.scoreLabel,
        helperText: category.benchmarkLabel ?? category.helperText,
        tone: "accent",
      }))}
      title="Skill categories and benchmark context"
    />
  );
}
