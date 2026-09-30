import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, EmptyState, ErrorState } from "../../../shared/ui/primitives";

describe("state primitives", () => {
  it("announces empty states politely", () => {
    render(<EmptyState actions={<Button variant="primary">이력서 올리기</Button>} body="PDF를 올리면 예상 질문을 만들어 드려요." title="아직 이력서가 없어요" />);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(screen.getByRole("heading", { name: "아직 이력서가 없어요" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이력서 올리기" })).toBeInTheDocument();
  });

  it("announces errors assertively and lists details", () => {
    render(<ErrorState details={["email: 이메일 형식이 올바르지 않습니다."]} title="저장하지 못했어요" />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveTextContent("email: 이메일 형식이 올바르지 않습니다.");
  });

  it("uses the page's h1 when the state is the whole page", () => {
    render(<ErrorState size="page" title="페이지를 찾을 수 없어요" />);

    expect(screen.getByRole("heading", { level: 1, name: "페이지를 찾을 수 없어요" })).toBeInTheDocument();
  });
});
