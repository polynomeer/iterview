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
  const { t } = useLocale();
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
    return <PageSkeleton label={t("resumeTailor.loadingTheAnalysis")} />;
  }

  if (analysisQuery.isError || !analysisQuery.data) {
    const notFound = !analysisQuery.isError || (analysisQuery.error instanceof ApiClientError && analysisQuery.error.status === 404);
    return (
      <ErrorState
        actions={
          notFound ? (
            <ButtonLink to={listPath} variant="primary">
              {t("resumeTailor.backToJobFit")}
            </ButtonLink>
          ) : (
            <Button onClick={() => void analysisQuery.refetch()} variant="primary">
              {t("resumeTailor.tryAgain")}
            </Button>
          )
        }
        body={notFound ? t("resumeTailor.itMayHaveBeenDeleted") : userFacingErrorMessage(analysisQuery.error, t("resumeTailor.theAnalysisCouldNotBe"))}
        details={getErrorDetails(analysisQuery.error)}
        icon={notFound ? "search" : undefined}
        title={notFound ? t("resumeTailor.weCouldntFindThisAnalysis") : t("resumeTailor.unableToLoadTheAnalysis")}
      />
    );
  }

  const analysis = analysisQuery.data;
  const posting = postingQuery.data ?? null;
  const exports = exportsQuery.data ?? analysis.exports;
  const accepted = analysis.suggestions.filter((suggestion) => suggestion.accepted).length;
  const document = analysis.tailoredDocument;
  const actionError =
    optionalErrorMessage(toggleMutation.error, t("resumeTailor.weCouldntUpdateTheSuggestion")) ??
    optionalErrorMessage(exportMutation.error, t("resumeTailor.weCouldntCreateThePdf")) ??
    (downloadFailed ? t("resumeTailor.weCouldntDownloadThePdf") : null);

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
          {t("resumeTailor.backToJobFitArrow")}
        </ButtonLink>
      </div>

      <Card className="tailor-hero" padded>
        <div className="tailor-hero__score">
          <span className="tailor-muted">{t("resumeTailor.fit")}</span>
          <strong className={`tailor-hero__value ui-tone-text--${scoreTone(analysis.overallScore)}`}>{analysis.overallScoreLabel}</strong>
        </div>
        <div className="tailor-hero__copy">
          <h2 className="tailor-title">{posting?.title ?? analysis.suggestedHeadline ?? t("resumeTailor.jobFitAnalysis")}</h2>
          {analysis.matchSummary ? <p className="tailor-body">{analysis.matchSummary}</p> : null}
          <p className="tailor-muted">{[analysis.createdAtLabel, analysis.generationSourceLabel].filter(Boolean).join(" · ")}</p>
        </div>
      </Card>

      {actionError ? <Callout tone="danger">{actionError}</Callout> : null}

      <div className="tailor-layout">
        <div className="tailor-layout__main">
          <Card aria-labelledby="tailor-suggestions-title">
            <CardHeader
              meta={t("resumeTailor.appliedProgress", { count: analysis.suggestions.length, accepted })}
              title={<span id="tailor-suggestions-title">{t("resumeTailor.suggestedRewrites")}</span>}
              titleAs="h2"
            />
            {analysis.suggestions.length === 0 ? (
              <CardBody>
                <p className="tailor-muted">{t("resumeTailor.noRewritesWereSuggested")}</p>
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
                        {suggestion.accepted ? t("resumeTailor.undo") : t("resumeTailor.apply")}
                      </Button>
                    </div>
                    {suggestion.originalText ? (
                      <p className="tailor-suggestion__before">
                        <span className="ui-visually-hidden">{t("resumeTailor.originalPrefix")}</span>
                        {suggestion.originalText}
                      </p>
                    ) : null}
                    <p className="tailor-suggestion__after">
                      <span className="ui-visually-hidden">{t("resumeTailor.suggestionPrefix")}</span>
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
              <summary>{t("resumeTailor.tailoredResumePreview")}</summary>
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
                    {copied ? t("resumeTailor.copied") : t("resumeTailor.copyText")}
                  </Button>
                ) : null}
              </div>
            </details>
          ) : null}
        </div>

        <aside aria-label={t("resumeTailor.postingAndExports")} className="tailor-layout__aside">
          <Card aria-labelledby="tailor-gaps-title" padded>
            <h2 className="tailor-card-title" id="tailor-gaps-title">
              {t("resumeTailor.againstThePosting")}
            </h2>
            <SignalList items={analysis.missingKeywords} title={t("resumeTailor.missingKeywords")} tone="danger" />
            <SignalList items={analysis.weakSignals} sentences title={t("resumeTailor.weakSignals")} tone="warning" />
            <SignalList items={analysis.strongMatches} title={t("resumeTailor.strongMatches")} tone="success" />
            <SignalList items={analysis.recommendedFocusAreas} sentences title={t("resumeTailor.focusAreas")} tone="accent" />
          </Card>

          <Card aria-labelledby="tailor-exports-title">
            <CardHeader
              actions={
                <Button loading={exportMutation.isPending} onClick={() => exportMutation.mutate()} size="sm" variant="primary">
                  {t("resumeTailor.createPdf")}
                </Button>
              }
              title={<span id="tailor-exports-title">{t("resumeTailor.pdf")}</span>}
              titleAs="h2"
            />
            {exports.length === 0 ? (
              <CardBody>
                <p className="tailor-muted">{t("resumeTailor.createAPdfWithThe")}</p>
              </CardBody>
            ) : (
              exports.map((item) => (
                <ListRow
                  key={item.id}
                  meta={[item.createdAtLabel, item.pageCount ? t("resumeTailor.pageCount", { pageCount: item.pageCount }) : null].filter(Boolean).join(" · ")}
                  title={item.fileName}
                  trailing={
                    <Button onClick={() => void download(item.id, item.fileName)} size="sm" variant="ghost">
                      {t("resumeTailor.download")}
                    </Button>
                  }
                />
              ))
            )}
          </Card>

          {posting ? (
            <Card aria-labelledby="tailor-posting-title" padded>
              <h2 className="tailor-card-title" id="tailor-posting-title">
                {t("resumeTailor.posting")}
              </h2>
              <p className="tailor-body">{posting.title}</p>
              {posting.parsedSummary ? <p className="tailor-muted">{posting.parsedSummary}</p> : null}
              <SignalList items={posting.parsedRequirements.slice(0, 8)} sentences title={t("resumeTailor.requirements")} tone="accent" />
              {posting.sourceUrl ? (
                <a className="tailor-link" href={posting.sourceUrl} rel="noreferrer" target="_blank">
                  {t("resumeTailor.openTheOriginalPosting")}
                </a>
              ) : null}
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
