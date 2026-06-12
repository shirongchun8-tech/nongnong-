import { getLanguage } from "./languageData.js";

function voicesForLanguage(languageId) {
  const language = getLanguage(languageId);
  const synth = window.speechSynthesis;
  if (!synth?.getVoices) return [];
  return synth
    .getVoices()
    .filter((voice) => String(voice.lang || "").toLowerCase().startsWith(language.speechLang.toLowerCase().slice(0, 2)));
}

export function speakLanguage(text, languageId, options = {}) {
  if (!text || typeof SpeechSynthesisUtterance === "undefined") return;
  const language = getLanguage(languageId);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language.speechLang;
  utterance.rate = options.extraSlow ? 0.45 : options.slow ? 0.62 : 0.9;
  const [voice] = voicesForLanguage(languageId);
  if (voice) utterance.voice = voice;
  window.speechSynthesis?.cancel?.();
  window.speechSynthesis?.speak?.(utterance);
}
