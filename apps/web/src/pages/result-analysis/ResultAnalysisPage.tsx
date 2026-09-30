import { useParams } from "react-router-dom";
import type { ResultAnalysisModel } from "../../entities/result/model";
import { useQuestionAnswerHistoryQuery } from "../../features/question/api/useQuestionAnswerHistoryQuery";
import { useResultAnalysisQuery } from "../../features/result/api/useResultAnalysisQuery";
import { ApiClientError, getErrorDetails, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { scoreTone, withSubjectParticle } from "../../shared/lib/labels";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardBody,
  CardHeader,
  ErrorState,
  Icon,
  ListRow,
  PageHeader,
  PageSkeleton,
  Progress,
} from "../../shared/ui/primitives";
import "./result.css";

function useCopy() {
  const { locale } = useLocale();
  return (ko: string, en: string) => (locale === "ko" ? ko : en);
}

const TONE_WORD: Record<ReturnType<typeof scoreTone>, [string, string]> = {
  danger: ["약점", "Weak"],
  warning: ["보완 필요", "Needs work"],
  success: ["숙달", "Strong"],
  neutral: ["평가 대기", "Pending"],
};

/** Previous attempt's total for the same question, taken from the answer history. */
function usePreviousScore(result: ResultAnalysisModel) {
  const historyQuery = useQuestionAnswerHistoryQuery(result.questionId || undefined);
  const items = historyQuery.data?.items ?? [];
  const currentIndex = items.findIndex((item) => item.answerAttemptId === result.answerAttemptId);
  const previous = currentIndex >= 0 ? items.slice(currentIndex + 1).find((item) => item.totalScore !== null) : undefined;
  return previous?.totalScore ?? null;
}

function ScoreHero({ result }: { result: ResultAnalysisModel }) {
  const copy = useCopy();
  const previous = usePreviousScore(result);
  const total = result.totalScoreValue;
  const tone = scoreTone(total);
  const [toneKo, toneEn] = TONE_WORD[tone];
  const delta = total !== null && previous !== null ? total - previous : null;
  const scored = result.dimensions.filter((dimension) => dimension.score !== null);
  const weakest = scored.reduce<(typeof scored)[number] | null>(
    (low, dimension) => (!low || (dimension.score ?? 0) < (low.score ?? 0) ? dimension : low),
    null,
  );
  const nextFollowUp = result.followUpRecommendations[0] ?? null;

  return (
    <Card aria-label={copy("점수 요약", "Score summary")} className="result-hero">
      <div className="result-hero__total">
        <span className="result-label">{copy("총점", "Total")}</span>
        <span className={`result-hero__score ui-tone-text--${tone}`}>{total ?? "-"}</span>
        {delta !== null ? (
          <span className={`result-hero__delta ui-tone-text--${delta >= 0 ? "success" : "danger"}`}>
            {delta >= 0 ? "▲" : "▼"} {copy(`${Math.abs(delta)} (지난 시도 ${previous})`, `${Math.abs(delta)} (last attempt ${previous})`)}
          </span>
        ) : null}
        <Badge dot tone={tone}>
          {copy(toneKo, toneEn)}
        </Badge>
        {result.evaluationResult && result.evaluationResult !== copy(toneKo, toneEn) ? (
          <span className="result-hero__verdict">{result.evaluationResult}</span>
        ) : null}
      </div>

      <div className="result-hero__dimensions">
        <span className="result-label">{copy("항목별 점수", "By dimension")}</span>
        {scored.length === 0 ? (
          <p className="result-muted">{copy("항목별 점수가 아직 없어요.", "No dimension scores yet.")}</p>
        ) : (
          scored.map((dimension) => (
            <div className="result-dimension" key={dimension.id}>
              <span>{dimension.label}</span>
              <Progress label={dimension.label} tone={scoreTone(dimension.score)} value={dimension.score ?? 0} />
              <strong className={`ui-tone-text--${scoreTone(dimension.score)}`}>{dimension.score}</strong>
            </div>
          ))
        )}
      </div>

      <div className="result-hero__next">
        <span className="result-label">{copy("다음 할 일", "Next")}</span>
        <p>
          {weakest ? (
            <>
              <strong>“{weakest.label}”</strong>
              {copy(`${withSubjectParticle(weakest.label).slice(weakest.label.length)} 가장 약해요. `, " is the weakest. ")}
            </>
          ) : null}
          {result.recommendedNextStep ?? copy("약한 부분을 보완해서 다시 답해보세요.", "Strengthen the weak part and answer again.")}
        </p>
        <ButtonLink to={routeConfig.answerEditor.buildPath({ questionId: result.questionId })} variant="primary">
          {copy("다시 답하기", "Answer again")}
        </ButtonLink>
        {nextFollowUp ? (
          <ButtonLink to={routeConfig.questionDetail.buildPath({ questionId: nextFollowUp.id })}>{copy("다음 꼬리질문으로", "Next follow-up")}</ButtonLink>
        ) : null}
        {result.nextReviewLabel ? (
          <span className="result-muted">
            {copy(`${result.nextReviewLabel}에 복습 목록에 다시 올라와요`, `Back in your review list ${result.nextReviewLabel}`)}
          </span>
        ) : null}
      </div>
    </Card>
  );
}

function FeedbackCard({ result }: { result: ResultAnalysisModel }) {
  const copy = useCopy();
  const good = [...result.strengthPoints, ...(result.strengthSummary ? [result.strengthSummary] : [])];
  const improve = [...result.improvementPoints, ...result.missedPoints, ...(result.weaknessSummary ? [result.weaknessSummary] : [])];
  const extra = result.feedbackItems.filter((item) => item.description);

  if (good.length === 0 && improve.length === 0 && extra.length === 0) {
    return null;
  }

  return (
    <Card aria-labelledby="result-feedback-title">
      <CardHeader title={<span id="result-feedback-title">{copy("피드백", "Feedback")}</span>} />
      <CardBody>
        <ul className="result-feedback">
          {good.map((point) => (
            <li key={`good-${point}`}>
              <Icon className="ui-tone-text--success" name="check" size={16} />
              <span>
                <span className="ui-visually-hidden">{copy("잘한 점: ", "Strength: ")}</span>
                {point}
              </span>
            </li>
          ))}
          {improve.map((point) => (
            <li key={`improve-${point}`}>
              <Icon className="ui-tone-text--warning" name="alert" size={16} />
              <span>
                <span className="ui-visually-hidden">{copy("보완할 점: ", "To improve: ")}</span>
                {point}
              </span>
            </li>
          ))}
          {extra.map((item) => (
            <li key={item.id}>
              <Icon
                className={`ui-tone-text--${item.tone === "positive" ? "success" : item.tone === "improving" ? "warning" : "neutral"}`}
                name={item.tone === "positive" ? "check" : "info"}
                size={16}
              />
              <span>
                <strong>{item.title}</strong> {item.description}
              </span>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}

export function ResultAnalysisPage() {
  const { answerAttemptId } = useParams<{ answerAttemptId: string }>();
  const { t } = useLocale();
  const copy = useCopy();
  const resultQuery = useResultAnalysisQuery(answerAttemptId);
  const result = resultQuery.data;

  if (resultQuery.isLoading) {
    return <PageSkeleton label={copy("평가 결과를 불러오는 중", "Loading the evaluation")} />;
  }

  if (resultQuery.isError || !result) {
    if (!resultQuery.isError || (resultQuery.error instanceof ApiClientError && resultQuery.error.status === 404)) {
      return (
        <ErrorState
          actions={
            <ButtonLink to={routeConfig.practice.buildPath()} variant="primary">
              {t("common.backToPractice")}
            </ButtonLink>
          }
          body={copy("삭제되었거나 다른 계정의 답변 기록일 수 있어요.", "It may have been deleted or belong to another account.")}
          icon="search"
          size="page"
          title={copy("평가 결과를 찾을 수 없어요", "We couldn't find this evaluation")}
        />
      );
    }

    return (
      <ErrorState
        actions={
          <Button onClick={() => void resultQuery.refetch()} variant="primary">
            {t("common.tryAgain")}
          </Button>
        }
        body={userFacingErrorMessage(resultQuery.error, copy("답변 결과를 불러오지 못했습니다.", "The answer result could not be loaded."))}
        details={getErrorDetails(resultQuery.error)}
        size="page"
        title={copy("결과 분석을 불러올 수 없습니다", "Unable to load result analysis")}
      />
    );
  }

  return (
    <div className="ui-page result-page">
      <PageHeader
        description={result.questionTitle}
        title={
          result.attemptNumber
            ? copy(`평가 결과 · ${result.attemptNumber}번째 시도`, `Evaluation · attempt ${result.attemptNumber}`)
            : copy("평가 결과", "Evaluation")
        }
      />
      <ScoreHero result={result} />
      <div className="result-layout">
        <div className="result-layout__main">
          <Card aria-labelledby="result-answer-title">
            <CardHeader
              actions={
                <ButtonLink size="sm" to={routeConfig.questionDetail.buildPath({ questionId: result.questionId })} variant="ghost">
                  {copy("질문 보기", "View question")}
                </ButtonLink>
              }
              title={<span id="result-answer-title">{copy("내 답변", "Your answer")}</span>}
            />
            <CardBody>
              {result.answerText ? (
                <p className="result-answer">{result.answerText}</p>
              ) : (
                <p className="result-muted">{copy("답변 본문을 불러올 수 없어요.", "The answer text is unavailable.")}</p>
              )}
            </CardBody>
          </Card>
          {result.modelAnswer ? (
            <details className="result-reference-answer">
              <summary>{copy("모범 답안과 비교하기", "Compare with a model answer")}</summary>
              <p className="result-answer">{result.modelAnswer.text}</p>
            </details>
          ) : null}
        </div>
        <aside aria-label={copy("피드백과 다음 질문", "Feedback and next questions")} className="result-layout__aside">
          <FeedbackCard result={result} />
          {result.followUpRecommendations.length > 0 ? (
            <Card aria-labelledby="result-followups-title">
              <CardHeader title={<span id="result-followups-title">{copy("이어질 꼬리질문", "Likely follow-ups")}</span>} />
              {result.followUpRecommendations.slice(0, 4).map((item) => (
                <ListRow
                  key={item.id}
                  title={item.title}
                  trailing={
                    <ButtonLink size="sm" to={routeConfig.questionDetail.buildPath({ questionId: item.id })} variant="ghost">
                      {copy("열기", "Open")}
                    </ButtonLink>
                  }
                />
              ))}
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
