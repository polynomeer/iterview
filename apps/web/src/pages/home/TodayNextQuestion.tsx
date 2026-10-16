import { Link } from "react-router-dom";
import type { HomeModel, HomeQuestionCardModel } from "../../entities/home/model";
import type { QuestionTreeNodeModel } from "../../entities/question-tree/model";
import { useQuestionAnswerHistoryQuery } from "../../features/question/api/useQuestionAnswerHistoryQuery";
import { useQuestionDetailQuery } from "../../features/question/api/useQuestionDetailQuery";
import { useQuestionTreeQuery } from "../../features/question/api/useQuestionTreeQuery";
import { routeConfig } from "../../shared/config/routes";
import { useLocale, type MessageKey } from "../../shared/i18n";
import { difficultyLabel, scoreTone, severityLabel } from "../../shared/lib/labels";
import { Badge, ButtonLink, Card, EmptyState, Skeleton } from "../../shared/ui/primitives";

const STATUS_KEYS: Record<HomeQuestionCardModel["status"], MessageKey> = {
  new: "home.statusNew",
  retry: "home.statusRetry",
  improving: "home.statusImproving",
  archived: "home.statusArchived",
};

/** Raw `nodeStatus` codes from the question tree API. Unknown values read as "next". */
const FLOW_STATUS: Record<string, { key: MessageKey; tone: "strong" | "weak" | "answered" | "next" }> = {
  strong: { key: "home.flowStrong", tone: "strong" },
  weak: { key: "home.flowWeak", tone: "weak" },
  answered: { key: "home.flowAnswered", tone: "answered" },
};

function FollowUpFlow({ questionId, nodes }: { questionId: string; nodes: QuestionTreeNodeModel[] }) {
  const { t } = useLocale();
  const next = nodes.filter((node) => node.parentQuestionId === questionId).slice(0, 3);

  if (next.length === 0) {
    return null;
  }

  return (
    <div className="today-flow">
      <span className="today-flow__label" id="today-flow-label">
        {t("home.followUpFlow")}
      </span>
      <ol aria-labelledby="today-flow-label" className="today-flow__chips">
        <li className="today-flow__item">
          <span aria-current="step" className="today-chip today-chip--now">
            <span aria-hidden="true" className="today-chip__dot" />
            {t("home.flowNow")}
          </span>
        </li>
        {next.map((node) => {
          const status = FLOW_STATUS[node.status] ?? { key: "home.flowNext" as MessageKey, tone: "next" as const };
          return (
            <li className="today-flow__item" key={node.id}>
              <span aria-hidden="true" className={`today-flow__link today-flow__link--${status.tone}`} />
              <Link
                className={`today-chip today-chip--${status.tone}`}
                to={routeConfig.questionDetail.buildPath({ questionId: node.id })}
              >
                {status.tone === "strong" || status.tone === "weak" ? <span aria-hidden="true" className="today-chip__dot" /> : null}
                <span className="today-chip__title">{node.title}</span>
                <span className="today-chip__status">· {t(status.key)}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function targetCompanyMatches(companies: string[], targets: string[]) {
  const wanted = new Set(targets.map((name) => name.trim().toLowerCase()));
  return companies.filter((name) => wanted.has(name.trim().toLowerCase()));
}

function WhyThisQuestion({
  question,
  home,
  targetCompanies,
  companies,
}: {
  question: HomeQuestionCardModel;
  home: HomeModel;
  targetCompanies: string[];
  companies: string[];
}) {
  const { t, locale } = useLocale();
  const historyQuery = useQuestionAnswerHistoryQuery(question.id);
  const attempts = historyQuery.data?.items ?? [];
  const lastScore = attempts[0]?.totalScore ?? null;
  const risk = home.resumeRisks.find((item) => item.questionId === question.id) ?? null;
  const severity = risk ? severityLabel(risk.severity, locale) : null;
  const targetMatches = targetCompanyMatches(companies, targetCompanies);

  return (
    <aside aria-label={t("home.whyThisQuestion")} className="today-why">
      <h3 className="today-why__title">{t("home.whyThisQuestion")}</h3>
      {historyQuery.isLoading ? (
        <Skeleton height="2rem" width="60%" />
      ) : lastScore !== null ? (
        <div className="today-why__score">
          <span className={`today-why__score-value today-score--${scoreTone(lastScore)}`}>{Math.round(lastScore)}</span>
          <span className="today-why__score-copy">
            {t("home.lastScore")}
            <br />
            {attempts.length === 1 ? t("home.attemptCountOne") : t("home.attemptCount", { count: attempts.length })}
          </span>
        </div>
      ) : null}
      <p className="today-why__fact">{t(STATUS_KEYS[question.status])}</p>
      {risk ? (
        <div className="today-why__group">
          <span className="today-why__label">{t("home.linkedResume")}</span>
          <span className="today-why__value">{t("home.linkedResumeBody")}</span>
          {severity ? (
            <Badge className="today-why__badge" dot tone={severity.tone}>
              {t("home.riskLevel", { level: severity.label })}
            </Badge>
          ) : null}
        </div>
      ) : null}
      {companies.length > 0 ? (
        <div className="today-why__group">
          <span className="today-why__label">{targetMatches.length > 0 ? t("home.targetCompanyAsked") : t("home.companiesAsked")}</span>
          <span className="today-why__value">{(targetMatches.length > 0 ? targetMatches : companies).slice(0, 3).join(" · ")}</span>
        </div>
      ) : null}
    </aside>
  );
}

export function TodayNextQuestion({
  question,
  home,
  targetCompanies,
}: {
  question: HomeQuestionCardModel | null;
  home: HomeModel;
  targetCompanies: string[];
}) {
  const { t, locale } = useLocale();
  const detailQuery = useQuestionDetailQuery(question?.id);
  const treeQuery = useQuestionTreeQuery(question?.id);

  if (!question) {
    return (
      <Card className="today-hero today-hero--empty">
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

  const detail = detailQuery.data;
  const general = t("modelCommon.general");
  const path = detail ? [detail.category, ...detail.tags].filter((part) => part && part !== general).slice(0, 3) : [];
  const nodes = treeQuery.data?.nodes ?? [];
  const followUps = nodes.filter((node) => node.parentQuestionId === question.id).length;
  const difficulty = difficultyLabel(question.difficulty, locale);

  return (
    <Card aria-labelledby="today-next-title" className="today-hero">
      <div className="today-hero__main">
        <div className="today-hero__meta">
          {path.length > 0 ? (
            <nav aria-label={t("home.topicPath")} className="today-path">
              {path.map((part, index) => (
                <span className="today-path__part" key={`${part}-${index}`}>
                  {index > 0 ? (
                    <span aria-hidden="true" className="today-path__sep">
                      /
                    </span>
                  ) : null}
                  {part}
                </span>
              ))}
            </nav>
          ) : (
            <span className="today-path">{t("home.nextQuestionLabel")}</span>
          )}
          {followUps > 0 ? <span className="today-hero__count">{t("home.followUpCount", { count: followUps })}</span> : null}
          {difficulty ? <Badge>{difficulty}</Badge> : null}
        </div>
        <h2 className="today-hero__title" id="today-next-title">
          {question.title}
        </h2>
        <FollowUpFlow nodes={nodes} questionId={question.id} />
        <div className="today-hero__actions">
          <ButtonLink icon="arrowRight" size="lg" to={routeConfig.answerEditor.buildPath({ questionId: question.id })} variant="primary">
            {t("home.startAnswering")}
          </ButtonLink>
          <ButtonLink size="lg" to={routeConfig.questionDetail.buildPath({ questionId: question.id })} variant="ghost">
            {t("home.viewQuestionDetail")}
          </ButtonLink>
        </div>
      </div>
      <WhyThisQuestion companies={detail?.companies ?? []} home={home} question={question} targetCompanies={targetCompanies} />
    </Card>
  );
}
