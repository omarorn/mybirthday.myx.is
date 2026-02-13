export interface QuizQuestion {
  id: number;
  yr: number;
  cat: string;
  q: string;
  hint?: string;
  opts: string[];
  ans: number;
  exp: string;
  fun: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    "id": 1,
    "yr": 1976,
    "cat": "🐣 Fæðing",
    "q": "Hverju líkti pabbi litla Ómar nýfæddum við?",
    "hint": "Pabbi var sjómaður á togara. Hann sá heiminn í gegnum sjómannasjónarhornið — allt var mælt í afla og fisktegundum.",
    "opts": [
      "Meðalstóran þorsk",
      "Litla hvalreki",
      "Stóran lúðu",
      "Nýfæddan sel"
    ],
    "ans": 0,
    "exp": "Pabbi var sjómaður: \"Þetta er meðalstór þorskur!\" — 5 kíló, 54 cm.",
    "fun": "Fæddist með sogklukku — hasarhetja frá fyrsta degi."
  },
  {
    "id": 2,
    "yr": 1976,
    "cat": "🍼 Barnæska",
    "q": "Hvað fékk Ómar í stað snuðs?",
    "hint": "Á Íslandi á 7. áratugnum var barnafæða allt öðruvísi. Engin Hipp-grautar, engir snuðar — bara það sem sjávarútvegurinn gaf.",
    "opts": [
      "Þurrkaðan harðfisk",
      "Soðinn fisk",
      "Lýsi á skeið",
      "Brauðsneið"
    ],
    "ans": 1,
    "exp": "Enginn pacifier — bara soðinn fiskur og lýsi. Orkubolti með Omega-3!",
    "fun": "v1.0 — lifði fæðinguna og byrjaði strax að grafa upp bug reports."
  },
  {
    "id": 3,
    "yr": 1976,
    "cat": "🔧 v1.0",
    "q": "Hvernig lýsti Ómar sjálfum sér nýfæddur í tæknimáli?",
    "hint": "Bók Lífsins notar tölvumál sem myndlíkingu — hvert ár er version, hvert atvik er patch. Fæðingin er fyrsta uppsetningin.",
    "opts": [
      "Fyrsta beta-prófun",
      "Stórt update á stýrikerfi lífsins",
      "Debug mode frá fæðingu",
      "System crash og reboot"
    ],
    "ans": 1,
    "exp": "\"Mættur í heiminn eins og stórt update á stýrikerfi lífsins.\"",
    "fun": "Hvert ár er ný útgáfa, hvert atvik er patch eða update."
  },
  {
    "id": 4,
    "yr": 1981,
    "cat": "🥣 Leikskólinn",
    "q": "Hvað var Ómar neyddur til að borða í leikskólanum?",
    "hint": "Þetta var á árunum þegar leikskólar á Íslandi höfðu strangar reglur um matartíma. Enginn komst upp — diskurinn varð að tæmast.",
    "opts": [
      "Grænmetissúpu",
      "Bragðlausan hafragraut",
      "Lýsi á morgnana",
      "Harðsoðin egg"
    ],
    "ans": 1,
    "exp": "Allir þurftu að klára hafragrautinn — sitja þar til diskurinn tæmdist!",
    "fun": "Fyrsti árekstur við þvingun. Hjá pabba lærði hann að elska mat."
  },
  {
    "id": 5,
    "yr": 1982,
    "cat": "🕷️ Soffía frænka",
    "q": "Hvaða hættuverkefni fékk Soffía frænka litla Ómar?",
    "hint": "Soffía er yngsta systir mömmu Ómars. Hún hafði sérstaka aðferð til að gefa litlum dreng sjálfstraust — gefa honum \"karlmannsverkefni\" í húsinu.",
    "opts": [
      "Gæta systur sinni",
      "Taka köngulær úr sturtunni",
      "Fara einn í búð",
      "Keyra dráttarvél"
    ],
    "ans": 1,
    "exp": "\"Þú ert karlmaðurinn á heimilinu — taka köngulærnar úr sturtunni.\"",
    "fun": "Soffía kenndi honum að maður getur búið til sínar reglur."
  },
  {
    "id": 6,
    "yr": 1982,
    "cat": "💻 Sinclair",
    "q": "Stebbi gaf Ómari eitthvað sem breytti öllu. Hvað?",
    "hint": "Stebbi var kærasti mömmu, tónlistarmaður í einum vinsælasta hljómsveit Íslands. Hann sá einsemd drengsins og fann tæknilega lausn.",
    "opts": [
      "Sinclair Spectrum tölvu",
      "Ensku kennslubók",
      "Trommubúnað",
      "Atari leikjatölvu"
    ],
    "ans": 0,
    "exp": "Stebbi, trommari í Stuðmönnum, bjargaði honum frá einsemd með Sinclair Spectrum.",
    "fun": "\"Stebbi gaf mér fyrstu línuna í kóðann sem varð ég sjálfur.\""
  },
  {
    "id": 7,
    "yr": 1983,
    "cat": "👦 Atli",
    "q": "Hvernig kallaði Ómar á barnavin sinn Atla?",
    "hint": "Á 9. áratugnum voru engin farsími eða tölvupóstar. Börn í blokkum á Keflavíkurflugvelli höfðu sínar leiðir til að ná í vini.",
    "opts": [
      "Sendi SMS",
      "Hringdi í síma",
      "Kallaði fyrir aftan blokkina",
      "Sendi bréf"
    ],
    "ans": 2,
    "exp": "Engir símar — maður bara birtist! Kallaði fyrir aftan blokkina.",
    "fun": "\"Ef Ómar kom, þá var öllum öðrum vinum hent út.\""
  },
  {
    "id": 8,
    "yr": 1990,
    "cat": "📺 Keflavíkursveit",
    "q": "Hvaða kvikmyndahetja var fyrirmynd Ómars sem enginn jafnaldri þekkti?",
    "hint": "Bandaríski herinn á Keflavíkurflugvelli leiddi ensk sjónvarpsútsendingar. Ómar hafði aðgang að kanalsjónvarpi sem aðrir íslenskir krakkar höfðu ekki.",
    "opts": [
      "James Bond",
      "Indiana Jones",
      "Rambo",
      "MacGyver"
    ],
    "ans": 1,
    "exp": "Indiana Jones á vídeóspólu! Kanalsjónvarpið streymdi inn enskri menningu.",
    "fun": "Alltaf öðruvísi, alltaf utan við normið."
  },
  {
    "id": 9,
    "yr": 1990,
    "cat": "⚓ Sjórinn",
    "q": "Hvað sá Ómar þegar hann fór 9 ára á sjó með pabba?",
    "hint": "Sjómenn á togara á 10. áratugnum höfðu sína eigin afþreyingarmenningu. Vídeósjónarar voru staðalbúnaður á sjó — og enginn lét sig varða hvort krakkar voru viðstaddir.",
    "opts": [
      "Fallegasta sólsetur",
      "Hluti sem barn á ekki að sjá",
      "Risa stóran fisk",
      "Norðurljós"
    ],
    "ans": 1,
    "exp": "Vídeóspólur, B-myndir og efni langt umfram aldur hans. Enginn vernduði hann.",
    "fun": "Í heimi fullorðinna karla lærði hann snemma að aðlagast."
  },
  {
    "id": 10,
    "yr": 1992,
    "cat": "🚗 Fiat Uno",
    "q": "Hvaðan fékk 16 ára Ómar númeraplötur á Fiat Uno?",
    "hint": "Bílinn var keyptur á 15.000 kr en var ekki skoðaður og hafði engar plötur. Í næstunni stóð gamall bíll sem enginn eignaðist — afturbúturinn sneri að vegg.",
    "opts": [
      "Úr ruslatunnu",
      "Af gömlum Buick í bílageymslu",
      "Frá lögreglumanni",
      "Smíðaði sjálfur"
    ],
    "ans": 1,
    "exp": "Grár Buick frá 50-áratugnum. \"Lánaði\" plötuna og skrifaði númer á pappaspjald!",
    "fun": "Afturendi Buicksins var klestur upp við vegg — enginn tók eftir neinu."
  },
  {
    "id": 11,
    "yr": 1992,
    "cat": "🚔 Lögreglan",
    "q": "Þegar lögreglan stöðvaði Ómar, hvað gerði hann?",
    "hint": "Ómar var 16 ára en þurfti að vera 17 til að mega keyra. Þegar lögreglan stöðvaði hann þurfti hann fluga lausn — og hún fólst í einni tölu.",
    "opts": [
      "Sagðist vera sendiráðsmaður",
      "Gaf ranga kennitölu (75 í stað 76)",
      "Þóttist vera sofandi",
      "Sagði bíllinn tilheyrði pabba"
    ],
    "ans": 1,
    "exp": "Sagðist fæddur 1975! Lögreglan: \"Farðu heim og drífðu þig.\"",
    "fun": "Vinirnir þóttust vera áfengisdauðir á baksætinu."
  },
  {
    "id": 12,
    "yr": 1992,
    "cat": "🚗 Fiat Uno",
    "q": "Hvað gerðu þeir þegar dekkið sprakk í Keflavík?",
    "hint": "Engin vegaþjónusta, enginn peningur — en fullt af Fiat Uno bílum á svæðinu með ólæst skott. Neyðin kennir naktri konu að spinna.",
    "opts": [
      "Hringdu í Vegaþjónustuna",
      "Gengu heim",
      "Stálu varadekkjum úr ólæstum bílum",
      "Skutluðu á 3 dekkjum"
    ],
    "ans": 2,
    "exp": "Fundu bíla með ólæstu skotti — tóku varadekkið plús eitt aukalega!",
    "fun": "Ökunnarinn: \"Þú hefur klárlega keyrt áður.\" Ómar: \"Já... í sveitinni.\""
  },
  {
    "id": 13,
    "yr": 1992,
    "cat": "🚔 Fiat Uno",
    "q": "Hversu mörg brot hafði Ómar framið þegar lögreglan stoppaði hann?",
    "hint": "Hugsaðu um allt sem þarf til að keyra löglega: ökuskírteini, skoðun, plötur, rétt persónuupplýsingar... Fiat-kvöldið hafði ekkert af þessu.",
    "opts": [
      "Eitt",
      "Tvö",
      "Þrjú til fjögur",
      "Fimm"
    ],
    "ans": 2,
    "exp": "Enginn ökuskírteini, engin skoðun, rangar plötur, röng kennitala!",
    "fun": "Bjargaði sér vegna þess að ekki voru tölvukerfi í bílum lögreglu."
  },
  {
    "id": 14,
    "yr": 1999,
    "cat": "📞 Tölvun",
    "q": "Hvernig fékk Ómar fyrstu vinnuna í tölvubransanum?",
    "hint": "Ómar var á sjónum í 8 ár en hafði alltaf haft ástríðu fyrir tölvum frá Sinclair-tímanum. Einn daginn hringdi einhver sem breytti öllu.",
    "opts": [
      "Sótti um 50 störf",
      "Símtal: \"Viltu kíkja í spjall?\"",
      "Vann keppni",
      "Frændi fékk honum starf"
    ],
    "ans": 1,
    "exp": "Davíð í Tölvun hringdi og bauð í spjall. Eitt símtal — hætti á sjónum!",
    "fun": "Toy Story Claw mynstur — virkar best þegar hann er valinn."
  },
  {
    "id": 15,
    "yr": 1999,
    "cat": "📚 MCSE",
    "q": "Hversu mörg MCSE-próf tók Ómar á 8 vikum?",
    "hint": "MCSE (Microsoft Certified Systems Engineer) krefst margra prófa. Flestir taka mánuði eða ár. Ómar fór í ADHD-hyperfocus og las bækurnar á ensku.",
    "opts": [
      "3 próf",
      "4 próf",
      "6 próf",
      "8 próf"
    ],
    "ans": 2,
    "exp": "Sex próf á átta vikum! Á ensku. Féll tvisvar en gafst aldrei upp.",
    "fun": "ADHD hyperfocus sem career-launcher!"
  },
  {
    "id": 16,
    "yr": 2000,
    "cat": "💛 Vallý",
    "q": "Hvað gerðist þegar Vallý aflýsti Danmörku-ferð 2000?",
    "hint": "Vallý og Ómar áttu að fara til Danmerkur saman. Þegar ferðin féll niður urðu þau saman kvöldið — og náttúran tók síðan við.",
    "opts": [
      "Þau slitu samband",
      "Magnús var getinn",
      "Ómar fór einn",
      "Ekkert sérstakt"
    ],
    "ans": 1,
    "exp": "Vallý aflýsti ferðinni — og þetta kvöld var Magnús Örn getinn!",
    "fun": "Score 0.95 í vendipunktaskalanum — fátt hafði meiri áhrif."
  },
  {
    "id": 17,
    "yr": 2000,
    "cat": "👶 Magnús",
    "q": "Hvaða ráð sagði Magnús (sonur) sem varð ADHD-mantra?",
    "hint": "Magnús Örn, sonur Ómars, sagði þetta sem barn þegar pabbi hans átti erfitt með að einbeita sér. Þrjú orð sem urðu dagleg mantra.",
    "opts": [
      "\"Slökktu á tölvunni\"",
      "\"TAH: Task At Hand\"",
      "\"Þú ert nógu góður\"",
      "\"Hættu að pæla\""
    ],
    "ans": 1,
    "exp": "TAH: Task At Hand — aðeins eitt í einu. Frá eigin syni!",
    "fun": "Stundum kenna börnin okkur það sem engin kennari getur."
  },
  {
    "id": 18,
    "yr": 2001,
    "cat": "☀️ Kanarí",
    "q": "Hvað gerðu Ómar og pabbi hans á Kanaríeyjum?",
    "hint": "Eftir 3 ára þögn og fjarlægð fóru þeir feðgar saman í ferð. Þar gerðu þeir eitthvað skrítið og fyndið sem jólagjöf handa ömmu.",
    "opts": [
      "Fóru á hvalaskoðun",
      "Prentuðu mynd af ömmu á boli",
      "Fóru á fjallið",
      "Keyrðu á vespu"
    ],
    "ans": 1,
    "exp": "Prentuðu mynd af ömmu á boli fyrir jólin! Hlátur og vinátta.",
    "fun": "Fyrsta raunverulega sáttin eftir 3 ár af þögn."
  },
  {
    "id": 19,
    "yr": 2002,
    "cat": "🎉 Partý",
    "q": "Hvað sáu þeir fyrst á partýi hjá vinkonu Fjólu?",
    "hint": "Ómar og Tryggvi voru boðnir á partý hjá konu sem hét Fjóla Dís. Þegar þeir komu inn var skemmtunin þegar hafin — á óvanalegan hátt.",
    "opts": [
      "DJ með Stuðmenn",
      "Stelpur í fatapóker",
      "Veislu í garðinum",
      "Alla sofandi"
    ],
    "ans": 1,
    "exp": "Bringubúspartý! \"Er þetta besta partý sem við höfum nokkurn tímann verið boðið í!\"",
    "fun": "Upphafið að 20+ ára vináttu við Fjólu Dís."
  },
  {
    "id": 20,
    "yr": 2002,
    "cat": "👦 Atli",
    "q": "Hvernig endurheimuðu Ómar og Atli barnavináttu?",
    "hint": "Enginn Facebook á þessum tíma. Vallý átti prentaða bók sem innihélt nöfn og símanúmer framhaldsskólanema á Íslandi.",
    "opts": [
      "Facebook",
      "Fletti upp í Frammáli",
      "Mættust á götu",
      "Hittust á djammi"
    ],
    "ans": 1,
    "exp": "Vallý átti bók \"Frammál\" — Ómar fletti Atla upp og hringdi!",
    "fun": "Vináttan tók við — 40 ár síðan."
  },
  {
    "id": 21,
    "yr": 2002,
    "cat": "💰 Atli",
    "q": "\"Ég er með milljón!\" sagði Ómar stoltur. Hvað svaraði Atli?",
    "hint": "Atli var búinn að lesa Brian Tracy sjálfshjálparbækur og sparað af kappi. Ómar var stoltur af sinni fyrstu milljón — en Atli var komin lengra.",
    "opts": [
      "\"Vel gert!\"",
      "\"Já, ég er með þrjár.\"",
      "\"Ég er á leiðinni\"",
      "\"Skuldalaus er betri\""
    ],
    "ans": 1,
    "exp": "Atli las Brian Tracy og svaraði rólega: \"Já, ég er með þrjár.\"",
    "fun": "Atli sparaði. Ómar brenndi. Hann varð öruggur. Ómar varð óstöðugur."
  },
  {
    "id": 22,
    "yr": 2015,
    "cat": "🌅 Ewalina",
    "q": "Hvað gerðist þegar Ómar hitti Ewalinu?",
    "hint": "Eftir veikindi pabba og útflutningspartý hitti Ómar eina stelpu sem opnaði eitthvað nýtt í honum. Skyndilega breyttist allt — skynjun, bragð, hljóð.",
    "opts": [
      "Ekkert sérstakt",
      "Allt í nýju ljósi — tónlist og matur",
      "Hann varð reiður",
      "Fór til útlanda"
    ],
    "ans": 1,
    "exp": "\"Tónlist fór að hljóma betur, matur bragðaðist betur. Eins og ég hefði verið sofandi.\"",
    "fun": "Hugmyndirnar komu svo hratt að hann gat ekki skrifað nógu hratt."
  },
  {
    "id": 23,
    "yr": 2017,
    "cat": "🔄 omar4.0",
    "q": "Hvað kallaði Ómar verkefni sitt þegar hann byrjaði árlegar uppfærslur?",
    "hint": "Á 40 ára afmælinu ákváð Ómar að líkja lífi sínu við hugbúnað — hvert ár er stór uppfærsla. Hann gaf verkefninu nafn eftir sér og aldri.",
    "opts": [
      "Bók Lífsins",
      "omar4.0",
      "Project Rebirth",
      "Nýr Maður"
    ],
    "ans": 1,
    "exp": "omar4.0 — stór uppfærsla 19. júní 2017. Árlega héðan í frá!",
    "fun": "Mantran: \"Vera besta útgáfa af sjálfum mér.\""
  },
  {
    "id": 24,
    "yr": 2019,
    "cat": "💕 Preelley",
    "q": "Hvernig lýsti Ómar Þórey í brúðkaupseyðublaðinu?",
    "hint": "Í brúðkaupseyðublaðinu var spurning um hvað honum líkaði best við Þórey. Ómar svaraði heiðarlega — kannski of heiðarlega!",
    "opts": [
      "\"Gáfuð\"",
      "\"Opin, skemmtileg og flott brjóst\"",
      "\"Besti kokkurinn\"",
      "\"Skilur barnið í mér\""
    ],
    "ans": 1,
    "exp": "Heiðarlegt svar! \"...og hún virðist skilja mig oftar en aðrir.\"",
    "fun": "Bað henni \"eins og í 10 bekk\" — fyrst poke, svo date."
  },
  {
    "id": 25,
    "yr": 2020,
    "cat": "💊 ADHD",
    "q": "Hvað hélt Ómar þegar hann fékk ADHD-greiningu?",
    "hint": "Eftir áratuga sjálfslyfjameðferð fékk Ómar loksins greiningu. Hann var bjartsýnn — kannski of mikið, þegar kemur að lyfjum og væntingum.",
    "opts": [
      "Hann myndi lagast",
      "Hann yrði frægur",
      "Ekkert myndi breytast",
      "Hann fengi bifreið"
    ],
    "ans": 0,
    "exp": "\"Ég hélt ég væri loksins að fara að lagast. Það var hreint ekki svona.\"",
    "fun": "Strattera, Ritalín, Elvanse — hvert lyf með sína sögu."
  },
  {
    "id": 26,
    "yr": 2023,
    "cat": "🌿 Sjálfsskilningur",
    "q": "Hvenær breytist \"notkun\" í \"fíkn\" samkvæmt Ómari?",
    "hint": "Ómar skrifaði djúpa pælingu um muninn á notkun og fíkn. Lykilorðið er ekki magn, heldur hegðun og tilfinning sem fylgir notkuninni.",
    "opts": [
      "Á hverjum degi",
      "Þegar maður fer að fela og skammast sín",
      "Of mikill peningur",
      "Missir vinnuna"
    ],
    "ans": 1,
    "exp": "\"Þegar þú ferð að fela, þegar þú skammast þín — þá breytist notkunin í fíkn.\"",
    "fun": "Sjálfslyfjakenningin: allt leit að dopamíni."
  },
  {
    "id": 27,
    "yr": 2025,
    "cat": "🤒 Kuldinn",
    "q": "Hvernig lýsti Ómar veikindum nóvember 2025?",
    "hint": "Ómar lýsir líkamanum alltaf í tölvumáli. Þegar hann veiktist alvarlega í nóvember notaði hann HTTP-villukóða og boot-hugtök.",
    "opts": [
      "\"Bara flensa\"",
      "\"Líkaminn á flight mode\"",
      "\"Smá kvef\"",
      "\"Ekkert alvarlegt\""
    ],
    "ans": 1,
    "exp": "\"Líkaminn fór á flight mode.\" 401: Body Not Found.",
    "fun": "Singles Day 11.11 — líkaminn tók frí."
  },
  {
    "id": 28,
    "yr": 2025,
    "cat": "💑 Dóra",
    "q": "Hvað vakti Ómar við þegar hann lá hjá Dóru í Hrafnhólum?",
    "hint": "Ómar er með heyrnartæki sem hann hefur haft lengi. Þau gefa frá sér ákveðið hljóð þegar rafhlöðurnar eru að klárast.",
    "opts": [
      "Þvottavél",
      "Pípið í heyrnartækinu",
      "Vekjaraklukku",
      "Síma sem hringdi"
    ],
    "ans": 1,
    "exp": "Pípið í heyrnartækinu minnti á rafhlöðurnar. Svo leit hann yfir Reykjavík úr glugganum.",
    "fun": "Þau lágu í 90 cm rúmi — frænka Dóru fékk hjónaherbergið."
  },
  {
    "id": 29,
    "yr": 2026,
    "cat": "🎵 Low Battery",
    "q": "Hvað var fyrsta lagið sem Ómar samdi (janúar 2026)?",
    "hint": "Á nýársdag 2026 fann Ómar sig að skrifa — ekki kóða, heldur texta um opið sár. Titillinn tengist orkutapi og heyrnartækjum.",
    "opts": [
      "\"Bók Lífsins\"",
      "\"Low Battery\"",
      "\"v49.4\"",
      "\"Hingað en ekki lengra\""
    ],
    "ans": 1,
    "exp": "\"Low Battery\" — \"Ég gekk inn í árið með opið sár sem ég hélt væri tár...\"",
    "fun": "Ekki ætlað að verða lag — bara orð sem þurftu út."
  },
  {
    "id": 30,
    "yr": 2026,
    "cat": "🍺 Budapest",
    "q": "Hversu marga bjóra drukku þeir á 4 dögum í Budapest?",
    "hint": "Drengjaferð til Budapest febrúar 2026. Mikil ganga yfir brýr Dónár, metro í bláa þristinum, og talsvert af bjór á fjórum dögum.",
    "opts": [
      "20",
      "30",
      "40",
      "50"
    ],
    "ans": 2,
    "exp": "40 bjórar á fjórum dögum og 3000 km! Labbaði yfir allar brýr Dónár.",
    "fun": "Gleymdi alveg myndunum. \"Við bara þar.\""
  }
];
