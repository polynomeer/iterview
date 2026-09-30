import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { Button, Dialog } from "../../../shared/ui/primitives";

function DeleteVersionFlow() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>버전 삭제</Button>
      <Dialog
        closeLabel="닫기"
        description="삭제한 버전은 되돌릴 수 없어요."
        footer={
          <>
            <Button onClick={() => setOpen(false)}>취소</Button>
            <Button onClick={() => setOpen(false)} variant="danger">
              삭제
            </Button>
          </>
        }
        onClose={() => setOpen(false)}
        open={open}
        title="이 버전을 삭제할까요?"
      />
    </>
  );
}

describe("Dialog", () => {
  it("opens as a labelled modal and focuses its first control", async () => {
    const user = userEvent.setup();
    render(<DeleteVersionFlow />);

    await user.click(screen.getByRole("button", { name: "버전 삭제" }));

    const dialog = screen.getByRole("dialog", { name: "이 버전을 삭제할까요?" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleDescription("삭제한 버전은 되돌릴 수 없어요.");
    expect(screen.getByRole("button", { name: "닫기" })).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("keeps Tab focus inside the dialog", async () => {
    const user = userEvent.setup();
    render(<DeleteVersionFlow />);
    await user.click(screen.getByRole("button", { name: "버전 삭제" }));

    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: "삭제" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "닫기" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "삭제" })).toHaveFocus();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<DeleteVersionFlow />);
    const trigger = screen.getByRole("button", { name: "버전 삭제" });

    await user.click(trigger);
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });
});
