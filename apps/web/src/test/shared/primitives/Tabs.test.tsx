import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { Segmented, Tabs } from "../../../shared/ui/primitives";

type ReviewTab = "today" | "upcoming" | "done";

function ReviewTabs() {
  const [tab, setTab] = useState<ReviewTab>("today");
  return (
    <Tabs
      items={[
        { id: "today", label: "오늘", count: 4 },
        { id: "upcoming", label: "예정", count: 11 },
        { id: "done", label: "완료" },
      ]}
      label="복습 보기"
      onChange={setTab}
      value={tab}
    >
      <p>{`panel:${tab}`}</p>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("labels the panel with the active tab and switches on click", async () => {
    render(<ReviewTabs />);

    expect(screen.getByRole("tabpanel", { name: /오늘/ })).toHaveTextContent("panel:today");
    await userEvent.setup().click(screen.getByRole("tab", { name: /예정/ }));
    expect(screen.getByRole("tab", { name: /예정/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("panel:upcoming");
  });

  it("moves focus and selection with arrow, Home, and End keys", async () => {
    const user = userEvent.setup();
    render(<ReviewTabs />);

    await user.tab();
    expect(screen.getByRole("tab", { name: /오늘/ })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "완료" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("panel:done");
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: /오늘/ })).toHaveAttribute("aria-selected", "true");
    // Only the selected tab is in the tab order.
    expect(screen.getAllByRole("tab").filter((tab) => tab.tabIndex === 0)).toHaveLength(1);
  });
});

describe("Segmented", () => {
  it("acts as a single-choice radio group", async () => {
    function ViewMode() {
      const [mode, setMode] = useState("tree");
      return (
        <Segmented
          items={[
            { id: "tree", label: "트리" },
            { id: "map", label: "맵" },
          ]}
          label="보기 방식"
          onChange={setMode}
          value={mode}
        />
      );
    }
    const user = userEvent.setup();
    render(<ViewMode />);

    expect(screen.getByRole("radiogroup", { name: "보기 방식" })).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "맵" }));
    expect(screen.getByRole("radio", { name: "맵" })).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "트리" })).toHaveFocus();
  });
});
