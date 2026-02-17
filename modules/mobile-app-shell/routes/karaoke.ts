/**
 * MyKaraoke route handlers — D1 metadata + R2 audio storage.
 */

import type { Env, KaraokeSong, TranscriptSegment } from "../types";
import { json, slugify, isAdmin } from "../helpers";

// ── VTT helpers ─────────────────────────────────────────────────

function toVttTimestamp(seconds: number): string {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = Math.floor(safe % 60);
  const millis = Math.floor((safe - Math.floor(safe)) * 1000);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

function segmentsToVtt(segments: TranscriptSegment[]): string {
  const lines = ["WEBVTT", ""];
  for (let i = 0; i < segments.length; i += 1) {
    const seg = segments[i];
    lines.push(String(i + 1));
    lines.push(`${toVttTimestamp(seg.start)} --> ${toVttTimestamp(seg.end)}`);
    lines.push(seg.word);
    lines.push("");
  }
  return lines.join("\n");
}

// ── Presets ──────────────────────────────────────────────────────

function presetKaraokeSongs(): KaraokeSong[] {
  const presetText = [
    "Hann á afmæli í dag, hann á afmæli í dag,",
    "hann á afmæli hann Omar, hann á afmæli í dag!",
    "Húrra! Húrra! Húrra!",
  ].join("\n");

  return [
    {
      id: "preset-hann-a-afmaeli-i-dag",
      title: "Hann á afmæli í dag",
      artist: "Afmæliskórinn",
      audioKey: "",
      manualLyrics: presetText,
      transcription: presetText,
      chords: ["G", "D", "Em", "C", "G", "D", "G"],
      preset: true,
      addedBy: "System",
      createdAt: "2026-02-17T00:00:00.000Z",
      status: "ready",
    },
  ];
}

// ── Row mapping ─────────────────────────────────────────────────

function rowToSong(row: Record<string, unknown>): KaraokeSong {
  return {
    id: row.id as string,
    title: row.title as string,
    artist: (row.artist as string) || "",
    audioKey: (row.audio_key as string) || "",
    lyrics: row.lyrics ? (JSON.parse(row.lyrics as string) as TranscriptSegment[]) : undefined,
    manualLyrics: (row.manual_lyrics as string) || undefined,
    transcription: (row.transcription as string) || undefined,
    vtt: (row.vtt as string) || undefined,
    duration: row.duration != null ? (row.duration as number) : undefined,
    chords: row.chords ? (JSON.parse(row.chords as string) as string[]) : undefined,
    preset: Boolean(row.preset),
    addedBy: row.added_by as string,
    createdAt: row.created_at as string,
    status: (row.status as KaraokeSong["status"]) || "uploaded",
  };
}

function mergeWithPresets(storedSongs: KaraokeSong[]): KaraokeSong[] {
  const presets = presetKaraokeSongs();
  const stored = storedSongs.filter(
    (song) => !presets.some((preset) => preset.id === song.id),
  );
  return [...presets, ...stored];
}

// ── Persistence (D1) ────────────────────────────────────────────

async function loadKaraokeSongs(env: Env, slug: string): Promise<KaraokeSong[]> {
  const result = await env.DB.prepare(
    "SELECT * FROM karaoke_songs WHERE slug = ? ORDER BY created_at DESC LIMIT 200",
  )
    .bind(slug)
    .all();
  return (result.results ?? []).map(rowToSong);
}

// ── Route handler ────────────────────────────────────────────────

export async function handleKaraokeRoutes(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response | null> {
  // ── GET songs list ──────────────────────────────────────────
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

  // ── GET single song ─────────────────────────────────────────
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

  // ── GET audio from R2 ───────────────────────────────────────
  if (url.pathname === "/api/karaoke/audio" && request.method === "GET") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id vantar" }, 400);
    const songs = mergeWithPresets(await loadKaraokeSongs(env, slug));
    const song = songs.find((s) => s.id === id);
    if (!song) return json({ error: "Lag fannst ekki" }, 404);
    if (!song.audioKey) return json({ error: "Preset lag hefur enga hljóðskrá" }, 404);

    const obj = await env.MEDIA_BUCKET.get(song.audioKey);
    if (!obj) return json({ error: "Hljóðskrá fannst ekki" }, 404);

    const bytes = await obj.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
    return json({ audioBase64: base64 });
  }

  // ── POST upload new song ────────────────────────────────────
  if (url.pathname === "/api/karaoke/upload" && request.method === "POST") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const body = (await request.json()) as {
      title?: string;
      artist?: string;
      addedBy?: string;
      audioBase64?: string;
    };
    if (!body.title || !body.addedBy || !body.audioBase64) {
      return json({ error: "title, addedBy og audioBase64 eru nauðsynleg" }, 400);
    }
    if (body.audioBase64.length > 14_000_000) {
      return json({ error: "Hljóðskrá of stór (hámark ~10MB)" }, 400);
    }

    const id = crypto.randomUUID();
    const audioKey = `karaoke/${slug}/${id}`;

    // Decode base64 to binary and store in R2
    const raw = body.audioBase64.includes(",")
      ? body.audioBase64.split(",")[1]
      : body.audioBase64;
    const binaryString = atob(raw);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    await env.MEDIA_BUCKET.put(audioKey, bytes, {
      httpMetadata: { contentType: "audio/mpeg" },
    });

    const now = new Date().toISOString();
    await env.DB.prepare(
      `INSERT INTO karaoke_songs (id, slug, title, artist, audio_key, added_by, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'uploaded', ?)`,
    )
      .bind(id, slug, body.title, body.artist || "", audioKey, body.addedBy, now)
      .run();

    const song: KaraokeSong = {
      id,
      title: body.title,
      artist: body.artist || "",
      audioKey,
      addedBy: body.addedBy,
      createdAt: now,
      status: "uploaded",
    };
    return json({ success: true, song: { ...song, audioKey: undefined } }, 201);
  }

  // ── POST transcribe via Workers AI ──────────────────────────
  if (url.pathname === "/api/karaoke/transcribe" && request.method === "POST") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id vantar" }, 400);
    if (!env.AI) return json({ error: "AI binding ekki stillt" }, 500);

    // Check song exists
    const songRow = await env.DB.prepare(
      "SELECT * FROM karaoke_songs WHERE id = ? AND slug = ?",
    )
      .bind(id, slug)
      .first();
    if (!songRow) return json({ error: "Lag fannst ekki" }, 404);
    const song = rowToSong(songRow as Record<string, unknown>);

    // Mark as transcribing
    await env.DB.prepare(
      "UPDATE karaoke_songs SET status = 'transcribing' WHERE id = ?",
    )
      .bind(id)
      .run();

    try {
      // Load audio from R2
      const obj = await env.MEDIA_BUCKET.get(song.audioKey);
      if (!obj) {
        await env.DB.prepare(
          "UPDATE karaoke_songs SET status = 'error' WHERE id = ?",
        )
          .bind(id)
          .run();
        return json({ error: "Hljóðskrá fannst ekki" }, 404);
      }

      const audioBytes = await obj.arrayBuffer();
      const audioB64 = btoa(
        String.fromCharCode(...new Uint8Array(audioBytes)),
      );

      const result = (await (env.AI as any).run("@cf/openai/whisper-large-v3-turbo", {
        audio: audioB64,
        initial_prompt: "Icelandic birthday song karaoke lyrics and party speech.",
        prefix: `${song.title}${song.artist ? ` by ${song.artist}` : ""}`,
      })) as {
        text?: string;
        words?: { word: string; start: number; end: number }[];
      };

      const fallbackText = (result.text || "").trim();
      const segments: TranscriptSegment[] = result.words
        ? result.words.map((w) => ({ word: w.word, start: w.start, end: w.end }))
        : fallbackText
            .split(/\s+/)
            .filter(Boolean)
            .map((w, i) => ({ word: w, start: i * 0.5, end: i * 0.5 + 0.4 }));

      const transcriptText = fallbackText || segments.map((x) => x.word).join(" ");
      const vtt = segmentsToVtt(segments);

      // Update D1 with transcription data
      await env.DB.prepare(
        `UPDATE karaoke_songs
         SET lyrics = ?, transcription = ?, vtt = ?, status = 'ready'
         WHERE id = ?`,
      )
        .bind(JSON.stringify(segments), transcriptText, vtt, id)
        .run();

      return json({
        success: true,
        segmentCount: segments.length,
        transcription: transcriptText,
        vtt,
      });
    } catch (err) {
      await env.DB.prepare(
        "UPDATE karaoke_songs SET status = 'error' WHERE id = ?",
      )
        .bind(id)
        .run();
      return json({ error: "Umritun mistókst", detail: String(err) }, 500);
    }
  }

  // ── POST manual lyrics ──────────────────────────────────────
  if (url.pathname === "/api/karaoke/lyrics" && request.method === "POST") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id vantar" }, 400);
    const body = (await request.json()) as { lyrics?: string };
    if (!body.lyrics) return json({ error: "lyrics vantar" }, 400);

    const existing = await env.DB.prepare(
      "SELECT id, status FROM karaoke_songs WHERE id = ? AND slug = ?",
    )
      .bind(id, slug)
      .first<{ id: string; status: string }>();
    if (!existing) return json({ error: "Lag fannst ekki" }, 404);

    const newStatus = existing.status === "uploaded" ? "ready" : existing.status;
    await env.DB.prepare(
      "UPDATE karaoke_songs SET manual_lyrics = ?, status = ? WHERE id = ?",
    )
      .bind(body.lyrics, newStatus, id)
      .run();
    return json({ success: true });
  }

  // ── DELETE song ─────────────────────────────────────────────
  if (url.pathname === "/api/karaoke/song" && request.method === "DELETE") {
    if (!isAdmin(request, env)) {
      return json({ error: "Aðgangur ekki leyfður" }, 401);
    }
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id vantar" }, 400);

    // Check for presets (can't be deleted from D1, they're hardcoded)
    const presets = presetKaraokeSongs();
    if (presets.some((p) => p.id === id)) {
      return json({ error: "Ekki má eyða preset lagi" }, 400);
    }

    const songRow = await env.DB.prepare(
      "SELECT audio_key FROM karaoke_songs WHERE id = ? AND slug = ?",
    )
      .bind(id, slug)
      .first<{ audio_key: string }>();
    if (!songRow) return json({ error: "Lag fannst ekki" }, 404);

    if (songRow.audio_key) {
      await env.MEDIA_BUCKET.delete(songRow.audio_key);
    }
    await env.DB.prepare("DELETE FROM karaoke_songs WHERE id = ?").bind(id).run();

    return json({ success: true, deleted: id });
  }

  return null;
}
