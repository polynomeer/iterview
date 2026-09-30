import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePracticeQuestionsQuery } from "../../features/practice/api/usePracticeQuestionsQuery";
import { useLatestResumeQuery } from "../../features/resume/api/useLatestResumeQuery";
import { useReviewQueueQuery } from "../../features/review-queue/api/useReviewQueueQuery";
import { useLocale } from "../../shared/i18n";
import {
  buildNavigationItems,
  buildQuestionItems,
  buildResumeItems,
  buildReviewItems,
  matchesQuery,
  type CommandPaletteItem,
} from "./commandPaletteData";

const QUESTION_SEARCH_DELAY_MS = 200;

function useDebouncedValue(value: string, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debounced;
}

type CommandPaletteProps = {
  isOpen: boolean;
  onClose: () => void;
};


function normalizeSearchValue(value: string) {
  return value.toLowerCase().trim();
}

function groupPaletteItems(items: CommandPaletteItem[]) {
  return items.reduce<Record<string, CommandPaletteItem[]>>((groups, item) => {
    if (!groups[item.section]) {
      groups[item.section] = [];
    }

    groups[item.section].push(item);
    return groups;
  }, {});
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { t } = useLocale();
  const inputId = useId();
  const listboxId = `${inputId}-results`;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const normalizedQuery = normalizeSearchValue(query);
  const questionSearch = normalizeSearchValue(useDebouncedValue(query, QUESTION_SEARCH_DELAY_MS));
  const questionsQuery = usePracticeQuestionsQuery(
    { search: questionSearch },
    { enabled: isOpen && questionSearch.length > 0 },
  );
  const reviewQueueQuery = useReviewQueueQuery({ enabled: isOpen });
  const latestResumeQuery = useLatestResumeQuery();

  const filteredItems = useMemo(() => {
    // Due reviews and the active resume come before menus: they are what the user most likely needs next.
    const localItems = [
      ...buildReviewItems(reviewQueueQuery.data?.items ?? [], t),
      ...buildResumeItems(latestResumeQuery.data, t),
      ...buildNavigationItems(t),
    ].filter((item) => matchesQuery(item, normalizedQuery));
    const questionItems =
      normalizedQuery && questionSearch === normalizedQuery ? buildQuestionItems(questionsQuery.data?.items ?? [], t) : [];

    // With a query, matching questions lead.
    return normalizedQuery ? [...questionItems, ...localItems] : localItems;
  }, [latestResumeQuery.data, normalizedQuery, questionSearch, questionsQuery.data, reviewQueueQuery.data, t]);
  const isSearchingQuestions = normalizedQuery.length > 0 && (questionSearch !== normalizedQuery || questionsQuery.isFetching);

  const groupedItems = useMemo(() => groupPaletteItems(filteredItems), [filteredItems]);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setSelectedIndex(0);
      return;
    }

    previouslyFocusedElementRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const focusFrame = window.requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(focusFrame);
      previouslyFocusedElementRef.current?.focus();
      previouslyFocusedElementRef.current = null;
    };
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex((currentIndex) => {
      if (filteredItems.length === 0) {
        return 0;
      }

      return Math.min(currentIndex, filteredItems.length - 1);
    });
  }, [filteredItems]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const surface = surfaceRef.current;
        if (!surface) {
          return;
        }

        const focusableElements = getFocusableElements(surface);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (!firstElement || !lastElement) {
          return;
        }

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }

        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((currentIndex) => (currentIndex + 1) % Math.max(filteredItems.length, 1));
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((currentIndex) =>
          (currentIndex - 1 + Math.max(filteredItems.length, 1)) % Math.max(filteredItems.length, 1),
        );
        return;
      }

      if (event.key === "Enter") {
        const activeItem = filteredItems[selectedIndex];

        if (!activeItem) {
          return;
        }

        event.preventDefault();
        navigate(activeItem.to);
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [filteredItems, isOpen, navigate, onClose, selectedIndex]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-label={t("commandPalette.results")}
      aria-modal="true"
      className="command-palette"
      onClick={onClose}
      role="dialog"
    >
      <div
        ref={surfaceRef}
        className="command-palette__surface"
        onClick={(event) => event.stopPropagation()}
        role="document"
      >
        <div className="command-palette__search">
          <label className="command-palette__search-label" htmlFor={inputId}>
            {t("commandPalette.searchLabel")}
          </label>
          <div className="command-palette__search-row">
            <input
              ref={inputRef}
              aria-activedescendant={filteredItems[selectedIndex] ? `${inputId}-option-${filteredItems[selectedIndex].id}` : undefined}
              aria-label={t("commandPalette.searchLabel")}
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-expanded="true"
              className="command-palette__search-input"
              id={inputId}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("commandPalette.searchPlaceholder")}
              role="combobox"
              type="search"
              value={query}
            />
            <span aria-hidden="true" className="command-palette__shortcut">
              Esc
            </span>
          </div>
          <p aria-live="polite" className="command-palette__search-meta">
            {isSearchingQuestions
              ? t("commandPalette.searchingQuestions")
              : questionsQuery.isError && normalizedQuery
                ? t("commandPalette.questionSearchFailed")
                : ""}
          </p>
        </div>

        {filteredItems.length > 0 ? (
          <div aria-label={t("commandPalette.results")} className="command-palette__results" id={listboxId} role="listbox">
            {Object.entries(groupedItems).map(([section, items]) => (
              <section aria-label={section} className="command-palette__group" key={section} role="group">
                <header className="command-palette__group-header">
                  <span>{section}</span>
                  <span>{items.length}</span>
                </header>
                <div className="command-palette__group-list">
                  {items.map((item) => {
                    const itemIndex = filteredItems.findIndex((candidate) => candidate.id === item.id);
                    const isSelected = itemIndex === selectedIndex;

                    return (
                      <button
                        aria-selected={isSelected}
                        className={`command-palette__item${isSelected ? " command-palette__item--selected" : ""}`}
                        id={`${inputId}-option-${item.id}`}
                        key={item.id}
                        onClick={() => {
                          navigate(item.to);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                        role="option"
                        type="button"
                      >
                        <span className="command-palette__item-copy">
                          <strong>{item.title}</strong>
                          <span>{item.subtitle}</span>
                        </span>
                        <span className="command-palette__item-meta">{item.section}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="command-palette__empty">
            <strong>{t("commandPalette.noMatchTitle")}</strong>
            <span>{t("commandPalette.noMatchBody")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
