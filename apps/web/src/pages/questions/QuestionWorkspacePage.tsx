import { useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { PracticeQuestionItemModel } from "../../entities/practice/model";
import {
  mapLearningMaterialsToModel,
  mapReferenceAnswersToModel,
  type QuestionDetailModel,
} from "../../entities/question/model";
import type { QuestionTreeNodeModel } from "../../entities/question-tree/model";
import { usePracticeQuestionsQuery } from "../../features/practice/api/usePracticeQuestionsQuery";
import { useQuestionAnswerHistoryQuery } from "../../features/question/api/useQuestionAnswerHistoryQuery";
import { useQuestionDetailQuery } from "../../features/question/api/useQuestionDetailQuery";
import { useQuestionLearningMaterialsQuery } from "../../features/question/api/useQuestionLearningMaterialsQuery";
import { useQuestionReferenceAnswersQuery } from "../../features/question/api/useQuestionReferenceAnswersQuery";
import { useQuestionTreeQuery } from "../../features/question/api/useQuestionTreeQuery";
import { useRecommendedFollowupsQuery } from "../../features/question/api/useRecommendedFollowupsQuery";
import { ApiClientError, getErrorDetails, userFacingErrorMessage } from "../../shared/api/errors";
import { useAuth } from "../../shared/auth/useAuth";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { difficultyLabel, scoreTone } from "../../shared/lib/labels";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  ErrorState,
  Icon,
  PageSkeleton,
  Segmented,
  Skeleton,
  Stat,
  Tabs,
} from "../../shared/ui/primitives";
import { MASTERY_LABEL, MASTERY_TONE, toMastery } from "./mastery";
import { LearningMaterialDialog, ReferenceAnswerDialog } from "./QuestionAuthoringDialogs";
import { followUpsOf, groupByTopic, pathTo, QuestionFlowColumns, treeItem, type FlowColumn } from "./QuestionFlowColumns";
import { BookmarkButton, NoteSection } from "./QuestionLibraryControls";
import { QuestionNavigator } from "./QuestionNavigator";
import "./questions.css";

type WorkspaceView = "flow" | "list";
type ContentTab = "materials" | "answers";

/** Where the column browser started: kept in history state so follow-ups keep their path. */
type FlowState = { flowRoot?: unknown } | null;

function useWorkspaceView(forceFlow = false): [WorkspaceView, (view: WorkspaceView) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const view: WorkspaceView = !forceFlow && searchParams.get("view") === "list" ? "list" : "flow";

  function setView(next: WorkspaceView) {
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current);
        if (next === "list") {
          params.set("view", "list");
        } else {
          params.delete("view");
        }
        return params;
      },
      { replace: true },
    );
  }

  return [view, setView];
}

function TopBar({ trail, view, onViewChange }: { trail: string[]; view: WorkspaceView; onViewChange: (view: WorkspaceView) => void }) {
  const { t } = useLocale();
  const { search } = useLocation();
  const listSearch = useMemo(() => {
    const params = new URLSearchParams(search);
    params.delete("view");
    return params.toString() ? `?${params.toString()}` : "";
  }, [search]);

  return (
    <header className="question-topbar">
      <nav aria-label={t("questionWorkspace.breadcrumbLabel")} className="question-topbar__trail">
        <ol>
          <li>
            {trail.length > 0 ? <Link to={`${routeConfig.practice.buildPath()}${listSearch}`}>{t("questionWorkspace.indexTitle")}</Link> : <span aria-current="page">{t("questionWorkspace.indexTitle")}</span>}
          </li>
          {trail.map((crumb, index) => (
            <li aria-current={index === trail.length - 1 ? "page" : undefined} key={`${index}-${crumb}`}>
              {crumb}
            </li>
          ))}
        </ol>
      </nav>
      <Segmented
        items={[
          { id: "flow", label: t("questionWorkspace.viewFlow") },
          { id: "list", label: t("questionWorkspace.viewList") },
        ]}
        label={t("questionWorkspace.viewLabel")}
        onChange={onViewChange}
        value={view}
      />
    </header>
  );
}

type FlowModel = {
  columns: FlowColumn[];
  phoneColumn: number;
  /** Column depth of the current question (1 = picked from a topic), or null when it is not in the columns. */
  currentDepth: number | null;
  /** Topic plus the questions above the current one, for the breadcrumb. */
  trail: string[];
  firstQuestion: PracticeQuestionItemModel | null;
};

/** Builds the columns: topics, the topic's questions, then one column of follow-ups per depth. */
function useFlowModel(questionId: string | undefined, question: QuestionDetailModel | null): FlowModel {
  const { t } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const practiceQuery = usePracticeQuestionsQuery({
    search: searchParams.get("search") || undefined,
    category: searchParams.get("category") || undefined,
    difficulty: searchParams.get("difficulty") || undefined,
  });
  const stateRoot = (location.state as FlowState)?.flowRoot;
  const requestedRoot = typeof stateRoot === "string" && stateRoot ? stateRoot : questionId;
  const rootTreeQuery = useQuestionTreeQuery(requestedRoot);
  const ownTreeQuery = useQuestionTreeQuery(questionId);
  const [browse, setBrowse] = useState<{ questionId: string | undefined; topic: string } | null>(null);
  const search = location.search;

  return useMemo(() => {
    const items = practiceQuery.data?.items ?? [];
    const topics = groupByTopic(items);
    const rootPath = questionId && rootTreeQuery.data ? pathTo(rootTreeQuery.data.nodes, questionId) : null;
    // A stale or missing start falls back to the current question as the top of its own flow.
    const usingRootTree = Boolean(rootPath && requestedRoot !== questionId);
    const tree = usingRootTree ? rootTreeQuery : ownTreeQuery;
    const nodes: QuestionTreeNodeModel[] = tree.data?.nodes ?? [];
    const path = usingRootTree ? rootPath! : questionId && ownTreeQuery.data ? pathTo(ownTreeQuery.data.nodes, questionId) : null;
    const flowRootId = usingRootTree ? requestedRoot! : questionId;
    const rootListItem = items.find((item) => item.id === flowRootId) ?? null;
    const rootTopic = rootListItem?.categoryLabel ?? (flowRootId === questionId ? question?.category : undefined) ?? null;
    const pickedTopic = browse && browse.questionId === questionId ? browse.topic : null;
    const selectedTopic = pickedTopic ?? rootTopic ?? topics[0]?.label ?? null;
    const showingRoot = Boolean(flowRootId) && selectedTopic === rootTopic;
    const listStatus: FlowColumn["status"] = practiceQuery.isLoading ? "loading" : practiceQuery.isError ? "error" : "ready";
    const bestScore = question?.userProgressSummary?.bestScoreLabel;

    const open = (id: string, root: string) =>
      navigate(`${routeConfig.questionDetail.buildPath({ questionId: id })}${search}`, { state: { flowRoot: root } });

    const columns: FlowColumn[] = [
      {
        key: "topics",
        label: t("questionWorkspace.flowTopicColumn"),
        items: topics.map((topic) => ({ id: topic.label, title: topic.label, mastery: null, figure: String(topic.items.length) })),
        selectedId: selectedTopic,
        status: listStatus,
        onPick: (topic) => setBrowse({ questionId, topic }),
        onRetry: () => void practiceQuery.refetch(),
      },
    ];

    const topicItems = topics.find((topic) => topic.label === selectedTopic)?.items ?? [];
    const rootNode = path?.[0] ?? null;
    const questionItems = topicItems.map((item) => ({
      id: item.id,
      title: item.title,
      mastery: item.id === rootNode?.id ? toMastery(rootNode.status) : null,
      figure: item.id === questionId && bestScore ? bestScore : undefined,
      current: item.id === questionId,
    }));
    // The flow's top question may be outside the loaded list (a follow-up opened directly, or filtered out).
    if (showingRoot && rootNode && !questionItems.some((item) => item.id === rootNode.id)) {
      questionItems.unshift({ ...treeItem(rootNode), figure: rootNode.id === questionId && bestScore ? bestScore : undefined, current: rootNode.id === questionId });
    }
    if (selectedTopic || listStatus !== "ready") {
      columns.push({
        key: `topic:${selectedTopic ?? ""}`,
        label: t("questionWorkspace.flowDepthColumn", { depth: 1 }),
        items: questionItems,
        selectedId: showingRoot ? flowRootId ?? null : null,
        status: listStatus,
        onPick: (id) => open(id, id),
        onRetry: () => void practiceQuery.refetch(),
      });
    }

    let currentDepth: number | null = null;
    if (showingRoot && flowRootId) {
      if (tree.isLoading) {
        columns.push({ key: "followups:loading", label: t("questionWorkspace.flowDepthColumn", { depth: 2 }), items: [], selectedId: null, status: "loading", onPick: () => undefined });
      } else if (tree.isError) {
        columns.push({
          key: "followups:error",
          label: t("questionWorkspace.flowDepthColumn", { depth: 2 }),
          items: [],
          selectedId: null,
          status: "error",
          onPick: () => undefined,
          onRetry: () => void tree.refetch(),
        });
      } else if (path) {
        currentDepth = path.length;
        path.forEach((node, index) => {
          const children = followUpsOf(nodes, node.id);
          if (children.length === 0) {
            return;
          }
          const next = path[index + 1] ?? null;
          columns.push({
            key: `followups:${node.id}`,
            label: t("questionWorkspace.flowDepthColumn", { depth: index + 2 }),
            items: children.map((child) => ({
              ...treeItem(child),
              figure: child.id === questionId && bestScore ? bestScore : undefined,
              current: child.id === questionId,
            })),
            selectedId: next?.id ?? null,
            status: "ready",
            onPick: (id) => open(id, flowRootId),
          });
        });
      }
    }

    // Phones show the current question's follow-ups when it has some, else the column it sits in.
    const phoneColumn = currentDepth === null ? Math.min(columns.length - 1, pickedTopic ? 1 : selectedTopic ? 1 : 0) : Math.min(columns.length - 1, currentDepth + 1);
    const trail = [
      ...(rootTopic ? [rootTopic] : question ? [question.category] : []),
      ...(path ?? []).slice(0, -1).map((node) => node.title),
    ];

    return { columns, phoneColumn, currentDepth, trail, firstQuestion: topicItems[0] ?? items[0] ?? null };
  }, [practiceQuery, rootTreeQuery, ownTreeQuery, questionId, question, requestedRoot, browse, t, navigate, search]);
}

function MasteryBadge({ status, score }: { status: string | null | undefined; score?: string | null }) {
  const { t } = useLocale();
  const mastery = toMastery(status);
  const label = t(MASTERY_LABEL[mastery]);
  return (
    <Badge dot tone={MASTERY_TONE[mastery]}>
      {score && mastery !== "unanswered" ? t("questionWorkspace.masteryWithScore", { label, score }) : label}
    </Badge>
  );
}

/** /questions — the column browser with nothing opened yet. */
export function QuestionsIndexPage() {
  const { t } = useLocale();
  const { search } = useLocation();
  const [view, setView] = useWorkspaceView();
  const flow = useFlowModel(undefined, null);
  const first = flow.firstQuestion;
  const firstQuestionAction = first ? (
    <ButtonLink state={{ flowRoot: first.id }} to={`${routeConfig.questionDetail.buildPath({ questionId: first.id })}${search}`} variant="primary">
      {t("questionWorkspace.openFirstQuestion")}
    </ButtonLink>
  ) : null;

  return (
    <div className="ui-page question-page question-page--workspace">
      <TopBar onViewChange={setView} trail={[]} view={view} />
      {view === "flow" ? (
        <>
          <QuestionFlowColumns columns={flow.columns} phoneColumn={flow.phoneColumn} resetKey="index" />
          <Card className="question-index__placeholder">
            <EmptyState actions={firstQuestionAction} body={first ? first.title : undefined} icon="questions" title={t("questionWorkspace.chooseQuestion")} />
          </Card>
        </>
      ) : (
        <div className="question-index">
          <QuestionNavigator />
          <Card className="question-index__placeholder">
            <EmptyState actions={firstQuestionAction} body={first ? first.title : undefined} icon="questions" title={t("questionWorkspace.chooseQuestion")} />
          </Card>
        </div>
      )}
    </div>
  );
}

function FollowUps({ questionId }: { questionId: string }) {
  const { t } = useLocale();
  const location = useLocation();
  const treeQuery = useQuestionTreeQuery(questionId);
  const followupsQuery = useRecommendedFollowupsQuery(questionId);
  const nodes = treeQuery.data?.nodes ?? [];
  const directChildren = followUpsOf(nodes, questionId);
  const recommended = (followupsQuery.data ?? []).filter(
    (item) => item.questionId !== null && item.questionId !== undefined && !directChildren.some((child) => child.id === String(item.questionId)),
  );
  const nextItems = [
    ...directChildren.map((node) => ({ id: node.id, title: node.title, status: node.status })),
    ...recommended.map((item) => ({ id: String(item.questionId), title: item.title ?? "", status: item.nodeStatus ?? null })),
  ];
  const flowRoot = (location.state as FlowState)?.flowRoot;

  return (
    <section aria-labelledby="question-followups-title" className="question-section">
      <h2 className="question-section__label" id="question-followups-title">
        {t("questionWorkspace.nextFollowUps")}
      </h2>
      {treeQuery.isLoading || followupsQuery.isLoading ? (
        <div className="question-followups__loading">
          <Skeleton height="3.25rem" />
          <Skeleton height="3.25rem" />
        </div>
      ) : nextItems.length === 0 ? (
        <Card>
          <EmptyState body={t("questionWorkspace.noFollowUpsBody")} title={t("questionWorkspace.noFollowUpsTitle")} />
        </Card>
      ) : (
        <ul className="question-followups__list">
          {nextItems.map((item) => {
            const mastery = toMastery(item.status);
            return (
              <li key={item.id}>
                <Link
                  className="question-followups__item"
                  state={{ flowRoot: typeof flowRoot === "string" ? flowRoot : questionId }}
                  to={`${routeConfig.questionDetail.buildPath({ questionId: item.id })}${location.search}`}
                >
                  <span aria-hidden="true" className={`question-flow__dot question-flow__dot--${mastery}`} />
                  <strong className="question-followups__title">{item.title}</strong>
                  <span className={`question-followups__status question-followups__status--${mastery}`}>{t(MASTERY_LABEL[mastery])}</span>
                  <Icon name="arrowRight" size={16} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ScoreBars({ scores }: { scores: number[] }) {
  const { t } = useLocale();
  if (scores.length === 0) {
    return null;
  }
  return (
    <div aria-label={t("questionWorkspace.scoreChart", { scores: scores.join(", ") })} className="question-record__bars" role="img">
      {scores.map((score, index) => {
        const clamped = Math.max(0, Math.min(100, score));
        const tone = scoreTone(score);
        return (
          <span aria-hidden="true" className="question-record__bar" key={`${index}-${score}`}>
            <span className={`question-record__bar-score question-record__bar-score--${tone}`}>{score}</span>
            <span
              className={`question-record__bar-fill question-record__bar-fill--${tone}${index === scores.length - 1 ? " question-record__bar-fill--latest" : ""}`}
              style={{ height: `${Math.max(6, clamped)}%` }}
            />
          </span>
        );
      })}
    </div>
  );
}

function RecordSection({ question, questionId }: { question: QuestionDetailModel; questionId: string }) {
  const { t } = useLocale();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const historyQuery = useQuestionAnswerHistoryQuery(questionId);
  const progress = question.userProgressSummary;
  const unauthorized = !isAuthenticated || (historyQuery.error instanceof ApiClientError && historyQuery.error.status === 401);
  const items = historyQuery.data?.items ?? [];
  // History arrives newest first; the chart reads left to right in time.
  const chronological = [...items].reverse();
  const scores = chronological.map((item) => item.totalScore).filter((score): score is number => score !== null && score !== undefined);

  let body;
  if (unauthorized) {
    body = (
      <EmptyState
        actions={
          <ButtonLink size="sm" state={{ redirectTo: `${location.pathname}${location.search}` }} to={routeConfig.login.buildPath()} variant="secondary">
            {t("questionWorkspace.logIn")}
          </ButtonLink>
        }
        body={t("questionWorkspace.recordLoginBody")}
        icon="profile"
        title={t("questionWorkspace.recordLoginTitle")}
      />
    );
  } else if (historyQuery.isLoading) {
    body = <Skeleton height="6rem" />;
  } else if (historyQuery.isError) {
    body = (
      <ErrorState
        actions={<Button onClick={() => void historyQuery.refetch()} size="sm">{t("questionWorkspace.tryAgain")}</Button>}
        body={userFacingErrorMessage(historyQuery.error, t("questionWorkspace.historyErrorBody"))}
        title={t("questionWorkspace.historyErrorTitle")}
      />
    );
  } else if (items.length === 0) {
    body = <EmptyState body={t("questionWorkspace.noAnswersBody")} title={t("questionWorkspace.noAnswersTitle")} />;
  } else {
    body = (
      <>
        <ScoreBars scores={scores} />
        {chronological.length > 1 ? (
          <p className="question-record__range">
            {t("questionWorkspace.recordRange", { from: chronological[0].submittedAtLabel, to: chronological[chronological.length - 1].submittedAtLabel })}
          </p>
        ) : null}
        <ul className="question-record__attempts">
          {items.map((item) => (
            <li key={item.answerAttemptId}>
              <Link className="question-record__attempt" to={routeConfig.resultAnalysis.buildPath({ answerAttemptId: item.answerAttemptId })}>
                <span className="question-record__attempt-copy">
                  <span>{item.submittedAtLabel}</span>
                  {item.evaluationResultLabel ? <span className="question-record__attempt-meta">{item.evaluationResultLabel}</span> : null}
                </span>
                {item.totalScore !== null ? (
                  <Badge tone={scoreTone(item.totalScore)}>{t("questionWorkspace.scorePoints", { score: item.totalScore })}</Badge>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <section aria-labelledby="question-record-title" className="question-side__section">
      <h2 className="question-side__title" id="question-record-title">
        {t("questionWorkspace.myRecord")}
      </h2>
      {!unauthorized && progress ? (
        <div className="question-record__stats">
          <Stat label={t("questionWorkspace.bestScore")} tone={scoreTone(Number.parseFloat(progress.bestScoreLabel))} value={progress.bestScoreLabel} />
          <Stat label={t("questionWorkspace.attempts")} value={progress.attemptsCount} />
        </div>
      ) : null}
      {!unauthorized && progress?.nextReviewLabel ? (
        <p className="question-record__note">
          <Icon name="review" size={16} />
          {t("questionWorkspace.nextReview", { date: progress.nextReviewLabel })}
        </p>
      ) : null}
      {body}
    </section>
  );
}

function MaterialsTab({ materials, onAdd, canAdd }: { materials: QuestionDetailModel["learningMaterials"]; onAdd: () => void; canAdd: boolean }) {
  const { t } = useLocale();

  return (
    <div className="question-side__stack">
      {materials.length === 0 ? (
        <EmptyState title={t("questionWorkspace.noMaterials")} />
      ) : (
        materials.map((material) => (
          <article className="question-material" key={material.id}>
            <div className="question-material__head">
              <strong>{material.labelOverride || material.title}</strong>
              {material.isOfficial ? <Badge tone="accent">{t("questionWorkspace.official")}</Badge> : null}
            </div>
            <p className="question-material__meta">
              {[material.resourceTypeLabel, material.sourceName, material.estimatedMinutes ? t("questionWorkspace.minutes", { minutes: material.estimatedMinutes }) : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {material.description ? <p className="question-material__body">{material.description}</p> : null}
            {material.contentText ? (
              <details className="question-material__content">
                <summary>{t("questionWorkspace.showContent")}</summary>
                <p>{material.contentText}</p>
              </details>
            ) : null}
            {material.url ? (
              <a className="question-link" href={material.url} rel="noreferrer" target="_blank">
                {t("questionWorkspace.openLink")}
              </a>
            ) : null}
          </article>
        ))
      )}
      {canAdd ? (
        <Button icon="plus" onClick={onAdd} size="sm">
          {t("questionWorkspace.addMaterial")}
        </Button>
      ) : null}
    </div>
  );
}

function AnswersTab({ answers, onAdd, canAdd }: { answers: QuestionDetailModel["referenceAnswers"]; onAdd: () => void; canAdd: boolean }) {
  const { t } = useLocale();

  return (
    <div className="question-side__stack">
      {answers.length === 0 ? (
        <EmptyState title={t("questionWorkspace.noReferenceAnswers")} />
      ) : (
        answers.map((answer, index) => (
          <details className="question-answer" key={answer.id} open={index === 0}>
            <summary>
              <strong>{answer.title}</strong>
              {answer.isOfficial ? <Badge tone="accent">{t("questionWorkspace.official")}</Badge> : null}
              {answer.isUserGenerated ? <Badge>{t("questionWorkspace.mine")}</Badge> : null}
            </summary>
            <p className="question-answer__text">{answer.answerText}</p>
          </details>
        ))
      )}
      {canAdd ? (
        <Button icon="plus" onClick={onAdd} size="sm">
          {t("questionWorkspace.addReferenceAnswer")}
        </Button>
      ) : null}
    </div>
  );
}

function mergeById<T extends { id: string }>(primary: T[], fallback: T[]) {
  return [...new Map([...primary, ...fallback].map((item) => [item.id, item])).values()];
}

/**
 * /questions/:id (and the legacy /questions/:id/tree) — the column browser on top, the question
 * below, and the record, note, and study material on the side.
 */
export function QuestionWorkspacePage({ defaultTreeOpen = false }: { defaultTreeOpen?: boolean }) {
  const { questionId = "" } = useParams<{ questionId: string }>();
  const { locale, t } = useLocale();
  const { isAuthenticated } = useAuth();
  const [view, setView] = useWorkspaceView(defaultTreeOpen);
  const detailQuery = useQuestionDetailQuery(questionId);
  const question = detailQuery.data ?? null;
  const flow = useFlowModel(questionId, question);
  const ownTreeQuery = useQuestionTreeQuery(questionId);
  const referenceAnswersQuery = useQuestionReferenceAnswersQuery(questionId, Boolean(question) && question?.referenceAnswers.length === 0);
  const learningMaterialsQuery = useQuestionLearningMaterialsQuery(questionId, Boolean(question) && question?.learningMaterials.length === 0);
  const [tab, setTab] = useState<ContentTab>("materials");
  const [dialog, setDialog] = useState<"material" | "answer" | null>(null);
  const contentRef = useRef<HTMLElement>(null);
  const referenceAnswers = useMemo(
    () => mergeById(question?.referenceAnswers ?? [], mapReferenceAnswersToModel(referenceAnswersQuery.data)),
    [question, referenceAnswersQuery.data],
  );
  const learningMaterials = useMemo(
    () => mergeById(question?.learningMaterials ?? [], mapLearningMaterialsToModel(learningMaterialsQuery.data)),
    [question, learningMaterialsQuery.data],
  );
  const ownStatus = ownTreeQuery.data?.nodes.find((node) => node.id === questionId)?.status ?? null;

  function openReferenceAnswers() {
    setTab("answers");
    contentRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    contentRef.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus();
  }

  let center;
  if (detailQuery.isLoading) {
    center = <PageSkeleton label={t("questionWorkspace.loadingQuestion")} />;
  } else if (detailQuery.isError || !question) {
    const notFound = !detailQuery.isError || (detailQuery.error instanceof ApiClientError && detailQuery.error.status === 404);
    center = (
      <ErrorState
        actions={
          notFound ? (
            <ButtonLink to={routeConfig.practice.buildPath()} variant="primary">
              {t("questionWorkspace.backToQuestions")}
            </ButtonLink>
          ) : (
            <Button onClick={() => void detailQuery.refetch()} variant="primary">
              {t("questionWorkspace.tryAgain")}
            </Button>
          )
        }
        body={notFound ? t("questionWorkspace.notFoundBody") : userFacingErrorMessage(detailQuery.error, t("questionWorkspace.loadErrorBody"))}
        details={getErrorDetails(detailQuery.error)}
        icon={notFound ? "search" : undefined}
        size="page"
        title={notFound ? t("questionWorkspace.notFoundTitle") : t("questionWorkspace.unavailableTitle")}
      />
    );
  } else {
    const difficulty = difficultyLabel(question.difficulty, locale);
    const companies = question.companies.slice(0, 2);
    const bestScore = isAuthenticated ? question.userProgressSummary?.bestScoreLabel ?? null : null;
    center = (
      <>
        <div className="question-main__meta">
          <MasteryBadge score={bestScore} status={ownStatus} />
          {companies.length > 0 ? <Badge>{t("questionWorkspace.askedAt", { companies: companies.join(" · ") })}</Badge> : null}
          {view === "flow" && flow.currentDepth !== null ? (
            <span className="question-main__depth">{t("questionWorkspace.depthBadge", { depth: flow.currentDepth })}</span>
          ) : null}
          <span className="question-main__topic">{[question.category, difficulty].filter(Boolean).join(" · ")}</span>
        </div>
        <h1 className="question-main__title">{question.title}</h1>
        <div className="question-main__actions">
          <ButtonLink
            icon="arrowRight"
            size="lg"
            state={flow.currentDepth !== null ? { depth: flow.currentDepth } : undefined}
            to={routeConfig.answerEditor.buildPath({ questionId })}
            variant="primary"
          >
            {t("questionWorkspace.answer")}
          </ButtonLink>
          <Button onClick={openReferenceAnswers} size="lg">
            {t("questionWorkspace.seeReferenceAnswers")}
          </Button>
          {isAuthenticated ? <BookmarkButton questionId={questionId} /> : null}
        </div>
        {question.body && question.body !== question.title ? (
          <section aria-labelledby="question-intent-title" className="question-section question-section--ruled">
            <h2 className="question-section__label" id="question-intent-title">
              {t("questionWorkspace.interviewerIntent")}
            </h2>
            <p className="question-main__body">{question.body}</p>
            {question.tags.length > 0 ? (
              <div className="question-main__tags">
                {question.tags.map((tag) => (
                  <Badge key={tag}>#{tag}</Badge>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}
        <FollowUps questionId={questionId} />
      </>
    );
  }

  return (
    <div className="ui-page question-page question-page--workspace">
      <TopBar onViewChange={setView} trail={question ? [...flow.trail, question.title] : flow.trail} view={view} />
      {view === "flow" ? <QuestionFlowColumns columns={flow.columns} phoneColumn={flow.phoneColumn} resetKey={questionId} /> : null}
      <div className={`question-workspace${view === "list" ? " question-workspace--list" : ""}`}>
        {view === "list" ? (
          <div className="question-workspace__nav">
            <QuestionNavigator selectedQuestionId={questionId} />
          </div>
        ) : null}
        <article className="question-workspace__main">
          {center}
        </article>
        {question ? (
          <aside aria-label={t("questionWorkspace.questionDetails")} className="question-workspace__side">
            <RecordSection question={question} questionId={questionId} />
            {isAuthenticated ? (
              <section className="question-side__section">
                <NoteSection questionId={questionId} />
              </section>
            ) : null}
            <section aria-labelledby="question-content-title" className="question-side__section" ref={contentRef}>
              <h2 className="question-side__title" id="question-content-title">
                {t("questionWorkspace.materialsAndAnswers")}
              </h2>
              <Tabs
                items={[
                  { id: "materials", label: t("questionWorkspace.tabMaterials"), count: learningMaterials.length },
                  { id: "answers", label: t("questionWorkspace.tabAnswers"), count: referenceAnswers.length },
                ]}
                label={t("questionWorkspace.materialsAndAnswers")}
                onChange={setTab}
                value={tab}
              >
                {tab === "materials" ? <MaterialsTab canAdd={isAuthenticated} materials={learningMaterials} onAdd={() => setDialog("material")} /> : null}
                {tab === "answers" ? <AnswersTab answers={referenceAnswers} canAdd={isAuthenticated} onAdd={() => setDialog("answer")} /> : null}
              </Tabs>
            </section>
          </aside>
        ) : null}
      </div>
      <LearningMaterialDialog onClose={() => setDialog(null)} open={dialog === "material"} questionId={questionId} />
      <ReferenceAnswerDialog onClose={() => setDialog(null)} open={dialog === "answer"} questionId={questionId} />
    </div>
  );
}
