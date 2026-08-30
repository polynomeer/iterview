import type { FeedSectionModel } from "../../entities/feed/model";
import { useLocale } from "../../shared/i18n";
import { SectionEmptyState } from "../../shared/ui/SectionEmptyState";
import { FeedQuestionCard } from "./FeedQuestionCard";
import { SectionHeader } from "./SectionHeader";

type FeedSectionProps = {
  section: FeedSectionModel;
  layout?: "stack" | "grid";
};

export function FeedSection({ section, layout = "stack" }: FeedSectionProps) {
  const { t } = useLocale();
  const helperTextById: Record<string, string> = {
    popular: t("feed.popularHelper"),
    trending: t("feed.trendingHelper"),
    companyRelated: t("feed.companyRelatedHelper"),
  };

  return (
    <section className="page-card feed-section-card">
      <SectionHeader
        count={section.items.length}
        helperText={helperTextById[section.id]}
        title={section.title}
      />
      {section.items.length > 0 ? (
        <div className={layout === "grid" ? "card-grid card-grid--single-column" : "stack-list"}>
          {section.items.map((item) => (
            <FeedQuestionCard item={item} key={item.id} />
          ))}
        </div>
      ) : (
        <SectionEmptyState
          body={t("feed.emptySectionBody")}
          label={section.title}
          title={t("feed.emptySectionTitle")}
        />
      )}
    </section>
  );
}
