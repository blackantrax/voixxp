import { TtsSession, remove } from "@mintplex-labs/piper-tts-web";

const sessions = new Map();

function create(voiceId) {
  // TtsSession garde un singleton interne : on le reinitialise pour changer de voix.
  TtsSession._instance = null;
  return TtsSession.create({
    voiceId,
    progress: (p) => {
      if (p.total && !String(p.url).startsWith("tts://"))
        self.postMessage({ type: "progress", label: "Telechargement de la voix", ratio: p.loaded / p.total });
    },
  });
}

function session(voiceId) {
  if (!sessions.has(voiceId)) {
    // Un modele mis en cache (OPFS) peut etre tronque si la page a ete quittee pendant
    // l'enregistrement : l'ouverture echoue alors (« No graph was found »). On efface le
    // cache de cette voix et on la retelecharge une fois.
    const p = create(voiceId)
      .catch(async () => {
        await remove(voiceId).catch(() => {});
        return create(voiceId);
      })
      .catch((e) => { sessions.delete(voiceId); throw e; });
    sessions.set(voiceId, p);
  }
  return sessions.get(voiceId);
}

self.onmessage = async ({ data }) => {
  const { id, text, voice, speed } = data;
  try {
    const [model, speaker] = voice.split(":");
    const s = await session(model);
    globalThis.__piperSpeaker = speaker ?? null;
    globalThis.__piperLength = 1 / (speed || 1);
    self.postMessage({ type: "progress", label: "Synthese", ratio: 0.5 });
    const blob = await s.predict(text);
    const header = new DataView(await blob.slice(0, 44).arrayBuffer());
    const seconds = Math.max(0, (blob.size - 44) / 2 / header.getUint32(24, true));
    self.postMessage({ id, type: "done", blob, seconds });
  } catch (err) {
    self.postMessage({ id, type: "error", message: String(err?.message ?? err) });
  }
};
