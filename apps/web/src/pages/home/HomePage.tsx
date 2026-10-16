import { Link, useLocation } from "react-router-dom";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useHomeQuery } from "../../features/home/api/useHomeQuery";
import { useReviewQueueQuery } from "../../features/review-queue/api/useReviewQueueQuery";
import type { HomeModel } from "../../entities/home/model";
import { ApiClientError, getErrorDetails, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale, type AppLocale, type MessageKey } from "../../shared/i18n";
import { difficultyLabel, materialTypeLabel, scoreTone, severityLabel, skillCategoryLabel } from "../../shared/lib/labels";
import type { CurrentUserDto } from "../../shared/types/auth";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  ListRow,
  PageHeader,
  PageSkeleton,
  Progress,
  Stat,
} from "../../shared/ui/primitives";
import { TodayNextQuestion } from "./TodayNextQuestion";
import "./home.css";

function headline(home: HomeModel, t: ReturnType<typeof useLocale>["t"]) {
  const reviews = home.retryQuestions.length;
  if (home.todayQuestion) {
    if (reviews === 0) return t("home.headlineQuestionOnly");
    return reviews === 1 ? t("home.headlineQuestionReviewOne") : t("home.headlineQuestionReviewOther", { count: reviews });
  }
  if (reviews > 0) {
    return reviews === 1 ? t("home.headlineReviewOne") : t("home.headlineReviewOther", { count: reviews });
  }
  return t("home.allDone");
}

function targetCompaniesOf(user: CurrentUserDto | undefined) {
  return (user?.targetCompanies ?? [])
    .map((company) => (typeof company === "string" ? company : (company.companyName ?? "")).trim())
    .filter((company) => company.length > 0);
}

function TodayHeader({ home, targetCompanies }: { home: HomeModel; targetCompanies: string[] }) {
  const { t, locale } = useLocale();
  const date = new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", { month: "long", day: "numeric", weekday: "long" }).format(new Date());
  const eyebrow = [date, targetCompanies.length > 0 ? t("home.targetCompanies", { companies: targetCompanies.slice(0, 2).join(", ") }) : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <header className="today-header">
      <span className="today-header__eyebrow">{eyebrow}</span>
      <h1 className="today-header__title">{headline(home, t)}</h1>
    </header>
  );
}

function DueReviewCard({ home, locale }: { home: HomeModel; locale: AppLocale }) {
  const { t } = useLocale();
  const items = home.retryQuestions;
  const reviewQueueQuery = useReviewQueueQuery({ enabled: items.length > 0 });
  const reasons = new Map((reviewQueueQuery.data?.items ?? []).map((item) => [item.questionId, item.reasonTypeLabel]));

  return (
    <Card aria-labelledby="today-review-title" className="today-panel">
      <header className="today-panel__header">
        <h3 className="today-panel__title" id="today-review-title">
          {t("home.dueForReview")}
          {items.length > 0 ? (
            <>
              {" "}
              <span className="today-panel__count">{items.length}</span>
            </>
          ) : null}
        </h3>
        <Link className="today-link" to={routeConfig.reviewQueue.buildPath()}>
          {t("home.viewAll")}
        </Link>
      </header>
      {items.length === 0 ? (
        <EmptyState body={t("home.noDueBody")} icon="check" title={t("home.noDueTitle")} />
      ) : (
        <ul className="today-review">
          {items.slice(0, 5).map((item) => {
            const meta = [reasons.get(item.id), item.scheduledLabel, difficultyLabel(item.difficulty, locale)].filter(Boolean).join(" · ");
            return (
              <li className="today-review__row" key={item.id}>
                <span className="today-review__main">
                  <span className="today-review__title">{item.title}</span>
                  {meta ? <span className="today-review__meta">{meta}</span> : null}
                </span>
                <Link className="today-link" to={routeConfig.answerEditor.buildPath({ questionId: item.id })}>
                  {t("home.answerAgain")}
                </Link>
              </li>
            );
          })}
        </ul>
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
    <Card aria-labelledby="today-risk-title" className="today-panel">
      <header className="today-panel__header">
        <h3 className="today-panel__title" id="today-risk-title">
          {t("home.resumeRisksTitle")}
        </h3>
        <Link className="today-link" to={routeConfig.resume.buildPath()}>
          {t("home.resumeOverview")}
        </Link>
      </header>
      <ul className="today-risks">
        {home.resumeRisks.slice(0, 3).map((risk) => {
          const severity = severityLabel(risk.severity, locale);
          return (
            <li className={`today-risk${severity?.tone === "danger" ? " today-risk--high" : ""}`} key={risk.id}>
              <span className="today-risk__label">{t("home.resumeRiskQuestion")}</span>
              <span className="today-risk__title">{risk.title}</span>
              <span className="today-risk__footer">
                {severity ? (
                  <Badge dot tone={severity.tone}>
                    {t("home.riskLevel", { level: severity.label })}
                  </Badge>
                ) : null}
                {risk.questionId ? (
                  <Link className="today-link" to={routeConfig.questionDetail.buildPath({ questionId: risk.questionId })}>
                    {t("home.viewQuestion")}
                  </Link>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function ProgressCard({ home, locale }: { home: HomeModel; locale: AppLocale }) {
  const { t } = useLocale();
  const summary = home.summary;

  return (
    <Card aria-labelledby="today-progress-title" className="today-progress" padded>
      <h3 className="today-panel__title" id="today-progress-title">
        {t("home.progress")}
      </h3>
      {summary ? (
        <div className="today-progress__stats">
          <Stat label={t("home.statToday")} value={summary.dailyQuestionCount} />
          <Stat label={t("home.statRetries")} value={summary.retryQuestionCount} />
          <Stat label={t("home.statDue")} value={summary.pendingReviewCount} />
          <Stat label={t("home.statDone")} value={summary.archivedQuestionCount} />
        </div>
      ) : null}
      {home.skillReadiness.length > 0 ? (
        <div className="today-progress__skills">
          {/* The home preview has no answer counts; a score of 0 means the area is not measured yet. */}
          {home.skillReadiness.every((skill) => !skill.score) ? (
            <p className="today-progress__empty">{t("home.readinessEmpty")}</p>
          ) : (
            home.skillReadiness.slice(0, 5).map((skill) => {
              const label = skillCategoryLabel(skill.code, locale) ?? skill.code;
              const measured = Boolean(skill.score);
              return (
                <div className="today-progress__skill" key={skill.code}>
                  <div className="today-progress__skill-row">
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
  const { t, locale } = useLocale();

  if (home.learningMaterials.length === 0) {
    return null;
  }

  return (
    <Card aria-labelledby="today-materials-title" className="today-materials">
      <CardHeader title={<span id="today-materials-title">{t("home.readingTitle")}</span>} />
      {home.learningMaterials.slice(0, 3).map((material) => (
        <ListRow
          key={material.id}
          meta={[materialTypeLabel(material.materialType, locale), material.sourceName].filter(Boolean).join(" · ")}
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
        <div className="today-guest__actions">
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

  const targetCompanies = targetCompaniesOf(currentUserQuery.data);

  return (
    <div className="ui-page today-page">
      <TodayHeader home={home} targetCompanies={targetCompanies} />
      <TodayNextQuestion home={home} question={home.todayQuestion} targetCompanies={targetCompanies} />
      <div className="today-row">
        <DueReviewCard home={home} locale={locale} />
        <ResumeRiskCard home={home} locale={locale} />
      </div>
      <section aria-label={t("home.lowerLabel")} className="today-row today-row--lower">
        <ProgressCard home={home} locale={locale} />
        <MaterialsCard home={home} />
      </section>
    </div>
  );
}
