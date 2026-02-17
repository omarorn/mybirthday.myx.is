import { describe, expect, it } from "vitest";
import worker from "../../modules/mobile-app-shell/worker";
import type { Env } from "../../modules/mobile-app-shell/types";

type KaraokeRow = {
  id: string;
  slug: string;
  title: string;
  artist: string;
  audio_key: string;
  lyrics: string | null;
  transcription: string | null;
  vtt: string | null;
  manual_lyrics: string | null;
  duration: number | null;
  chords: string | null;
  preset: number;
  added_by: string;
  created_at: string;
  status: string;
};

function createMockDB() {
  const karaokeSongs = new Map<string, KaraokeRow>();

  function findByIdAndSlug(id: string, slug: string): KaraokeRow | null {
    const row = karaokeSongs.get(id);
    if (!row || row.slug !== slug) return null;
    return row;
  }

  return {
    prepare(sql: string) {
      let boundValues: unknown[] = [];
      const stmt = {
        bind(...values: unknown[]) {
          boundValues = values;
          return stmt;
        },
        async run() {
          if (sql.includes("INSERT INTO karaoke_songs")) {
            const [id, slug, title, artist, audioKey, addedBy, createdAt] = boundValues as [
              string,
              string,
              string,
              string,
              string,
              string,
              string,
            ];
            karaokeSongs.set(id, {
              id,
              slug,
              title,
              artist,
              audio_key: audioKey,
              lyrics: null,
              transcription: null,
              vtt: null,
              manual_lyrics: null,
              duration: null,
              chords: null,
              preset: 0,
              added_by: addedBy,
              created_at: createdAt,
              status: "uploaded",
            });
            return { success: true, meta: { changes: 1 } };
          }

          if (sql.includes("UPDATE karaoke_songs SET status = 'transcribing'")) {
            const [id] = boundValues as [string];
            const row = karaokeSongs.get(id);
            if (row) row.status = "transcribing";
            return { success: true, meta: { changes: row ? 1 : 0 } };
          }

          if (sql.includes("UPDATE karaoke_songs SET status = 'error'")) {
            const [id] = boundValues as [string];
            const row = karaokeSongs.get(id);
            if (row) row.status = "error";
            return { success: true, meta: { changes: row ? 1 : 0 } };
          }

          if (sql.includes("SET lyrics = ?, transcription = ?, vtt = ?, status = 'ready'")) {
            const [lyrics, transcription, vtt, id] = boundValues as [
              string,
              string,
              string,
              string,
            ];
            const row = karaokeSongs.get(id);
            if (row) {
              row.lyrics = lyrics;
              row.transcription = transcription;
              row.vtt = vtt;
              row.status = "ready";
            }
            return { success: true, meta: { changes: row ? 1 : 0 } };
          }

          if (sql.includes("UPDATE karaoke_songs SET manual_lyrics = ?, status = ? WHERE id = ?")) {
            const [manualLyrics, status, id] = boundValues as [string, string, string];
            const row = karaokeSongs.get(id);
            if (row) {
              row.manual_lyrics = manualLyrics;
              row.status = status;
            }
            return { success: true, meta: { changes: row ? 1 : 0 } };
          }

          if (sql.includes("DELETE FROM karaoke_songs WHERE id = ?")) {
            const [id] = boundValues as [string];
            const deleted = karaokeSongs.delete(id);
            return { success: true, meta: { changes: deleted ? 1 : 0 } };
          }

          return { success: true, meta: { changes: 0 } };
        },
        async all() {
          if (sql.includes("SELECT * FROM karaoke_songs WHERE slug = ?")) {
            const [slug] = boundValues as [string];
            const results = Array.from(karaokeSongs.values())
              .filter((row) => row.slug === slug)
              .sort((a, b) => b.created_at.localeCompare(a.created_at));
            return { results };
          }
          return { results: [] };
        },
        async first<T = Record<string, unknown>>() {
          if (sql.includes("SELECT * FROM karaoke_songs WHERE id = ? AND slug = ?")) {
            const [id, slug] = boundValues as [string, string];
            return (findByIdAndSlug(id, slug) as T) ?? null;
          }
          if (sql.includes("SELECT id, status FROM karaoke_songs WHERE id = ? AND slug = ?")) {
            const [id, slug] = boundValues as [string, string];
            const row = findByIdAndSlug(id, slug);
            if (!row) return null;
            return { id: row.id, status: row.status } as T;
          }
          if (sql.includes("SELECT audio_key FROM karaoke_songs WHERE id = ? AND slug = ?")) {
            const [id, slug] = boundValues as [string, string];
            const row = findByIdAndSlug(id, slug);
            if (!row) return null;
            return { audio_key: row.audio_key } as T;
          }
          return null;
        },
      };
      return stmt;
    },
  };
}

function createMockR2() {
  const store = new Map<string, ArrayBuffer>();
  return {
    async put(key: string, data: ArrayBuffer | Uint8Array) {
      const bytes =
        data instanceof Uint8Array
          ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
          : data;
      store.set(key, bytes);
    },
    async get(key: string) {
      const bytes = store.get(key);
      if (!bytes) return null;
      return {
        arrayBuffer: async () => bytes,
      };
    },
    async delete(key: string) {
      store.delete(key);
    },
  };
}

const mockEnv = {
  DB: createMockDB(),
  MEDIA_BUCKET: createMockR2(),
  QUIZ_DATA: { get: async () => null },
  ADMIN_PASSWORD: "changeme",
  AI: {
    async run(model: string, input: unknown) {
      void model;
      void input;
      return {
        text: "hann a afmaeli i dag",
        words: [
          { word: "hann", start: 0, end: 0.4 },
          { word: "a", start: 0.4, end: 0.6 },
          { word: "afmaeli", start: 0.6, end: 1.2 },
          { word: "i", start: 1.2, end: 1.4 },
          { word: "dag", start: 1.4, end: 1.8 },
        ],
      };
    },
  },
} as unknown as Env;

const jsonHeaders = { "content-type": "application/json" };

function api(path: string, init?: RequestInit) {
  return worker.fetch(new Request(`https://example.com${path}`, init), mockEnv);
}

describe("karaoke routes", () => {
  it("lists preset song with no audio", async () => {
    const res = await api("/api/karaoke/songs?slug=omars50");
    const payload = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(payload.songs)).toBe(true);
    const preset = payload.songs.find(
      (s: { id?: string }) => s.id === "preset-hann-a-afmaeli-i-dag",
    );
    expect(preset).toBeTruthy();
    expect(preset.hasAudio).toBe(false);
  });

  it("uploads a song and can fetch its audio", async () => {
    const upload = await api("/api/karaoke/upload?slug=omars50", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        title: "Test lag",
        artist: "QA",
        addedBy: "tester",
        audioBase64: "data:audio/wav;base64,QUJDRA==",
      }),
    });
    const upPayload = await upload.json();
    expect(upload.status).toBe(201);
    expect(upPayload.success).toBe(true);
    const id = upPayload.song.id as string;
    expect(id).toBeTruthy();

    const audio = await api(
      `/api/karaoke/audio?slug=omars50&id=${encodeURIComponent(id)}`,
    );
    const audioPayload = await audio.json();
    expect(audio.status).toBe(200);
    expect(typeof audioPayload.audioBase64).toBe("string");
  });

  it("transcribes uploaded song and returns vtt", async () => {
    const upload = await api("/api/karaoke/upload?slug=omars50", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        title: "Transcribe lag",
        addedBy: "tester",
        audioBase64: "data:audio/wav;base64,QUJDRA==",
      }),
    });
    const upPayload = await upload.json();
    const id = upPayload.song.id as string;

    const transcribe = await api(
      `/api/karaoke/transcribe?slug=omars50&id=${encodeURIComponent(id)}`,
      { method: "POST" },
    );
    const trPayload = await transcribe.json();
    expect(transcribe.status).toBe(200);
    expect(trPayload.success).toBe(true);
    expect(typeof trPayload.transcription).toBe("string");
    expect(String(trPayload.vtt)).toContain("WEBVTT");

    const meta = await api(
      `/api/karaoke/song?slug=omars50&id=${encodeURIComponent(id)}`,
    );
    const metaPayload = await meta.json();
    expect(meta.status).toBe(200);
    expect(metaPayload.status).toBe("ready");
    expect(Array.isArray(metaPayload.lyrics)).toBe(true);
  });

  it("prevents deleting preset song, allows deleting uploaded song", async () => {
    const presetDelete = await api(
      "/api/karaoke/song?slug=omars50&id=preset-hann-a-afmaeli-i-dag",
      {
        method: "DELETE",
        headers: { "x-admin-password": "changeme" },
      },
    );
    expect(presetDelete.status).toBe(400);

    const upload = await api("/api/karaoke/upload?slug=omars50", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        title: "Delete lag",
        addedBy: "tester",
        audioBase64: "data:audio/wav;base64,QUJDRA==",
      }),
    });
    const upPayload = await upload.json();
    const id = upPayload.song.id as string;

    const del = await api(
      `/api/karaoke/song?slug=omars50&id=${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: { "x-admin-password": "changeme" },
      },
    );
    const delPayload = await del.json();
    expect(del.status).toBe(200);
    expect(delPayload.success).toBe(true);
    expect(delPayload.deleted).toBe(id);
  });
});
