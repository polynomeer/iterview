import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
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
          path="/review"
        />
      </Routes>,
      { route: "/review" },
    );

    expect(screen.getAllByText("Questions").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Skills").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Resume Evidence").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Commands").length).toBeGreaterThan(0);
    // Companies and notes point at sample-data pages and stay out of the palette until they are backed by APIs.
    expect(screen.queryByText("Companies")).not.toBeInTheDocument();
    expect(screen.queryByText("Notes")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Search Iterview"), "Settlement");

    expect(screen.getByText("Settlement platform source of truth")).toBeInTheDocument();
    expect(screen.queryByText("Kafka rebalance answer draft")).not.toBeInTheDocument();
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
        <Route element={<LocationDisplay />} path="/review" />
      </Routes>,
    );

    await user.type(screen.getByLabelText("Search Iterview"), "review queue");
    await user.keyboard("{Enter}");

    expect(screen.getByTestId("location-display")).toHaveTextContent("/review");
    expect(onClose).toHaveBeenCalled();
  });

  it("navigates into another workspace family from a filtered search result", async () => {
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
        <Route element={<LocationDisplay />} path="/resume" />
      </Routes>,
    );

    await user.type(screen.getByLabelText("Search Iterview"), "Open resume");
    await user.click(screen.getByRole("option", { name: /Open resume source of truth/i }));

    expect(screen.getByTestId("location-display")).toHaveTextContent("/resume");
    expect(onClose).toHaveBeenCalled();
  });

  it("keeps focus inside the dialog and restores it when closed", async () => {
    const onClose = vi.fn();
    const { rerender } = renderWithProviders(
      <>
        <button type="button">Open command palette</button>
        <CommandPalette isOpen={false} onClose={onClose} />
      </>,
    );
    const trigger = screen.getByRole("button", { name: "Open command palette" });
    trigger.focus();

    rerender(
      <>
        <button type="button">Open command palette</button>
        <CommandPalette isOpen onClose={onClose} />
      </>,
    );

    const searchInput = screen.getByRole("combobox", { name: "Search Iterview" });
    await waitFor(() => expect(searchInput).toHaveFocus());

    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    expect(document.activeElement).toHaveAttribute("role", "option");

    rerender(
      <>
        <button type="button">Open command palette</button>
        <CommandPalette isOpen={false} onClose={onClose} />
      </>,
    );

    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
