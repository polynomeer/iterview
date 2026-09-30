import { getErrorDetails, userFacingErrorMessage } from "../../../../shared/api/errors";
import { routeConfig } from "../../../../shared/config/routes";
import { useLocale } from "../../../../shared/i18n";
import { EmptyStateCard } from "../../../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../../../shared/ui/PageContainer";

export function MissingRecordView() {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <PageContainer
      description={
        isKorean
          ? "리뷰 작업공간을 열기 전에 가져온 면접 기록을 먼저 선택하세요."
          : "Choose an imported interview record before opening the review workspace."
      }
      eyebrow={isKorean ? "실전 면접" : "Practical Interview"}
      title={isKorean ? "리뷰를 열 수 없습니다" : "Review unavailable"}
    >
      <EmptyStateCard
        action={{ label: isKorean ? "실전 면접 목록 열기" : "Open practical interviews", to: routeConfig.practicalInterviews.buildPath() }}
        body={isKorean ? "실전 면접 리뷰 경로에는 기록 식별자가 필요합니다." : "The practical interview review route needs a record id."}
        title={isKorean ? "면접 기록이 없습니다" : "Missing interview record"}
      />
    </PageContainer>
  );
}

export function ReviewLoadingView() {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <PageContainer
      description={
        isKorean
          ? "리뷰 셸, 전사, 질문 구조화, 리플레이 가이드를 불러오는 중입니다."
          : "Loading the review shell, transcript, question structuring, and replay guidance."
      }
      eyebrow={isKorean ? "실전 면접" : "Practical Interview"}
      title={isKorean ? "리뷰 작업공간 준비 중" : "Preparing review workspace"}
    >
      <LoadingStateCard
        body={
          isKorean
            ? "백엔드 리뷰 데이터 묶음과 연결된 실전 면접 데이터를 불러오는 중입니다."
            : "Loading the backend review payload and linked practical interview data."
        }
        title={isKorean ? "실전 면접 리뷰 준비 중" : "Preparing practical interview review"}
      />
    </PageContainer>
  );
}

export function ReviewLoadErrorView({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <PageContainer
      description={isKorean ? "실전 면접 리뷰를 불러오지 못했습니다." : "The practical interview review could not be loaded."}
      eyebrow={isKorean ? "실전 면접" : "Practical Interview"}
      title={isKorean ? "리뷰를 열 수 없습니다" : "Review unavailable"}
    >
      <ErrorStateCard
        body={userFacingErrorMessage(error, isKorean ? "실전 면접 리뷰를 불러오지 못했습니다." : "The practical interview review could not be loaded.")}
        details={getErrorDetails(error)}
        onAction={onRetry}
        title={isKorean ? "실전 면접 리뷰를 불러올 수 없습니다" : "Unable to load practical interview review"}
      />
    </PageContainer>
  );
}
