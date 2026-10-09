import { afterEach, describe, expect, it, vi } from "vitest";
import { browserTimeZone, httpClient } from "../../../shared/api/httpClient";

describe("httpClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the browser's time zone so the API dates today in it", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await httpClient.get("/api/home");

    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.get("X-Time-Zone")).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
    expect(browserTimeZone()).toBe(headers.get("X-Time-Zone"));
  });
});
