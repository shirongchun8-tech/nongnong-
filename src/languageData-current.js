import { word1368English, word1368French, word1368Japanese, word1368Korean } from "./data/word1368Data-current.js?v=visual-status-study";

export const languageCatalog = [
  { id: "en", label: "英语", nativeLabel: "English", speechLang: "en-US" },
  { id: "ko", label: "韩语", nativeLabel: "한국어", speechLang: "ko-KR" },
  { id: "fr", label: "法语", nativeLabel: "Français", speechLang: "fr-FR" },
  { id: "ja", label: "日语", nativeLabel: "日本語", speechLang: "ja-JP" },
];

const frenchCourseVocabulary = [
  { term: "une habitation", chinese: "住宅；住处", pos: "名词", forms: ["une habitation", "habitation"], example: "Il y a quatre pièces dans l'habitation de mes parents." },
  { term: "un logement", chinese: "住房；住所", pos: "名词", forms: ["un logement", "logement"], example: "Quel logement avez-vous ?" },
  { term: "une maison", chinese: "房子", pos: "名词", forms: ["une maison", "maison"], example: "Je préfère vivre dans une maison calme." },
  { term: "un appartement", chinese: "公寓", pos: "名词", forms: ["un appartement", "appartement"], example: "J'habite dans un appartement." },
  { term: "un studio", chinese: "单间公寓", pos: "名词", forms: ["un studio", "studio"], example: "Je voudrais habiter dans un studio en centre-ville." },
  { term: "à côté de", chinese: "在……旁边", pos: "介词短语", forms: ["à côté de", "côté"], example: "À côté de mon habitation, il y a un café." },
  { term: "en face de", chinese: "在……对面", pos: "介词短语", forms: ["en face de", "face"], example: "La fenêtre est en face de mon bureau." },
  { term: "au-dessus de", chinese: "在……上方", pos: "介词短语", forms: ["au-dessus de", "dessus"], example: "La lampe est au-dessus de la table." },
  { term: "sous", chinese: "在……下面", pos: "介词", forms: ["sous"], example: "Le sac est sous le bureau." },
  { term: "loin de", chinese: "离……远", pos: "介词短语", forms: ["loin de", "loin"], example: "L'université est loin de mon habitation." },
  { term: "à droite de", chinese: "在……右边", pos: "介词短语", forms: ["à droite de", "droite"], example: "La chaise est à droite de la table." },
  { term: "à la campagne", chinese: "在乡下", pos: "地点短语", forms: ["à la campagne", "campagne"], example: "Préférez-vous vivre en ville ou à la campagne ?" },
  { term: "en centre-ville", chinese: "在市中心", pos: "地点短语", forms: ["en centre-ville", "centre-ville"], example: "Je veux habiter dans un appartement en centre-ville." },
  { term: "se déplacer", chinese: "出行；移动", pos: "代动词", forms: ["se déplacer", "me déplacer", "vous déplacer", "déplacer"], example: "J'aime me déplacer à pied pour aller au café." },
  { term: "prendre le métro", chinese: "坐地铁", pos: "动词短语", forms: ["prendre le métro", "prends le métro", "prenez le métro", "métro"], example: "Je prends souvent le métro parce que c'est rapide." },
  { term: "prendre le bus", chinese: "坐公交车", pos: "动词短语", forms: ["prendre le bus", "prends le bus", "bus"], example: "Je prends le bus quand il pleut." },
  { term: "prendre le train", chinese: "坐火车", pos: "动词短语", forms: ["prendre le train", "prends le train", "train"], example: "Je prends le train pour aller à Busan." },
  { term: "marcher", chinese: "步行", pos: "动词", forms: ["marcher", "marche", "marches"], example: "Je marche dix minutes jusqu'à la station." },
  { term: "monter dans le métro", chinese: "上地铁", pos: "动词短语", forms: ["monter dans le métro", "monte dans le métro", "métro"], example: "Je monte dans le métro à la station de l'université." },
  { term: "descendre du métro", chinese: "下地铁", pos: "动词短语", forms: ["descendre du métro", "descends du métro", "métro"], example: "Je descends du métro à la station suivante." },
  { term: "changer de ligne", chinese: "换线", pos: "动词短语", forms: ["changer de ligne", "change de ligne", "ligne"], example: "Je change de ligne à la station de Séoul." },
  { term: "sortir de la station", chinese: "出地铁站", pos: "动词短语", forms: ["sortir de la station", "sors de la station", "station"], example: "Je sors de la station et je marche cinq minutes." },
  { term: "voyager", chinese: "旅行", pos: "动词", forms: ["voyager", "voyage"], example: "Si je suis riche, je vais voyager partout dans le monde." },
  { term: "visiter", chinese: "参观；游览", pos: "动词", forms: ["visiter", "visite"], example: "Je vais visiter un lieu touristique." },
  { term: "s'amuser", chinese: "玩得开心", pos: "代动词", forms: ["s'amuser", "m'amuser", "amuser"], example: "Je vais m'amuser avec mes amis." },
  { term: "jouer", chinese: "玩", pos: "动词", forms: ["jouer", "joue"], example: "J'aime jouer avec mes amis." },
  { term: "un lieu touristique", chinese: "旅游景点", pos: "名词短语", forms: ["un lieu touristique", "lieu touristique", "lieu"], example: "Je veux visiter un lieu touristique." },
  { term: "rester à l'hôtel", chinese: "待在酒店", pos: "动词短语", forms: ["rester à l'hôtel", "reste à l'hôtel", "hôtel"], example: "Je vais rester à l'hôtel pendant le voyage." },
  { term: "jouer aux jeux vidéo", chinese: "玩电子游戏", pos: "动词短语", forms: ["jouer aux jeux vidéo", "jeux vidéo"], example: "J'aime jouer aux jeux vidéo le soir." },
  { term: "jouer au football", chinese: "踢足球", pos: "动词短语", forms: ["jouer au football", "football"], example: "J'aime jouer au football avec mes amis." },
  { term: "à l'extérieur", chinese: "在外面；户外", pos: "地点短语", forms: ["à l'extérieur", "extérieur"], example: "Je préfère jouer à l'extérieur." },
  { term: "avec mes amis", chinese: "和我的朋友们", pos: "短语", forms: ["avec mes amis", "amis"], example: "Ce soir, je vais voir mes amis." },
  { term: "indispensable", chinese: "必不可少的", pos: "形容词", forms: ["indispensable"], example: "Le popcorn est indispensable pour regarder un film." },
];

const frenchDialogues = [
  ["housing", "Quel logement avez-vous ?", "你住什么样的房子？", "J'habite dans un appartement. Il est petit mais pratique.", "我住在一个公寓里。它不大，但是很方便。"],
  ["housing", "Combien de pièces il y a dans l'habitation de vos parents ?", "你父母家有几个房间？", "Il y a quatre pièces dans l'habitation de mes parents.", "我父母家有四个房间。"],
  ["housing", "Quelle pièce préférez-vous chez vos parents ?", "在父母家你最喜欢哪个房间？", "Je préfère ma chambre parce qu'elle est calme.", "我更喜欢我的房间，因为很安静。"],
  ["housing", "Où est la fenêtre dans votre chambre ?", "你房间的窗户在哪里？", "La fenêtre est en face de mon bureau.", "窗户在我的书桌前面。"],
  ["housing", "Qu'est-ce qu'il y a à côté de votre habitation ?", "你住处旁边有什么？", "À côté de mon habitation, il y a un café et une station de métro.", "我住处旁边有一家咖啡馆和一个地铁站。"],
  ["housing", "Qu'est-ce qui est loin de votre habitation ?", "什么地方离你的住处远？", "L'université est loin de mon habitation.", "大学离我的住处很远。"],
  ["housing", "Préférez-vous vivre en ville ou à la campagne ?", "你更喜欢住在城市还是乡下？", "Je préfère vivre en ville parce que c'est pratique.", "我更喜欢住在城市，因为很方便。"],
  ["housing", "Où voulez-vous habiter dans le futur ?", "未来你想住在哪里？", "Dans le futur, je veux habiter à Séoul, dans un appartement en centre-ville.", "未来我想住在首尔市中心的公寓里。"],
  ["transport", "Quel transport prenez-vous souvent pour vous déplacer dans Séoul ?", "在首尔出行时你经常坐什么交通工具？", "Je prends souvent le métro parce que c'est rapide.", "我经常坐地铁，因为很快。"],
  ["transport", "Quel transport n'utilisez-vous jamais ?", "你从来不用什么交通工具？", "Je n'utilise jamais le taxi parce que c'est cher.", "我从来不坐出租车，因为太贵了。"],
  ["transport", "Vous aimez vous déplacer à pied pour aller où ?", "你喜欢步行去哪里？", "J'aime me déplacer à pied pour aller au café.", "我喜欢步行去咖啡馆。"],
  ["transport", "Aimez-vous venir dans le centre de Séoul le week-end ?", "你喜欢周末去首尔市中心吗？", "Non, parce qu'il y a trop de monde.", "不，因为人太多了。"],
  ["transport", "Ça prend combien de temps pour aller chez vos parents de l'université ?", "从大学到父母家要多久？", "Ça prend environ une heure.", "大约需要一个小时。"],
  ["transport", "De chez vous, ça prend combien de temps pour aller à la station de métro ?", "从你家到地铁站要多久？", "Ça prend dix minutes à pied.", "步行十分钟。"],
  ["transport", "Quelle ligne de métro utilisez-vous souvent ?", "你经常坐哪条地铁线？", "J'utilise souvent la ligne 2.", "我经常坐2号线。"],
  ["transport", "Dans quelle condition utilisez-vous le taxi ?", "什么情况下你会坐出租车？", "J'utilise le taxi quand je suis en retard ou quand je suis fatigué(e).", "我迟到或者累的时候会坐出租车。"],
  ["future", "Ce soir, allez-vous voir des amis ?", "今天晚上你会见朋友吗？", "Oui, ce soir, je vais voir mes amis.", "是的，今晚我要去见朋友。"],
  ["future", "Après les examens, qu'est-ce que vous allez faire ?", "考试之后你打算做什么？", "Après les examens, je vais me reposer et regarder un film.", "考试之后我要休息并看一部电影。"],
  ["future", "L'été, où allez-vous aller ?", "夏天你打算去哪里？", "L'été, je vais aller à Busan.", "夏天我要去釜山。"],
  ["future", "L'été, qu'est-ce que vous n'allez pas faire ?", "夏天你不打算做什么？", "L'été, je ne vais pas étudier beaucoup.", "夏天我不打算学习很多。"],
  ["future", "Si vous êtes riche, qu'est-ce que vous allez faire ?", "如果你很有钱，你打算做什么？", "Si je suis riche, je vais voyager partout dans le monde.", "如果我有钱，我会环游世界。"],
  ["future", "Après l'université, qu'est-ce que vous allez faire ?", "大学毕业后你打算做什么？", "Après l'université, je vais chercher un travail.", "大学毕业后我要找工作。"],
  ["future", "Dans le futur, allez-vous rester à Séoul ?", "未来你会留在首尔吗？", "Oui, parce que c'est pratique.", "会，因为很方便。"],
  ["past_experience", "Avez-vous bu un café ce matin ?", "今天早上你喝咖啡了吗？", "Oui, j'ai bu un café ce matin.", "是的，我今天早上喝了咖啡。"],
  ["past_experience", "Êtes-vous déjà allé(e) à l'étranger ?", "你已经去过国外吗？", "Oui, je suis déjà allé(e) au Japon.", "是的，我去过日本。"],
  ["past_experience", "Vous n'avez jamais fait quoi dans la vie ?", "你人生中从来没有做过什么？", "Je n'ai jamais fait de saut en parachute.", "我从来没有跳过伞。"],
];

const frenchDialogueCards = frenchDialogues.flatMap(([theme, frQuestion, cnQuestion, frAnswer, cnAnswer]) => [
  { term: frQuestion, chinese: cnQuestion, pos: `口语问句 · ${theme}`, forms: [frQuestion], example: frQuestion },
  { term: frAnswer, chinese: cnAnswer, pos: `口语回答 · ${theme}`, forms: [frAnswer], example: frAnswer },
]);

export const starterVocabulary = [
  {
    languageId: "en",
    words: [
      { term: "hello", chinese: "你好", pos: "问候语", reading: "/həˈloʊ/", forms: ["hello"], example: "Hello, nice to meet you." },
      { term: "thank you", chinese: "谢谢", pos: "短语", reading: "/ˈθæŋk juː/", forms: ["thank you", "thanks"], example: "Thank you for your help." },
      { term: "water", chinese: "水", pos: "名词", reading: "/ˈwɔːtər/", forms: ["water"], example: "I drink water every day." },
      { term: "food", chinese: "食物", pos: "名词", reading: "/fuːd/", forms: ["food"], example: "This food is good." },
      { term: "book", chinese: "书", pos: "名词", reading: "/bʊk/", forms: ["book", "books"], example: "I read a book." },
      { term: "school", chinese: "学校", pos: "名词", reading: "/skuːl/", forms: ["school"], example: "She goes to school." },
      { term: "home", chinese: "家", pos: "名词", reading: "/hoʊm/", forms: ["home"], example: "I am at home." },
      { term: "friend", chinese: "朋友", pos: "名词", reading: "/frend/", forms: ["friend", "friends"], example: "He is my friend." },
      { term: "today", chinese: "今天", pos: "副词", reading: "/təˈdeɪ/", forms: ["today"], example: "Today is Friday." },
      { term: "tomorrow", chinese: "明天", pos: "副词", reading: "/təˈmɑːroʊ/", forms: ["tomorrow"], example: "See you tomorrow." },
      { term: "go", chinese: "去", pos: "动词", reading: "/ɡoʊ/", forms: ["go", "goes", "went", "gone"], example: "I go to class." },
      { term: "eat", chinese: "吃", pos: "动词", reading: "/iːt/", forms: ["eat", "eats", "ate", "eaten"], example: "We eat lunch." },
      { term: "good", chinese: "好的；好", pos: "形容词", reading: "/ɡʊd/", forms: ["good"], example: "That is a good idea." },
      { term: "big", chinese: "大的", pos: "形容词", reading: "/bɪɡ/", forms: ["big", "bigger"], example: "This room is big." },
      { term: "small", chinese: "小的", pos: "形容词", reading: "/smɔːl/", forms: ["small", "smaller"], example: "The bag is small." },
      ...word1368English,
    ],
  },
  {
    languageId: "ko",
    words: [
      { term: "안녕하세요", chinese: "你好；您好", pos: "问候语", reading: "annyeonghaseyo", forms: ["안녕하세요", "안녕"], example: "안녕하세요, 만나서 반갑습니다." },
      { term: "감사합니다", chinese: "谢谢", pos: "问候语", reading: "gamsahamnida", forms: ["감사합니다", "고마워요"], example: "도와줘서 감사합니다." },
      { term: "물", chinese: "水", pos: "名词", reading: "mul", forms: ["물", "water"], example: "물을 마셔요." },
      { term: "음식", chinese: "食物", pos: "名词", reading: "eumsik", forms: ["음식", "food"], example: "한국 음식이 맛있어요." },
      { term: "책", chinese: "书", pos: "名词", reading: "chaek", forms: ["책", "book"], example: "책을 읽어요." },
      { term: "학교", chinese: "学校", pos: "名词", reading: "hakgyo", forms: ["학교", "school"], example: "학교에 가요." },
      { term: "집", chinese: "家", pos: "名词", reading: "jip", forms: ["집", "home"], example: "집에 있어요." },
      { term: "친구", chinese: "朋友", pos: "名词", reading: "chingu", forms: ["친구", "friend"], example: "친구를 만나요." },
      { term: "오늘", chinese: "今天", pos: "名词/副词", reading: "oneul", forms: ["오늘", "today"], example: "오늘 공부해요." },
      { term: "내일", chinese: "明天", pos: "名词/副词", reading: "naeil", forms: ["내일", "tomorrow"], example: "내일 만나요." },
      { term: "가다", chinese: "去", pos: "动词", reading: "gada", forms: ["가다", "가요", "갔어요"], example: "학교에 가요." },
      { term: "먹다", chinese: "吃", pos: "动词", reading: "meokda", forms: ["먹다", "먹어요", "먹었어요"], example: "밥을 먹어요." },
      { term: "좋다", chinese: "好", pos: "形容词", reading: "jota", forms: ["좋다", "좋아요"], example: "날씨가 좋아요." },
      { term: "크다", chinese: "大", pos: "形容词", reading: "keuda", forms: ["크다", "커요"], example: "방이 커요." },
      { term: "작다", chinese: "小", pos: "形容词", reading: "jakda", forms: ["작다", "작아요"], example: "가방이 작아요." },
      ...word1368Korean,
    ],
  },
  {
    languageId: "fr",
    words: [
      { term: "bonjour", chinese: "你好；早上好", pos: "问候语", reading: "/bɔ̃ʒuʁ/", forms: ["bonjour"], example: "Bonjour, ça va ?" },
      { term: "merci", chinese: "谢谢", pos: "感叹词", reading: "/mɛʁsi/", forms: ["merci"], example: "Merci beaucoup." },
      { term: "eau", chinese: "水", pos: "名词", reading: "/o/", forms: ["eau", "l'eau"], example: "Je bois de l'eau." },
      { term: "nourriture", chinese: "食物", pos: "名词", reading: "/nuʁityʁ/", forms: ["nourriture"], example: "La nourriture est bonne." },
      { term: "livre", chinese: "书", pos: "名词", reading: "/livʁ/", forms: ["livre", "livres"], example: "Je lis un livre." },
      { term: "école", chinese: "学校", pos: "名词", reading: "/ekɔl/", forms: ["école", "l'école"], example: "Je vais à l'école." },
      { term: "maison", chinese: "家；房子", pos: "名词", reading: "/mɛzɔ̃/", forms: ["maison"], example: "Je suis à la maison." },
      { term: "ami", chinese: "朋友", pos: "名词", reading: "/ami/", forms: ["ami", "amie", "amis", "amies"], example: "C'est mon ami." },
      { term: "aujourd'hui", chinese: "今天", pos: "副词", reading: "/oʒuʁdɥi/", forms: ["aujourd'hui"], example: "Aujourd'hui, je révise." },
      { term: "demain", chinese: "明天", pos: "副词", reading: "/dəmɛ̃/", forms: ["demain"], example: "À demain !" },
      { term: "aller", chinese: "去", pos: "动词", reading: "/ale/", forms: ["aller", "vais", "vas", "va", "allons", "allez", "vont"], example: "Je vais en cours." },
      { term: "manger", chinese: "吃", pos: "动词", reading: "/mɑ̃ʒe/", forms: ["manger", "mange", "manges", "mangeons"], example: "Je mange du pain." },
      { term: "bon", chinese: "好的；好吃的", pos: "形容词", reading: "/bɔ̃/", forms: ["bon", "bonne", "bons", "bonnes"], example: "C'est très bon." },
      { term: "grand", chinese: "大的；高的", pos: "形容词", reading: "/ɡʁɑ̃/", forms: ["grand", "grande", "grands", "grandes"], example: "La salle est grande." },
      { term: "petit", chinese: "小的", pos: "形容词", reading: "/pəti/", forms: ["petit", "petite", "petits", "petites"], example: "J'ai un petit sac." },
      ...frenchCourseVocabulary,
      ...frenchDialogueCards,
      ...word1368French,
    ],
  },
  {
    languageId: "ja",
    words: [
      { term: "こんにちは", chinese: "你好", pos: "问候语", reading: "konnichiwa", forms: ["こんにちは"], example: "こんにちは、元気ですか。" },
      { term: "ありがとう", chinese: "谢谢", pos: "问候语", reading: "arigatou", forms: ["ありがとう", "ありがとうございます"], example: "ありがとうございます。" },
      { term: "水", chinese: "水", pos: "名词", reading: "みず / mizu", forms: ["水", "みず", "water"], example: "水を飲みます。" },
      { term: "食べ物", chinese: "食物", pos: "名词", reading: "たべもの / tabemono", forms: ["食べ物", "たべもの", "food"], example: "日本の食べ物が好きです。" },
      { term: "本", chinese: "书", pos: "名词", reading: "ほん / hon", forms: ["本", "ほん", "book"], example: "本を読みます。" },
      { term: "学校", chinese: "学校", pos: "名词", reading: "がっこう / gakkou", forms: ["学校", "がっこう", "school"], example: "学校へ行きます。" },
      { term: "家", chinese: "家", pos: "名词", reading: "いえ / ie", forms: ["家", "いえ", "home"], example: "家にいます。" },
      { term: "友達", chinese: "朋友", pos: "名词", reading: "ともだち / tomodachi", forms: ["友達", "ともだち", "friend"], example: "友達に会います。" },
      { term: "今日", chinese: "今天", pos: "名词/副词", reading: "きょう / kyou", forms: ["今日", "きょう", "today"], example: "今日は勉強します。" },
      { term: "明日", chinese: "明天", pos: "名词/副词", reading: "あした / ashita", forms: ["明日", "あした", "tomorrow"], example: "明日会いましょう。" },
      { term: "行く", chinese: "去", pos: "动词", reading: "いく / iku", forms: ["行く", "行きます", "行った"], example: "学校へ行きます。" },
      { term: "食べる", chinese: "吃", pos: "动词", reading: "たべる / taberu", forms: ["食べる", "食べます", "食べた"], example: "ご飯を食べます。" },
      { term: "いい", chinese: "好的；好", pos: "形容词", reading: "ii", forms: ["いい", "良い"], example: "いい天気です。" },
      { term: "大きい", chinese: "大的", pos: "形容词", reading: "おおきい / ookii", forms: ["大きい", "おおきな"], example: "大きい部屋です。" },
      { term: "小さい", chinese: "小的", pos: "形容词", reading: "ちいさい / chiisai", forms: ["小さい", "小さな"], example: "小さいかばんです。" },
      ...word1368Japanese,
    ],
  },
];

const starterBaseTerms = {
  en: {
    hello: "hello",
    "thank you": "thank you",
    water: "water",
    food: "food",
    book: "book",
    school: "school",
    home: "home",
    friend: "friend",
    today: "today",
    tomorrow: "tomorrow",
    go: "go",
    eat: "eat",
    good: "good",
    big: "big",
    small: "small",
  },
  ko: {
    안녕하세요: "hello",
    감사합니다: "thank you",
    물: "water",
    음식: "food",
    책: "book",
    학교: "school",
    집: "home",
    친구: "friend",
    오늘: "today",
    내일: "tomorrow",
    가다: "go",
    먹다: "eat",
    좋다: "good",
    크다: "big",
    작다: "small",
  },
  fr: {
    bonjour: "hello",
    merci: "thank you",
    eau: "water",
    nourriture: "food",
    livre: "book",
    école: "school",
    maison: "home",
    ami: "friend",
    "aujourd'hui": "today",
    demain: "tomorrow",
    aller: "go",
    manger: "eat",
    bon: "good",
    grand: "big",
    petit: "small",
  },
  ja: {
    こんにちは: "hello",
    ありがとう: "thank you",
    水: "water",
    食べ物: "food",
    本: "book",
    学校: "school",
    家: "home",
    友達: "friend",
    今日: "today",
    明日: "tomorrow",
    行く: "go",
    食べる: "eat",
    いい: "good",
    大きい: "big",
    小さい: "small",
  },
};

for (const group of starterVocabulary) {
  const baseTerms = starterBaseTerms[group.languageId] || {};
  for (const word of group.words) {
    word.baseTerm ||= baseTerms[word.term];
  }
}

export function getLanguage(languageId) {
  return languageCatalog.find((language) => language.id === languageId) || languageCatalog[0];
}

export function getStarterWords(languageId) {
  const group = starterVocabulary.find((item) => item.languageId === languageId);
  return group?.words || [];
}

export function getVocabularyComparison(word) {
  const baseTerm = word?.baseTerm;
  if (!baseTerm) return null;
  const comparisonOrder = ["en", "fr", "ja", "ko"];
  return {
    baseTerm,
    items: comparisonOrder.map((languageId) => {
      const language = getLanguage(languageId);
      return {
        languageId: language.id,
        label: language.label,
        nativeLabel: language.nativeLabel,
        word: getStarterWords(language.id).find((item) => item.baseTerm === baseTerm) || null,
      };
    }),
  };
}
