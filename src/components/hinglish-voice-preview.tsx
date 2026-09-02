"use client";

import { useState } from "react";

export function HinglishVoicePreview() {
  const [status, setStatus] = useState("Preview is local to this browser; no call is placed or recorded.");
  function play() { if (!("speechSynthesis" in window)) { setStatus("Speech preview is unavailable in this browser."); return; } window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance("Namaste. Aapka payment pending hai. Kya main aapko secure payment link bhej doon?"); utterance.lang = "hi-IN"; utterance.onend = () => setStatus("Preview completed. No customer contact occurred."); window.speechSynthesis.speak(utterance); setStatus("Playing Hinglish recovery preview locally…"); }
  return <section className="rounded-2xl border border-violet-200 bg-violet-50 p-5"><p className="text-sm font-bold text-violet-950">Consent-safe Hinglish voice preview</p><p className="mt-2 text-sm leading-6 text-violet-900">“Namaste, aapka payment pending hai. Kya main aapko secure payment link bhej doon?”</p><button onClick={play} className="mt-4 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-bold text-white">Play local preview</button><p className="mt-3 text-sm text-violet-900">{status}</p></section>;
}
