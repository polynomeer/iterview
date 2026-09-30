import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Field, Input, Textarea } from "../../../shared/ui/primitives";

describe("Field", () => {
  it("links the label and hint to the control", () => {
    render(
      <Field hint="가입한 이메일을 입력하세요." label="이메일">
        {(control) => <Input {...control} type="email" />}
      </Field>,
    );

    const input = screen.getByLabelText("이메일");
    expect(input).toHaveAccessibleDescription("가입한 이메일을 입력하세요.");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("marks the control invalid and announces the error", () => {
    render(
      <Field error="비밀번호는 8자 이상이어야 합니다." hint="영문과 숫자를 섞어 주세요." label="비밀번호">
        {(control) => <Input {...control} type="password" />}
      </Field>,
    );

    const input = screen.getByLabelText("비밀번호");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("영문과 숫자를 섞어 주세요. 비밀번호는 8자 이상이어야 합니다.");
    expect(screen.getByRole("alert")).toHaveTextContent("비밀번호는 8자 이상이어야 합니다.");
  });

  it("supports multi-line controls", () => {
    render(<Field label="답변">{(control) => <Textarea {...control} />}</Field>);

    expect(screen.getByLabelText("답변").tagName).toBe("TEXTAREA");
  });
});
