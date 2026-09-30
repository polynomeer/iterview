import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon } from "../../../shared/ui/primitives";

describe("Icon", () => {
  it("is hidden from assistive technology when decorative", () => {
    const { container } = render(<Icon name="today" />);
    const svg = container.querySelector("svg")!;

    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("stroke", "currentColor");
    expect(svg.querySelectorAll("path").length).toBeGreaterThan(0);
  });

  it("exposes an image role when labelled", () => {
    render(<Icon label="복습" name="review" size={24} />);

    const icon = screen.getByRole("img", { name: "복습" });
    expect(icon).toHaveAttribute("width", "24");
  });
});
