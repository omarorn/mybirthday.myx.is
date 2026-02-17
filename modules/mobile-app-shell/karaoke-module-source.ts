const karaokeModuleSource = String.raw`
function initKaraokeModule({
  currentSlug,
  karaokeTitle,
  karaokeArtist,
  karaokeAddedBy,
  karaokeFile,
  karaokeManualLyrics,
  karaokeUploadBtn,
  karaokeStatus,
  karaokeSongList,
  karaokeUploadView,
  karaokePlayerView,
  karaokeLyrics,
  karaokeAudio,
  karaokeNowTitle,
  karaokeNowArtist,
  karaokePlayBtn,
  karaokeSeek,
  karaokeTime,
  karaokeBackBtn,
  karaokeFullscreenBtn,
  karaokeFullscreen,
  karaokeFsClose,
  karaokeFsLyrics,
  karaokeChords,
  karaokeFsChords,
  karaokeFsPlay,
  karaokeFsSeek,
  karaokeFsTime,
}) {
  let karaokeFileData = null;
  let karaokeLyricsData = [];
  let karaokeAnimFrame = null;
  let karaokeVttTrackUrl = null;

  const karaokeApi = {
    async listSongs() {
      const res = await fetch('/api/karaoke/songs?slug=' + encodeURIComponent(currentSlug));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gat ekki hlaðið lögum');
      return data.songs || [];
    },
    async getSongMeta(songId) {
      const res = await fetch('/api/karaoke/song?slug=' + encodeURIComponent(currentSlug) + '&id=' + songId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lag fannst ekki');
      return data;
    },
    async getSongAudio(songId) {
      const res = await fetch('/api/karaoke/audio?slug=' + encodeURIComponent(currentSlug) + '&id=' + songId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hljóð fannst ekki');
      const raw = typeof data.audioBase64 === 'string' ? data.audioBase64 : '';
      if (!raw) throw new Error('Hljóðgögn vantar');
      return raw.startsWith('data:audio/') ? raw : ('data:audio/mpeg;base64,' + raw);
    },
  };

  const karaokeRender = {
    chords(song) {
      const blocks = [karaokeChords, karaokeFsChords].filter(Boolean);
      blocks.forEach((container) => {
        if (!song || !Array.isArray(song.chords) || !song.chords.length) {
          container.innerHTML = '<div class="muted" style="font-size:0.78rem;">Engin gítargrip skráð fyrir þetta lag.</div>';
          return;
        }
        container.innerHTML = [
          '<div style="font-size:0.74rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.08em;">Gítargrip</div>',
          '<div class="row">' + song.chords.map((ch) => '<span class="karaoke-chord">' + ch + '</span>').join('') + '</div>'
        ].join('');
      });
    },
    lyrics(container, lyrics, manualLyrics) {
      if (!container) return;
      if (lyrics && lyrics.length) {
        container.innerHTML = lyrics.map((w, i) =>
          '<span class="word" data-word-idx="' + i + '">' + w.word + '</span>'
        ).join(' ');
      } else if (manualLyrics) {
        container.innerHTML = manualLyrics.split('\n').map((line) =>
          '<div style="margin-bottom:0.5em;">' + line + '</div>'
        ).join('');
      } else {
        container.innerHTML = '<div class="muted">Enginn lagatexti tiltækur</div>';
      }
    },
    songList(songs, onSelect) {
      if (!karaokeSongList) return;
      karaokeSongList.innerHTML = songs.map((s) =>
        '<div class="karaoke-song-item" data-song-id="' + s.id + '">' +
          '<div class="song-info"><div class="song-title">' + s.title + '</div>' +
          '<div class="song-artist">' + (s.artist || s.addedBy) + '</div></div>' +
          '<span class="karaoke-badge ' + s.status + '">' +
          (s.status === 'ready' ? 'Tilbúið' : s.status === 'transcribing' ? 'Umritun...' : s.status === 'error' ? 'Villa' : 'Hlaðið') +
          '</span></div>'
      ).join('');
      karaokeSongList.querySelectorAll('.karaoke-song-item').forEach((el) => {
        el.addEventListener('click', (ev) => {
          ev.stopPropagation();
          onSelect(el.dataset.songId);
        });
      });
    },
  };

  function parseVttSegments(vttText) {
    if (!vttText || typeof vttText !== 'string') return [];
    const lines = vttText.split(/\r?\n/);
    const segments = [];
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i].trim();
      if (!line || line === 'WEBVTT' || /^\d+$/.test(line)) continue;
      if (!line.includes('-->')) continue;
      const parts = line.split('-->');
      if (parts.length !== 2) continue;
      const start = toSeconds(parts[0].trim());
      const end = toSeconds(parts[1].trim());
      const wordLine = (lines[i + 1] || '').trim();
      if (!Number.isFinite(start) || !Number.isFinite(end) || !wordLine) continue;
      segments.push({ word: wordLine, start, end });
    }
    return segments;
  }

  function toSeconds(vttTs) {
    const m = /^(\d+):(\d{2}):(\d{2})\.(\d{3})$/.exec(vttTs);
    if (!m) return NaN;
    return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + (Number(m[4]) / 1000);
  }

  function clearAudioTrack() {
    if (!karaokeAudio) return;
    const existing = karaokeAudio.querySelector('track[data-karaoke-track="1"]');
    if (existing) existing.remove();
    if (karaokeVttTrackUrl) {
      URL.revokeObjectURL(karaokeVttTrackUrl);
      karaokeVttTrackUrl = null;
    }
  }

  function setAudioVttTrack(vttText) {
    if (!karaokeAudio || !vttText) return;
    clearAudioTrack();
    const blob = new Blob([vttText], { type: 'text/vtt' });
    karaokeVttTrackUrl = URL.createObjectURL(blob);
    const track = document.createElement('track');
    track.kind = 'subtitles';
    track.label = 'Lyrics';
    track.srclang = 'is';
    track.default = true;
    track.src = karaokeVttTrackUrl;
    track.setAttribute('data-karaoke-track', '1');
    karaokeAudio.appendChild(track);
  }

  const karaokePlayback = {
    sync(currentTime) {
      if (!karaokeLyricsData.length) return;
      const containers = [karaokeLyrics, karaokeFsLyrics].filter(Boolean);
      containers.forEach((container) => {
        const words = container.querySelectorAll('.word');
        words.forEach((el, i) => {
          const w = karaokeLyricsData[i];
          if (!w) return;
          el.classList.remove('active', 'past');
          if (currentTime >= w.start && currentTime <= w.end) el.classList.add('active');
          else if (currentTime > w.end) el.classList.add('past');
        });
        const activeEl = container.querySelector('.word.active');
        if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    },
    startSyncLoop() {
      if (karaokeAnimFrame) cancelAnimationFrame(karaokeAnimFrame);
      function loop() {
        if (karaokeAudio && !karaokeAudio.paused) {
          karaokePlayback.sync(karaokeAudio.currentTime);
          const dur = karaokeAudio.duration || 1;
          const pct = (karaokeAudio.currentTime / dur) * 100;
          if (karaokeSeek) karaokeSeek.value = pct;
          if (karaokeFsSeek) karaokeFsSeek.value = pct;
          const m = Math.floor(karaokeAudio.currentTime / 60);
          const s = Math.floor(karaokeAudio.currentTime % 60);
          const timeStr = m + ':' + String(s).padStart(2, '0');
          if (karaokeTime) karaokeTime.textContent = timeStr;
          if (karaokeFsTime) karaokeFsTime.textContent = timeStr;
        }
        karaokeAnimFrame = requestAnimationFrame(loop);
      }
      loop();
    },
    togglePlay() {
      if (!karaokeAudio || !karaokeAudio.src) return;
      if (karaokeAudio.paused) {
        karaokeAudio.play();
        if (karaokePlayBtn) karaokePlayBtn.innerHTML = '&#10074;&#10074;';
        if (karaokeFsPlay) karaokeFsPlay.innerHTML = '&#10074;&#10074;';
        karaokePlayback.startSyncLoop();
      } else {
        karaokeAudio.pause();
        if (karaokePlayBtn) karaokePlayBtn.innerHTML = '&#9654;';
        if (karaokeFsPlay) karaokeFsPlay.innerHTML = '&#9654;';
      }
    },
  };

  if (karaokeFile) karaokeFile.addEventListener('change', (ev) => {
    ev.stopPropagation();
    const file = karaokeFile.files[0];
    if (!file) { karaokeFileData = null; if (karaokeUploadBtn) karaokeUploadBtn.disabled = true; return; }
    if (file.size > 10 * 1024 * 1024) {
      if (karaokeStatus) karaokeStatus.textContent = 'Skrá of stór (hámark 10MB)';
      karaokeFileData = null;
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      karaokeFileData = reader.result;
      if (karaokeUploadBtn) karaokeUploadBtn.disabled = false;
      if (karaokeStatus) karaokeStatus.textContent = file.name + ' (' + (file.size / 1024 / 1024).toFixed(1) + ' MB)';
    };
    reader.readAsDataURL(file);
  });

  if (karaokeUploadBtn) karaokeUploadBtn.addEventListener('click', async (ev) => {
    ev.stopPropagation();
    const title = karaokeTitle ? karaokeTitle.value.trim() : '';
    const artist = karaokeArtist ? karaokeArtist.value.trim() : '';
    const addedBy = karaokeAddedBy ? karaokeAddedBy.value.trim() : '';
    const manualLyrics = karaokeManualLyrics ? karaokeManualLyrics.value.trim() : '';
    if (!title || !addedBy) {
      if (karaokeStatus) karaokeStatus.textContent = 'Heiti lags og nafn eru nauðsynleg.';
      return;
    }
    if (!karaokeFileData && !manualLyrics) {
      if (karaokeStatus) karaokeStatus.textContent = 'Veldu hljóðskrá eða límdu lagatexta.';
      return;
    }
    karaokeUploadBtn.disabled = true;
    if (karaokeStatus) karaokeStatus.textContent = 'Hleð upp...';
    try {
      if (karaokeFileData) {
        const res = await fetch('/api/karaoke/upload?slug=' + encodeURIComponent(currentSlug), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, artist, addedBy, audioBase64: karaokeFileData })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Mistókst');
        if (karaokeStatus) karaokeStatus.textContent = 'Lag hlaðið upp! Umritun í gangi...';
        try {
          await fetch('/api/karaoke/transcribe?slug=' + encodeURIComponent(currentSlug) + '&id=' + data.song.id, { method: 'POST' });
        } catch {}
        if (manualLyrics) {
          await fetch('/api/karaoke/lyrics?slug=' + encodeURIComponent(currentSlug) + '&id=' + data.song.id, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lyrics: manualLyrics })
          });
        }
      } else if (manualLyrics) {
        if (karaokeStatus) karaokeStatus.textContent = 'Lagatexti eingöngu — hljóðskrá vantar til að spila.';
      }
      if (karaokeTitle) karaokeTitle.value = '';
      if (karaokeArtist) karaokeArtist.value = '';
      if (karaokeManualLyrics) karaokeManualLyrics.value = '';
      karaokeFileData = null;
      if (karaokeFile) karaokeFile.value = '';
      loadKaraokeSongs();
    } catch (err) {
      if (karaokeStatus) karaokeStatus.textContent = 'Villa: ' + err.message;
    }
    karaokeUploadBtn.disabled = true;
  });

  async function loadKaraokeSongs() {
    if (!karaokeSongList) return;
    try {
      const songs = await karaokeApi.listSongs();
      karaokeRender.songList(songs, openKaraokePlayer);
    } catch {}
  }

  async function openKaraokePlayer(songId) {
    if (!karaokePlayerView || !karaokeAudio) return;
    try {
      const meta = await karaokeApi.getSongMeta(songId);
      const vttSegments = parseVttSegments(meta.vtt || '');
      karaokeLyricsData = vttSegments.length ? vttSegments : (meta.lyrics || []);
      if (karaokeNowTitle) karaokeNowTitle.textContent = meta.title;
      if (karaokeNowArtist) karaokeNowArtist.textContent = meta.artist || meta.addedBy || '';
      karaokeAudio.pause();
      clearAudioTrack();
      if (meta.hasAudio) {
        karaokeAudio.src = await karaokeApi.getSongAudio(songId);
        if (meta.vtt) setAudioVttTrack(meta.vtt);
        karaokeAudio.load();
        if (karaokePlayBtn) karaokePlayBtn.disabled = false;
        if (karaokeFsPlay) karaokeFsPlay.disabled = false;
      } else {
        karaokeAudio.src = '';
        karaokeAudio.load();
        if (karaokePlayBtn) karaokePlayBtn.disabled = true;
        if (karaokeFsPlay) karaokeFsPlay.disabled = true;
        if (karaokeStatus) karaokeStatus.textContent = 'Þetta lag er texti+grip (engin hljóðskrá tengd).';
      }
      if (karaokePlayBtn) karaokePlayBtn.innerHTML = '&#9654;';
      if (karaokeFsPlay) karaokeFsPlay.innerHTML = '&#9654;';
      karaokeRender.lyrics(karaokeLyrics, karaokeLyricsData, meta.manualLyrics);
      if (karaokeFsLyrics) karaokeRender.lyrics(karaokeFsLyrics, karaokeLyricsData, meta.manualLyrics);
      karaokeRender.chords(meta);
      karaokePlayerView.classList.add('active');
      if (karaokeUploadView) karaokeUploadView.style.display = 'none';
    } catch {}
  }

  if (karaokePlayBtn) karaokePlayBtn.addEventListener('click', (ev) => { ev.stopPropagation(); karaokePlayback.togglePlay(); });
  if (karaokeFsPlay) karaokeFsPlay.addEventListener('click', (ev) => { ev.stopPropagation(); karaokePlayback.togglePlay(); });

  [karaokeSeek, karaokeFsSeek].forEach((seek) => {
    if (seek) seek.addEventListener('input', (ev) => {
      ev.stopPropagation();
      if (karaokeAudio && karaokeAudio.duration) karaokeAudio.currentTime = (seek.value / 100) * karaokeAudio.duration;
    });
  });

  if (karaokeBackBtn) karaokeBackBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    if (karaokeAudio) { karaokeAudio.pause(); karaokeAudio.src = ''; }
    clearAudioTrack();
    if (karaokeAnimFrame) cancelAnimationFrame(karaokeAnimFrame);
    if (karaokePlayerView) karaokePlayerView.classList.remove('active');
    if (karaokeUploadView) karaokeUploadView.style.display = '';
    if (karaokePlayBtn) karaokePlayBtn.innerHTML = '&#9654;';
    if (karaokePlayBtn) karaokePlayBtn.disabled = false;
    if (karaokeFsPlay) karaokeFsPlay.disabled = false;
    karaokeRender.chords(null);
    loadKaraokeSongs();
  });

  if (karaokeFullscreenBtn) karaokeFullscreenBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    if (karaokeFullscreen) karaokeFullscreen.classList.add('open');
  });
  if (karaokeFsClose) karaokeFsClose.addEventListener('click', (ev) => {
    ev.stopPropagation();
    if (karaokeFullscreen) karaokeFullscreen.classList.remove('open');
  });

  if (karaokeAudio) karaokeAudio.addEventListener('ended', () => {
    if (karaokePlayBtn) karaokePlayBtn.innerHTML = '&#9654;';
    if (karaokeFsPlay) karaokeFsPlay.innerHTML = '&#9654;';
  });

  karaokeRender.chords(null);
  loadKaraokeSongs();
}


if (typeof window !== "undefined") {
  window.initKaraokeModule = initKaraokeModule;
}
`;

export default karaokeModuleSource;
