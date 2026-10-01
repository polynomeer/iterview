import { useState } from "react";
import { Link } from "react-router-dom";
import { useLibraryQuery } from "../../features/library/api/useLibraryQuery";
import { getErrorDetails, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { formatApiDate } from "../../shared/lib/date";
import { difficultyLabel } from "../../shared/lib/labels";
import type { LibraryQuestionDto } from "../../shared/types/library";
import { Badge, Button, ButtonLink, Card, EmptyState, ErrorState, PageHeader, PageSkeleton, Tabs } from "../../shared/ui/primitives";
import "./library.css";

type LibraryTab = "bookmarks" | "notes" | "materials";

function QuestionMeta({ question }: { question: LibraryQuestionDto }) {
  const { locale } = useLocale();
  const difficulty = difficultyLabel(question.difficultyLevel, locale);
  return (
    <>
      {question.categoryName ? <span>{question.categoryName}</span> : null}
      {difficulty ? <Badge>{difficulty}</Badge> : null}
    </>
  );
}

function QuestionLink({ question }: { question: LibraryQuestionDto }) {
  return (
    <Link className="library-item__title" to={routeConfig.questionDetail.buildPath({ questionId: String(question.questionId) })}>
      {question.title}
    </Link>
  );
}

/** 보관함 (ADR 0083): saved questions, your notes, and the reading linked to them. */
export function LibraryPage() {
  const { t } = useLocale();
  const libraryQuery = useLibraryQuery();
  const [tab, setTab] = useState<LibraryTab>("bookmarks");
  const header = <PageHeader description={t("library.pageDescription")} title={t("library.pageTitle")} />;

  if (libraryQuery.isLoading) {
    return <PageSkeleton label={t("library.loading")} />;
  }

  if (libraryQuery.isError || !libraryQuery.data) {
    return (
      <ErrorState
        actions={
          <Button onClick={() => void libraryQuery.refetch()} variant="primary">
            {t("common.tryAgain")}
          </Button>
        }
        body={userFacingErrorMessage(libraryQuery.error, t("library.loadErrorBody"))}
        details={getErrorDetails(libraryQuery.error)}
        size="page"
        title={t("library.loadErrorTitle")}
      />
    );
  }

  const { bookmarks, notes, materials } = libraryQuery.data;

  if (bookmarks.length === 0 && notes.length === 0) {
    return (
      <div className="ui-page library">
        {header}
        <EmptyState
          actions={
            <ButtonLink to={routeConfig.practice.buildPath()} variant="primary">
              {t("library.browseQuestions")}
            </ButtonLink>
          }
          body={t("library.emptyBody")}
          icon="bookmark"
          title={t("library.emptyTitle")}
        />
      </div>
    );
  }

  return (
    <div className="ui-page library">
      {header}
      <Card>
        <Tabs
          items={[
            { id: "bookmarks", label: t("library.tabBookmarks"), count: bookmarks.length },
            { id: "notes", label: t("library.tabNotes"), count: notes.length },
            { id: "materials", label: t("library.tabMaterials"), count: materials.length },
          ]}
          label={t("library.views")}
          onChange={setTab}
          value={tab}
        >
          {tab === "bookmarks" ? (
            bookmarks.length === 0 ? (
              <p className="library__empty">{t("library.noBookmarks")}</p>
            ) : (
              <ul className="library-list">
                {bookmarks.map((item) => (
                  <li className="library-item" key={item.question.questionId}>
                    <QuestionLink question={item.question} />
                    <p className="library-item__meta">
                      <QuestionMeta question={item.question} />
                      <span>{t("library.savedOn", { date: formatApiDate(item.bookmarkedAt) ?? "" })}</span>
                      {item.hasNote ? <Badge tone="accent">{t("library.hasNote")}</Badge> : null}
                    </p>
                  </li>
                ))}
              </ul>
            )
          ) : null}

          {tab === "notes" ? (
            notes.length === 0 ? (
              <p className="library__empty">{t("library.noNotes")}</p>
            ) : (
              <ul className="library-list">
                {notes.map((item) => (
                  <li className="library-item" key={item.question.questionId}>
                    <QuestionLink question={item.question} />
                    <p className="library-item__note">{item.body}</p>
                    <p className="library-item__meta">
                      <QuestionMeta question={item.question} />
                      <span>{t("library.editedOn", { date: formatApiDate(item.updatedAt) ?? "" })}</span>
                      {item.bookmarked ? <Badge tone="accent">{t("library.saved")}</Badge> : null}
                    </p>
                  </li>
                ))}
              </ul>
            )
          ) : null}

          {tab === "materials" ? (
            materials.length === 0 ? (
              <p className="library__empty">{t("library.noMaterials")}</p>
            ) : (
              <ul className="library-list">
                {materials.map((item) => (
                  <li className="library-item library-item--row" key={item.materialId}>
                    <div className="library-item__main">
                      <span className="library-item__title">{item.title}</span>
                      <p className="library-item__meta">
                        <Badge>{item.materialType}</Badge>
                        {item.sourceName ? <span>{item.sourceName}</span> : null}
                        {item.estimatedMinutes ? <span>{t("library.minutes", { count: item.estimatedMinutes })}</span> : null}
                      </p>
                      <Link className="library-item__question" to={routeConfig.questionDetail.buildPath({ questionId: String(item.question.questionId) })}>
                        {t("library.forQuestion", { title: item.question.title })}
                      </Link>
                    </div>
                    {item.contentUrl ? (
                      <a className="ui-button ui-button--ghost ui-button--sm" href={item.contentUrl} rel="noreferrer" target="_blank">
                        {t("library.open")}
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            )
          ) : null}
        </Tabs>
      </Card>
    </div>
  );
}
