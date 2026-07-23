import { describe, expect, it } from "vitest";
import { mapApiError } from "../../../shared/api/errors";

describe("mapApiError", () => {
  it("extracts nested message content from object-shaped payload fields", () => {
    const error = mapApiError(400, {
      message: {
        message: "Email is required.",
      },
    });

    expect(error.message).toBe("Email is required.");
  });

  it("falls back to nested object values instead of stringifying the object", () => {
    const error = mapApiError(400, {
      error: {
        reason: "Password is too short.",
      },
    });

    expect(error.message).toBe("Password is too short.");
  });
});
