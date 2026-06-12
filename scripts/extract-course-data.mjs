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

Object.assign(BASE_LEXICON, {
  "un": ["un", "冠词", "一个；某个"],
  "une": ["un", "冠词", "一个；某个"],
  "d'": ["de", "介词", "的；从"],
  "l'": ["le", "冠词", "这个；那个"],
  "qu'": ["que", "疑问词/连词", "什么；那"],
  "mon": ["mon", "限定词", "我的"],
  "ton": ["ton", "限定词", "你的"],
  "son": ["son", "限定词", "他/她的"],
  "sa": ["son", "限定词", "他/她的"],
  "notre": ["notre", "限定词", "我们的"],
  "nos": ["notre", "限定词", "我们的"],
  "ceci": ["ceci", "代词", "这个"],
  "cela": ["cela", "代词", "那个"],
  "ici": ["ici", "副词", "这里"],
  "là": ["là", "副词", "那里"],
  "classe": ["classe", "名词", "班级；教室"],
  "syllabe": ["syllabe", "名词", "音节"],
  "syllabes": ["syllabe", "名词", "音节"],
  "règle": ["règle", "名词", "规则"],
  "règles": ["règle", "名词", "规则"],
  "phonétique": ["phonétique", "形容词", "语音的"],
  "phonétiques": ["phonétique", "形容词", "语音的"],
  "final": ["final", "形容词", "末尾的"],
  "finale": ["final", "形容词", "末尾的"],
  "consonne": ["consonne", "名词", "辅音"],
  "consonnes": ["consonne", "名词", "辅音"],
  "voyelle": ["voyelle", "名词", "元音"],
  "voyelles": ["voyelle", "名词", "元音"],
  "pluriel": ["pluriel", "名词/形容词", "复数"],
  "forme": ["forme", "名词", "形式"],
  "formes": ["forme", "名词", "形式"],
  "prononce": ["prononcer", "动词", "发音"],
  "prononcent": ["prononcer", "动词", "发音"],
  "écoutez": ["écouter", "动词", "听"],
  "répétez": ["répéter", "动词", "跟读；重复"],
  "épelez": ["épeler", "动词", "拼写"],
  "complétez": ["compléter", "动词", "补全"],
  "faites": ["faire", "动词", "做；进行"],
  "question": ["question", "名词", "问题"],
  "questions": ["question", "名词", "问题"],
  "réponse": ["réponse", "名词", "回答"],
  "réponses": ["réponse", "名词", "回答"],
  "dialogue": ["dialogue", "名词", "对话"],
  "personne": ["personne", "名词", "人"],
  "personnes": ["personne", "名词", "人"],
  "partenaire": ["partenaire", "名词", "搭档"],
  "objet": ["objet", "名词", "物品"],
  "objets": ["objet", "名词", "物品"],
  "professeur": ["professeur", "名词", "老师"],
  "étudiant": ["étudiant", "名词", "学生"],
  "étudiante": ["étudiant", "名词", "学生"],
  "étudiants": ["étudiant", "名词", "学生"],
  "américain": ["américain", "形容词/名词", "美国人；美国的"],
  "américaine": ["américain", "形容词/名词", "美国人；美国的"],
  "coréen": ["coréen", "形容词/名词", "韩国人；韩国的"],
  "coréenne": ["coréen", "形容词/名词", "韩国人；韩国的"],
  "française": ["français", "形容词/名词", "法国人；法国的；法语"],
  "françaises": ["français", "形容词/名词", "法国人；法国的；法语"],
  "chinois": ["chinois", "形容词/名词", "中国人；中国的；中文"],
  "chinoise": ["chinois", "形容词/名词", "中国人；中国的；中文"],
  "marie": ["Marie", "专有名词", "玛丽"],
  "dupont": ["Dupont", "专有名词", "杜邦"],
  "jolie": ["Jolie", "专有名词", "若莉"],
  "pierre": ["Pierre", "专有名词", "皮埃尔"],
  "julien": ["Julien", "专有名词", "朱利安"],
  "adrien": ["Adrien", "专有名词", "阿德里安"],
  "hufs": ["HUFS", "专有名词", "韩国外国语大学"],
  "école": ["école", "名词", "学校"],
  "new-york": ["New York", "专有名词", "纽约"],
  "téléphone": ["téléphone", "名词", "电话"],
  "ordinateur": ["ordinateur", "名词", "电脑"],
  "journal": ["journal", "名词", "报纸"],
  "homme": ["homme", "名词", "男人"],
  "femme": ["femme", "名词", "女人"],
  "famille": ["famille", "名词", "家庭"],
  "crayon": ["crayon", "名词", "铅笔"],
  "gâteau": ["gâteau", "名词", "蛋糕"],
  "montagne": ["montagne", "名词", "山"],
  "cadeau": ["cadeau", "名词", "礼物"],
  "pomme": ["pomme", "名词", "苹果"],
  "bonbon": ["bonbon", "名词", "糖果"],
  "bonbons": ["bonbon", "名词", "糖果"],
  "enfant": ["enfant", "名词", "孩子"],
  "enfants": ["enfant", "名词", "孩子"],
  "fleur": ["fleur", "名词", "花"],
  "fleurs": ["fleur", "名词", "花"],
  "stylo": ["stylo", "名词", "笔"],
  "chaise": ["chaise", "名词", "椅子"],
  "rencontre": ["rencontre", "名词", "见面"],
  "formelle": ["formel", "形容词", "正式的"],
  "enchanté": ["enchanté", "形容词", "很高兴认识你"],
  "prénom": ["prénom", "名词", "名"],
  "nom": ["nom", "名词", "姓；名字"],
  "excusez": ["excuser", "动词", "请原谅"],
  "plaît": ["plaire", "动词", "使喜欢"],
  "ami": ["ami", "名词", "朋友"],
  "amis": ["ami", "名词", "朋友"],
  "plus": ["plus", "副词", "更多；再"],
  "chaque": ["chaque", "限定词", "每个"],
  "quitter": ["quitter", "动词", "离开；告别"],
  "quelqu'un": ["quelqu'un", "代词", "某人"],
  "travaille": ["travailler", "动词", "工作；学习"],
  "étudies": ["étudier", "动词", "学习"],
  "étudie": ["étudier", "动词", "学习"],
  "téléphonons": ["téléphoner", "动词", "打电话"],
  "danser": ["danser", "动词", "跳舞"],
  "nager": ["nager", "动词", "游泳"],
  "chanter": ["chanter", "动词", "唱歌"],
  "manges": ["manger", "动词", "吃"],
  "prend": ["prendre", "动词", "拿；乘坐；吃喝"],
  "utilise": ["utiliser", "动词", "使用"],
  "parle": ["parler", "动词", "说；讲"],
  "viens": ["venir", "动词", "来"],
  "allé": ["aller", "动词", "去了"],
  "ont": ["avoir", "动词", "有；已经"],
  "êtes": ["être", "动词", "是"],
  "sommes": ["être", "动词", "是"],
  "m'appelle": ["s'appeler", "动词", "叫做"],
  "appelle": ["s'appeler", "动词", "叫做"],
  "m'appelle": ["s'appeler", "动词", "叫做"],
  "t'appelles": ["s'appeler", "动词", "叫做"],
  "s'appelle": ["s'appeler", "动词", "叫做"],
  "aussi": ["aussi", "副词", "也"],
  "anglais": ["anglais", "名词/形容词", "英语；英国的"],
  "nationalité": ["nationalité", "名词", "国籍"],
  "employé": ["employé", "名词", "职员"],
  "entreprise": ["entreprise", "名词", "公司"],
  "supermarché": ["supermarché", "名词", "超市"],
  "rue": ["rue", "名词", "街道"],
  "lundi": ["lundi", "名词", "星期一"],
  "jour": ["jour", "名词", "天；日"],
  "journée": ["journée", "名词", "一天"],
  "semaine": ["semaine", "名词", "星期"],
  "week-end": ["week-end", "名词", "周末"],
  "déjeuner": ["déjeuner", "动词/名词", "午餐；吃午餐"],
  "dîner": ["dîner", "动词/名词", "晚餐；吃晚餐"],
  "pizza": ["pizza", "名词", "披萨"],
  "poisson": ["poisson", "名词", "鱼"],
  "viande": ["viande", "名词", "肉"],
  "banane": ["banane", "名词", "香蕉"],
  "chocolat": ["chocolat", "名词", "巧克力"],
  "lait": ["lait", "名词", "牛奶"],
  "crème": ["crème", "名词", "奶油"],
  "glacée": ["glacé", "形容词", "冰的"],
  "sucré": ["sucré", "形容词", "甜的"],
  "cuiller": ["cuiller", "名词", "勺子"],
  "beaucoup": ["beaucoup", "副词", "很多"],
  "pendant": ["pendant", "介词", "在……期间"],
  "depuis": ["depuis", "介词", "自从；以来"],
  "si": ["si", "连词/副词", "如果；如此"],
  "sur": ["sur", "介词", "在……上面"],
  "par": ["par", "介词", "通过；由"],
  "moins": ["moins", "副词", "较少；减去"],
  "lieu": ["lieu", "名词", "地点"],
  "salle": ["salle", "名词", "房间；厅"],
  "salon": ["salon", "名词", "客厅"],
  "piscine": ["piscine", "名词", "游泳池"],
  "port": ["port", "名词", "港口"],
  "musique": ["musique", "名词", "音乐"],
  "football": ["football", "名词", "足球"],
  "cheveux": ["cheveux", "名词", "头发"],
  "lit": ["lit", "名词", "床"],
  "quantité": ["quantité", "名词", "数量"],
  "fois": ["fois", "名词", "次"],
  "vocabulaire": ["vocabulaire", "名词", "词汇"],
  "exemple": ["exemple", "名词", "例子"],
  "exemples": ["exemple", "名词", "例子"],
  "phrase": ["phrase", "名词", "句子"],
  "phrases": ["phrase", "名词", "句子"],
  "verbe": ["verbe", "名词", "动词"],
  "négation": ["négation", "名词", "否定"],
});

Object.assign(BASE_LEXICON, {
  "accord": ["accord", "名词", "同意；一致"],
  "acheter": ["acheter", "动词", "买"],
  "acide": ["acide", "形容词", "酸的"],
  "action": ["action", "名词", "动作；行动"],
  "actions": ["action", "名词", "动作；行动"],
  "adjectif": ["adjectif", "名词", "形容词"],
  "adjectifs": ["adjectif", "名词", "形容词"],
  "adorer": ["adorer", "动词", "非常喜欢"],
  "adore": ["adorer", "动词", "非常喜欢"],
  "aéroport": ["aéroport", "名词", "机场"],
  "agenda": ["agenda", "名词", "日程本；日程"],
  "aliment": ["aliment", "名词", "食物"],
  "aliments": ["aliment", "名词", "食物"],
  "allemand": ["allemand", "形容词/名词", "德国的；德国人；德语"],
  "alors": ["alors", "副词/连词", "那么；于是"],
  "amer": ["amer", "形容词", "苦的"],
  "anniversaire": ["anniversaire", "名词", "生日"],
  "animal": ["animal", "名词", "动物"],
  "animaux": ["animal", "名词", "动物"],
  "armoire": ["armoire", "名词", "衣柜"],
  "arbre": ["arbre", "名词", "树"],
  "arbres": ["arbre", "名词", "树"],
  "arrivée": ["arrivée", "名词", "到达；终点"],
  "arrivé": ["arriver", "动词", "到达"],
  "as": ["avoir", "动词", "有；已经"],
  "assiette": ["assiette", "名词", "盘子"],
  "attraction": ["attraction", "名词", "游乐项目；吸引力"],
  "attractions": ["attraction", "名词", "游乐项目；吸引力"],
  "avant": ["avant", "介词/副词", "在……之前；以前"],
  "avion": ["avion", "名词", "飞机"],
  "avons": ["avoir", "动词", "有；已经"],
  "âge": ["âge", "名词", "年龄"],
  "aimons": ["aimer", "动词", "喜欢"],
  "amusent": ["s'amuser", "动词", "玩得开心"],
  "amuse": ["s'amuser", "动词", "玩得开心"],
  "bain": ["bain", "名词", "洗澡；浴室"],
  "bains": ["bain", "名词", "洗澡；浴室"],
  "banque": ["banque", "名词", "银行"],
  "bar": ["bar", "名词", "酒吧"],
  "bateau": ["bateau", "名词", "船"],
  "bateaux": ["bateau", "名词", "船"],
  "belge": ["belge", "形容词/名词", "比利时的；比利时人"],
  "biscuit": ["biscuit", "名词", "饼干"],
  "biscuits": ["biscuit", "名词", "饼干"],
  "blanc": ["blanc", "形容词", "白色的"],
  "blanche": ["blanc", "形容词", "白色的"],
  "blancs": ["blanc", "形容词", "白色的"],
  "bleue": ["bleu", "形容词", "蓝色的"],
  "blond": ["blond", "形容词", "金发的"],
  "blonde": ["blond", "形容词", "金发的"],
  "boisson": ["boisson", "名词", "饮料"],
  "boissons": ["boisson", "名词", "饮料"],
  "boit": ["boire", "动词", "喝"],
  "bol": ["bol", "名词", "碗"],
  "bols": ["bol", "名词", "碗"],
  "bon": ["bon", "形容词", "好的；好吃的"],
  "bonne": ["bon", "形容词", "好的；好吃的"],
  "boucherie": ["boucherie", "名词", "肉店"],
  "brasserie": ["brasserie", "名词", "小餐馆；啤酒店"],
  "bureau": ["bureau", "名词", "办公室；书桌"],
  "buffet": ["buffet", "名词", "餐边柜；自助餐"],
  "cadeaux": ["cadeau", "名词", "礼物"],
  "carole": ["Carole", "专有名词", "卡罗尔"],
  "caroline": ["Caroline", "专有名词", "卡罗琳"],
  "cave": ["cave", "名词", "地下室；酒窖"],
  "château": ["château", "名词", "城堡"],
  "chaud": ["chaud", "形容词", "热的"],
  "chauffeur": ["chauffeur", "名词", "司机"],
  "cher": ["cher", "形容词", "贵的；亲爱的"],
  "chien": ["chien", "名词", "狗"],
  "chose": ["chose", "名词", "东西；事情"],
  "cinq": ["cinq", "数词", "五"],
  "client": ["client", "名词", "顾客"],
  "coiffer": ["se coiffer", "动词", "梳头"],
  "comment": ["comment", "疑问词", "怎样；如何"],
  "commence": ["commencer", "动词", "开始"],
  "commencer": ["commencer", "动词", "开始"],
  "comptable": ["comptable", "名词", "会计"],
  "comparaison": ["comparaison", "名词", "比较"],
  "compréhension": ["compréhension", "名词", "理解；听力理解"],
  "concert": ["concert", "名词", "音乐会"],
  "confortable": ["confortable", "形容词", "舒服的"],
  "conjugaison": ["conjugaison", "名词", "动词变位"],
  "corée": ["Corée", "专有名词", "韩国"],
  "côté": ["côté", "名词", "旁边；一侧"],
  "couche": ["se coucher", "动词", "睡觉；躺下"],
  "coucher": ["se coucher", "动词", "睡觉；躺下"],
  "couple": ["couple", "名词", "夫妻；一对"],
  "court": ["court", "形容词", "短的"],
  "courts": ["court", "形容词", "短的"],
  "couteau": ["couteau", "名词", "刀"],
  "coussin": ["coussin", "名词", "靠垫"],
  "croissant": ["croissant", "名词", "羊角面包"],
  "croissants": ["croissant", "名词", "羊角面包"],
  "cuisinier": ["cuisinier", "名词", "厨师"],
  "danse": ["danse", "名词", "舞蹈"],
  "date": ["date", "名词", "日期"],
  "déjeuner": ["déjeuner", "动词/名词", "吃午饭；午餐"],
  "déjeune": ["déjeuner", "动词", "吃午饭"],
  "départ": ["départ", "名词", "出发；起点"],
  "déplacement": ["déplacement", "名词", "移动；出行"],
  "dernière": ["dernier", "形容词", "上一个；最后的"],
  "dernier": ["dernier", "形容词", "上一个；最后的"],
  "derrière": ["derrière", "介词/副词", "在……后面"],
  "descends": ["descendre", "动词", "下去；下车"],
  "dessous": ["dessous", "名词/副词", "下面"],
  "dessus": ["dessus", "名词/副词", "上面"],
  "déteste": ["détester", "动词", "讨厌"],
  "détester": ["détester", "动词", "讨厌"],
  "déterminée": ["déterminé", "形容词", "确定的"],
  "devant": ["devant", "介词/副词", "在……前面"],
  "différent": ["différent", "形容词", "不同的"],
  "différents": ["différent", "形容词", "不同的"],
  "dit": ["dire", "动词", "说"],
  "divorcé": ["divorcé", "形容词", "离婚的"],
  "dîne": ["dîner", "动词", "吃晚饭"],
  "donne": ["donner", "动词", "给"],
  "dormir": ["dormir", "动词", "睡觉"],
  "douche": ["douche", "名词", "淋浴"],
  "droit": ["droit", "形容词/名词", "直的；右边；权利"],
  "durant": ["Durant", "专有名词", "杜朗"],
  "dure": ["durer", "动词", "持续"],
  "durer": ["durer", "动词", "持续"],
  "eau": ["eau", "名词", "水"],
  "eiffel": ["Eiffel", "专有名词", "埃菲尔"],
  "ennuyeux": ["ennuyeux", "形容词", "无聊的"],
  "entrée": ["entrée", "名词", "入口；前菜"],
  "essayer": ["essayer", "动词", "尝试"],
  "est-ce": ["être", "疑问结构", "是不是"],
  "eu": ["avoir", "动词", "有过；得到过"],
  "euro": ["euro", "名词", "欧元"],
  "euros": ["euro", "名词", "欧元"],
  "existe": ["exister", "动词", "存在"],
  "expression": ["expression", "名词", "表达；短语"],
  "expressions": ["expression", "名词", "表达；短语"],
  "faim": ["faim", "名词", "饿；饥饿"],
  "favori": ["favori", "形容词", "最喜欢的"],
  "féminin": ["féminin", "名词/形容词", "阴性；女性的"],
  "fille": ["fille", "名词", "女儿；女孩"],
  "fils": ["fils", "名词", "儿子"],
  "font": ["faire", "动词", "做"],
  "forêt": ["forêt", "名词", "森林"],
  "four": ["four", "名词", "烤箱"],
  "fourchette": ["fourchette", "名词", "叉子"],
  "frais": ["frais", "形容词", "新鲜的；凉爽的"],
  "frigo": ["frigo", "名词", "冰箱"],
  "frère": ["frère", "名词", "兄弟"],
  "fruit": ["fruit", "名词", "水果"],
  "fruits": ["fruit", "名词", "水果"],
  "fumer": ["fumer", "动词", "吸烟"],
  "gâteau": ["gâteau", "名词", "蛋糕"],
  "gâteaux": ["gâteau", "名词", "蛋糕"],
  "gauche": ["gauche", "名词/形容词", "左边；左的"],
  "généralement": ["généralement", "副词", "通常；一般来说"],
  "généreux": ["généreux", "形容词", "慷慨的"],
  "gentil": ["gentil", "形容词", "友善的"],
  "gentille": ["gentil", "形容词", "友善的"],
  "goûter": ["goûter", "动词/名词", "尝；下午茶/点心"],
  "garage": ["garage", "名词", "车库"],
  "gras": ["gras", "形容词", "油腻的；肥的"],
  "gros": ["gros", "形容词", "胖的；大的"],
  "groupe": ["groupe", "名词", "组；类"],
  "habitant": ["habitant", "名词", "居民"],
  "habitants": ["habitant", "名词", "居民"],
  "hiver": ["hiver", "名词", "冬天"],
  "hôpital": ["hôpital", "名词", "医院"],
  "hygiène": ["hygiène", "名词", "卫生"],
  "indéterminée": ["indéterminé", "形容词", "不确定的"],
  "indiquer": ["indiquer", "动词", "指出；标明"],
  "intelligent": ["intelligent", "形容词", "聪明的"],
  "inutile": ["inutile", "形容词", "没用的"],
  "jambon": ["jambon", "名词", "火腿"],
  "jardin": ["jardin", "名词", "花园"],
  "jean": ["Jean", "专有名词", "让"],
  "jeudi": ["jeudi", "名词", "星期四"],
  "joue": ["jouer", "动词", "玩；踢"],
  "jouet": ["jouet", "名词", "玩具"],
  "jouets": ["jouet", "名词", "玩具"],
  "juillet": ["juillet", "名词", "七月"],
  "jusqu": ["jusque", "介词", "直到"],
  "karaoké": ["karaoké", "名词", "卡拉OK"],
  "lampe": ["lampe", "名词", "灯；台灯"],
  "langue": ["langue", "名词", "语言；舌头"],
  "lave": ["se laver", "动词", "洗；洗漱"],
  "laver": ["se laver", "动词", "洗；洗漱"],
  "liaison": ["liaison", "名词", "联诵；联系"],
  "liaisons": ["liaison", "名词", "联诵；联系"],
  "librairie": ["librairie", "名词", "书店"],
  "libre": ["libre", "形容词", "有空的；自由的"],
  "lieux": ["lieu", "名词", "地点；场所"],
  "loge": ["loger", "动词", "住；寄宿"],
  "loisir": ["loisir", "名词", "休闲；娱乐"],
  "long": ["long", "形容词", "长的"],
  "longs": ["long", "形容词", "长的"],
  "longtemps": ["longtemps", "副词", "很久"],
  "luc": ["Luc", "专有名词", "吕克"],
  "lyon": ["Lyon", "专有名词", "里昂"],
  "magasin": ["magasin", "名词", "商店"],
  "magasins": ["magasin", "名词", "商店"],
  "magazine": ["magazine", "名词", "杂志"],
  "mange": ["manger", "动词", "吃"],
  "manière": ["manière", "名词", "方式"],
  "maquiller": ["se maquiller", "动词", "化妆"],
  "mar": ["mars", "名词", "三月"],
  "marc": ["Marc", "专有名词", "马克"],
  "marche": ["marcher", "动词/名词", "走路；步行"],
  "marches": ["marcher", "动词/名词", "走路；步行"],
  "marché": ["marché", "名词", "市场"],
  "mardi": ["mardi", "名词", "星期二"],
  "marié": ["marié", "形容词", "已婚的"],
  "masculin": ["masculin", "名词/形容词", "阳性；男性的"],
  "mercredi": ["mercredi", "名词", "星期三"],
  "miel": ["miel", "名词", "蜂蜜"],
  "mince": ["mince", "形容词", "瘦的"],
  "met": ["mettre", "动词", "放；穿"],
  "mettez": ["mettre", "动词", "放；穿"],
  "moment": ["moment", "名词", "时刻；片刻"],
  "moments": ["moment", "名词", "时刻；片刻"],
  "monsieur": ["monsieur", "名词", "先生"],
  "moto": ["moto", "名词", "摩托车"],
  "mère": ["mère", "名词", "母亲"],
  "naissance": ["naissance", "名词", "出生"],
  "natation": ["natation", "名词", "游泳"],
  "né": ["naître", "动词/形容词", "出生的"],
  "neige": ["neige", "名词", "雪"],
  "neuf": ["neuf", "数词/形容词", "九；新的"],
  "neveu": ["neveu", "名词", "侄子；外甥"],
  "noir": ["noir", "形容词", "黑色的"],
  "noirs": ["noir", "形容词", "黑色的"],
  "nouille": ["nouille", "名词", "面条"],
  "nuit": ["nuit", "名词", "夜晚"],
  "obélix": ["Obélix", "专有名词", "奥贝利克斯"],
  "offrir": ["offrir", "动词", "赠送"],
  "oncle": ["oncle", "名词", "叔叔；舅舅；伯父"],
  "orale": ["oral", "形容词", "口头的"],
  "ouverte": ["ouvert", "形容词", "开着的"],
  "pain": ["pain", "名词", "面包"],
  "paquet": ["paquet", "名词", "包；袋"],
  "paquets": ["paquet", "名词", "包；袋"],
  "parfois": ["parfois", "副词", "有时候"],
  "parle": ["parler", "动词", "说；讲"],
  "parler": ["parler", "动词", "说；讲"],
  "part": ["part", "名词", "份；部分"],
  "parts": ["part", "名词", "份；部分"],
  "participe": ["participe", "名词", "分词"],
  "partitif": ["partitif", "名词/形容词", "部分冠词；部分的"],
  "passe": ["passer", "动词", "经过；度过"],
  "pâtisserie": ["pâtisserie", "名词", "糕点店；糕点"],
  "pays": ["pays", "名词", "国家"],
  "petite": ["petit", "形容词", "小的"],
  "père": ["père", "名词", "父亲"],
  "peu": ["peu", "副词", "少；一点"],
  "plat": ["plat", "名词/形容词", "菜；盘；平的"],
  "plats": ["plat", "名词", "菜肴"],
  "plan": ["plan", "名词", "地图；计划"],
  "poissonnerie": ["poissonnerie", "名词", "鱼店"],
  "popcorn": ["popcorn", "名词", "爆米花"],
  "porc": ["porc", "名词", "猪肉"],
  "pourquoi": ["pourquoi", "疑问词", "为什么"],
  "pouvez": ["pouvoir", "动词", "能够；可以"],
  "prenez": ["prendre", "动词", "拿；乘坐；吃喝"],
  "préposition": ["préposition", "名词", "介词"],
  "prépositions": ["préposition", "名词", "介词"],
  "présentation": ["présentation", "名词", "介绍；展示"],
  "présentations": ["présentation", "名词", "介绍；展示"],
  "présenter": ["présenter", "动词", "介绍"],
  "pris": ["prendre", "动词", "拿了；吃喝了；乘坐了"],
  "prix": ["prix", "名词", "价格"],
  "profession": ["profession", "名词", "职业"],
  "professions": ["profession", "名词", "职业"],
  "promener": ["se promener", "动词", "散步"],
  "pronom": ["pronom", "名词", "代词"],
  "pronominal": ["pronominal", "形容词", "代词式的；自反的"],
  "proposé": ["proposer", "动词/形容词", "提出的；建议的"],
  "qu": ["que", "疑问词/连词", "什么；那（qu’ 的形式）"],
  "quatre": ["quatre", "数词", "四"],
  "quelque": ["quelque", "限定词", "某个；一些"],
  "quelqu": ["quelque", "限定词", "某个；一些"],
  "quoi": ["quoi", "疑问词", "什么"],
  "rarement": ["rarement", "副词", "很少"],
  "raser": ["se raser", "动词", "刮胡子"],
  "recevoir": ["recevoir", "动词", "收到"],
  "reçoit": ["recevoir", "动词", "收到"],
  "reçu": ["recevoir", "动词", "收到了"],
  "regarde": ["regarder", "动词", "看"],
  "regarder": ["regarder", "动词", "看"],
  "regardez": ["regarder", "动词", "看"],
  "relation": ["relation", "名词", "关系"],
  "remarque": ["remarque", "名词", "备注；说明"],
  "rencontre": ["rencontre", "名词", "见面"],
  "rencontrer": ["rencontrer", "动词", "遇见；见面"],
  "rencontré": ["rencontrer", "动词", "遇见了"],
  "reste": ["rester", "动词", "停留；待着"],
  "restaurant": ["restaurant", "名词", "餐厅"],
  "répondez": ["répondre", "动词", "回答"],
  "réunion": ["réunion", "名词", "会议"],
  "réveille": ["se réveiller", "动词", "醒来"],
  "réveiller": ["se réveiller", "动词", "醒来；叫醒"],
  "riche": ["riche", "形容词", "富有的"],
  "riz": ["riz", "名词", "米饭；大米"],
  "route": ["route", "名词", "道路"],
  "roulent": ["rouler", "动词", "行驶；滚动"],
  "roux": ["roux", "形容词", "红褐色头发的"],
  "saison": ["saison", "名词", "季节"],
  "saisons": ["saison", "名词", "季节"],
  "salé": ["salé", "形容词", "咸的"],
  "santé": ["santé", "名词", "健康"],
  "serveur": ["serveur", "名词", "服务员"],
  "shopping": ["shopping", "名词", "购物"],
  "singulier": ["singulier", "名词/形容词", "单数；单数的"],
  "situation": ["situation", "名词", "情况；位置"],
  "sofa": ["sofa", "名词", "沙发"],
  "sophie": ["Sophie", "专有名词", "索菲"],
  "sorbet": ["sorbet", "名词", "雪葩"],
  "sors": ["sortir", "动词", "出去"],
  "sport": ["sport", "名词", "运动"],
  "sucre": ["sucre", "名词", "糖"],
  "sucrée": ["sucré", "形容词", "甜的"],
  "suivant": ["suivant", "形容词", "下面的；接下来的"],
  "suivants": ["suivant", "形容词", "下面的；接下来的"],
  "tableau": ["tableau", "名词", "黑板；表格；画"],
  "ta": ["ton", "限定词", "你的"],
  "tarte": ["tarte", "名词", "馅饼；塔"],
  "tasse": ["tasse", "名词", "杯子"],
  "tasses": ["tasse", "名词", "杯子"],
  "tennis": ["tennis", "名词", "网球"],
  "termine": ["terminer", "动词", "结束"],
  "thé": ["thé", "名词", "茶"],
  "toi": ["toi", "重读人称代词", "你"],
  "tour": ["tour", "名词", "塔；游览；圈"],
  "tourne": ["tourner", "动词", "转；拐弯"],
  "trajet": ["trajet", "名词", "路线；路程"],
  "traverser": ["traverser", "动词", "穿过"],
  "trente": ["trente", "数词", "三十"],
  "trois": ["trois", "数词", "三"],
  "tôt": ["tôt", "副词", "早"],
  "tous": ["tout", "限定词/代词", "所有的；全部"],
  "utilisant": ["utiliser", "动词", "使用着；通过使用"],
  "utile": ["utile", "形容词", "有用的"],
  "véhicule": ["véhicule", "名词", "交通工具；车辆"],
  "vendredi": ["vendredi", "名词", "星期五"],
  "venez": ["venir", "动词", "来"],
  "verte": ["vert", "形容词", "绿色的"],
  "verre": ["verre", "名词", "玻璃杯"],
  "verres": ["verre", "名词", "玻璃杯"],
  "vidéo": ["vidéo", "名词/形容词", "视频；电子游戏的"],
  "vient": ["venir", "动词", "来"],
  "vingt": ["vingt", "数词", "二十"],
  "vin": ["vin", "名词", "葡萄酒"],
  "visité": ["visiter", "动词", "参观了"],
  "zoo": ["zoo", "名词", "动物园"],
  "œuf": ["œuf", "名词", "鸡蛋"],
  "œufs": ["œuf", "名词", "鸡蛋"],
  "uf": ["œuf", "名词", "鸡蛋"],
  "ufs": ["œuf", "名词", "鸡蛋"],
  "annie": ["Annie", "专有名词", "安妮"],
  "antoine": ["Antoine", "专有名词", "安托万"],
  "astérix": ["Astérix", "专有名词", "阿斯泰利克斯"],
  "delphine": ["Delphine", "专有名词", "德尔菲娜"],
  "dorothée": ["Dorothée", "专有名词", "多萝泰"],
  "gabriel": ["Gabriel", "专有名词", "加布里埃尔"],
  "greg": ["Greg", "专有名词", "格雷格"],
  "julie": ["Julie", "专有名词", "朱莉"],
  "legrand": ["Legrand", "专有名词", "勒格朗"],
  "martin": ["Martin", "专有名词", "马丁"],
  "obélix": ["Obélix", "专有名词", "奥贝利克斯"],
  "paula": ["Paula", "专有名词", "保拉"],
});

Object.assign(BASE_LEXICON, {
  "alice": ["Alice", "专有名词", "爱丽丝"],
  "ans": ["an", "名词", "岁；年"],
  "article": ["article", "名词", "冠词；文章"],
  "blais": ["Blais", "专有名词", "布莱"],
  "définitive": ["définitif", "形容词", "最终的；确定的"],
  "demain": ["demain", "副词", "明天"],
  "discuter": ["discuter", "动词", "讨论；聊天"],
  "épicé": ["épicé", "形容词", "辣的"],
  "épicés": ["épicé", "形容词", "辣的"],
  "étagère": ["étagère", "名词", "架子；书架"],
  "étudions": ["étudier", "动词", "学习"],
  "journaliste": ["journaliste", "名词", "记者"],
  "lavez": ["se laver", "动词", "洗；洗漱"],
  "lecture": ["lecture", "名词", "阅读"],
  "lève": ["se lever", "动词", "起床；站起来"],
  "malade": ["malade", "形容词", "生病的"],
  "mettre": ["mettre", "动词", "放；穿"],
  "nez": ["nez", "名词", "鼻子"],
  "parfum": ["parfum", "名词", "香水；香味"],
  "pot": ["pot", "名词", "罐；瓶；一小罐"],
  "pots": ["pot", "名词", "罐；瓶；一小罐"],
  "printemps": ["printemps", "名词", "春天"],
  "ranger": ["ranger", "动词", "整理；收拾"],
  "résidence": ["résidence", "名词", "住所；宿舍"],
  "seul": ["seul", "形容词/副词", "独自的；独自地"],
  "télévision": ["télévision", "名词", "电视"],
});

const IGNORED_WORD_FORMS = new Set([
  "blai",
  "boî",
  "che",
  "dî",
  "égoï",
  "er",
  "ez",
  "étudi",
  "ex",
  "fraî",
  "hair",
  "nao",
  "ner",
  "ons",
  "ste",
  "téléphon",
  "ur",
  "vm",
]);

const TOKEN_RE = /[A-Za-zÀ-ÿŒœÆæ]+(?:[-'][A-Za-zÀ-ÿŒœÆæ]+)*'?/g;

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
    const elision = normalized.match(/^(qu|[cdjlmnst])'(.+)$/);
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

function isIgnoredWordForm(form) {
  return IGNORED_WORD_FORMS.has(normalizeWord(form));
}

function inferredWord(form, lemma, pos, reason) {
  return [lemma, pos, `原词：${form}；原形：${lemma}；说明：${reason}`];
}

function unknownWord(form) {
  return [form, "待核对词汇", `原词：${form}；说明：未在基础词典中，可能是专有名词、缩写或 PDF/OCR 断词，请结合原句确认。`];
}

function guessLemma(form) {
  if (BASE_LEXICON[form]) return BASE_LEXICON[form];
  if (form.endsWith("s") && BASE_LEXICON[form.slice(0, -1)]) return BASE_LEXICON[form.slice(0, -1)];
  if (form.endsWith("es") && BASE_LEXICON[form.slice(0, -2)]) return BASE_LEXICON[form.slice(0, -2)];
  if (form.endsWith("aux") && BASE_LEXICON[`${form.slice(0, -3)}al`]) return BASE_LEXICON[`${form.slice(0, -3)}al`];
  if (form.endsWith("e") && BASE_LEXICON[`${form}r`]) return BASE_LEXICON[`${form}r`];
  if (form.endsWith("é") && BASE_LEXICON[`${form.slice(0, -1)}er`]) return BASE_LEXICON[`${form.slice(0, -1)}er`];
  if (form.endsWith("ez")) return inferredWord(form, form.replace(/ez$/, "er"), "动词", "第二人称复数或礼貌形式的动词变位");
  if (form.endsWith("ent")) return inferredWord(form, form.replace(/ent$/, "er"), "动词", "第三人称复数现在时变位");
  if (form.endsWith("es")) return inferredWord(form, form.replace(/es$/, "e"), "名词/形容词", "复数或阴性形式");
  if (form.endsWith("s") && form.length > 3) return inferredWord(form, form.slice(0, -1), "名词/形容词", "复数形式或固定 s 结尾词，需结合原句确认");
  return unknownWord(form);
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
    if (isIgnoredWordForm(form)) return;
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

function normalizeForMatch(text) {
  return stripMd(String(text || ""))
    .replace(/[’]/g, "'")
    .replace(/[“”«»]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[。！？]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function withoutAccents(text) {
  return normalizeForMatch(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function cleanSentence(text) {
  return stripMd(String(text || ""))
    .replace(/^[•→\-–]\s*/, "")
    .replace(/^[a-z]\)\s*/i, "")
    .replace(/^\d+[.)]\s*/, "")
    .replace(/[’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function firstMeaning(chinese) {
  const text = String(chinese || "");
  const original = text.match(/^原词：([^；;]+)/);
  if (original) return original[1].trim();
  return text
    .split(/[；;]/)[0]
    .replace(/^.+?：/, "")
    .replace(/的$/, "的")
    .trim();
}

function translateNameOrPlace(text) {
  const cleaned = cleanSentence(text)
    .replace(/^\s*(à|en|dans|de|d'|l')\s+/i, "")
    .replace(/^\s*(un|une|des|le|la|les|du|de la|de l')\s+/i, "")
    .replace(/[?!.,;:]+$/g, "")
    .trim();
  const normalized = normalizeForMatch(cleaned);
  const direct = {
    "séoul": "首尔",
    "seoul": "首尔",
    "paris": "巴黎",
    "new-york": "纽约",
    "hufs": "韩国外国语大学",
    "l'université": "大学",
    "université": "大学",
    "l'école": "学校",
    "école": "学校",
    "classe": "教室/班上",
    "paul": "保罗",
    "marie": "玛丽",
    "pierre": "皮埃尔",
    "julien": "朱利安",
    "adrien": "阿德里安",
    "[first name] [last name]": "名字和姓氏",
    "[first name]": "名字",
    "[last name]": "姓氏",
  };
  if (direct[normalized]) return direct[normalized];
  return cleaned || text;
}

function translateComplement(text) {
  const cleaned = cleanSentence(text).replace(/[?!.,;:]+$/g, "").trim();
  if (!cleaned) return "";
  if (/\[first name\]|\[last name\]/i.test(cleaned)) return translateNameOrPlace(cleaned);
  const lower = normalizeForMatch(cleaned);
  const noAccent = withoutAccents(cleaned);
  const direct = {
    "francais": "法国人",
    "francaise": "法国人",
    "francaises": "法国人",
    "coreen": "韩国人",
    "coreenne": "韩国人",
    "chinois": "中国人",
    "chinoise": "中国人",
    "professeur": "老师",
    "etudiant": "学生",
    "etudiante": "学生",
    "en classe": "在教室/班上",
    "a l'universite": "在大学",
    "a l'ecole": "在学校",
  };
  if (direct[noAccent]) return direct[noAccent];
  if (/^(à|a|en|dans)\s+/.test(lower)) return `在${translateNameOrPlace(cleaned)}`;
  const tokens = tokenizeFrenchText(cleaned);
  if (!tokens.length) return cleaned;
  const article = tokens[0];
  const content = tokens.filter((token) => !["le", "la", "les", "l'", "de", "d'", "du", "des", "un", "une"].includes(token));
  if (content.length === 1) {
    const info = lookupWord(content[0]);
    const meaning = firstMeaning(info.chinese);
    if (article === "un" || article === "une") return `一个${meaning}`;
    return meaning;
  }
  const meanings = content
    .map((token) => firstMeaning(lookupWord(token).chinese))
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);
  if (!meanings.length) return cleaned;
  if (article === "un" || article === "une") return `一个${meanings.join("")}`;
  return meanings.join("");
}

const EXACT_SENTENCE_TRANSLATIONS = new Map(
  [
    ["Division de français", "法语系。"],
    ["Ecoutez et répétez", "请听并跟读。"],
    ["Ecoutez et épelez", "请听并拼写。"],
    ["Combien de syllabes il y a ?", "有几个音节？"],
    ["Quelques règles phonétiques", "一些语音规则。"],
    ["Le e final n’existe pas, ex : marche , Antoine", "词尾 e 不发音，例如 marche、Antoine。"],
    ["Généralement, la consonne finale n’existe pas, ex:", "通常，词尾辅音不发音。"],
    ["Le pluriel en s ne se prononce pas, ex : étudiants", "复数词尾 s 不发音，例如 étudiants。"],
    ["Les formes es, et, er, ez, ai se prononcent [e], ex :", "es、et、er、ez、ai 这些形式读作 [e]。"],
    ["essayer, jouet, jouer, maison", "essayer、jouet、jouer、maison：这些词用于练习 [e] 音。"],
    ["The forms es, et, er, ez, ai are pronounced [e]", "es、et、er、ez、ai 这些形式读作 [e]。"],
    ["Le s entre deux voyelles se prononce [z], ex : asiatique", "两个元音之间的 s 读作 [z]，例如 asiatique。"],
    ["Faites le dialogue à deux personnes", "请两人一组练习对话。"],
    ["Faites chaque dialogue à deux personnes", "请每段对话都两人一组练习。"],
    ["Qu’est-ce que c’est ?", "这是什么？"],
    ["Qu'est-ce que c'est ?", "这是什么？"],
    ["Qu’est-ce que ce sont ?", "这些是什么？"],
    ["Qu'est-ce que ce sont ?", "这些是什么？"],
    ["This is a computer.", "这是一台电脑。"],
    ["This is a newspaper.", "这是一份报纸。"],
    ["Ask your partner questions using objects from the classroom.", "请用教室里的物品向同伴提问。"],
    ["See you later !", "回头见！"],
    ["Je vous en prie !", "不客气！"],
    ["À plus tard !", "回头见！"],
    ["Un café, s’il vous plaît.", "请给我一杯咖啡。"],
    ["Un café s’il vous plaît.", "请给我一杯咖啡。"],
    ["B: Épelez s’il vous plaît.", "B：请拼写。"],
    ["B: Moi, je suis Pierre Jolie.", "B：我呢，我是皮埃尔·若莉。"],
    ["A: Excusez-moi !", "A：不好意思！"],
  ].map(([fr, zh]) => [normalizeForMatch(fr), zh]),
);

function sentenceEnding(text) {
  return /\?$/.test(text.trim()) ? "？" : /!$/.test(text.trim()) ? "！" : "。";
}

function translateSentence(sentence) {
  const raw = cleanSentence(sentence);
  if (!raw) return "";
  const exact = EXACT_SENTENCE_TRANSLATIONS.get(normalizeForMatch(raw));
  if (exact) return exact;

  const speaker = raw.match(/^([AB])\s*:\s*(.+)$/i);
  if (speaker) return `${speaker[1].toUpperCase()}：${translateSentence(speaker[2])}`;

  const text = raw.replace(/[.!！。]$/g, "").trim();
  const lower = normalizeForMatch(text);
  const noAccent = withoutAccents(text);
  const end = sentenceEnding(raw);

  if (/^oui,?\s+/.test(lower)) return `是的，${translateSentence(text.replace(/^oui,?\s+/i, "")).replace(/。$/, "")}${end}`;
  if (/^non,?\s+/.test(lower)) return `不，${translateSentence(text.replace(/^non,?\s+/i, "")).replace(/。$/, "")}${end}`;
  if (/^moi,?\s+/.test(lower)) return `我呢，${translateSentence(text.replace(/^moi,?\s+/i, "")).replace(/。$/, "")}${end}`;
  if (/s'il vous plait|s'il vous plaît/.test(noAccent)) {
    const before = text.replace(/,?\s*s'il vous plaît\.?$/i, "").trim();
    if (before) return `请给我${translateComplement(before)}${end}`;
    return `请${end}`;
  }
  if (/^je vous en prie/.test(noAccent)) return `不客气${end}`;
  if (/^enchante/.test(noAccent)) return `很高兴认识你${end}`;
  if (/^excusez-moi/.test(noAccent)) return `不好意思${end}`;
  if (/^a plus tard/.test(noAccent)) return `回头见${end}`;
  if (/^quitter quelqu/.test(noAccent)) return `和某人告别。`;

  const subjectMap = {
    "je": "我",
    "j'": "我",
    "tu": "你",
    "il": "他",
    "elle": "她",
    "on": "我们",
    "nous": "我们",
    "vous": "您/你们",
    "ils": "他们",
    "elles": "她们",
  };
  const etrePattern = /^(je|j'|tu|il|elle|on|nous|vous|ils|elles)\s+(suis|es|est|sommes|êtes|etes|sont)\s+(.+)$/i;
  const etre = lower.match(etrePattern);
  if (etre) {
    const subject = subjectMap[etre[1]];
    const complement = translateComplement(text.replace(new RegExp(`^${etre[1]}\\s+${etre[2]}\\s+`, "i"), ""));
    if (/^(à|a|en|dans)\s+/i.test(etre[3])) return `${subject}${complement}${end}`;
    return `${subject}是${complement}${end}`;
  }

  const cest = lower.match(/^c['’]?est\s+(.+)$/i);
  if (cest) return `这是${translateComplement(text.replace(/^c['’]?est\s+/i, ""))}${end}`;

  const cesont = lower.match(/^ce\s+sont\s+(.+)$/i);
  if (cesont) return `这些是${translateComplement(text.replace(/^ce\s+sont\s+/i, ""))}${end}`;

  const name = lower.match(/^(je|j')\s+m['’]?appelle\s+(.+)$/i);
  if (name) return `我叫${translateNameOrPlace(text.replace(/^(je|j')\s+m['’]?appelle\s+/i, ""))}${end}`;

  const prenom = lower.match(/^mon\s+prénom\s+est\s+(.+)$/i);
  if (prenom) return `我的名字是${translateNameOrPlace(text.replace(/^mon\s+prénom\s+est\s+/i, ""))}${end}`;

  const aimer = lower.match(/^(je|j'|tu|il|elle|nous|vous|ils|elles)\s+(aime|aimes|aimez|aimons|aiment|adore|adorez|déteste|deteste|détestez|detestez)\s+(.+)$/i);
  if (aimer) {
    const verb = aimer[2].startsWith("dé") || aimer[2].startsWith("det") ? "不喜欢" : aimer[2].startsWith("ador") ? "很喜欢" : "喜欢";
    return `${subjectMap[aimer[1]]}${verb}${translateComplement(text.replace(new RegExp(`^${aimer[1]}\\s+${aimer[2]}\\s+`, "i"), ""))}${end}`;
  }

  const aller = lower.match(/^(je|j'|tu|il|elle|on|nous|vous|ils|elles)\s+(vais|vas|va|allons|allez|vont)\s+(.+)$/i);
  if (aller) return `${subjectMap[aller[1]]}要去${translateComplement(text.replace(new RegExp(`^${aller[1]}\\s+${aller[2]}\\s+`, "i"), ""))}${end}`;

  const neg = lower.match(/^(je|j'|tu|il|elle|on|nous|vous|ils|elles)\s+n['e]?\s*(.+?)\s+pas\s*(.*)$/i);
  if (neg) {
    const subject = subjectMap[neg[1]];
    const verb = neg[2];
    const rest = neg[3]?.trim() || "";
    if (/^(suis|es|est|sommes|êtes|etes|sont)$/.test(verb)) return `${subject}不是${translateComplement(rest)}${end}`;
    if (/travaille/.test(verb) && rest) return `${subject}不在${translateNameOrPlace(rest)}工作${end}`;
    if (/telephone|téléphone|telephonons|téléphonons/.test(verb)) return `${subject}不给${translateNameOrPlace(rest)}打电话${end}`;
    if (/parle/.test(verb) && /français|francais/.test(rest)) return `${subject}不说法语${end}`;
    if (/etudie|étudie/.test(verb)) return `${subject}不学习${translateComplement(rest)}${end}`;
    if (/aime/.test(verb)) return `${subject}不喜欢${translateComplement(rest)}${end}`;
    return `${subject}不${firstMeaning(lookupWord(verb).chinese)}${rest ? translateComplement(rest) : ""}${end}`;
  }

  if (/^complétez|^completez/.test(noAccent)) return `请根据要求补全句子${end}`;
  if (/^faites/.test(noAccent)) return `请完成练习或进行对话${end}`;
  if (/^combien\s+de/.test(noAccent)) return `多少${translateComplement(text.replace(/^combien\s+de\s+/i, ""))}${end}`;
  if (/^quel|^quelle|^quels|^quelles/.test(noAccent)) return `关于“${translateComplement(text)}”的提问${end}`;
  if (/^où|^ou\s/.test(noAccent)) return `在哪里${end}`;

  const translated = tokenizeFrenchText(text)
    .filter((token) => !["le", "la", "les", "un", "une", "des", "de", "du", "d'", "l'", "à", "a", "et"].includes(token))
    .map((token) => firstMeaning(lookupWord(token).chinese))
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)
    .slice(0, 8);
  if (translated.length) return `参考译文：${translated.join("、")}${end}`;
  return raw;
}

function translateGrammarTitle(item) {
  const raw = cleanSentence(item);
  const lower = normalizeForMatch(raw);
  const noAccent = withoutAccents(raw);
  const quoted = raw.match(/[«"]([^»"]+)[»"]/);
  if (quoted) return `语法示例：${translateSentence(quoted[1])}`;
  if (/^conjugaison generale/.test(noAccent)) return "一般现在时动词变位总表：按主语人称选择正确的动词词尾。";
  if (/^conjugaison\s+[a-zà-ÿ-]+/i.test(raw)) return `动词 ${raw.replace(/^Conjugaison\s+/i, "").replace(/\s*\(.+?\)\s*/g, "").trim()} 的变位。`;
  if (/aimer\s*\+\s*verbe infinitif/.test(noAccent)) return "结构：aimer + 动词原形，表示“喜欢做某事”。";
  if (/adorer\s*\+\s*verbe infinitif/.test(noAccent)) return "结构：adorer + 动词原形，表示“很喜欢做某事”。";
  if (/detester\s*\+\s*verbe infinitif/.test(noAccent)) return "结构：détester + 动词原形，表示“不喜欢/讨厌做某事”。";
  if (/trop immediatement apres le verbe/.test(noAccent)) return "副词 trop 通常放在动词后面，表示“太……”。";
  if (/(negation|negative)/.test(noAccent) && /ne\s*\+\s*verbe\s*\+\s*pas/.test(noAccent)) return "否定形式：ne + 动词 + pas，意思是“不……”。";
  if (/(negation|negative)/.test(noAccent)) return "否定句：把 ne/n’ 放在动词前，pas 放在动词后。";
  if (/verbes?\s+en\s+[-–]?er|premier groupe/.test(noAccent)) return "第一组 -ER 规则动词：去掉 -er 后按主语加词尾。";
  if (/verbe etre|verbe être|to be/.test(lower)) return "动词 être：表示“是/在”，需要按主语变位。";
  if (/verbe avoir/.test(noAccent)) return "动词 avoir：表示“有/已经”，也用于构成复合过去时。";
  if (/s['’]?\s*appeler/.test(lower)) return "动词 s’appeler：表示“叫做”，要搭配自反代词 me/te/se/nous/vous/se。";
  if (/travailler/.test(noAccent)) return "动词 travailler：表示“工作/学习”，属于 -ER 规则动词。";
  if (/preferer/.test(noAccent)) return "动词 préférer：表示“更喜欢”，相当于 aimer plus。";
  if (/verbe faire|faire$/.test(noAccent)) return "动词 faire：表示“做/进行”，常用于活动、运动和天气表达。";
  if (/vouloir/.test(noAccent) && /pouvoir/.test(noAccent)) return "动词 vouloir/pouvoir：vouloir 表示“想要”，pouvoir 表示“能够”。";
  if (/vouloir/.test(noAccent)) return "动词 vouloir：表示“想要”，礼貌表达可用 je voudrais。";
  if (/pouvoir/.test(noAccent)) return "动词 pouvoir：表示“能够/可以”。";
  if (/futur proche/.test(noAccent)) return "最近将来时：aller 的现在时 + 动词原形，表示“马上要/将要做某事”。";
  if (/passe compose/.test(noAccent)) return "复合过去时：avoir/être 的现在时 + 过去分词，用来表达已经完成的动作。";
  if (/liaison/.test(noAccent)) return "联诵：前一个词的词尾辅音在后一个元音开头的词前读出来。";
  if (/prepositions?|prépositions?/.test(lower)) return "介词：表示地点、方向、时间或关系，例如 à、dans、sur、sous、chez。";
  if (/expression pour|pour$/.test(noAccent)) return "pour 的用法：表示目的、用途或对象，常译为“为了/给/用于”。";
  if (/verbes? pronominaux|pronom reflechi/.test(noAccent)) return "代词式动词：动词前带自反代词 me/te/se/nous/vous/se，表示动作回到主语自身。";
  if (/article|partitif|quantite/.test(noAccent)) return "冠词和数量表达：根据名词阴阳性、单复数和数量选择 du/de la/de l’/des 等形式。";
  if (/conjugaison du verbe\s+(.+)/.test(noAccent)) return `动词 ${raw.replace(/^Conjugaison du verbe\s+/i, "")} 的变位。`;
  if (/completez|complétez/.test(lower)) return "练习：按提示补全句子。";
  if (/exercices?|exercice/.test(noAccent)) return "练习：用本节语法完成句子。";
  return `语法说明：请按原文标题复习“${raw}”。`;
}

function isEnglishOnlySentence(sentence) {
  const text = normalizeForMatch(sentence);
  if (!text) return true;
  if (/[àâçéèêëîïôùûüÿœæ]/i.test(text)) return false;
  if (/^(this is|these are|there is|there are|ask your|the forms|see you|complete with|to be\b|using objects|what is|what are|where is|i am|you are|he is|she is|we are|they are|listen and)/.test(text)) return true;
  const englishWords = (text.match(/\b(the|this|these|there|is|are|am|your|partner|using|objects|from|classroom|computer|newspaper|phone|later|forms|pronounced|with|complete|movies|movie|theater|what|where|listen|repeat|please)\b/g) || []).length;
  const frenchSignals = (text.match(/\b(je|tu|il|elle|nous|vous|ils|elles|est|sont|suis|êtes|etes|avoir|être|etre|verbe|faites|complétez|completez|avec|dans|pour|bonjour|merci|oui|non|cafe)\b/g) || []).length;
  return englishWords > 1 && frenchSignals === 0;
}

function isNonOralSentence(sentence) {
  const raw = cleanSentence(sentence);
  const text = normalizeForMatch(raw);
  const noAccent = withoutAccents(raw);
  if (!text || isEnglishOnlySentence(raw)) return true;
  if (text.length < 2) return true;
  if (/^\[.+\]$/.test(text)) return true;
  if (/…|\.{3,}|_{2,}/.test(raw)) return true;
  if (/\b[a-d]\)\s/i.test(raw)) return true;
  if (/^[=≠]/.test(text) || /[≠]/.test(raw)) return true;
  if (/s'il vous$/.test(noAccent)) return true;
  if (/\[[^\]]+\]/.test(raw)) return true;
  if (/^(prénom|prenom|statut|langue|ville|activité|activite)\s*[:：]/.test(noAccent)) return true;
  if (/^(conjugaison|division|correction|rappel|remarque|vocabulaire|compréhension|comprehension|expression|exercice|exercices|présentations|presentations|plan de|départ|depart|arrivée|arrivee|sport favori|nationalité|nationalite|prénom nom|prenom nom|type de relation|manière|maniere|caractères|caracteres|les différents|les differents|négation|negation|article|partitif|quantité|quantite|combien de syllabes)\b/.test(noAccent)) return true;
  if (/^(écoutez|ecoutez|répétez|repetez|épelez|epelez|complétez|completez|faites|répondez|repondez|reliez|mettez)\b/.test(noAccent)) return true;
  if (/^(quelques règles|quelques regles|le e final|généralement|generalement|le pluriel|les formes)\b/.test(noAccent)) return true;
  if (/\b(to speak|present|présent|correction|récapitulation|recapitulation)\b/i.test(raw) && !/[?!]/.test(raw)) return true;
  if (/^[a-zà-ÿ]+(?:\s*[-–]\s*[a-zà-ÿ]+)+$/i.test(text) && !/\b(je|tu|il|elle|nous|vous|ils|elles|est|sont|suis|êtes|etes|a|ont|vais|vas|va|vont)\b/.test(text)) return true;

  if (/^[ab]\s*:\s+/.test(text)) return false;
  if (/\b(bonjour|merci|excusez|enchanté|enchante|s'il vous plaît|s'il vous plait|à plus tard|a plus tard|je vous en prie)\b/.test(text)) return false;
  if (/^(qu['’]?est-ce|est-ce|où|ou\s|quel|quelle|quels|quelles|combien|comment|pourquoi|quand)\b/.test(noAccent)) return false;
  if (/\b(je|j'|tu|il|elle|on|nous|vous|ils|elles|c'est|ce sont|il y a)\b/.test(text)) return false;
  if (/\b(est|sont|a|ont|vais|vas|va|vont|aime|aimes|aimez|mange|manges|boit|prends|prend|veux|veut|peux|peut|voudrais|allez|fait|font|habite|étudie|etudie|travaille|parle|joue|regarde)\b/.test(text)) return false;
  return true;
}

function isNonGrammarPoint(item) {
  const raw = cleanSentence(item);
  const text = normalizeForMatch(raw);
  const noAccent = withoutAccents(raw);
  if (!text) return true;
  if (/^\[.+\]$/.test(text)) return true;
  if (/^(écoutez|ecoutez|répétez|repetez|épelez|epelez|complétez|completez|faites|répondez|repondez|reliez|mettez|utilisez)\b/.test(noAccent)) return true;
  if (/^(point de grammaire|grammaire|verbes\s*:?)$/.test(noAccent)) return true;
  return false;
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
  const grammarMap = new Map();
  for (const chapter of chapters) {
    for (const item of chapter.grammar || []) {
      if (isNonGrammarPoint(item)) continue;
      if (!grammarMap.has(item)) {
        grammarMap.set(item, {
          id: `grammar-${grammarMap.size + 1}`,
          title: item,
          chinese: translateGrammarTitle(item),
          source: chapter.title,
        });
      }
    }
  }
  const sentenceMap = new Map();
  for (const chapter of chapters) {
    for (const sentence of chapter.sentences || []) {
      const cleaned = cleanSentence(sentence);
      if (isNonOralSentence(cleaned)) continue;
      if (!sentenceMap.has(cleaned)) {
        sentenceMap.set(cleaned, {
          id: `sentence-${sentenceMap.size + 1}`,
          french: cleaned,
          chinese: translateSentence(cleaned),
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
  const vocabulary = (course.vocabulary || [])
    .filter((item) => !isIgnoredWordForm(item.word))
    .slice(0, 120)
    .map(buildWordEntry);
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
