import type { HomeModel } from "../../entities/home/model";
import { useLocale } from "../../shared/i18n";
import { SkillSummaryBlock } from "../../shared/ui/SkillSummaryBlock";

type WeakSkillPreviewCardProps = {
  items: HomeModel["skillGapPreview"];
};

export function WeakSkillPreviewCard({ items }: WeakSkillPreviewCardProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <SkillSummaryBlock
      emptyMessage={isKorean ? "아직 약한 스킬 미리보기가 없습니다." : "No weak-skill preview is available yet."}
      eyebrow={isKorean ? "격차 분석" : "Gap analysis"}
      items={items.map((item) => ({
        id: item.id,
        label: item.label,
        value: item.gapScoreLabel,
        helperText: item.helperText,
        tone: "warning",
      }))}
      title={isKorean ? "다음에 집중할 약한 스킬" : "Weak skills to focus next"}
    />
  );
}
