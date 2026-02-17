import { describe, expect, it } from "vitest";
import worker from "../../modules/mobile-app-shell/worker";

const jsonHeaders = { "content-type": "application/json" };

function unique(label: string): string {
  return `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function postJson(
  path: string,
  body: unknown,
  headers: Record<string, string> = {},
) {
  const request = new Request(`https://example.com${path}`, {
    method: "POST",
    headers: { ...jsonHeaders, ...headers },
    body: JSON.stringify(body),
  });
  return worker.fetch(request, {});
}

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
    const response = await postJson(
      "/api/events/create",
      {
        title: "Party",
        startTime: "2026-06-19T20:00:00.000Z",
        endTime: "2026-06-19T18:00:00.000Z",
      },
      { "x-owner-id": "owner-1" },
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("Lokatími");
  });
});

describe("critical API routes", () => {
  it("accepts valid RSVP payloads", async () => {
    const response = await postJson("/api/rsvp", {
      method: "sms",
      contact: unique("rsvp"),
      name: "Test Guest",
      attending: true,
      partySize: 2,
    });
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.record.partySize).toBe(2);
  });

  it("rejects invalid RSVP partySize", async () => {
    const response = await postJson("/api/rsvp", {
      method: "sms",
      contact: unique("rsvp"),
      attending: true,
      partySize: 99,
    });
    const payload = await response.json();
    expect(response.status).toBe(400);
    expect(payload.error).toContain("partySize");
  });

  it("creates events with valid payload", async () => {
    const response = await postJson(
      "/api/events/create",
      {
        title: unique("event"),
        startTime: "2026-06-19T20:00:00.000Z",
        endTime: "2026-06-19T23:00:00.000Z",
      },
      { "x-owner-id": unique("owner") },
    );
    const payload = await response.json();
    expect(response.status).toBe(201);
    expect(payload.success).toBe(true);
    expect(payload.event.slug).toBeTruthy();
  });

  it("validates quiz answers (success + out-of-range failure)", async () => {
    const questionsResponse = await worker.fetch(
      new Request("https://example.com/api/quiz/questions"),
      {},
    );
    const questionsPayload = await questionsResponse.json();
    const question = questionsPayload.questions[0];
    expect(question).toBeTruthy();

    const okResponse = await postJson("/api/quiz/answer", {
      id: question.id,
      choice: 0,
      playerId: unique("player"),
      playerName: "Quiz User",
    });
    const okPayload = await okResponse.json();
    expect(okResponse.status).toBe(200);
    expect(typeof okPayload.correct).toBe("boolean");

    const badResponse = await postJson("/api/quiz/answer", {
      id: question.id,
      choice: question.opts.length,
    });
    const badPayload = await badResponse.json();
    expect(badResponse.status).toBe(400);
    expect(badPayload.error).toContain("utan marka");
  });

  it("enforces admin auth and accepts valid photowall items", async () => {
    const unauthorized = await postJson("/api/photowall/item", {
      slug: unique("wall"),
      imageUrl: "https://example.com/pic.jpg",
    });
    expect(unauthorized.status).toBe(401);

    const authorized = await postJson(
      "/api/photowall/item",
      {
        slug: unique("wall"),
        imageUrl: "https://example.com/pic.jpg",
        caption: "hello",
      },
      { "x-admin-password": "changeme" },
    );
    const payload = await authorized.json();
    expect(authorized.status).toBe(201);
    expect(payload.success).toBe(true);
    expect(payload.item.imageUrl).toBe("https://example.com/pic.jpg");
  });

  it("validates planner application required fields and accepts valid submissions", async () => {
    const invalid = await postJson("/api/planner/apply", {
      slug: "omars50",
      type: "host_add",
      applicantName: "Plan User",
      contact: "test@example.com",
    });
    expect(invalid.status).toBe(400);

    const valid = await postJson("/api/planner/apply", {
      slug: "omars50",
      type: "host_add",
      applicantName: "Plan User",
      contact: "test@example.com",
      note: "I can help",
    });
    const payload = await valid.json();
    expect(valid.status).toBe(201);
    expect(payload.success).toBe(true);
    expect(payload.application.type).toBe("host_add");
  });

  it("validates hosting signup inputs and creates tenants", async () => {
    const invalid = await postJson("/api/hosting/signup", {});
    expect(invalid.status).toBe(400);

    const handle = unique("tenant");
    const valid = await postJson("/api/hosting/signup", {
      instagramHandle: handle,
      title: "Tenant Test",
    });
    const payload = await valid.json();
    expect(valid.status).toBe(201);
    expect(payload.success).toBe(true);
    expect(payload.tenant.slug).toContain("tenant");
  });
});
