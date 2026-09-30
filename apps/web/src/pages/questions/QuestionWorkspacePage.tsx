import { useCallback, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import type { PracticeQuestionItemModel } from "../../entities/practice/model";
import {
  mapLearningMaterialsToModel,
  mapReferenceAnswersToModel,
  type QuestionDetailModel,
} from "../../entities/question/model";
import type { QuestionTreeNodeModel } from "../../entities/question-tree/model";
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
  CardBody,
  CardHeader,
  EmptyState,
  ErrorState,
  Icon,
  ListRow,
  PageHeader,
  PageSkeleton,
  Skeleton,
  Stat,
  Tabs,
} from "../../shared/ui/primitives";
import { MASTERY_LABEL, MASTERY_TONE, toMastery } from "./mastery";
import { LearningMaterialDialog, ReferenceAnswerDialog } from "./QuestionAuthoringDialogs";
import { QuestionNavigator } from "./QuestionNavigator";
import "./questions.css";

type InspectorTab = "record" | "materials" | "answers";

function MasteryBadge({ status }: { status: string | null | undefined }) {
  const { t } = useLocale();
  const mastery = toMastery(status);
  return (
    <Badge dot tone={MASTERY_TONE[mastery]}>
      {t(MASTERY_LABEL[mastery])}
    </Badge>
  );
}

/** /questions — pick a question from the navigator; desktop suggests where to start. */
export function QuestionsIndexPage() {
  const { t } = useLocale();
  const { search } = useLocation();
  const [first, setFirst] = useState<PracticeQuestionItemModel | null>(null);
  const handleItems = useCallback((items: PracticeQuestionItemModel[]) => setFirst(items[0] ?? null), []);

  return (
    <div className="ui-page question-page">
      <PageHeader
        description={t("questionWorkspace.indexDescription")}
        title={t("questionWorkspace.indexTitle")}
      />
      <div className="question-index">
        <QuestionNavigator onItems={handleItems} />
        <Card className="question-index__placeholder">
          <EmptyState
            actions={
              first ? (
                <ButtonLink to={`${routeConfig.questionDetail.buildPath({ questionId: first.id })}${search}`} variant="primary">
                  {t("questionWorkspace.openFirstQuestion")}
                </ButtonLink>
              ) : null
            }
            body={first ? first.title : undefined}
            icon="questions"
            title={t("questionWorkspace.chooseQuestion")}
          />
        </Card>
      </div>
    </div>
  );
}

function childrenOf(nodes: QuestionTreeNodeModel[], parentId: string) {
  return nodes.filter((node) => node.parentQuestionId === parentId);
}

function FollowUpTree({ nodes, parentId, currentId }: { nodes: QuestionTreeNodeModel[]; parentId: string; currentId: string }) {
  const children = childrenOf(nodes, parentId);
  if (children.length === 0) {
    return null;
  }

  return (
    <ul className="question-followup-tree">
      {children.map((node) => (
        <li key={node.id}>
          <Link
            aria-current={node.id === currentId ? "page" : undefined}
            className="question-followup-tree__node"
            to={routeConfig.questionDetail.buildPath({ questionId: node.id })}
          >
            <span className={`question-followup-tree__dot question-followup-tree__dot--${toMastery(node.status)}`} aria-hidden="true" />
            <span className="question-followup-tree__title">{node.title}</span>
          </Link>
          <FollowUpTree currentId={currentId} nodes={nodes} parentId={node.id} />
        </li>
      ))}
    </ul>
  );
}

function FollowUps({ questionId, defaultTreeOpen }: { questionId: string; defaultTreeOpen: boolean }) {
  const { t } = useLocale();
  const treeQuery = useQuestionTreeQuery(questionId);
  const followupsQuery = useRecommendedFollowupsQuery(questionId);
  const nodes = treeQuery.data?.nodes ?? [];
  const directChildren = childrenOf(nodes, questionId);
  const recommended = (followupsQuery.data ?? []).filter(
    (item) => item.questionId !== null && item.questionId !== undefined && !directChildren.some((child) => child.id === String(item.questionId)),
  );
  const nextItems = [
    ...directChildren.map((node) => ({ id: node.id, title: node.title, status: node.status })),
    ...recommended.map((item) => ({ id: String(item.questionId), title: item.title ?? "", status: item.nodeStatus ?? null })),
  ];
  const descendantCount = Math.max(0, nodes.length - 1);

  return (
    <section aria-labelledby="question-followups-title" className="question-followups">
      <div className="question-section-head">
        <h2 id="question-followups-title">{t("questionWorkspace.nextFollowUps")}</h2>
        <span>{t("questionWorkspace.nextFollowUpsHint")}</span>
      </div>
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
          {nextItems.map((item) => (
            <li key={item.id}>
              <Link className="question-followups__item" to={routeConfig.questionDetail.buildPath({ questionId: item.id })}>
                <strong className="question-followups__title">{item.title}</strong>
                <MasteryBadge status={item.status} />
                <Icon name="arrowRight" size={16} />
              </Link>
            </li>
          ))}
        </ul>
      )}
      {descendantCount > 1 ? (
        <details className="question-tree-panel" open={defaultTreeOpen}>
          <summary>{t("questionWorkspace.fullTree", { count: descendantCount })}</summary>
          <FollowUpTree currentId={questionId} nodes={nodes} parentId={questionId} />
        </details>
      ) : null}
    </section>
  );
}

function RecordTab({ question, questionId }: { question: QuestionDetailModel; questionId: string }) {
  const { t } = useLocale();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const historyQuery = useQuestionAnswerHistoryQuery(questionId);
  const progress = question.userProgressSummary;
  const unauthorized = !isAuthenticated || (historyQuery.error instanceof ApiClientError && historyQuery.error.status === 401);

  if (unauthorized) {
    return (
      <EmptyState
        actions={
          <ButtonLink size="sm" state={{ redirectTo: `${location.pathname}${location.search}` }} to={routeConfig.login.buildPath()} variant="primary">
            {t("questionWorkspace.logIn")}
          </ButtonLink>
        }
        body={t("questionWorkspace.recordLoginBody")}
        icon="profile"
        title={t("questionWorkspace.recordLoginTitle")}
      />
    );
  }

  return (
    <div className="question-inspector__stack">
      {progress ? (
        <div className="question-inspector__stats">
          <Stat label={t("questionWorkspace.bestScore")} tone={scoreTone(Number.parseFloat(progress.bestScoreLabel))} value={progress.bestScoreLabel} />
          <Stat label={t("questionWorkspace.attempts")} value={progress.attemptsCount} />
        </div>
      ) : null}
      {progress?.nextReviewLabel ? (
        <p className="question-inspector__note">
          <Icon name="review" size={16} />
          {t("questionWorkspace.nextReview", { date: progress.nextReviewLabel })}
        </p>
      ) : null}
      {historyQuery.isLoading ? (
        <Skeleton height="6rem" />
      ) : historyQuery.isError ? (
        <ErrorState
          actions={<Button onClick={() => void historyQuery.refetch()} size="sm">{t("questionWorkspace.tryAgain")}</Button>}
          body={userFacingErrorMessage(historyQuery.error, t("questionWorkspace.historyErrorBody"))}
          title={t("questionWorkspace.historyErrorTitle")}
        />
      ) : (historyQuery.data?.items.length ?? 0) === 0 ? (
        <EmptyState body={t("questionWorkspace.noAnswersBody")} title={t("questionWorkspace.noAnswersTitle")} />
      ) : (
        <div className="question-inspector__history">
          {historyQuery.data?.items.map((item) => (
            <Link className="question-inspector__attempt" key={item.answerAttemptId} to={routeConfig.resultAnalysis.buildPath({ answerAttemptId: item.answerAttemptId })}>
              <ListRow
                meta={item.evaluationResultLabel ?? undefined}
                title={item.submittedAtLabel}
                trailing={
                  item.totalScore !== null ? (
                    <Badge tone={scoreTone(item.totalScore)}>{t("questionWorkspace.scorePoints", { score: item.totalScore })}</Badge>
                  ) : null
                }
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MaterialsTab({ materials, onAdd, canAdd }: { materials: QuestionDetailModel["learningMaterials"]; onAdd: () => void; canAdd: boolean }) {
  const { t } = useLocale();

  return (
    <div className="question-inspector__stack">
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
    <div className="question-inspector__stack">
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

/** /questions/:id (and /questions/:id/tree) — the question, its follow-ups, and an inspector. */
export function QuestionWorkspacePage({ defaultTreeOpen = false }: { defaultTreeOpen?: boolean }) {
  const { questionId = "" } = useParams<{ questionId: string }>();
  const { locale, t } = useLocale();
  const { isAuthenticated } = useAuth();
  const detailQuery = useQuestionDetailQuery(questionId);
  const treeQuery = useQuestionTreeQuery(questionId);
  const question = detailQuery.data ?? null;
  const referenceAnswersQuery = useQuestionReferenceAnswersQuery(questionId, Boolean(question) && question?.referenceAnswers.length === 0);
  const learningMaterialsQuery = useQuestionLearningMaterialsQuery(questionId, Boolean(question) && question?.learningMaterials.length === 0);
  const [tab, setTab] = useState<InspectorTab>("record");
  const [dialog, setDialog] = useState<"material" | "answer" | null>(null);
  const inspectorRef = useRef<HTMLElement>(null);
  const referenceAnswers = useMemo(
    () => mergeById(question?.referenceAnswers ?? [], mapReferenceAnswersToModel(referenceAnswersQuery.data)),
    [question, referenceAnswersQuery.data],
  );
  const learningMaterials = useMemo(
    () => mergeById(question?.learningMaterials ?? [], mapLearningMaterialsToModel(learningMaterialsQuery.data)),
    [question, learningMaterialsQuery.data],
  );
  const rootStatus = treeQuery.data?.nodes.find((node) => node.id === questionId)?.status ?? null;

  function openReferenceAnswers() {
    setTab("answers");
    inspectorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    inspectorRef.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus();
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
    center = (
      <>
        <div className="question-main__meta">
          <span>{question.category}</span>
          {difficulty ? <Badge>{difficulty}</Badge> : null}
          <MasteryBadge status={rootStatus} />
          {question.companies.slice(0, 2).map((company) => (
            <Badge key={company}>{company}</Badge>
          ))}
        </div>
        <PageHeader
          actions={
            <>
              <ButtonLink icon="arrowRight" to={routeConfig.answerEditor.buildPath({ questionId })} variant="primary">
                {t("questionWorkspace.answer")}
              </ButtonLink>
              <Button onClick={openReferenceAnswers}>{t("questionWorkspace.seeReferenceAnswers")}</Button>
            </>
          }
          title={question.title}
        />
        {question.body && question.body !== question.title ? (
          <Card padded>
            <h2 className="question-section-label">{t("questionWorkspace.aboutQuestion")}</h2>
            <p className="question-main__body">{question.body}</p>
            {question.tags.length > 0 ? (
              <div className="question-main__tags">
                {question.tags.map((tag) => (
                  <Badge key={tag}>#{tag}</Badge>
                ))}
              </div>
            ) : null}
          </Card>
        ) : null}
        <FollowUps defaultTreeOpen={defaultTreeOpen} questionId={questionId} />
      </>
    );
  }

  return (
    <div className="ui-page question-page question-page--workspace">
      <div className="question-workspace">
        <div className="question-workspace__nav">
          <QuestionNavigator selectedQuestionId={questionId} />
        </div>
        <div className="question-workspace__main">{center}</div>
        {question ? (
          <aside aria-label={t("questionWorkspace.questionDetails")} className="question-workspace__inspector" ref={inspectorRef}>
            <Card>
              <CardHeader title={t("questionWorkspace.yourPreparation")} titleAs="h2" />
              <CardBody>
                <Tabs
                  items={[
                    { id: "record", label: t("questionWorkspace.tabRecord") },
                    { id: "materials", label: t("questionWorkspace.tabMaterials"), count: learningMaterials.length },
                    { id: "answers", label: t("questionWorkspace.tabAnswers"), count: referenceAnswers.length },
                  ]}
                  label={t("questionWorkspace.detailsView")}
                  onChange={setTab}
                  value={tab}
                >
                  {tab === "record" ? <RecordTab question={question} questionId={questionId} /> : null}
                  {tab === "materials" ? <MaterialsTab canAdd={isAuthenticated} materials={learningMaterials} onAdd={() => setDialog("material")} /> : null}
                  {tab === "answers" ? <AnswersTab answers={referenceAnswers} canAdd={isAuthenticated} onAdd={() => setDialog("answer")} /> : null}
                </Tabs>
              </CardBody>
            </Card>
          </aside>
        ) : null}
      </div>
      <LearningMaterialDialog onClose={() => setDialog(null)} open={dialog === "material"} questionId={questionId} />
      <ReferenceAnswerDialog onClose={() => setDialog(null)} open={dialog === "answer"} questionId={questionId} />
    </div>
  );
}
