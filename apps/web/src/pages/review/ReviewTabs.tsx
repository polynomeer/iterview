import { Link } from "react-router-dom";
import { useArchiveQuery } from "../../features/archive/api/useArchiveQuery";
import { useHomeQuery } from "../../features/home/api/useHomeQuery";
import { useReviewQueueQuery } from "../../features/review-queue/api/useReviewQueueQuery";
import { daysUntil } from "../../entities/review-queue/dueDates";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { weakAreas } from "./weakAreas";

export type ReviewView = "today" | "upcoming" | "weak";
export type ReviewTab = ReviewView | "done";

export function parseReviewView(value: string | null): ReviewView {
  return value === "upcoming" || value === "weak" ? value : "today";
}

export function reviewViewPath(view: ReviewView) {
  const base = routeConfig.reviewQueue.buildPath();
  return view === "today" ? base : `${base}?view=${view}`;
}

/**
 * The review hub's tabs. 오늘/예정/약한 영역 are views of /review (?view=), 완료 is its own route
 * (/review/done). Counts come from the cached queries each tab already uses.
 */
export function ReviewTabs({ active }: { active: ReviewTab }) {
  const { locale, t } = useLocale();
  const queue = useReviewQueueQuery().data?.items;
  const archive = useArchiveQuery({}).data?.items;
  const home = useHomeQuery().data;
  const dueNow = queue?.filter((item) => (daysUntil(item.scheduledAt) ?? 0) <= 0).length;

  const tabs: Array<{ id: ReviewTab; to: string; label: string; count: number | undefined }> = [
    { id: "today", to: reviewViewPath("today"), label: t("reviewQueue.tabToday"), count: dueNow },
    { id: "upcoming", to: reviewViewPath("upcoming"), label: t("reviewQueue.tabUpcoming"), count: queue && dueNow !== undefined ? queue.length - dueNow : undefined },
    { id: "weak", to: reviewViewPath("weak"), label: t("reviewQueue.tabWeak"), count: home ? weakAreas(home, locale).length : undefined },
    { id: "done", to: routeConfig.archive.buildPath(), label: t("reviewQueue.tabDone"), count: archive?.length },
  ];

  return (
    <nav aria-label={t("reviewQueue.tabsLabel")} className="ui-tabs__list review-tabs">
      {tabs.map((tab) => (
        <Link aria-current={tab.id === active ? "page" : undefined} className="ui-tabs__tab" key={tab.id} to={tab.to}>
          {tab.label}
          {tab.count !== undefined ? <span className="review-tabs__count">{tab.count}</span> : null}
        </Link>
      ))}
    </nav>
  );
}
