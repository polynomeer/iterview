import { useLocation } from "react-router-dom";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useHomeQuery } from "../../features/home/api/useHomeQuery";
import type { HomeModel, HomeQuestionCardModel } from "../../entities/home/model";
import { ApiClientError, getErrorDetails, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale, type AppLocale } from "../../shared/i18n";
import { difficultyLabel, scoreTone, severityLabel, skillCategoryLabel } from "../../shared/lib/labels";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  Icon,
  ListRow,
  PageHeader,
  PageSkeleton,
  Progress,
  Stat,
} from "../../shared/ui/primitives";
import "./home.css";

type Copy = (ko: string, en: string) => string;

function useCopy(): Copy {
  const { locale } = useLocale();
  return (ko, en) => (locale === "ko" ? ko : en);
}

const STATUS_COPY: Record<HomeQuestionCardModel["status"], [string, string]> = {
  new: ["처음 답하는 질문이에요.", "You haven't answered this one yet."],
  retry: ["지난 답변이 약해서 다시 배정됐어요.", "Assigned again because the last answer was weak."],
  improving: ["점수를 올리는 중인 질문이에요.", "You're improving this one."],
  archived: ["이미 완료한 질문을 다시 확인해요.", "A mastered question, back for a check."],
};

function NextQuestionCard({ question, locale }: { question: HomeQuestionCardModel | null; locale: AppLocale }) {
  const copy = useCopy();

  if (!question) {
    return (
      <Card className="today-next">
        <EmptyState
          actions={
            <ButtonLink to={routeConfig.practice.buildPath()} variant="primary">
              {copy("질문 둘러보기", "Browse questions")}
            </ButtonLink>
          }
          body={copy("질문 목록에서 오늘 연습할 질문을 골라 보세요.", "Pick something to practice from the question list.")}
          title={copy("오늘 배정된 질문이 없어요", "No question is assigned for today")}
        />
      </Card>
    );
  }

  const difficulty = difficultyLabel(question.difficulty, locale);
  const [statusKo, statusEn] = STATUS_COPY[question.status];

  return (
    <Card aria-labelledby="today-next-title" className="today-next">
      <div className="today-next__main">
        <div className="today-next__badges">
          <Badge tone="accent">{copy("다음 할 일", "Up next")}</Badge>
          {question.status === "retry" ? <Badge tone="warning">{copy("재도전", "Retry")}</Badge> : null}
          {difficulty ? <Badge>{difficulty}</Badge> : null}
        </div>
        <h2 className="today-next__title" id="today-next-title">
          {question.title}
        </h2>
        <div className="today-next__actions">
          <ButtonLink icon="arrowRight" size="lg" to={routeConfig.answerEditor.buildPath({ questionId: question.id })} variant="primary">
            {copy("답변 시작", "Start answering")}
          </ButtonLink>
          <ButtonLink size="lg" to={routeConfig.questionDetail.buildPath({ questionId: question.id })}>
            {copy("질문 자세히 보기", "View question")}
          </ButtonLink>
        </div>
      </div>
      <aside aria-label={copy("이 질문에 대해", "About this question")} className="today-next__about">
        <span className="today-next__about-label">{copy("이 질문에 대해", "About this question")}</span>
        <p className="today-next__fact">
          <Icon name="info" size={16} />
          {copy(statusKo, statusEn)}
        </p>
        {question.scheduledLabel ? (
          <p className="today-next__fact">
            <Icon name="today" size={16} />
            {copy(`${question.scheduledLabel} 배정`, `Assigned ${question.scheduledLabel}`)}
          </p>
        ) : null}
      </aside>
    </Card>
  );
}

function DueReviewCard({ home, locale }: { home: HomeModel; locale: AppLocale }) {
  const copy = useCopy();
  const items = home.retryQuestions;

  return (
    <Card aria-labelledby="today-review-title">
      <CardHeader
        actions={
          <ButtonLink size="sm" to={routeConfig.reviewQueue.buildPath()} variant="ghost">
            {copy("전체 보기", "View all")}
          </ButtonLink>
        }
        meta={items.length > 0 ? <Badge tone="danger">{items.length}</Badge> : null}
        title={<span id="today-review-title">{copy("복습할 질문", "Due for review")}</span>}
      />
      {items.length === 0 ? (
        <EmptyState body={copy("약했던 답변이 생기면 여기에 다시 올라와요.", "Weak answers come back here when they're due.")} icon="check" title={copy("지금 복습할 질문이 없어요", "Nothing is due right now")} />
      ) : (
        items.slice(0, 5).map((item) => (
          <ListRow
            key={item.id}
            meta={[difficultyLabel(item.difficulty, locale), item.scheduledLabel].filter(Boolean).join(" · ")}
            title={item.title}
            trailing={
              <ButtonLink size="sm" to={routeConfig.answerEditor.buildPath({ questionId: item.id })}>
                {copy("다시 답하기", "Answer again")}
              </ButtonLink>
            }
          />
        ))
      )}
    </Card>
  );
}

function ResumeRiskCard({ home, locale }: { home: HomeModel; locale: AppLocale }) {
  const copy = useCopy();

  if (home.resumeRisks.length === 0) {
    return null;
  }

  return (
    <Card aria-labelledby="today-risk-title">
      <CardHeader
        actions={
          <ButtonLink size="sm" to={routeConfig.resumeAnalysis.buildPath()} variant="ghost">
            {copy("이력서 분석", "Resume analysis")}
          </ButtonLink>
        }
        title={<span id="today-risk-title">{copy("근거를 보강할 이력서 항목", "Resume claims that need evidence")}</span>}
      />
      {home.resumeRisks.slice(0, 4).map((risk) => {
        const severity = severityLabel(risk.severity, locale);
        return (
          <ListRow
            key={risk.id}
            leading={<Icon className="today-risk__icon" name="alert" />}
            title={risk.title}
            trailing={
              <>
                {severity ? (
                  <Badge dot tone={severity.tone}>
                    {copy(`위험도 ${severity.label}`, `${severity.label} risk`)}
                  </Badge>
                ) : null}
                {risk.questionId ? (
                  <ButtonLink size="sm" to={routeConfig.questionDetail.buildPath({ questionId: risk.questionId })} variant="ghost">
                    {copy("질문 보기", "View question")}
                  </ButtonLink>
                ) : null}
              </>
            }
          />
        );
      })}
    </Card>
  );
}

function ProgressCard({ home, locale }: { home: HomeModel; locale: AppLocale }) {
  const copy = useCopy();
  const summary = home.summary;

  return (
    <Card aria-labelledby="today-progress-title" padded>
      <h2 className="today-aside__title" id="today-progress-title">
        {copy("진행 현황", "Progress")}
      </h2>
      {summary ? (
        <div className="today-aside__stats">
          <Stat label={copy("오늘의 질문", "Today")} value={summary.dailyQuestionCount} />
          <Stat label={copy("재도전", "Retries")} value={summary.retryQuestionCount} />
          <Stat label={copy("복습 대기", "Due")} value={summary.pendingReviewCount} />
          <Stat label={copy("완료", "Done")} value={summary.archivedQuestionCount} />
        </div>
      ) : null}
      {home.skillReadiness.length > 0 ? (
        <div className="today-aside__skills">
          {home.skillReadiness.slice(0, 5).map((skill) => {
            const label = skillCategoryLabel(skill.code, locale) ?? skill.code;
            return (
              <div className="today-aside__skill" key={skill.code}>
                <div className="today-aside__skill-row">
                  <span>{label}</span>
                  <strong>{skill.score === null ? "-" : Math.round(skill.score)}</strong>
                </div>
                <Progress label={copy(`${label} 준비도`, `${label} readiness`)} tone={scoreTone(skill.score)} value={skill.score ?? 0} />
              </div>
            );
          })}
          <ButtonLink size="sm" to={routeConfig.skills.buildPath()} variant="ghost">
            {copy("스킬 맵에서 보기", "Open skill map")}
          </ButtonLink>
        </div>
      ) : null}
    </Card>
  );
}

function MaterialsCard({ home }: { home: HomeModel }) {
  const copy = useCopy();

  if (home.learningMaterials.length === 0) {
    return null;
  }

  return (
    <Card aria-labelledby="today-materials-title">
      <CardHeader title={<span id="today-materials-title">{copy("오늘 읽을 자료", "Reading for today")}</span>} />
      {home.learningMaterials.slice(0, 3).map((material) => (
        <ListRow
          key={material.id}
          meta={[material.materialType, material.sourceName].filter(Boolean).join(" · ")}
          title={material.title}
          trailing={
            material.url ? (
              <a className="today-link" href={material.url} rel="noreferrer" target="_blank">
                {copy("열기", "Open")}
              </a>
            ) : null
          }
        />
      ))}
    </Card>
  );
}

function GuestHome() {
  const copy = useCopy();
  const location = useLocation();
  const steps: Array<[string, string, string, string]> = [
    ["이력서를 올리면", "항목마다 나올 질문과 꼬리질문을 만들어요.", "Upload your resume", "We draft the questions and follow-ups each claim invites."],
    ["꼬리질문 끝까지 답하고", "답변마다 주장·근거·대비를 평가해요.", "Answer down the follow-ups", "Every answer is scored on claim, evidence, and readiness."],
    ["약한 곳만 다시", "틀린 질문은 알맞은 간격으로 복습 목록에 올라와요.", "Retry only what's weak", "Weak answers return to your review list at the right time."],
  ];

  return (
    <div className="ui-page today-page">
      <PageHeader
        description={copy("이력서 한 줄 한 줄을 면접에서 방어할 수 있게 연습하세요.", "Practice until every line on your resume holds up in the interview.")}
        title={copy("이력서 기반 면접 연습", "Resume-based interview practice")}
      />
      <Card className="today-guest" padded>
        <ol className="today-guest__steps">
          {steps.map(([koTitle, koBody, enTitle, enBody], index) => (
            <li key={koTitle}>
              <span aria-hidden="true" className="today-guest__step-number">
                {index + 1}
              </span>
              <div>
                <strong>{copy(koTitle, enTitle)}</strong>
                <p>{copy(koBody, enBody)}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="today-next__actions">
          <ButtonLink
            size="lg"
            state={{ redirectTo: `${location.pathname}${location.search}` }}
            to={routeConfig.login.buildPath()}
            variant="primary"
          >
            {copy("로그인", "Log in")}
          </ButtonLink>
          <ButtonLink size="lg" to={routeConfig.signup.buildPath()}>
            {copy("계정 만들기", "Create account")}
          </ButtonLink>
          <ButtonLink size="lg" to={routeConfig.practice.buildPath()} variant="ghost">
            {copy("질문 둘러보기", "Browse questions")}
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}

export function HomePage() {
  const homeQuery = useHomeQuery();
  const currentUserQuery = useCurrentUserQuery();
  const { locale } = useLocale();
  const copy = useCopy();
  const home = homeQuery.data;

  if (homeQuery.isLoading) {
    return <PageSkeleton label={copy("오늘 할 일을 불러오는 중", "Loading today")} />;
  }

  if (homeQuery.error instanceof ApiClientError && homeQuery.error.status === 401) {
    return <GuestHome />;
  }

  if (homeQuery.isError || !home) {
    return (
      <ErrorState
        actions={
          <Button onClick={() => void homeQuery.refetch()} variant="primary">
            {copy("다시 시도", "Try again")}
          </Button>
        }
        body={userFacingErrorMessage(homeQuery.error, copy("오늘 할 일을 불러오지 못했어요.", "We couldn't load today's work."))}
        details={getErrorDetails(homeQuery.error)}
        size="page"
        title={copy("오늘 화면을 열 수 없어요", "Today is unavailable")}
      />
    );
  }

  const user = currentUserQuery.data;
  const name = user?.profile?.nickname?.trim() || user?.nickname?.trim() || user?.name;
  const taskCount = (home.todayQuestion ? 1 : 0) + home.retryQuestions.length;

  return (
    <div className="ui-page today-page">
      <PageHeader
        description={
          taskCount > 0
            ? copy(`오늘 할 일 ${taskCount}개`, `${taskCount} ${taskCount === 1 ? "task" : "tasks"} today`)
            : copy("오늘 할 일을 모두 끝냈어요", "You're done for today")
        }
        title={name ? copy(`${name}님, 오늘도 한 질문씩`, `One question at a time, ${name}`) : copy("오늘", "Today")}
      />
      <NextQuestionCard locale={locale} question={home.todayQuestion} />
      <div className="today-layout">
        <div className="today-layout__main">
          <DueReviewCard home={home} locale={locale} />
          <ResumeRiskCard home={home} locale={locale} />
        </div>
        <aside aria-label={copy("진행과 자료", "Progress and reading")} className="today-layout__aside">
          <ProgressCard home={home} locale={locale} />
          <MaterialsCard home={home} />
        </aside>
      </div>
    </div>
  );
}
