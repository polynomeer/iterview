import { useLocation } from "react-router-dom";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useHomeQuery } from "../../features/home/api/useHomeQuery";
import type { HomeModel, HomeQuestionCardModel } from "../../entities/home/model";
import { ApiClientError, getErrorDetails, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale, type AppLocale, type MessageKey } from "../../shared/i18n";
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

const STATUS_KEYS: Record<HomeQuestionCardModel["status"], MessageKey> = {
  new: "home.statusNew",
  retry: "home.statusRetry",
  improving: "home.statusImproving",
  archived: "home.statusArchived",
};

function NextQuestionCard({ question, locale }: { question: HomeQuestionCardModel | null; locale: AppLocale }) {
  const { t } = useLocale();

  if (!question) {
    return (
      <Card className="today-next">
        <EmptyState
          actions={
            <ButtonLink to={routeConfig.practice.buildPath()} variant="primary">
              {t("home.browseQuestions")}
            </ButtonLink>
          }
          body={t("home.noAssignedBody")}
          title={t("home.noAssignedTitle")}
        />
      </Card>
    );
  }

  const difficulty = difficultyLabel(question.difficulty, locale);

  return (
    <Card aria-labelledby="today-next-title" className="today-next">
      <div className="today-next__main">
        <div className="today-next__badges">
          <Badge tone="accent">{t("home.upNext")}</Badge>
          {question.status === "retry" ? <Badge tone="warning">{t("home.retry")}</Badge> : null}
          {difficulty ? <Badge>{difficulty}</Badge> : null}
        </div>
        <h2 className="today-next__title" id="today-next-title">
          {question.title}
        </h2>
        <div className="today-next__actions">
          <ButtonLink icon="arrowRight" size="lg" to={routeConfig.answerEditor.buildPath({ questionId: question.id })} variant="primary">
            {t("home.startAnswering")}
          </ButtonLink>
          <ButtonLink size="lg" to={routeConfig.questionDetail.buildPath({ questionId: question.id })}>
            {t("home.viewQuestionDetail")}
          </ButtonLink>
        </div>
      </div>
      <aside aria-label={t("home.aboutQuestion")} className="today-next__about">
        <span className="today-next__about-label">{t("home.aboutQuestion")}</span>
        <p className="today-next__fact">
          <Icon name="info" size={16} />
          {t(STATUS_KEYS[question.status])}
        </p>
        {question.scheduledLabel ? (
          <p className="today-next__fact">
            <Icon name="today" size={16} />
            {t("home.assignedOn", { date: question.scheduledLabel })}
          </p>
        ) : null}
      </aside>
    </Card>
  );
}

function DueReviewCard({ home, locale }: { home: HomeModel; locale: AppLocale }) {
  const { t } = useLocale();
  const items = home.retryQuestions;

  return (
    <Card aria-labelledby="today-review-title">
      <CardHeader
        actions={
          <ButtonLink size="sm" to={routeConfig.reviewQueue.buildPath()} variant="ghost">
            {t("home.viewAll")}
          </ButtonLink>
        }
        meta={items.length > 0 ? <Badge tone="danger">{items.length}</Badge> : null}
        title={<span id="today-review-title">{t("home.dueForReview")}</span>}
      />
      {items.length === 0 ? (
        <EmptyState body={t("home.noDueBody")} icon="check" title={t("home.noDueTitle")} />
      ) : (
        items.slice(0, 5).map((item) => (
          <ListRow
            key={item.id}
            meta={[difficultyLabel(item.difficulty, locale), item.scheduledLabel].filter(Boolean).join(" · ")}
            title={item.title}
            trailing={
              <ButtonLink size="sm" to={routeConfig.answerEditor.buildPath({ questionId: item.id })}>
                {t("home.answerAgain")}
              </ButtonLink>
            }
          />
        ))
      )}
    </Card>
  );
}

function ResumeRiskCard({ home, locale }: { home: HomeModel; locale: AppLocale }) {
  const { t } = useLocale();

  if (home.resumeRisks.length === 0) {
    return null;
  }

  return (
    <Card aria-labelledby="today-risk-title">
      <CardHeader
        actions={
          <ButtonLink size="sm" to={routeConfig.resume.buildPath()} variant="ghost">
            {t("home.resumeOverview")}
          </ButtonLink>
        }
        title={<span id="today-risk-title">{t("home.resumeRisksTitle")}</span>}
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
                    {t("home.riskLevel", { level: severity.label })}
                  </Badge>
                ) : null}
                {risk.questionId ? (
                  <ButtonLink size="sm" to={routeConfig.questionDetail.buildPath({ questionId: risk.questionId })} variant="ghost">
                    {t("home.viewQuestion")}
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
  const { t } = useLocale();
  const summary = home.summary;

  return (
    <Card aria-labelledby="today-progress-title" padded>
      <h2 className="today-aside__title" id="today-progress-title">
        {t("home.progress")}
      </h2>
      {summary ? (
        <div className="today-aside__stats">
          <Stat label={t("home.statToday")} value={summary.dailyQuestionCount} />
          <Stat label={t("home.statRetries")} value={summary.retryQuestionCount} />
          <Stat label={t("home.statDue")} value={summary.pendingReviewCount} />
          <Stat label={t("home.statDone")} value={summary.archivedQuestionCount} />
        </div>
      ) : null}
      {home.skillReadiness.length > 0 ? (
        <div className="today-aside__skills">
          {/* The home preview has no answer counts; a score of 0 means the area is not measured yet. */}
          {home.skillReadiness.every((skill) => !skill.score) ? (
            <p className="today-aside__empty">{t("home.readinessEmpty")}</p>
          ) : (
            home.skillReadiness.slice(0, 5).map((skill) => {
              const label = skillCategoryLabel(skill.code, locale) ?? skill.code;
              const measured = Boolean(skill.score);
              return (
                <div className="today-aside__skill" key={skill.code}>
                  <div className="today-aside__skill-row">
                    <span>{label}</span>
                    <strong>{measured ? Math.round(skill.score ?? 0) : t("home.notMeasured")}</strong>
                  </div>
                  <Progress label={t("home.skillReadiness", { skill: label })} tone={measured ? scoreTone(skill.score) : "neutral"} value={skill.score ?? 0} />
                </div>
              );
            })
          )}
          <ButtonLink size="sm" to={routeConfig.skills.buildPath()} variant="ghost">
            {t("home.openSkillMap")}
          </ButtonLink>
        </div>
      ) : null}
    </Card>
  );
}

function MaterialsCard({ home }: { home: HomeModel }) {
  const { t } = useLocale();

  if (home.learningMaterials.length === 0) {
    return null;
  }

  return (
    <Card aria-labelledby="today-materials-title">
      <CardHeader title={<span id="today-materials-title">{t("home.readingTitle")}</span>} />
      {home.learningMaterials.slice(0, 3).map((material) => (
        <ListRow
          key={material.id}
          meta={[material.materialType, material.sourceName].filter(Boolean).join(" · ")}
          title={material.title}
          trailing={
            material.url ? (
              <a className="today-link" href={material.url} rel="noreferrer" target="_blank">
                {t("home.open")}
              </a>
            ) : null
          }
        />
      ))}
    </Card>
  );
}

function GuestHome() {
  const { t } = useLocale();
  const location = useLocation();
  const steps: Array<[MessageKey, MessageKey]> = [
    ["home.guestStepUploadTitle", "home.guestStepUploadBody"],
    ["home.guestStepAnswerTitle", "home.guestStepAnswerBody"],
    ["home.guestStepRetryTitle", "home.guestStepRetryBody"],
  ];

  return (
    <div className="ui-page today-page">
      <PageHeader
        description={t("home.guestDescription")}
        title={t("home.guestTitle")}
      />
      <Card className="today-guest" padded>
        <ol className="today-guest__steps">
          {steps.map(([titleKey, bodyKey], index) => (
            <li key={titleKey}>
              <span aria-hidden="true" className="today-guest__step-number">
                {index + 1}
              </span>
              <div>
                <strong>{t(titleKey)}</strong>
                <p>{t(bodyKey)}</p>
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
            {t("home.logIn")}
          </ButtonLink>
          <ButtonLink size="lg" to={routeConfig.signup.buildPath()}>
            {t("home.createAccount")}
          </ButtonLink>
          <ButtonLink size="lg" to={routeConfig.practice.buildPath()} variant="ghost">
            {t("home.browseQuestions")}
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}

export function HomePage() {
  const homeQuery = useHomeQuery();
  const currentUserQuery = useCurrentUserQuery();
  const { locale, t } = useLocale();
  const home = homeQuery.data;

  if (homeQuery.isLoading) {
    return <PageSkeleton label={t("home.loading")} />;
  }

  if (homeQuery.error instanceof ApiClientError && homeQuery.error.status === 401) {
    return <GuestHome />;
  }

  if (homeQuery.isError || !home) {
    return (
      <ErrorState
        actions={
          <Button onClick={() => void homeQuery.refetch()} variant="primary">
            {t("home.tryAgain")}
          </Button>
        }
        body={userFacingErrorMessage(homeQuery.error, t("home.loadErrorBody"))}
        details={getErrorDetails(homeQuery.error)}
        size="page"
        title={t("home.loadErrorTitle")}
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
            ? t(taskCount === 1 ? "home.taskCountOne" : "home.taskCountOther", { count: taskCount })
            : t("home.allDone")
        }
        title={name ? t("home.greeting", { name }) : t("home.title")}
      />
      <NextQuestionCard locale={locale} question={home.todayQuestion} />
      <div className="today-layout">
        <div className="today-layout__main">
          <DueReviewCard home={home} locale={locale} />
          <ResumeRiskCard home={home} locale={locale} />
        </div>
        <aside aria-label={t("home.asideLabel")} className="today-layout__aside">
          <ProgressCard home={home} locale={locale} />
          <MaterialsCard home={home} />
        </aside>
      </div>
    </div>
  );
}
