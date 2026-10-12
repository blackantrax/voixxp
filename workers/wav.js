// Encodage WAV PCM 16 bits mono.
export function encodeWav(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const write = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  write(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

// Decoupe un texte en morceaux de phrases (<= max caracteres), pour les modeles a contexte court.
export function splitText(text, max = 380) {
  const sentences = text.replace(/\s+/g, " ").trim().match(/[^.!?…;:]+[.!?…;:]*\s*/g) ?? [];
  const chunks = [];
  let cur = "";
  for (const s of sentences) {
    if ((cur + s).length > max && cur) { chunks.push(cur.trim()); cur = ""; }
    if (s.length > max) {
      for (const w of s.split(" ")) {
        if ((cur + " " + w).length > max && cur) { chunks.push(cur.trim()); cur = ""; }
        cur += " " + w;
      }
    } else cur += s;
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks;
}
