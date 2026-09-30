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

function useCopy() {
  const { locale } = useLocale();
  return (ko: string, en: string) => (locale === "ko" ? ko : en);
}

/** Save a job posting by pasting its text or importing its link. */
function PostingForm({ onSaved, formId, submitLabel }: { onSaved: (postingId: string) => void; formId: string; submitLabel: string }) {
  const copy = useCopy();
  const createMutation = useCreateJobPostingMutation();
  const [inputType, setInputType] = useState<"text" | "link">("text");
  const [sourceUrl, setSourceUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleName, setRoleName] = useState("");
  const [tried, setTried] = useState(false);
  const missing = inputType === "link" ? !sourceUrl.trim() : !rawText.trim();
  const error = optionalErrorMessage(createMutation.error, copy("공고를 저장하지 못했어요.", "We couldn't save the posting."));

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
          { id: "text", label: copy("본문 붙여넣기", "Paste text") },
          { id: "link", label: copy("링크로 가져오기", "Import a link") },
        ]}
        label={copy("공고 입력 방식", "How to add the posting")}
        onChange={setInputType}
        value={inputType}
      />
      {inputType === "link" ? (
        <Field error={tried && missing ? copy("공고 링크를 넣어주세요.", "Enter the posting link.") : undefined} label={copy("공고 링크", "Posting link")}>
          {(control) => <Input {...control} inputMode="url" onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://" value={sourceUrl} />}
        </Field>
      ) : (
        <Field error={tried && missing ? copy("공고 본문을 붙여넣어 주세요.", "Paste the posting text.") : undefined} label={copy("공고 본문", "Posting text")}>
          {(control) => <Textarea {...control} onChange={(event) => setRawText(event.target.value)} rows={6} value={rawText} />}
        </Field>
      )}
      <div className="tailor-form__row">
        <Field label={copy("회사 (선택)", "Company (optional)")}>
          {(control) => <Input {...control} onChange={(event) => setCompanyName(event.target.value)} value={companyName} />}
        </Field>
        <Field label={copy("직무 (선택)", "Role (optional)")}>
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
  const copy = useCopy();
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
  const runError = optionalErrorMessage(createAnalysis.error, copy("분석을 시작하지 못했어요.", "We couldn't start the analysis."));

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
    return <PageSkeleton label={copy("공고 맞춤을 불러오는 중", "Loading job fit")} />;
  }

  if (analysesQuery.isError || postingsQuery.isError) {
    const error = analysesQuery.error ?? postingsQuery.error;
    return (
      <ErrorState
        actions={
          <Button onClick={() => void Promise.all([analysesQuery.refetch(), postingsQuery.refetch()])} variant="primary">
            {copy("다시 시도", "Try again")}
          </Button>
        }
        body={userFacingErrorMessage(error, copy("공고 맞춤을 불러오지 못했어요.", "Job fit could not be loaded."))}
        details={getErrorDetails(error)}
        title={copy("공고 맞춤을 불러올 수 없어요", "Unable to load job fit")}
      />
    );
  }

  if (postings.length === 0) {
    return (
      <Card aria-labelledby="tailor-first-title" className="tailor-first" padded>
        <h2 className="tailor-title" id="tailor-first-title">
          {copy("지원할 공고를 넣어주세요", "Add a job posting you're applying to")}
        </h2>
        <p className="tailor-muted">
          {copy(
            "이 이력서와 공고를 비교해 부족한 키워드와 고쳐 쓸 문장을 제안해요. 원본 이력서는 바뀌지 않아요.",
            "We compare this resume with the posting and suggest missing keywords and rewrites. Your original resume stays unchanged.",
          )}
        </p>
        <PostingForm formId="tailor-first-form" onSaved={(postingId) => void runAnalysis(postingId)} submitLabel={copy("저장하고 분석하기", "Save and analyze")} />
      </Card>
    );
  }

  return (
    <div className="tailor">
      {runError ? <Callout tone="danger">{runError}</Callout> : null}
      <Card aria-labelledby="tailor-analyses-title">
        <CardHeader
          meta={copy("이 버전으로 실행한 분석", "Analyses run on this version")}
          title={<span id="tailor-analyses-title">{copy(`분석 ${analyses.length}`, `Analyses ${analyses.length}`)}</span>}
          titleAs="h2"
        />
        {analyses.length === 0 ? (
          <EmptyState body={copy("아래 공고에서 ‘분석하기’를 눌러 시작하세요.", "Pick a posting below and choose Analyze.")} title={copy("아직 분석이 없어요", "No analyses yet")} />
        ) : (
          analyses.map((analysis) => (
            <ListRow
              key={analysis.id}
              leading={
                <span className={`tailor-score ui-tone-text--${scoreTone(analysis.overallScore)}`} aria-label={copy(`적합도 ${analysis.overallScoreLabel}`, `Fit ${analysis.overallScoreLabel}`)}>
                  {analysis.overallScoreLabel}
                </span>
              }
              meta={[analysis.createdAtLabel, analysis.matchSummary].filter(Boolean).join(" · ")}
              title={(analysis.jobPostingId && postingTitle.get(analysis.jobPostingId)) || analysis.suggestedHeadline || copy("공고 없는 분석", "Analysis without a posting")}
              trailing={
                <ButtonLink size="sm" to={routeConfig.resumeTailorAnalysisDetail.buildPath({ versionId, analysisId: analysis.id })} variant="ghost">
                  {copy("열기", "Open")}
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
              {copy("공고 추가", "Add posting")}
            </Button>
          }
          title={<span id="tailor-postings-title">{copy(`저장한 공고 ${postings.length}`, `Saved postings ${postings.length}`)}</span>}
          titleAs="h2"
        />
        {postings.map((posting) => (
          <ListRow
            key={posting.id}
            meta={
              <span className="tailor-posting-meta">
                {posting.fetchStatus === "failed" ? <Badge tone="danger">{copy("가져오기 실패", "Import failed")}</Badge> : null}
                {posting.parsedKeywords.slice(0, 5).map((keyword) => (
                  <Badge key={keyword}>{keyword}</Badge>
                ))}
                <span>{posting.createdAtLabel}</span>
              </span>
            }
            title={posting.title}
            trailing={
              <Button loading={runningPostingId === posting.id} onClick={() => void runAnalysis(posting.id)} size="sm" variant="primary">
                {copy("분석하기", "Analyze")}
              </Button>
            }
          />
        ))}
      </Card>

      <Dialog closeLabel={copy("닫기", "Close")} onClose={() => setAddOpen(false)} open={addOpen} title={copy("공고 추가", "Add a posting")}>
        <PostingForm formId="tailor-add-form" onSaved={() => setAddOpen(false)} submitLabel={copy("공고 저장", "Save posting")} />
      </Dialog>
    </div>
  );
}
