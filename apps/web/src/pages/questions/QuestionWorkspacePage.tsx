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

function useCopy() {
  const { locale } = useLocale();
  return (ko: string, en: string) => (locale === "ko" ? ko : en);
}

function MasteryBadge({ status }: { status: string | null | undefined }) {
  const copy = useCopy();
  const mastery = toMastery(status);
  const [ko, en] = MASTERY_LABEL[mastery];
  return (
    <Badge dot tone={MASTERY_TONE[mastery]}>
      {copy(ko, en)}
    </Badge>
  );
}

/** /questions — pick a question from the navigator; desktop suggests where to start. */
export function QuestionsIndexPage() {
  const copy = useCopy();
  const { search } = useLocation();
  const [first, setFirst] = useState<PracticeQuestionItemModel | null>(null);
  const handleItems = useCallback((items: PracticeQuestionItemModel[]) => setFirst(items[0] ?? null), []);

  return (
    <div className="ui-page question-page">
      <PageHeader
        description={copy("질문을 골라 설명과 꼬리질문, 내 기록을 한 화면에서 보세요.", "Pick a question to see its prompt, follow-ups, and your record in one place.")}
        title={copy("질문", "Questions")}
      />
      <div className="question-index">
        <QuestionNavigator onItems={handleItems} />
        <Card className="question-index__placeholder">
          <EmptyState
            actions={
              first ? (
                <ButtonLink to={`${routeConfig.questionDetail.buildPath({ questionId: first.id })}${search}`} variant="primary">
                  {copy("첫 질문 열기", "Open the first question")}
                </ButtonLink>
              ) : null
            }
            body={first ? first.title : undefined}
            icon="questions"
            title={copy("왼쪽에서 질문을 고르세요", "Choose a question on the left")}
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
  const copy = useCopy();
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
        <h2 id="question-followups-title">{copy("다음 꼬리질문", "Next follow-ups")}</h2>
        <span>{copy("답변 뒤에 이어질 수 있는 질문", "Where the interviewer may go next")}</span>
      </div>
      {treeQuery.isLoading || followupsQuery.isLoading ? (
        <div className="question-followups__loading">
          <Skeleton height="3.25rem" />
          <Skeleton height="3.25rem" />
        </div>
      ) : nextItems.length === 0 ? (
        <Card>
          <EmptyState body={copy("답변을 제출하면 꼬리질문이 추천될 수 있어요.", "Follow-ups may appear after you answer.")} title={copy("아직 연결된 꼬리질문이 없어요", "No follow-ups yet")} />
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
          <summary>{copy(`전체 꼬리질문 트리 (${descendantCount})`, `Full follow-up tree (${descendantCount})`)}</summary>
          <FollowUpTree currentId={questionId} nodes={nodes} parentId={questionId} />
        </details>
      ) : null}
    </section>
  );
}

function RecordTab({ question, questionId }: { question: QuestionDetailModel; questionId: string }) {
  const copy = useCopy();
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
            {copy("로그인", "Log in")}
          </ButtonLink>
        }
        body={copy("로그인하면 이 질문에 대한 내 답변과 점수를 볼 수 있어요.", "Log in to see your answers and scores for this question.")}
        icon="profile"
        title={copy("내 기록은 로그인 후에 보여요", "Sign in to see your record")}
      />
    );
  }

  return (
    <div className="question-inspector__stack">
      {progress ? (
        <div className="question-inspector__stats">
          <Stat label={copy("최고 점수", "Best score")} tone={scoreTone(Number.parseFloat(progress.bestScoreLabel))} value={progress.bestScoreLabel} />
          <Stat label={copy("시도", "Attempts")} value={progress.attemptsCount} />
        </div>
      ) : null}
      {progress?.nextReviewLabel ? (
        <p className="question-inspector__note">
          <Icon name="review" size={16} />
          {copy(`다음 복습 ${progress.nextReviewLabel}`, `Next review ${progress.nextReviewLabel}`)}
        </p>
      ) : null}
      {historyQuery.isLoading ? (
        <Skeleton height="6rem" />
      ) : historyQuery.isError ? (
        <ErrorState
          actions={<Button onClick={() => void historyQuery.refetch()} size="sm">{copy("다시 시도", "Try again")}</Button>}
          body={userFacingErrorMessage(historyQuery.error, copy("답변 기록을 불러오지 못했어요.", "We couldn't load your answers."))}
          title={copy("기록을 불러올 수 없어요", "Record unavailable")}
        />
      ) : (historyQuery.data?.items.length ?? 0) === 0 ? (
        <EmptyState body={copy("첫 답변을 제출하면 점수와 피드백이 여기에 쌓여요.", "Scores and feedback collect here after your first answer.")} title={copy("아직 답변하지 않았어요", "No answers yet")} />
      ) : (
        <div className="question-inspector__history">
          {historyQuery.data?.items.map((item) => (
            <Link className="question-inspector__attempt" key={item.answerAttemptId} to={routeConfig.resultAnalysis.buildPath({ answerAttemptId: item.answerAttemptId })}>
              <ListRow
                meta={item.evaluationResultLabel ?? undefined}
                title={item.submittedAtLabel}
                trailing={
                  item.totalScore !== null ? (
                    <Badge tone={scoreTone(item.totalScore)}>{copy(`${item.totalScore}점`, `${item.totalScore} pts`)}</Badge>
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
  const copy = useCopy();

  return (
    <div className="question-inspector__stack">
      {materials.length === 0 ? (
        <EmptyState title={copy("연결된 학습 자료가 없어요", "No learning materials yet")} />
      ) : (
        materials.map((material) => (
          <article className="question-material" key={material.id}>
            <div className="question-material__head">
              <strong>{material.labelOverride || material.title}</strong>
              {material.isOfficial ? <Badge tone="accent">{copy("공식", "Official")}</Badge> : null}
            </div>
            <p className="question-material__meta">
              {[material.resourceTypeLabel, material.sourceName, material.estimatedMinutes ? copy(`${material.estimatedMinutes}분`, `${material.estimatedMinutes} min`) : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {material.description ? <p className="question-material__body">{material.description}</p> : null}
            {material.contentText ? (
              <details className="question-material__content">
                <summary>{copy("내용 보기", "Show content")}</summary>
                <p>{material.contentText}</p>
              </details>
            ) : null}
            {material.url ? (
              <a className="question-link" href={material.url} rel="noreferrer" target="_blank">
                {copy("링크 열기", "Open link")}
              </a>
            ) : null}
          </article>
        ))
      )}
      {canAdd ? (
        <Button icon="plus" onClick={onAdd} size="sm">
          {copy("자료 추가", "Add material")}
        </Button>
      ) : null}
    </div>
  );
}

function AnswersTab({ answers, onAdd, canAdd }: { answers: QuestionDetailModel["referenceAnswers"]; onAdd: () => void; canAdd: boolean }) {
  const copy = useCopy();

  return (
    <div className="question-inspector__stack">
      {answers.length === 0 ? (
        <EmptyState title={copy("아직 모범 답안이 없어요", "No reference answers yet")} />
      ) : (
        answers.map((answer, index) => (
          <details className="question-answer" key={answer.id} open={index === 0}>
            <summary>
              <strong>{answer.title}</strong>
              {answer.isOfficial ? <Badge tone="accent">{copy("공식", "Official")}</Badge> : null}
              {answer.isUserGenerated ? <Badge>{copy("내 답안", "Mine")}</Badge> : null}
            </summary>
            <p className="question-answer__text">{answer.answerText}</p>
          </details>
        ))
      )}
      {canAdd ? (
        <Button icon="plus" onClick={onAdd} size="sm">
          {copy("모범 답안 추가", "Add reference answer")}
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
  const { locale } = useLocale();
  const copy = useCopy();
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
    center = <PageSkeleton label={copy("질문을 불러오는 중", "Loading the question")} />;
  } else if (detailQuery.isError || !question) {
    const notFound = !detailQuery.isError || (detailQuery.error instanceof ApiClientError && detailQuery.error.status === 404);
    center = (
      <ErrorState
        actions={
          notFound ? (
            <ButtonLink to={routeConfig.practice.buildPath()} variant="primary">
              {copy("질문 목록으로", "Back to questions")}
            </ButtonLink>
          ) : (
            <Button onClick={() => void detailQuery.refetch()} variant="primary">
              {copy("다시 시도", "Try again")}
            </Button>
          )
        }
        body={notFound ? copy("삭제되었거나 주소가 잘못되었을 수 있어요.", "It may have been removed, or the link is wrong.") : userFacingErrorMessage(detailQuery.error, copy("질문을 불러오지 못했어요.", "We couldn't load this question."))}
        details={getErrorDetails(detailQuery.error)}
        icon={notFound ? "search" : undefined}
        size="page"
        title={notFound ? copy("질문을 찾을 수 없어요", "Question not found") : copy("질문을 열 수 없어요", "Question unavailable")}
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
                {copy("답변하기", "Answer")}
              </ButtonLink>
              <Button onClick={openReferenceAnswers}>{copy("모범 답안 보기", "See reference answers")}</Button>
            </>
          }
          title={question.title}
        />
        {question.body && question.body !== question.title ? (
          <Card padded>
            <h2 className="question-section-label">{copy("질문 설명", "About this question")}</h2>
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
          <aside aria-label={copy("질문 정보", "Question details")} className="question-workspace__inspector" ref={inspectorRef}>
            <Card>
              <CardHeader title={copy("내 준비 상태", "Your preparation")} titleAs="h2" />
              <CardBody>
                <Tabs
                  items={[
                    { id: "record", label: copy("내 기록", "Record") },
                    { id: "materials", label: copy("자료", "Materials"), count: learningMaterials.length },
                    { id: "answers", label: copy("모범 답안", "Answers"), count: referenceAnswers.length },
                  ]}
                  label={copy("질문 정보 보기", "Question details view")}
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
