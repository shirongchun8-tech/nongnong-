import { getLanguage } from "./languageData.js";

const VOICE_KEY = "multi-language-word-studio-voices";

function loadSelectedVoices() {
  try {
    return JSON.parse(localStorage.getItem(VOICE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveSelectedVoices(value) {
  localStorage.setItem(VOICE_KEY, JSON.stringify(value));
}

export function getLanguageVoiceOptions(languageId) {
  const language = getLanguage(languageId);
  const synth = window.speechSynthesis;
  if (!synth?.getVoices) return [];
  return synth
    .getVoices()
    .filter((voice) => String(voice.lang || "").toLowerCase().startsWith(language.speechLang.toLowerCase().slice(0, 2)));
}

export function getSelectedLanguageVoiceName(languageId) {
  return loadSelectedVoices()[languageId] || "";
}

export function setSelectedLanguageVoiceName(languageId, voiceName) {
  const voices = loadSelectedVoices();
  if (voiceName) {
    voices[languageId] = voiceName;
  } else {
    delete voices[languageId];
  }
  saveSelectedVoices(voices);
}

export function selectLanguageVoice(voices, languageId, preferredName = "") {
  const language = getLanguage(languageId);
  const exactLang = language.speechLang.toLowerCase();
  return (
    voices.find((voice) => voice.name === preferredName) ||
    voices.find((voice) => String(voice.lang || "").toLowerCase() === exactLang) ||
    voices[0] ||
    null
  );
}

export function speakLanguage(text, languageId, options = {}) {
  if (!text || typeof SpeechSynthesisUtterance === "undefined") return;
  const language = getLanguage(languageId);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language.speechLang;
  utterance.rate = options.extraSlow ? 0.45 : options.slow ? 0.62 : 0.9;
  const voice = selectLanguageVoice(getLanguageVoiceOptions(languageId), languageId, getSelectedLanguageVoiceName(languageId));
  if (voice) utterance.voice = voice;
  window.speechSynthesis?.cancel?.();
  window.speechSynthesis?.speak?.(utterance);
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    window.dispatchEvent?.(new CustomEvent("languageVoicesChanged"));
  });
}
