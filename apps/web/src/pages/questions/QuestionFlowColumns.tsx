import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { PracticeQuestionItemModel } from "../../entities/practice/model";
import type { QuestionTreeNodeModel } from "../../entities/question-tree/model";
import { useLocale } from "../../shared/i18n";
import { Button, Icon, Skeleton } from "../../shared/ui/primitives";
import { toMastery, MASTERY_LABEL, type Mastery } from "./mastery";

export type FlowItem = {
  id: string;
  title: string;
  /** Known mastery of the question; null when the data has none (topics, list-only questions). */
  mastery: Mastery | null;
  /** Short mono figure on the right: a question count for topics, the best score for the current question. */
  figure?: string;
  /** The question on screen. */
  current?: boolean;
};

export type FlowColumn = {
  key: string;
  label: string;
  items: FlowItem[];
  selectedId: string | null;
  status: "ready" | "loading" | "error";
  onPick: (id: string) => void;
  onRetry?: () => void;
};

type TopicGroup = { label: string; items: PracticeQuestionItemModel[] };

export function groupByTopic(items: PracticeQuestionItemModel[]): TopicGroup[] {
  const byTopic = new Map<string, PracticeQuestionItemModel[]>();
  items.forEach((item) => byTopic.set(item.categoryLabel, [...(byTopic.get(item.categoryLabel) ?? []), item]));
  return [...byTopic.entries()].map(([label, groupItems]) => ({ label, items: groupItems }));
}

/** Direct follow-ups of a question, once each (a question can be linked under the same parent twice). */
export function followUpsOf(nodes: QuestionTreeNodeModel[], parentId: string) {
  const seen = new Set<string>();
  return nodes.filter((node) => {
    if (node.parentQuestionId !== parentId || seen.has(node.id)) {
      return false;
    }
    seen.add(node.id);
    return true;
  });
}

/** The questions from the tree's top down to `questionId`, or null when it is not in the tree. */
export function pathTo(nodes: QuestionTreeNodeModel[], questionId: string): QuestionTreeNodeModel[] | null {
  const byId = new Map<string, QuestionTreeNodeModel>();
  nodes.forEach((node) => {
    if (!byId.has(node.id)) {
      byId.set(node.id, node);
    }
  });
  const path: QuestionTreeNodeModel[] = [];
  let current = byId.get(questionId);
  while (current && path.length <= nodes.length) {
    path.unshift(current);
    current = current.parentQuestionId ? byId.get(current.parentQuestionId) : undefined;
  }
  return path.length > 0 ? path : null;
}

export function treeItem(node: QuestionTreeNodeModel): FlowItem {
  return { id: node.id, title: node.title, mastery: toMastery(node.status) };
}

function MasteryDot({ mastery }: { mastery: Mastery | null }) {
  const { t } = useLocale();
  if (!mastery) {
    return <span aria-hidden="true" className="question-flow__dot question-flow__dot--none" />;
  }
  return (
    <span className={`question-flow__dot question-flow__dot--${mastery}`}>
      <span className="ui-visually-hidden">{t(MASTERY_LABEL[mastery])}</span>
    </span>
  );
}

type QuestionFlowColumnsProps = {
  columns: FlowColumn[];
  /** The column phones show by default (they show one column at a time). */
  phoneColumn: number;
  /** Changes whenever the selection moves, so the phone view can follow it. */
  resetKey: string;
};

/**
 * Finder-style columns: each column is one depth, picking a row opens its follow-ups in the next
 * column. Each column is a listbox with one tab stop; arrow keys move within a column and between
 * columns, Enter or Space picks. Phones show one column with a back control.
 */
export function QuestionFlowColumns({ columns, phoneColumn, resetKey }: QuestionFlowColumnsProps) {
  const { t } = useLocale();
  const baseId = useId();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef(new Map<string, HTMLDivElement>());
  const [focusedByColumn, setFocusedByColumn] = useState<Record<string, string>>({});
  const [phoneOverride, setPhoneOverride] = useState<{ resetKey: string; index: number } | null>(null);
  const activePhoneColumn = Math.min(
    columns.length - 1,
    phoneOverride && phoneOverride.resetKey === resetKey ? phoneOverride.index : phoneColumn,
  );
  const columnSignature = useMemo(() => columns.map((column) => `${column.key}:${column.items.length}`).join("|"), [columns]);

  // Keep the deepest column in view when new follow-ups open.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) {
      scroller.scrollLeft = scroller.scrollWidth;
    }
  }, [columnSignature]);

  function tabStopOf(column: FlowColumn) {
    const focused = focusedByColumn[column.key];
    if (focused && column.items.some((item) => item.id === focused)) {
      return focused;
    }
    return column.selectedId && column.items.some((item) => item.id === column.selectedId) ? column.selectedId : column.items[0]?.id ?? null;
  }

  function focusOption(columnIndex: number, optionId: string | null) {
    const column = columns[columnIndex];
    if (!column || !optionId) {
      return;
    }
    setFocusedByColumn((current) => ({ ...current, [column.key]: optionId }));
    optionRefs.current.get(`${column.key}:${optionId}`)?.focus();
  }

  function pick(columnIndex: number, id: string) {
    const column = columns[columnIndex];
    column.onPick(id);
    // On phones, move on to the follow-ups the pick opens.
    setPhoneOverride({ resetKey, index: columnIndex + 1 });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>, columnIndex: number, itemIndex: number) {
    const column = columns[columnIndex];
    const items = column.items;
    let target: { column: number; id: string | null } | null = null;

    switch (event.key) {
      case "ArrowDown":
        target = { column: columnIndex, id: items[Math.min(items.length - 1, itemIndex + 1)]?.id ?? null };
        break;
      case "ArrowUp":
        target = { column: columnIndex, id: items[Math.max(0, itemIndex - 1)]?.id ?? null };
        break;
      case "Home":
        target = { column: columnIndex, id: items[0]?.id ?? null };
        break;
      case "End":
        target = { column: columnIndex, id: items[items.length - 1]?.id ?? null };
        break;
      case "ArrowRight":
      case "ArrowLeft": {
        const next = columnIndex + (event.key === "ArrowRight" ? 1 : -1);
        if (columns[next]?.status === "ready" && columns[next].items.length > 0) {
          target = { column: next, id: tabStopOf(columns[next]) };
          if (window.matchMedia?.("(max-width: 767px)").matches) {
            setPhoneOverride({ resetKey, index: next });
          }
        }
        break;
      }
      case "Enter":
      case " ":
        event.preventDefault();
        pick(columnIndex, items[itemIndex].id);
        return;
      default:
        return;
    }

    event.preventDefault();
    if (target) {
      focusOption(target.column, target.id);
    }
  }

  return (
    <section aria-label={t("questionWorkspace.flowLabel")} className="question-flow">
      <div className="question-flow__scroller" ref={scrollerRef}>
        {columns.map((column, columnIndex) => {
          const labelId = `${baseId}-col-${columnIndex}`;
          const tabStop = tabStopOf(column);
          return (
            <div
              className={["question-flow__column", columnIndex === activePhoneColumn ? "question-flow__column--phone-active" : null]
                .filter(Boolean)
                .join(" ")}
              data-column={columnIndex}
              key={column.key}
            >
              <div className="question-flow__head">
                {columnIndex > 0 ? (
                  <Button
                    className="question-flow__back"
                    onClick={() => setPhoneOverride({ resetKey, index: columnIndex - 1 })}
                    size="sm"
                    variant="ghost"
                  >
                    <Icon className="question-flow__back-icon" name="chevronRight" size={14} />
                    {columns[columnIndex - 1].label}
                  </Button>
                ) : null}
                <span className="question-flow__label" id={labelId}>
                  {column.label}
                </span>
              </div>
              {column.status === "loading" ? (
                <div aria-busy="true" aria-labelledby={labelId} className="question-flow__loading" role="status">
                  <span className="ui-visually-hidden">{t("questionWorkspace.flowLoading")}</span>
                  <Skeleton height="2.25rem" />
                  <Skeleton height="2.25rem" />
                  <Skeleton height="2.25rem" />
                </div>
              ) : column.status === "error" ? (
                <div className="question-flow__message">
                  <p>{t("questionWorkspace.flowError")}</p>
                  {column.onRetry ? (
                    <Button onClick={column.onRetry} size="sm">
                      {t("questionWorkspace.tryAgain")}
                    </Button>
                  ) : null}
                </div>
              ) : column.items.length === 0 ? (
                <p className="question-flow__message">{t("questionWorkspace.noMatches")}</p>
              ) : (
                <div aria-labelledby={labelId} className="question-flow__list" role="listbox">
                  {column.items.map((item, itemIndex) => {
                    const selected = item.id === column.selectedId;
                    return (
                      <div
                        aria-current={item.current ? "true" : undefined}
                        aria-selected={selected}
                        className="question-flow__row"
                        key={item.id}
                        onClick={() => pick(columnIndex, item.id)}
                        onFocus={() => setFocusedByColumn((current) => (current[column.key] === item.id ? current : { ...current, [column.key]: item.id }))}
                        onKeyDown={(event) => handleKeyDown(event, columnIndex, itemIndex)}
                        ref={(element) => {
                          const refKey = `${column.key}:${item.id}`;
                          if (element) {
                            optionRefs.current.set(refKey, element);
                          } else {
                            optionRefs.current.delete(refKey);
                          }
                        }}
                        role="option"
                        tabIndex={item.id === tabStop ? 0 : -1}
                      >
                        <MasteryDot mastery={item.mastery} />
                        <span className="question-flow__title">{item.title}</span>
                        {item.figure ? <span className="question-flow__figure">{item.figure}</span> : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
