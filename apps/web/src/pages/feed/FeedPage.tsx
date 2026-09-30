import { useFeedQuery } from "../../features/feed/api/useFeedQuery";
import { ApiClientError, getErrorDetails, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { Badge, Button, ButtonLink, Card, CardHeader, EmptyState, ErrorState, ListRow, PageHeader, PageSkeleton } from "../../shared/ui/primitives";
import "./explore.css";

/** 둘러보기: popular, trending, and target-company questions, each linking into the question workspace. */
export function FeedPage() {
  const { t } = useLocale();
  const feedQuery = useFeedQuery();
  const sections = feedQuery.data?.sections ?? [];
  const header = <PageHeader description={t("explore.description")} title={t("explore.title")} />;
  const browse = (
    <ButtonLink to={routeConfig.practice.buildPath()} variant="ghost">
      {t("explore.browse")}
    </ButtonLink>
  );

  if (feedQuery.isLoading) {
    return <PageSkeleton label={t("explore.loading")} />;
  }

  if (feedQuery.isError) {
    const unauthorized = feedQuery.error instanceof ApiClientError && feedQuery.error.status === 401;
    return (
      <div className="ui-page">
        {header}
        {unauthorized ? (
          <EmptyState
            actions={
              <>
                <ButtonLink to={routeConfig.login.buildPath()} variant="primary">
                  {t("explore.login")}
                </ButtonLink>
                {browse}
              </>
            }
            body={t("explore.authBody")}
            icon="login"
            title={t("explore.authTitle")}
          />
        ) : (
          <ErrorState
            actions={
              <Button onClick={() => void feedQuery.refetch()} variant="primary">
                {t("common.tryAgain")}
              </Button>
            }
            body={userFacingErrorMessage(feedQuery.error, t("explore.loadErrorBody"))}
            details={getErrorDetails(feedQuery.error)}
            title={t("explore.loadErrorTitle")}
          />
        )}
      </div>
    );
  }

  return (
    <div className="ui-page">
      {header}
      {sections.every((section) => section.items.length === 0) ? (
        <EmptyState actions={browse} body={t("explore.emptyBody")} title={t("explore.emptyTitle")} />
      ) : (
        <div className="explore-grid">
          {sections
            .filter((section) => section.items.length > 0)
            .map((section) => (
              <Card aria-labelledby={`explore-${section.id}`} key={section.id}>
                <CardHeader title={<span id={`explore-${section.id}`}>{section.title}</span>} titleAs="h2" />
                {section.items.map((item) => (
                  <ListRow
                    key={item.id}
                    meta={
                      <span className="explore-meta">
                        {[item.categoryLabel, item.difficultyLabel].filter(Boolean).join(" · ")}
                        {item.companyLabels.slice(0, 2).map((company) => (
                          <Badge key={company}>{company}</Badge>
                        ))}
                      </span>
                    }
                    title={item.title}
                    trailing={
                      <ButtonLink size="sm" to={routeConfig.questionDetail.buildPath({ questionId: item.id })} variant="ghost">
                        {t("explore.open")}
                      </ButtonLink>
                    }
                  />
                ))}
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
