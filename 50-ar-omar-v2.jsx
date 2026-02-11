import { useState, useEffect } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZÆÐÞÖÁÉÍÓÚÝ ".split("");
const BDAY = new Date("2026-06-19T00:00:00");

const allQuestions = [
  { id:1, yr:1976, cat:"🐣 Fæðing", q:"Hverju líkti pabbi litla Ómar nýfæddum við?", opts:["Meðalstóran þorsk","Litla hvalreki","Stóran lúðu","Nýfæddan sel"], ans:0, exp:"Pabbi var sjómaður: \"Þetta er meðalstór þorskur!\" — 5 kíló, 54 cm.", fun:"Fæddist með sogklukku — hasarhetja frá fyrsta degi." },
  { id:2, yr:1976, cat:"🍼 Barnæska", q:"Hvað fékk Ómar í stað snuðs?", opts:["Þurrkaðan harðfisk","Soðinn fisk","Lýsi á skeið","Brauðsneið"], ans:1, exp:"Enginn pacifier — bara soðinn fiskur og lýsi. Orkubolti með Omega-3!", fun:"v1.0 — lifði fæðinguna og byrjaði strax að grafa upp bug reports." },
  { id:3, yr:1976, cat:"🔧 v1.0", q:"Hvernig lýsti Ómar sjálfum sér nýfæddur í tæknimáli?", opts:["Fyrsta beta-prófun","Stórt update á stýrikerfi lífsins","Debug mode frá fæðingu","System crash og reboot"], ans:1, exp:"\"Mættur í heiminn eins og stórt update á stýrikerfi lífsins.\"", fun:"Hvert ár er ný útgáfa, hvert atvik er patch eða update." },
  { id:4, yr:1981, cat:"🥣 Leikskólinn", q:"Hvað var Ómar neyddur til að borða í leikskólanum?", opts:["Grænmetissúpu","Bragðlausan hafragraut","Lýsi á morgnana","Harðsoðin egg"], ans:1, exp:"Allir þurftu að klára hafragrautinn — sitja þar til diskurinn tæmdist!", fun:"Fyrsti árekstur við þvingun. Hjá pabba lærði hann að elska mat." },
  { id:5, yr:1982, cat:"🕷️ Soffía frænka", q:"Hvaða hættuverkefni fékk Soffía frænka litla Ómar?", opts:["Gæta systur sinni","Taka köngulær úr sturtunni","Fara einn í búð","Keyra dráttarvél"], ans:1, exp:"\"Þú ert karlmaðurinn á heimilinu — taka köngulærnar úr sturtunni.\"", fun:"Soffía kenndi honum að maður getur búið til sínar reglur." },
  { id:6, yr:1982, cat:"💻 Sinclair", q:"Stebbi gaf Ómari eitthvað sem breytti öllu. Hvað?", opts:["Sinclair Spectrum tölvu","Ensku kennslubók","Trommubúnað","Atari leikjatölvu"], ans:0, exp:"Stebbi, trommari í Stuðmönnum, bjargaði honum frá einsemd með Sinclair Spectrum.", fun:"\"Stebbi gaf mér fyrstu línuna í kóðann sem varð ég sjálfur.\"" },
  { id:7, yr:1983, cat:"👦 Atli", q:"Hvernig kallaði Ómar á barnavin sinn Atla?", opts:["Sendi SMS","Hringdi í síma","Kallaði fyrir aftan blokkina","Sendi bréf"], ans:2, exp:"Engir símar — maður bara birtist! Kallaði fyrir aftan blokkina.", fun:"\"Ef Ómar kom, þá var öllum öðrum vinum hent út.\"" },
  { id:8, yr:1990, cat:"📺 Keflavíkursveit", q:"Hvaða kvikmyndahetja var fyrirmynd Ómars sem enginn jafnaldri þekkti?", opts:["James Bond","Indiana Jones","Rambo","MacGyver"], ans:1, exp:"Indiana Jones á vídeóspólu! Kanalsjónvarpið streymdi inn enskri menningu.", fun:"Alltaf öðruvísi, alltaf utan við normið." },
  { id:9, yr:1990, cat:"⚓ Sjórinn", q:"Hvað sá Ómar þegar hann fór 9 ára á sjó með pabba?", opts:["Fallegasta sólsetur","Hluti sem barn á ekki að sjá","Risa stóran fisk","Norðurljós"], ans:1, exp:"Vídeóspólur, B-myndir og efni langt umfram aldur hans. Enginn vernduði hann.", fun:"Í heimi fullorðinna karla lærði hann snemma að aðlagast." },
  { id:10, yr:1992, cat:"🚗 Fiat Uno", q:"Hvaðan fékk 16 ára Ómar númeraplötur á Fiat Uno?", opts:["Úr ruslatunnu","Af gömlum Buick í bílageymslu","Frá lögreglumanni","Smíðaði sjálfur"], ans:1, exp:"Grár Buick frá 50-áratugnum. \"Lánaði\" plötuna og skrifaði númer á pappaspjald!", fun:"Afturendi Buicksins var klestur upp við vegg — enginn tók eftir neinu." },
  { id:11, yr:1992, cat:"🚔 Lögreglan", q:"Þegar lögreglan stöðvaði Ómar, hvað gerði hann?", opts:["Sagðist vera sendiráðsmaður","Gaf ranga kennitölu (75 í stað 76)","Þóttist vera sofandi","Sagði bíllinn tilheyrði pabba"], ans:1, exp:"Sagðist fæddur 1975! Lögreglan: \"Farðu heim og drífðu þig.\"", fun:"Vinirnir þóttust vera áfengisdauðir á baksætinu." },
  { id:12, yr:1992, cat:"🚗 Fiat Uno", q:"Hvað gerðu þeir þegar dekkið sprakk í Keflavík?", opts:["Hringdu í Vegaþjónustuna","Gengu heim","Stálu varadekkjum úr ólæstum bílum","Skutluðu á 3 dekkjum"], ans:2, exp:"Fundu bíla með ólæstu skotti — tóku varadekkið plús eitt aukalega!", fun:"Ökunnarinn: \"Þú hefur klárlega keyrt áður.\" Ómar: \"Já... í sveitinni.\"" },
  { id:13, yr:1992, cat:"🚔 Fiat Uno", q:"Hversu mörg brot hafði Ómar framið þegar lögreglan stoppaði hann?", opts:["Eitt","Tvö","Þrjú til fjögur","Fimm"], ans:2, exp:"Enginn ökuskírteini, engin skoðun, rangar plötur, röng kennitala!", fun:"Bjargaði sér vegna þess að ekki voru tölvukerfi í bílum lögreglu." },
  { id:14, yr:1999, cat:"📞 Tölvun", q:"Hvernig fékk Ómar fyrstu vinnuna í tölvubransanum?", opts:["Sótti um 50 störf","Símtal: \"Viltu kíkja í spjall?\"","Vann keppni","Frændi fékk honum starf"], ans:1, exp:"Davíð í Tölvun hringdi og bauð í spjall. Eitt símtal — hætti á sjónum!", fun:"Toy Story Claw mynstur — virkar best þegar hann er valinn." },
  { id:15, yr:1999, cat:"📚 MCSE", q:"Hversu mörg MCSE-próf tók Ómar á 8 vikum?", opts:["3 próf","4 próf","6 próf","8 próf"], ans:2, exp:"Sex próf á átta vikum! Á ensku. Féll tvisvar en gafst aldrei upp.", fun:"ADHD hyperfocus sem career-launcher!" },
  { id:16, yr:2000, cat:"💛 Vallý", q:"Hvað gerðist þegar Vallý aflýsti Danmörku-ferð 2000?", opts:["Þau slitu samband","Magnús var getinn","Ómar fór einn","Ekkert sérstakt"], ans:1, exp:"Vallý aflýsti ferðinni — og þetta kvöld var Magnús Örn getinn!", fun:"Score 0.95 í vendipunktaskalanum — fátt hafði meiri áhrif." },
  { id:17, yr:2000, cat:"👶 Magnús", q:"Hvaða ráð sagði Magnús (sonur) sem varð ADHD-mantra?", opts:["\"Slökktu á tölvunni\"","\"TAH: Task At Hand\"","\"Þú ert nógu góður\"","\"Hættu að pæla\""], ans:1, exp:"TAH: Task At Hand — aðeins eitt í einu. Frá eigin syni!", fun:"Stundum kenna börnin okkur það sem engin kennari getur." },
  { id:18, yr:2001, cat:"☀️ Kanarí", q:"Hvað gerðu Ómar og pabbi hans á Kanaríeyjum?", opts:["Fóru á hvalaskoðun","Prentuðu mynd af ömmu á boli","Fóru á fjallið","Keyrðu á vespu"], ans:1, exp:"Prentuðu mynd af ömmu á boli fyrir jólin! Hlátur og vinátta.", fun:"Fyrsta raunverulega sáttin eftir 3 ár af þögn." },
  { id:19, yr:2002, cat:"🎉 Partý", q:"Hvað sáu þeir fyrst á partýi hjá vinkonu Fjólu?", opts:["DJ með Stuðmenn","Stelpur í fatapóker","Veislu í garðinum","Alla sofandi"], ans:1, exp:"Bringubúspartý! \"Er þetta besta partý sem við höfum nokkurn tímann verið boðið í!\"", fun:"Upphafið að 20+ ára vináttu við Fjólu Dís." },
  { id:20, yr:2002, cat:"👦 Atli", q:"Hvernig endurheimuðu Ómar og Atli barnavináttu?", opts:["Facebook","Fletti upp í Frammáli","Mættust á götu","Hittust á djammi"], ans:1, exp:"Vallý átti bók \"Frammál\" — Ómar fletti Atla upp og hringdi!", fun:"Vináttan tók við — 40 ár síðan." },
  { id:21, yr:2002, cat:"💰 Atli", q:"\"Ég er með milljón!\" sagði Ómar stoltur. Hvað svaraði Atli?", opts:["\"Vel gert!\"","\"Já, ég er með þrjár.\"","\"Ég er á leiðinni\"","\"Skuldalaus er betri\""], ans:1, exp:"Atli las Brian Tracy og svaraði rólega: \"Já, ég er með þrjár.\"", fun:"Atli sparaði. Ómar brenndi. Hann varð öruggur. Ómar varð óstöðugur." },
  { id:22, yr:2015, cat:"🌅 Ewalina", q:"Hvað gerðist þegar Ómar hitti Ewalinu?", opts:["Ekkert sérstakt","Allt í nýju ljósi — tónlist og matur","Hann varð reiður","Fór til útlanda"], ans:1, exp:"\"Tónlist fór að hljóma betur, matur bragðaðist betur. Eins og ég hefði verið sofandi.\"", fun:"Hugmyndirnar komu svo hratt að hann gat ekki skrifað nógu hratt." },
  { id:23, yr:2017, cat:"🔄 omar4.0", q:"Hvað kallaði Ómar verkefni sitt þegar hann byrjaði árlegar uppfærslur?", opts:["Bók Lífsins","omar4.0","Project Rebirth","Nýr Maður"], ans:1, exp:"omar4.0 — stór uppfærsla 19. júní 2017. Árlega héðan í frá!", fun:"Mantran: \"Vera besta útgáfa af sjálfum mér.\"" },
  { id:24, yr:2019, cat:"💕 Preelley", q:"Hvernig lýsti Ómar Þórey í brúðkaupseyðublaðinu?", opts:["\"Gáfuð\"","\"Opin, skemmtileg og flott brjóst\"","\"Besti kokkurinn\"","\"Skilur barnið í mér\""], ans:1, exp:"Heiðarlegt svar! \"...og hún virðist skilja mig oftar en aðrir.\"", fun:"Bað henni \"eins og í 10 bekk\" — fyrst poke, svo date." },
  { id:25, yr:2020, cat:"💊 ADHD", q:"Hvað hélt Ómar þegar hann fékk ADHD-greiningu?", opts:["Hann myndi lagast","Hann yrði frægur","Ekkert myndi breytast","Hann fengi bifreið"], ans:0, exp:"\"Ég hélt ég væri loksins að fara að lagast. Það var hreint ekki svona.\"", fun:"Strattera, Ritalín, Elvanse — hvert lyf með sína sögu." },
  { id:26, yr:2023, cat:"🌿 Sjálfsskilningur", q:"Hvenær breytist \"notkun\" í \"fíkn\" samkvæmt Ómari?", opts:["Á hverjum degi","Þegar maður fer að fela og skammast sín","Of mikill peningur","Missir vinnuna"], ans:1, exp:"\"Þegar þú ferð að fela, þegar þú skammast þín — þá breytist notkunin í fíkn.\"", fun:"Sjálfslyfjakenningin: allt leit að dopamíni." },
  { id:27, yr:2025, cat:"🤒 Kuldinn", q:"Hvernig lýsti Ómar veikindum nóvember 2025?", opts:["\"Bara flensa\"","\"Líkaminn á flight mode\"","\"Smá kvef\"","\"Ekkert alvarlegt\""], ans:1, exp:"\"Líkaminn fór á flight mode.\" 401: Body Not Found.", fun:"Singles Day 11.11 — líkaminn tók frí." },
  { id:28, yr:2025, cat:"💑 Dóra", q:"Hvað vakti Ómar við þegar hann lá hjá Dóru í Hrafnhólum?", opts:["Þvottavél","Pípið í heyrnartækinu","Vekjaraklukku","Síma sem hringdi"], ans:1, exp:"Pípið í heyrnartækinu minnti á rafhlöðurnar. Svo leit hann yfir Reykjavík úr glugganum.", fun:"Þau lágu í 90 cm rúmi — frænka Dóru fékk hjónaherbergið." },
  { id:29, yr:2026, cat:"🎵 Low Battery", q:"Hvað var fyrsta lagið sem Ómar samdi (janúar 2026)?", opts:["\"Bók Lífsins\"","\"Low Battery\"","\"v49.4\"","\"Hingað en ekki lengra\""], ans:1, exp:"\"Low Battery\" — \"Ég gekk inn í árið með opið sár sem ég hélt væri tár...\"", fun:"Ekki ætlað að verða lag — bara orð sem þurftu út." },
  { id:30, yr:2026, cat:"🍺 Budapest", q:"Hversu marga bjóra drukku þeir á 4 dögum í Budapest?", opts:["20","30","40","50"], ans:2, exp:"40 bjórar á fjórum dögum og 3000 km! Labbaði yfir allar brýr Dónár.", fun:"Gleymdi alveg myndunum. \"Við bara þar.\"" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const catColors = {
  "🐣":"#FF6B35","🍼":"#F7C948","🔧":"#7C4DFF","🥣":"#8BC34A","🕷":"#9C27B0",
  "💻":"#00BFA5","👦":"#457B9D","📺":"#2196F3","⚓":"#37474F","🚗":"#E63946",
  "🚔":"#E63946","📞":"#FF9800","📚":"#795548","💛":"#FFEB3B","👶":"#FF4081",
  "☀":"#FFD54F","🎉":"#E040FB","💰":"#4CAF50","🌅":"#FF7043","🔄":"#7C4DFF",
  "💕":"#FF4081","💊":"#66BB6A","🌿":"#43A047","🤒":"#78909C","💑":"#EC407A",
  "🎵":"#AB47BC","🍺":"#FF9800"
};

function getCatColor(cat) {
  if (!cat) return "#888";
  for (const [emoji, color] of Object.entries(catColors)) {
    if (cat.includes(emoji)) return color;
  }
  return "#888";
}

const styles = `
  @keyframes floatUp {
    0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
    50% { transform: translateY(-20px) scale(1.5); opacity: 0.8; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes confettiFall {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
  @keyframes pulseAnim {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  @keyframes shakeAnim {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-5px); }
    80% { transform: translateX(5px); }
  }
  @keyframes glowAnim {
    0%, 100% { box-shadow: 0 0 15px rgba(0,255,136,0.3); }
    50% { box-shadow: 0 0 30px rgba(0,255,136,0.5); }
  }
  @keyframes blinkAnim {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
`;

function Confetti() {
  const confettiColors = ["#FF6B35","#F7C948","#E63946","#457B9D","#E040FB","#00BFA5","#FF4081","#7C4DFF","#FFD700"];
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999 }}>
      {Array.from({ length: 50 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: Math.random() * 100 + "%",
          top: "-10px",
          width: 5 + Math.random() * 7 + "px",
          height: 5 + Math.random() * 7 + "px",
          backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          animation: "confettiFall " + (2 + Math.random() * 3) + "s ease-in forwards",
          animationDelay: Math.random() * 1.5 + "s",
        }} />
      ))}
    </div>
  );
}

function CountdownTimer() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = BDAY.getTime() - now.getTime();

  if (diff <= 0) {
    return (
      <div style={{ textAlign: "center", padding: "12px 0" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#FFD700", fontFamily: "monospace", textShadow: "0 0 20px rgba(255,215,0,0.4)" }}>
          {"🎂 TIL HAMINGJU MEÐ 50 ÁRA DAGINN! 🎂"}
        </div>
      </div>
    );
  }

  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  const units = [
    { val: days, label: "DAGAR" },
    { val: hrs, label: "KLST" },
    { val: mins, label: "MÍN" },
    { val: secs, label: "SEK" },
  ];

  return (
    <div style={{ textAlign: "center", marginBottom: 16 }}>
      <div style={{ fontSize: 10, letterSpacing: 4, color: "#FFD700", textTransform: "uppercase", marginBottom: 6, fontFamily: "monospace" }}>
        Niðurtalning að 50 ára afmæli Ómars
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
        {units.map((u, i) => (
          <div key={i} style={{
            background: "rgba(255,215,0,0.06)",
            border: "1px solid rgba(255,215,0,0.2)",
            borderRadius: 8, padding: "8px 10px", minWidth: 54
          }}>
            <div style={{
              fontSize: 22, fontWeight: 700, fontFamily: "'Courier New', monospace",
              color: "#FFD700", textShadow: "0 0 8px rgba(255,215,0,0.25)",
              lineHeight: 1
            }}>
              {String(u.val).padStart(2, "0")}
            </div>
            <div style={{ fontSize: 8, color: "#997A00", letterSpacing: 1, marginTop: 2 }}>{u.label}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 9, color: "#554400", marginTop: 6, fontFamily: "monospace" }}>
        {"19. júní 2026 \u2022 v50.0 🎉"}
      </div>
    </div>
  );
}

function NameEntry({ onSubmit }) {
  const [charIdxs, setCharIdxs] = useState([0, 0, 0]);
  const [activeSlot, setActiveSlot] = useState(0);
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("name");
  const [blinkOn, setBlinkOn] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setBlinkOn(b => !b), 500);
    return () => clearInterval(t);
  }, []);

  const scrollChar = (direction) => {
    setCharIdxs(prev => {
      const next = [...prev];
      next[activeSlot] = (next[activeSlot] + direction + CHARS.length) % CHARS.length;
      return next;
    });
  };

  const playerName = charIdxs.map(i => CHARS[i]).join("");

  return (
    <div style={{ animation: "slideUp 0.6s ease-out", textAlign: "center" }}>
      <CountdownTimer />

      <div style={{ fontSize: 40, margin: "16px 0 4px" }}>{"🕹️"}</div>
      <div style={{ fontSize: 10, letterSpacing: 5, color: "#00ff88", marginBottom: 2, fontFamily: "monospace" }}>INSERT COIN</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px", fontFamily: "'Courier New', monospace", color: "#00ff88", textShadow: "0 0 10px rgba(0,255,136,0.25)" }}>
        {"SLÁÐU INN NAFN"}
      </h1>
      <p style={{ fontSize: 11, color: "#555", marginBottom: 20, fontFamily: "monospace" }}>{"3 STAFIR — EINS OG Í GÖMLU SPILASÖLUM"}</p>

      {step === "name" && (
        <div>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 20 }}>
            {[0, 1, 2].map(slotIdx => (
              <div key={slotIdx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <button
                  onClick={() => { setActiveSlot(slotIdx); setTimeout(() => scrollChar(-1), 10); }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: activeSlot === slotIdx ? "#00ff88" : "#333", fontSize: 18 }}
                >{"▲"}</button>
                <div
                  onClick={() => setActiveSlot(slotIdx)}
                  style={{
                    width: 56, height: 72, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 42, fontWeight: 700, fontFamily: "'Courier New', monospace",
                    color: activeSlot === slotIdx ? "#00ff88" : "#FFD700",
                    textShadow: activeSlot === slotIdx ? "0 0 15px #00ff88" : "0 0 6px rgba(255,215,0,0.25)",
                    background: activeSlot === slotIdx ? "rgba(0,255,136,0.06)" : "rgba(255,255,255,0.02)",
                    border: activeSlot === slotIdx ? "2px solid #00ff88" : "2px solid rgba(255,255,255,0.08)",
                    borderRadius: 8, cursor: "pointer",
                    opacity: activeSlot === slotIdx && blinkOn ? 1 : activeSlot === slotIdx ? 0.65 : 1
                  }}
                >{CHARS[charIdxs[slotIdx]]}</div>
                <button
                  onClick={() => { setActiveSlot(slotIdx); setTimeout(() => scrollChar(1), 10); }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: activeSlot === slotIdx ? "#00ff88" : "#333", fontSize: 18 }}
                >{"▼"}</button>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
            {[0, 1, 2].map(s => (
              <div key={s} onClick={() => setActiveSlot(s)} style={{
                width: 8, height: 8, borderRadius: "50%", cursor: "pointer",
                background: activeSlot === s ? "#00ff88" : "#333",
                boxShadow: activeSlot === s ? "0 0 6px #00ff88" : "none"
              }} />
            ))}
          </div>

          <div style={{ fontSize: 13, color: "#777", marginBottom: 20, fontFamily: "monospace" }}>
            {"PLAYER: "}<span style={{ color: "#00ff88", fontSize: 16, fontWeight: 700 }}>{playerName}</span>
          </div>

          <button onClick={() => setStep("phone")} style={{
            background: "linear-gradient(135deg, #00ff88, #00cc6a)", color: "#0a0a1a", border: "none",
            padding: "12px 36px", fontSize: 15, fontWeight: 700, borderRadius: 8, cursor: "pointer",
            fontFamily: "'Courier New', monospace", letterSpacing: 2, boxShadow: "0 0 20px rgba(0,255,136,0.25)"
          }}>{"ÁFRAM →"}</button>
        </div>
      )}

      {step === "phone" && (
        <div>
          <div style={{ fontSize: 32, fontFamily: "'Courier New', monospace", color: "#FFD700", textShadow: "0 0 10px rgba(255,215,0,0.25)", marginBottom: 12, fontWeight: 700 }}>{playerName}</div>
          <p style={{ fontSize: 11, color: "#555", marginBottom: 12, fontFamily: "monospace" }}>{"SÍMANÚMER TIL AUÐKENNINGAR"}</p>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/[^\d-]/g, "").slice(0, 11))}
            placeholder="000-0000"
            style={{
              background: "rgba(0,255,136,0.05)", border: "2px solid #00ff88", borderRadius: 8,
              padding: "12px 16px", fontSize: 24, fontFamily: "'Courier New', monospace",
              color: "#00ff88", textAlign: "center", width: 200, outline: "none", letterSpacing: 3, marginBottom: 20
            }}
            autoFocus
          />
          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
            <button onClick={() => setStep("name")} style={{
              background: "rgba(255,255,255,0.05)", color: "#777", border: "1px solid #333",
              padding: "10px 20px", fontSize: 13, borderRadius: 8, cursor: "pointer", fontFamily: "monospace"
            }}>{"← TILBAKA"}</button>
            <button
              onClick={() => { if (phone.length >= 7) onSubmit(playerName, phone); }}
              disabled={phone.length < 7}
              style={{
                background: phone.length >= 7 ? "linear-gradient(135deg,#00ff88,#00cc6a)" : "#222",
                color: phone.length >= 7 ? "#0a0a1a" : "#555", border: "none",
                padding: "10px 28px", fontSize: 15, fontWeight: 700, borderRadius: 8,
                cursor: phone.length >= 7 ? "pointer" : "default", fontFamily: "monospace", letterSpacing: 2
              }}
            >{"BYRJA! 🕹️"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function LeaderboardView({ scores, myPhone, onClose, onPlay }) {
  const [tab, setTab] = useState("high");
  const tabs = [
    { id: "high", label: "🏆 Hæst", col: "#FFD700" },
    { id: "plays", label: "🔁 Flest", col: "#00BFA5" },
    { id: "best1st", label: "✅ Best 1.", col: "#4CAF50" },
    { id: "worst1st", label: "💀 Verst 1.", col: "#E63946" },
  ];

  const getList = () => {
    const s = [...scores];
    if (tab === "high") return s.sort((a, b) => b.highScore - a.highScore);
    if (tab === "plays") return s.sort((a, b) => b.gamesPlayed - a.gamesPlayed);
    if (tab === "best1st") return s.sort((a, b) => (b.bestFirst || 0) - (a.bestFirst || 0));
    if (tab === "worst1st") return s.sort((a, b) => (b.worstFirst || 0) - (a.worstFirst || 0));
    return s;
  };

  const getVal = (s) => {
    if (tab === "high") return s.highScore + " stig";
    if (tab === "plays") return s.gamesPlayed + "x spilað";
    if (tab === "best1st") return (s.bestFirst || 0) + "/" + allQuestions.length + " rétt";
    if (tab === "worst1st") return (s.worstFirst || 0) + "/" + allQuestions.length + " vitlaust";
    return "";
  };

  const list = getList();
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div style={{ animation: "slideUp 0.5s ease-out" }}>
      <CountdownTimer />
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: "#FFD700", fontFamily: "monospace" }}>HALL OF FAME</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, fontFamily: "'Courier New', monospace", color: "#00ff88", textShadow: "0 0 8px rgba(0,255,136,0.25)" }}>STIGATAFLA</h2>
      </div>

      <div style={{ display: "flex", gap: 3, marginBottom: 16, overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
            border: tab === t.id ? "1px solid " + t.col : "1px solid transparent",
            borderRadius: 6, padding: "6px 10px", fontSize: 11,
            fontFamily: "monospace", color: tab === t.id ? t.col : "#555",
            cursor: "pointer", whiteSpace: "nowrap"
          }}>{t.label}</button>
        ))}
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: "center", padding: 30, color: "#444", fontFamily: "monospace", fontSize: 13 }}>{"ENGINN ENNÞÁ — VERTU FYRSTUR!"}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 16 }}>
          {list.slice(0, 15).map((s, i) => {
            const isMe = myPhone && s.phone === myPhone;
            return (
              <div key={s.phone} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 7,
                background: isMe ? "rgba(0,255,136,0.07)" : i < 3 ? "rgba(255,215,0,0.03)" : "rgba(255,255,255,0.015)",
                border: isMe ? "1px solid rgba(0,255,136,0.25)" : "1px solid rgba(255,255,255,0.04)",
                fontFamily: "monospace"
              }}>
                <span style={{ fontSize: i < 3 ? 18 : 13, width: 28, textAlign: "center", color: i < 3 ? "#FFD700" : "#444" }}>
                  {i < 3 ? medals[i] : (i + 1) + "."}
                </span>
                <span style={{
                  fontSize: 18, fontWeight: 700, letterSpacing: 3, width: 70,
                  color: isMe ? "#00ff88" : i === 0 ? "#FFD700" : "#bbb",
                  textShadow: isMe ? "0 0 6px rgba(0,255,136,0.25)" : "none"
                }}>{s.name}</span>
                <span style={{ flex: 1, textAlign: "right", fontSize: 12, color: isMe ? "#00ff88" : "#888" }}>{getVal(s)}</span>
                {tab === "high" && <span style={{ fontSize: 9, color: "#444", width: 32, textAlign: "right" }}>{s.gamesPlayed}x</span>}
              </div>
            );
          })}
        </div>
      )}

      {list.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 16, fontFamily: "monospace", fontSize: 10 }}>
          {[
            { v: scores.length, l: "LEIKMENN", c: "#FFD700" },
            { v: scores.reduce((s, x) => s + x.gamesPlayed, 0), l: "LEIKIR", c: "#00BFA5" },
            { v: Math.max(...scores.map(s => s.highScore), 0), l: "MET", c: "#FF6B35" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.025)", borderRadius: 8, padding: "10px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.c }}>{s.v}</div>
              <div style={{ color: "#555" }}>{s.l}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onPlay} style={{
          flex: 1, background: "linear-gradient(135deg,#00ff88,#00cc6a)", color: "#0a0a1a",
          border: "none", padding: "12px", fontSize: 14, fontWeight: 700, borderRadius: 8,
          cursor: "pointer", fontFamily: "monospace"
        }}>{"🕹️ SPILA"}</button>
        <button onClick={onClose} style={{
          background: "rgba(255,255,255,0.05)", color: "#777", border: "1px solid #333",
          padding: "12px 16px", fontSize: 13, borderRadius: 8, cursor: "pointer", fontFamily: "monospace"
        }}>{"← LOKA"}</button>
      </div>
    </div>
  );
}

export default function FiftyYearsQuiz() {
  const [screen, setScreen] = useState("loading");
  const [player, setPlayer] = useState(null);
  const [scores, setScores] = useState([]);
  const [gameQuestions, setGameQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shakeIndex, setShakeIndex] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const sr = await window.storage.get("omar50-scores", true);
        if (sr && sr.value) setScores(JSON.parse(sr.value));
      } catch (e) { /* no scores yet */ }
      try {
        const pr = await window.storage.get("omar50-player");
        if (pr && pr.value) {
          setPlayer(JSON.parse(pr.value));
          setScreen("menu");
          return;
        }
      } catch (e) { /* no player yet */ }
      setScreen("nameEntry");
    };
    load();
  }, []);

  const saveScores = async (newScores) => {
    setScores(newScores);
    try { await window.storage.set("omar50-scores", JSON.stringify(newScores), true); } catch (e) { /* ok */ }
  };

  const savePlayer = async (p) => {
    setPlayer(p);
    try { await window.storage.set("omar50-player", JSON.stringify(p)); } catch (e) { /* ok */ }
  };

  const handleNameSubmit = (name, phone) => {
    const p = { name: name, phone: phone };
    savePlayer(p);
    const exists = scores.find(s => s.phone === phone);
    if (!exists) {
      const ns = [...scores, { name: name, phone: phone, highScore: 0, gamesPlayed: 0, bestFirst: null, worstFirst: null, totalCorrect: 0, totalQuestions: 0 }];
      saveScores(ns);
    } else if (exists.name !== name) {
      saveScores(scores.map(s => s.phone === phone ? { ...s, name: name } : s));
    }
    setScreen("menu");
  };

  const startGame = () => {
    setGameQuestions(shuffle(allQuestions));
    setQIndex(0);
    setPoints(0);
    setStreak(0);
    setBestStreak(0);
    setSelected(null);
    setAnswers([]);
    setScreen("playing");
  };

  const handlePick = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const q = gameQuestions[qIndex];
    const correct = idx === q.ans;

    if (correct) {
      const newStreak = streak + 1;
      const bonus = newStreak > 2 ? 2 : 1;
      setPoints(p => p + 10 * bonus);
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      if (newStreak >= 3) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } else {
      setStreak(0);
      setShakeIndex(idx);
      setTimeout(() => setShakeIndex(null), 600);
    }

    setAnswers(prev => [...prev, { id: q.id, correct: correct }]);
    setTimeout(() => setScreen("showAnswer"), 700);
  };

  const nextQuestion = () => {
    if (qIndex + 1 >= gameQuestions.length) {
      finishGame();
    } else {
      setQIndex(i => i + 1);
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
        highScore: Math.max(s.highScore, points),
        gamesPlayed: s.gamesPlayed + 1,
        bestFirst: isFirst ? correctCount : s.bestFirst,
        worstFirst: isFirst ? wrongCount : s.worstFirst,
        totalCorrect: (s.totalCorrect || 0) + correctCount,
        totalQuestions: (s.totalQuestions || 0) + gameQuestions.length,
      };
    });

    await saveScores(updated);
    setScreen("result");
  };

  const changePlayer = () => {
    setPlayer(null);
    try { window.storage.delete("omar50-player"); } catch (e) { /* ok */ }
    setScreen("nameEntry");
  };

  const q = gameQuestions[qIndex];
  const progress = gameQuestions.length > 0 ? ((qIndex + 1) / gameQuestions.length) * 100 : 0;
  const myStats = scores.find(s => s.phone === player?.phone);

  const getGrade = () => {
    const pct = (points / (gameQuestions.length * 10)) * 100;
    if (pct >= 90) return { emoji: "🏆", title: "BÓK LÍFSINS MEISTARI!", desc: "Þú þekkir lífið mitt betur en ég sjálfur!" };
    if (pct >= 70) return { emoji: "⭐", title: "NÆSTUM PERFEKT!", desc: "Þú veist meira en flestir um þennan þorsk." };
    if (pct >= 50) return { emoji: "👍", title: "VEL GERT!", desc: "Góður grunnur — en meira að læra!" };
    return { emoji: "📖", title: "BYRJANDI", desc: "Tími til að lesa fleiri kafla!" };
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #050510 0%, #0a0a2e 40%, #080818 100%)",
      fontFamily: "'Georgia', serif",
      color: "#e8e4df",
      position: "relative",
      overflow: "hidden"
    }}>
      {showConfetti && <Confetti />}
      <style>{styles}</style>

      {/* Scanlines */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50, background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px)" }} />

      {/* Particles */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.1 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: (10 + i * 9) + "%",
            top: (5 + i * 8) + "%",
            width: 3, height: 3,
            backgroundColor: "#00ff88",
            borderRadius: "50%",
            animation: "floatUp " + (4 + i * 0.5) + "s ease-in-out infinite",
            animationDelay: i * 0.3 + "s"
          }} />
        ))}
      </div>

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "16px 14px", position: "relative", zIndex: 1 }}>

        {screen === "loading" && (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div style={{ fontSize: 20, fontFamily: "monospace", color: "#00ff88", animation: "blinkAnim 1s infinite" }}>LOADING...</div>
          </div>
        )}

        {screen === "nameEntry" && <NameEntry onSubmit={handleNameSubmit} />}

        {/* MENU */}
        {screen === "menu" && player && (
          <div style={{ animation: "slideUp 0.5s ease-out", textAlign: "center" }}>
            <CountdownTimer />
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#FFD700", fontFamily: "monospace", marginBottom: 2 }}>{"BÓK LÍFSINS"}</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 2px", fontFamily: "'Courier New', monospace", background: "linear-gradient(135deg, #FFD700, #FF6B35)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {"50 ÁR ÓMAR"}
            </h1>
            <p style={{ fontSize: 12, color: "#666", marginBottom: 16, fontFamily: "monospace" }}>{"SPURNINGALEIKUR"}</p>

            <div style={{ background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontFamily: "monospace" }}>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 5, color: "#00ff88", textShadow: "0 0 10px rgba(0,255,136,0.25)" }}>{player.name}</div>
              {myStats && myStats.gamesPlayed > 0 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 6, fontSize: 11, color: "#777" }}>
                  <span>{"🏆 " + myStats.highScore}</span>
                  <span>{"🎮 " + myStats.gamesPlayed + "x"}</span>
                  <span>{"✅ " + Math.round(((myStats.totalCorrect || 0) / Math.max(myStats.totalQuestions || 1, 1)) * 100) + "%"}</span>
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
              {[
                { icon: "❓", val: "30", label: "Spurningar" },
                { icon: "⏱️", val: "~7m", label: "Tími" },
                { icon: "🏆", val: String(Math.max(...scores.map(s => s.highScore), 0)), label: "Met" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.025)", borderRadius: 8, padding: "10px 6px", border: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
                  <div style={{ fontSize: 18 }}>{s.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#FFD700", fontFamily: "monospace" }}>{s.val}</div>
                  <div style={{ fontSize: 9, color: "#555" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={startGame} style={{ background: "linear-gradient(135deg,#00ff88,#00cc6a)", color: "#0a0a1a", border: "none", padding: "14px", fontSize: 16, fontWeight: 700, borderRadius: 8, cursor: "pointer", fontFamily: "monospace", letterSpacing: 2, animation: "glowAnim 2s infinite" }}>
                {"🕹️ BYRJA LEIK"}
              </button>
              <button onClick={() => setScreen("leaderboard")} style={{ background: "rgba(255,215,0,0.07)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.25)", padding: "10px", fontSize: 13, borderRadius: 8, cursor: "pointer", fontFamily: "monospace" }}>
                {"🏆 STIGATAFLA"}
              </button>
              <button onClick={changePlayer} style={{ background: "none", color: "#444", border: "none", padding: "6px", fontSize: 11, cursor: "pointer", fontFamily: "monospace" }}>
                {"SKIPTA UM LEIKMANN"}
              </button>
            </div>
          </div>
        )}

        {screen === "leaderboard" && (
          <LeaderboardView scores={scores} myPhone={player?.phone} onClose={() => setScreen("menu")} onPlay={startGame} />
        )}

        {/* PLAYING + ANSWER */}
        {(screen === "playing" || screen === "showAnswer") && q && (
          <div style={{ animation: "slideUp 0.3s ease-out" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: "monospace", fontSize: 13, color: "#00ff88", fontWeight: 700, letterSpacing: 3 }}>{player?.name}</span>
              <span style={{ fontFamily: "monospace", fontSize: 13, color: "#FFD700" }}>{points + " PTS"}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: progress + "%", height: "100%", background: "linear-gradient(90deg,#00ff88,#FFD700)", borderRadius: 2, transition: "width 0.5s" }} />
              </div>
              <span style={{ fontSize: 11, color: "#444", fontFamily: "monospace" }}>{(qIndex + 1) + "/" + gameQuestions.length}</span>
            </div>

            {streak >= 2 && (
              <div style={{ textAlign: "center", marginBottom: 8, fontSize: 12, color: "#FF6B35", fontFamily: "monospace", animation: "pulseAnim 1s infinite" }}>
                {"🔥 " + streak + " Í RÖÐ!" + (streak >= 3 ? " 2X STIG!" : "")}
              </div>
            )}

            <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
              <span style={{ background: getCatColor(q.cat), color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 16, fontFamily: "monospace" }}>{q.cat}</span>
              <span style={{ background: "rgba(255,255,255,0.06)", color: "#777", fontSize: 10, padding: "2px 8px", borderRadius: 16, fontFamily: "monospace" }}>{q.yr}</span>
            </div>

            <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 16, marginBottom: 12 }}>
              <h2 style={{ fontSize: 17, fontWeight: 400, lineHeight: 1.5, margin: 0, color: "#eee" }}>{q.q}</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {q.opts.map((opt, idx) => {
                const isSel = selected === idx;
                const isCorrect = idx === q.ans;
                const done = selected !== null;
                const isShaking = shakeIndex === idx;

                let bg = "rgba(255,255,255,0.025)";
                let border = "1px solid rgba(255,255,255,0.06)";
                let color = "#ccc";

                if (done && isCorrect) { bg = "rgba(0,191,165,0.1)"; border = "2px solid #00BFA5"; color = "#00E5C0"; }
                else if (done && isSel && !isCorrect) { bg = "rgba(230,57,70,0.1)"; border = "2px solid #E63946"; color = "#FF6B6B"; }

                return (
                  <button
                    key={idx}
                    onClick={() => handlePick(idx)}
                    disabled={done}
                    style={{
                      background: bg, border: border, borderRadius: 8,
                      padding: "12px 14px", fontSize: 14, fontFamily: "inherit",
                      color: color, cursor: done ? "default" : "pointer",
                      textAlign: "left", transition: "all 0.2s",
                      animation: isShaking ? "shakeAnim 0.5s" : "none",
                      display: "flex", alignItems: "center", gap: 8
                    }}
                  >
                    <span style={{
                      width: 24, height: 24, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, flexShrink: 0,
                      background: done && isCorrect ? "#00BFA5" : done && isSel && !isCorrect ? "#E63946" : "rgba(255,255,255,0.06)",
                      color: done && (isCorrect || (isSel && !isCorrect)) ? "#fff" : "#777"
                    }}>
                      {done && isCorrect ? "✓" : done && isSel && !isCorrect ? "✗" : String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {screen === "showAnswer" && (
              <div>
                <div style={{
                  animation: "slideUp 0.4s ease-out",
                  background: "rgba(0,255,136,0.03)",
                  border: "1px solid rgba(0,255,136,0.12)",
                  borderRadius: 10, padding: 16, marginBottom: 10
                }}>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: "#bbb", marginBottom: 8 }}>{q.exp}</div>
                  <div style={{ fontSize: 11, color: "#FFD700", fontStyle: "italic", borderTop: "1px solid rgba(0,255,136,0.08)", paddingTop: 8 }}>
                    {"💡 " + q.fun}
                  </div>
                </div>
                <button onClick={nextQuestion} style={{
                  width: "100%", background: "linear-gradient(135deg,#00ff88,#00cc6a)",
                  color: "#0a0a1a", border: "none", padding: "12px",
                  fontSize: 14, fontWeight: 700, borderRadius: 8, cursor: "pointer", fontFamily: "monospace"
                }}>
                  {qIndex + 1 >= gameQuestions.length ? "SJÁ NIÐURSTÖÐUR →" : "NÆSTA →"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* RESULT */}
        {screen === "result" && (
          <div style={{ animation: "slideUp 0.6s ease-out", textAlign: "center" }}>
            {points >= gameQuestions.length * 7 && <Confetti />}
            <CountdownTimer />

            <div style={{ fontSize: 60, marginTop: 8, marginBottom: 2 }}>{getGrade().emoji}</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "monospace", color: "#00ff88", textShadow: "0 0 10px rgba(0,255,136,0.25)", marginBottom: 2 }}>{player?.name}</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px", fontFamily: "monospace", background: "linear-gradient(135deg,#FFD700,#FF6B35)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{getGrade().title}</h2>
            <p style={{ fontSize: 13, color: "#777", marginBottom: 20 }}>{getGrade().desc}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              {[
                { label: "STIG", val: String(points), col: "#FFD700" },
                { label: "RÉTT", val: answers.filter(a => a.correct).length + "/" + gameQuestions.length, col: "#00BFA5" },
                { label: "BESTA RÖÐ", val: bestStreak + "🔥", col: "#FF6B35" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: "14px 6px", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.col, fontFamily: "monospace" }}>{s.val}</div>
                  <div style={{ fontSize: 9, color: "#555", marginTop: 1 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 4, marginBottom: 16 }}>
              {answers.map((a, i) => (
                <div key={i} style={{
                  width: 22, height: 22, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700,
                  background: a.correct ? "rgba(0,191,165,0.12)" : "rgba(230,57,70,0.12)",
                  border: "2px solid " + (a.correct ? "#00BFA5" : "#E63946"),
                  color: a.correct ? "#00E5C0" : "#FF6B6B"
                }}>{a.correct ? "✓" : "✗"}</div>
              ))}
            </div>

            {myStats && points >= myStats.highScore && points > 0 && (
              <div style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 8, padding: 10, marginBottom: 12, fontFamily: "monospace", fontSize: 13, color: "#FFD700" }}>
                {"🎉 NÝTT PERSÓNULEGT MET!"}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={startGame} style={{ background: "linear-gradient(135deg,#00ff88,#00cc6a)", color: "#0a0a1a", border: "none", padding: "13px", fontSize: 15, fontWeight: 700, borderRadius: 8, cursor: "pointer", fontFamily: "monospace", letterSpacing: 2, animation: "glowAnim 2s infinite" }}>
                {"🕹️ SPILA AFTUR"}
              </button>
              <button onClick={() => setScreen("leaderboard")} style={{ background: "rgba(255,215,0,0.06)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.2)", padding: "10px", fontSize: 13, borderRadius: 8, cursor: "pointer", fontFamily: "monospace" }}>
                {"🏆 STIGATAFLA"}
              </button>
              <button onClick={() => setScreen("menu")} style={{ background: "none", color: "#444", border: "none", padding: "6px", fontSize: 11, cursor: "pointer", fontFamily: "monospace" }}>
                {"← AÐALVALMYND"}
              </button>
            </div>

            <p style={{ fontSize: 9, color: "#2a2a2a", marginTop: 16, fontStyle: "italic" }}>
              {"Bók Lífsins \u2022 400+ sögur \u2022 1976–2026 \u2022 v50.0"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
