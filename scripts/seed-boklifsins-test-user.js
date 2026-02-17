const SEED_BASE_URL = process.env.SEED_BASE_URL || "http://127.0.0.1:8787";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme";
const OWNER_ID = process.env.OWNER_ID || `bok-owner-${Date.now()}`;

/**
 * Story anchors derived from Bók Lífsins entries pulled during setup.
 * These are used to generate 100 custom quiz questions.
 */
const bokStoryAnchors = [
  { year: 2025, title: "Madenta Budapest — nýtt bros fyrir 50", cat: "health" },
  { year: 2024, title: "ADHD greining og meðferð", cat: "health" },
  { year: 2025, title: "Blóðþrýstingur — 358 mælingar", cat: "health" },
  { year: 2026, title: "Þyngdarferill — 142 mælingar", cat: "health" },
  { year: 2025, title: "Læknar og heilbrigðisstarfsfólk", cat: "health" },
  { year: 2025, title: "Lyf og meðferðir", cat: "health" },
  { year: 2025, title: "Rannsóknaniðurstöður og blóðprufur", cat: "health" },
  { year: 2025, title: "Fjölskyldu heilsusaga og arfgengi", cat: "family" },
  { year: 2025, title: "Markmið og heilsuáætlun 2025-2027", cat: "goals" },
  { year: 2025, title: "Hugbúnaðaráskriftir Ómars", cat: "tech" },
  { year: 2025, title: "PowerShell script safn — 100 script", cat: "tech" },
  { year: 2025, title: "Verkefni Ómars — GitHub og vefverkefni", cat: "tech" },
  { year: 2025, title: "HuggingFace Spaces & AI verkfæri", cat: "tech" },
  { year: 2025, title: "GitHub cool projects safn", cat: "tech" },
  { year: 2025, title: "Jira verkefni hjá Wise Lausnir", cat: "career" },
  { year: 2025, title: "Myndbandasmiðja — POV content", cat: "creative" },
  { year: 2025, title: "True Stories video scripts", cat: "creative" },
  { year: 2025, title: "YouTube script generator", cat: "creative" },
  { year: 2025, title: "Seven the Musical", cat: "creative" },
  { year: 2006, title: "30 ára afmælispartý", cat: "life" },
  { year: 2017, title: "omar4.0 mantran", cat: "life" },
  { year: 2002, title: "Kafli: Fjóla Dís", cat: "relationships" },
  { year: 2015, title: "Ewalina og nýja ljósið", cat: "relationships" },
  { year: 1999, title: "Tölvubransinn byrjar", cat: "career" },
  { year: 2025, title: "Fjárhagur heilsuútgjalda", cat: "finance" },
];

const questionVariants = [
  "Hvaða þema passar best við þessa færslu?",
  "Í hvaða samhengi kemur þessi færsla helst fram?",
  "Hvaða flokkur lýsir efninu best?",
  "Hvert er meginfókus þessarar færslu?",
];

const categoryOptions = [
  "heilsa og sjálfumhirða",
  "starf og tækni",
  "fjölskylda og sambönd",
  "skapandi verkefni",
];

function categoryAnswerIndex(cat) {
  if (cat === "health") return 0;
  if (cat === "career" || cat === "tech" || cat === "finance") return 1;
  if (cat === "family" || cat === "relationships" || cat === "life") return 2;
  return 3;
}

function buildQuestionBank(total = 100) {
  const out = [];
  for (let i = 0; i < total; i++) {
    const anchor = bokStoryAnchors[i % bokStoryAnchors.length];
    const variant = questionVariants[i % questionVariants.length];
    out.push({
      yr: anchor.year,
      cat: "BokLifsins",
      q: `[Bók Lífsins #${i + 1}] "${anchor.title}" — ${variant}`,
      hint: `Byggt á færslu úr Bók Lífsins (${anchor.year}).`,
      opts: categoryOptions,
      ans: categoryAnswerIndex(anchor.cat),
      exp: `Rétt svar byggir á þema færslunnar "${anchor.title}".`,
      fun: `Spurning unnin úr Bók Lífsins gagnagrunni (seed batch #${i + 1}).`,
    });
  }
  return out;
}

async function callHttp(path, init = {}) {
  return fetch(`${SEED_BASE_URL}${path}`, init);
}

async function api(path, { method = "GET", headers = {}, body } = {}) {
  const init = {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  };
  if (body !== undefined && !init.headers["content-type"]) {
    init.headers["content-type"] = "application/json";
  }
  const res = await callHttp(path, init);
  const text = await res.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { raw: text };
  }
  return { status: res.status, payload };
}

async function seed() {
  const slugBase = `bok-seed-${Date.now()}`;
  const testerName = "Bók Lífsins Stress Tester";
  const summary = {
    mode: "http",
    ownerId: OWNER_ID,
    slug: null,
    eventId: null,
    cloneEventId: null,
    quizQuestionsCreated: 0,
    quizAnswersSubmitted: 0,
    failures: [],
  };

  const hosting = await api("/api/hosting/signup", {
    method: "POST",
    body: {
      title: `${testerName} Portal`,
      instagramHandle: slugBase,
      owner: testerName,
    },
  });
  if (hosting.status >= 400) {
    throw new Error(`hosting/signup failed: ${hosting.status} ${JSON.stringify(hosting.payload)}`);
  }
  summary.slug = hosting.payload?.tenant?.slug || slugBase;

  const createdEvent = await api("/api/events/create", {
    method: "POST",
    headers: { "x-owner-id": OWNER_ID },
    body: {
      title: `${testerName} Event`,
      startTime: "2026-06-19T20:00:00.000Z",
      endTime: "2026-06-19T23:00:00.000Z",
      timezone: "Atlantic/Reykjavik",
      slug: `${summary.slug}-event`,
      description: "Extensive test event generated from Bók Lífsins seeding pipeline.",
      published: true,
    },
  });
  if (createdEvent.status >= 400) {
    throw new Error(`events/create failed: ${createdEvent.status} ${JSON.stringify(createdEvent.payload)}`);
  }
  summary.eventId = createdEvent.payload?.eventId || createdEvent.payload?.event?.id || null;

  if (summary.eventId) {
    const cloneRes = await api(`/api/events/${encodeURIComponent(summary.eventId)}/clone`, {
      method: "POST",
      headers: { "x-owner-id": OWNER_ID },
      body: { title: `${testerName} Event Clone` },
    });
    if (cloneRes.status < 400) {
      summary.cloneEventId = cloneRes.payload?.eventId || null;
    } else {
      summary.failures.push({ step: "event-clone", status: cloneRes.status, payload: cloneRes.payload });
    }
  }

  const rsvpRes = await api("/api/rsvp", {
    method: "POST",
    body: {
      method: "sms",
      contact: `${slugBase}@seed.test`,
      name: testerName,
      attending: true,
      partySize: 4,
      dietary: "No shellfish",
      note: "Generated by seed-boklifsins-test-user.js",
    },
  });
  if (rsvpRes.status >= 400) {
    summary.failures.push({ step: "rsvp", status: rsvpRes.status, payload: rsvpRes.payload });
  }

  const plannerA = await api("/api/planner/apply", {
    method: "POST",
    body: {
      slug: summary.slug,
      type: "host_add",
      applicantName: testerName,
      contact: "planner+host@test.local",
      note: "I can help host arrivals and guest flow.",
    },
  });
  if (plannerA.status >= 400) summary.failures.push({ step: "planner-host", status: plannerA.status, payload: plannerA.payload });

  const plannerB = await api("/api/planner/apply", {
    method: "POST",
    body: {
      slug: summary.slug,
      type: "surprise_help",
      applicantName: testerName,
      contact: "planner+surprise@test.local",
      note: "I can coordinate surprise moments.",
      forGuest: "Omar",
    },
  });
  if (plannerB.status >= 400) summary.failures.push({ step: "planner-surprise", status: plannerB.status, payload: plannerB.payload });

  const photoRes = await api("/api/photowall/item", {
    method: "POST",
    headers: { "x-admin-password": ADMIN_PASSWORD },
    body: {
      slug: summary.slug,
      imageUrl: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1200",
      caption: "Seed image",
      sourceUrl: "https://unsplash.com",
    },
  });
  if (photoRes.status >= 400) summary.failures.push({ step: "photowall-add", status: photoRes.status, payload: photoRes.payload });

  const selfieRes = await api(`/api/selfie/capture?slug=${encodeURIComponent(summary.slug)}`, {
    method: "POST",
    body: {
      imageData: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/",
      caption: "Seed selfie",
      submittedBy: testerName,
    },
  });
  if (selfieRes.status >= 400) summary.failures.push({ step: "selfie-capture", status: selfieRes.status, payload: selfieRes.payload });

  const karaokeUpload = await api(`/api/karaoke/upload?slug=${encodeURIComponent(summary.slug)}`, {
    method: "POST",
    body: {
      title: "Seed Karaoke Track",
      artist: "Seed Bot",
      addedBy: testerName,
      audioBase64: "U0VFRF9BVURJT19EQVRB",
    },
  });
  if (karaokeUpload.status >= 400) {
    summary.failures.push({ step: "karaoke-upload", status: karaokeUpload.status, payload: karaokeUpload.payload });
  } else {
    const songId = karaokeUpload.payload?.song?.id;
    if (songId) {
      const lyricsRes = await api(`/api/karaoke/lyrics?slug=${encodeURIComponent(summary.slug)}&id=${encodeURIComponent(songId)}`, {
        method: "POST",
        body: { lyrics: "Seeded manual lyrics from Bók Lífsins test user." },
      });
      if (lyricsRes.status >= 400) summary.failures.push({ step: "karaoke-lyrics", status: lyricsRes.status, payload: lyricsRes.payload });
    }
  }

  const questionsRes = await api("/api/quiz/questions");
  if (questionsRes.status < 400 && Array.isArray(questionsRes.payload?.questions) && questionsRes.payload.questions.length) {
    const q = questionsRes.payload.questions[0];
    const answerRes = await api("/api/quiz/answer", {
      method: "POST",
      body: {
        id: q.id,
        choice: 0,
        playerId: slugBase,
        playerName: testerName,
      },
    });
    if (answerRes.status < 400) summary.quizAnswersSubmitted += 1;
    else summary.failures.push({ step: "quiz-answer", status: answerRes.status, payload: answerRes.payload });
  }

  const generatedQuestions = buildQuestionBank(100);
  for (const question of generatedQuestions) {
    const createQ = await api("/api/quiz/admin/question", {
      method: "POST",
      headers: { "x-admin-password": ADMIN_PASSWORD },
      body: question,
    });
    if (createQ.status < 400) {
      summary.quizQuestionsCreated += 1;
    } else {
      summary.failures.push({ step: "quiz-admin-question", status: createQ.status, payload: createQ.payload, question: question.q });
    }
  }

  // Touch read APIs to ensure seeded entity visibility.
  await api(`/api/photowall?slug=${encodeURIComponent(summary.slug)}`);
  await api(`/api/selfie/list?slug=${encodeURIComponent(summary.slug)}`);
  await api(`/api/karaoke/songs?slug=${encodeURIComponent(summary.slug)}`);
  await api(`/api/planner/applications?slug=${encodeURIComponent(summary.slug)}`, {
    headers: { "x-admin-password": ADMIN_PASSWORD },
  });
  await api(`/api/admin/overview?slug=${encodeURIComponent(summary.slug)}`, {
    headers: { "x-admin-password": ADMIN_PASSWORD },
  });

  return summary;
}

seed()
  .then((summary) => {
    console.log(JSON.stringify(summary, null, 2));
    if (summary.failures.length) process.exitCode = 1;
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
