import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AreaNavigation } from "../../widgets/layout/AreaNavigation";
import { renderWithProviders } from "../utils";

describe("AreaNavigation", () => {
  it("lists the sections of the current area and marks the active one", () => {
    renderWithProviders(<AreaNavigation />, { route: "/resume/3/heatmap/anchors/project/31", locale: "ko" });

    const nav = screen.getByRole("navigation", { name: "이력서 하위 메뉴" });
    expect(nav).toHaveTextContent("버전 관리이력서 분석공고 맞춤");
    expect(screen.getByRole("link", { name: "버전 관리" })).toHaveAttribute("aria-current", "page");
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
