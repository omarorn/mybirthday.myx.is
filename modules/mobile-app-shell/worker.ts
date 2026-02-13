/**
 * It's My Birthday - Cloudflare Worker
 * Landing page + RSVP APIs.
 */

// @ts-ignore Wrangler bundles HTML imports
import HTML from './index.html';
import { quizQuestions, type QuizQuestion } from './quizData';

interface RsvpRecord {
  id: string;
  name: string;
  contact: string;
  method: 'sms' | 'google';
  attending: boolean;
  partySize?: number;
  plusOne?: string;
  dietary?: string;
  note?: string;
  updatedAt: string;
}

interface QuizSummary {
  totalAnswers: number;
  totalCorrect: number;
  questionStats: Record<
    string,
    {
      total: number;
      correct: number;
      optionCounts: number[];
    }
  >;
}

interface QuizRecentAnswer {
  ts: string;
  questionId: number;
  choice: number;
  correct: boolean;
  playerId: string;
  playerName: string;
}

interface Env {
  QUIZ_DATA?: KVNamespace;
  ADMIN_PASSWORD?: string;
}

interface TenantConfig {
  slug: string;
  title: string;
  hashtag: string;
  instagramHandle?: string;
  owner?: string;
  createdAt: string;
}

interface PhotoWallItem {
  id: string;
  slug: string;
  imageUrl: string;
  caption?: string;
  sourceUrl?: string;
  addedAt: string;
}

const memoryStore = new Map<string, RsvpRecord>();
const memoryCustomQuestions = new Map<number, QuizQuestion>();
let memoryQuizSummary: QuizSummary = { totalAnswers: 0, totalCorrect: 0, questionStats: {} };
let memoryRecentAnswers: QuizRecentAnswer[] = [];
const memoryTenants = new Map<string, TenantConfig>();
const memoryPhotoWall = new Map<string, PhotoWallItem[]>();

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

function normalizeId(method: string, contact: string): string {
  return `${method}:${contact.trim().toLowerCase()}`;
}

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[#@]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function getSlugFromPath(pathname: string): string | null {
  const first = pathname.split('/').filter(Boolean)[0];
  if (!first) return null;
  if (first === 'api') return null;
  if (!/^[a-z0-9-]{3,40}$/.test(first)) return null;
  return first;
}

function sanitizeQuestions(questions: QuizQuestion[]) {
  return questions.map((q) => ({
    id: q.id,
    yr: q.yr,
    cat: q.cat,
    q: q.q,
    hint: q.hint,
    opts: q.opts,
    exp: q.exp,
    fun: q.fun,
  }));
}

async function loadCustomQuizQuestions(env: Env): Promise<QuizQuestion[]> {
  if (!env.QUIZ_DATA) {
    return Array.from(memoryCustomQuestions.values());
  }
  const listed = await env.QUIZ_DATA.list({ prefix: 'quiz_custom:' });
  const records = await Promise.all(
    listed.keys.map(async (key) => {
      const raw = await env.QUIZ_DATA!.get(key.name);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as QuizQuestion;
      } catch {
        return null;
      }
    }),
  );
  return records.filter(Boolean) as QuizQuestion[];
}

async function saveCustomQuizQuestion(env: Env, question: QuizQuestion): Promise<void> {
  memoryCustomQuestions.set(question.id, question);
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put(`quiz_custom:${question.id}`, JSON.stringify(question));
  }
}

async function deleteCustomQuizQuestion(env: Env, id: number): Promise<void> {
  memoryCustomQuestions.delete(id);
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.delete(`quiz_custom:${id}`);
  }
}

async function getAllQuestions(env: Env): Promise<QuizQuestion[]> {
  const custom = await loadCustomQuizQuestions(env);
  return [...quizQuestions, ...custom].sort((a, b) => a.id - b.id);
}

function isAdmin(request: Request, env: Env): boolean {
  const expected = env.ADMIN_PASSWORD ?? 'changeme';
  const provided = request.headers.get('x-admin-password') ?? '';
  return safeCompare(expected, provided);
}

async function saveRsvp(env: Env, record: RsvpRecord): Promise<void> {
  memoryStore.set(record.id, record);
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put(`rsvp:${record.id}`, JSON.stringify(record));
  }
}

async function loadAllRsvps(env: Env): Promise<RsvpRecord[]> {
  if (!env.QUIZ_DATA) return Array.from(memoryStore.values());

  const listed = await env.QUIZ_DATA.list({ prefix: 'rsvp:' });
  const records = await Promise.all(
    listed.keys.map(async (key) => {
      const raw = await env.QUIZ_DATA!.get(key.name);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as RsvpRecord;
      } catch {
        return null;
      }
    }),
  );
  return records.filter(Boolean) as RsvpRecord[];
}

async function loadQuizSummary(env: Env): Promise<QuizSummary> {
  if (!env.QUIZ_DATA) return memoryQuizSummary;
  const raw = await env.QUIZ_DATA.get('quiz_stats:summary');
  if (!raw) return memoryQuizSummary;
  try {
    return JSON.parse(raw) as QuizSummary;
  } catch {
    return memoryQuizSummary;
  }
}

async function saveQuizSummary(env: Env, summary: QuizSummary): Promise<void> {
  memoryQuizSummary = summary;
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put('quiz_stats:summary', JSON.stringify(summary));
  }
}

async function loadRecentAnswers(env: Env): Promise<QuizRecentAnswer[]> {
  if (!env.QUIZ_DATA) return memoryRecentAnswers;
  const raw = await env.QUIZ_DATA.get('quiz_stats:recent_answers');
  if (!raw) return memoryRecentAnswers;
  try {
    return JSON.parse(raw) as QuizRecentAnswer[];
  } catch {
    return memoryRecentAnswers;
  }
}

async function saveRecentAnswers(env: Env, answers: QuizRecentAnswer[]): Promise<void> {
  memoryRecentAnswers = answers;
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put('quiz_stats:recent_answers', JSON.stringify(answers));
  }
}

async function loadTenant(env: Env, slug: string): Promise<TenantConfig | null> {
  if (!env.QUIZ_DATA) return memoryTenants.get(slug) ?? null;
  const raw = await env.QUIZ_DATA.get(`tenant:${slug}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TenantConfig;
  } catch {
    return null;
  }
}

async function saveTenant(env: Env, tenant: TenantConfig): Promise<void> {
  memoryTenants.set(tenant.slug, tenant);
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put(`tenant:${tenant.slug}`, JSON.stringify(tenant));
  }
}

async function loadPhotoWall(env: Env, slug: string): Promise<PhotoWallItem[]> {
  if (!env.QUIZ_DATA) return memoryPhotoWall.get(slug) ?? [];
  const raw = await env.QUIZ_DATA.get(`photowall:${slug}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PhotoWallItem[];
  } catch {
    return [];
  }
}

async function savePhotoWall(env: Env, slug: string, items: PhotoWallItem[]): Promise<void> {
  memoryPhotoWall.set(slug, items);
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put(`photowall:${slug}`, JSON.stringify(items));
  }
}

async function recordQuizAnswer(
  env: Env,
  question: QuizQuestion,
  choice: number,
  correct: boolean,
  playerId: string,
  playerName: string,
): Promise<void> {
  const summary = await loadQuizSummary(env);
  const key = String(question.id);
  const current = summary.questionStats[key] ?? {
    total: 0,
    correct: 0,
    optionCounts: Array.from({ length: question.opts.length }).map(() => 0),
  };
  current.total += 1;
  if (correct) current.correct += 1;
  if (choice >= 0 && choice < current.optionCounts.length) current.optionCounts[choice] += 1;
  summary.questionStats[key] = current;
  summary.totalAnswers += 1;
  if (correct) summary.totalCorrect += 1;
  await saveQuizSummary(env, summary);

  const recent = await loadRecentAnswers(env);
  recent.unshift({
    ts: new Date().toISOString(),
    questionId: question.id,
    choice,
    correct,
    playerId,
    playerName,
  });
  await saveRecentAnswers(env, recent.slice(0, 60));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/favicon.ico') {
      return new Response(null, { status: 204 });
    }

    if (url.pathname === '/api/rsvp' && request.method === 'POST') {
      let body: Partial<RsvpRecord> & { method?: string; contact?: string; attending?: boolean };
      try {
        body = await request.json();
      } catch {
        return json({ error: 'Invalid JSON body' }, 400);
      }

      const method = body.method === 'sms' || body.method === 'google' ? body.method : null;
      const contact = typeof body.contact === 'string' ? body.contact.trim() : '';
      const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : 'Guest';

      if (!method || !contact || typeof body.attending !== 'boolean') {
        return json({ error: 'method, contact and attending(boolean) are required' }, 400);
      }

      const id = normalizeId(method, contact);
      const record: RsvpRecord = {
        id,
        name,
        contact,
        method,
        attending: body.attending,
        partySize: Number.isFinite((body as { partySize?: number }).partySize)
          ? Math.max(1, Number((body as { partySize?: number }).partySize))
          : 1,
        plusOne:
          typeof (body as { plusOne?: string }).plusOne === 'string'
            ? (body as { plusOne?: string }).plusOne!.trim()
            : '',
        dietary:
          typeof (body as { dietary?: string }).dietary === 'string'
            ? (body as { dietary?: string }).dietary!.trim()
            : '',
        note:
          typeof (body as { note?: string }).note === 'string'
            ? (body as { note?: string }).note!.trim()
            : '',
        updatedAt: new Date().toISOString(),
      };

      await saveRsvp(env, record);
      return json({ success: true, record });
    }

    if (url.pathname === '/api/rsvp/stats' && request.method === 'GET') {
      const records = await loadAllRsvps(env);
      const attendingYes = records.filter((r) => r.attending).length;
      const attendingNo = records.length - attendingYes;
      return json({ total: records.length, attendingYes, attendingNo });
    }

    if (url.pathname === '/api/quiz/questions' && request.method === 'GET') {
      const all = await getAllQuestions(env);
      return json({
        total: all.length,
        questions: sanitizeQuestions(all),
      });
    }

    if (url.pathname === '/api/quiz/question' && request.method === 'GET') {
      const idParam = url.searchParams.get('id');
      const id = idParam ? Number(idParam) : NaN;
      if (!Number.isInteger(id)) {
        return json({ error: 'id query param is required' }, 400);
      }
      const all = await getAllQuestions(env);
      const question = all.find((q) => q.id === id);
      if (!question) return json({ error: 'Question not found' }, 404);
      const { ans, ...safe } = question;
      return json({ question: safe });
    }

    if (url.pathname === '/api/quiz/answer' && request.method === 'POST') {
      let body: { id?: number; choice?: number };
      try {
        body = await request.json();
      } catch {
        return json({ error: 'Invalid JSON body' }, 400);
      }
      if (!Number.isInteger(body.id) || !Number.isInteger(body.choice)) {
        return json({ error: 'id and choice(integer) are required' }, 400);
      }
      const all = await getAllQuestions(env);
      const question = all.find((q) => q.id === body.id);
      if (!question) return json({ error: 'Question not found' }, 404);
      const isCorrect = question.ans === body.choice;
      const playerId =
        typeof (body as { playerId?: string }).playerId === 'string'
          ? (body as { playerId?: string }).playerId!.trim()
          : 'anon';
      const playerName =
        typeof (body as { playerName?: string }).playerName === 'string'
          ? (body as { playerName?: string }).playerName!.trim()
          : 'Guest';
      await recordQuizAnswer(env, question, body.choice, isCorrect, playerId || 'anon', playerName || 'Guest');
      return json({
        id: question.id,
        correct: isCorrect,
        correctIndex: question.ans,
        explanation: question.exp,
        funFact: question.fun,
      });
    }

    if (url.pathname === '/api/quiz/admin/question' && request.method === 'POST') {
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401);
      let body: Partial<QuizQuestion> & { opts?: string[] };
      try {
        body = await request.json();
      } catch {
        return json({ error: 'Invalid JSON body' }, 400);
      }
      if (
        typeof body.q !== 'string' ||
        !Array.isArray(body.opts) ||
        body.opts.length < 2 ||
        !Number.isInteger(body.ans) ||
        typeof body.cat !== 'string' ||
        !Number.isInteger(body.yr)
      ) {
        return json({ error: 'q, opts[], ans, cat, yr are required' }, 400);
      }
      const all = await getAllQuestions(env);
      const maxId = all.reduce((m, q) => Math.max(m, q.id), 0);
      const nextId = maxId + 1;
      const question: QuizQuestion = {
        id: nextId,
        yr: body.yr!,
        cat: body.cat!,
        q: body.q!,
        hint: typeof body.hint === 'string' ? body.hint : undefined,
        opts: body.opts!,
        ans: body.ans!,
        exp: typeof body.exp === 'string' ? body.exp : 'Added by admin.',
        fun: typeof body.fun === 'string' ? body.fun : 'Custom question',
      };
      if (question.ans < 0 || question.ans >= question.opts.length) {
        return json({ error: 'ans index out of range' }, 400);
      }
      await saveCustomQuizQuestion(env, question);
      return json({ success: true, question }, 201);
    }

    if (url.pathname === '/api/quiz/admin/question' && request.method === 'DELETE') {
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401);
      const idParam = url.searchParams.get('id');
      const id = idParam ? Number(idParam) : NaN;
      if (!Number.isInteger(id)) return json({ error: 'id query param is required' }, 400);
      if (quizQuestions.some((q) => q.id === id)) {
        return json({ error: 'Base questions cannot be deleted. Only admin-added questions can be deleted.' }, 400);
      }
      await deleteCustomQuizQuestion(env, id);
      return json({ success: true, id });
    }

    if (url.pathname === '/api/admin/overview' && request.method === 'GET') {
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401);
      const rsvps = (await loadAllRsvps(env)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      const attending = rsvps.filter((r) => r.attending);
      const notAttending = rsvps.filter((r) => !r.attending);
      const totalHeads = attending.reduce((sum, r) => sum + (r.partySize ?? 1), 0);
      const summary = await loadQuizSummary(env);
      const recent = await loadRecentAnswers(env);
      const questionEntries = Object.entries(summary.questionStats).map(([id, s]) => ({
        id: Number(id),
        total: s.total,
        correct: s.correct,
        accuracy: s.total ? s.correct / s.total : 0,
        optionCounts: s.optionCounts,
      }));
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
          humor: totalHeads > 40 ? 'Big party energy detected. DJ on standby.' : 'Still room on the dance floor.',
          list: rsvps,
        },
        quiz: {
          totalAnswers: summary.totalAnswers,
          totalCorrect: summary.totalCorrect,
          overallAccuracy: summary.totalAnswers ? summary.totalCorrect / summary.totalAnswers : 0,
          hardestQuestionId: hardest?.id ?? null,
          byQuestion: questionEntries,
          recentAnswers: recent,
        },
      });
    }

    if (url.pathname === '/api/hosting/signup' && request.method === 'POST') {
      let body: { title?: string; hashtag?: string; instagramHandle?: string; owner?: string };
      try {
        body = await request.json();
      } catch {
        return json({ error: 'Invalid JSON body' }, 400);
      }
      const source = body.hashtag || body.instagramHandle || body.title || '';
      const slug = slugify(source);
      if (!slug || slug.length < 3) {
        return json({ error: 'Could not generate slug. Provide hashtag/instagramHandle/title.' }, 400);
      }
      const existing = await loadTenant(env, slug);
      if (existing) {
        return json({ error: 'Slug already exists', slug }, 409);
      }
      const hashtagRaw = (body.hashtag || slug).replace(/^#/, '');
      const tenant: TenantConfig = {
        slug,
        title: body.title?.trim() || `It's My Birthday: ${slug}`,
        hashtag: hashtagRaw,
        instagramHandle: body.instagramHandle?.replace(/^@/, '').trim(),
        owner: body.owner?.trim(),
        createdAt: new Date().toISOString(),
      };
      await saveTenant(env, tenant);
      return json({
        success: true,
        tenant,
        url: `https://mybirthday.myx.is/${slug}`,
        hashtagUrl: `https://www.instagram.com/explore/tags/${encodeURIComponent(hashtagRaw)}/`,
      }, 201);
    }

    if (url.pathname === '/api/hosting/tenant' && request.method === 'GET') {
      const slug = url.searchParams.get('slug') || getSlugFromPath(url.pathname) || '';
      if (!slug) return json({ error: 'slug is required' }, 400);
      const tenant = await loadTenant(env, slug);
      if (!tenant) return json({ error: 'Tenant not found' }, 404);
      return json({ tenant });
    }

    if (url.pathname === '/api/photowall' && request.method === 'GET') {
      const slug = (url.searchParams.get('slug') || getSlugFromPath(new URL(request.headers.get('referer') || 'https://x').pathname) || 'omars50').toLowerCase();
      const tenant = (await loadTenant(env, slug)) ?? {
        slug,
        title: `It's My Birthday: ${slug}`,
        hashtag: slug,
        createdAt: new Date().toISOString(),
      };
      const items = await loadPhotoWall(env, slug);
      return json({
        slug,
        hashtag: tenant.hashtag,
        hashtagUrl: `https://www.instagram.com/explore/tags/${encodeURIComponent(tenant.hashtag)}/`,
        items,
      });
    }

    if (url.pathname === '/api/photowall/item' && request.method === 'POST') {
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401);
      let body: { slug?: string; imageUrl?: string; caption?: string; sourceUrl?: string };
      try {
        body = await request.json();
      } catch {
        return json({ error: 'Invalid JSON body' }, 400);
      }
      const slug = slugify(body.slug || 'omars50');
      if (!slug) return json({ error: 'slug is required' }, 400);
      if (!body.imageUrl || typeof body.imageUrl !== 'string') return json({ error: 'imageUrl is required' }, 400);
      const item: PhotoWallItem = {
        id: crypto.randomUUID(),
        slug,
        imageUrl: body.imageUrl,
        caption: body.caption || '',
        sourceUrl: body.sourceUrl || '',
        addedAt: new Date().toISOString(),
      };
      const items = await loadPhotoWall(env, slug);
      items.unshift(item);
      await savePhotoWall(env, slug, items.slice(0, 200));
      return json({ success: true, item }, 201);
    }

    if (url.pathname === '/api/photowall/item' && request.method === 'DELETE') {
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401);
      const slug = slugify(url.searchParams.get('slug') || 'omars50');
      const id = url.searchParams.get('id') || '';
      if (!id) return json({ error: 'id is required' }, 400);
      const items = await loadPhotoWall(env, slug);
      const filtered = items.filter((x) => x.id !== id);
      await savePhotoWall(env, slug, filtered);
      return json({ success: true, id, slug });
    }

    if (url.pathname.startsWith('/api/')) {
      return json({ error: 'Not found' }, 404);
    }

    const slug = getSlugFromPath(url.pathname);
    const html = HTML.replace(
      '</head>',
      `<script>window.__APP_SLUG__=${JSON.stringify(slug || '')};</script></head>`,
    );

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Cache-Control': 'public, max-age=300',
        'X-Powered-By': '2076 ehf',
      },
    });
  },
};
