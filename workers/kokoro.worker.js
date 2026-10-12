import { KokoroTTS } from "./kokoro.web.js";
import { encodeWav, splitText } from "./wav.js";

const MODEL = "onnx-community/Kokoro-82M-v1.0-ONNX";
let ttsPromise = null;

async function load() {
  let device = "wasm";
  try {
    if (self.navigator.gpu && (await self.navigator.gpu.requestAdapter())) device = "webgpu";
  } catch {}
  const files = {};
  const tts = await KokoroTTS.from_pretrained(MODEL, {
    dtype: device === "webgpu" ? "fp32" : "q8",
    device,
    progress_callback: (p) => {
      if (p.status === "progress" && p.total) {
        files[p.file] = [p.loaded, p.total];
        const [l, t] = Object.values(files).reduce((a, [x, y]) => [a[0] + x, a[1] + y], [0, 0]);
        self.postMessage({ type: "progress", label: "Telechargement du modele Kokoro", ratio: l / t });
      }
    },
  });
  self.postMessage({ type: "ready", device });
  return tts;
}

self.onmessage = async ({ data }) => {
  const { id, text, voice, speed } = data;
  try {
    ttsPromise ??= load();
    const tts = await ttsPromise;
    const chunks = splitText(text);
    const parts = [];
    let rate = 24000;
    for (let i = 0; i < chunks.length; i++) {
      self.postMessage({ type: "progress", label: "Synthese", ratio: i / chunks.length });
      const audio = await tts.generate(chunks[i], { voice, speed });
      rate = audio.sampling_rate;
      parts.push(audio.audio);
      parts.push(new Float32Array(Math.round(rate * 0.12)));
    }
    const total = parts.reduce((n, p) => n + p.length, 0);
    const merged = new Float32Array(total);
    let off = 0;
    for (const p of parts) { merged.set(p, off); off += p.length; }
    self.postMessage({ id, type: "done", blob: encodeWav(merged, rate), seconds: total / rate });
  } catch (err) {
    ttsPromise = null;
    self.postMessage({ id, type: "error", message: String(err?.message ?? err) });
  }
};
