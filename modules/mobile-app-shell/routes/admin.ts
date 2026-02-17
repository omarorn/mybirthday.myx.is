/**
 * Admin overview route handler.
 */

import type { Env } from "../types";
import { json, slugify, isAdmin } from "../helpers";
import { loadAllRsvps } from "./rsvp";
import { loadQuizSummary, loadRecentAnswers } from "./quiz";
import { loadPlannerApplications } from "./planner";

// ── Route handler ───────────────────────────────────────────────

export async function handleAdminRoutes(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response | null> {
  if (url.pathname === "/api/admin/overview" && request.method === "GET") {
    if (!isAdmin(request, env))
      return json({ error: "Aðgangur ekki leyfður" }, 401);
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const rsvps = (await loadAllRsvps(env)).sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
    const attending = rsvps.filter((r) => r.attending);
    const notAttending = rsvps.filter((r) => !r.attending);
    const totalHeads = attending.reduce(
      (sum, r) => sum + (r.partySize ?? 1),
      0,
    );
    const summary = await loadQuizSummary(env);
    const recent = await loadRecentAnswers(env);
    const plannerItems = await loadPlannerApplications(env, slug);
    const questionEntries = Object.entries(summary.questionStats).map(
      ([id, s]) => ({
        id: Number(id),
        total: s.total,
        correct: s.correct,
        accuracy: s.total ? s.correct / s.total : 0,
        optionCounts: s.optionCounts,
      }),
    );
    const hardest = questionEntries
      .filter((x) => x.total > 0)
      .sort((a, b) => a.accuracy - b.accuracy)[0];
    return json({
      generatedAt: new Date().toISOString(),
      attendees: {
        totalInvitedResponses: rsvps.length,
        attending: attending.length,
        notAttending: notAttending.length,
        totalHeads,
        humor:
          totalHeads > 40
            ? "Big party energy detected. DJ on standby."
            : "Still room on the dance floor.",
        list: rsvps,
      },
      quiz: {
        totalAnswers: summary.totalAnswers,
        totalCorrect: summary.totalCorrect,
        overallAccuracy: summary.totalAnswers
          ? summary.totalCorrect / summary.totalAnswers
          : 0,
        hardestQuestionId: hardest?.id ?? null,
        byQuestion: questionEntries,
        recentAnswers: recent,
      },
      planner: {
        slug,
        total: plannerItems.length,
        hostAdds: plannerItems.filter((x) => x.type === "host_add").length,
        surpriseHelps: plannerItems.filter(
          (x) => x.type === "surprise_help",
        ).length,
        recent: plannerItems.slice(0, 12),
      },
    });
  }

  return null;
}
