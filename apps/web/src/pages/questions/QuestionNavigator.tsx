import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { PracticeQuestionItemModel } from "../../entities/practice/model";
import { usePracticeQuestionsQuery } from "../../features/practice/api/usePracticeQuestionsQuery";
import { userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { difficultyLabel } from "../../shared/lib/labels";
import { Button, EmptyState, ErrorState, Field, Icon, Input, Select, Skeleton } from "../../shared/ui/primitives";

const SEARCH_DELAY_MS = 250;

type QuestionNavigatorProps = {
  selectedQuestionId?: string;
  /** Receives the loaded items, e.g. so the index page can suggest a first question. */
  onItems?: (items: PracticeQuestionItemModel[]) => void;
};

/** Search, filter, and pick questions. Filters live in the URL so they survive navigation. */
export function QuestionNavigator({ selectedQuestionId, onItems }: QuestionNavigatorProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const difficulty = searchParams.get("difficulty") ?? "";
  const [draft, setDraft] = useState(search);
  const query = usePracticeQuestionsQuery({
    search: search || undefined,
    category: category || undefined,
    difficulty: difficulty || undefined,
  });
  const items = useMemo(() => query.data?.items ?? [], [query.data]);
  const filterQuery = searchParams.toString() ? `?${searchParams.toString()}` : "";

  useEffect(() => setDraft(search), [search]);

  useEffect(() => {
    onItems?.(items);
  }, [items, onItems]);

  function updateParam(name: string, value: string) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) {
          next.set(name, value);
        } else {
          next.delete(name);
        }
        return next;
      },
      { replace: true },
    );
  }

  useEffect(() => {
    if (draft.trim() === search) {
      return undefined;
    }
    const timeoutId = window.setTimeout(() => updateParam("search", draft.trim()), SEARCH_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, [draft, search]);

  const groups = useMemo(() => {
    const byCategory = new Map<string, PracticeQuestionItemModel[]>();
    items.forEach((item) => {
      byCategory.set(item.categoryLabel, [...(byCategory.get(item.categoryLabel) ?? []), item]);
    });
    return [...byCategory.entries()];
  }, [items]);

  const hasFilters = Boolean(search || category || difficulty);

  return (
    <nav aria-label={isKorean ? "질문 목록" : "Question list"} className="question-nav">
      <div className="question-nav__controls">
        <Field label={isKorean ? "질문 검색" : "Search questions"}>
          {(control) => (
            <Input
              {...control}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={isKorean ? "예: 트랜잭션, Kafka" : "e.g. transaction, Kafka"}
              type="search"
              value={draft}
            />
          )}
        </Field>
        <div className="question-nav__filters">
          <Field label={isKorean ? "분류" : "Category"}>
            {(control) => (
              <Select {...control} onChange={(event) => updateParam("category", event.target.value)} value={category}>
                <option value="">{isKorean ? "전체" : "All"}</option>
                {(query.data?.filters.categories ?? []).map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={isKorean ? "난이도" : "Difficulty"}>
            {(control) => (
              <Select {...control} onChange={(event) => updateParam("difficulty", event.target.value)} value={difficulty}>
                <option value="">{isKorean ? "전체" : "All"}</option>
                {["EASY", "MEDIUM", "HARD"].map((code) => (
                  <option key={code} value={code}>
                    {difficultyLabel(code, locale)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      </div>

      {query.isLoading ? (
        <div aria-busy="true" className="question-nav__loading">
          {[0, 1, 2, 3, 4].map((row) => (
            <Skeleton height="2.25rem" key={row} />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState
          actions={<Button onClick={() => void query.refetch()}>{isKorean ? "다시 시도" : "Try again"}</Button>}
          body={userFacingErrorMessage(query.error, isKorean ? "질문 목록을 불러오지 못했어요." : "We couldn't load questions.")}
          title={isKorean ? "질문을 불러올 수 없어요" : "Questions are unavailable"}
        />
      ) : items.length === 0 ? (
        <EmptyState
          actions={
            hasFilters ? (
              <Button onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}>
                {isKorean ? "조건 초기화" : "Clear filters"}
              </Button>
            ) : null
          }
          icon="search"
          title={isKorean ? "조건에 맞는 질문이 없어요" : "No questions match"}
        />
      ) : (
        <div className="question-nav__groups">
          <p aria-live="polite" className="question-nav__count">
            {isKorean ? `질문 ${items.length}개` : `${items.length} questions`}
          </p>
          {groups.map(([groupLabel, groupItems]) => (
            <section aria-label={groupLabel} className="question-nav__group" key={groupLabel}>
              <h2 className="question-nav__group-title">
                {groupLabel}
                <span>{groupItems.length}</span>
              </h2>
              <ul className="question-nav__list">
                {groupItems.map((item) => {
                  const isCurrent = item.id === selectedQuestionId;
                  const difficultyText = difficultyLabel(item.difficulty, locale);
                  return (
                    <li key={item.id}>
                      <Link
                        aria-current={isCurrent ? "page" : undefined}
                        className="question-nav__item"
                        to={`${routeConfig.questionDetail.buildPath({ questionId: item.id })}${filterQuery}`}
                      >
                        <span className="question-nav__item-title">{item.title}</span>
                        {difficultyText ? <span className="question-nav__item-meta">{difficultyText}</span> : null}
                        {isCurrent ? <Icon className="question-nav__item-mark" name="chevronRight" size={14} /> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </nav>
  );
}
