import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { ReviewQueueItemModel } from "../../entities/review-queue/model";
import { useHomeQuery } from "../../features/home/api/useHomeQuery";
import { useReviewQueueActionMutation } from "../../features/review-queue/api/useReviewQueueActionMutation";
import { useReviewQueueQuery } from "../../features/review-queue/api/useReviewQueueQuery";
import { getErrorDetails, optionalErrorMessage, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale, type AppLocale } from "../../shared/i18n";
import { difficultyLabel } from "../../shared/lib/labels";
import {
  Badge,
  Button,
  ButtonLink,
  Callout,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  ListRow,
  PageSkeleton,
  Segmented,
} from "../../shared/ui/primitives";
import { daysUntil, weekLoad } from "../../entities/review-queue/dueDates";
import { parseReviewView, ReviewTabs } from "./ReviewTabs";
import { weakAreas, type WeakArea } from "./weakAreas";
import "./review.css";

type SortMode = "due" | "priority";

/** The API's highest retry priority: a very low total, a severely weak dimension, or a skipped answer. */
const HIGH_PRIORITY = 100;

function dateLocale(locale: AppLocale) {
  return locale === "ko" ? "ko-KR" : "en-US";
}

function DueLabel({ scheduledAt, locale }: { scheduledAt: string | null; locale: AppLocale }) {
  const { t } = useLocale();
  const days = daysUntil(scheduledAt);
  if (days === null) {
    return <span className="review-item__due">-</span>;
  }
  if (days < 0) {
    return <span className="review-item__due review-item__due--overdue">{t("reviewQueue.overdueDays", { days: -days })}</span>;
  }
  if (days === 0) {
    return <span className="review-item__due review-item__due--today">{t("reviewQueue.today")}</span>;
  }
  const date = new Date(scheduledAt as string);
  return (
    <span className="review-item__due review-item__due--later">
      {date.toLocaleDateString(dateLocale(locale), { month: "numeric", day: "numeric" })}
    </span>
  );
}

function sortItems(items: ReviewQueueItemModel[], mode: SortMode) {
  return [...items].sort((left, right) => {
    if (mode === "priority") {
      return (right.priority ?? 0) - (left.priority ?? 0);
    }
    const leftDue = left.scheduledAt ? new Date(left.scheduledAt).getTime() : Number.POSITIVE_INFINITY;
    const rightDue = right.scheduledAt ? new Date(right.scheduledAt).getTime() : Number.POSITIVE_INFINITY;
    return leftDue - rightDue || (right.priority ?? 0) - (left.priority ?? 0);
  });
}

function sameDay(iso: string | null, day: Date) {
  if (!iso) {
    return false;
  }
  const due = new Date(iso);
  return due.getFullYear() === day.getFullYear() && due.getMonth() === day.getMonth() && due.getDate() === day.getDate();
}

function WeakAreaList({ areas, limit }: { areas: WeakArea[]; limit?: number }) {
  const { t } = useLocale();
  return (
    <ul className="review-weak">
      {areas.slice(0, limit).map((area) => (
        <li key={area.code}>
          <Link className="review-weak__item" to={routeConfig.skills.buildPath()}>
            <span className="review-weak__row">
              <span>{area.label}</span>
              <span className={`review-weak__score ui-tone-text--${area.tone}`}>{area.score}</span>
            </span>
            <span
              aria-label={t("reviewQueue.weakAreaScore", { area: area.label })}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={area.score}
              className={`review-weak__track review-weak__track--${area.tone}`}
              role="progressbar"
            >
              <span className="review-weak__fill" style={{ width: `${Math.min(100, area.score)}%` }} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function ReviewQueuePage() {
  const { locale, t } = useLocale();
  const [searchParams] = useSearchParams();
  const view = parseReviewView(searchParams.get("view"));
  const queueQuery = useReviewQueueQuery();
  const homeQuery = useHomeQuery();
  const skipMutation = useReviewQueueActionMutation("skip");
  const doneMutation = useReviewQueueActionMutation("done");
  const [sortMode, setSortMode] = useState<SortMode>("due");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const items = useMemo(() => sortItems(queueQuery.data?.items ?? [], sortMode), [queueQuery.data, sortMode]);
  const dueNow = items.filter((item) => (daysUntil(item.scheduledAt) ?? 0) <= 0);
  const upcoming = items.filter((item) => (daysUntil(item.scheduledAt) ?? 0) > 0);
  const week = weekLoad(items.map((item) => item.scheduledAt));
  const areas = weakAreas(homeQuery.data, locale);
  const actionError = optionalErrorMessage(skipMutation.error ?? doneMutation.error, t("reviewQueue.actionError"));

  async function act(item: ReviewQueueItemModel, action: "skip" | "done") {
    setStatus(null);
    setPendingId(item.id);
    try {
      await (action === "skip" ? skipMutation : doneMutation).mutateAsync(item.id);
      setStatus(
        action === "skip"
          ? t("reviewQueue.movedLater", { title: item.questionTitle })
          : t("reviewQueue.markedDone", { title: item.questionTitle }),
      );
    } catch {
      // Rendered through actionError.
    } finally {
      setPendingId(null);
    }
  }

  if (queueQuery.isLoading) {
    return <PageSkeleton label={t("reviewQueue.loading")} />;
  }

  if (queueQuery.isError) {
    return (
      <ErrorState
        actions={
          <Button onClick={() => void queueQuery.refetch()} variant="primary">
            {t("reviewQueue.tryAgain")}
          </Button>
        }
        body={userFacingErrorMessage(queueQuery.error, t("reviewQueue.loadErrorBody"))}
        details={getErrorDetails(queueQuery.error)}
        size="page"
        title={t("reviewQueue.loadErrorTitle")}
      />
    );
  }

  const first = dueNow[0] ?? items[0] ?? null;
  const selectedDate = selectedDay ? week.find((day) => day.date.toISOString() === selectedDay)?.date ?? null : null;
  // With nothing due, the today view lists what comes next instead of an empty card.
  const showUpcoming = view === "upcoming" || (dueNow.length === 0 && upcoming.length > 0);
  const listItems = selectedDate
    ? items.filter((item) => sameDay(item.scheduledAt, selectedDate))
    : showUpcoming
      ? upcoming
      : dueNow;
  const listTitle = selectedDate
    ? t("reviewQueue.dayListTitle", {
        date: selectedDate.toLocaleDateString(dateLocale(locale), { month: "long", day: "numeric", weekday: "short" }),
      })
    : showUpcoming
      ? t("reviewQueue.upcomingListTitle")
      : t("reviewQueue.listTitle");

  const list = (
    <Card aria-labelledby="review-list-title" className="review-list">
      <CardHeader
        actions={
          <Segmented
            items={[
              { id: "due", label: t("reviewQueue.sortByDue") },
              { id: "priority", label: t("reviewQueue.sortByPriority") },
            ]}
            label={t("reviewQueue.sort")}
            onChange={setSortMode}
            value={sortMode}
          />
        }
        titleAs="h2"
        title={<span id="review-list-title">{listTitle}</span>}
      />
      {listItems.length === 0 ? (
        <EmptyState
          actions={
            items.length === 0 ? (
              <ButtonLink to={routeConfig.practice.buildPath()}>{t("reviewQueue.browseQuestions")}</ButtonLink>
            ) : null
          }
          body={items.length === 0 ? t("reviewQueue.emptyBody") : t("reviewQueue.emptyViewBody")}
          icon="check"
          title={items.length === 0 ? t("reviewQueue.emptyTitle") : t("reviewQueue.emptyViewTitle")}
        />
      ) : (
        listItems.map((item) => (
          <ListRow
            className="review-item"
            key={item.id}
            leading={<DueLabel locale={locale} scheduledAt={item.scheduledAt} />}
            meta={[item.reasonTypeLabel, difficultyLabel(item.difficulty, locale), ...item.relatedSkillLabels].filter(Boolean).join(" · ")}
            title={
              <Link className="review-item__title" to={routeConfig.answerEditor.buildPath({ questionId: item.questionId })}>
                {item.questionTitle}
              </Link>
            }
            trailing={
              <>
                {item.priority !== null ? (
                  <Badge tone={item.priority >= HIGH_PRIORITY ? "danger" : "warning"}>
                    {item.priority >= HIGH_PRIORITY ? t("reviewQueue.badgeWeak") : t("reviewQueue.badgeNeedsWork")}
                  </Badge>
                ) : null}
                <Button disabled={pendingId === item.id} onClick={() => void act(item, "skip")} size="sm" variant="ghost">
                  {t("reviewQueue.later")}
                </Button>
                <Button disabled={pendingId === item.id} onClick={() => void act(item, "done")} size="sm" variant="ghost">
                  {t("reviewQueue.done")}
                </Button>
              </>
            }
          />
        ))
      )}
    </Card>
  );

  const weakCard = (
    <Card aria-labelledby="review-weak-title" className="review-weak-card">
      <CardHeader titleAs="h2" title={<span id="review-weak-title">{t("reviewQueue.weakTitle")}</span>} />
      {homeQuery.isLoading ? (
        <p className="review-muted">{t("reviewQueue.weakLoading")}</p>
      ) : areas.length === 0 ? (
        <p className="review-muted">{homeQuery.isError ? t("reviewQueue.weakUnavailable") : t("reviewQueue.weakEmpty")}</p>
      ) : (
        <WeakAreaList areas={areas} limit={view === "weak" ? undefined : 3} />
      )}
    </Card>
  );

  return (
    <div className="ui-page review-page">
      <header className="review-header">
        <div className="review-header__row">
          <h1 className="review-header__title">{t("reviewQueue.title")}</h1>
          {first ? (
            <ButtonLink icon="arrowRight" to={routeConfig.answerEditor.buildPath({ questionId: first.questionId })} variant="primary">
              {dueNow.length > 0 ? t("reviewQueue.startTodayReviews", { count: dueNow.length }) : t("reviewQueue.startNextReview")}
            </ButtonLink>
          ) : null}
        </div>
        <ReviewTabs active={view} />
      </header>

      <div aria-live="polite" className="review-status">
        {status ? <Callout tone="success">{status}</Callout> : null}
        {actionError ? (
          <Callout title={t("reviewQueue.actionFailedTitle")} tone="danger">
            {actionError}
          </Callout>
        ) : null}
      </div>

      <div className="review-layout">
        <div className="review-layout__main">
          {view === "weak" ? (
            weakCard
          ) : (
            <>
              <section aria-label={t("reviewQueue.weekLabel")} className="review-week">
                {week.map((day) => {
                  const key = day.date.toISOString();
                  const pressed = key === selectedDay;
                  const longDate = day.date.toLocaleDateString(dateLocale(locale), { month: "long", day: "numeric", weekday: "long" });
                  return (
                    <button
                      aria-label={t("reviewQueue.weekDayButton", { date: longDate, count: day.count })}
                      aria-pressed={pressed}
                      className={`review-week__day${day.isToday ? " review-week__day--today" : ""}${day.count === 0 ? " review-week__day--empty" : ""}`}
                      key={key}
                      onClick={() => setSelectedDay(pressed ? null : key)}
                      type="button"
                    >
                      <span className="review-week__name">
                        {day.isToday ? t("reviewQueue.today") : day.date.toLocaleDateString(dateLocale(locale), { weekday: "short" })}{" "}
                        {day.date.getDate()}
                      </span>
                      <span className="review-week__count">{day.count}</span>
                    </button>
                  );
                })}
              </section>
              {list}
            </>
          )}
        </div>

        <aside aria-label={t("reviewQueue.asideLabel")} className="review-layout__aside">
          {view === "weak" ? null : weakCard}
          <section aria-labelledby="review-interval-title" className="review-interval">
            <h2 className="review-interval__title" id="review-interval-title">{t("reviewQueue.intervalTitle")}</h2>
            <p className="review-interval__body">{t("reviewQueue.intervalBody")}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
