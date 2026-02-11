import { useState, useEffect, useRef } from "react";

const questions = [
  {
    id: 1,
    year: 1976,
    category: "🐣 Upphafið",
    question: "Þegar pabbi sá Ómar nýfæddan í fyrsta sinn, hverju líkti hann honum við?",
    options: [
      "Meðalstóran þorsk",
      "Litla hvalreki",
      "Stóran lúðu",
      "Nýfæddan sel"
    ],
    correct: 0,
    explanation: "Pabbi var sjómaður og sagði strax: \"Þetta er meðalstór þorskur!\" — 5 kíló og 54 cm. Þetta varð uppáhalds fjölskyldusagan.",
    funFact: "Ómar fæddist með sogklukku — eins og alvöru hasarhetja sem þurfti aðstoð við landgöngu."
  },
  {
    id: 2,
    year: 1976,
    category: "🍼 Barnæska",
    question: "Hvað fékk Ómar í stað snuðs (pacifier)?",
    options: [
      "Þurrkaðan harðfisk",
      "Soðinn fisk",
      "Lýsi á skeið",
      "Brauðsneið með smjöri"
    ],
    correct: 1,
    explanation: "Pabbi var sjómaður og mamma sá um að halda honum á beinni braut með kartöflum og soðnum fiski. Enginn pacifier — bara Omega-3 í æð!",
    funFact: "Ómar lýsir sjálfum sér sem \"orkubolti með Omega-3 í æð\" frá fæðingu."
  },
  {
    id: 3,
    year: 1992,
    category: "🚗 Fiat Uno Ævintýrið",
    question: "Hvaðan fékk 16 ára Ómar númeraplötur á Fiat Uno bílinn sinn?",
    options: [
      "Úr ruslatunnu við bílasöluna",
      "Af gömlum Buick í bílageymslu",
      "Frá frænda sem var lögreglumanni",
      "Hann smíðaði þær sjálfur"
    ],
    correct: 1,
    explanation: "Í bílageymslu Kidda var stór grár Buick frá 50/60 áratugnum sem hreyfðist aldrei. Ómar \"fékk lánaða\" afturplötuna — og skrifaði sama númer á pappaspjald fyrir aftan á Fiatinn!",
    funFact: "Afturendi Buicksins var klestur upp við vegg, svo enginn tók eftir að platan vantaði."
  },
  {
    id: 4,
    year: 1992,
    category: "🚔 Fiat Uno Ævintýrið",
    question: "Þegar lögreglan stöðvaði Ómar á Fiatnum, hvað gerði hann til að sleppa?",
    options: [
      "Sagðist vera sendiráðsmaður",
      "Gaf ranga kennitölu (fæddur 75 í stað 76)",
      "Þóttist vera sofandi",
      "Sagði að bíllinn tilheyrði pabba"
    ],
    correct: 1,
    explanation: "Hann sagðist fæddur 1975 í stað 1976. Lögreglan fann enga sviptingu á þeirri kennitölu og sagði: \"Farðu þangað sem þú þarft að fara og gerðu það sem þú þarft að gera.\"",
    funFact: "Vinirnir þóttust vera áfengisdauðir í bílnum á meðan Ómar var í yfirheyrslunni."
  },
  {
    id: 5,
    year: 1992,
    category: "🚗 Fiat Uno Ævintýrið",
    question: "Hvað gerðu Ómar og vinirnir þegar dekkið sprakk á Fiatnum síðar um kvöldið?",
    options: [
      "Hringdu í Vegaþjónustuna",
      "Gengu heim til Keflavíkur",
      "Fóru í skott ólæstra bíla og stálu varadekkjum",
      "Skutluðu bílnum heim á þremur dekkjum"
    ],
    correct: 2,
    explanation: "Þeir gengu um Keflavík, fundu bíla með ólæstu skotti, og tóku varadekkið — plús eitt aukalega úr næsta Fiat bara til öryggis!",
    funFact: "Þegar Ómar tók bílprófið seinna sagði ökunnarinn: \"Þú hefur klárlega keyrt áður.\" Ómar: \"Já, í sveitinni...\""
  },
  {
    id: 6,
    year: 1983,
    category: "👦 Securitas Kallarnir",
    question: "Þegar Ómar sagði Atla stoltur: \"Hey, ég er kominn með milljón!\" — hvað svaraði Atli?",
    options: [
      "\"Til hamingju, vel gert!\"",
      "\"Já, ég er með þrjár núna.\"",
      "\"Á næstu sex mánuðum náiru líka milljón.\"",
      "\"Hvaða milljón? Ég er skuldalaus!\""
    ],
    correct: 1,
    explanation: "Atli, sem hafði lesið allar Brian Tracy bækurnar, svaraði rólega: \"Já, ég er með þrjár núna.\" Ómar: \"...dóhhh.\" Þeir hlógu bæði svo vel.",
    funFact: "Ómar lýsir þeim sem tveimur hliðum sömu æskusögu: \"Atli sparaði. Ég brenndi. Hann varð öruggur. Ég varð óstöðugur.\""
  },
  {
    id: 7,
    year: 2002,
    category: "🎉 Partý Legendan",
    question: "Hvað sáu Ómar og Tryggvi fyrst þegar þeir mættu á fyrsta partý hjá vinkonu Fjólu?",
    options: [
      "DJ að spila íslensk poppstykki",
      "Tvær stelpur að spila fatapóker, önnur nakin ofan til",
      "Stóra veislu í garðinum",
      "Allir sofandi á gólfinu"
    ],
    correct: 1,
    explanation: "Bringubúspartý! Þeir litu hvor á annan og hugsuðu: \"Vá! Er þetta bara strax besta partý sem við höfum nokkurn tímann verið boðið í!\"",
    funFact: "Þetta partý var upphafið að 20+ ára vináttu við Fjólu Dís."
  },
  {
    id: 8,
    year: 1999,
    category: "💻 Tölvumaðurinn",
    question: "Hversu mörg MCSE-próf tók Ómar á 8 vikum — eftir 8 ár á sjó?",
    options: [
      "3 próf",
      "4 próf",
      "6 próf",
      "8 próf"
    ],
    correct: 2,
    explanation: "Sex próf á átta vikum! Hann las fyrstu 6 bækurnar síðan í grunnskóla — og allar á ensku. Féll tvisvar en gafst aldrei upp.",
    funFact: "Þetta var fyrsta hyperfocus-stundina sem varð career-launcher. ADHD sem ofurkraftur!"
  },
  {
    id: 9,
    year: 2019,
    category: "💕 Preelley",
    question: "Hvernig lýsti Ómar því sem honum líkar best við Þórey (Preelley)?",
    options: [
      "\"Hún er gáfaðasta manneskjan sem ég þekki\"",
      "\"Hún er opin, skemmtileg og með flott brjóst\"",
      "\"Hún er besta kokkurinn á Íslandi\"",
      "\"Hún lætur mig líða eins og barnið í mér sé óhrætt\""
    ],
    correct: 1,
    explanation: "Heiðarleg svör í brúðkaupseyðublaðinu: \"Hvað hún er opin, skemmtileg og með flott brjóst :) já og hún virðist skilja mig oftar en aðrir.\"",
    funFact: "Hann bað henni að byrja með sér \"eins og við værum í 10 bekk\" — fyrst kom poke, svo date, svo kaffi."
  },
  {
    id: 10,
    year: 2026,
    category: "🍺 Budapest Sögan",
    question: "Hversu marga bjóra drukku þeir á 4 dögum í Budapest?",
    options: [
      "20 bjóra",
      "30 bjóra",
      "40 bjóra",
      "50 bjóra"
    ],
    correct: 2,
    explanation: "Drukknir 40 bjórar á fjórum dögum og ferðast 3000 km. Labbaði næstum því yfir allar brýr Dónár — bara til þess að átta tímum síðar gáfust þeir Hinni upp!",
    funFact: "Ómar gleymdi alveg að taka myndir. \"Alls konar líf í gangi, og við einhvern veginn bara þar, mitt á milli.\""
  },
  {
    id: 11,
    year: 1976,
    category: "🔧 v1.0 Útgáfan",
    question: "Hvernig lýsti Ómar sjálfum sér sem nýfæddur í tæknimáli?",
    options: [
      "\"Fyrsta beta-prófun á mannlegu stýrikerfi\"",
      "\"Stórt update á stýrikerfi lífsins\"",
      "\"Debug mode frá fæðingu\"",
      "\"System crash og reboot\""
    ],
    correct: 1,
    explanation: "\"Ég var '1.0' útgáfan — lifði fæðinguna og byrjaði strax að grafa upp bug reports.\" Mættur í heiminn eins og stórt update á stýrikerfi lífsins!",
    funFact: "Ómar hefur byggt allt Bók Lífsins kerfið á þessari hugmynd — hvert ár er ný útgáfa, hvert atvik er patch eða update."
  },
  {
    id: 12,
    year: 2001,
    category: "☀️ Sáttir",
    question: "Hvað gerðu Ómar og pabbi hans saman á Kanaríeyjum sem festist í minningunni?",
    options: [
      "Fóru á hvalaskoðun",
      "Prentuðu mynd af ömmu á boli",
      "Leigðu jeppa og fóru á fjallið",
      "Keyrðu um alla eyjuna á vespu"
    ],
    correct: 1,
    explanation: "Sátt milli feðga! Þeir fóru saman í ævintýri að prenta mynd af ömmu á prentaða boli fyrir jólin. Hlátur og vinátta eftir erfitt tímabil.",
    funFact: "Þetta var fyrsta raunverulega sáttin eftir 3 ár af þögn og misskilningi."
  }
];

const categoryColors = {
  "🐣 Upphafið": "#FF6B35",
  "🍼 Barnæska": "#F7C948",
  "🚗 Fiat Uno Ævintýrið": "#E63946",
  "🚔 Fiat Uno Ævintýrið": "#E63946",
  "👦 Securitas Kallarnir": "#457B9D",
  "🎉 Partý Legendan": "#E040FB",
  "💻 Tölvumaðurinn": "#00BFA5",
  "💕 Preelley": "#FF4081",
  "🍺 Budapest Sögan": "#FF9800",
  "🔧 v1.0 Útgáfan": "#7C4DFF",
  "☀️ Sáttir": "#FFD54F"
};

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Confetti() {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 999 }}>
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${Math.random() * 100}%`,
            top: "-10px",
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            backgroundColor: ["#FF6B35", "#F7C948", "#E63946", "#457B9D", "#E040FB", "#00BFA5", "#FF4081", "#7C4DFF"][Math.floor(Math.random() * 8)],
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animation: `confettiFall ${2 + Math.random() * 3}s ease-in forwards`,
            animationDelay: `${Math.random() * 1.5}s`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function BookOfLifeQuiz() {
  const [gameState, setGameState] = useState("intro"); // intro, playing, result, answer
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [shakeWrong, setShakeWrong] = useState(null);

  useEffect(() => {
    setShuffledQuestions(shuffleArray(questions));
  }, []);

  const startGame = () => {
    const sq = shuffleArray(questions);
    setShuffledQuestions(sq);
    setCurrentQ(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSelected(null);
    setAnswers([]);
    setGameState("playing");
  };

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const q = shuffledQuestions[currentQ];
    const isCorrect = idx === q.correct;

    if (isCorrect) {
      const newStreak = streak + 1;
      setScore(s => s + (10 * (newStreak > 2 ? 2 : 1)));
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      if (newStreak >= 3) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } else {
      setStreak(0);
      setShakeWrong(idx);
      setTimeout(() => setShakeWrong(null), 600);
    }

    setAnswers(prev => [...prev, { qId: q.id, correct: isCorrect }]);

    setTimeout(() => {
      setGameState("answer");
    }, 800);
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= shuffledQuestions.length) {
      setGameState("result");
    } else {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setGameState("playing");
    }
  };

  const q = shuffledQuestions[currentQ];
  const progress = shuffledQuestions.length > 0 ? ((currentQ + 1) / shuffledQuestions.length) * 100 : 0;

  const getGrade = () => {
    const pct = (score / (shuffledQuestions.length * 10)) * 100;
    if (pct >= 90) return { emoji: "🏆", title: "Bók Lífsins Meistari!", desc: "Þú þekkir lífið mitt betur en ég sjálfur!" };
    if (pct >= 70) return { emoji: "⭐", title: "Næstum Perfekt!", desc: "Þú veist meira en flestir um þennan íslensku þorsk." };
    if (pct >= 50) return { emoji: "👍", title: "Vel gert!", desc: "Góður grunnur — en það er meira að læra!" };
    return { emoji: "📖", title: "Byrjandi í Bók Lífsins", desc: "Tími til að lesa fleiri kafla!" };
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 40%, #0d1b2a 100%)",
      fontFamily: "'Georgia', 'Garamond', serif",
      color: "#e8e4df",
      overflow: "hidden",
      position: "relative"
    }}>
      {showConfetti && <Confetti />}

      {/* Animated bg particles */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.15 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            backgroundColor: "#F7C948",
            borderRadius: "50%",
            animation: `float ${4 + Math.random() * 6}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`
          }} />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.5); opacity: 0.8; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes shakeX {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 15px rgba(247,201,72,0.3); }
          50% { box-shadow: 0 0 30px rgba(247,201,72,0.6); }
        }
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
      `}</style>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px", position: "relative", zIndex: 1 }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 14, letterSpacing: "4px", textTransform: "uppercase", color: "#F7C948", marginBottom: 4 }}>
            Bók Lífsins
          </div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 400,
            margin: 0,
            background: "linear-gradient(135deg, #F7C948, #FF6B35)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "1px"
          }}>
            Spurningaleikur Ómars
          </h1>
        </div>

        {/* INTRO SCREEN */}
        {gameState === "intro" && (
          <div style={{ animation: "slideUp 0.6s ease-out", textAlign: "center" }}>
            <div style={{
              fontSize: 80,
              margin: "40px 0 20px"
            }}>📖</div>

            <p style={{
              fontSize: 18,
              lineHeight: 1.8,
              color: "#b8b4af",
              maxWidth: 500,
              margin: "0 auto 16px",
              fontStyle: "italic"
            }}>
              Hversu vel þekkir þú söguna af Ómari Erni Magnússyni?
            </p>

            <p style={{ fontSize: 15, color: "#888", marginBottom: 8 }}>
              Frá þorskfæðingunni 1976 til Budapest bjóranna 2026
            </p>
            <p style={{ fontSize: 15, color: "#888", marginBottom: 32 }}>
              12 spurningar úr raunverulegum sögum — sumar fyndnar, sumar alvöru
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              marginBottom: 36,
              maxWidth: 420,
              margin: "0 auto 36px"
            }}>
              {[
                { icon: "🚗", label: "Fiat Uno" },
                { icon: "🐟", label: "Þorskurinn" },
                { icon: "🍺", label: "40 bjórar" },
              ].map((item, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 12,
                  padding: "16px 8px",
                  border: "1px solid rgba(255,255,255,0.08)"
                }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{item.icon}</div>
                  <div style={{ fontSize: 12, color: "#999" }}>{item.label}</div>
                </div>
              ))}
            </div>

            <button
              onClick={startGame}
              style={{
                background: "linear-gradient(135deg, #F7C948, #FF6B35)",
                color: "#0a0a1a",
                border: "none",
                padding: "16px 48px",
                fontSize: 18,
                fontFamily: "inherit",
                fontWeight: 700,
                borderRadius: 50,
                cursor: "pointer",
                letterSpacing: "1px",
                animation: "glowPulse 2s ease-in-out infinite",
                transition: "transform 0.2s"
              }}
              onMouseOver={e => e.target.style.transform = "scale(1.05)"}
              onMouseOut={e => e.target.style.transform = "scale(1)"}
            >
              BYRJA LEIKINN
            </button>
          </div>
        )}

        {/* PLAYING SCREEN */}
        {(gameState === "playing" || gameState === "answer") && q && (
          <div style={{ animation: "slideUp 0.4s ease-out" }}>

            {/* Progress bar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20
            }}>
              <div style={{
                flex: 1,
                height: 6,
                backgroundColor: "rgba(255,255,255,0.08)",
                borderRadius: 3,
                overflow: "hidden"
              }}>
                <div style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #F7C948, #FF6B35)",
                  borderRadius: 3,
                  transition: "width 0.5s ease"
                }} />
              </div>
              <span style={{ fontSize: 13, color: "#888", minWidth: 45 }}>
                {currentQ + 1}/{shuffledQuestions.length}
              </span>
            </div>

            {/* Score + Streak */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: 20,
                padding: "6px 16px",
                fontSize: 14
              }}>
                Stig: <span style={{ color: "#F7C948", fontWeight: 700 }}>{score}</span>
              </div>
              {streak >= 2 && (
                <div style={{
                  background: "rgba(255, 107, 53, 0.15)",
                  borderRadius: 20,
                  padding: "6px 16px",
                  fontSize: 14,
                  color: "#FF6B35",
                  animation: "pulse 1s ease-in-out infinite"
                }}>
                  🔥 {streak} í röð!
                </div>
              )}
            </div>

            {/* Category + Year badge */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <span style={{
                background: categoryColors[q.category] || "#555",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: 20,
                letterSpacing: "0.5px"
              }}>
                {q.category}
              </span>
              <span style={{
                background: "rgba(255,255,255,0.1)",
                color: "#aaa",
                fontSize: 12,
                padding: "4px 12px",
                borderRadius: 20
              }}>
                {q.year}
              </span>
            </div>

            {/* Question */}
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: "24px",
              marginBottom: 20
            }}>
              <h2 style={{
                fontSize: 20,
                fontWeight: 400,
                lineHeight: 1.5,
                margin: 0,
                color: "#f0ece8"
              }}>
                {q.question}
              </h2>
            </div>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {q.options.map((opt, idx) => {
                const isSelected = selected === idx;
                const isCorrect = idx === q.correct;
                const showResult = selected !== null;
                const isShaking = shakeWrong === idx;

                let bg = "rgba(255,255,255,0.04)";
                let border = "1px solid rgba(255,255,255,0.1)";
                let textColor = "#e0dcd7";

                if (showResult && isCorrect) {
                  bg = "rgba(0, 191, 165, 0.15)";
                  border = "2px solid #00BFA5";
                  textColor = "#00E5C0";
                } else if (showResult && isSelected && !isCorrect) {
                  bg = "rgba(230, 57, 70, 0.15)";
                  border = "2px solid #E63946";
                  textColor = "#FF6B6B";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={selected !== null}
                    style={{
                      background: bg,
                      border,
                      borderRadius: 12,
                      padding: "16px 20px",
                      fontSize: 16,
                      fontFamily: "inherit",
                      color: textColor,
                      cursor: selected !== null ? "default" : "pointer",
                      textAlign: "left",
                      transition: "all 0.3s ease",
                      animation: isShaking ? "shakeX 0.5s ease" : "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 12
                    }}
                    onMouseOver={e => {
                      if (selected === null) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.borderColor = "rgba(247,201,72,0.4)";
                      }
                    }}
                    onMouseOut={e => {
                      if (selected === null) {
                        e.currentTarget.style.background = bg;
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                      }
                    }}
                  >
                    <span style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      background: showResult && isCorrect ? "#00BFA5" :
                                  showResult && isSelected && !isCorrect ? "#E63946" :
                                  "rgba(255,255,255,0.1)",
                      color: showResult && (isCorrect || (isSelected && !isCorrect)) ? "#fff" : "#999",
                      flexShrink: 0
                    }}>
                      {showResult && isCorrect ? "✓" :
                       showResult && isSelected && !isCorrect ? "✗" :
                       String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Answer explanation */}
            {gameState === "answer" && (
              <div style={{
                animation: "slideUp 0.4s ease-out",
                background: "rgba(247, 201, 72, 0.06)",
                border: "1px solid rgba(247, 201, 72, 0.2)",
                borderRadius: 16,
                padding: 24,
                marginBottom: 20
              }}>
                <div style={{ fontSize: 15, lineHeight: 1.7, color: "#d4d0cb", marginBottom: 12 }}>
                  {q.explanation}
                </div>
                <div style={{
                  fontSize: 13,
                  color: "#F7C948",
                  fontStyle: "italic",
                  borderTop: "1px solid rgba(247,201,72,0.15)",
                  paddingTop: 12,
                  marginTop: 4
                }}>
                  💡 {q.funFact}
                </div>
              </div>
            )}

            {gameState === "answer" && (
              <button
                onClick={nextQuestion}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #F7C948, #FF6B35)",
                  color: "#0a0a1a",
                  border: "none",
                  padding: "14px",
                  fontSize: 16,
                  fontFamily: "inherit",
                  fontWeight: 700,
                  borderRadius: 12,
                  cursor: "pointer",
                  letterSpacing: "0.5px"
                }}
              >
                {currentQ + 1 >= shuffledQuestions.length ? "SJÁ NIÐURSTÖÐUR →" : "NÆSTA SPURNING →"}
              </button>
            )}
          </div>
        )}

        {/* RESULT SCREEN */}
        {gameState === "result" && (
          <div style={{ animation: "slideUp 0.6s ease-out", textAlign: "center" }}>
            {score >= shuffledQuestions.length * 7 && <Confetti />}

            <div style={{ fontSize: 80, marginTop: 30, marginBottom: 8 }}>
              {getGrade().emoji}
            </div>
            <h2 style={{
              fontSize: 28,
              fontWeight: 400,
              margin: "0 0 8px",
              background: "linear-gradient(135deg, #F7C948, #FF6B35)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              {getGrade().title}
            </h2>
            <p style={{ fontSize: 16, color: "#999", marginBottom: 32 }}>
              {getGrade().desc}
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
              marginBottom: 36
            }}>
              {[
                { label: "Stig", value: score, color: "#F7C948" },
                { label: "Rétt", value: `${answers.filter(a => a.correct).length}/${shuffledQuestions.length}`, color: "#00BFA5" },
                { label: "Besta röð", value: `${bestStreak}🔥`, color: "#FF6B35" },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 16,
                  padding: "20px 12px",
                  border: "1px solid rgba(255,255,255,0.08)"
                }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Answer recap */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 6,
              marginBottom: 32
            }}>
              {answers.map((a, i) => (
                <div key={i} style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  background: a.correct ? "rgba(0,191,165,0.2)" : "rgba(230,57,70,0.2)",
                  border: `2px solid ${a.correct ? "#00BFA5" : "#E63946"}`,
                  color: a.correct ? "#00E5C0" : "#FF6B6B"
                }}>
                  {a.correct ? "✓" : "✗"}
                </div>
              ))}
            </div>

            <button
              onClick={startGame}
              style={{
                background: "linear-gradient(135deg, #F7C948, #FF6B35)",
                color: "#0a0a1a",
                border: "none",
                padding: "16px 48px",
                fontSize: 18,
                fontFamily: "inherit",
                fontWeight: 700,
                borderRadius: 50,
                cursor: "pointer",
                letterSpacing: "1px",
                animation: "glowPulse 2s ease-in-out infinite"
              }}
            >
              SPILA AFTUR
            </button>

            <p style={{
              fontSize: 12,
              color: "#555",
              marginTop: 24,
              fontStyle: "italic"
            }}>
              Byggt á raunverulegum sögum úr Bók Lífsins — 400+ sögur frá 1976–2026
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
