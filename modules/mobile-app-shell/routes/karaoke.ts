/**
 * MyKaraoke route handlers and persistence.
 */

import type { Env, KaraokeSong, TranscriptSegment } from "../types";
import { json, slugify, isAdmin } from "../helpers";
import { memoryKaraokeSongs, memoryKaraokeAudio } from "../state";

function presetKaraokeSongs(): KaraokeSong[] {
  return [
    {
      id: "preset-hann-a-afmaeli-i-dag",
      title: "Hann á afmæli í dag",
      artist: "Afmæliskórinn",
      audioKey: "",
      manualLyrics: [
        "Hann á afmæli í dag, hann á afmæli í dag,",
        "hann á afmæli hann Omar, hann á afmæli í dag!",
        "Húrra! Húrra! Húrra!",
      ].join("\n"),
      chords: ["G", "D", "Em", "C", "G", "D", "G"],
      preset: true,
      addedBy: "System",
      createdAt: "2026-02-17T00:00:00.000Z",
      status: "ready",
    },
  ];
}

function mergeWithPresets(storedSongs: KaraokeSong[]): KaraokeSong[] {
  const presets = presetKaraokeSongs();
  const stored = storedSongs.filter(
    (song) => !presets.some((preset) => preset.id === song.id),
  );
  return [...presets, ...stored];
}

// ── Persistence ──────────────────────────────────────────────────

async function loadKaraokeSongs(env: Env, slug: string): Promise<KaraokeSong[]> {
  if (!env.QUIZ_DATA) return memoryKaraokeSongs.get(slug) ?? [];
  const raw = await env.QUIZ_DATA.get(`karaoke:songs:${slug}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as KaraokeSong[];
  } catch {
    return [];
  }
}

async function saveKaraokeSongs(
  env: Env,
  slug: string,
  songs: KaraokeSong[],
): Promise<void> {
  memoryKaraokeSongs.set(slug, songs);
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put(`karaoke:songs:${slug}`, JSON.stringify(songs));
  }
}

// ── Route handler ────────────────────────────────────────────────

export async function handleKaraokeRoutes(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response | null> {
  if (url.pathname === "/api/karaoke/songs" && request.method === "GET") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const songs = mergeWithPresets(await loadKaraokeSongs(env, slug));
    return json({
      slug,
      total: songs.length,
      songs: songs.map((song) => {
        const sanitized = {
          ...song,
          hasAudio: Boolean(song.audioKey),
        } as KaraokeSong & { audioKey?: string; hasAudio: boolean };
        delete (sanitized as { audioKey?: string }).audioKey;
        return sanitized;
      }),
    });
  }

  if (url.pathname === "/api/karaoke/song" && request.method === "GET") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id vantar" }, 400);
    const songs = mergeWithPresets(await loadKaraokeSongs(env, slug));
    const song = songs.find((s) => s.id === id);
    if (!song) return json({ error: "Lag fannst ekki" }, 404);
    const meta = { ...song, hasAudio: Boolean(song.audioKey) } as KaraokeSong & {
      audioKey?: string;
      hasAudio: boolean;
    };
    delete (meta as { audioKey?: string }).audioKey;
    return json(meta);
  }

  if (url.pathname === "/api/karaoke/audio" && request.method === "GET") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id vantar" }, 400);
    const songs = mergeWithPresets(await loadKaraokeSongs(env, slug));
    const song = songs.find((s) => s.id === id);
    if (!song) return json({ error: "Lag fannst ekki" }, 404);
    if (!song.audioKey) return json({ error: "Preset lag hefur enga hljóðskrá" }, 404);
    const audioKey = `karaoke:audio:${slug}:${id}`;
    let audioData: string | null = null;
    if (env.QUIZ_DATA) {
      audioData = await env.QUIZ_DATA.get(audioKey);
    } else {
      audioData = memoryKaraokeAudio.get(audioKey) ?? null;
    }
    if (!audioData) return json({ error: "Hljóðskrá fannst ekki" }, 404);
    return json({ audioBase64: audioData });
  }

  if (url.pathname === "/api/karaoke/upload" && request.method === "POST") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const body = (await request.json()) as {
      title?: string;
      artist?: string;
      addedBy?: string;
      audioBase64?: string;
    };
    if (!body.title || !body.addedBy || !body.audioBase64) {
      return json(
        { error: "title, addedBy og audioBase64 eru nauðsynleg" },
        400,
      );
    }
    if (body.audioBase64.length > 14_000_000) {
      return json({ error: "Hljóðskrá of stór (hámark ~10MB)" }, 400);
    }
    const id = crypto.randomUUID();
    const audioKey = `karaoke:audio:${slug}:${id}`;
    if (env.QUIZ_DATA) {
      await env.QUIZ_DATA.put(audioKey, body.audioBase64);
    } else {
      memoryKaraokeAudio.set(audioKey, body.audioBase64);
    }
    const song: KaraokeSong = {
      id,
      title: body.title,
      artist: body.artist || "",
      audioKey,
      addedBy: body.addedBy,
      createdAt: new Date().toISOString(),
      status: "uploaded",
    };
    const songs = await loadKaraokeSongs(env, slug);
    songs.push(song);
    await saveKaraokeSongs(env, slug, songs);
    return json({ success: true, song: { ...song, audioKey: undefined } }, 201);
  }

  if (
    url.pathname === "/api/karaoke/transcribe" &&
    request.method === "POST"
  ) {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id vantar" }, 400);
    if (!env.AI) return json({ error: "AI binding ekki stillt" }, 500);
    const songs = await loadKaraokeSongs(env, slug);
    const idx = songs.findIndex((s) => s.id === id);
    if (idx === -1) return json({ error: "Lag fannst ekki" }, 404);
    songs[idx].status = "transcribing";
    await saveKaraokeSongs(env, slug, songs);
    try {
      const audioKey = `karaoke:audio:${slug}:${id}`;
      let audioB64: string | null = null;
      if (env.QUIZ_DATA) {
        audioB64 = await env.QUIZ_DATA.get(audioKey);
      } else {
        audioB64 = memoryKaraokeAudio.get(audioKey) ?? null;
      }
      if (!audioB64) {
        songs[idx].status = "error";
        await saveKaraokeSongs(env, slug, songs);
        return json({ error: "Hljóðskrá fannst ekki" }, 404);
      }
      const raw = audioB64.includes(",")
        ? audioB64.split(",")[1]
        : audioB64;
      const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
      const result = (await env.AI.run("@cf/openai/whisper", {
        audio: [...bytes],
      })) as {
        text?: string;
        words?: { word: string; start: number; end: number }[];
      };
      const segments: TranscriptSegment[] = result.words
        ? result.words.map((w) => ({
            word: w.word,
            start: w.start,
            end: w.end,
          }))
        : (result.text || "")
            .split(/\s+/)
            .filter(Boolean)
            .map((w, i) => ({ word: w, start: i * 0.5, end: i * 0.5 + 0.4 }));
      songs[idx].lyrics = segments;
      songs[idx].status = "ready";
      await saveKaraokeSongs(env, slug, songs);
      return json({ success: true, segmentCount: segments.length });
    } catch (err) {
      songs[idx].status = "error";
      await saveKaraokeSongs(env, slug, songs);
      return json(
        { error: "Umritun mistókst", detail: String(err) },
        500,
      );
    }
  }

  if (url.pathname === "/api/karaoke/lyrics" && request.method === "POST") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id vantar" }, 400);
    const body = (await request.json()) as { lyrics?: string };
    if (!body.lyrics) return json({ error: "lyrics vantar" }, 400);
    const songs = await loadKaraokeSongs(env, slug);
    const idx = songs.findIndex((s) => s.id === id);
    if (idx === -1) return json({ error: "Lag fannst ekki" }, 404);
    songs[idx].manualLyrics = body.lyrics;
    if (songs[idx].status === "uploaded") songs[idx].status = "ready";
    await saveKaraokeSongs(env, slug, songs);
    return json({ success: true });
  }

  if (
    url.pathname === "/api/karaoke/song" &&
    request.method === "DELETE"
  ) {
    if (!isAdmin(request, env))
      return json({ error: "Aðgangur ekki leyfður" }, 401);
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id vantar" }, 400);
    const songs = await loadKaraokeSongs(env, slug);
    const song = songs.find((s) => s.id === id);
    if (!song) return json({ error: "Lag fannst ekki" }, 404);
    if (song.preset) {
      return json({ error: "Ekki má eyða preset lagi" }, 400);
    }
    const filtered = songs.filter((s) => s.id !== id);
    await saveKaraokeSongs(env, slug, filtered);
    const audioKey = `karaoke:audio:${slug}:${id}`;
    if (env.QUIZ_DATA) {
      await env.QUIZ_DATA.delete(audioKey);
    } else {
      memoryKaraokeAudio.delete(audioKey);
    }
    return json({ success: true, deleted: id });
  }

  return null;
}
