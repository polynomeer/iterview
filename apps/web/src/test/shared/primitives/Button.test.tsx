import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Button, ButtonLink, IconButton } from "../../../shared/ui/primitives";

describe("Button", () => {
  it("defaults to a secondary, non-submitting button", () => {
    render(<Button>나중에</Button>);

    const button = screen.getByRole("button", { name: "나중에" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("ui-button", "ui-button--secondary", "ui-button--md");
  });

  it("blocks clicks and announces progress while loading", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick} variant="primary">
        제출
      </Button>,
    );

    const button = screen.getByRole("button", { name: "제출" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    await userEvent.setup().click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders navigation as a link with button styling", () => {
    render(
      <MemoryRouter>
        <ButtonLink to="/questions/1/answer" variant="primary">
          답변 시작
        </ButtonLink>
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: "답변 시작" });
    expect(link).toHaveAttribute("href", "/questions/1/answer");
    expect(link).toHaveClass("ui-button--primary");
  });

  it("requires an accessible name for icon-only buttons", () => {
    render(<IconButton icon="close" label="닫기" />);

    expect(screen.getByRole("button", { name: "닫기" })).toHaveClass("ui-icon-button", "ui-button--ghost");
  });
});
