import { describe, expect, it } from "vitest";
import { ApiClientError, mapApiError, optionalErrorMessage, userFacingErrorMessage } from "../../../shared/api/errors";

const FALLBACK = "답변 결과를 불러오지 못했습니다.";

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

describe("userFacingErrorMessage", () => {
  it.each([400, 409, 422, 429])("keeps the server message for actionable %s responses", (status) => {
    const error = new ApiClientError(status, "이메일 형식이 올바르지 않습니다.");

    expect(userFacingErrorMessage(error, FALLBACK)).toBe("이메일 형식이 올바르지 않습니다.");
  });

  it.each([401, 403, 404, 500, 503])("replaces raw server text for %s responses with the screen fallback", (status) => {
    const error = new ApiClientError(status, "Answer attempt not found: 1");

    expect(userFacingErrorMessage(error, FALLBACK)).toBe(FALLBACK);
  });

  it("uses the fallback for network and timeout errors", () => {
    expect(userFacingErrorMessage(new TypeError("Failed to fetch"), FALLBACK)).toBe(FALLBACK);
    expect(userFacingErrorMessage(new DOMException("Request timed out", "TimeoutError"), FALLBACK)).toBe(FALLBACK);
  });

  it("uses the fallback when an actionable response has an empty message", () => {
    expect(userFacingErrorMessage(new ApiClientError(400, "  "), FALLBACK)).toBe(FALLBACK);
  });
});

describe("optionalErrorMessage", () => {
  it("returns null when there is nothing to show", () => {
    expect(optionalErrorMessage(null, FALLBACK)).toBeNull();
    expect(optionalErrorMessage(undefined, FALLBACK)).toBeNull();
  });

  it("never hides an error that is not actionable", () => {
    expect(optionalErrorMessage(new ApiClientError(500, "NullPointerException"), FALLBACK)).toBe(FALLBACK);
  });
});
