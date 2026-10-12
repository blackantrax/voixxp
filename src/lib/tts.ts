"use client";

import type { Engine } from "./voices";

export type Progress = { label: string; ratio: number };
type Pending = { resolve: (r: { blob: Blob; seconds: number }) => void; reject: (e: Error) => void };

const workers = new Map<Engine, Worker>();
const pending = new Map<number, Pending>();
let nextId = 1;
let progressListener: ((p: Progress) => void) | null = null;

export function onProgress(fn: ((p: Progress) => void) | null) {
  progressListener = fn;
}

function worker(engine: Engine) {
  let w = workers.get(engine);
  if (!w) {
    w = new Worker(`/workers/${engine}.js`, { type: "module" });
    w.onmessage = ({ data }) => {
      if (data.type === "progress") progressListener?.({ label: data.label, ratio: data.ratio });
      if (data.type === "ready") progressListener?.({ label: `Modèle prêt (${data.device})`, ratio: 1 });
      const p = data.id ? pending.get(data.id) : undefined;
      if (!p) return;
      pending.delete(data.id);
      if (data.type === "done") p.resolve({ blob: data.blob, seconds: data.seconds });
      else p.reject(new Error(data.message));
    };
    w.onerror = (e) => {
      for (const [id, p] of pending) { p.reject(new Error(e.message || "Erreur du moteur")); pending.delete(id); }
      workers.delete(engine);
    };
    workers.set(engine, w);
  }
  return w;
}

export function synthesize(engine: Engine, text: string, voice: string, speed = 1) {
  const id = nextId++;
  return new Promise<{ blob: Blob; seconds: number }>((resolve, reject) => {
    pending.set(id, { resolve, reject });
    worker(engine).postMessage({ id, text, voice, speed });
  });
}
