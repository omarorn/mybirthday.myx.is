/**
 * Event CRUD route handlers and persistence.
 */

import type { Env, EventRecord } from "../types";
import {
  json,
  parseJsonBody,
  readStringField,
  slugify,
  isJsonObject,
  isAdmin,
  parseEventRecord,
} from "../helpers";
import {
  memoryEvents,
  memoryEventSlugIndex,
  memoryOwnerEventIds,
} from "../state";

// ── Persistence ─────────────────────────────────────────────────

function resolveOwnerId(request: Request): string {
  return (request.headers.get("x-owner-id") || "").trim();
}

async function loadOwnerEventIds(
  env: Env,
  ownerId: string,
): Promise<string[]> {
  if (!env.QUIZ_DATA) return memoryOwnerEventIds.get(ownerId) ?? [];
  const raw = await env.QUIZ_DATA.get(`event:owner:${ownerId}`);
  if (!raw) return [];
  try {
    const ids = JSON.parse(raw) as string[];
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

async function saveOwnerEventIds(
  env: Env,
  ownerId: string,
  ids: string[],
): Promise<void> {
  memoryOwnerEventIds.set(ownerId, ids);
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put(`event:owner:${ownerId}`, JSON.stringify(ids));
  }
}

async function registerOwnerEventId(
  env: Env,
  ownerId: string,
  eventId: string,
): Promise<void> {
  const current = await loadOwnerEventIds(env, ownerId);
  const next = [eventId, ...current.filter((x) => x !== eventId)].slice(0, 80);
  await saveOwnerEventIds(env, ownerId, next);
}

async function loadEventById(
  env: Env,
  id: string,
): Promise<EventRecord | null> {
  if (!env.QUIZ_DATA) return memoryEvents.get(id) ?? null;
  const raw = await env.QUIZ_DATA.get(`event:id:${id}`);
  if (!raw) return null;
  try {
    return parseEventRecord(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function loadEventBySlug(
  env: Env,
  slug: string,
): Promise<EventRecord | null> {
  if (!env.QUIZ_DATA) {
    const eventId = memoryEventSlugIndex.get(slug);
    return eventId ? (memoryEvents.get(eventId) ?? null) : null;
  }
  const eventId = await env.QUIZ_DATA.get(`event:slug:${slug}`);
  if (!eventId) return null;
  return loadEventById(env, eventId);
}

async function saveEvent(env: Env, event: EventRecord): Promise<void> {
  memoryEvents.set(event.id, event);
  memoryEventSlugIndex.set(event.slug, event.id);
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put(`event:id:${event.id}`, JSON.stringify(event));
    await env.QUIZ_DATA.put(`event:slug:${event.slug}`, event.id);
  }
}

function buildEventRecord(
  payload: {
    title?: string;
    slug?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    timezone?: string;
    published?: boolean;
    metadata?: Record<string, string>;
  },
  ownerId: string,
): EventRecord {
  const now = new Date().toISOString();
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const startTime =
    typeof payload.startTime === "string" ? payload.startTime.trim() : "";
  const endTime =
    typeof payload.endTime === "string" ? payload.endTime.trim() : "";
  if (!title || !startTime) {
    throw new Error("Heiti og upphafstími vantar");
  }
  const parsedStart = Date.parse(startTime);
  if (Number.isNaN(parsedStart)) {
    throw new Error("Upphafstími er ógildur");
  }
  if (endTime) {
    const parsedEnd = Date.parse(endTime);
    if (Number.isNaN(parsedEnd)) {
      throw new Error("Lokatími er ógildur");
    }
    if (parsedEnd < parsedStart) {
      throw new Error("Lokatími má ekki vera á undan upphafstíma");
    }
  }
  const slugSource = payload.slug || payload.title || crypto.randomUUID();
  const slug = slugify(slugSource);
  if (!slug || slug.length < 3) {
    throw new Error("gild slóð er nauðsynleg");
  }
  return {
    id: crypto.randomUUID(),
    ownerId,
    slug,
    title,
    description:
      typeof payload.description === "string"
        ? payload.description.trim()
        : "",
    startTime,
    endTime,
    timezone:
      typeof payload.timezone === "string" ? payload.timezone.trim() : "",
    published: Boolean(payload.published),
    metadata:
      payload.metadata && typeof payload.metadata === "object"
        ? payload.metadata
        : {},
    createdAt: now,
    updatedAt: now,
  };
}

// ── Route handler ───────────────────────────────────────────────

export async function handleEventsRoutes(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response | null> {
  if (url.pathname === "/api/events/create" && request.method === "POST") {
    const ownerId = resolveOwnerId(request);
    if (!ownerId) return json({ error: "Aðgangur ekki leyfður" }, 401);

    const body = await parseJsonBody(request);

    const rawTitle = readStringField(body.title, "title", 140);
    const rawHonoree = readStringField(body.honoree, "honoree", 120);
    const rawDateTime = readStringField(body.date_time, "date_time", 80);
    const rawLocation = readStringField(body.location, "location", 240);
    const rawDescription = readStringField(
      body.description,
      "description",
      1000,
    );
    const rawStartTime = readStringField(body.startTime, "startTime", 80);
    const rawSlug = readStringField(body.slug, "slug", 80);
    const rawEndTime = readStringField(body.endTime, "endTime", 80);
    const rawTimezone = readStringField(body.timezone, "timezone", 60);
    const rawPrivacy = readStringField(body.privacy, "privacy", 20);
    const mappedTitle =
      rawTitle || (rawHonoree ? `${rawHonoree}'s Party` : "");
    const mappedStartTime = rawStartTime || rawDateTime;
    const mappedDescription = rawDescription || rawLocation;
    const metadata: Record<string, string> = {};
    if (isJsonObject(body.metadata)) {
      for (const [key, value] of Object.entries(body.metadata)) {
        if (typeof value === "string") metadata[key] = value.trim();
      }
    }
    const rawType = readStringField(body.type, "type", 80);
    const rawDefaultTheme = readStringField(
      body.default_theme,
      "default_theme",
      80,
    );
    if (rawType) metadata.type = rawType;
    if (rawHonoree) metadata.honoree = rawHonoree;
    if (rawLocation) metadata.location = rawLocation;
    if (rawPrivacy) metadata.privacy = rawPrivacy;
    if (rawDefaultTheme) metadata.defaultTheme = rawDefaultTheme;

    let event: EventRecord;
    try {
      event = buildEventRecord(
        {
          title: mappedTitle,
          slug: rawSlug,
          description: mappedDescription,
          startTime: mappedStartTime,
          endTime: rawEndTime,
          timezone: rawTimezone,
          published:
            typeof body.published === "boolean"
              ? body.published
              : rawPrivacy
                ? rawPrivacy === "public"
                : false,
          metadata,
        },
        ownerId,
      );
    } catch (error) {
      return json(
        {
          error:
            error instanceof Error ? error.message : "Ógild viðburðargögn",
        },
        400,
      );
    }

    const existingBySlug = await loadEventBySlug(env, event.slug);
    if (existingBySlug)
      return json(
        { error: "Slóð er þegar í notkun", slug: event.slug },
        409,
      );

    await saveEvent(env, event);
    await registerOwnerEventId(env, ownerId, event.id);

    return json({ success: true, eventId: event.id, event }, 201);
  }

  const eventCloneMatch = url.pathname.match(
    /^\/api\/events\/([^/]+)\/clone$/,
  );
  if (eventCloneMatch && request.method === "POST") {
    const ownerId = resolveOwnerId(request);
    const admin = isAdmin(request, env);
    const effectiveOwnerId = ownerId || (admin ? "admin" : "");
    if (!effectiveOwnerId)
      return json({ error: "Aðgangur ekki leyfður" }, 401);

    let sourceEventId = "";
    try {
      sourceEventId = decodeURIComponent(eventCloneMatch[1] || "").trim();
    } catch {
      return json({ error: "Viðburðaauðkenni er ógilt" }, 400);
    }
    if (!sourceEventId)
      return json({ error: "Viðburðaauðkenni vantar" }, 400);

    const sourceEvent = await loadEventById(env, sourceEventId);
    if (!sourceEvent) return json({ error: "Viðburður fannst ekki" }, 404);

    if (
      !admin &&
      sourceEvent.ownerId !== effectiveOwnerId &&
      !sourceEvent.published
    ) {
      return json({ error: "Óheimilt" }, 403);
    }

    const body = await parseJsonBody(request, { allowEmpty: true });

    const requestedCloneSlug = readStringField(body.slug, "slug", 80);
    const cloneTitleOverride = readStringField(body.title, "title", 140);
    const cloneDescriptionOverride = readStringField(
      body.description,
      "description",
      1000,
    );
    const cloneStartTimeOverride = readStringField(
      body.startTime,
      "startTime",
      80,
    );
    const cloneEndTimeOverride = readStringField(
      body.endTime,
      "endTime",
      80,
    );
    const cloneTimezoneOverride = readStringField(
      body.timezone,
      "timezone",
      60,
    );
    const baseSlug = slugify(
      requestedCloneSlug || `${sourceEvent.slug}-copy`,
    );
    if (!baseSlug) return json({ error: "gild slóð er nauðsynleg" }, 400);
    let nextSlug = baseSlug;
    let suffix = 2;
    while (await loadEventBySlug(env, nextSlug)) {
      nextSlug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    let clone: EventRecord;
    try {
      clone = buildEventRecord(
        {
          title: cloneTitleOverride || `${sourceEvent.title} (Afrit)`,
          slug: nextSlug,
          description: cloneDescriptionOverride || sourceEvent.description,
          startTime: cloneStartTimeOverride || sourceEvent.startTime,
          endTime: cloneEndTimeOverride || sourceEvent.endTime,
          timezone: cloneTimezoneOverride || sourceEvent.timezone,
          published: false,
          metadata: {
            ...(sourceEvent.metadata ?? {}),
            ...(isJsonObject(body.metadata)
              ? Object.fromEntries(
                  Object.entries(body.metadata).filter(
                    ([, value]) => typeof value === "string",
                  ),
                )
              : {}),
            clonedFromEventId: sourceEvent.id,
          },
        },
        effectiveOwnerId,
      );
    } catch (error) {
      return json(
        {
          error:
            error instanceof Error ? error.message : "Ógild afritunargögn",
        },
        400,
      );
    }

    await saveEvent(env, clone);
    await registerOwnerEventId(env, effectiveOwnerId, clone.id);

    if (env.QUIZ_DATA) {
      const copiedKeys: string[] = [];
      for (const suffixToCopy of [
        "links",
        "schedule",
        "settings",
        "secret_timeline",
        "quiz_meta",
        "photo_meta",
      ]) {
        const sourceValue = await env.QUIZ_DATA.get(
          `event:${sourceEvent.id}:${suffixToCopy}`,
        );
        if (sourceValue !== null) {
          await env.QUIZ_DATA.put(
            `event:${clone.id}:${suffixToCopy}`,
            sourceValue,
          );
          copiedKeys.push(suffixToCopy);
        }
      }
      return json(
        {
          success: true,
          sourceEventId: sourceEvent.id,
          eventId: clone.id,
          event: clone,
          copiedKeys,
        },
        201,
      );
    }

    return json(
      {
        success: true,
        sourceEventId: sourceEvent.id,
        eventId: clone.id,
        event: clone,
        copiedKeys: [],
      },
      201,
    );
  }

  if (url.pathname === "/api/dashboard/me" && request.method === "GET") {
    const ownerId = resolveOwnerId(request);
    if (!ownerId) return json({ error: "Aðgangur ekki leyfður" }, 401);

    const ids = await loadOwnerEventIds(env, ownerId);
    const loaded = await Promise.all(
      ids.map(async (id) => loadEventById(env, id)),
    );
    const events = loaded
      .filter((event): event is EventRecord => Boolean(event))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const drafts = events.filter((event) => !event.published);
    const published = events.filter((event) => event.published);

    return json({
      ownerId,
      total: events.length,
      events,
      adminEvents: events,
      drafts,
      published,
      templates: [],
    });
  }

  const publicEventMatch = url.pathname.match(
    /^\/api\/events\/([^/]+)\/public$/,
  );
  if (publicEventMatch && request.method === "GET") {
    let rawSlug = "";
    try {
      rawSlug = decodeURIComponent(publicEventMatch[1] || "").trim();
    } catch {
      return json({ error: "slug is invalid" }, 400);
    }
    const slug = slugify(rawSlug);
    if (!slug) return json({ error: "Slóð vantar" }, 400);

    const event = await loadEventBySlug(env, slug);
    if (!event || !event.published)
      return json({ error: "Viðburður fannst ekki" }, 404);

    return json({
      event: {
        id: event.id,
        slug: event.slug,
        title: event.title,
        description: event.description ?? "",
        startTime: event.startTime,
        date_time: event.startTime,
        endTime: event.endTime ?? "",
        timezone: event.timezone ?? "",
        published: event.published,
        metadata: event.metadata ?? {},
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      },
      cta: {
        canRsvp: true,
        canPlayQuiz: true,
        canViewPhotoWall: true,
        canApplyAsPlanner: true,
        canClone: true,
      },
    });
  }

  return null;
}
