import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.resolve(ROOT, "..", "0610", "Cours-RevisionFinale-Chinese-Review.md");
const COURSE_INDEX_SOURCE = path.resolve(ROOT, "..", "0610", "French-Course-20-Lessons-Study-Index.json");
const OUT = path.resolve(ROOT, "src", "data", "courseData.js");

const VOCAB_ENRICHMENT = new Map(
  [
    ["une habitation", "/yn abitasjɔ̃/", "⌂", "habitation 指住处，想象一个可以住进去的房子。"],
    ["un logement", "/œ̃ lɔʒmɑ̃/", "▣", "logement 是住房，像一格可以入住的空间。"],
    ["une maison", "/yn mɛzɔ̃/", "⌂", "想象一栋小房子，maison 就是家/房子。"],
    ["un appartement", "/œ̃n‿apaʁtəmɑ̃/", "▤", "appartement 像楼里的一间公寓。"],
    ["un studio", "/œ̃ stydjo/", "▢", "studio 是小单间，想象一个小方间。"],
    ["une pièce", "/yn pjɛs/", "□", "pièce 是房间，也可以像一块空间。"],
    ["une chambre", "/yn ʃɑ̃bʁ/", "◫", "chambre 是卧室，想象床所在的房间。"],
    ["une cuisine", "/yn kɥizin/", "▥", "cuisine 是厨房，发音里有 /kɥi/ 的滑音。"],
    ["une bibliothèque", "/yn biblijɔtɛk/", "▤", "bibliothèque 是图书馆，想象一排书架。"],
    ["une gare", "/yn gaʁ/", "▭", "gare 是火车站，/ʁ/ 是法语小舌音。"],
    ["un musée", "/œ̃ myze/", "▧", "musée 是博物馆，注意 u 是圆唇 /y/。"],
    ["à côté de", "/a kote də/", "↔", "côté 是旁边，想象两样东西靠在一起。"],
    ["en face de", "/ɑ̃ fas də/", "⇄", "face 是面对，表示在对面。"],
    ["au-dessus de", "/o dəsy də/", "↑", "dessus 是上面，想象箭头向上。"],
    ["sous", "/su/", "↓", "sous 是下面，想象箭头向下。"],
    ["loin de", "/lwɛ̃ də/", "↗", "loin 是远，发 /lwɛ̃/。"],
    ["à droite de", "/a dʁwat də/", "→", "droite 是右边，记右箭头。"],
    ["à la campagne", "/a la kɑ̃paɲ/", "▵", "campagne 是乡下，想象田野。"],
    ["en centre-ville", "/ɑ̃ sɑ̃tʁ vil/", "◎", "centre-ville 是市中心，想象城市中心点。"],
    ["se déplacer", "/sə deplase/", "⇢", "se déplacer 是移动/出行，想象人从 A 到 B。"],
    ["prendre le métro", "/pʁɑ̃dʁ lə metʁo/", "▱", "prendre le métro 是坐地铁，métro 重音在最后。"],
    ["prendre le bus", "/pʁɑ̃dʁ lə bys/", "▰", "bus 的 u 是圆唇 /y/，不要读成英语 bus。"],
    ["prendre le train", "/pʁɑ̃dʁ lə tʁɛ̃/", "▭", "train 结尾是鼻化音 /ɛ̃/。"],
    ["marcher", "/maʁʃe/", "⇥", "marcher 是走路，/ʃ/ 像 sh。"],
    ["aller", "/ale/", "→", "aller 是去，常用于 futur proche。"],
    ["venir", "/vəniʁ/", "←", "venir 是来，结尾 /ʁ/ 不要读英语 r。"],
    ["rouler", "/ʁule/", "○", "rouler 是滚动/行驶，想象车轮。"],
    ["voler", "/vɔle/", "△", "voler 是飞，想象向上飞。"],
    ["monter dans le métro", "/mɔ̃te dɑ̃ lə metʁo/", "↥", "monter 是上车，dans 表示进入里面。"],
    ["descendre du métro", "/desɑ̃dʁ dy metʁo/", "↧", "descendre 是下车，du = de + le。"],
    ["changer de ligne", "/ʃɑ̃ʒe də liɲ/", "⇆", "changer 是换，ligne 是线路。"],
    ["sortir de la station", "/sɔʁtiʁ də la stasjɔ̃/", "↱", "sortir 是出来，station 是车站。"],
    ["une ligne de métro", "/yn liɲ də metʁo/", "═", "ligne 是线，想象地铁线路。"],
    ["une station", "/yn stasjɔ̃/", "□", "station 是站，结尾是鼻化 /jɔ̃/。"],
    ["une destination", "/yn dɛstinasjɔ̃/", "◎", "destination 是目的地。"],
    ["le prochain arrêt", "/lə pʁɔʃɛ̃n‿aʁɛ/", "■", "prochain arrêt 是下一站。"],
    ["voyager", "/vwajaʒe/", "✈", "voyager 是旅行，/wa/ 开头。"],
    ["s'amuser", "/samyze/", "☆", "s'amuser 是玩得开心。"],
    ["une activité", "/yn aktivite/", "▣", "activité 是活动。"],
    ["un voyage", "/œ̃ vwajaʒ/", "✈", "voyage 是旅行，注意 /vwajaʒ/。"],
    ["des vacances", "/de vakɑ̃s/", "☼", "vacances 是假期。"],
  ].map(([french, ipa, visual, hint]) => [french, { ipa, visual, hint }]),
);

const IPA_HINTS = {
  "être": "/ɛtʁ/",
  "avoir": "/avwaʁ/",
  "aller": "/ale/",
  "faire": "/fɛʁ/",
  "vouloir": "/vulwaʁ/",
  "pouvoir": "/puvwaʁ/",
  "je": "/ʒə/",
  "tu": "/ty/",
  "il": "/il/",
  "elle": "/ɛl/",
  "nous": "/nu/",
  "vous": "/vu/",
  "ils": "/il/",
  "un": "/œ̃/",
  "une": "/yn/",
  "le": "/lə/",
  "la": "/la/",
  "les": "/le/",
  "de": "/də/",
  "des": "/de/",
  "du": "/dy/",
  "à": "/a/",
  "dans": "/dɑ̃/",
  "avec": "/avɛk/",
  "pour": "/puʁ/",
  "bonjour": "/bɔ̃ʒuʁ/",
  "café": "/kafe/",
  "maison": "/mɛzɔ̃/",
  "métro": "/metʁo/",
  "français": "/fʁɑ̃sɛ/",
  "étudiant": "/etydjɑ̃/",
  "professeur": "/pʁɔfɛsœʁ/",
  "téléphone": "/telefɔn/",
  "famille": "/famij/",
  "paris": "/paʁi/",
  "séoul": "/seul/",
};

function enrichVocabularyItem(item) {
  const enrichment = VOCAB_ENRICHMENT.get(item.french);
  if (enrichment) return { ...item, ...enrichment };
  return {
    ...item,
    ipa: "",
    visual: "◇",
    hint: `${item.french}：${item.chinese}`,
  };
}

function simpleIpaHint(word) {
  const normalized = normalizeWord(word);
  if (IPA_HINTS[normalized]) return IPA_HINTS[normalized];
  return `/${normalized
    .replace(/qu/g, "k")
    .replace(/ch/g, "ʃ")
    .replace(/ou/g, "u")
    .replace(/oi/g, "wa")
    .replace(/ai|ei|et|er|ez$/g, "e")
    .replace(/an|en/g, "ɑ̃")
    .replace(/on/g, "ɔ̃")
    .replace(/in|ain|ein/g, "ɛ̃")
    .replace(/ç/g, "s")
    .replace(/c([eéi])/g, "s$1")
    .replace(/c/g, "k")
    .replace(/r/g, "ʁ")}/`;
}

const BASE_LEXICON = {
  "à": ["à", "介词", "在；到；向"],
  "a": ["avoir", "动词", "有；已经"],
  "ai": ["avoir", "动词", "有；已经"],
  "aime": ["aimer", "动词", "喜欢"],
  "aimez": ["aimer", "动词", "喜欢"],
  "aller": ["aller", "动词", "去"],
  "allez": ["aller", "动词", "去"],
  "allons": ["aller", "动词", "去"],
  "amusant": ["amusant", "形容词", "有趣的"],
  "amuser": ["s'amuser", "动词", "玩得开心"],
  "appartement": ["appartement", "名词", "公寓"],
  "après": ["après", "介词", "在...之后"],
  "argent": ["argent", "名词", "钱"],
  "arrêt": ["arrêt", "名词", "站；停止"],
  "au": ["à", "介词", "在；到"],
  "aux": ["à", "介词", "在；到"],
  "avec": ["avec", "介词", "和；用"],
  "avez": ["avoir", "动词", "有；已经"],
  "avoir": ["avoir", "动词", "有"],
  "beau": ["beau", "形容词", "好的；美的"],
  "belle": ["beau", "形容词", "美丽的"],
  "bibliothèque": ["bibliothèque", "名词", "图书馆"],
  "bière": ["bière", "名词", "啤酒"],
  "bien": ["bien", "副词", "好；很"],
  "bois": ["boire", "动词", "喝"],
  "bonjour": ["bonjour", "感叹词", "你好"],
  "boulangerie": ["boulangerie", "名词", "面包店"],
  "bu": ["boire", "动词", "喝"],
  "bus": ["bus", "名词", "公交车"],
  "busan": ["Busan", "专有名词", "釜山"],
  "ça": ["ça", "代词", "这；那"],
  "café": ["café", "名词", "咖啡；咖啡馆"],
  "calme": ["calme", "形容词", "安静的"],
  "campagne": ["campagne", "名词", "乡下"],
  "car": ["car", "连词", "因为"],
  "ce": ["ce", "限定词", "这个"],
  "centre": ["centre", "名词", "中心"],
  "centre-ville": ["centre-ville", "名词", "市中心"],
  "c'est": ["être", "动词", "这是；是"],
  "cet": ["ce", "限定词", "这个"],
  "cette": ["ce", "限定词", "这个"],
  "chambre": ["chambre", "名词", "卧室"],
  "changer": ["changer", "动词", "换；改变"],
  "chat": ["chat", "名词", "猫"],
  "chez": ["chez", "介词", "在...家"],
  "cinéma": ["cinéma", "名词", "电影院"],
  "combien": ["combien", "疑问词", "多少"],
  "comme": ["comme", "连词", "像；因为"],
  "composé": ["composé", "形容词", "复合的"],
  "condition": ["condition", "名词", "条件"],
  "cours": ["cours", "名词", "课程"],
  "cuisine": ["cuisine", "名词", "厨房"],
  "dans": ["dans", "介词", "在...里面"],
  "de": ["de", "介词", "的；从"],
  "déjà": ["déjà", "副词", "已经"],
  "délicieuse": ["délicieux", "形容词", "好吃的"],
  "déplacer": ["se déplacer", "动词", "移动；出行"],
  "déplace": ["se déplacer", "动词", "移动；出行"],
  "déplacé": ["se déplacer", "动词", "移动；出行"],
  "des": ["de", "冠词", "一些；的"],
  "descendre": ["descendre", "动词", "下去；下车"],
  "destination": ["destination", "名词", "目的地"],
  "deux": ["deux", "数词", "二"],
  "dimanche": ["dimanche", "名词", "星期日"],
  "dix": ["dix", "数词", "十"],
  "donc": ["donc", "连词", "所以"],
  "droite": ["droite", "名词", "右边"],
  "du": ["de", "冠词", "的；从"],
  "e": ["e", "语法标记", "阴性/过去分词标记"],
  "elle": ["elle", "代词", "她"],
  "elles": ["elle", "代词", "她们"],
  "en": ["en", "介词/代词", "在；乘；其中"],
  "encore": ["encore", "副词", "还；再"],
  "entre": ["entrer", "动词", "进入"],
  "environ": ["environ", "副词", "大约"],
  "es": ["être", "动词", "是"],
  "est": ["être", "动词", "是"],
  "et": ["et", "连词", "和"],
  "été": ["été", "名词", "夏天"],
  "être": ["être", "动词", "是"],
  "étranger": ["étranger", "名词", "外国"],
  "étudié": ["étudier", "动词", "学习"],
  "étudier": ["étudier", "动词", "学习"],
  "fais": ["faire", "动词", "做"],
  "faire": ["faire", "动词", "做"],
  "fait": ["faire", "动词", "做"],
  "fatigué": ["fatigué", "形容词", "累的"],
  "fenêtre": ["fenêtre", "名词", "窗户"],
  "film": ["film", "名词", "电影"],
  "france": ["France", "专有名词", "法国"],
  "français": ["français", "名词/形容词", "法语；法国的"],
  "futur": ["futur", "名词/形容词", "未来；将来的"],
  "gare": ["gare", "名词", "火车站"],
  "gens": ["gens", "名词", "人们"],
  "grand": ["grand", "形容词", "大的"],
  "grande": ["grand", "形容词", "大的"],
  "habitation": ["habitation", "名词", "住宅；住处"],
  "habite": ["habiter", "动词", "居住"],
  "habiter": ["habiter", "动词", "居住"],
  "haut": ["haut", "形容词/副词", "高的；高地"],
  "hier": ["hier", "副词", "昨天"],
  "hôtel": ["hôtel", "名词", "酒店"],
  "il": ["il", "代词", "他；它"],
  "ils": ["il", "代词", "他们"],
  "indispensable": ["indispensable", "形容词", "必不可少的"],
  "infinitif": ["infinitif", "名词", "动词原形"],
  "j'": ["je", "代词", "我"],
  "jamais": ["jamais", "副词", "从不"],
  "je": ["je", "代词", "我"],
  "jeux": ["jeu", "名词", "游戏"],
  "jouer": ["jouer", "动词", "玩；踢"],
  "joues": ["jouer", "动词", "玩；踢"],
  "joué": ["jouer", "动词", "玩；踢"],
  "la": ["le", "冠词", "这个；那个"],
  "le": ["le", "冠词", "这个；那个"],
  "les": ["le", "冠词", "这些；那些"],
  "leur": ["leur", "限定词", "他们的"],
  "levé": ["se lever", "动词", "起床"],
  "ligne": ["ligne", "名词", "线路"],
  "livre": ["livre", "名词", "书"],
  "logement": ["logement", "名词", "住房"],
  "loin": ["loin", "副词", "远"],
  "louvre": ["Louvre", "专有名词", "卢浮宫"],
  "lui": ["lui", "代词", "他；她"],
  "ma": ["mon", "限定词", "我的"],
  "maison": ["maison", "名词", "房子"],
  "mais": ["mais", "连词", "但是"],
  "mal": ["mal", "副词/名词", "疼；不好"],
  "mangé": ["manger", "动词", "吃"],
  "manger": ["manger", "动词", "吃"],
  "marcher": ["marcher", "动词", "走路"],
  "matin": ["matin", "名词", "早晨"],
  "me": ["me", "代词", "我自己；给我"],
  "mer": ["mer", "名词", "海"],
  "mes": ["mon", "限定词", "我的"],
  "métro": ["métro", "名词", "地铁"],
  "midi": ["midi", "名词", "中午"],
  "minuit": ["minuit", "名词", "午夜"],
  "moi": ["moi", "代词", "我"],
  "mon": ["mon", "限定词", "我的"],
  "monde": ["monde", "名词", "人；世界"],
  "monter": ["monter", "动词", "上去；上车"],
  "musée": ["musée", "名词", "博物馆"],
  "n'": ["ne", "否定词", "不"],
  "ne": ["ne", "否定词", "不"],
  "non": ["non", "副词", "不"],
  "nous": ["nous", "代词", "我们"],
  "nouveau": ["nouveau", "形容词", "新的"],
  "où": ["où", "疑问词", "哪里"],
  "oiseaux": ["oiseau", "名词", "鸟"],
  "on": ["on", "代词", "人们；我们"],
  "ou": ["ou", "连词", "或者"],
  "oui": ["oui", "副词", "是"],
  "parents": ["parent", "名词", "父母"],
  "parce": ["parce que", "连词", "因为"],
  "parc": ["parc", "名词", "公园"],
  "paris": ["Paris", "专有名词", "巴黎"],
  "pas": ["pas", "否定词", "不"],
  "passé": ["passé", "名词/形容词", "过去"],
  "paul": ["Paul", "专有名词", "保罗"],
  "peut": ["pouvoir", "动词", "能够"],
  "peuvent": ["pouvoir", "动词", "能够"],
  "petit": ["petit", "形容词", "小的"],
  "peux": ["pouvoir", "动词", "能够"],
  "pied": ["pied", "名词", "脚；步行"],
  "pièce": ["pièce", "名词", "房间"],
  "plage": ["plage", "名词", "海滩"],
  "plusieurs": ["plusieurs", "限定词", "几个；多个"],
  "pour": ["pour", "介词", "为了；去"],
  "pouvoir": ["pouvoir", "动词", "能够"],
  "pratique": ["pratique", "形容词", "方便的"],
  "préférez": ["préférer", "动词", "更喜欢"],
  "préfère": ["préférer", "动词", "更喜欢"],
  "préférer": ["préférer", "动词", "更喜欢"],
  "prendre": ["prendre", "动词", "乘坐；拿"],
  "prends": ["prendre", "动词", "乘坐；拿"],
  "présent": ["présent", "名词", "现在时"],
  "présentez": ["présenter", "动词", "介绍"],
  "prochain": ["prochain", "形容词", "下一个"],
  "que": ["que", "疑问词/连词", "什么；那"],
  "quel": ["quel", "疑问词", "哪个；什么"],
  "quelle": ["quel", "疑问词", "哪个；什么"],
  "quand": ["quand", "连词/疑问词", "当；什么时候"],
  "qui": ["qui", "疑问词", "谁"],
  "qu'est-ce": ["qu'est-ce que", "疑问结构", "什么"],
  "rapidement": ["rapidement", "副词", "快速地"],
  "rapide": ["rapide", "形容词", "快的"],
  "récemment": ["récemment", "副词", "最近"],
  "rendez-vous": ["rendez-vous", "名词", "约会"],
  "rentrer": ["rentrer", "动词", "回去；回家"],
  "repas": ["repas", "名词", "饭"],
  "reposer": ["se reposer", "动词", "休息"],
  "réponse": ["réponse", "名词", "回答"],
  "resté": ["rester", "动词", "停留"],
  "rester": ["rester", "动词", "停留"],
  "restaurants": ["restaurant", "名词", "餐厅"],
  "réveilles": ["réveiller", "动词", "叫醒；醒来"],
  "rien": ["rien", "代词", "什么都没有"],
  "roule": ["rouler", "动词", "行驶；滚动"],
  "rouler": ["rouler", "动词", "行驶；滚动"],
  "sac": ["sac", "名词", "包"],
  "se": ["se", "代词", "自己"],
  "semaine": ["semaine", "名词", "星期"],
  "séoul": ["Séoul", "专有名词", "首尔"],
  "soir": ["soir", "名词", "晚上"],
  "sont": ["être", "动词", "是"],
  "sortir": ["sortir", "动词", "出去"],
  "sous": ["sous", "介词", "在下面"],
  "souvent": ["souvent", "副词", "经常"],
  "station": ["station", "名词", "车站"],
  "studio": ["studio", "名词", "单间公寓"],
  "suis": ["être", "动词", "是"],
  "sympa": ["sympa", "形容词", "友好的；不错的"],
  "table": ["table", "名词", "桌子"],
  "tard": ["tard", "副词", "晚"],
  "taxi": ["taxi", "名词", "出租车"],
  "te": ["te", "代词", "你自己；给你"],
  "temps": ["temps", "名词", "时间；天气"],
  "touristique": ["touristique", "形容词", "旅游的"],
  "toujours": ["toujours", "副词", "总是"],
  "tout": ["tout", "副词/限定词", "全部；很"],
  "train": ["train", "名词", "火车"],
  "transport": ["transport", "名词", "交通"],
  "transports": ["transport", "名词", "交通工具"],
  "travail": ["travail", "名词", "工作"],
  "très": ["très", "副词", "很"],
  "trop": ["trop", "副词", "太"],
  "tu": ["tu", "代词", "你"],
  "université": ["université", "名词", "大学"],
  "va": ["aller", "动词", "去"],
  "vacances": ["vacances", "名词", "假期"],
  "vais": ["aller", "动词", "去"],
  "vas": ["aller", "动词", "去"],
  "vélo": ["vélo", "名词", "自行车"],
  "venir": ["venir", "动词", "来"],
  "veux": ["vouloir", "动词", "想要"],
  "veut": ["vouloir", "动词", "想要"],
  "ville": ["ville", "名词", "城市"],
  "vis": ["vivre", "动词", "生活；居住"],
  "visite": ["visiter", "动词", "参观"],
  "visiter": ["visiter", "动词", "参观"],
  "vivre": ["vivre", "动词", "生活；居住"],
  "voir": ["voir", "动词", "看；见"],
  "voiture": ["voiture", "名词", "汽车"],
  "voler": ["voler", "动词", "飞"],
  "vont": ["aller", "动词", "去"],
  "vos": ["votre", "限定词", "你们的；您的"],
  "votre": ["votre", "限定词", "你们的；您的"],
  "voudrais": ["vouloir", "动词", "想要"],
  "voulez": ["vouloir", "动词", "想要"],
  "vous": ["vous", "代词", "你们；您"],
  "voyage": ["voyage", "名词", "旅行"],
  "voyager": ["voyager", "动词", "旅行"],
  "voyagez": ["voyager", "动词", "旅行"],
  "vu": ["voir", "动词", "看见"],
  "y": ["y", "代词", "那里"],
};

const TOKEN_RE = /[A-Za-zÀ-ÿ]+(?:[-'][A-Za-zÀ-ÿ]+)*'?/g;

function normalizeWord(word) {
  return word
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/^[^a-zà-ÿ]+|[^a-zà-ÿ'-]+$/gi, "");
}

export function tokenizeFrenchText(text) {
  const tokens = [];
  for (const raw of String(text || "").match(TOKEN_RE) || []) {
    const normalized = normalizeWord(raw);
    if (!normalized) continue;
    const elision = normalized.match(/^([cdjlmnstqu])'(.+)$/);
    if (elision) {
      tokens.push(`${elision[1]}'`, elision[2]);
      continue;
    }
    if (normalized.includes("-") && !BASE_LEXICON[normalized]) {
      tokens.push(...normalized.split("-").filter(Boolean));
      continue;
    }
    tokens.push(normalized);
  }
  return tokens;
}

function guessLemma(form) {
  if (BASE_LEXICON[form]) return BASE_LEXICON[form];
  if (form.endsWith("ez")) return [form.replace(/ez$/, "er"), "动词", `课程中出现的动词：${form}`];
  if (form.endsWith("ons")) return [form.replace(/ons$/, "er"), "动词", `课程中出现的动词：${form}`];
  if (form.endsWith("ent")) return [form.replace(/ent$/, "er"), "动词", `课程中出现的动词：${form}`];
  if (form.endsWith("es")) return [form.replace(/es$/, "e"), "名词/形容词", `课程中出现的词：${form}`];
  if (form.endsWith("s") && form.length > 3) return [form.slice(0, -1), "名词/形容词", `课程中出现的词：${form}`];
  return [form, "词汇", `课程中出现的词：${form}`];
}

export function lookupWord(form) {
  const normalized = normalizeWord(form);
  const [lemma, pos, chinese] = guessLemma(normalized);
  return {
    form: normalized,
    lemma,
    pos,
    chinese,
    key: lemma.toLowerCase(),
  };
}

function stripMd(text) {
  return text
    .replace(/!\[\[.+?\]\]/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function chapterId(title, index) {
  return `${index + 1}-${title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function splitTableRow(line) {
  let row = line.trim();
  if (row.startsWith("|")) row = row.slice(1);
  if (row.endsWith("|")) row = row.slice(0, -1);
  return row.split("|").map((cell) => stripMd(cell));
}

function isSeparator(line) {
  return splitTableRow(line).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function readTable(lines, start) {
  const rows = [];
  let i = start;
  while (i < lines.length && lines[i].trim().startsWith("|")) {
    if (!isSeparator(lines[i])) rows.push(splitTableRow(lines[i]));
    i += 1;
  }
  return { rows, next: i };
}

function ensureChapter(data, rawTitle) {
  const match = rawTitle.match(/^#\s+\d+\.\s+(.+)$/);
  if (!match) return null;
  const title = stripMd(match[1]);
  const chapter = {
    id: chapterId(title, data.chapters.length),
    title,
    vocabulary: [],
    exercises: [],
    oralQuestions: [],
    memorization: [],
    notes: [],
    wordBank: [],
    wordIndex: {},
  };
  data.chapters.push(chapter);
  return chapter;
}

function collectChapterTexts(chapter) {
  return [
    ...chapter.vocabulary.flatMap((item) => [item.french]),
    ...chapter.exercises.flatMap((item) => [item.prompt, item.answer]),
    ...chapter.oralQuestions.flatMap((item) => [item.question, item.example]),
    ...chapter.memorization.flatMap((item) => [item.french]),
    ...chapter.notes,
  ].filter(Boolean);
}

function buildWordBankForTexts(texts, fallbackWords = []) {
  const entries = new Map();

  function addForm(form, example = "") {
    const info = lookupWord(form);
    if (!info.form || info.form.length < 2) return;
    const current =
      entries.get(info.key) || {
        key: info.key,
        lemma: info.lemma,
        pos: info.pos,
        chinese: info.chinese,
        forms: [],
        frequency: 0,
        example: "",
      };
    current.frequency += 1;
    if (!current.forms.includes(info.form)) current.forms.push(info.form);
    if (!current.example && example) current.example = example;
    entries.set(info.key, current);
  }

  for (const text of texts) {
    const tokens = tokenizeFrenchText(text);
    tokens.forEach((token) => addForm(token, text));
  }

  for (const word of fallbackWords) {
    if (entries.size >= 50) break;
    addForm(word.lemma || word.form || word, word.example || "");
  }

  const wordBank = [...entries.values()]
    .sort((a, b) => b.frequency - a.frequency || a.lemma.localeCompare(b.lemma, "fr"))
    .slice(0, 100);

  const wordIndex = {};
  for (const word of wordBank) {
    wordIndex[word.lemma.toLowerCase()] = word.key;
    for (const form of word.forms) wordIndex[form] = word.key;
  }

  return { wordBank, wordIndex };
}

function attachWordBanks(data) {
  const globalTexts = data.chapters.flatMap(collectChapterTexts);
  const globalBank = buildWordBankForTexts(globalTexts).wordBank;
  for (const chapter of data.chapters) {
    const { wordBank, wordIndex } = buildWordBankForTexts(collectChapterTexts(chapter), globalBank);
    chapter.wordBank = wordBank;
    chapter.wordIndex = wordIndex;
  }
}

function addReviewCard(cards, card, seen) {
  if (!card.front || !card.back) return;
  const key = `${card.type}:${card.front}`;
  if (seen.has(key)) return;
  seen.add(key);
  cards.push(card);
}

function buildWordEntry(item) {
  const info = lookupWord(item.word);
  return {
    key: info.key,
    lemma: info.lemma,
    form: info.form,
    pos: info.pos,
    chinese: info.chinese,
    ipa: simpleIpaHint(info.lemma),
    forms: [info.form],
    frequency: item.frequency || 1,
    example: item.example || "",
  };
}

function mergeWordEntries(words) {
  const map = new Map();
  for (const word of words) {
    const current =
      map.get(word.key) || {
        ...word,
        forms: [],
        frequency: 0,
        sources: [],
      };
    current.frequency += word.frequency || 1;
    for (const form of word.forms || [word.form || word.lemma]) {
      if (form && !current.forms.includes(form)) current.forms.push(form);
    }
    if (word.source && !current.sources.includes(word.source)) current.sources.push(word.source);
    if (!current.example && word.example) current.example = word.example;
    map.set(word.key, current);
  }
  return [...map.values()].sort((a, b) => b.frequency - a.frequency || a.lemma.localeCompare(b.lemma, "fr"));
}

function sentenceChineseHint(sentence, wordLookup, source) {
  const hints = [];
  for (const token of tokenizeFrenchText(sentence)) {
    const info = lookupWord(token);
    const word = wordLookup.get(info.key);
    if (word && !hints.some((item) => item.key === word.key)) {
      hints.push({ key: word.key, text: `${word.lemma}=${word.chinese}` });
    }
    if (hints.length >= 6) break;
  }
  return hints.length ? `词义提示：${hints.map((item) => item.text).join("；")}。来源：${source}` : `来源：${source}`;
}

function buildGlobalSections(chapters) {
  const words = mergeWordEntries(
    chapters.flatMap((chapter) =>
      chapter.vocabulary.map((word) => ({
        ...word,
        source: chapter.title,
      })),
    ),
  );
  const wordLookup = new Map(words.map((word) => [word.key, word]));
  const grammarMap = new Map();
  for (const chapter of chapters) {
    for (const item of chapter.grammar || []) {
      if (!grammarMap.has(item)) {
        grammarMap.set(item, {
          id: `grammar-${grammarMap.size + 1}`,
          title: item,
          chinese: "课程语法点，请结合例句学习。",
          source: chapter.title,
        });
      }
    }
  }
  const sentenceMap = new Map();
  for (const chapter of chapters) {
    for (const sentence of chapter.sentences || []) {
      if (!sentenceMap.has(sentence)) {
        sentenceMap.set(sentence, {
          id: `sentence-${sentenceMap.size + 1}`,
          french: sentence,
          chinese: sentenceChineseHint(sentence, wordLookup, chapter.title),
          source: chapter.title,
        });
      }
    }
  }
  return {
    words,
    grammar: [...grammarMap.values()],
    sentences: [...sentenceMap.values()],
  };
}

function makeChapterFromCourse(course, index) {
  const vocabulary = (course.vocabulary || []).slice(0, 120).map(buildWordEntry);
  const wordIndex = {};
  for (const word of vocabulary) {
    wordIndex[word.key] = word.key;
    wordIndex[word.lemma.toLowerCase()] = word.key;
    for (const form of word.forms) wordIndex[form] = word.key;
  }
  return {
    id: `cours-${String(course.course).padStart(2, "0")}`,
    course: course.course,
    title: `Cours ${String(course.course).padStart(2, "0")} · ${course.topic}`,
    topic: course.topic,
    learningPath: ["单词", "短语", "句子", "对话/课文"],
    grammar: course.grammar || [],
    vocabulary,
    wordBank: vocabulary,
    wordIndex,
    phrases: course.phrases || [],
    sentences: course.sentences || [],
    dialogues: course.dialogues || [],
    exercises: [],
    oralQuestions: [],
    memorization: [],
    notes: [],
    sourceOrder: index + 1,
  };
}

export function buildCourseDataFromIndex(indexData) {
  const chapters = (indexData.courses || []).map(makeChapterFromCourse);
  const sections = buildGlobalSections(chapters);
  const data = {
    title: "Conversation française · 单词 / 语法 / 句子",
    sourceTitle: "French-Course-20-Lessons",
    missingCourses: indexData.missing || [],
    note: "Cours12 是复习课，内容并入前后课程。",
    sections,
    chapters,
    reviewCards: [],
  };
  const seenCards = new Set();

  for (const word of sections.words) {
      addReviewCard(
        data.reviewCards,
        {
          id: `word-${word.key}`,
          type: "vocabulary",
          front: word.lemma,
          back: word.chinese,
          pos: word.pos,
          ipa: word.ipa,
          forms: word.forms,
          example: word.example,
          wordKey: word.key,
          frequency: word.frequency,
          sources: word.sources,
        },
        seenCards,
      );
    }
  for (const grammar of sections.grammar) {
    addReviewCard(
      data.reviewCards,
      {
        id: grammar.id,
        type: "grammar",
        front: grammar.title,
        back: grammar.chinese,
        source: grammar.source,
      },
      seenCards,
    );
  }
  for (const sentence of sections.sentences) {
      addReviewCard(
        data.reviewCards,
        {
          id: sentence.id,
          type: "sentence",
          front: sentence.french,
          back: sentence.chinese,
          source: sentence.source,
        },
        seenCards,
      );
    }

  return data;
}

function parseTableIntoChapter(chapter, heading, rows) {
  if (!chapter || rows.length < 2) return;
  const header = rows[0].map((cell) => cell.toLowerCase());
  const body = rows.slice(1).filter((row) => row.some(Boolean));

  if (header.includes("français") && header.includes("中文")) {
    chapter.vocabulary.push(
      ...body.map((row) =>
        enrichVocabularyItem({
          french: row[0],
          chinese: row[1],
        }),
      ),
    );
    return;
  }

  if (header.includes("phrase") && header.includes("réponse")) {
    chapter.exercises.push(
      ...body.map((row) => ({
        prompt: row[1],
        answer: row[2],
        chinese: row[3],
        type: heading.includes("动词") ? "verb" : "fill",
      })),
    );
    return;
  }

  if (header.includes("question") && header.includes("exemple de réponse")) {
    chapter.oralQuestions.push(
      ...body.map((row) => ({
        question: row[0],
        chinese: row[1],
        example: row[2],
      })),
    );
    return;
  }

  if (header.includes("présent")) {
    chapter.exercises.push(
      ...body.map((row) => ({
        prompt: row[0],
        answer: row[1],
        chinese: row[2],
        type: heading.includes("passé") ? "past" : "future",
      })),
    );
    return;
  }

  body.forEach((row) => {
    const french = row.find((cell) => /[A-Za-zÀ-ÿ]/.test(cell));
    const chinese = [...row].reverse().find((cell) => /[\u4e00-\u9fff]/.test(cell));
    if (french && chinese) {
      chapter.memorization.push({ french, chinese });
    }
  });
}

export function parseCourseMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const data = {
    title: "Conversation française - Révision finale",
    sourceTitle: "Cours-RevisionFinale",
    chapters: [],
    reviewCards: [],
  };
  let chapter = null;
  let heading = "";
  const seenCards = new Set();

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (/^#\s+Conversation/.test(line)) {
      data.title = stripMd(line.replace(/^#\s+/, ""));
      continue;
    }

    if (/^#\s+\d+\.\s+/.test(line)) {
      chapter = ensureChapter(data, line);
      heading = "";
      continue;
    }

    if (/^##\s+/.test(line)) {
      heading = stripMd(line.replace(/^##\s+/, ""));
      continue;
    }

    if (line.trim().startsWith("|")) {
      const { rows, next } = readTable(lines, i);
      parseTableIntoChapter(chapter, heading, rows);
      i = next - 1;
      continue;
    }

    if (chapter && line.trim().startsWith("- ")) {
      const text = stripMd(line.replace(/^\s*-\s+/, ""));
      const parts = text.match(/^(.+?[.!?])\s+([\u4e00-\u9fff].*)$/);
      if (parts) {
        chapter.memorization.push({ french: parts[1], chinese: parts[2] });
      } else if (/[A-Za-zÀ-ÿ]/.test(text)) {
        chapter.notes.push(text);
      }
    }
  }

  attachWordBanks(data);

  for (const chapterItem of data.chapters) {
    for (const item of chapterItem.wordBank) {
      addReviewCard(
        data.reviewCards,
        {
          id: `word-${chapterItem.id}-${item.key}`,
          type: "vocabulary",
          front: item.lemma,
          back: item.chinese,
          pos: item.pos,
          forms: item.forms,
          example: item.example,
          wordKey: item.key,
          chapter: chapterItem.title,
        },
        seenCards,
      );
    }
    for (const item of chapterItem.vocabulary) {
      addReviewCard(
        data.reviewCards,
        {
          id: `phrase-${chapterItem.id}-${data.reviewCards.length + 1}`,
          type: "phrase",
          front: item.french,
          back: item.chinese,
          ipa: item.ipa,
          visual: item.visual,
          hint: item.hint,
          chapter: chapterItem.title,
        },
        seenCards,
      );
    }
  }

  for (const chapterItem of data.chapters) {
    for (const item of chapterItem.oralQuestions) {
      addReviewCard(
        data.reviewCards,
        {
          id: `oral-${data.reviewCards.length + 1}`,
          type: "dialogue",
          front: item.example,
          back: item.chinese,
          prompt: item.question,
          teacher: item.question,
          student: item.example,
          chapter: chapterItem.title,
        },
        seenCards,
      );
    }
    for (const item of chapterItem.memorization) {
      addReviewCard(
        data.reviewCards,
        {
          id: `sentence-${data.reviewCards.length + 1}`,
          type: "sentence",
          front: item.french,
          back: item.chinese,
          chapter: chapterItem.title,
        },
        seenCards,
      );
    }
  }

  return data;
}

if (process.argv[1] === __filename) {
  const data = fs.existsSync(COURSE_INDEX_SOURCE)
    ? buildCourseDataFromIndex(JSON.parse(fs.readFileSync(COURSE_INDEX_SOURCE, "utf8")))
    : parseCourseMarkdown(fs.readFileSync(SOURCE, "utf8"));
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `export const courseData = ${JSON.stringify(data, null, 2)};\n`, "utf8");
  console.log(`Wrote ${path.relative(ROOT, OUT)} with ${data.chapters.length} chapters and ${data.reviewCards.length} cards.`);
}
