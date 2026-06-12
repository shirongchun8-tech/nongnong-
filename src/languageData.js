export const languageCatalog = [
  { id: "en", label: "英语", nativeLabel: "English", speechLang: "en-US" },
  { id: "ko", label: "韩语", nativeLabel: "한국어", speechLang: "ko-KR" },
  { id: "fr", label: "法语", nativeLabel: "Français", speechLang: "fr-FR" },
  { id: "ja", label: "日语", nativeLabel: "日本語", speechLang: "ja-JP" },
];

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
    ],
  },
];

export function getLanguage(languageId) {
  return languageCatalog.find((language) => language.id === languageId) || languageCatalog[0];
}

export function getStarterWords(languageId) {
  const group = starterVocabulary.find((item) => item.languageId === languageId);
  return group?.words || [];
}
