import { useMemo, useState } from "react";
import type { ReviewQueueItemModel } from "../../entities/review-queue/model";
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
  PageHeader,
  PageSkeleton,
  Segmented,
} from "../../shared/ui/primitives";
import { daysUntil, weekLoad } from "./dueDates";
import "./review.css";

function useCopy() {
  const { locale } = useLocale();
  return (ko: string, en: string) => (locale === "ko" ? ko : en);
}

type SortMode = "due" | "priority";

function DueBadge({ scheduledAt, locale }: { scheduledAt: string | null; locale: AppLocale }) {
  const days = daysUntil(scheduledAt);
  const ko = locale === "ko";
  if (days === null) {
    return null;
  }
  if (days < 0) {
    return <Badge tone="danger">{ko ? `${-days}일 지남` : `${-days}d overdue`}</Badge>;
  }
  if (days === 0) {
    return <Badge tone="danger">{ko ? "오늘" : "Today"}</Badge>;
  }
  const date = new Date(scheduledAt as string);
  return <Badge>{date.toLocaleDateString(ko ? "ko-KR" : "en-US", { month: "short", day: "numeric" })}</Badge>;
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

export function ReviewQueuePage() {
  const { locale } = useLocale();
  const copy = useCopy();
  const queueQuery = useReviewQueueQuery();
  const skipMutation = useReviewQueueActionMutation("skip");
  const doneMutation = useReviewQueueActionMutation("done");
  const [sortMode, setSortMode] = useState<SortMode>("due");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const items = useMemo(() => sortItems(queueQuery.data?.items ?? [], sortMode), [queueQuery.data, sortMode]);
  const dueNow = items.filter((item) => (daysUntil(item.scheduledAt) ?? 0) <= 0);
  const week = weekLoad(items.map((item) => item.scheduledAt));
  const actionError = optionalErrorMessage(skipMutation.error ?? doneMutation.error, copy("요청을 처리하지 못했어요. 잠시 후 다시 시도하세요.", "We couldn't complete that request. Please try again."));

  async function act(item: ReviewQueueItemModel, action: "skip" | "done") {
    setStatus(null);
    setPendingId(item.id);
    try {
      await (action === "skip" ? skipMutation : doneMutation).mutateAsync(item.id);
      setStatus(
        action === "skip"
          ? copy(`“${item.questionTitle}”을(를) 나중으로 미뤘어요.`, `Moved “${item.questionTitle}” to later.`)
          : copy(`“${item.questionTitle}”을(를) 완료로 표시했어요.`, `Marked “${item.questionTitle}” as done.`),
      );
    } catch {
      // Rendered through actionError.
    } finally {
      setPendingId(null);
    }
  }

  if (queueQuery.isLoading) {
    return <PageSkeleton label={copy("복습 목록을 불러오는 중", "Loading reviews")} />;
  }

  if (queueQuery.isError) {
    return (
      <ErrorState
        actions={
          <Button onClick={() => void queueQuery.refetch()} variant="primary">
            {copy("다시 시도", "Try again")}
          </Button>
        }
        body={userFacingErrorMessage(queueQuery.error, copy("복습 목록을 불러오지 못했어요.", "We couldn't load your reviews."))}
        details={getErrorDetails(queueQuery.error)}
        size="page"
        title={copy("복습을 열 수 없어요", "Reviews are unavailable")}
      />
    );
  }

  const first = dueNow[0] ?? items[0] ?? null;

  return (
    <div className="ui-page review-page">
      <PageHeader
        actions={
          first ? (
            <ButtonLink icon="arrowRight" to={routeConfig.answerEditor.buildPath({ questionId: first.questionId })} variant="primary">
              {dueNow.length > 0 ? copy(`오늘 복습 시작 (${dueNow.length})`, `Start today's reviews (${dueNow.length})`) : copy("다음 복습 시작", "Start the next review")}
            </ButtonLink>
          ) : null
        }
        description={copy("약했던 답변을 간격을 두고 다시 답해서 굳히세요.", "Answer weak questions again, spaced out, until they stick.")}
        title={copy("지금 복습", "Due now")}
      />

      <ol aria-label={copy("이번 주 복습 일정", "This week's reviews")} className="review-week">
        {week.map((day) => (
          <li className={`review-week__day${day.isToday ? " review-week__day--today" : ""}`} key={day.date.toISOString()}>
            <span>{day.isToday ? copy("오늘", "Today") : day.date.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", { weekday: "short" })}</span>
            <strong>{day.count}</strong>
            <span className="review-week__bar" style={{ width: `${Math.min(100, day.count * 20)}%` }} />
          </li>
        ))}
      </ol>

      <div aria-live="polite" className="review-status">
        {status ? <Callout tone="success">{status}</Callout> : null}
        {actionError ? (
          <Callout title={copy("처리하지 못했어요", "Something went wrong")} tone="danger">
            {actionError}
          </Callout>
        ) : null}
      </div>

      <Card aria-labelledby="review-list-title">
        <CardHeader
          actions={
            <Segmented
              items={[
                { id: "due", label: copy("급한 순", "By due date") },
                { id: "priority", label: copy("우선순위", "By priority") },
              ]}
              label={copy("정렬", "Sort")}
              onChange={setSortMode}
              value={sortMode}
            />
          }
          meta={items.length > 0 ? <Badge tone="danger">{items.length}</Badge> : null}
          title={<span id="review-list-title">{copy("다시 답할 질문", "Questions to answer again")}</span>}
        />
        {items.length === 0 ? (
          <EmptyState
            actions={
              <ButtonLink to={routeConfig.practice.buildPath()}>{copy("질문 둘러보기", "Browse questions")}</ButtonLink>
            }
            body={copy("약했던 답변이 생기면 알맞은 때 여기에 다시 올라와요.", "Weak answers come back here when they're due.")}
            icon="check"
            title={copy("지금 복습할 질문이 없어요", "Nothing to review right now")}
          />
        ) : (
          items.map((item) => (
            <ListRow
              key={item.id}
              meta={[item.reasonTypeLabel, difficultyLabel(item.difficulty, locale)].filter(Boolean).join(" · ")}
              title={item.questionTitle}
              trailing={
                <>
                  <DueBadge locale={locale} scheduledAt={item.scheduledAt} />
                  <ButtonLink size="sm" to={routeConfig.answerEditor.buildPath({ questionId: item.questionId })}>
                    {copy("답하기", "Answer")}
                  </ButtonLink>
                  <Button disabled={pendingId === item.id} onClick={() => void act(item, "skip")} size="sm" variant="ghost">
                    {copy("나중에", "Later")}
                  </Button>
                  <Button disabled={pendingId === item.id} onClick={() => void act(item, "done")} size="sm" variant="ghost">
                    {copy("완료", "Done")}
                  </Button>
                </>
              }
            />
          ))
        )}
      </Card>
    </div>
  );
}
