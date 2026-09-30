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
  const { locale, t } = useLocale();
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
    <nav aria-label={t("questionWorkspace.navLabel")} className="question-nav">
      <div className="question-nav__controls">
        <Field label={t("questionWorkspace.searchLabel")}>
          {(control) => (
            <Input
              {...control}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={t("questionWorkspace.searchPlaceholder")}
              type="search"
              value={draft}
            />
          )}
        </Field>
        <div className="question-nav__filters">
          <Field label={t("questionWorkspace.category")}>
            {(control) => (
              <Select {...control} onChange={(event) => updateParam("category", event.target.value)} value={category}>
                <option value="">{t("questionWorkspace.all")}</option>
                {(query.data?.filters.categories ?? []).map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={t("questionWorkspace.difficulty")}>
            {(control) => (
              <Select {...control} onChange={(event) => updateParam("difficulty", event.target.value)} value={difficulty}>
                <option value="">{t("questionWorkspace.all")}</option>
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
          actions={<Button onClick={() => void query.refetch()}>{t("questionWorkspace.tryAgain")}</Button>}
          body={userFacingErrorMessage(query.error, t("questionWorkspace.listErrorBody"))}
          title={t("questionWorkspace.listErrorTitle")}
        />
      ) : items.length === 0 ? (
        <EmptyState
          actions={
            hasFilters ? (
              <Button onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}>
                {t("questionWorkspace.clearFilters")}
              </Button>
            ) : null
          }
          icon="search"
          title={t("questionWorkspace.noMatches")}
        />
      ) : (
        <div className="question-nav__groups">
          <p aria-live="polite" className="question-nav__count">
            {t("questionWorkspace.questionCount", { count: items.length })}
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
