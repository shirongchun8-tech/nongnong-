let cachedVoice = null;
const VOICE_KEY = "french-study-tool-voice";

export function selectFrenchVoice(voices, preferredName = "") {
  return (
    voices.find((voice) => voice.name === preferredName && voice.lang?.toLowerCase().startsWith("fr")) ||
    voices.find((voice) => voice.lang?.toLowerCase() === "fr-fr") ||
    voices.find((voice) => voice.lang?.toLowerCase().startsWith("fr")) ||
    null
  );
}

export function getVoiceOptions() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  return window.speechSynthesis.getVoices().filter((voice) => voice.lang?.toLowerCase().startsWith("fr"));
}

export function getSelectedVoiceName() {
  if (typeof localStorage === "undefined") return "";
  return localStorage.getItem(VOICE_KEY) || "";
}

export function setSelectedVoiceName(name) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(VOICE_KEY, name);
  cachedVoice = null;
}

function getFrenchVoice() {
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis?.getVoices?.() ?? [];
  cachedVoice = selectFrenchVoice(voices, getSelectedVoiceName());
  return cachedVoice;
}

export function speakFrench(text, options = {}) {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) {
    window.alert("这个浏览器不支持语音朗读。请试试 Chrome、Safari 或 Edge。");
    return;
  }
  const cleanText = String(text || "").replace(/\.\.\./g, " ").trim();
  if (!cleanText) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = "fr-FR";
  utterance.rate = options.slow ? 0.72 : 0.92;
  utterance.pitch = 1;
  const voice = getFrenchVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    cachedVoice = null;
    window.dispatchEvent(new CustomEvent("frenchVoicesChanged"));
  });
}
