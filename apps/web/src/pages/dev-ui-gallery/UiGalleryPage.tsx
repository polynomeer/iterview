import "./uiGallery.css";
import { useState } from "react";
import {
  Badge,
  Button,
  ButtonLink,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Dialog,
  EmptyState,
  ErrorState,
  Field,
  Icon,
  IconButton,
  Input,
  ListRow,
  Progress,
  Segmented,
  Select,
  Skeleton,
  Stat,
  Tabs,
  Textarea,
  type IconName,
} from "../../shared/ui/primitives";

const ICONS: IconName[] = [
  "today", "questions", "review", "resume", "interview", "analysis", "skills", "archive", "feed", "settings",
  "profile", "login", "signup", "logout", "search", "close", "check", "alert", "info", "chevronRight", "arrowRight", "plus", "more",
];

/** Development-only reference for the shared primitives (not routed in production builds). */
export function UiGalleryPage() {
  const [tab, setTab] = useState<"today" | "upcoming" | "done">("today");
  const [view, setView] = useState<"tree" | "map" | "list">("tree");
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="ui-gallery">
      <header className="ui-gallery__header">
        <h1 className="ui-gallery__title">UI primitives</h1>
        <p className="ui-gallery__lead">Tokens: src/shared/theme/tokens.css · Components: src/shared/ui/primitives</p>
      </header>

      <Card aria-label="Buttons" padded>
        <div className="ui-gallery__row">
          <Button icon="plus" variant="primary">답변 시작</Button>
          <Button>나중에</Button>
          <Button variant="ghost">건너뛰기</Button>
          <Button variant="danger">삭제</Button>
          <Button loading variant="primary">제출 중</Button>
          <Button disabled>비활성</Button>
          <ButtonLink to="/" size="sm">오늘로</ButtonLink>
          <IconButton icon="more" label="더보기" variant="secondary" />
        </div>
      </Card>

      <Card aria-label="Badges and icons" padded>
        <div className="ui-gallery__row">
          <Badge>미답변</Badge>
          <Badge dot tone="accent">진행 중</Badge>
          <Badge dot tone="success">숙달 · 86</Badge>
          <Badge dot tone="warning">보완 · 64</Badge>
          <Badge dot tone="danger">약점 · 42</Badge>
        </div>
        <div className="ui-gallery__row">
          {ICONS.map((name) => (
            <span className="ui-gallery__icon" key={name} title={name}>
              <Icon name={name} size={20} />
            </span>
          ))}
        </div>
      </Card>

      <div className="ui-gallery__grid">
        <Card aria-label="Fields" padded>
          <div className="ui-gallery__stack">
            <Field hint="가입한 이메일을 입력하세요." label="이메일">
              {(control) => <Input {...control} placeholder="name@example.com" type="email" />}
            </Field>
            <Field error="비밀번호는 8자 이상이어야 합니다." label="비밀번호">
              {(control) => <Input {...control} defaultValue="12345" type="password" />}
            </Field>
            <Field label="경력">
              {(control) => (
                <Select {...control} defaultValue="4">
                  <option value="4">4년차</option>
                  <option value="5">5년차</option>
                </Select>
              )}
            </Field>
            <Field label="답변">{(control) => <Textarea {...control} defaultValue="Spring의 @Transactional은 프록시 기반 AOP로 동작합니다." />}</Field>
          </div>
        </Card>

        <Card aria-labelledby="gallery-review">
          <CardHeader actions={<Badge tone="danger">4</Badge>} title={<span id="gallery-review">복습할 질문</span>} />
          <ListRow meta="Spring · 지난 점수 42 · 오늘" title="Self-invocation 시 @Transactional이 무시되는 이유" trailing={<Button size="sm">다시 답하기</Button>} />
          <ListRow meta="분산 시스템 · 지난 점수 51" title="Redis 분산 락이 만료될 때 발생하는 문제" trailing={<Button size="sm">다시 답하기</Button>} />
          <CardBody>
            <div className="ui-gallery__stats">
              <Stat delta={{ label: "+5 지난주 대비", direction: "up" }} label="답변" value={14} />
              <Stat delta={{ label: "-3", direction: "down" }} label="평균 점수" tone="warning" value={61} />
            </div>
            <Progress label="데이터베이스 숙달도" tone="danger" value={47} />
          </CardBody>
        </Card>
      </div>

      <Card aria-label="Tabs" padded>
        <Tabs
          items={[
            { id: "today", label: "오늘", count: 4 },
            { id: "upcoming", label: "예정", count: 11 },
            { id: "done", label: "완료", count: 23 },
          ]}
          label="복습 보기"
          onChange={setTab}
          value={tab}
        >
          <div className="ui-gallery__row">
            <Segmented
              items={[
                { id: "tree", label: "트리" },
                { id: "map", label: "맵" },
                { id: "list", label: "목록" },
              ]}
              label="보기 방식"
              onChange={setView}
              value={view}
            />
            <Button onClick={() => setDialogOpen(true)}>Dialog 열기</Button>
          </div>
        </Tabs>
      </Card>

      <div className="ui-gallery__grid">
        <Callout title="지난 피드백">해결 사례를 붙여보세요.</Callout>
        <Callout tone="danger" title="평가를 불러오지 못했어요.">네트워크를 확인한 뒤 다시 시도하세요.</Callout>
      </div>

      <div className="ui-gallery__grid">
        <Card padded>
          <EmptyState actions={<Button variant="primary">이력서 올리기</Button>} body="PDF를 올리면 예상 질문을 만들어 드려요." title="아직 이력서가 없어요" />
        </Card>
        <Card padded>
          <ErrorState actions={<Button>다시 시도</Button>} body="잠시 후 다시 시도하세요." title="평가를 불러오지 못했어요" />
        </Card>
      </div>

      <Card aria-label="Skeleton" padded>
        <div className="ui-gallery__stack">
          <Skeleton width="40%" />
          <Skeleton height="1.5rem" width="80%" />
        </div>
      </Card>

      <Dialog
        closeLabel="닫기"
        description="삭제한 버전은 되돌릴 수 없어요."
        footer={
          <>
            <Button onClick={() => setDialogOpen(false)}>취소</Button>
            <Button onClick={() => setDialogOpen(false)} variant="danger">삭제</Button>
          </>
        }
        onClose={() => setDialogOpen(false)}
        open={dialogOpen}
        title="이 버전을 삭제할까요?"
      />
    </div>
  );
}
