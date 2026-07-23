import type { HomeModel } from "../../entities/home/model";
import { SkillSummaryBlock } from "../../shared/ui/SkillSummaryBlock";

type WeakSkillPreviewCardProps = {
  items: HomeModel["skillGapPreview"];
};

export function WeakSkillPreviewCard({ items }: WeakSkillPreviewCardProps) {
  return (
    <SkillSummaryBlock
      emptyMessage="No weak-skill preview is available yet."
      eyebrow="Gap analysis"
      items={items.map((item) => ({
        id: item.id,
        label: item.label,
        value: item.gapScoreLabel,
        helperText: item.helperText,
        tone: "warning",
      }))}
      title="Weak skills to focus next"
    />
  );
}
