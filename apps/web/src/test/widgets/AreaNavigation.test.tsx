import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AreaNavigation } from "../../widgets/layout/AreaNavigation";
import { renderWithProviders } from "../utils";

describe("AreaNavigation", () => {
  it("lists the sections of the current area and marks the active one", () => {
    renderWithProviders(<AreaNavigation />, { route: "/review/done", locale: "ko" });

    const nav = screen.getByRole("navigation", { name: "복습 하위 메뉴" });
    expect(nav).toHaveTextContent("지금 복습완료한 질문");
    expect(screen.getByRole("link", { name: "완료한 질문" })).toHaveAttribute("aria-current", "page");
  });

  it("leaves the resume hub to its own route tabs", () => {
    const { container } = renderWithProviders(<AreaNavigation />, { route: "/resume/3/heatmap/anchors/project/31", locale: "ko" });
    expect(container).toBeEmptyDOMElement();
  });

  it("maps nested interview routes to their section", () => {
    renderWithProviders(<AreaNavigation />, { route: "/interview/records/2/transcript", locale: "ko" });

    expect(screen.getByRole("link", { name: "실전 면접 복기" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "모의면접" })).not.toHaveAttribute("aria-current");
  });

  it("prefers a static section over a parameterised one", () => {
    renderWithProviders(<AreaNavigation />, { route: "/questions/skills", locale: "ko" });

    expect(screen.getByRole("link", { name: "스킬 맵" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "질문 목록" })).not.toHaveAttribute("aria-current");
  });

  it("renders nothing for areas with a single screen", () => {
    const { container } = renderWithProviders(<AreaNavigation />, { route: "/", locale: "ko" });

    expect(container).toBeEmptyDOMElement();
  });
});
