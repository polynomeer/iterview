import { useState } from "react";
import { useParams } from "react-router-dom";
import { useCreateResumeAnalysisExportMutation } from "../../features/resume-tailor/api/useCreateResumeAnalysisExportMutation";
import { useJobPostingDetailQuery } from "../../features/resume-tailor/api/useJobPostingDetailQuery";
import { useResumeAnalysisDetailQuery } from "../../features/resume-tailor/api/useResumeAnalysisDetailQuery";
import { useResumeAnalysisExportsQuery } from "../../features/resume-tailor/api/useResumeAnalysisExportsQuery";
import { useToggleResumeAnalysisSuggestionMutation } from "../../features/resume-tailor/api/useToggleResumeAnalysisSuggestionMutation";
import { ApiClientError, getErrorDetails, optionalErrorMessage, userFacingErrorMessage } from "../../shared/api/errors";
import { downloadResumeAnalysisExportFileRequest } from "../../shared/api/resumeTailorApi";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { scoreTone } from "../../shared/lib/labels";
import {
  Badge,
  Button,
  ButtonLink,
  Callout,
  Card,
  CardBody,
  CardHeader,
  ErrorState,
  ListRow,
  PageSkeleton,
} from "../../shared/ui/primitives";
import "./tailor.css";

function useCopy() {
  const { locale } = useLocale();
  return (ko: string, en: string) => (locale === "ko" ? ko : en);
}

/** Keywords render as chips; sentences (focus areas, requirements) as a plain list. */
function SignalList({ title, items, tone, sentences = false }: { title: string; items: string[]; tone: "success" | "danger" | "warning" | "accent"; sentences?: boolean }) {
  if (items.length === 0) {
    return null;
  }
  if (sentences) {
    return (
      <div className="tailor-signal">
        <h3 className="tailor-subtitle">{title}</h3>
        <ul className="tailor-sentences">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className="tailor-signal">
      <h3 className="tailor-subtitle">{title}</h3>
      <ul className="tailor-chips">
        {items.map((item) => (
          <li key={item}>
            <Badge tone={tone}>{item}</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One fit analysis: the gaps, the rewrites to accept, the tailored preview, and PDF exports. */
export function ResumeTailorAnalysisDetailPage() {
  const copy = useCopy();
  const { versionId = "", analysisId = "" } = useParams<{ versionId: string; analysisId: string }>();
  const analysisQuery = useResumeAnalysisDetailQuery(versionId, analysisId);
  const exportsQuery = useResumeAnalysisExportsQuery(versionId, analysisId);
  const toggleMutation = useToggleResumeAnalysisSuggestionMutation(versionId, analysisId);
  const exportMutation = useCreateResumeAnalysisExportMutation(versionId, analysisId);
  const postingQuery = useJobPostingDetailQuery(analysisQuery.data?.jobPostingId ?? null, Boolean(analysisQuery.data?.jobPostingId));
  const [copied, setCopied] = useState(false);
  const [downloadFailed, setDownloadFailed] = useState(false);
  const listPath = routeConfig.resumeTailorAnalysisList.buildPath({ versionId });

  if (analysisQuery.isLoading) {
    return <PageSkeleton label={copy("분석을 불러오는 중", "Loading the analysis")} />;
  }

  if (analysisQuery.isError || !analysisQuery.data) {
    const notFound = !analysisQuery.isError || (analysisQuery.error instanceof ApiClientError && analysisQuery.error.status === 404);
    return (
      <ErrorState
        actions={
          notFound ? (
            <ButtonLink to={listPath} variant="primary">
              {copy("공고 맞춤으로", "Back to job fit")}
            </ButtonLink>
          ) : (
            <Button onClick={() => void analysisQuery.refetch()} variant="primary">
              {copy("다시 시도", "Try again")}
            </Button>
          )
        }
        body={notFound ? copy("삭제되었거나 다른 버전의 분석일 수 있어요.", "It may have been deleted or belong to another version.") : userFacingErrorMessage(analysisQuery.error, copy("분석을 불러오지 못했어요.", "The analysis could not be loaded."))}
        details={getErrorDetails(analysisQuery.error)}
        icon={notFound ? "search" : undefined}
        title={notFound ? copy("이 분석을 찾을 수 없어요", "We couldn't find this analysis") : copy("분석을 불러올 수 없어요", "Unable to load the analysis")}
      />
    );
  }

  const analysis = analysisQuery.data;
  const posting = postingQuery.data ?? null;
  const exports = exportsQuery.data ?? analysis.exports;
  const accepted = analysis.suggestions.filter((suggestion) => suggestion.accepted).length;
  const document = analysis.tailoredDocument;
  const actionError =
    optionalErrorMessage(toggleMutation.error, copy("제안을 반영하지 못했어요.", "We couldn't update the suggestion.")) ??
    optionalErrorMessage(exportMutation.error, copy("PDF를 만들지 못했어요.", "We couldn't create the PDF.")) ??
    (downloadFailed ? copy("PDF를 받지 못했어요.", "We couldn't download the PDF.") : null);

  async function download(exportId: string, fileName: string) {
    setDownloadFailed(false);
    try {
      const blob = await downloadResumeAnalysisExportFileRequest(versionId, analysisId, exportId);
      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = /\.pdf$/i.test(fileName) ? fileName : `${fileName}.pdf`;
      window.document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch {
      setDownloadFailed(true);
    }
  }

  async function copyPlainText() {
    if (!document?.plainText || !navigator.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(document.plainText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="tailor">
      <div>
        <ButtonLink size="sm" to={listPath} variant="ghost">
          {copy("← 공고 맞춤", "← Job fit")}
        </ButtonLink>
      </div>

      <Card className="tailor-hero" padded>
        <div className="tailor-hero__score">
          <span className="tailor-muted">{copy("적합도", "Fit")}</span>
          <strong className={`tailor-hero__value ui-tone-text--${scoreTone(analysis.overallScore)}`}>{analysis.overallScoreLabel}</strong>
        </div>
        <div className="tailor-hero__copy">
          <h2 className="tailor-title">{posting?.title ?? analysis.suggestedHeadline ?? copy("공고 맞춤 분석", "Job fit analysis")}</h2>
          {analysis.matchSummary ? <p className="tailor-body">{analysis.matchSummary}</p> : null}
          <p className="tailor-muted">{[analysis.createdAtLabel, analysis.generationSourceLabel].filter(Boolean).join(" · ")}</p>
        </div>
      </Card>

      {actionError ? <Callout tone="danger">{actionError}</Callout> : null}

      <div className="tailor-layout">
        <div className="tailor-layout__main">
          <Card aria-labelledby="tailor-suggestions-title">
            <CardHeader
              meta={copy(`${analysis.suggestions.length}개 중 ${accepted}개 반영`, `${accepted} of ${analysis.suggestions.length} applied`)}
              title={<span id="tailor-suggestions-title">{copy("고쳐 쓸 문장", "Suggested rewrites")}</span>}
              titleAs="h2"
            />
            {analysis.suggestions.length === 0 ? (
              <CardBody>
                <p className="tailor-muted">{copy("제안된 수정이 없어요.", "No rewrites were suggested.")}</p>
              </CardBody>
            ) : (
              <ol className="tailor-suggestions">
                {analysis.suggestions.map((suggestion) => (
                  <li className={suggestion.accepted ? "tailor-suggestion tailor-suggestion--accepted" : "tailor-suggestion"} key={suggestion.id}>
                    <div className="tailor-suggestion__head">
                      <Badge>{suggestion.sectionLabel}</Badge>
                      <Button
                        aria-pressed={suggestion.accepted}
                        loading={toggleMutation.isPending && toggleMutation.variables?.suggestionId === suggestion.id}
                        onClick={() => toggleMutation.mutate({ suggestionId: suggestion.id, accepted: !suggestion.accepted })}
                        size="sm"
                        variant={suggestion.accepted ? "secondary" : "primary"}
                      >
                        {suggestion.accepted ? copy("반영 취소", "Undo") : copy("반영", "Apply")}
                      </Button>
                    </div>
                    {suggestion.originalText ? (
                      <p className="tailor-suggestion__before">
                        <span className="ui-visually-hidden">{copy("원래 문장: ", "Original: ")}</span>
                        {suggestion.originalText}
                      </p>
                    ) : null}
                    <p className="tailor-suggestion__after">
                      <span className="ui-visually-hidden">{copy("제안: ", "Suggestion: ")}</span>
                      {suggestion.suggestedText}
                    </p>
                    {suggestion.reason ? <p className="tailor-muted">{suggestion.reason}</p> : null}
                  </li>
                ))}
              </ol>
            )}
          </Card>

          {document ? (
            <details className="tailor-preview">
              <summary>{copy("맞춤 이력서 미리보기", "Tailored resume preview")}</summary>
              <div className="tailor-preview__body">
                <h3 className="tailor-subtitle">{document.title}</h3>
                {document.summary ? <p className="tailor-body">{document.summary}</p> : null}
                {document.sections.map((section) => (
                  <section key={section.id}>
                    <h4 className="tailor-subtitle">{section.title}</h4>
                    <ul className="tailor-preview__lines">
                      {section.lines.map((line, index) => (
                        <li key={index}>{line}</li>
                      ))}
                    </ul>
                  </section>
                ))}
                {document.plainText ? (
                  <Button onClick={() => void copyPlainText()} size="sm">
                    {copied ? copy("복사했어요", "Copied") : copy("텍스트 복사", "Copy text")}
                  </Button>
                ) : null}
              </div>
            </details>
          ) : null}
        </div>

        <aside aria-label={copy("공고와 내보내기", "Posting and exports")} className="tailor-layout__aside">
          <Card aria-labelledby="tailor-gaps-title" padded>
            <h2 className="tailor-card-title" id="tailor-gaps-title">
              {copy("공고와 비교", "Against the posting")}
            </h2>
            <SignalList items={analysis.missingKeywords} title={copy("이력서에 없는 키워드", "Missing keywords")} tone="danger" />
            <SignalList items={analysis.weakSignals} sentences title={copy("근거가 약한 부분", "Weak signals")} tone="warning" />
            <SignalList items={analysis.strongMatches} title={copy("잘 맞는 부분", "Strong matches")} tone="success" />
            <SignalList items={analysis.recommendedFocusAreas} sentences title={copy("강조할 부분", "Focus areas")} tone="accent" />
          </Card>

          <Card aria-labelledby="tailor-exports-title">
            <CardHeader
              actions={
                <Button loading={exportMutation.isPending} onClick={() => exportMutation.mutate()} size="sm" variant="primary">
                  {copy("PDF 만들기", "Create PDF")}
                </Button>
              }
              title={<span id="tailor-exports-title">{copy("PDF", "PDF")}</span>}
              titleAs="h2"
            />
            {exports.length === 0 ? (
              <CardBody>
                <p className="tailor-muted">{copy("반영한 제안으로 PDF를 만들 수 있어요.", "Create a PDF with the rewrites you applied.")}</p>
              </CardBody>
            ) : (
              exports.map((item) => (
                <ListRow
                  key={item.id}
                  meta={[item.createdAtLabel, item.pageCount ? copy(`${item.pageCount}쪽`, `${item.pageCount} pages`) : null].filter(Boolean).join(" · ")}
                  title={item.fileName}
                  trailing={
                    <Button onClick={() => void download(item.id, item.fileName)} size="sm" variant="ghost">
                      {copy("받기", "Download")}
                    </Button>
                  }
                />
              ))
            )}
          </Card>

          {posting ? (
            <Card aria-labelledby="tailor-posting-title" padded>
              <h2 className="tailor-card-title" id="tailor-posting-title">
                {copy("공고", "Posting")}
              </h2>
              <p className="tailor-body">{posting.title}</p>
              {posting.parsedSummary ? <p className="tailor-muted">{posting.parsedSummary}</p> : null}
              <SignalList items={posting.parsedRequirements.slice(0, 8)} sentences title={copy("자격 요건", "Requirements")} tone="accent" />
              {posting.sourceUrl ? (
                <a className="tailor-link" href={posting.sourceUrl} rel="noreferrer" target="_blank">
                  {copy("원문 공고 열기", "Open the original posting")}
                </a>
              ) : null}
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
