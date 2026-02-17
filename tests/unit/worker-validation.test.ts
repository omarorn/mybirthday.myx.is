import { describe, expect, it } from "vitest";
import worker from "../../modules/mobile-app-shell/worker";

describe("worker validation guards", () => {
  it("rejects non-json content type on JSON endpoints", async () => {
    const request = new Request("https://example.com/api/rsvp", {
      method: "POST",
      headers: {
        "content-type": "text/plain",
      },
      body: JSON.stringify({
        method: "sms",
        contact: "5551234",
        attending: true,
      }),
    });

    const response = await worker.fetch(request, {});
    const payload = await response.json();

    expect(response.status).toBe(415);
    expect(payload.error).toContain("Content-Type");
  });

  it("rejects oversized JSON bodies", async () => {
    const request = new Request("https://example.com/api/rsvp", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        method: "sms",
        contact: "5551234",
        attending: true,
        note: "x".repeat(70_000),
      }),
    });

    const response = await worker.fetch(request, {});
    const payload = await response.json();

    expect(response.status).toBe(413);
    expect(payload.error).toContain("of stór");
  });

  it("rejects events where end time is before start time", async () => {
    const request = new Request("https://example.com/api/events/create", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-owner-id": "owner-1",
      },
      body: JSON.stringify({
        title: "Party",
        startTime: "2026-06-19T20:00:00.000Z",
        endTime: "2026-06-19T18:00:00.000Z",
      }),
    });

    const response = await worker.fetch(request, {});
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("Lokatími");
  });
});
