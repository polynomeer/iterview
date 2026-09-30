import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateJobPostingMutation } from "../../features/resume-tailor/api/useCreateJobPostingMutation";
import { useCreateResumeAnalysisMutation } from "../../features/resume-tailor/api/useCreateResumeAnalysisMutation";
import { useJobPostingsQuery } from "../../features/resume-tailor/api/useJobPostingsQuery";
import { useResumeAnalysesQuery } from "../../features/resume-tailor/api/useResumeAnalysesQuery";
import { getErrorDetails, optionalErrorMessage, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { scoreTone } from "../../shared/lib/labels";
import {
  Badge,
  Button,
  ButtonLink,
  Callout,
  Card,
  CardHeader,
  Dialog,
  EmptyState,
  ErrorState,
  Field,
  Input,
  ListRow,
  PageSkeleton,
  Segmented,
  Textarea,
} from "../../shared/ui/primitives";
import "./tailor.css";

/** Save a job posting by pasting its text or importing its link. */
function PostingForm({ onSaved, formId, submitLabel }: { onSaved: (postingId: string) => void; formId: string; submitLabel: string }) {
  const { t } = useLocale();
  const createMutation = useCreateJobPostingMutation();
  const [inputType, setInputType] = useState<"text" | "link">("text");
  const [sourceUrl, setSourceUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleName, setRoleName] = useState("");
  const [tried, setTried] = useState(false);
  const missing = inputType === "link" ? !sourceUrl.trim() : !rawText.trim();
  const error = optionalErrorMessage(createMutation.error, t("resumeTailor.weCouldntSaveThePosting"));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTried(true);
    if (missing) {
      return;
    }
    try {
      const posting = await createMutation.mutateAsync({
        inputType,
        sourceUrl: inputType === "link" ? sourceUrl.trim() : null,
        rawText: inputType === "text" ? rawText.trim() : null,
        companyName: companyName.trim() || null,
        roleName: roleName.trim() || null,
      });
      onSaved(posting.id);
    } catch {
      // Rendered through `error`.
    }
  }

  return (
    <form className="tailor-form" id={formId} onSubmit={(event) => void handleSubmit(event)}>
      <Segmented
        items={[
          { id: "text", label: t("resumeTailor.pasteText") },
          { id: "link", label: t("resumeTailor.importALink") },
        ]}
        label={t("resumeTailor.howToAddThePosting")}
        onChange={setInputType}
        value={inputType}
      />
      {inputType === "link" ? (
        <Field error={tried && missing ? t("resumeTailor.enterThePostingLink") : undefined} label={t("resumeTailor.postingLink")}>
          {(control) => <Input {...control} inputMode="url" onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://" value={sourceUrl} />}
        </Field>
      ) : (
        <Field error={tried && missing ? t("resumeTailor.pasteThePostingText") : undefined} label={t("resumeTailor.postingText")}>
          {(control) => <Textarea {...control} onChange={(event) => setRawText(event.target.value)} rows={6} value={rawText} />}
        </Field>
      )}
      <div className="tailor-form__row">
        <Field label={t("resumeTailor.companyOptional")}>
          {(control) => <Input {...control} onChange={(event) => setCompanyName(event.target.value)} value={companyName} />}
        </Field>
        <Field label={t("resumeTailor.roleOptional")}>
          {(control) => <Input {...control} onChange={(event) => setRoleName(event.target.value)} value={roleName} />}
        </Field>
      </div>
      {error ? (
        <Callout tone="danger">
          {error}
          {getErrorDetails(createMutation.error).map((detail) => (
            <div key={detail}>{detail}</div>
          ))}
        </Callout>
      ) : null}
      <Button loading={createMutation.isPending} type="submit" variant="primary">
        {submitLabel}
      </Button>
    </form>
  );
}

/** 공고 맞춤: saved postings and the fit analyses run for this resume version. */
export function ResumeTailorAnalysisListPage() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const { versionId = "" } = useParams<{ versionId: string }>();
  const analysesQuery = useResumeAnalysesQuery(versionId);
  const postingsQuery = useJobPostingsQuery();
  const createAnalysis = useCreateResumeAnalysisMutation(versionId);
  const [addOpen, setAddOpen] = useState(false);
  const [runningPostingId, setRunningPostingId] = useState<string | null>(null);
  const postings = postingsQuery.data ?? [];
  const analyses = analysesQuery.data ?? [];
  const postingTitle = new Map(postings.map((posting) => [posting.id, posting.title]));
  const runError = optionalErrorMessage(createAnalysis.error, t("resumeTailor.weCouldntStartTheAnalysis"));

  async function runAnalysis(jobPostingId: string) {
    setRunningPostingId(jobPostingId);
    try {
      const analysis = await createAnalysis.mutateAsync({ jobPostingId });
      navigate(routeConfig.resumeTailorAnalysisDetail.buildPath({ versionId, analysisId: analysis.id }));
    } catch {
      // Rendered through `runError`.
    } finally {
      setRunningPostingId(null);
    }
  }

  if (analysesQuery.isLoading || postingsQuery.isLoading) {
    return <PageSkeleton label={t("resumeTailor.loadingJobFit")} />;
  }

  if (analysesQuery.isError || postingsQuery.isError) {
    const error = analysesQuery.error ?? postingsQuery.error;
    return (
      <ErrorState
        actions={
          <Button onClick={() => void Promise.all([analysesQuery.refetch(), postingsQuery.refetch()])} variant="primary">
            {t("resumeTailor.tryAgain")}
          </Button>
        }
        body={userFacingErrorMessage(error, t("resumeTailor.jobFitCouldNotBe"))}
        details={getErrorDetails(error)}
        title={t("resumeTailor.unableToLoadJobFit")}
      />
    );
  }

  if (postings.length === 0) {
    return (
      <Card aria-labelledby="tailor-first-title" className="tailor-first" padded>
        <h2 className="tailor-title" id="tailor-first-title">
          {t("resumeTailor.addAJobPostingYoure")}
        </h2>
        <p className="tailor-muted">
          {t("resumeTailor.weCompareThisResumeWith")}
        </p>
        <PostingForm formId="tailor-first-form" onSaved={(postingId) => void runAnalysis(postingId)} submitLabel={t("resumeTailor.saveAndAnalyze")} />
      </Card>
    );
  }

  return (
    <div className="tailor">
      {runError ? <Callout tone="danger">{runError}</Callout> : null}
      <Card aria-labelledby="tailor-analyses-title">
        <CardHeader
          meta={t("resumeTailor.analysesRunOnThisVersion")}
          title={<span id="tailor-analyses-title">{t("resumeTailor.analysesCount", { count: analyses.length })}</span>}
          titleAs="h2"
        />
        {analyses.length === 0 ? (
          <EmptyState body={t("resumeTailor.pickAPostingBelowAnd")} title={t("resumeTailor.noAnalysesYet")} />
        ) : (
          analyses.map((analysis) => (
            <ListRow
              key={analysis.id}
              leading={
                <span className={`tailor-score ui-tone-text--${scoreTone(analysis.overallScore)}`} aria-label={t("resumeTailor.fitScore", { overallScoreLabel: analysis.overallScoreLabel })}>
                  {analysis.overallScoreLabel}
                </span>
              }
              meta={[analysis.createdAtLabel, analysis.matchSummary].filter(Boolean).join(" · ")}
              title={(analysis.jobPostingId && postingTitle.get(analysis.jobPostingId)) || analysis.suggestedHeadline || t("resumeTailor.analysisWithoutAPosting")}
              trailing={
                <ButtonLink size="sm" to={routeConfig.resumeTailorAnalysisDetail.buildPath({ versionId, analysisId: analysis.id })} variant="ghost">
                  {t("resumeTailor.open")}
                </ButtonLink>
              }
            />
          ))
        )}
      </Card>

      <Card aria-labelledby="tailor-postings-title">
        <CardHeader
          actions={
            <Button icon="plus" onClick={() => setAddOpen(true)} size="sm">
              {t("resumeTailor.addPosting")}
            </Button>
          }
          title={<span id="tailor-postings-title">{t("resumeTailor.savedPostingsCount", { count: postings.length })}</span>}
          titleAs="h2"
        />
        {postings.map((posting) => (
          <ListRow
            key={posting.id}
            meta={
              <span className="tailor-posting-meta">
                {posting.fetchStatus === "failed" ? <Badge tone="danger">{t("resumeTailor.importFailed")}</Badge> : null}
                {posting.parsedKeywords.slice(0, 5).map((keyword) => (
                  <Badge key={keyword}>{keyword}</Badge>
                ))}
                <span>{posting.createdAtLabel}</span>
              </span>
            }
            title={posting.title}
            trailing={
              <Button loading={runningPostingId === posting.id} onClick={() => void runAnalysis(posting.id)} size="sm" variant="primary">
                {t("resumeTailor.analyze")}
              </Button>
            }
          />
        ))}
      </Card>

      <Dialog closeLabel={t("resumeTailor.close")} onClose={() => setAddOpen(false)} open={addOpen} title={t("resumeTailor.addAPosting")}>
        <PostingForm formId="tailor-add-form" onSaved={() => setAddOpen(false)} submitLabel={t("resumeTailor.savePosting")} />
      </Dialog>
    </div>
  );
}
