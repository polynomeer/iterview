import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge, Callout, Card, CardBody, CardHeader, ListRow, PageSkeleton, Progress, Skeleton, Stat } from "../../../shared/ui/primitives";

describe("display primitives", () => {
  it("pairs badge color with visible text", () => {
    render(
      <Badge dot tone="danger">
        약점 · 42
      </Badge>,
    );

    expect(screen.getByText("약점 · 42")).toHaveClass("ui-badge", "ui-badge--danger");
  });

  it("renders a card with a heading and list rows", () => {
    render(
      <Card aria-labelledby="due">
        <CardHeader title={<span id="due">복습할 질문</span>} />
        <CardBody>
          <ListRow meta="Spring · 지난 점수 42" title="Self-invocation 시 트랜잭션" trailing={<Badge tone="danger">오늘</Badge>} />
        </CardBody>
      </Card>,
    );

    expect(screen.getByRole("region", { name: "복습할 질문" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "복습할 질문" })).toBeInTheDocument();
    expect(screen.getByText("Spring · 지난 점수 42")).toBeInTheDocument();
  });

  it("shows a stat delta in words, not only color", () => {
    render(<Stat delta={{ label: "+7 지난주 대비", direction: "up" }} label="평균 점수" value={68} />);

    expect(screen.getByText("+7 지난주 대비")).toHaveClass("ui-tone-text--success");
  });

  it("exposes progress as an accessible progressbar and clamps the value", () => {
    render(<Progress label="숙달도" tone="warning" value={140} />);

    const bar = screen.getByRole("progressbar", { name: "숙달도" });
    expect(bar).toHaveAttribute("aria-valuenow", "100");
  });

  it("announces danger callouts", () => {
    render(
      <Callout title="평가를 불러오지 못했어요." tone="danger">
        다시 시도하세요.
      </Callout>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("평가를 불러오지 못했어요.");
  });

  it("hides skeletons from assistive technology", () => {
    const { container } = render(<Skeleton height="22px" width="60%" />);

    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("announces a page skeleton as a busy status without exposing placeholder shapes", () => {
    render(<PageSkeleton label="화면을 여는 중" />);

    const status = screen.getByRole("status", { name: "" });
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(status).toHaveTextContent("화면을 여는 중");
  });
});
