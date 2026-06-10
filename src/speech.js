let cachedVoice = null;

function getFrenchVoice() {
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis?.getVoices?.() ?? [];
  cachedVoice =
    voices.find((voice) => voice.lang?.toLowerCase().startsWith("fr-fr")) ||
    voices.find((voice) => voice.lang?.toLowerCase().startsWith("fr")) ||
    null;
  return cachedVoice;
}

export function speakFrench(text, options = {}) {
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

if ("speechSynthesis" in window) {
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    cachedVoice = null;
  });
}
