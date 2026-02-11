import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════
// 📖 BÓK LÍFSINS — SPURNINGALEIKUR ÓMARS
// Arcade Edition with High Scores & Stats
// ═══════════════════════════════════════════

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZÆÐÞÖÁÉÍÓÚÝ ".split("");

const questions = [
  {
    id: 1, year: 1976, cat: "🐣 Upphafið",
    q: "Þegar pabbi sá Ómar nýfæddan í fyrsta sinn, hverju líkti hann honum við?",
    opts: ["Meðalstóran þorsk", "Litla hvalreki", "Stóran lúðu", "Nýfæddan sel"],
    ans: 0,
    exp: "Pabbi var sjómaður og sagði: \"Þetta er meðalstór þorskur!\" — 5 kíló og 54 cm.",
    fun: "Fæddist með sogklukku — eins og hasarhetja sem þurfti aðstoð við landgöngu."
  },
  {
    id: 2, year: 1976, cat: "🍼 Barnæska",
    q: "Hvað fékk Ómar í stað snuðs (pacifier)?",
    opts: ["Þurrkaðan harðfisk", "Soðinn fisk", "Lýsi á skeið", "Brauðsneið með smjöri"],
    ans: 1,
    exp: "Enginn pacifier — bara soðinn fiskur, kartöflur og lýsi. Orkubolti með Omega-3 í æð!",
    fun: "v1.0 útgáfan — \"lifði fæðinguna og byrjaði strax að grafa upp bug reports.\""
  },
  {
    id: 3, year: 1981, cat: "🥣 Leikskólinn",
    q: "Hvað var Ómar neyddur til að borða í leikskólanum?",
    opts: ["Grænmetissúpu", "Bragðlausan hafragraut", "Lýsi á hverjum morgni", "Harðsoðin egg"],
    ans: 1,
    exp: "Allir þurftu að klára hafragrautinn — neyddur til að sitja þar til diskurinn tæmdist!",
    fun: "Fyrsti árekstur við stjórn og þvingun. Heima var maturinn bragðlaus, en hjá pabba lærði hann að elska mat."
  },
  {
    id: 4, year: 1982, cat: "🕷️ Soffía frænka",
    q: "Hvaða hættuverkefni fékk Soffía frænka litla Ómar á hendur?",
    opts: ["Gæta systur sinni", "Taka köngulær úr sturtunni", "Fara einn í búð", "Keyra dráttarvél"],
    ans: 1,
    exp: "\"Þú ert karlmaðurinn á heimilinu — taka köngulærnar úr sturtunni.\" Hann var hræddur en trúði henni!",
    fun: "Soffía kenndi honum að maður getur búið til sínar reglur og verið samt góð manneskja."
  },
  {
    id: 5, year: 1982, cat: "💻 Tölvutímabilið",
    q: "Stebbi (kærasti mömmu) gaf Ómari eitthvað sem breytti öllu. Hvað?",
    opts: ["Sinclair Spectrum tölvu", "Ensku kennslubók", "Trommubúnað", "Atari leikjatölvu"],
    ans: 0,
    exp: "Stebbi, trommari í Stuðmönnum, bjargaði honum frá einsemd með Sinclair Spectrum og alvöru athygli.",
    fun: "\"Stebbi gaf mér fyrstu línuna í kóðann sem varð ég sjálfur.\" — Upphaf tölvumannsins."
  },
  {
    id: 6, year: 1990, cat: "📺 Keflavíkursveit",
    q: "Hvaða kvikmyndahetja var fyrirmynd Ómars sem enginn jafnaldri þekkti?",
    opts: ["James Bond", "Indiana Jones", "Rambo", "MacGyver"],
    ans: 1,
    exp: "Indiana Jones á vídeóspólu! Kanalsjónvarpið streymdi inn enskri menningu sem enginn annar skildi.",
    fun: "\"Alltaf öðruvísi, alltaf utan við normið\" — menningarleg einangrun sem varð styrkleiki."
  },
  {
    id: 7, year: 1992, cat: "🚗 Fiat Uno",
    q: "Hvaðan fékk 16 ára Ómar númeraplötur á Fiat Uno bílinn?",
    opts: ["Úr ruslatunnu", "Af gömlum Buick í bílageymslu", "Frá lögreglumanni", "Smíðaði þær sjálfur"],
    ans: 1,
    exp: "Grár Buick frá 50-áratugnum sem hreyfðist aldrei. \"Lánaði\" afturplötuna og skrifaði númer á pappaspjald!",
    fun: "Afturendi Buicksins var klestur upp við vegg — enginn tók eftir neinu."
  },
  {
    id: 8, year: 1992, cat: "🚔 Lögreglan",
    q: "Þegar lögreglan stöðvaði Ómar á Fiatnum, hvað gerði hann?",
    opts: ["Sagðist vera sendiráðsmaður", "Gaf ranga kennitölu (75 í stað 76)", "Þóttist vera sofandi", "Sagði bíllinn tilheyrði pabba"],
    ans: 1,
    exp: "Sagðist fæddur 1975! Lögreglan: \"Farðu þangað sem þú þarft og drífðu þig heim.\"",
    fun: "Vinirnir þóttust vera áfengisdauðir í bílnum — og voru hissa þegar hann slapp!"
  },
  {
    id: 9, year: 1992, cat: "🚗 Fiat Uno",
    q: "Hvað gerðu þeir þegar dekkið sprakk síðar í Keflavík?",
    opts: ["Hringdu í Vegaþjónustuna", "Gengu heim", "Stálu varadekkjum úr ólæstum bílum", "Skutluðu á 3 dekkjum"],
    ans: 2,
    exp: "Fundu bíla með ólæstu skotti — tóku varadekkið plús eitt aukalega úr næsta Fiat!",
    fun: "Ökunnarinn seinna: \"Þú hefur klárlega keyrt áður.\" Ómar: \"Já... í sveitinni.\""
  },
  {
    id: 10, year: 1999, cat: "📞 Tölvun",
    q: "Hvernig fékk Ómar fyrstu vinnuna í tölvubransanum eftir 8 ár á sjó?",
    opts: ["Sótti um 50 störf", "Símtal: \"Viltu kíkja í spjall?\"", "Vann forritunarkeppni", "Frændi fékk honum starf"],
    ans: 1,
    exp: "Davíð í Tölvun hringdi og bauð í spjall. Eitt símtal breytti öllu — hætti á sjónum!",
    fun: "\"Toy Story Claw\" mynstur — hann virkar best þegar hann er valinn, ekki þegar hann velur."
  },
  {
    id: 11, year: 1999, cat: "📚 MCSE",
    q: "Hversu mörg MCSE-próf tók Ómar á 8 vikum?",
    opts: ["3 próf", "4 próf", "6 próf", "8 próf"],
    ans: 2,
    exp: "Sex próf á átta vikum! Las bækurnar á ensku. Féll tvisvar en gafst aldrei upp.",
    fun: "ADHD hyperfocus sem career-launcher — allt orkuflóðið beint í eitt verkefni."
  },
  {
    id: 12, year: 2000, cat: "👶 Magnús",
    q: "Hvaða ráð sagði Magnús Örn (sonur hans) honum sem varð mantra?",
    opts: ["\"Slökktu á tölvunni, pabbi\"", "\"TAH: Task At Hand — eitt í einu\"", "\"Þú ert nógu góður\"", "\"Hættu að pæla\""],
    ans: 1,
    exp: "TAH: Task At Hand — aðeins eitt task í einu. Frá eigin syni kom ADHD-lausnin sem virkaði!",
    fun: "Stundum kenna börnin okkur það sem engin kennari getur."
  },
  {
    id: 13, year: 2001, cat: "☀️ Kanarí",
    q: "Hvað gerðu Ómar og pabbi hans saman á Kanaríeyjum til sátta?",
    opts: ["Fóru á hvalaskoðun", "Prentuðu mynd af ömmu á boli", "Fóru á fjallið", "Keyrðu á vespu"],
    ans: 1,
    exp: "Prentuðu mynd af ömmu á boli fyrir jólin! Hlátur og vinátta eftir erfitt tímabil.",
    fun: "Fyrsta raunverulega sáttin eftir 3 ár af þögn og misskilningi."
  },
  {
    id: 14, year: 2002, cat: "🎉 Partý",
    q: "Hvað sáu Ómar og Tryggvi fyrst á fyrsta partýinu hjá vinkonu Fjólu?",
    opts: ["DJ að spila Stuðmenn", "Stelpur í fatapóker, ein nakin ofan til", "Veislu í garðinum", "Alla sofandi á gólfinu"],
    ans: 1,
    exp: "Bringubúspartý! \"Vá! Er þetta bara strax besta partý sem við höfum nokkurn tímann verið boðið í!\"",
    fun: "Upphafið að 20+ ára vináttu við Fjólu Dís."
  },
  {
    id: 15, year: 2002, cat: "👦 Atli",
    q: "Hvernig endurheimuðu Ómar og Atli barnavináttu sína eftir ár í fjarlægð?",
    opts: ["Facebook skilaboð", "Ómar fletti upp í Frammáli (símaskrá framhaldsskóla)", "Mættust á gangi", "Hittust á djamminu"],
    ans: 1,
    exp: "Vallý (barnsmóðir) átti bók \"Frammál\" — Ómar fletti Atla upp, hringdi í heimasíma og þeir tengdust aftur!",
    fun: "Atli mætti svo á 20 ára afmælið og vináttan tók við þar sem hún hafði hætt — 40 ár og enn."
  },
  {
    id: 16, year: 2019, cat: "💕 Preelley",
    q: "Hvernig lýsti Ómar því sem honum líkar best við Þórey?",
    opts: ["\"Gáfaðasta manneskjan\"", "\"Opin, skemmtileg og flott brjóst\"", "\"Besti kokkurinn\"", "\"Skilur barnið í mér\""],
    ans: 1,
    exp: "Heiðarleg svör í brúðkaupseyðublaðinu! \"...og hún virðist skilja mig oftar en aðrir.\"",
    fun: "Bað henni að byrja \"eins og í 10 bekk\" — fyrst poke, svo date, svo kaffi."
  },
  {
    id: 17, year: 2020, cat: "💊 ADHD",
    q: "Hvað hélt Ómar þegar hann fékk ADHD-greiningu og lyf?",
    opts: ["Hann hélt hann myndi \"lagast\"", "Hann hélt hann yrði frægur", "Ekkert myndi breytast", "Hann fengi bifreið"],
    ans: 0,
    exp: "\"Ég hélt ég væri loksins að fara að lagast. Það var hreint ekki svona.\" Svo byrjaði lyfjaferðalagið.",
    fun: "Strattera, Ritalín, Elvanse — hvert lyf með sína sögu, hliðarverkanir og lexíu."
  },
  {
    id: 18, year: 2023, cat: "🌿 Sjálfsskilningur",
    q: "Samkvæmt Ómari, hvenær breytist \"notkun\" í \"fíkn\"?",
    opts: ["Á hverjum degi", "Þegar maður fer að fela og skammast sín", "Of mikill peningur", "Þegar maður missir vinnuna"],
    ans: 1,
    exp: "\"Þegar þú ferð að fela, þegar þú skammast þín — þá breytist notkunin í fíkn.\" Leyndin varð vandamálið.",
    fun: "Sjálfslyfjakenningin: gras, koffín, verkefni, ást — allt leit að dopamíni."
  },
  {
    id: 19, year: 2025, cat: "🤒 Kuldinn",
    q: "Hvernig lýsti Ómar veikindunum í nóvember 2025?",
    opts: ["\"Eins og flensa\"", "\"Líkaminn á flight mode — ljósin slökktu\"", "\"Bara kvef\"", "\"Allt í lagi eftir tvo daga\""],
    ans: 1,
    exp: "\"Líkaminn ákvað að fara á flight mode og slökkva ljósin.\" 401: Body Not Found. Festist á milli tveggja boot screens!",
    fun: "Singles Day 11.11 og líkaminn tók frí. Hann lýsir sér sem tölvu að endurræsa."
  },
  {
    id: 20, year: 2026, cat: "🍺 Budapest",
    q: "Hversu marga bjóra drukku þeir á 4 dögum í Budapest?",
    opts: ["20 bjóra", "30 bjóra", "40 bjóra", "50 bjóra"],
    ans: 2,
    exp: "40 bjórar á fjórum dögum og 3000 km! Labbaði yfir allar brýr Dónár.",
    fun: "Gleymdi alveg að taka myndir. \"Alls konar líf í gangi, og við einhvern veginn bara þar.\""
  }
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ──────────── CONFETTI ────────────
function Confetti() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999 }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${Math.random() * 100}%`,
          top: "-10px",
          width: `${5 + Math.random() * 8}px`,
          height: `${5 + Math.random() * 8}px`,
          backgroundColor: ["#FF6B35","#F7C948","#E63946","#457B9D","#E040FB","#00BFA5","#FF4081","#7C4DFF"][Math.floor(Math.random()*8)],
          borderRadius: Math.random()>0.5?"50%":"2px",
          animation: `cFall ${2+Math.random()*3}s ease-in forwards`,
          animationDelay: `${Math.random()*1.5}s`,
        }}/>
      ))}
    </div>
  );
}

// ──────────── ARCADE NAME ENTRY ────────────
function ArcadeNameEntry({ onSubmit }) {
  const [chars, setChars] = useState([0, 0, 0]);
  const [activeSlot, setActiveSlot] = useState(0);
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("name"); // name | phone
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 500);
    return () => clearInterval(t);
  }, []);

  const scroll = (dir) => {
    setChars(prev => {
      const n = [...prev];
      n[activeSlot] = (n[activeSlot] + dir + CHARS.length) % CHARS.length;
      return n;
    });
  };

  const name3 = chars.map(i => CHARS[i]).join("");

  return (
    <div style={{ animation: "slideUp 0.6s ease-out", textAlign: "center" }}>
      {/* CRT scanline overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
        mixBlendMode: "multiply"
      }}/>

      <div style={{ fontSize: 11, letterSpacing: 6, color: "#F7C948", marginBottom: 4, textTransform: "uppercase" }}>
        Insert Coin
      </div>
      <h1 style={{
        fontSize: 26, fontWeight: 700, margin: "0 0 6px",
        fontFamily: "'Courier New', monospace",
        color: "#00ff88",
        textShadow: "0 0 10px #00ff88, 0 0 20px #00ff8844"
      }}>
        ENTER YOUR NAME
      </h1>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 28, fontFamily: "monospace" }}>
        3 STAFIR — EINS OG Í GÖMLU SPILASÖLUM
      </p>

      {step === "name" && (
        <>
          {/* 3 character slots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 28 }}>
            {[0,1,2].map(slot => (
              <div key={slot} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                {/* Up arrow */}
                <button onClick={() => { setActiveSlot(slot); setTimeout(() => scroll(-1), 0); }} style={{
                  background: "none", border: "none", cursor: "pointer", padding: 4,
                  color: activeSlot === slot ? "#00ff88" : "#444", fontSize: 20, transition: "color 0.2s"
                }}>▲</button>

                {/* Character display */}
                <div style={{
                  width: 64, height: 80,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 48, fontWeight: 700,
                  fontFamily: "'Courier New', monospace",
                  color: activeSlot === slot ? "#00ff88" : "#F7C948",
                  textShadow: activeSlot === slot ? "0 0 15px #00ff88, 0 0 30px #00ff8844" : "0 0 8px #F7C94844",
                  background: activeSlot === slot ? "rgba(0,255,136,0.06)" : "rgba(255,255,255,0.02)",
                  border: activeSlot === slot ? "2px solid #00ff88" : "2px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  opacity: activeSlot === slot && blink ? 1 : activeSlot === slot ? 0.7 : 1
                }}
                onClick={() => setActiveSlot(slot)}
                >
                  {CHARS[chars[slot]]}
                </div>

                {/* Down arrow */}
                <button onClick={() => { setActiveSlot(slot); setTimeout(() => scroll(1), 0); }} style={{
                  background: "none", border: "none", cursor: "pointer", padding: 4,
                  color: activeSlot === slot ? "#00ff88" : "#444", fontSize: 20, transition: "color 0.2s"
                }}>▼</button>
              </div>
            ))}
          </div>

          {/* Slot selection dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
            {[0,1,2].map(s => (
              <div key={s} onClick={() => setActiveSlot(s)} style={{
                width: 10, height: 10, borderRadius: "50%", cursor: "pointer",
                background: activeSlot === s ? "#00ff88" : "#333",
                boxShadow: activeSlot === s ? "0 0 8px #00ff88" : "none",
                transition: "all 0.2s"
              }}/>
            ))}
          </div>

          {/* Preview */}
          <div style={{
            fontSize: 14, color: "#888", marginBottom: 24, fontFamily: "monospace"
          }}>
            PLAYER: <span style={{ color: "#00ff88", fontSize: 18, fontWeight: 700 }}>{name3}</span>
          </div>

          <button onClick={() => setStep("phone")} style={{
            background: "linear-gradient(135deg, #00ff88, #00cc6a)",
            color: "#0a0a1a", border: "none", padding: "14px 40px",
            fontSize: 16, fontWeight: 700, borderRadius: 8, cursor: "pointer",
            fontFamily: "'Courier New', monospace", letterSpacing: 2,
            boxShadow: "0 0 20px rgba(0,255,136,0.3)",
            transition: "transform 0.2s"
          }}
          onMouseOver={e => e.target.style.transform="scale(1.05)"}
          onMouseOut={e => e.target.style.transform="scale(1)"}
          >
            ÁFRAM →
          </button>
        </>
      )}

      {step === "phone" && (
        <>
          <div style={{
            fontSize: 36, fontFamily: "'Courier New', monospace",
            color: "#F7C948", textShadow: "0 0 10px #F7C94844",
            marginBottom: 16, fontWeight: 700
          }}>
            {name3}
          </div>

          <p style={{ fontSize: 13, color: "#666", marginBottom: 16, fontFamily: "monospace" }}>
            SLÁÐU INN SÍMANÚMER TIL AUÐKENNINGAR
          </p>

          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/[^\d-]/g, "").slice(0, 11))}
            placeholder="000-0000"
            style={{
              background: "rgba(0,255,136,0.06)",
              border: "2px solid #00ff88",
              borderRadius: 8,
              padding: "14px 20px",
              fontSize: 28,
              fontFamily: "'Courier New', monospace",
              color: "#00ff88",
              textAlign: "center",
              width: 220,
              outline: "none",
              textShadow: "0 0 8px #00ff8844",
              letterSpacing: 4,
              marginBottom: 24
            }}
            autoFocus
          />

          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <button onClick={() => setStep("name")} style={{
              background: "rgba(255,255,255,0.06)", color: "#888",
              border: "1px solid #333", padding: "12px 24px",
              fontSize: 14, borderRadius: 8, cursor: "pointer",
              fontFamily: "'Courier New', monospace"
            }}>
              ← TILBAKA
            </button>
            <button
              onClick={() => { if (phone.length >= 7) onSubmit(name3, phone); }}
              disabled={phone.length < 7}
              style={{
                background: phone.length >= 7 ? "linear-gradient(135deg, #00ff88, #00cc6a)" : "#222",
                color: phone.length >= 7 ? "#0a0a1a" : "#555",
                border: "none", padding: "12px 32px",
                fontSize: 16, fontWeight: 700, borderRadius: 8,
                cursor: phone.length >= 7 ? "pointer" : "default",
                fontFamily: "'Courier New', monospace", letterSpacing: 2,
                boxShadow: phone.length >= 7 ? "0 0 20px rgba(0,255,136,0.3)" : "none"
              }}
            >
              BYRJA LEIK! 🕹️
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ──────────── LEADERBOARD ────────────
function Leaderboard({ scores, currentPlayer, onClose, onPlay }) {
  const sorted = [...scores].sort((a, b) => b.highScore - a.highScore);
  const mostPlayed = [...scores].sort((a, b) => b.gamesPlayed - a.gamesPlayed);
  const bestFirst = [...scores].sort((a, b) => (b.bestFirstAttempt || 0) - (a.bestFirstAttempt || 0));
  const worstFirst = [...scores].sort((a, b) => (b.worstFirstAttempt || 0) - (a.worstFirstAttempt || 0));

  const [tab, setTab] = useState("high");

  const tabs = [
    { id: "high", label: "🏆 High Score", color: "#F7C948" },
    { id: "plays", label: "🔁 Flest spil", color: "#00BFA5" },
    { id: "best1st", label: "✅ Best fyrsta", color: "#4CAF50" },
    { id: "worst1st", label: "💀 Verst fyrsta", color: "#E63946" },
  ];

  const getList = () => {
    switch(tab) {
      case "high": return sorted;
      case "plays": return mostPlayed;
      case "best1st": return bestFirst;
      case "worst1st": return worstFirst;
      default: return sorted;
    }
  };

  const getValue = (s) => {
    switch(tab) {
      case "high": return `${s.highScore} stig`;
      case "plays": return `${s.gamesPlayed}x spilað`;
      case "best1st": return `${s.bestFirstAttempt || 0} rétt`;
      case "worst1st": return `${s.worstFirstAttempt || 0} vitlaust`;
      default: return s.highScore;
    }
  };

  const list = getList();

  return (
    <div style={{ animation: "slideUp 0.5s ease-out" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: 5, color: "#F7C948", textTransform: "uppercase", marginBottom: 4 }}>
          Hall of Fame
        </div>
        <h2 style={{
          fontSize: 24, fontWeight: 700, margin: 0,
          fontFamily: "'Courier New', monospace",
          color: "#00ff88",
          textShadow: "0 0 10px #00ff8844"
        }}>
          STIGATAFLA
        </h2>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 4, marginBottom: 20,
        overflowX: "auto", paddingBottom: 4
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.02)",
            border: tab === t.id ? `1px solid ${t.color}` : "1px solid transparent",
            borderRadius: 8, padding: "8px 12px",
            fontSize: 12, fontFamily: "'Courier New', monospace",
            color: tab === t.id ? t.color : "#666",
            cursor: "pointer", whiteSpace: "nowrap",
            transition: "all 0.2s"
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {list.length === 0 ? (
        <div style={{
          textAlign: "center", padding: 40, color: "#555",
          fontFamily: "monospace", fontSize: 14
        }}>
          ENGIR LEIKMENN ENNÞÁ — VERTU FYRSTUR!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 20 }}>
          {list.slice(0, 15).map((s, i) => {
            const isMe = currentPlayer && s.phone === currentPlayer;
            const medals = ["🥇", "🥈", "🥉"];
            return (
              <div key={s.phone} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: 8,
                background: isMe ? "rgba(0,255,136,0.08)" : i < 3 ? "rgba(247,201,72,0.04)" : "rgba(255,255,255,0.02)",
                border: isMe ? "1px solid rgba(0,255,136,0.3)" : "1px solid rgba(255,255,255,0.05)",
                fontFamily: "'Courier New', monospace",
                transition: "background 0.2s"
              }}>
                {/* Rank */}
                <span style={{
                  fontSize: i < 3 ? 20 : 14, width: 32, textAlign: "center",
                  color: i < 3 ? "#F7C948" : "#555"
                }}>
                  {i < 3 ? medals[i] : `${i + 1}.`}
                </span>

                {/* Name */}
                <span style={{
                  fontSize: 20, fontWeight: 700, letterSpacing: 3, width: 80,
                  color: isMe ? "#00ff88" : i === 0 ? "#F7C948" : "#ccc",
                  textShadow: isMe ? "0 0 8px #00ff8844" : i === 0 ? "0 0 8px #F7C94844" : "none"
                }}>
                  {s.name}
                </span>

                {/* Value */}
                <span style={{
                  flex: 1, textAlign: "right", fontSize: 13,
                  color: isMe ? "#00ff88" : "#999"
                }}>
                  {getValue(s)}
                </span>

                {/* Games played indicator */}
                {tab === "high" && (
                  <span style={{ fontSize: 10, color: "#555", width: 40, textAlign: "right" }}>
                    {s.gamesPlayed}x
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Stats summary */}
      {list.length > 0 && (
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20,
          fontFamily: "'Courier New', monospace", fontSize: 11
        }}>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, textAlign: "center" }}>
            <div style={{ color: "#F7C948", fontSize: 18, fontWeight: 700 }}>{scores.length}</div>
            <div style={{ color: "#666" }}>LEIKMENN</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, textAlign: "center" }}>
            <div style={{ color: "#00BFA5", fontSize: 18, fontWeight: 700 }}>
              {scores.reduce((sum, s) => sum + s.gamesPlayed, 0)}
            </div>
            <div style={{ color: "#666" }}>LEIKIR</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onPlay} style={{
          flex: 1, background: "linear-gradient(135deg, #00ff88, #00cc6a)",
          color: "#0a0a1a", border: "none", padding: "14px",
          fontSize: 15, fontWeight: 700, borderRadius: 8, cursor: "pointer",
          fontFamily: "'Courier New', monospace", letterSpacing: 1
        }}>
          🕹️ SPILA
        </button>
        <button onClick={onClose} style={{
          background: "rgba(255,255,255,0.06)", color: "#888",
          border: "1px solid #333", padding: "14px 20px",
          fontSize: 14, borderRadius: 8, cursor: "pointer",
          fontFamily: "'Courier New', monospace"
        }}>
          ← LOKA
        </button>
      </div>
    </div>
  );
}

// ──────────── MAIN GAME ────────────
export default function BookOfLifeArcade() {
  const [screen, setScreen] = useState("loading"); // loading, nameEntry, menu, playing, answer, result, leaderboard
  const [player, setPlayer] = useState(null); // { name, phone }
  const [scores, setScores] = useState([]);
  const [shuffled, setShuffled] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [confetti, setConfetti] = useState(false);
  const [shakeIdx, setShakeIdx] = useState(null);

  // Load scores + player from storage
  useEffect(() => {
    (async () => {
      try {
        const scoresRes = await window.storage.get("quiz-scores", true);
        if (scoresRes) setScores(JSON.parse(scoresRes.value));
      } catch {}
      try {
        const playerRes = await window.storage.get("quiz-player");
        if (playerRes) {
          setPlayer(JSON.parse(playerRes.value));
          setScreen("menu");
          return;
        }
      } catch {}
      setScreen("nameEntry");
    })();
  }, []);

  const saveScores = async (newScores) => {
    setScores(newScores);
    try { await window.storage.set("quiz-scores", JSON.stringify(newScores), true); } catch {}
  };

  const savePlayer = async (p) => {
    setPlayer(p);
    try { await window.storage.set("quiz-player", JSON.stringify(p)); } catch {}
  };

  const handleNameSubmit = (name, phone) => {
    const p = { name, phone };
    savePlayer(p);
    // Check if player exists in scores
    const exists = scores.find(s => s.phone === phone);
    if (!exists) {
      const newScores = [...scores, {
        name, phone, highScore: 0, gamesPlayed: 0,
        bestFirstAttempt: 0, worstFirstAttempt: 0,
        totalCorrect: 0, totalQuestions: 0, lastPlayed: null
      }];
      saveScores(newScores);
    }
    setScreen("menu");
  };

  const startGame = () => {
    setShuffled(shuffle(questions));
    setQIdx(0); setScore(0); setStreak(0); setBestStreak(0);
    setSelected(null); setAnswers([]);
    setScreen("playing");
  };

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const q = shuffled[qIdx];
    const isCorrect = idx === q.ans;

    if (isCorrect) {
      const ns = streak + 1;
      setScore(s => s + 10 * (ns > 2 ? 2 : 1));
      setStreak(ns);
      if (ns > bestStreak) setBestStreak(ns);
      if (ns >= 3) { setConfetti(true); setTimeout(() => setConfetti(false), 3000); }
    } else {
      setStreak(0);
      setShakeIdx(idx);
      setTimeout(() => setShakeIdx(null), 600);
    }

    setAnswers(prev => [...prev, { qId: q.id, correct: isCorrect }]);
    setTimeout(() => setScreen("answer"), 700);
  };

  const nextQuestion = () => {
    if (qIdx + 1 >= shuffled.length) {
      finishGame();
    } else {
      setQIdx(i => i + 1);
      setSelected(null);
      setScreen("playing");
    }
  };

  const finishGame = async () => {
    const correctCount = answers.filter(a => a.correct).length;
    const wrongCount = answers.filter(a => !a.correct).length;

    const updated = scores.map(s => {
      if (s.phone !== player.phone) return s;
      const isFirst = s.gamesPlayed === 0;
      return {
        ...s,
        name: player.name,
        highScore: Math.max(s.highScore, score),
        gamesPlayed: s.gamesPlayed + 1,
        bestFirstAttempt: isFirst ? correctCount : s.bestFirstAttempt,
        worstFirstAttempt: isFirst ? wrongCount : s.worstFirstAttempt,
        totalCorrect: (s.totalCorrect || 0) + correctCount,
        totalQuestions: (s.totalQuestions || 0) + shuffled.length,
        lastPlayed: new Date().toISOString()
      };
    });

    await saveScores(updated);
    setScreen("result");
  };

  const changePlayer = () => {
    setPlayer(null);
    try { window.storage.delete("quiz-player"); } catch {}
    setScreen("nameEntry");
  };

  const q = shuffled[qIdx];
  const progress = shuffled.length > 0 ? ((qIdx + 1) / shuffled.length) * 100 : 0;
  const myStats = scores.find(s => s.phone === player?.phone);

  const getGrade = () => {
    const pct = (score / (shuffled.length * 10)) * 100;
    if (pct >= 90) return { emoji: "🏆", title: "BÓK LÍFSINS MEISTARI!", desc: "Þú þekkir lífið mitt betur en ég sjálfur!" };
    if (pct >= 70) return { emoji: "⭐", title: "NÆSTUM PERFEKT!", desc: "Þú veist meira en flestir um þennan íslensku þorsk." };
    if (pct >= 50) return { emoji: "👍", title: "VEL GERT!", desc: "Góður grunnur — en það er meira að læra!" };
    return { emoji: "📖", title: "BYRJANDI", desc: "Tími til að lesa fleiri kafla úr Bók Lífsins!" };
  };

  const catColors = {
    "🐣": "#FF6B35", "🍼": "#F7C948", "🥣": "#8BC34A", "🕷️": "#9C27B0",
    "💻": "#00BFA5", "📺": "#2196F3", "🚗": "#E63946", "🚔": "#E63946",
    "📞": "#FF9800", "📚": "#795548", "👶": "#FF4081", "☀️": "#FFD54F",
    "🎉": "#E040FB", "👦": "#457B9D", "💕": "#FF4081", "💊": "#4CAF50",
    "🌿": "#66BB6A", "🤒": "#78909C", "🍺": "#FF9800"
  };

  const getCatColor = (cat) => {
    const emoji = cat?.substring(0, 2) || "";
    return catColors[emoji] || "#888";
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #050510 0%, #0a0a2e 40%, #080818 100%)",
      fontFamily: "'Georgia', serif",
      color: "#e8e4df",
      position: "relative", overflow: "hidden"
    }}>
      {confetti && <Confetti />}

      {/* CRT effect */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50,
        background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)"
      }}/>

      {/* Floating particles */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.12 }}>
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
            width: `${2+Math.random()*3}px`, height: `${2+Math.random()*3}px`,
            backgroundColor: "#00ff88", borderRadius: "50%",
            animation: `fl ${4+Math.random()*6}s ease-in-out infinite`,
            animationDelay: `${Math.random()*5}s`
          }}/>
        ))}
      </div>

      <style>{`
        @keyframes fl { 0%,100%{transform:translateY(0) scale(1);opacity:.3} 50%{transform:translateY(-20px) scale(1.5);opacity:.8} }
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cFall { 0%{transform:translateY(0) rotate(0);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes shakeX { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 15px rgba(0,255,136,.3)} 50%{box-shadow:0 0 30px rgba(0,255,136,.5)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px", position: "relative", zIndex: 1 }}>

        {/* ──── LOADING ──── */}
        {screen === "loading" && (
          <div style={{ textAlign: "center", paddingTop: 100 }}>
            <div style={{
              fontSize: 24, fontFamily: "'Courier New', monospace",
              color: "#00ff88", animation: "blink 1s infinite"
            }}>
              LOADING...
            </div>
          </div>
        )}

        {/* ──── NAME ENTRY ──── */}
        {screen === "nameEntry" && (
          <ArcadeNameEntry onSubmit={handleNameSubmit} />
        )}

        {/* ──── MENU ──── */}
        {screen === "menu" && player && (
          <div style={{ animation: "slideUp 0.5s ease-out", textAlign: "center" }}>
            <div style={{ fontSize: 11, letterSpacing: 5, color: "#F7C948", textTransform: "uppercase", marginBottom: 4 }}>
              Bók Lífsins
            </div>
            <h1 style={{
              fontSize: 24, fontWeight: 700, margin: "0 0 8px",
              fontFamily: "'Courier New', monospace",
              color: "#00ff88", textShadow: "0 0 10px #00ff8844"
            }}>
              SPURNINGALEIKUR
            </h1>

            {/* Player card */}
            <div style={{
              background: "rgba(0,255,136,0.05)",
              border: "1px solid rgba(0,255,136,0.2)",
              borderRadius: 12, padding: "16px 20px",
              marginBottom: 24, fontFamily: "'Courier New', monospace"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <span style={{
                  fontSize: 32, fontWeight: 700, letterSpacing: 6,
                  color: "#00ff88", textShadow: "0 0 12px #00ff8844"
                }}>
                  {player.name}
                </span>
              </div>
              {myStats && myStats.gamesPlayed > 0 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 10, fontSize: 12, color: "#888" }}>
                  <span>🏆 {myStats.highScore}</span>
                  <span>🎮 {myStats.gamesPlayed}x</span>
                  <span>✅ {Math.round(((myStats.totalCorrect || 0) / Math.max(myStats.totalQuestions || 1, 1)) * 100)}%</span>
                </div>
              )}
            </div>

            {/* Game info */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10,
              marginBottom: 28
            }}>
              {[
                { icon: "❓", val: "20", label: "Spurningar" },
                { icon: "⏱️", val: "~5m", label: "Tími" },
                { icon: "🏆", val: `${Math.max(...scores.map(s=>s.highScore), 0)}`, label: "Met" },
              ].map((s,i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 8px",
                  border: "1px solid rgba(255,255,255,0.06)", textAlign: "center"
                }}>
                  <div style={{ fontSize: 20 }}>{s.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#F7C948", fontFamily: "monospace" }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: "#666" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={startGame} style={{
                background: "linear-gradient(135deg, #00ff88, #00cc6a)",
                color: "#0a0a1a", border: "none", padding: "16px",
                fontSize: 18, fontWeight: 700, borderRadius: 10, cursor: "pointer",
                fontFamily: "'Courier New', monospace", letterSpacing: 2,
                animation: "glow 2s ease-in-out infinite"
              }}>
                🕹️ BYRJA LEIK
              </button>

              <button onClick={() => setScreen("leaderboard")} style={{
                background: "rgba(247,201,72,0.08)",
                color: "#F7C948", border: "1px solid rgba(247,201,72,0.3)",
                padding: "12px", fontSize: 14, borderRadius: 10, cursor: "pointer",
                fontFamily: "'Courier New', monospace", letterSpacing: 1
              }}>
                🏆 STIGATAFLA
              </button>

              <button onClick={changePlayer} style={{
                background: "none", color: "#555", border: "none",
                padding: "8px", fontSize: 12, cursor: "pointer",
                fontFamily: "'Courier New', monospace"
              }}>
                SKIPTA UM LEIKMANN
              </button>
            </div>
          </div>
        )}

        {/* ──── LEADERBOARD ──── */}
        {screen === "leaderboard" && (
          <Leaderboard
            scores={scores}
            currentPlayer={player?.phone}
            onClose={() => setScreen("menu")}
            onPlay={startGame}
          />
        )}

        {/* ──── PLAYING / ANSWER ──── */}
        {(screen === "playing" || screen === "answer") && q && (
          <div style={{ animation: "slideUp 0.35s ease-out" }}>

            {/* Top bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{
                fontFamily: "'Courier New', monospace", fontSize: 14,
                color: "#00ff88", fontWeight: 700, letterSpacing: 3
              }}>
                {player?.name}
              </span>
              <span style={{
                fontFamily: "'Courier New', monospace", fontSize: 14,
                color: "#F7C948"
              }}>
                {score} PTS
              </span>
            </div>

            {/* Progress */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                flex: 1, height: 4, background: "rgba(255,255,255,0.06)",
                borderRadius: 2, overflow: "hidden"
              }}>
                <div style={{
                  width: `${progress}%`, height: "100%",
                  background: "linear-gradient(90deg, #00ff88, #F7C948)",
                  borderRadius: 2, transition: "width 0.5s"
                }}/>
              </div>
              <span style={{ fontSize: 12, color: "#555", fontFamily: "monospace" }}>
                {qIdx+1}/{shuffled.length}
              </span>
            </div>

            {/* Streak */}
            {streak >= 2 && (
              <div style={{
                textAlign: "center", marginBottom: 12,
                fontSize: 13, color: "#FF6B35",
                fontFamily: "'Courier New', monospace",
                animation: "pulse 1s infinite"
              }}>
                🔥 {streak} Í RÖÐ! {streak >= 3 ? "2X STIG!" : ""}
              </div>
            )}

            {/* Category + Year */}
            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              <span style={{
                background: getCatColor(q.cat), color: "#fff",
                fontSize: 11, fontWeight: 700, padding: "3px 10px",
                borderRadius: 20, fontFamily: "monospace"
              }}>{q.cat}</span>
              <span style={{
                background: "rgba(255,255,255,0.08)", color: "#888",
                fontSize: 11, padding: "3px 10px", borderRadius: 20, fontFamily: "monospace"
              }}>{q.year}</span>
            </div>

            {/* Question */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12, padding: 20, marginBottom: 16
            }}>
              <h2 style={{
                fontSize: 18, fontWeight: 400, lineHeight: 1.5, margin: 0, color: "#f0ece8"
              }}>{q.q}</h2>
            </div>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {q.opts.map((opt, idx) => {
                const isSel = selected === idx;
                const isCorr = idx === q.ans;
                const done = selected !== null;
                const shaking = shakeIdx === idx;

                let bg = "rgba(255,255,255,0.03)";
                let brd = "1px solid rgba(255,255,255,0.08)";
                let col = "#d0ccc7";

                if (done && isCorr) { bg = "rgba(0,191,165,0.12)"; brd = "2px solid #00BFA5"; col = "#00E5C0"; }
                else if (done && isSel && !isCorr) { bg = "rgba(230,57,70,0.12)"; brd = "2px solid #E63946"; col = "#FF6B6B"; }

                return (
                  <button key={idx} onClick={() => handleAnswer(idx)} disabled={done} style={{
                    background: bg, border: brd, borderRadius: 10,
                    padding: "14px 16px", fontSize: 15, fontFamily: "inherit",
                    color: col, cursor: done ? "default" : "pointer",
                    textAlign: "left", transition: "all 0.2s",
                    animation: shaking ? "shakeX 0.5s" : "none",
                    display: "flex", alignItems: "center", gap: 10
                  }}
                  onMouseOver={e => { if (!done) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(0,255,136,0.3)"; }}}
                  onMouseOut={e => { if (!done) { e.currentTarget.style.background = bg; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}}
                  >
                    <span style={{
                      width: 26, height: 26, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                      background: done && isCorr ? "#00BFA5" : done && isSel && !isCorr ? "#E63946" : "rgba(255,255,255,0.08)",
                      color: done && (isCorr || (isSel && !isCorr)) ? "#fff" : "#888"
                    }}>
                      {done && isCorr ? "✓" : done && isSel && !isCorr ? "✗" : String.fromCharCode(65+idx)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {screen === "answer" && (
              <>
                <div style={{
                  animation: "slideUp 0.4s ease-out",
                  background: "rgba(0,255,136,0.04)",
                  border: "1px solid rgba(0,255,136,0.15)",
                  borderRadius: 12, padding: 18, marginBottom: 14
                }}>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: "#c8c4bf", marginBottom: 10 }}>{q.exp}</div>
                  <div style={{
                    fontSize: 12, color: "#F7C948", fontStyle: "italic",
                    borderTop: "1px solid rgba(0,255,136,0.1)", paddingTop: 10
                  }}>💡 {q.fun}</div>
                </div>
                <button onClick={nextQuestion} style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #00ff88, #00cc6a)",
                  color: "#0a0a1a", border: "none", padding: "13px",
                  fontSize: 15, fontWeight: 700, borderRadius: 10, cursor: "pointer",
                  fontFamily: "'Courier New', monospace", letterSpacing: 1
                }}>
                  {qIdx+1 >= shuffled.length ? "SJÁ NIÐURSTÖÐUR →" : "NÆSTA →"}
                </button>
              </>
            )}
          </div>
        )}

        {/* ──── RESULT ──── */}
        {screen === "result" && (
          <div style={{ animation: "slideUp 0.6s ease-out", textAlign: "center" }}>
            {score >= shuffled.length * 7 && <Confetti />}

            <div style={{ fontSize: 70, marginTop: 20, marginBottom: 4 }}>{getGrade().emoji}</div>

            <div style={{
              fontSize: 32, fontWeight: 700,
              fontFamily: "'Courier New', monospace",
              color: "#00ff88", textShadow: "0 0 12px #00ff8844",
              marginBottom: 4
            }}>
              {player?.name}
            </div>

            <h2 style={{
              fontSize: 22, fontWeight: 700, margin: "0 0 6px",
              fontFamily: "'Courier New', monospace",
              background: "linear-gradient(135deg, #F7C948, #FF6B35)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              {getGrade().title}
            </h2>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 24 }}>{getGrade().desc}</p>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { label: "STIG", val: score, col: "#F7C948" },
                { label: "RÉTT", val: `${answers.filter(a=>a.correct).length}/${shuffled.length}`, col: "#00BFA5" },
                { label: "BESTA RÖÐ", val: `${bestStreak}🔥`, col: "#FF6B35" },
              ].map((s,i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.03)", borderRadius: 12,
                  padding: "16px 8px", border: "1px solid rgba(255,255,255,0.06)"
                }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: s.col, fontFamily: "monospace" }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Answer dots */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 5, marginBottom: 24 }}>
              {answers.map((a,i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700,
                  background: a.correct ? "rgba(0,191,165,0.15)" : "rgba(230,57,70,0.15)",
                  border: `2px solid ${a.correct?"#00BFA5":"#E63946"}`,
                  color: a.correct?"#00E5C0":"#FF6B6B"
                }}>{a.correct?"✓":"✗"}</div>
              ))}
            </div>

            {/* High score check */}
            {myStats && score >= myStats.highScore && score > 0 && (
              <div style={{
                background: "rgba(247,201,72,0.08)",
                border: "1px solid rgba(247,201,72,0.3)",
                borderRadius: 10, padding: 12, marginBottom: 16,
                fontFamily: "'Courier New', monospace",
                fontSize: 14, color: "#F7C948"
              }}>
                🎉 NÝTT PERSÓNULEGT MET!
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={startGame} style={{
                background: "linear-gradient(135deg, #00ff88, #00cc6a)",
                color: "#0a0a1a", border: "none", padding: "14px",
                fontSize: 16, fontWeight: 700, borderRadius: 10, cursor: "pointer",
                fontFamily: "'Courier New', monospace", letterSpacing: 2,
                animation: "glow 2s ease-in-out infinite"
              }}>
                🕹️ SPILA AFTUR
              </button>
              <button onClick={() => setScreen("leaderboard")} style={{
                background: "rgba(247,201,72,0.08)",
                color: "#F7C948", border: "1px solid rgba(247,201,72,0.3)",
                padding: "12px", fontSize: 14, borderRadius: 10, cursor: "pointer",
                fontFamily: "'Courier New', monospace"
              }}>
                🏆 STIGATAFLA
              </button>
              <button onClick={() => setScreen("menu")} style={{
                background: "none", color: "#555", border: "none",
                padding: "8px", fontSize: 12, cursor: "pointer",
                fontFamily: "'Courier New', monospace"
              }}>
                ← AÐALVALMYND
              </button>
            </div>

            <p style={{ fontSize: 10, color: "#333", marginTop: 20, fontStyle: "italic" }}>
              Byggt á raunverulegum sögum úr Bók Lífsins — 400+ sögur frá 1976–2026
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
