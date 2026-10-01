import { getErrorDetails, userFacingErrorMessage } from "../../../../shared/api/errors";
import { Badge, Button, Card, CardHeader, ErrorState, Stat } from "../../../../shared/ui/primitives";
import type { EditorControllerProps } from "../../editorViewProps";

export function PrintPreviewTab({ ctrl }: EditorControllerProps) {
  const {
    t,
    printPreviewQuery,
  } = ctrl;

  return (
    <Card padded>
      <CardHeader title={t("resumeEditor.printPreview")} titleAs="h2" />
      {printPreviewQuery.isLoading ? (
        <p className="editor-muted" role="status">{t("resumeEditor.preparingPrintPreview")}</p>
      ) : printPreviewQuery.isError ? (
        <ErrorState
            actions={
              <Button onClick={() => void printPreviewQuery.refetch()} size="sm" variant="primary">
                {t("common.tryAgain")}
              </Button>
            }
            body={userFacingErrorMessage(printPreviewQuery.error, t("resumeEditor.unableToLoadPrintPreview"))}
            details={getErrorDetails(printPreviewQuery.error)}
            title={t("resumeEditor.unableToLoadPrintPreviewTitle")}
          />
      ) : printPreviewQuery.data ? (
        <div className="editor-stack">
          <div className="editor-stats">
            <Stat label={t("resumeEditor.pageEstimate")} value={String(printPreviewQuery.data.pageEstimate)} />
            <Stat label={t("resumeEditor.sections")} tone="accent" value={String(printPreviewQuery.data.sections.length)} />
          </div>
          <div className="editor-stack">
            {printPreviewQuery.data.pages.map((page) => (
              <article className="editor-item" key={page.pageNumber}>
                <div className="editor-head">
                  <h3 className="editor-heading">
                    {t("resumeEditor.page")} {page.pageNumber}
                  </h3>
                  <Badge>{t("resumeEditor.pageLineCount", { count: page.lineCount })}</Badge>
                </div>
                <div className="editor-chips">
                  {page.sectionKeys.map((sectionKey) => (
                    <Badge key={`${page.pageNumber}-${sectionKey}`}>{sectionKey}</Badge>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
