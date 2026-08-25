import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { CommandPalette } from "../../widgets/layout/CommandPalette";
import { LocationDisplay, renderWithProviders } from "../utils";

describe("CommandPalette", () => {
  it("shows grouped workspace results and filters across product entities", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderWithProviders(
      <Routes>
        <Route
          element={
            <>
              <CommandPalette isOpen onClose={onClose} />
              <LocationDisplay />
            </>
          }
          path="/review-queue"
        />
      </Routes>,
      { route: "/review-queue" },
    );

    expect(screen.getAllByText("Questions").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Skills").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Companies").length).toBeGreaterThan(0);

    await user.type(screen.getByLabelText("Search Iterview"), "Stripe");

    expect(screen.getByText("Stripe target preparation board")).toBeInTheDocument();
    expect(screen.queryByText("Kafka incident notebook")).not.toBeInTheDocument();
  });

  it("navigates to the selected result with keyboard input", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderWithProviders(
      <Routes>
        <Route
          element={
            <>
              <CommandPalette isOpen onClose={onClose} />
              <LocationDisplay />
            </>
          }
          path="/"
        />
        <Route element={<LocationDisplay />} path="/review-queue" />
      </Routes>,
    );

    await user.type(screen.getByLabelText("Search Iterview"), "review queue");
    await user.keyboard("{Enter}");

    expect(screen.getByTestId("location-display")).toHaveTextContent("/review-queue");
    expect(onClose).toHaveBeenCalled();
  });
});
