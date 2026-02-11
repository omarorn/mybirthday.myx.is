import { useState, useEffect } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZÆÐÞÖÁÉÍÓÚÝ ".split("");
const BDAY = new Date("2026-06-19T00:00:00");

const allQuestions = [
  { id:1, yr:1976, cat:"🐣 Fæðing", q:"Hverju líkti pabbi litla Ómar nýfæddum við?",
    hint:"Pabbi var sjómaður á togara. Hann sá heiminn í gegnum sjómannasjónarhornið — allt var mælt í afla og fisktegundum.",
    opts:["Meðalstóran þorsk","Litla hvalreki","Stóran lúðu","Nýfæddan sel"], ans:0,
    exp:"Pabbi var sjómaður: \"Þetta er meðalstór þorskur!\" — 5 kíló, 54 cm.", fun:"Fæddist með sogklukku — hasarhetja frá fyrsta degi." },
  { id:2, yr:1976, cat:"🍼 Barnæska", q:"Hvað fékk Ómar í stað snuðs?",
    hint:"Á Íslandi á 7. áratugnum var barnafæða allt öðruvísi. Engin Hipp-grautar, engir snuðar — bara það sem sjávarútvegurinn gaf.",
    opts:["Þurrkaðan harðfisk","Soðinn fisk","Lýsi á skeið","Brauðsneið"], ans:1,
    exp:"Enginn pacifier — bara soðinn fiskur og lýsi. Orkubolti með Omega-3!", fun:"v1.0 — lifði fæðinguna og byrjaði strax að grafa upp bug reports." },
  { id:3, yr:1976, cat:"🔧 v1.0", q:"Hvernig lýsti Ómar sjálfum sér nýfæddur í tæknimáli?",
    hint:"Bók Lífsins notar tölvumál sem myndlíkingu — hvert ár er version, hvert atvik er patch. Fæðingin er fyrsta uppsetningin.",
    opts:["Fyrsta beta-prófun","Stórt update á stýrikerfi lífsins","Debug mode frá fæðingu","System crash og reboot"], ans:1,
    exp:"\"Mættur í heiminn eins og stórt update á stýrikerfi lífsins.\"", fun:"Hvert ár er ný útgáfa, hvert atvik er patch eða update." },
  { id:4, yr:1981, cat:"🥣 Leikskólinn", q:"Hvað var Ómar neyddur til að borða í leikskólanum?",
    hint:"Þetta var á árunum þegar leikskólar á Íslandi höfðu strangar reglur um matartíma. Enginn komst upp — diskurinn varð að tæmast.",
    opts:["Grænmetissúpu","Bragðlausan hafragraut","Lýsi á morgnana","Harðsoðin egg"], ans:1,
    exp:"Allir þurftu að klára hafragrautinn — sitja þar til diskurinn tæmdist!", fun:"Fyrsti árekstur við þvingun. Hjá pabba lærði hann að elska mat." },
  { id:5, yr:1982, cat:"🕷️ Soffía frænka", q:"Hvaða hættuverkefni fékk Soffía frænka litla Ómar?",
    hint:"Soffía er yngsta systir mömmu Ómars. Hún hafði sérstaka aðferð til að gefa litlum dreng sjálfstraust — gefa honum \"karlmannsverkefni\" í húsinu.",
    opts:["Gæta systur sinni","Taka köngulær úr sturtunni","Fara einn í búð","Keyra dráttarvél"], ans:1,
    exp:"\"Þú ert karlmaðurinn á heimilinu — taka köngulærnar úr sturtunni.\"", fun:"Soffía kenndi honum að maður getur búið til sínar reglur." },
  { id:6, yr:1982, cat:"💻 Sinclair", q:"Stebbi gaf Ómari eitthvað sem breytti öllu. Hvað?",
    hint:"Stebbi var kærasti mömmu, tónlistarmaður í einum vinsælasta hljómsveit Íslands. Hann sá einsemd drengsins og fann tæknilega lausn.",
    opts:["Sinclair Spectrum tölvu","Ensku kennslubók","Trommubúnað","Atari leikjatölvu"], ans:0,
    exp:"Stebbi, trommari í Stuðmönnum, bjargaði honum frá einsemd með Sinclair Spectrum.", fun:"\"Stebbi gaf mér fyrstu línuna í kóðann sem varð ég sjálfur.\"" },
  { id:7, yr:1983, cat:"👦 Atli", q:"Hvernig kallaði Ómar á barnavin sinn Atla?",
    hint:"Á 9. áratugnum voru engin farsími eða tölvupóstar. Börn í blokkum á Keflavíkurflugvelli höfðu sínar leiðir til að ná í vini.",
    opts:["Sendi SMS","Hringdi í síma","Kallaði fyrir aftan blokkina","Sendi bréf"], ans:2,
    exp:"Engir símar — maður bara birtist! Kallaði fyrir aftan blokkina.", fun:"\"Ef Ómar kom, þá var öllum öðrum vinum hent út.\"" },
  { id:8, yr:1990, cat:"📺 Keflavíkursveit", q:"Hvaða kvikmyndahetja var fyrirmynd Ómars sem enginn jafnaldri þekkti?",
    hint:"Bandaríski herinn á Keflavíkurflugvelli leiddi ensk sjónvarpsútsendingar. Ómar hafði aðgang að kanalsjónvarpi sem aðrir íslenskir krakkar höfðu ekki.",
    opts:["James Bond","Indiana Jones","Rambo","MacGyver"], ans:1,
    exp:"Indiana Jones á vídeóspólu! Kanalsjónvarpið streymdi inn enskri menningu.", fun:"Alltaf öðruvísi, alltaf utan við normið." },
  { id:9, yr:1990, cat:"⚓ Sjórinn", q:"Hvað sá Ómar þegar hann fór 9 ára á sjó með pabba?",
    hint:"Sjómenn á togara á 10. áratugnum höfðu sína eigin afþreyingarmenningu. Vídeósjónarar voru staðalbúnaður á sjó — og enginn lét sig varða hvort krakkar voru viðstaddir.",
    opts:["Fallegasta sólsetur","Hluti sem barn á ekki að sjá","Risa stóran fisk","Norðurljós"], ans:1,
    exp:"Vídeóspólur, B-myndir og efni langt umfram aldur hans. Enginn vernduði hann.", fun:"Í heimi fullorðinna karla lærði hann snemma að aðlagast." },
  { id:10, yr:1992, cat:"🚗 Fiat Uno", q:"Hvaðan fékk 16 ára Ómar númeraplötur á Fiat Uno?",
    hint:"Bílinn var keyptur á 15.000 kr en var ekki skoðaður og hafði engar plötur. Í næstunni stóð gamall bíll sem enginn eignaðist — afturbúturinn sneri að vegg.",
    opts:["Úr ruslatunnu","Af gömlum Buick í bílageymslu","Frá lögreglumanni","Smíðaði sjálfur"], ans:1,
    exp:"Grár Buick frá 50-áratugnum. \"Lánaði\" plötuna og skrifaði númer á pappaspjald!", fun:"Afturendi Buicksins var klestur upp við vegg — enginn tók eftir neinu." },
  { id:11, yr:1992, cat:"🚔 Lögreglan", q:"Þegar lögreglan stöðvaði Ómar, hvað gerði hann?",
    hint:"Ómar var 16 ára en þurfti að vera 17 til að mega keyra. Þegar lögreglan stöðvaði hann þurfti hann fluga lausn — og hún fólst í einni tölu.",
    opts:["Sagðist vera sendiráðsmaður","Gaf ranga kennitölu (75 í stað 76)","Þóttist vera sofandi","Sagði bíllinn tilheyrði pabba"], ans:1,
    exp:"Sagðist fæddur 1975! Lögreglan: \"Farðu heim og drífðu þig.\"", fun:"Vinirnir þóttust vera áfengisdauðir á baksætinu." },
  { id:12, yr:1992, cat:"🚗 Fiat Uno", q:"Hvað gerðu þeir þegar dekkið sprakk í Keflavík?",
    hint:"Engin vegaþjónusta, enginn peningur — en fullt af Fiat Uno bílum á svæðinu með ólæst skott. Neyðin kennir naktri konu að spinna.",
    opts:["Hringdu í Vegaþjónustuna","Gengu heim","Stálu varadekkjum úr ólæstum bílum","Skutluðu á 3 dekkjum"], ans:2,
    exp:"Fundu bíla með ólæstu skotti — tóku varadekkið plús eitt aukalega!", fun:"Ökunnarinn: \"Þú hefur klárlega keyrt áður.\" Ómar: \"Já... í sveitinni.\"" },
  { id:13, yr:1992, cat:"🚔 Fiat Uno", q:"Hversu mörg brot hafði Ómar framið þegar lögreglan stoppaði hann?",
    hint:"Hugsaðu um allt sem þarf til að keyra löglega: ökuskírteini, skoðun, plötur, rétt persónuupplýsingar... Fiat-kvöldið hafði ekkert af þessu.",
    opts:["Eitt","Tvö","Þrjú til fjögur","Fimm"], ans:2,
    exp:"Enginn ökuskírteini, engin skoðun, rangar plötur, röng kennitala!", fun:"Bjargaði sér vegna þess að ekki voru tölvukerfi í bílum lögreglu." },
  { id:14, yr:1999, cat:"📞 Tölvun", q:"Hvernig fékk Ómar fyrstu vinnuna í tölvubransanum?",
    hint:"Ómar var á sjónum í 8 ár en hafði alltaf haft ástríðu fyrir tölvum frá Sinclair-tímanum. Einn daginn hringdi einhver sem breytti öllu.",
    opts:["Sótti um 50 störf","Símtal: \"Viltu kíkja í spjall?\"","Vann keppni","Frændi fékk honum starf"], ans:1,
    exp:"Davíð í Tölvun hringdi og bauð í spjall. Eitt símtal — hætti á sjónum!", fun:"Toy Story Claw mynstur — virkar best þegar hann er valinn." },
  { id:15, yr:1999, cat:"📚 MCSE", q:"Hversu mörg MCSE-próf tók Ómar á 8 vikum?",
    hint:"MCSE (Microsoft Certified Systems Engineer) krefst margra prófa. Flestir taka mánuði eða ár. Ómar fór í ADHD-hyperfocus og las bækurnar á ensku.",
    opts:["3 próf","4 próf","6 próf","8 próf"], ans:2,
    exp:"Sex próf á átta vikum! Á ensku. Féll tvisvar en gafst aldrei upp.", fun:"ADHD hyperfocus sem career-launcher!" },
  { id:16, yr:2000, cat:"💛 Vallý", q:"Hvað gerðist þegar Vallý aflýsti Danmörku-ferð 2000?",
    hint:"Vallý og Ómar áttu að fara til Danmerkur saman. Þegar ferðin féll niður urðu þau saman kvöldið — og náttúran tók síðan við.",
    opts:["Þau slitu samband","Magnús var getinn","Ómar fór einn","Ekkert sérstakt"], ans:1,
    exp:"Vallý aflýsti ferðinni — og þetta kvöld var Magnús Örn getinn!", fun:"Score 0.95 í vendipunktaskalanum — fátt hafði meiri áhrif." },
  { id:17, yr:2000, cat:"👶 Magnús", q:"Hvaða ráð sagði Magnús (sonur) sem varð ADHD-mantra?",
    hint:"Magnús Örn, sonur Ómars, sagði þetta sem barn þegar pabbi hans átti erfitt með að einbeita sér. Þrjú orð sem urðu dagleg mantra.",
    opts:["\"Slökktu á tölvunni\"","\"TAH: Task At Hand\"","\"Þú ert nógu góður\"","\"Hættu að pæla\""], ans:1,
    exp:"TAH: Task At Hand — aðeins eitt í einu. Frá eigin syni!", fun:"Stundum kenna börnin okkur það sem engin kennari getur." },
  { id:18, yr:2001, cat:"☀️ Kanarí", q:"Hvað gerðu Ómar og pabbi hans á Kanaríeyjum?",
    hint:"Eftir 3 ára þögn og fjarlægð fóru þeir feðgar saman í ferð. Þar gerðu þeir eitthvað skrítið og fyndið sem jólagjöf handa ömmu.",
    opts:["Fóru á hvalaskoðun","Prentuðu mynd af ömmu á boli","Fóru á fjallið","Keyrðu á vespu"], ans:1,
    exp:"Prentuðu mynd af ömmu á boli fyrir jólin! Hlátur og vinátta.", fun:"Fyrsta raunverulega sáttin eftir 3 ár af þögn." },
  { id:19, yr:2002, cat:"🎉 Partý", q:"Hvað sáu þeir fyrst á partýi hjá vinkonu Fjólu?",
    hint:"Ómar og Tryggvi voru boðnir á partý hjá konu sem hét Fjóla Dís. Þegar þeir komu inn var skemmtunin þegar hafin — á óvanalegan hátt.",
    opts:["DJ með Stuðmenn","Stelpur í fatapóker","Veislu í garðinum","Alla sofandi"], ans:1,
    exp:"Bringubúspartý! \"Er þetta besta partý sem við höfum nokkurn tímann verið boðið í!\"", fun:"Upphafið að 20+ ára vináttu við Fjólu Dís." },
  { id:20, yr:2002, cat:"👦 Atli", q:"Hvernig endurheimuðu Ómar og Atli barnavináttu?",
    hint:"Enginn Facebook á þessum tíma. Vallý átti prentaða bók sem innihélt nöfn og símanúmer framhaldsskólanema á Íslandi.",
    opts:["Facebook","Fletti upp í Frammáli","Mættust á götu","Hittust á djammi"], ans:1,
    exp:"Vallý átti bók \"Frammál\" — Ómar fletti Atla upp og hringdi!", fun:"Vináttan tók við — 40 ár síðan." },
  { id:21, yr:2002, cat:"💰 Atli", q:"\"Ég er með milljón!\" sagði Ómar stoltur. Hvað svaraði Atli?",
    hint:"Atli var búinn að lesa Brian Tracy sjálfshjálparbækur og sparað af kappi. Ómar var stoltur af sinni fyrstu milljón — en Atli var komin lengra.",
    opts:["\"Vel gert!\"","\"Já, ég er með þrjár.\"","\"Ég er á leiðinni\"","\"Skuldalaus er betri\""], ans:1,
    exp:"Atli las Brian Tracy og svaraði rólega: \"Já, ég er með þrjár.\"", fun:"Atli sparaði. Ómar brenndi. Hann varð öruggur. Ómar varð óstöðugur." },
  { id:22, yr:2015, cat:"🌅 Ewalina", q:"Hvað gerðist þegar Ómar hitti Ewalinu?",
    hint:"Eftir veikindi pabba og útflutningspartý hitti Ómar eina stelpu sem opnaði eitthvað nýtt í honum. Skyndilega breyttist allt — skynjun, bragð, hljóð.",
    opts:["Ekkert sérstakt","Allt í nýju ljósi — tónlist og matur","Hann varð reiður","Fór til útlanda"], ans:1,
    exp:"\"Tónlist fór að hljóma betur, matur bragðaðist betur. Eins og ég hefði verið sofandi.\"", fun:"Hugmyndirnar komu svo hratt að hann gat ekki skrifað nógu hratt." },
  { id:23, yr:2017, cat:"🔄 omar4.0", q:"Hvað kallaði Ómar verkefni sitt þegar hann byrjaði árlegar uppfærslur?",
    hint:"Á 40 ára afmælinu ákváð Ómar að líkja lífi sínu við hugbúnað — hvert ár er stór uppfærsla. Hann gaf verkefninu nafn eftir sér og aldri.",
    opts:["Bók Lífsins","omar4.0","Project Rebirth","Nýr Maður"], ans:1,
    exp:"omar4.0 — stór uppfærsla 19. júní 2017. Árlega héðan í frá!", fun:"Mantran: \"Vera besta útgáfa af sjálfum mér.\"" },
  { id:24, yr:2019, cat:"💕 Preelley", q:"Hvernig lýsti Ómar Þórey í brúðkaupseyðublaðinu?",
    hint:"Í brúðkaupseyðublaðinu var spurning um hvað honum líkaði best við Þórey. Ómar svaraði heiðarlega — kannski of heiðarlega!",
    opts:["\"Gáfuð\"","\"Opin, skemmtileg og flott brjóst\"","\"Besti kokkurinn\"","\"Skilur barnið í mér\""], ans:1,
    exp:"Heiðarlegt svar! \"...og hún virðist skilja mig oftar en aðrir.\"", fun:"Bað henni \"eins og í 10 bekk\" — fyrst poke, svo date." },
  { id:25, yr:2020, cat:"💊 ADHD", q:"Hvað hélt Ómar þegar hann fékk ADHD-greiningu?",
    hint:"Eftir áratuga sjálfslyfjameðferð fékk Ómar loksins greiningu. Hann var bjartsýnn — kannski of mikið, þegar kemur að lyfjum og væntingum.",
    opts:["Hann myndi lagast","Hann yrði frægur","Ekkert myndi breytast","Hann fengi bifreið"], ans:0,
    exp:"\"Ég hélt ég væri loksins að fara að lagast. Það var hreint ekki svona.\"", fun:"Strattera, Ritalín, Elvanse — hvert lyf með sína sögu." },
  { id:26, yr:2023, cat:"🌿 Sjálfsskilningur", q:"Hvenær breytist \"notkun\" í \"fíkn\" samkvæmt Ómari?",
    hint:"Ómar skrifaði djúpa pælingu um muninn á notkun og fíkn. Lykilorðið er ekki magn, heldur hegðun og tilfinning sem fylgir notkuninni.",
    opts:["Á hverjum degi","Þegar maður fer að fela og skammast sín","Of mikill peningur","Missir vinnuna"], ans:1,
    exp:"\"Þegar þú ferð að fela, þegar þú skammast þín — þá breytist notkunin í fíkn.\"", fun:"Sjálfslyfjakenningin: allt leit að dopamíni." },
  { id:27, yr:2025, cat:"🤒 Kuldinn", q:"Hvernig lýsti Ómar veikindum nóvember 2025?",
    hint:"Ómar lýsir líkamanum alltaf í tölvumáli. Þegar hann veiktist alvarlega í nóvember notaði hann HTTP-villukóða og boot-hugtök.",
    opts:["\"Bara flensa\"","\"Líkaminn á flight mode\"","\"Smá kvef\"","\"Ekkert alvarlegt\""], ans:1,
    exp:"\"Líkaminn fór á flight mode.\" 401: Body Not Found.", fun:"Singles Day 11.11 — líkaminn tók frí." },
  { id:28, yr:2025, cat:"💑 Dóra", q:"Hvað vakti Ómar við þegar hann lá hjá Dóru í Hrafnhólum?",
    hint:"Ómar er með heyrnartæki sem hann hefur haft lengi. Þau gefa frá sér ákveðið hljóð þegar rafhlöðurnar eru að klárast.",
    opts:["Þvottavél","Pípið í heyrnartækinu","Vekjaraklukku","Síma sem hringdi"], ans:1,
    exp:"Pípið í heyrnartækinu minnti á rafhlöðurnar. Svo leit hann yfir Reykjavík úr glugganum.", fun:"Þau lágu í 90 cm rúmi — frænka Dóru fékk hjónaherbergið." },
  { id:29, yr:2026, cat:"🎵 Low Battery", q:"Hvað var fyrsta lagið sem Ómar samdi (janúar 2026)?",
    hint:"Á nýársdag 2026 fann Ómar sig að skrifa — ekki kóða, heldur texta um opið sár. Titillinn tengist orkutapi og heyrnartækjum.",
    opts:["\"Bók Lífsins\"","\"Low Battery\"","\"v49.4\"","\"Hingað en ekki lengra\""], ans:1,
    exp:"\"Low Battery\" — \"Ég gekk inn í árið með opið sár sem ég hélt væri tár...\"", fun:"Ekki ætlað að verða lag — bara orð sem þurftu út." },
  { id:30, yr:2026, cat:"🍺 Budapest", q:"Hversu marga bjóra drukku þeir á 4 dögum í Budapest?",
    hint:"Drengjaferð til Budapest febrúar 2026. Mikil ganga yfir brýr Dónár, metro í bláa þristinum, og talsvert af bjór á fjórum dögum.",
    opts:["20","30","40","50"], ans:2,
    exp:"40 bjórar á fjórum dögum og 3000 km! Labbaði yfir allar brýr Dónár.", fun:"Gleymdi alveg myndunum. \"Við bara þar.\"" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const catColorMap = {
  "🐣":"#FF6B35","🍼":"#F7C948","🔧":"#7C4DFF","🥣":"#8BC34A","🕷":"#9C27B0",
  "💻":"#00BFA5","👦":"#457B9D","📺":"#2196F3","⚓":"#37474F","🚗":"#E63946",
  "🚔":"#E63946","📞":"#FF9800","📚":"#795548","💛":"#FFEB3B","👶":"#FF4081",
  "☀":"#FFD54F","🎉":"#E040FB","💰":"#4CAF50","🌅":"#FF7043","🔄":"#7C4DFF",
  "💕":"#FF4081","💊":"#66BB6A","🌿":"#43A047","🤒":"#78909C","💑":"#EC407A",
  "🎵":"#AB47BC","🍺":"#FF9800"
};

function getCatColor(cat) {
  if (!cat) return "#888";
  for (const [emoji, color] of Object.entries(catColorMap)) {
    if (cat.includes(emoji)) return color;
  }
  return "#888";
}

const css = `
  @keyframes floatUp{0%,100%{transform:translateY(0) scale(1);opacity:.3}50%{transform:translateY(-20px) scale(1.5);opacity:.8}}
  @keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
  @keyframes confettiFall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
  @keyframes pulseAnim{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
  @keyframes shakeAnim{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
  @keyframes glowAnim{0%,100%{box-shadow:0 0 15px rgba(0,255,136,.3)}50%{box-shadow:0 0 30px rgba(0,255,136,.5)}}
  @keyframes blinkAnim{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes hintReveal{from{opacity:0;max-height:0;padding:0 12px}to{opacity:1;max-height:200px;padding:10px 12px}}
`;

function Confetti() {
  const cols = ["#FF6B35","#F7C948","#E63946","#457B9D","#E040FB","#00BFA5","#FF4081","#7C4DFF","#FFD700"];
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:999}}>
      {Array.from({length:50}).map((_,i)=>(
        <div key={i} style={{position:"absolute",left:Math.random()*100+"%",top:"-10px",width:5+Math.random()*7+"px",height:5+Math.random()*7+"px",backgroundColor:cols[Math.floor(Math.random()*cols.length)],borderRadius:Math.random()>.5?"50%":"2px",animation:"confettiFall "+(2+Math.random()*3)+"s ease-in forwards",animationDelay:Math.random()*1.5+"s"}}/>
      ))}
    </div>
  );
}

function CountdownTimer() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(()=>setNow(new Date()),1000); return ()=>clearInterval(t); }, []);
  const diff = BDAY.getTime() - now.getTime();
  if (diff <= 0) return <div style={{textAlign:"center",padding:"12px 0"}}><div style={{fontSize:24,fontWeight:700,color:"#FFD700",fontFamily:"monospace",textShadow:"0 0 20px rgba(255,215,0,.4)"}}>{"🎂 TIL HAMINGJU MEÐ 50 ÁRA DAGINN! 🎂"}</div></div>;
  const d=Math.floor(diff/864e5),h=Math.floor((diff%864e5)/36e5),m=Math.floor((diff%36e5)/6e4),s=Math.floor((diff%6e4)/1e3);
  return (
    <div style={{textAlign:"center",marginBottom:16}}>
      <div style={{fontSize:10,letterSpacing:4,color:"#FFD700",textTransform:"uppercase",marginBottom:6,fontFamily:"monospace"}}>{"Niðurtalning að 50 ára afmæli Ómars"}</div>
      <div style={{display:"flex",justifyContent:"center",gap:6}}>
        {[{v:d,l:"DAGAR"},{v:h,l:"KLST"},{v:m,l:"MÍN"},{v:s,l:"SEK"}].map((u,i)=>(
          <div key={i} style={{background:"rgba(255,215,0,.06)",border:"1px solid rgba(255,215,0,.2)",borderRadius:8,padding:"8px 10px",minWidth:54}}>
            <div style={{fontSize:22,fontWeight:700,fontFamily:"'Courier New',monospace",color:"#FFD700",textShadow:"0 0 8px rgba(255,215,0,.25)",lineHeight:1}}>{String(u.v).padStart(2,"0")}</div>
            <div style={{fontSize:8,color:"#997A00",letterSpacing:1,marginTop:2}}>{u.l}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:9,color:"#554400",marginTop:6,fontFamily:"monospace"}}>{"19. júní 2026 \u2022 v50.0 🎉"}</div>
    </div>
  );
}

function NameEntry({onSubmit}) {
  const [ci,setCi]=useState([0,0,0]);
  const [slot,setSlot]=useState(0);
  const [phone,setPhone]=useState("");
  const [step,setStep]=useState("name");
  const [blink,setBlink]=useState(true);
  useEffect(()=>{const t=setInterval(()=>setBlink(b=>!b),500);return ()=>clearInterval(t);},[]);
  const scroll=(dir)=>{setCi(p=>{const n=[...p];n[slot]=(n[slot]+dir+CHARS.length)%CHARS.length;return n;});};
  const name3=ci.map(i=>CHARS[i]).join("");
  return (
    <div style={{animation:"slideUp .6s ease-out",textAlign:"center"}}>
      <CountdownTimer/>
      <div style={{fontSize:40,margin:"16px 0 4px"}}>{"🕹️"}</div>
      <div style={{fontSize:10,letterSpacing:5,color:"#00ff88",marginBottom:2,fontFamily:"monospace"}}>INSERT COIN</div>
      <h1 style={{fontSize:22,fontWeight:700,margin:"0 0 4px",fontFamily:"'Courier New',monospace",color:"#00ff88",textShadow:"0 0 10px rgba(0,255,136,.25)"}}>{"SLÁÐU INN NAFN"}</h1>
      <p style={{fontSize:11,color:"#555",marginBottom:20,fontFamily:"monospace"}}>{"3 STAFIR — EINS OG Í GÖMLU SPILASÖLUM"}</p>
      {step==="name"&&(
        <div>
          <div style={{display:"flex",justifyContent:"center",gap:14,marginBottom:20}}>
            {[0,1,2].map(s=>(
              <div key={s} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <button onClick={()=>{setSlot(s);setTimeout(()=>scroll(-1),10);}} style={{background:"none",border:"none",cursor:"pointer",padding:2,color:slot===s?"#00ff88":"#333",fontSize:18}}>{"▲"}</button>
                <div onClick={()=>setSlot(s)} style={{width:56,height:72,display:"flex",alignItems:"center",justifyContent:"center",fontSize:42,fontWeight:700,fontFamily:"'Courier New',monospace",color:slot===s?"#00ff88":"#FFD700",textShadow:slot===s?"0 0 15px #00ff88":"0 0 6px rgba(255,215,0,.25)",background:slot===s?"rgba(0,255,136,.06)":"rgba(255,255,255,.02)",border:slot===s?"2px solid #00ff88":"2px solid rgba(255,255,255,.08)",borderRadius:8,cursor:"pointer",opacity:slot===s&&blink?1:slot===s?.65:1}}>{CHARS[ci[s]]}</div>
                <button onClick={()=>{setSlot(s);setTimeout(()=>scroll(1),10);}} style={{background:"none",border:"none",cursor:"pointer",padding:2,color:slot===s?"#00ff88":"#333",fontSize:18}}>{"▼"}</button>
              </div>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:16}}>
            {[0,1,2].map(s=>(<div key={s} onClick={()=>setSlot(s)} style={{width:8,height:8,borderRadius:"50%",cursor:"pointer",background:slot===s?"#00ff88":"#333",boxShadow:slot===s?"0 0 6px #00ff88":"none"}}/>))}
          </div>
          <div style={{fontSize:13,color:"#777",marginBottom:20,fontFamily:"monospace"}}>{"PLAYER: "}<span style={{color:"#00ff88",fontSize:16,fontWeight:700}}>{name3}</span></div>
          <button onClick={()=>setStep("phone")} style={{background:"linear-gradient(135deg,#00ff88,#00cc6a)",color:"#0a0a1a",border:"none",padding:"12px 36px",fontSize:15,fontWeight:700,borderRadius:8,cursor:"pointer",fontFamily:"monospace",letterSpacing:2,boxShadow:"0 0 20px rgba(0,255,136,.25)"}}>{"ÁFRAM →"}</button>
        </div>
      )}
      {step==="phone"&&(
        <div>
          <div style={{fontSize:32,fontFamily:"monospace",color:"#FFD700",textShadow:"0 0 10px rgba(255,215,0,.25)",marginBottom:12,fontWeight:700}}>{name3}</div>
          <p style={{fontSize:11,color:"#555",marginBottom:12,fontFamily:"monospace"}}>{"SÍMANÚMER TIL AUÐKENNINGAR"}</p>
          <input type="tel" value={phone} onChange={e=>setPhone(e.target.value.replace(/[^\d-]/g,"").slice(0,11))} placeholder="000-0000" style={{background:"rgba(0,255,136,.05)",border:"2px solid #00ff88",borderRadius:8,padding:"12px 16px",fontSize:24,fontFamily:"monospace",color:"#00ff88",textAlign:"center",width:200,outline:"none",letterSpacing:3,marginBottom:20}} autoFocus/>
          <div style={{display:"flex",justifyContent:"center",gap:10}}>
            <button onClick={()=>setStep("name")} style={{background:"rgba(255,255,255,.05)",color:"#777",border:"1px solid #333",padding:"10px 20px",fontSize:13,borderRadius:8,cursor:"pointer",fontFamily:"monospace"}}>{"← TILBAKA"}</button>
            <button onClick={()=>{if(phone.length>=7)onSubmit(name3,phone);}} disabled={phone.length<7} style={{background:phone.length>=7?"linear-gradient(135deg,#00ff88,#00cc6a)":"#222",color:phone.length>=7?"#0a0a1a":"#555",border:"none",padding:"10px 28px",fontSize:15,fontWeight:700,borderRadius:8,cursor:phone.length>=7?"pointer":"default",fontFamily:"monospace",letterSpacing:2}}>{"BYRJA! 🕹️"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function LeaderboardView({scores,myPhone,onClose,onPlay}) {
  const [tab,setTab]=useState("high");
  const tabs=[{id:"high",label:"🏆 Hæst",col:"#FFD700"},{id:"plays",label:"🔁 Flest",col:"#00BFA5"},{id:"best1st",label:"✅ Best 1.",col:"#4CAF50"},{id:"worst1st",label:"💀 Verst 1.",col:"#E63946"}];
  const getList=()=>{const s=[...scores];if(tab==="high")return s.sort((a,b)=>b.highScore-a.highScore);if(tab==="plays")return s.sort((a,b)=>b.gamesPlayed-a.gamesPlayed);if(tab==="best1st")return s.sort((a,b)=>(b.bestFirst||0)-(a.bestFirst||0));if(tab==="worst1st")return s.sort((a,b)=>(b.worstFirst||0)-(a.worstFirst||0));return s;};
  const getVal=(s)=>{if(tab==="high")return s.highScore+" stig";if(tab==="plays")return s.gamesPlayed+"x spilað";if(tab==="best1st")return(s.bestFirst||0)+"/"+allQuestions.length+" rétt";if(tab==="worst1st")return(s.worstFirst||0)+"/"+allQuestions.length+" vitlaust";return"";};
  const list=getList();const medals=["🥇","🥈","🥉"];
  return (
    <div style={{animation:"slideUp .5s ease-out"}}>
      <CountdownTimer/>
      <div style={{textAlign:"center",marginBottom:16}}><div style={{fontSize:10,letterSpacing:4,color:"#FFD700",fontFamily:"monospace"}}>HALL OF FAME</div><h2 style={{fontSize:22,fontWeight:700,margin:0,fontFamily:"monospace",color:"#00ff88",textShadow:"0 0 8px rgba(0,255,136,.25)"}}>STIGATAFLA</h2></div>
      <div style={{display:"flex",gap:3,marginBottom:16,overflowX:"auto"}}>{tabs.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} style={{background:tab===t.id?"rgba(255,255,255,.08)":"rgba(255,255,255,.02)",border:tab===t.id?"1px solid "+t.col:"1px solid transparent",borderRadius:6,padding:"6px 10px",fontSize:11,fontFamily:"monospace",color:tab===t.id?t.col:"#555",cursor:"pointer",whiteSpace:"nowrap"}}>{t.label}</button>))}</div>
      {list.length===0?<div style={{textAlign:"center",padding:30,color:"#444",fontFamily:"monospace",fontSize:13}}>{"ENGINN ENNÞÁ — VERTU FYRSTUR!"}</div>:(
        <div style={{display:"flex",flexDirection:"column",gap:3,marginBottom:16}}>
          {list.slice(0,15).map((s,i)=>{const isMe=myPhone&&s.phone===myPhone;return(
            <div key={s.phone} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:7,background:isMe?"rgba(0,255,136,.07)":i<3?"rgba(255,215,0,.03)":"rgba(255,255,255,.015)",border:isMe?"1px solid rgba(0,255,136,.25)":"1px solid rgba(255,255,255,.04)",fontFamily:"monospace"}}>
              <span style={{fontSize:i<3?18:13,width:28,textAlign:"center",color:i<3?"#FFD700":"#444"}}>{i<3?medals[i]:(i+1)+"."}</span>
              <span style={{fontSize:18,fontWeight:700,letterSpacing:3,width:70,color:isMe?"#00ff88":i===0?"#FFD700":"#bbb"}}>{s.name}</span>
              <span style={{flex:1,textAlign:"right",fontSize:12,color:isMe?"#00ff88":"#888"}}>{getVal(s)}</span>
              {tab==="high"&&<span style={{fontSize:9,color:"#444",width:32,textAlign:"right"}}>{s.gamesPlayed}x</span>}
            </div>
          );})}
        </div>
      )}
      {list.length>0&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:16,fontFamily:"monospace",fontSize:10}}>{[{v:scores.length,l:"LEIKMENN",c:"#FFD700"},{v:scores.reduce((s,x)=>s+x.gamesPlayed,0),l:"LEIKIR",c:"#00BFA5"},{v:Math.max(...scores.map(s=>s.highScore),0),l:"MET",c:"#FF6B35"}].map((s,i)=>(<div key={i} style={{background:"rgba(255,255,255,.025)",borderRadius:8,padding:"10px 6px",textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color:s.c}}>{s.v}</div><div style={{color:"#555"}}>{s.l}</div></div>))}</div>}
      <div style={{display:"flex",gap:8}}>
        <button onClick={onPlay} style={{flex:1,background:"linear-gradient(135deg,#00ff88,#00cc6a)",color:"#0a0a1a",border:"none",padding:"12px",fontSize:14,fontWeight:700,borderRadius:8,cursor:"pointer",fontFamily:"monospace"}}>{"🕹️ SPILA"}</button>
        <button onClick={onClose} style={{background:"rgba(255,255,255,.05)",color:"#777",border:"1px solid #333",padding:"12px 16px",fontSize:13,borderRadius:8,cursor:"pointer",fontFamily:"monospace"}}>{"← LOKA"}</button>
      </div>
    </div>
  );
}

// ══════════ COMMENT BUBBLE ══════════
function CommentBubble({comment}) {
  return (
    <div style={{display:"flex",gap:8,alignItems:"flex-start",padding:"8px 0"}}>
      <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(0,255,136,.1)",border:"1px solid rgba(0,255,136,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#00ff88",flexShrink:0,fontFamily:"monospace"}}>{comment.name}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:12,color:"#bbb",lineHeight:1.5}}>{comment.text}</div>
        <div style={{fontSize:9,color:"#555",marginTop:2,fontFamily:"monospace"}}>{comment.date}</div>
      </div>
    </div>
  );
}

// ══════════ MAIN ══════════
export default function FiftyYearsQuiz() {
  const [screen,setScreen]=useState("loading");
  const [player,setPlayer]=useState(null);
  const [scores,setScores]=useState([]);
  const [gameQ,setGameQ]=useState([]);
  const [qi,setQi]=useState(0);
  const [pts,setPts]=useState(0);
  const [streak,setStreak]=useState(0);
  const [bStreak,setBStreak]=useState(0);
  const [sel,setSel]=useState(null);
  const [answers,setAnswers]=useState([]);
  const [showConf,setShowConf]=useState(false);
  const [shakeIdx,setShakeIdx]=useState(null);
  // hint + comment state
  const [hintUsed,setHintUsed]=useState({});
  const [hintShown,setHintShown]=useState(false);
  const [allComments,setAllComments]=useState({});
  const [commentText,setCommentText]=useState("");
  const [commentSent,setCommentSent]=useState(false);
  const [hintsUsedCount,setHintsUsedCount]=useState(0);

  useEffect(()=>{
    (async()=>{
      try{const r=await window.storage.get("omar50v3-scores",true);if(r&&r.value)setScores(JSON.parse(r.value));}catch(e){}
      try{const r=await window.storage.get("omar50v3-comments",true);if(r&&r.value)setAllComments(JSON.parse(r.value));}catch(e){}
      try{const r=await window.storage.get("omar50v3-player");if(r&&r.value){setPlayer(JSON.parse(r.value));setScreen("menu");return;}}catch(e){}
      setScreen("nameEntry");
    })();
  },[]);

  const saveScores=async(ns)=>{setScores(ns);try{await window.storage.set("omar50v3-scores",JSON.stringify(ns),true);}catch(e){}};
  const savePlayer=async(p)=>{setPlayer(p);try{await window.storage.set("omar50v3-player",JSON.stringify(p));}catch(e){}};
  const saveComments=async(nc)=>{setAllComments(nc);try{await window.storage.set("omar50v3-comments",JSON.stringify(nc),true);}catch(e){}};

  const handleNameSubmit=(name,phone)=>{
    const p={name,phone};savePlayer(p);
    const ex=scores.find(s=>s.phone===phone);
    if(!ex)saveScores([...scores,{name,phone,highScore:0,gamesPlayed:0,bestFirst:null,worstFirst:null,totalCorrect:0,totalQuestions:0}]);
    else if(ex.name!==name)saveScores(scores.map(s=>s.phone===phone?{...s,name}:s));
    setScreen("menu");
  };

  const startGame=()=>{
    setGameQ(shuffle(allQuestions));setQi(0);setPts(0);setStreak(0);setBStreak(0);setSel(null);setAnswers([]);
    setHintUsed({});setHintShown(false);setCommentText("");setCommentSent(false);setHintsUsedCount(0);
    setScreen("playing");
  };

  const useHint=()=>{
    if(hintUsed[qi])return;
    setPts(p=>Math.max(0,p-5));
    setHintUsed(h=>({...h,[qi]:true}));
    setHintShown(true);
    setHintsUsedCount(c=>c+1);
  };

  const handlePick=(idx)=>{
    if(sel!==null)return;
    setSel(idx);setHintShown(false);
    const q=gameQ[qi];const correct=idx===q.ans;
    if(correct){
      const ns=streak+1;setPts(p=>p+10*(ns>2?2:1));setStreak(ns);
      if(ns>bStreak)setBStreak(ns);
      if(ns>=3){setShowConf(true);setTimeout(()=>setShowConf(false),3000);}
    }else{setStreak(0);setShakeIdx(idx);setTimeout(()=>setShakeIdx(null),600);}
    setAnswers(a=>[...a,{id:q.id,correct}]);
    setCommentText("");setCommentSent(false);
    setTimeout(()=>setScreen("showAnswer"),700);
  };

  const submitComment=async()=>{
    if(!commentText.trim()||commentSent)return;
    const qId=gameQ[qi].id;
    const newComment={name:player.name,text:commentText.trim(),date:new Date().toLocaleDateString("is-IS"),phone:player.phone};
    const updated={...allComments};
    if(!updated[qId])updated[qId]=[];
    updated[qId]=[...updated[qId],newComment];
    await saveComments(updated);
    setCommentSent(true);setCommentText("");
  };

  const nextQuestion=()=>{
    if(qi+1>=gameQ.length){finishGame();}
    else{setQi(i=>i+1);setSel(null);setHintShown(false);setCommentText("");setCommentSent(false);setScreen("playing");}
  };

  const finishGame=async()=>{
    const cc=answers.filter(a=>a.correct).length;const wc=answers.filter(a=>!a.correct).length;
    const up=scores.map(s=>{if(s.phone!==player.phone)return s;const first=s.gamesPlayed===0;return{...s,name:player.name,highScore:Math.max(s.highScore,pts),gamesPlayed:s.gamesPlayed+1,bestFirst:first?cc:s.bestFirst,worstFirst:first?wc:s.worstFirst,totalCorrect:(s.totalCorrect||0)+cc,totalQuestions:(s.totalQuestions||0)+gameQ.length};});
    await saveScores(up);setScreen("result");
  };

  const changePlayer=()=>{setPlayer(null);try{window.storage.delete("omar50v3-player");}catch(e){}setScreen("nameEntry");};

  const q=gameQ[qi];
  const progress=gameQ.length>0?((qi+1)/gameQ.length)*100:0;
  const myStats=scores.find(s=>s.phone===player?.phone);
  const getGrade=()=>{const p=(pts/(gameQ.length*10))*100;if(p>=90)return{emoji:"🏆",title:"BÓK LÍFSINS MEISTARI!",desc:"Þú þekkir lífið mitt betur en ég sjálfur!"};if(p>=70)return{emoji:"⭐",title:"NÆSTUM PERFEKT!",desc:"Þú veist meira en flestir um þennan þorsk."};if(p>=50)return{emoji:"👍",title:"VEL GERT!",desc:"Góður grunnur — en meira að læra!"};return{emoji:"📖",title:"BYRJANDI",desc:"Tími til að lesa fleiri kafla!"};};

  const qComments=q?allComments[q.id]||[]:[];

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#050510 0%,#0a0a2e 40%,#080818 100%)",fontFamily:"'Georgia',serif",color:"#e8e4df",position:"relative",overflow:"hidden"}}>
      {showConf&&<Confetti/>}
      <style>{css}</style>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:50,background:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.03) 3px,rgba(0,0,0,.03) 4px)"}}/>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",opacity:.1}}>{Array.from({length:10}).map((_,i)=>(<div key={i} style={{position:"absolute",left:(10+i*9)+"%",top:(5+i*8)+"%",width:3,height:3,backgroundColor:"#00ff88",borderRadius:"50%",animation:"floatUp "+(4+i*.5)+"s ease-in-out infinite",animationDelay:i*.3+"s"}}/>))}</div>

      <div style={{maxWidth:620,margin:"0 auto",padding:"16px 14px",position:"relative",zIndex:1}}>

        {screen==="loading"&&<div style={{textAlign:"center",paddingTop:80}}><div style={{fontSize:20,fontFamily:"monospace",color:"#00ff88",animation:"blinkAnim 1s infinite"}}>LOADING...</div></div>}

        {screen==="nameEntry"&&<NameEntry onSubmit={handleNameSubmit}/>}

        {/* ═══ MENU ═══ */}
        {screen==="menu"&&player&&(
          <div style={{animation:"slideUp .5s ease-out",textAlign:"center"}}>
            <CountdownTimer/>
            <div style={{fontSize:10,letterSpacing:4,color:"#FFD700",fontFamily:"monospace",marginBottom:2}}>{"BÓK LÍFSINS"}</div>
            <h1 style={{fontSize:28,fontWeight:700,margin:"0 0 2px",fontFamily:"monospace",background:"linear-gradient(135deg,#FFD700,#FF6B35)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{"50 ÁR ÓMAR"}</h1>
            <p style={{fontSize:12,color:"#666",marginBottom:16,fontFamily:"monospace"}}>{"SPURNINGALEIKUR"}</p>
            <div style={{background:"rgba(0,255,136,.04)",border:"1px solid rgba(0,255,136,.15)",borderRadius:10,padding:"12px 16px",marginBottom:20,fontFamily:"monospace"}}>
              <div style={{fontSize:28,fontWeight:700,letterSpacing:5,color:"#00ff88",textShadow:"0 0 10px rgba(0,255,136,.25)"}}>{player.name}</div>
              {myStats&&myStats.gamesPlayed>0&&<div style={{display:"flex",justifyContent:"center",gap:14,marginTop:6,fontSize:11,color:"#777"}}><span>{"🏆 "+myStats.highScore}</span><span>{"🎮 "+myStats.gamesPlayed+"x"}</span><span>{"✅ "+Math.round(((myStats.totalCorrect||0)/Math.max(myStats.totalQuestions||1,1))*100)+"%"}</span></div>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:20}}>
              {[{i:"❓",v:"30",l:"Spurningar"},{i:"💡",v:"-5 pts",l:"Hint takki"},{i:"🏆",v:String(Math.max(...scores.map(s=>s.highScore),0)),l:"Met"}].map((s,i)=>(<div key={i} style={{background:"rgba(255,255,255,.025)",borderRadius:8,padding:"10px 6px",border:"1px solid rgba(255,255,255,.04)",textAlign:"center"}}><div style={{fontSize:18}}>{s.i}</div><div style={{fontSize:16,fontWeight:700,color:"#FFD700",fontFamily:"monospace"}}>{s.v}</div><div style={{fontSize:9,color:"#555"}}>{s.l}</div></div>))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <button onClick={startGame} style={{background:"linear-gradient(135deg,#00ff88,#00cc6a)",color:"#0a0a1a",border:"none",padding:"14px",fontSize:16,fontWeight:700,borderRadius:8,cursor:"pointer",fontFamily:"monospace",letterSpacing:2,animation:"glowAnim 2s infinite"}}>{"🕹️ BYRJA LEIK"}</button>
              <button onClick={()=>setScreen("leaderboard")} style={{background:"rgba(255,215,0,.07)",color:"#FFD700",border:"1px solid rgba(255,215,0,.25)",padding:"10px",fontSize:13,borderRadius:8,cursor:"pointer",fontFamily:"monospace"}}>{"🏆 STIGATAFLA"}</button>
              <button onClick={changePlayer} style={{background:"none",color:"#444",border:"none",padding:"6px",fontSize:11,cursor:"pointer",fontFamily:"monospace"}}>{"SKIPTA UM LEIKMANN"}</button>
            </div>
          </div>
        )}

        {screen==="leaderboard"&&<LeaderboardView scores={scores} myPhone={player?.phone} onClose={()=>setScreen("menu")} onPlay={startGame}/>}

        {/* ═══ PLAYING + ANSWER ═══ */}
        {(screen==="playing"||screen==="showAnswer")&&q&&(
          <div style={{animation:"slideUp .3s ease-out"}}>
            {/* Top bar */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontFamily:"monospace",fontSize:13,color:"#00ff88",fontWeight:700,letterSpacing:3}}>{player?.name}</span>
              <span style={{fontFamily:"monospace",fontSize:13,color:"#FFD700"}}>{pts+" PTS"}</span>
            </div>
            {/* Progress */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <div style={{flex:1,height:3,background:"rgba(255,255,255,.05)",borderRadius:2,overflow:"hidden"}}><div style={{width:progress+"%",height:"100%",background:"linear-gradient(90deg,#00ff88,#FFD700)",borderRadius:2,transition:"width .5s"}}/></div>
              <span style={{fontSize:11,color:"#444",fontFamily:"monospace"}}>{(qi+1)+"/"+gameQ.length}</span>
            </div>
            {/* Streak */}
            {streak>=2&&<div style={{textAlign:"center",marginBottom:8,fontSize:12,color:"#FF6B35",fontFamily:"monospace",animation:"pulseAnim 1s infinite"}}>{"🔥 "+streak+" Í RÖÐ!"+(streak>=3?" 2X STIG!":"")}</div>}
            {/* Category + Year */}
            <div style={{display:"flex",gap:5,marginBottom:10}}>
              <span style={{background:getCatColor(q.cat),color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:16,fontFamily:"monospace"}}>{q.cat}</span>
              <span style={{background:"rgba(255,255,255,.06)",color:"#777",fontSize:10,padding:"2px 8px",borderRadius:16,fontFamily:"monospace"}}>{q.yr}</span>
            </div>
            {/* Question */}
            <div style={{background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.06)",borderRadius:10,padding:16,marginBottom:8}}>
              <h2 style={{fontSize:17,fontWeight:400,lineHeight:1.5,margin:0,color:"#eee"}}>{q.q}</h2>
            </div>

            {/* ═══ HINT BUTTON + HINT ═══ */}
            {screen==="playing"&&!hintUsed[qi]&&sel===null&&(
              <button onClick={useHint} style={{display:"flex",alignItems:"center",gap:6,margin:"0 auto 10px",background:"rgba(255,215,0,.06)",border:"1px solid rgba(255,215,0,.2)",borderRadius:8,padding:"6px 14px",fontSize:12,color:"#FFD700",cursor:"pointer",fontFamily:"monospace",transition:"all .2s"}}
                onMouseOver={e=>{e.currentTarget.style.background="rgba(255,215,0,.12)";}}
                onMouseOut={e=>{e.currentTarget.style.background="rgba(255,215,0,.06)";}}
              >{"💡 HINT (-5 stig)"}</button>
            )}
            {hintUsed[qi]&&screen==="playing"&&(
              <div style={{animation:"hintReveal .4s ease-out",background:"rgba(255,215,0,.05)",border:"1px solid rgba(255,215,0,.15)",borderRadius:8,padding:"10px 12px",marginBottom:10,fontSize:13,lineHeight:1.5,color:"#c9b363",fontStyle:"italic"}}>
                {"💡 "}{q.hint}
              </div>
            )}
            {hintUsed[qi]&&screen==="playing"&&(
              <div style={{textAlign:"center",fontSize:10,color:"#665500",marginBottom:8,fontFamily:"monospace"}}>{"HINT NOTAÐ — 5 STIG DREGIN FRÁ"}</div>
            )}

            {/* Options */}
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
              {q.opts.map((opt,idx)=>{
                const isSel=sel===idx,isCorr=idx===q.ans,done=sel!==null,isShk=shakeIdx===idx;
                let bg="rgba(255,255,255,.025)",bd="1px solid rgba(255,255,255,.06)",cl="#ccc";
                if(done&&isCorr){bg="rgba(0,191,165,.1)";bd="2px solid #00BFA5";cl="#00E5C0";}
                else if(done&&isSel&&!isCorr){bg="rgba(230,57,70,.1)";bd="2px solid #E63946";cl="#FF6B6B";}
                return(
                  <button key={idx} onClick={()=>handlePick(idx)} disabled={done} style={{background:bg,border:bd,borderRadius:8,padding:"12px 14px",fontSize:14,fontFamily:"inherit",color:cl,cursor:done?"default":"pointer",textAlign:"left",transition:"all .2s",animation:isShk?"shakeAnim .5s":"none",display:"flex",alignItems:"center",gap:8}}
                    onMouseOver={e=>{if(!done){e.currentTarget.style.background="rgba(255,255,255,.05)";e.currentTarget.style.borderColor="rgba(0,255,136,.3)";}}}
                    onMouseOut={e=>{if(!done){e.currentTarget.style.background=bg;e.currentTarget.style.borderColor="rgba(255,255,255,.06)";}}}
                  >
                    <span style={{width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0,background:done&&isCorr?"#00BFA5":done&&isSel&&!isCorr?"#E63946":"rgba(255,255,255,.06)",color:done&&(isCorr||(isSel&&!isCorr))?"#fff":"#777"}}>{done&&isCorr?"✓":done&&isSel&&!isCorr?"✗":String.fromCharCode(65+idx)}</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* ═══ SHOW ANSWER + COMMENTS ═══ */}
            {screen==="showAnswer"&&(
              <div>
                {/* Explanation */}
                <div style={{animation:"slideUp .4s ease-out",background:"rgba(0,255,136,.03)",border:"1px solid rgba(0,255,136,.12)",borderRadius:10,padding:16,marginBottom:10}}>
                  <div style={{fontSize:13,lineHeight:1.6,color:"#bbb",marginBottom:8}}>{q.exp}</div>
                  <div style={{fontSize:11,color:"#FFD700",fontStyle:"italic",borderTop:"1px solid rgba(0,255,136,.08)",paddingTop:8}}>{"💡 "+q.fun}</div>
                </div>

                {/* Previous comments on this question */}
                {qComments.length>0&&(
                  <div style={{marginBottom:10}}>
                    <div style={{fontSize:10,color:"#666",fontFamily:"monospace",marginBottom:4,letterSpacing:1}}>{"💬 ATHUGASEMDIR LEIKMANNA ("}{qComments.length}{")"}</div>
                    <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.04)",borderRadius:8,padding:"4px 10px",maxHeight:120,overflowY:"auto"}}>
                      {qComments.slice(-5).map((c,i)=><CommentBubble key={i} comment={c}/>)}
                    </div>
                  </div>
                )}

                {/* Comment input */}
                {!commentSent?(
                  <div style={{marginBottom:12}}>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <input
                        type="text"
                        value={commentText}
                        onChange={e=>setCommentText(e.target.value.slice(0,200))}
                        placeholder="Skrifa athugasemd... (valfrjálst)"
                        style={{flex:1,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,padding:"10px 12px",fontSize:13,fontFamily:"inherit",color:"#ccc",outline:"none"}}
                        onKeyDown={e=>{if(e.key==="Enter"&&commentText.trim())submitComment();}}
                      />
                      {commentText.trim()&&(
                        <button onClick={submitComment} style={{background:"rgba(0,255,136,.1)",border:"1px solid rgba(0,255,136,.25)",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#00ff88",cursor:"pointer",fontFamily:"monospace",whiteSpace:"nowrap",transition:"all .2s"}}
                          onMouseOver={e=>{e.currentTarget.style.background="rgba(0,255,136,.2)";}}
                          onMouseOut={e=>{e.currentTarget.style.background="rgba(0,255,136,.1)";}}
                        >{"↩"}</button>
                      )}
                    </div>
                    <div style={{fontSize:9,color:"#444",marginTop:3,fontFamily:"monospace"}}>{commentText.length+"/200"}</div>
                  </div>
                ):(
                  <div style={{textAlign:"center",fontSize:12,color:"#00ff88",marginBottom:12,fontFamily:"monospace",padding:8}}>{"✅ Athugasemd vistuð!"}</div>
                )}

                {/* Next button */}
                <button onClick={nextQuestion} style={{width:"100%",background:"linear-gradient(135deg,#00ff88,#00cc6a)",color:"#0a0a1a",border:"none",padding:"12px",fontSize:14,fontWeight:700,borderRadius:8,cursor:"pointer",fontFamily:"monospace"}}>
                  {qi+1>=gameQ.length?"SJÁ NIÐURSTÖÐUR →":"NÆSTA →"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══ RESULT ═══ */}
        {screen==="result"&&(
          <div style={{animation:"slideUp .6s ease-out",textAlign:"center"}}>
            {pts>=gameQ.length*7&&<Confetti/>}
            <CountdownTimer/>
            <div style={{fontSize:60,marginTop:8,marginBottom:2}}>{getGrade().emoji}</div>
            <div style={{fontSize:28,fontWeight:700,fontFamily:"monospace",color:"#00ff88",textShadow:"0 0 10px rgba(0,255,136,.25)",marginBottom:2}}>{player?.name}</div>
            <h2 style={{fontSize:20,fontWeight:700,margin:"0 0 4px",fontFamily:"monospace",background:"linear-gradient(135deg,#FFD700,#FF6B35)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{getGrade().title}</h2>
            <p style={{fontSize:13,color:"#777",marginBottom:20}}>{getGrade().desc}</p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:16}}>
              {[
                {label:"STIG",val:String(pts),col:"#FFD700"},
                {label:"RÉTT",val:answers.filter(a=>a.correct).length+"/"+gameQ.length,col:"#00BFA5"},
                {label:"BESTA RÖÐ",val:bStreak+"🔥",col:"#FF6B35"},
                {label:"HINTS",val:String(hintsUsedCount)+"💡",col:"#AB47BC"},
              ].map((s,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,.025)",borderRadius:10,padding:"12px 4px",border:"1px solid rgba(255,255,255,.04)"}}>
                  <div style={{fontSize:18,fontWeight:700,color:s.col,fontFamily:"monospace"}}>{s.val}</div>
                  <div style={{fontSize:8,color:"#555",marginTop:1}}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:4,marginBottom:16}}>
              {answers.map((a,i)=>(<div key={i} style={{width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,background:a.correct?"rgba(0,191,165,.12)":"rgba(230,57,70,.12)",border:"2px solid "+(a.correct?"#00BFA5":"#E63946"),color:a.correct?"#00E5C0":"#FF6B6B"}}>{a.correct?"✓":"✗"}</div>))}
            </div>

            {myStats&&pts>=myStats.highScore&&pts>0&&<div style={{background:"rgba(255,215,0,.06)",border:"1px solid rgba(255,215,0,.2)",borderRadius:8,padding:10,marginBottom:12,fontFamily:"monospace",fontSize:13,color:"#FFD700"}}>{"🎉 NÝTT PERSÓNULEGT MET!"}</div>}

            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <button onClick={startGame} style={{background:"linear-gradient(135deg,#00ff88,#00cc6a)",color:"#0a0a1a",border:"none",padding:"13px",fontSize:15,fontWeight:700,borderRadius:8,cursor:"pointer",fontFamily:"monospace",letterSpacing:2,animation:"glowAnim 2s infinite"}}>{"🕹️ SPILA AFTUR"}</button>
              <button onClick={()=>setScreen("leaderboard")} style={{background:"rgba(255,215,0,.06)",color:"#FFD700",border:"1px solid rgba(255,215,0,.2)",padding:"10px",fontSize:13,borderRadius:8,cursor:"pointer",fontFamily:"monospace"}}>{"🏆 STIGATAFLA"}</button>
              <button onClick={()=>setScreen("menu")} style={{background:"none",color:"#444",border:"none",padding:"6px",fontSize:11,cursor:"pointer",fontFamily:"monospace"}}>{"← AÐALVALMYND"}</button>
            </div>
            <p style={{fontSize:9,color:"#2a2a2a",marginTop:16,fontStyle:"italic"}}>{"Bók Lífsins \u2022 400+ sögur \u2022 1976\u20132026 \u2022 v50.0"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
