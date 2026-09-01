import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { WeakNodesPage } from "../../pages/weak-nodes/WeakNodesPage";
import { mockMatchMedia, renderWithProviders } from "../utils";

describe("WeakNodesPage", () => {
  it("renders the diagnostic graph and connected-question inspector", () => {
    renderWithProviders(
      <Routes>
        <Route element={<WeakNodesPage />} path="/weak-nodes" />
      </Routes>,
      { route: "/weak-nodes" },
    );

    expect(screen.getByRole("heading", { name: "Weak Nodes" })).toBeInTheDocument();
    expect(screen.getByText("Weakness graph")).toBeInTheDocument();
    expect(screen.getByText("Weak Node Details")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /idempotency/i })).toHaveAttribute(
      "href",
      "/questions/distributed-lock/tree",
    );
  });

  it("switches the selected node from the graph canvas", () => {
    renderWithProviders(
      <Routes>
        <Route element={<WeakNodesPage />} path="/weak-nodes" />
      </Routes>,
      { route: "/weak-nodes" },
    );

    fireEvent.click(screen.getAllByRole("button", { name: /Kafka 리밸런스 운영 스토리/i })[1]);

    expect(screen.getByRole("link", { name: /Kafka 리밸런스 가지 다시 열기/i })).toHaveAttribute(
      "href",
      "/questions/kafka-rebalance/tree",
    );
  });

  it("renders the desktop weak-node layout when wide mode is active", () => {
    mockMatchMedia(true);

    renderWithProviders(
      <Routes>
        <Route element={<WeakNodesPage />} path="/weak-nodes" />
      </Routes>,
      { route: "/weak-nodes" },
    );

    expect(document.querySelector(".weak-node-explorer--desktop")).not.toBeNull();
  });
});
