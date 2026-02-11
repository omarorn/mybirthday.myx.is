import { useState, useEffect, useCallback } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZÆÐÞÖÁÉÍÓÚÝ ".split("");
const BIRTHDAY = new Date("2026-06-19T00:00:00");

const questions = [
  // ═══ FÆÐING & BARNÆSKA ═══
  { id:1, yr:1976, cat:"🐣 Fæðing", q:"Hverju líkti pabbi litla Ómar nýfæddum við?", opts:["Meðalstóran þorsk","Litla hvalreki","Stóran lúðu","Nýfæddan sel"], ans:0, exp:"Pabbi var sjómaður: \"Þetta er meðalstór þorskur!\" — 5 kíló, 54 cm.", fun:"Fæddist með sogklukku — hasarhetja frá fyrsta degi." },
  { id:2, yr:1976, cat:"🍼 Barnæska", q:"Hvað fékk Ómar í stað snuðs?", opts:["Þurrkaðan harðfisk","Soðinn fisk","Lýsi á skeið","Brauðsneið"], ans:1, exp:"Enginn pacifier — bara soðinn fiskur og lýsi. Orkubolti með Omega-3 í æð!", fun:"v1.0 — \"lifði fæðinguna og byrjaði strax að grafa upp bug reports.\"" },
  { id:3, yr:1976, cat:"🔧 v1.0", q:"Hvernig lýsti Ómar sjálfum sér sem nýfæddur í tæknimáli?", opts:["Fyrsta beta-prófun","Stórt update á stýrikerfi lífsins","Debug mode frá fæðingu","System crash og reboot"], ans:1, exp:"\"Mættur í heiminn eins og stórt update á stýrikerfi lífsins.\" Allt Bók Lífsins byggist á þessari hugmynd.", fun:"Hvert ár er ný útgáfa, hvert atvik er patch eða update." },
  { id:4, yr:1981, cat:"🥣 Leikskólinn", q:"Hvað var Ómar neyddur til að borða í leikskólanum?", opts:["Grænmetissúpu","Bragðlausan hafragraut","Lýsi á morgnana","Harðsoðin egg"], ans:1, exp:"Allir þurftu að klára hafragrautinn — sitja þar til diskurinn tæmdist!", fun:"Fyrsti árekstur við þvingun. Hjá pabba lærði hann hins vegar að elska mat." },
  { id:5, yr:1982, cat:"🕷️ Soffía frænka", q:"Hvaða hættuverkefni fékk Soffía frænka litla Ómar?", opts:["Gæta systur sinni","Taka köngulær úr sturtunni","Fara einn í búð","Keyra dráttarvél"], ans:1, exp:"\"Þú ert karlmaðurinn á heimilinu — taka köngulærnar úr sturtunni.\" Hann var hræddur en trúði henni!", fun:"Soffía kenndi honum að maður getur búið til sínar reglur og verið samt góð manneskja." },
  { id:6, yr:1982, cat:"💻 Sinclair", q:"Stebbi (kærasti mömmu) gaf Ómari eitthvað sem breytti öllu. Hvað?", opts:["Sinclair Spectrum tölvu","Ensku kennslubók","Trommubúnað","Atari leikjatölvu"], ans:0, exp:"Stebbi, trommari í Stuðmönnum, bjargaði honum frá einsemd með Sinclair Spectrum.", fun:"\"Stebbi gaf mér fyrstu línuna í kóðann sem varð ég sjálfur.\"" },

  // ═══ ÆSKUÁRIN ═══
  { id:7, yr:1983, cat:"👦 Atli", q:"Hvernig kallaði Ómar á barnavin sinn Atla þegar hann kom í heimsókn?", opts:["Sendi SMS","Hringdi í síma","Kallaði fyrir aftan blokkina","Sendi bréf"], ans:2, exp:"Engir símar, engar skilaboð — maður bara birtist! Kallaði fyrir aftan blokkina í Lönguvítlesunni.", fun:"\"Ef Ómar kom, þá var öllum öðrum vinum hent út — það var bara við tveir.\"" },
  { id:8, yr:1990, cat:"📺 Keflavíkursveit", q:"Hvaða kvikmyndahetja var fyrirmynd Ómars sem enginn jafnaldri þekkti?", opts:["James Bond","Indiana Jones","Rambo","MacGyver"], ans:1, exp:"Indiana Jones á vídeóspólu! Kanalsjónvarpið streymdi inn enskri menningu sem enginn annar skildi.", fun:"\"Alltaf öðruvísi, alltaf utan við normið\" — einangrun sem varð styrkleiki." },
  { id:9, yr:1990, cat:"⚓ Sjórinn", q:"Hvað sá Ómar þegar hann fór 9 ára á sjó með pabba?", opts:["Fallegasta sólsetur","Hluti sem barn á ekki að sjá","Risa stóran fisk","Norðurljós"], ans:1, exp:"Vídeóspólur, B-myndir og efni langt umfram aldur hans. Enginn vernduði hann.", fun:"Í heimi fullorðinna karla lærði hann snemma að þegjast og aðlagast." },

  // ═══ FIAT UNO SÖGUÞRÁÐURINN ═══
  { id:10, yr:1992, cat:"🚗 Fiat Uno", q:"Hvaðan fékk 16 ára Ómar númeraplötur á Fiat Uno?", opts:["Úr ruslatunnu","Af gömlum Buick í bílageymslu","Frá lögreglumanni","Smíðaði sjálfur"], ans:1, exp:"Grár Buick frá 50-áratugnum sem hreyfðist aldrei. \"Lánaði\" plötuna og skrifaði númer á pappaspjald!", fun:"Afturendi Buicksins var klestur upp við vegg — enginn tók eftir neinu." },
  { id:11, yr:1992, cat:"🚔 Lögreglan", q:"Þegar lögreglan stöðvaði Ómar á Fiatnum, hvað gerði hann?", opts:["Sagðist vera sendiráðsmaður","Gaf ranga kennitölu (75 í stað 76)","Þóttist vera sofandi","Sagði bíllinn tilheyrði pabba"], ans:1, exp:"Sagðist fæddur 1975! Lögreglan: \"Farðu þangað sem þú þarft og drífðu þig heim.\"", fun:"Vinirnir þóttust vera áfengisdauðir á baksætinu." },
  { id:12, yr:1992, cat:"🚗 Fiat Uno", q:"Hvað gerðu þeir þegar dekkið sprakk í Keflavík?", opts:["Hringdu í Vegaþjónustuna","Gengu heim","Stálu varadekkjum úr ólæstum bílum","Skutluðu á 3 dekkjum"], ans:2, exp:"Fundu bíla með ólæstu skotti — plús eitt aukalega úr næsta Fiat, bara til öryggis!", fun:"Ökunnarinn seinna: \"Þú hefur klárlega keyrt áður.\" Ómar: \"Já... í sveitinni.\"" },
  { id:13, yr:1992, cat:"🚗 Fiat Uno", q:"Hversu mörg brot hafði Ómar framið þegar lögreglan stöðvaði hann?", opts:["Eitt brot","Tvö brot","Þrjú til fjögur brot","Fimm brot"], ans:2, exp:"Enginn ökuskírteini, engin skoðun, rangar plötur, röng kennitala — þrjú eða fjögur brot!", fun:"\"Líklega bjargaði það að ekki voru til tölvukerfi í bílunum eins og í dag.\"" },

  // ═══ TÖLVUMAÐURINN ═══
  { id:14, yr:1999, cat:"📞 Tölvun", q:"Hvernig fékk Ómar fyrstu vinnuna í tölvubransanum?", opts:["Sótti um 50 störf","Símtal: \"Viltu kíkja í spjall?\"","Vann keppni","Frændi fékk honum starf"], ans:1, exp:"Davíð í Tölvun hringdi og bauð í spjall. Eitt símtal — hætti á sjónum!", fun:"\"Toy Story Claw\" mynstur — hann virkar best þegar hann er valinn." },
  { id:15, yr:1999, cat:"📚 MCSE", q:"Hversu mörg MCSE-próf tók Ómar á 8 vikum?", opts:["3 próf","4 próf","6 próf","8 próf"], ans:2, exp:"Sex próf á átta vikum! Á ensku. Féll tvisvar en gafst aldrei upp.", fun:"ADHD hyperfocus sem career-launcher!" },

  // ═══ SAMBÖNDIN ═══
  { id:16, yr:2000, cat:"💛 Vallý", q:"Hvað gerðist þegar Vallý aflýsti Danmörku-ferð 2000?", opts:["Þau slitu samband","Magnús var getinn","Ómar fór einn","Ekkert sérstakt"], ans:1, exp:"Vallý aflýsti ferðinni — og þetta kvöld var Magnús Örn getinn. Einn helsti vendipunktur lífsins!", fun:"Score 0.95 í vendipunktaskalanum — fátt hafði meiri áhrif." },
  { id:17, yr:2000, cat:"👶 Magnús", q:"Hvaða ráð sagði Magnús (sonur) sem varð ADHD-mantra?", opts:["\"Slökktu á tölvunni\"","\"TAH: Task At Hand — eitt í einu\"","\"Þú ert nógu góður\"","\"Hættu að pæla\""], ans:1, exp:"TAH: Task At Hand — aðeins eitt task í einu. Frá eigin syni!", fun:"Stundum kenna börnin okkur það sem engin kennari getur." },
  { id:18, yr:2001, cat:"☀️ Kanarí", q:"Hvað gerðu Ómar og pabbi hans á Kanaríeyjum?", opts:["Fóru á hvalaskoðun","Prentuðu mynd af ömmu á boli","Fóru á fjallið","Keyrðu á vespu"], ans:1, exp:"Prentuðu mynd af ömmu á boli fyrir jólin! Hlátur og vinátta eftir erfið ár.", fun:"Fyrsta raunverulega sáttin eftir 3 ár af þögn." },
  { id:19, yr:2002, cat:"🎉 Partý", q:"Hvað sáu þeir fyrst á partýi hjá vinkonu Fjólu?", opts:["DJ með Stuðmenn","Stelpur í fatapóker — ein nakin","Veislu í garðinum","Alla sofandi"], ans:1, exp:"Bringubúspartý! \"Er þetta bara strax besta partý sem við höfum nokkurn tímann verið boðið í!\"", fun:"Upphafið að 20+ ára vináttu við Fjólu Dís." },
  { id:20, yr:2002, cat:"👦 Atli", q:"Hvernig endurheimuðu Ómar og Atli barnavináttu?", opts:["Facebook","Fletti upp í Frammáli — símaskrá framhaldsskóla","Mættust á götu","Hittust á djammi"], ans:1, exp:"Vallý átti bók \"Frammál\" — Ómar fletti Atla upp, hringdi í heimasíma og þeir tengdust aftur!", fun:"Mætti á 20 ára afmælið og vináttan tók við — 40 ár síðan." },
  { id:21, yr:2002, cat:"💰 Atli", q:"Þegar Ómar sagði stoltur: \"Ég er með milljón!\" — hvað svaraði Atli?", opts:["\"Vel gert!\"","\"Já, ég er með þrjár núna.\"","\"Ég er líka á leiðinni\"","\"Skuldalaus er betri\""], ans:1, exp:"Atli las Brian Tracy bækurnar og svaraði rólega: \"Já, ég er með þrjár.\" Ómar: \"...dóhhh.\"", fun:"\"Atli sparaði. Ég brenndi. Hann varð öruggur. Ég varð óstöðugur.\"" },

  // ═══ NÝRRI TÍMAR ═══
  { id:22, yr:2015, cat:"🌅 Ewalina", q:"Hvað gerðist þegar Ómar hitti Ewalinu?", opts:["Ekkert sérstakt","Allt í nýju ljósi — tónlist, matur, hugmyndir","Hann varð reiður","Fór til útlanda"], ans:1, exp:"\"Tónlist fór að hljóma betur, matur bragðaðist betur. Eins og ég hefði verið sofandi.\"", fun:"Hugmyndirnar komu svo hratt að hann gat ekki skrifað nógu hratt." },
  { id:23, yr:2017, cat:"🔄 omar4.0", q:"Hvað kallaði Ómar verkefni sitt þegar hann byrjaði „árlegar stórar uppfærslur\"?", opts:["Bók Lífsins","omar4.0","Project Rebirth","Nýr Maður"], ans:1, exp:"omar4.0 — stór uppfærsla 19. júní 2017. Héðan í frá árlega, ekki á 10 ára fresti!", fun:"Mantran: \"Vera besta útgáfa af sjálfum mér.\"" },
  { id:24, yr:2019, cat:"💕 Preelley", q:"Hvernig lýsti Ómar Þórey í brúðkaupseyðublaðinu?", opts:["\"Gáfuð\"","\"Opin, skemmtileg og flott brjóst\"","\"Besti kokkurinn\"","\"Skilur barnið í mér\""], ans:1, exp:"Heiðarlegt svar: \"Opin, skemmtileg og með flott brjóst — og hún virðist skilja mig.\"", fun:"Bað henni \"eins og í 10 bekk\" — fyrst poke, svo date, svo kaffi." },
  { id:25, yr:2020, cat:"💊 ADHD", q:"Hvað hélt Ómar þegar hann fékk ADHD-greiningu?", opts:["Hann myndi \"lagast\"","Hann yrði frægur","Ekkert myndi breytast","Hann fengi bifreið"], ans:0, exp:"\"Ég hélt ég væri loksins að fara að lagast. Það var hreint ekki svona.\"", fun:"Strattera, Ritalín, Elvanse — hvert lyf með sína sögu." },
  { id:26, yr:2023, cat:"🌿 Sjálfsskilningur", q:"Hvenær breytist \"notkun\" í \"fíkn\" samkvæmt Ómari?", opts:["Á hverjum degi","Þegar maður fer að fela og skammast sín","Of mikill peningur","Missir vinnuna"], ans:1, exp:"\"Þegar þú ferð að fela, þegar þú skammast þín — þá breytist notkunin í fíkn.\"", fun:"Sjálfslyfjakenningin: allt leit að dopamíni." },
  { id:27, yr:2025, cat:"🤒 Kuldinn", q:"Hvernig lýsti Ómar veikindum nóvember 2025?", opts:["\"Bara flensa\"","\"Líkaminn á flight mode — ljósin slökktu\"","\"Smá kvef\"","\"Ekkert alvarlegt\""], ans:1, exp:"\"Líkaminn fór á flight mode.\" 401: Body Not Found. Festist milli tveggja boot screens!", fun:"Singles Day 11.11 — líkaminn tók frí. Hann lýsir sér sem tölvu." },
  { id:28, yr:2025, cat:"💑 Dóra", q:"Hvað vakti Ómar við þegar hann lá hjá Dóru í Hrafnhólum?", opts:["Þvottavél","Pípið í heyrnartækinu — rafhlöðurnar búnar","Vekjaraklukku","Síma sem hringdi"], ans:1, exp:"Pípið í heyrnartækinu minnti hann á rafhlöðurnar. Svo leit hann yfir Reykjavík úr glugganum — \"útsýni sem ég hef aldrei séð.\"", fun:"Þau lágu í 90 cm rúmi — frænka Dóru fékk hjónaherbergið." },
  { id:29, yr:2026, cat:"🎵 Low Battery", q:"Hvað var fyrsta lagið sem Ómar samdi (2. janúar 2026)?", opts:["\"Bók Lífsins\"","\"Low Battery\"","\"v49.4\"","\"Hingað en ekki lengra\""], ans:1, exp:"\"Low Battery\" — hráir, ófiltruðir textar: \"Ég gekk inn í árið með opið sár sem ég hélt væri tár...\"", fun:"Ekki ætlað að verða lag — bara orð sem þurftu að komast út." },
  { id:30, yr:2026, cat:"🍺 Budapest", q:"Hversu marga bjóra drukku þeir á 4 dögum í Budapest?", opts:["20","30","40","50"], ans:2, exp:"40 bjórar á fjórum dögum og 3000 km! Labbaði yfir allar brýr Dónár.", fun:"Gleymdi alveg að taka myndir. \"Alls konar líf í gangi, og við bara þar.\"" },
];

function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}

function Confetti(){return(<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:999}}>{Array.from({length:60}).map((_,i)=>(<div key={i} style={{position:"absolute",left:`${Math.random()*100}%`,top:"-10px",width:`${5+Math.random()*8}px`,height:`${5+Math.random()*8}px`,backgroundColor:["#FF6B35","#F7C948","#E63946","#457B9D","#E040FB","#00BFA5","#FF4081","#7C4DFF","#FFD700"][Math.floor(Math.random()*9)],borderRadius:Math.random()>.5?"50%":"2px",animation:`cF ${2+Math.random()*3}s ease-in forwards`,animationDelay:`${Math.random()*1.5}s`}}/>)}</div>);}

// ══════════ COUNTDOWN ══════════
function Countdown() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const diff = BIRTHDAY - now;
  if (diff <= 0) return (
    <div style={{ textAlign: "center", padding: "12px 0" }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#FFD700", fontFamily: "monospace", textShadow: "0 0 20px #FFD70066" }}>
        🎂 TIL HAMINGJU MEÐ 50 ÁRA DAGINN! 🎂
      </div>
    </div>
  );

  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  return (
    <div style={{ textAlign: "center", marginBottom: 16 }}>
      <div style={{ fontSize: 10, letterSpacing: 4, color: "#FFD700", textTransform: "uppercase", marginBottom: 6, fontFamily: "monospace" }}>
        Niðurtalning að 50 ára afmæli Ómars
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
        {[
          { val: days, label: "DAGAR" },
          { val: hrs, label: "KLST" },
          { val: mins, label: "MÍN" },
          { val: secs, label: "SEK" },
        ].map((u, i) => (
          <div key={i} style={{
            background: "rgba(255,215,0,0.06)",
            border: "1px solid rgba(255,215,0,0.2)",
            borderRadius: 8, padding: "8px 10px", minWidth: 54
          }}>
            <div style={{
              fontSize: 22, fontWeight: 700, fontFamily: "'Courier New', monospace",
              color: "#FFD700", textShadow: "0 0 8px #FFD70044",
              lineHeight: 1
            }}>
              {String(u.val).padStart(2, "0")}
            </div>
            <div style={{ fontSize: 8, color: "#997A00", letterSpacing: 1, marginTop: 2 }}>{u.label}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 9, color: "#554400", marginTop: 6, fontFamily: "monospace" }}>
        19. júní 2026 • v50.0 🎉
      </div>
    </div>
  );
}

// ══════════ ARCADE NAME ══════════
function ArcadeNameEntry({ onSubmit }) {
  const [chars, setChars] = useState([0, 0, 0]);
  const [slot, setSlot] = useState(0);
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("name");
  const [blink, setBlink] = useState(true);

  useEffect(() => { const t = setInterval(() => setBlink(b => !b), 500); return () => clearInterval(t); }, []);

  const scroll = (dir) => {
    setChars(p => { const n = [...p]; n[slot] = (n[slot] + dir + CHARS.length) % CHARS.length; return n; });
  };

  const name3 = chars.map(i => CHARS[i]).join("");

  return (
    <div style={{ animation: "sU .6s ease-out", textAlign: "center" }}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:50,background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.06) 2px,rgba(0,0,0,.06) 4px)"}}/>

      <Countdown />

      <div style={{ fontSize: 40, margin: "16px 0 4px" }}>🕹️</div>
      <div style={{ fontSize: 10, letterSpacing: 5, color: "#00ff88", marginBottom: 2, fontFamily: "monospace" }}>INSERT COIN</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px", fontFamily: "'Courier New', monospace", color: "#00ff88", textShadow: "0 0 10px #00ff8844" }}>
        SLÁÐU INN NAFN
      </h1>
      <p style={{ fontSize: 11, color: "#555", marginBottom: 20, fontFamily: "monospace" }}>3 STAFIR — EINS OG Í GÖMLU SPILASÖLUM</p>

      {step === "name" && (
        <>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 20 }}>
            {[0,1,2].map(s => (
              <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <button onClick={() => { setSlot(s); setTimeout(() => scroll(-1), 0); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: slot===s?"#00ff88":"#333", fontSize: 18 }}>▲</button>
                <div onClick={() => setSlot(s)} style={{
                  width: 56, height: 72, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 42, fontWeight: 700, fontFamily: "'Courier New', monospace",
                  color: slot===s?"#00ff88":"#FFD700",
                  textShadow: slot===s?"0 0 15px #00ff88":"0 0 6px #FFD70044",
                  background: slot===s?"rgba(0,255,136,.06)":"rgba(255,255,255,.02)",
                  border: slot===s?"2px solid #00ff88":"2px solid rgba(255,255,255,.08)",
                  borderRadius: 8, cursor: "pointer",
                  opacity: slot===s && blink ? 1 : slot===s ? .65 : 1
                }}>{CHARS[chars[s]]}</div>
                <button onClick={() => { setSlot(s); setTimeout(() => scroll(1), 0); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: slot===s?"#00ff88":"#333", fontSize: 18 }}>▼</button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
            {[0,1,2].map(s => (<div key={s} onClick={() => setSlot(s)} style={{ width: 8, height: 8, borderRadius: "50%", cursor: "pointer", background: slot===s?"#00ff88":"#333", boxShadow: slot===s?"0 0 6px #00ff88":"none" }}/>))}
          </div>
          <div style={{ fontSize: 13, color: "#777", marginBottom: 20, fontFamily: "monospace" }}>
            PLAYER: <span style={{ color: "#00ff88", fontSize: 16, fontWeight: 700 }}>{name3}</span>
          </div>
          <button onClick={() => setStep("phone")} style={{
            background: "linear-gradient(135deg, #00ff88, #00cc6a)", color: "#0a0a1a", border: "none",
            padding: "12px 36px", fontSize: 15, fontWeight: 700, borderRadius: 8, cursor: "pointer",
            fontFamily: "'Courier New', monospace", letterSpacing: 2, boxShadow: "0 0 20px rgba(0,255,136,.25)"
          }}>ÁFRAM →</button>
        </>
      )}

      {step === "phone" && (
        <>
          <div style={{ fontSize: 32, fontFamily: "'Courier New', monospace", color: "#FFD700", textShadow: "0 0 10px #FFD70044", marginBottom: 12, fontWeight: 700 }}>{name3}</div>
          <p style={{ fontSize: 11, color: "#555", marginBottom: 12, fontFamily: "monospace" }}>SÍMANÚMER TIL AUÐKENNINGAR</p>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/[^\d-]/g, "").slice(0, 11))} placeholder="000-0000"
            style={{ background: "rgba(0,255,136,.05)", border: "2px solid #00ff88", borderRadius: 8, padding: "12px 16px", fontSize: 24, fontFamily: "'Courier New', monospace", color: "#00ff88", textAlign: "center", width: 200, outline: "none", letterSpacing: 3, marginBottom: 20 }}
            autoFocus
          />
          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
            <button onClick={() => setStep("name")} style={{ background: "rgba(255,255,255,.05)", color: "#777", border: "1px solid #333", padding: "10px 20px", fontSize: 13, borderRadius: 8, cursor: "pointer", fontFamily: "'Courier New', monospace" }}>← TILBAKA</button>
            <button onClick={() => { if (phone.length>=7) onSubmit(name3, phone); }} disabled={phone.length<7} style={{
              background: phone.length>=7?"linear-gradient(135deg,#00ff88,#00cc6a)":"#222",
              color: phone.length>=7?"#0a0a1a":"#555", border: "none", padding: "10px 28px",
              fontSize: 15, fontWeight: 700, borderRadius: 8, cursor: phone.length>=7?"pointer":"default",
              fontFamily: "'Courier New', monospace", letterSpacing: 2
            }}>BYRJA! 🕹️</button>
          </div>
        </>
      )}
    </div>
  );
}

// ══════════ LEADERBOARD ══════════
function Leaderboard({ scores, me, onClose, onPlay }) {
  const [tab, setTab] = useState("high");
  const tabs = [
    { id: "high", label: "🏆 Hæst", col: "#FFD700" },
    { id: "plays", label: "🔁 Flest", col: "#00BFA5" },
    { id: "best1st", label: "✅ Best 1.", col: "#4CAF50" },
    { id: "worst1st", label: "💀 Verst 1.", col: "#E63946" },
  ];

  const getList = () => {
    switch(tab) {
      case "high": return [...scores].sort((a,b)=>b.hi-a.hi);
      case "plays": return [...scores].sort((a,b)=>b.gp-a.gp);
      case "best1st": return [...scores].sort((a,b)=>(b.b1||0)-(a.b1||0));
      case "worst1st": return [...scores].sort((a,b)=>(b.w1||0)-(a.w1||0));
      default: return scores;
    }
  };
  const getVal = (s) => {
    switch(tab) {
      case "high": return `${s.hi} stig`;
      case "plays": return `${s.gp}x spilað`;
      case "best1st": return `${s.b1||0}/${questions.length} rétt`;
      case "worst1st": return `${s.w1||0}/${questions.length} vitlaust`;
      default: return s.hi;
    }
  };

  const list = getList();
  const medals = ["🥇","🥈","🥉"];

  return (
    <div style={{ animation: "sU .5s ease-out" }}>
      <Countdown />
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: "#FFD700", fontFamily: "monospace" }}>HALL OF FAME</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, fontFamily: "'Courier New', monospace", color: "#00ff88", textShadow: "0 0 8px #00ff8844" }}>STIGATAFLA</h2>
      </div>

      <div style={{ display: "flex", gap: 3, marginBottom: 16, overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab===t.id?"rgba(255,255,255,.08)":"rgba(255,255,255,.02)",
            border: tab===t.id?`1px solid ${t.col}`:"1px solid transparent",
            borderRadius: 6, padding: "6px 10px", fontSize: 11,
            fontFamily: "'Courier New', monospace", color: tab===t.id?t.col:"#555",
            cursor: "pointer", whiteSpace: "nowrap"
          }}>{t.label}</button>
        ))}
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: "center", padding: 30, color: "#444", fontFamily: "monospace", fontSize: 13 }}>ENGINN ENNÞÁ — VERTU FYRSTUR!</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 16 }}>
          {list.slice(0, 15).map((s, i) => {
            const isMe = me && s.ph === me;
            return (
              <div key={s.ph} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 7,
                background: isMe?"rgba(0,255,136,.07)":i<3?"rgba(255,215,0,.03)":"rgba(255,255,255,.015)",
                border: isMe?"1px solid rgba(0,255,136,.25)":"1px solid rgba(255,255,255,.04)",
                fontFamily: "'Courier New', monospace"
              }}>
                <span style={{ fontSize: i<3?18:13, width: 28, textAlign: "center", color: i<3?"#FFD700":"#444" }}>{i<3?medals[i]:`${i+1}.`}</span>
                <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: 3, width: 70, color: isMe?"#00ff88":i===0?"#FFD700":"#bbb", textShadow: isMe?"0 0 6px #00ff8844":i===0?"0 0 6px #FFD70044":"none" }}>{s.nm}</span>
                <span style={{ flex: 1, textAlign: "right", fontSize: 12, color: isMe?"#00ff88":"#888" }}>{getVal(s)}</span>
                {tab==="high" && <span style={{ fontSize: 9, color: "#444", width: 32, textAlign: "right" }}>{s.gp}x</span>}
              </div>
            );
          })}
        </div>
      )}

      {list.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 16, fontFamily: "monospace", fontSize: 10 }}>
          {[
            { v: scores.length, l: "LEIKMENN", c: "#FFD700" },
            { v: scores.reduce((s,x)=>s+x.gp,0), l: "LEIKIR", c: "#00BFA5" },
            { v: Math.max(...scores.map(s=>s.hi),0), l: "MET", c: "#FF6B35" },
          ].map((s,i) => (
            <div key={i} style={{ background: "rgba(255,255,255,.025)", borderRadius: 8, padding: "10px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.c }}>{s.v}</div>
              <div style={{ color: "#555" }}>{s.l}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onPlay} style={{ flex: 1, background: "linear-gradient(135deg,#00ff88,#00cc6a)", color: "#0a0a1a", border: "none", padding: "12px", fontSize: 14, fontWeight: 700, borderRadius: 8, cursor: "pointer", fontFamily: "'Courier New', monospace" }}>🕹️ SPILA</button>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,.05)", color: "#777", border: "1px solid #333", padding: "12px 16px", fontSize: 13, borderRadius: 8, cursor: "pointer", fontFamily: "'Courier New', monospace" }}>← LOKA</button>
      </div>
    </div>
  );
}

// ══════════ MAIN ══════════
export default function App() {
  const [scr, setScr] = useState("load");
  const [pl, setPl] = useState(null);
  const [scores, setScores] = useState([]);
  const [shuf, setShuf] = useState([]);
  const [qi, setQi] = useState(0);
  const [pts, setPts] = useState(0);
  const [str, setStr] = useState(0);
  const [bStr, setBStr] = useState(0);
  const [sel, setSel] = useState(null);
  const [ans, setAns] = useState([]);
  const [conf, setConf] = useState(false);
  const [shk, setShk] = useState(null);

  useEffect(() => {
    (async () => {
      try { const r = await window.storage.get("q50-scores", true); if (r) setScores(JSON.parse(r.value)); } catch {}
      try { const r = await window.storage.get("q50-player"); if (r) { setPl(JSON.parse(r.value)); setScr("menu"); return; } } catch {}
      setScr("name");
    })();
  }, []);

  const saveS = async (ns) => { setScores(ns); try { await window.storage.set("q50-scores", JSON.stringify(ns), true); } catch {} };
  const saveP = async (p) => { setPl(p); try { await window.storage.set("q50-player", JSON.stringify(p)); } catch {} };

  const onName = (nm, ph) => {
    const p = { nm, ph };
    saveP(p);
    const ex = scores.find(s => s.ph === ph);
    if (!ex) saveS([...scores, { nm, ph, hi: 0, gp: 0, b1: null, w1: null, tc: 0, tq: 0 }]);
    else if (ex.nm !== nm) saveS(scores.map(s => s.ph === ph ? { ...s, nm } : s));
    setScr("menu");
  };

  const start = () => {
    setShuf(shuffle(questions)); setQi(0); setPts(0); setStr(0); setBStr(0); setSel(null); setAns([]);
    setScr("play");
  };

  const pick = (idx) => {
    if (sel !== null) return;
    setSel(idx);
    const q = shuf[qi];
    const ok = idx === q.ans;
    if (ok) {
      const ns = str + 1;
      setPts(p => p + 10 * (ns > 2 ? 2 : 1));
      setStr(ns);
      if (ns > bStr) setBStr(ns);
      if (ns >= 3) { setConf(true); setTimeout(() => setConf(false), 3000); }
    } else {
      setStr(0); setShk(idx); setTimeout(() => setShk(null), 600);
    }
    setAns(a => [...a, { id: q.id, ok }]);
    setTimeout(() => setScr("ans"), 700);
  };

  const next = () => {
    if (qi + 1 >= shuf.length) { finish(); }
    else { setQi(i => i + 1); setSel(null); setScr("play"); }
  };

  const finish = async () => {
    const cc = ans.filter(a => a.ok).length;
    const wc = ans.filter(a => !a.ok).length;
    const up = scores.map(s => {
      if (s.ph !== pl.ph) return s;
      const first = s.gp === 0;
      return { ...s, nm: pl.nm, hi: Math.max(s.hi, pts), gp: s.gp + 1, b1: first ? cc : s.b1, w1: first ? wc : s.w1, tc: (s.tc||0)+cc, tq: (s.tq||0)+shuf.length };
    });
    await saveS(up);
    setScr("result");
  };

  const changePl = () => { setPl(null); try { window.storage.delete("q50-player"); } catch {} setScr("name"); };

  const q = shuf[qi];
  const prog = shuf.length > 0 ? ((qi+1)/shuf.length)*100 : 0;
  const my = scores.find(s => s.ph === pl?.ph);

  const grade = () => {
    const p = (pts / (shuf.length * 10)) * 100;
    if (p >= 90) return { e: "🏆", t: "BÓK LÍFSINS MEISTARI!", d: "Þú þekkir lífið mitt betur en ég sjálfur!" };
    if (p >= 70) return { e: "⭐", t: "NÆSTUM PERFEKT!", d: "Þú veist meira en flestir um þennan þorsk." };
    if (p >= 50) return { e: "👍", t: "VEL GERT!", d: "Góður grunnur!" };
    return { e: "📖", t: "BYRJANDI", d: "Tími til að lesa fleiri kafla!" };
  };

  const cc = { "🐣":"#FF6B35","🍼":"#F7C948","🔧":"#7C4DFF","🥣":"#8BC34A","🕷️":"#9C27B0","💻":"#00BFA5","👦":"#457B9D","📺":"#2196F3","⚓":"#37474F","🚗":"#E63946","🚔":"#E63946","📞":"#FF9800","📚":"#795548","💛":"#FFEB3B","👶":"#FF4081","☀️":"#FFD54F","🎉":"#E040FB","💰":"#4CAF50","🌅":"#FF7043","🔄":"#7C4DFF","💕":"#FF4081","💊":"#66BB6A","🌿":"#43A047","🤒":"#78909C","💑":"#EC407A","🎵":"#AB47BC","🍺":"#FF9800" };
  const catC = (c) => cc[c?.substring(0,2)] || "#888";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #050510 0%, #0a0a2e 40%, #080818 100%)", fontFamily: "'Georgia', serif", color: "#e8e4df", position: "relative", overflow: "hidden" }}>
      {conf && <Confetti />}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:50,background:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.03) 3px,rgba(0,0,0,.03) 4px)"}}/>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",opacity:.1}}>{Array.from({length:12}).map((_,i)=>(<div key={i} style={{position:"absolute",left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:`${2+Math.random()*3}px`,height:`${2+Math.random()*3}px`,backgroundColor:"#00ff88",borderRadius:"50%",animation:`fl ${4+Math.random()*6}s ease-in-out infinite`,animationDelay:`${Math.random()*5}s`}}/>))}</div>

      <style>{`
        @keyframes fl{0%,100%{transform:translateY(0) scale(1);opacity:.3}50%{transform:translateY(-20px) scale(1.5);opacity:.8}}
        @keyframes sU{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cF{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
        @keyframes shX{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
        @keyframes glow{0%,100%{box-shadow:0 0 15px rgba(0,255,136,.3)}50%{box-shadow:0 0 30px rgba(0,255,136,.5)}}
        @keyframes bk{0%,100%{opacity:1}50%{opacity:.4}}
      `}</style>

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "16px 14px", position: "relative", zIndex: 1 }}>

        {scr === "load" && <div style={{ textAlign: "center", paddingTop: 80 }}><div style={{ fontSize: 20, fontFamily: "monospace", color: "#00ff88", animation: "bk 1s infinite" }}>LOADING...</div></div>}

        {scr === "name" && <ArcadeNameEntry onSubmit={onName} />}

        {/* ══ MENU ══ */}
        {scr === "menu" && pl && (
          <div style={{ animation: "sU .5s ease-out", textAlign: "center" }}>
            <Countdown />

            <div style={{ fontSize: 10, letterSpacing: 4, color: "#FFD700", fontFamily: "monospace", marginBottom: 2 }}>BÓK LÍFSINS</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 2px", fontFamily: "'Courier New', monospace", background: "linear-gradient(135deg, #FFD700, #FF6B35)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              50 ÁR ÓMAR
            </h1>
            <p style={{ fontSize: 12, color: "#666", marginBottom: 16, fontFamily: "monospace" }}>SPURNINGALEIKUR</p>

            <div style={{ background: "rgba(0,255,136,.04)", border: "1px solid rgba(0,255,136,.15)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontFamily: "monospace" }}>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 5, color: "#00ff88", textShadow: "0 0 10px #00ff8844" }}>{pl.nm}</div>
              {my && my.gp > 0 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 6, fontSize: 11, color: "#777" }}>
                  <span>🏆 {my.hi}</span><span>🎮 {my.gp}x</span><span>✅ {Math.round(((my.tc||0)/Math.max(my.tq||1,1))*100)}%</span>
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
              {[{ i:"❓",v:"30",l:"Spurningar" },{ i:"⏱️",v:"~7m",l:"Tími" },{ i:"🏆",v:`${Math.max(...scores.map(s=>s.hi),0)}`,l:"Met" }].map((s,i) => (
                <div key={i} style={{ background: "rgba(255,255,255,.025)", borderRadius: 8, padding: "10px 6px", border: "1px solid rgba(255,255,255,.04)", textAlign: "center" }}>
                  <div style={{ fontSize: 18 }}>{s.i}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#FFD700", fontFamily: "monospace" }}>{s.v}</div>
                  <div style={{ fontSize: 9, color: "#555" }}>{s.l}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={start} style={{ background: "linear-gradient(135deg,#00ff88,#00cc6a)", color: "#0a0a1a", border: "none", padding: "14px", fontSize: 16, fontWeight: 700, borderRadius: 8, cursor: "pointer", fontFamily: "'Courier New', monospace", letterSpacing: 2, animation: "glow 2s infinite" }}>🕹️ BYRJA LEIK</button>
              <button onClick={() => setScr("board")} style={{ background: "rgba(255,215,0,.07)", color: "#FFD700", border: "1px solid rgba(255,215,0,.25)", padding: "10px", fontSize: 13, borderRadius: 8, cursor: "pointer", fontFamily: "'Courier New', monospace" }}>🏆 STIGATAFLA</button>
              <button onClick={changePl} style={{ background: "none", color: "#444", border: "none", padding: "6px", fontSize: 11, cursor: "pointer", fontFamily: "monospace" }}>SKIPTA UM LEIKMANN</button>
            </div>
          </div>
        )}

        {scr === "board" && <Leaderboard scores={scores} me={pl?.ph} onClose={() => setScr("menu")} onPlay={start} />}

        {/* ══ PLAY / ANS ══ */}
        {(scr === "play" || scr === "ans") && q && (
          <div style={{ animation: "sU .3s ease-out" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: "monospace", fontSize: 13, color: "#00ff88", fontWeight: 700, letterSpacing: 3 }}>{pl?.nm}</span>
              <span style={{ fontFamily: "monospace", fontSize: 13, color: "#FFD700" }}>{pts} PTS</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,.05)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${prog}%`, height: "100%", background: "linear-gradient(90deg,#00ff88,#FFD700)", borderRadius: 2, transition: "width .5s" }}/>
              </div>
              <span style={{ fontSize: 11, color: "#444", fontFamily: "monospace" }}>{qi+1}/{shuf.length}</span>
            </div>

            {str >= 2 && <div style={{ textAlign: "center", marginBottom: 8, fontSize: 12, color: "#FF6B35", fontFamily: "monospace", animation: "pulse 1s infinite" }}>🔥 {str} Í RÖÐ! {str>=3?"2X STIG!":""}</div>}

            <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
              <span style={{ background: catC(q.cat), color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 16, fontFamily: "monospace" }}>{q.cat}</span>
              <span style={{ background: "rgba(255,255,255,.06)", color: "#777", fontSize: 10, padding: "2px 8px", borderRadius: 16, fontFamily: "monospace" }}>{q.yr}</span>
            </div>

            <div style={{ background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 10, padding: 16, marginBottom: 12 }}>
              <h2 style={{ fontSize: 17, fontWeight: 400, lineHeight: 1.5, margin: 0, color: "#eee" }}>{q.q}</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {q.opts.map((o, idx) => {
                const iS = sel===idx, iC = idx===q.ans, dn = sel!==null, sk = shk===idx;
                let bg="rgba(255,255,255,.025)",bd="1px solid rgba(255,255,255,.06)",cl="#ccc";
                if(dn&&iC){bg="rgba(0,191,165,.1)";bd="2px solid #00BFA5";cl="#00E5C0";}
                else if(dn&&iS&&!iC){bg="rgba(230,57,70,.1)";bd="2px solid #E63946";cl="#FF6B6B";}
                return(
                  <button key={idx} onClick={()=>pick(idx)} disabled={dn} style={{
                    background:bg,border:bd,borderRadius:8,padding:"12px 14px",fontSize:14,fontFamily:"inherit",
                    color:cl,cursor:dn?"default":"pointer",textAlign:"left",transition:"all .2s",
                    animation:sk?"shX .5s":"none",display:"flex",alignItems:"center",gap:8
                  }}
                  onMouseOver={e=>{if(!dn){e.currentTarget.style.background="rgba(255,255,255,.05)";e.currentTarget.style.borderColor="rgba(0,255,136,.3)";}}}
                  onMouseOut={e=>{if(!dn){e.currentTarget.style.background=bg;e.currentTarget.style.borderColor="rgba(255,255,255,.06)";}}}
                  >
                    <span style={{width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0,background:dn&&iC?"#00BFA5":dn&&iS&&!iC?"#E63946":"rgba(255,255,255,.06)",color:dn&&(iC||(iS&&!iC))?"#fff":"#777"}}>{dn&&iC?"✓":dn&&iS&&!iC?"✗":String.fromCharCode(65+idx)}</span>
                    {o}
                  </button>
                );
              })}
            </div>

            {scr === "ans" && (
              <>
                <div style={{ animation: "sU .4s ease-out", background: "rgba(0,255,136,.03)", border: "1px solid rgba(0,255,136,.12)", borderRadius: 10, padding: 16, marginBottom: 10 }}>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: "#bbb", marginBottom: 8 }}>{q.exp}</div>
                  <div style={{ fontSize: 11, color: "#FFD700", fontStyle: "italic", borderTop: "1px solid rgba(0,255,136,.08)", paddingTop: 8 }}>💡 {q.fun}</div>
                </div>
                <button onClick={next} style={{ width: "100%", background: "linear-gradient(135deg,#00ff88,#00cc6a)", color: "#0a0a1a", border: "none", padding: "12px", fontSize: 14, fontWeight: 700, borderRadius: 8, cursor: "pointer", fontFamily: "'Courier New', monospace" }}>
                  {qi+1>=shuf.length?"SJÁ NIÐURSTÖÐUR →":"NÆSTA →"}
                </button>
              </>
            )}
          </div>
        )}

        {/* ══ RESULT ══ */}
        {scr === "result" && (
          <div style={{ animation: "sU .6s ease-out", textAlign: "center" }}>
            {pts >= shuf.length * 7 && <Confetti />}
            <Countdown />

            <div style={{ fontSize: 60, marginTop: 8, marginBottom: 2 }}>{grade().e}</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "monospace", color: "#00ff88", textShadow: "0 0 10px #00ff8844", marginBottom: 2 }}>{pl?.nm}</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px", fontFamily: "monospace", background: "linear-gradient(135deg,#FFD700,#FF6B35)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{grade().t}</h2>
            <p style={{ fontSize: 13, color: "#777", marginBottom: 20 }}>{grade().d}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              {[{l:"STIG",v:pts,c:"#FFD700"},{l:"RÉTT",v:`${ans.filter(a=>a.ok).length}/${shuf.length}`,c:"#00BFA5"},{l:"BESTA RÖÐ",v:`${bStr}🔥`,c:"#FF6B35"}].map((s,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,.025)",borderRadius:10,padding:"14px 6px",border:"1px solid rgba(255,255,255,.04)"}}>
                  <div style={{fontSize:22,fontWeight:700,color:s.c,fontFamily:"monospace"}}>{s.v}</div>
                  <div style={{fontSize:9,color:"#555",marginTop:1}}>{s.l}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 4, marginBottom: 16 }}>
              {ans.map((a,i) => (
                <div key={i} style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: a.ok?"rgba(0,191,165,.12)":"rgba(230,57,70,.12)", border: `2px solid ${a.ok?"#00BFA5":"#E63946"}`, color: a.ok?"#00E5C0":"#FF6B6B" }}>{a.ok?"✓":"✗"}</div>
              ))}
            </div>

            {my && pts >= my.hi && pts > 0 && <div style={{ background: "rgba(255,215,0,.06)", border: "1px solid rgba(255,215,0,.2)", borderRadius: 8, padding: 10, marginBottom: 12, fontFamily: "monospace", fontSize: 13, color: "#FFD700" }}>🎉 NÝTT PERSÓNULEGT MET!</div>}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={start} style={{ background: "linear-gradient(135deg,#00ff88,#00cc6a)", color: "#0a0a1a", border: "none", padding: "13px", fontSize: 15, fontWeight: 700, borderRadius: 8, cursor: "pointer", fontFamily: "monospace", letterSpacing: 2, animation: "glow 2s infinite" }}>🕹️ SPILA AFTUR</button>
              <button onClick={() => setScr("board")} style={{ background: "rgba(255,215,0,.06)", color: "#FFD700", border: "1px solid rgba(255,215,0,.2)", padding: "10px", fontSize: 13, borderRadius: 8, cursor: "pointer", fontFamily: "monospace" }}>🏆 STIGATAFLA</button>
              <button onClick={() => setScr("menu")} style={{ background: "none", color: "#444", border: "none", padding: "6px", fontSize: 11, cursor: "pointer", fontFamily: "monospace" }}>← AÐALVALMYND</button>
            </div>

            <p style={{ fontSize: 9, color: "#2a2a2a", marginTop: 16, fontStyle: "italic" }}>Bók Lífsins • 400+ sögur • 1976–2026 • v50.0</p>
          </div>
        )}
      </div>
    </div>
  );
}
