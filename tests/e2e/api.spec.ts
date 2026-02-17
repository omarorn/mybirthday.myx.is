import { test, expect } from "@playwright/test";

test.describe("API smoke tests", () => {
  test("GET /api/rsvp/stats returns valid JSON", async ({ request }) => {
    const response = await request.get("/api/rsvp/stats");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("total");
    expect(body).toHaveProperty("attendingYes");
  });

  test("GET /api/quiz/questions returns questions", async ({ request }) => {
    const response = await request.get("/api/quiz/questions");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.total).toBeGreaterThan(0);
    expect(Array.isArray(body.questions)).toBe(true);
    expect(body.questions[0]).toHaveProperty("q");
    expect(body.questions[0]).toHaveProperty("opts");
    // answer (ans) should be stripped from public response
    expect(body.questions[0]).not.toHaveProperty("ans");
  });

  test("POST /api/quiz/answer returns correct/incorrect", async ({
    request,
  }) => {
    // Fetch a question first to get a valid id
    const qRes = await request.get("/api/quiz/questions");
    const { questions } = await qRes.json();
    const q = questions[0];

    const response = await request.post("/api/quiz/answer", {
      data: { id: q.id, choice: 0 },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("correct");
    expect(body).toHaveProperty("correctIndex");
    expect(body).toHaveProperty("gamification");
    expect(typeof body.gamification.pointsEarned).toBe("number");
  });

  test("GET /api/quiz/leaderboard returns array", async ({ request }) => {
    const response = await request.get("/api/quiz/leaderboard");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.leaderboard)).toBe(true);
  });

  test("GET unknown API returns 404", async ({ request }) => {
    const response = await request.get("/api/nonexistent");
    expect(response.status()).toBe(404);
  });

  test("POST /api/events/create requires auth", async ({ request }) => {
    const response = await request.post("/api/events/create", {
      data: { title: "Test", startTime: "2026-03-01T12:00:00Z" },
    });
    expect(response.status()).toBe(401);
  });

  test("GET /api/karaoke/songs returns song list", async ({ request }) => {
    const response = await request.get("/api/karaoke/songs?slug=omars50");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("slug", "omars50");
    expect(Array.isArray(body.songs)).toBe(true);
  });
});
