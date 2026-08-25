import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { WeakNodesPage } from "../../pages/weak-nodes/WeakNodesPage";
import { mockMatchMedia, renderWithProviders } from "../utils";

describe("WeakNodesPage", () => {
  it("renders the weak node remediation workspace with graph and evidence rail", () => {
    renderWithProviders(
      <Routes>
        <Route element={<WeakNodesPage />} path="/weak-nodes" />
      </Routes>,
      { route: "/weak-nodes" },
    );

    expect(screen.getByText("Weak node remediation workspace")).toBeInTheDocument();
    expect(screen.getByText("Repair weak branches as connected nodes, not as a flat backlog of retries")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /reopen the question branches this node lives under/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /How did you ensure idempotency in transaction processing/i })).toHaveAttribute(
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

    fireEvent.click(screen.getByRole("button", { name: /Kafka rebalance operational story/i }));

    expect(screen.getByText(/The answer names rebalancing correctly/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Reopen the Kafka rebalance branch/i })).toHaveAttribute(
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

    expect(document.querySelector(".weak-nodes-layout--desktop")).not.toBeNull();
  });
});
