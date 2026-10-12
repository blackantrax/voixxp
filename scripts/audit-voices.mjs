// Verifie que chaque voix Piper du catalogue est compatible avec le phonetiseur embarque.
//
// piper-tts-web phonetise avec la table de phonemes PAR DEFAUT de piper-phonemize, pas celle du
// modele. Les anciens modeles (ex. fr_FR-gilles-low) ont une table plus courte : l'inference
// echoue alors avec « indices element out of data bounds ». On compare donc la table de chaque
// modele a celle d'une voix de reference qui fonctionne (fr_FR-siwis-medium).
//
// Usage : node scripts/audit-voices.mjs            -> echoue si une voix du catalogue est incompatible
//         node scripts/audit-voices.mjs --candidats -> liste aussi les autres voix compatibles
import { readFileSync } from "node:fs";

const HF = "https://huggingface.co/diffusionstudio/piper-voices/resolve/main";
const REFERENCE = "fr_FR-siwis-medium";
const LANGS = ["fr", "en", "es", "de", "it", "pt", "nl"];

const dist = readFileSync("node_modules/@mintplex-labs/piper-tts-web/dist/piper-tts-web.js", "utf8");
const paths = Object.fromEntries([...dist.matchAll(/"([a-z]{2}_[A-Z]{2}-[^"]+)": "([^"]+\.onnx)"/g)].map((m) => [m[1], m[2]]));
const catalog = [...readFileSync("src/lib/voices.ts", "utf8").matchAll(/id: "([^"]+)", engine: "piper"/g)].map((m) => m[1]);
const speakersOf = Object.fromEntries(catalog.filter((v) => v.includes(":")).map((v) => v.split(":")).reduce((acc, [id, sp]) => [...acc, [id + ":" + sp, sp]], []));
const models = catalog.map((v) => v.split(":")[0]);

async function config(id) {
  const res = await fetch(`${HF}/${paths[id]}.json`);
  if (!res.ok) throw new Error(`${id}: HTTP ${res.status}`);
  return res.json();
}

function compatible(cfg, ref) {
  if (cfg.num_symbols < ref.num_symbols) return `num_symbols ${cfg.num_symbols} < ${ref.num_symbols}`;
  for (const [ph, ids] of Object.entries(ref.phoneme_id_map)) {
    const got = cfg.phoneme_id_map[ph];
    if (got && JSON.stringify(got) !== JSON.stringify(ids)) return `phoneme « ${ph} » ${JSON.stringify(got)} ≠ ${JSON.stringify(ids)}`;
  }
  return null;
}

const ref = await config(REFERENCE);
const ids = process.argv.includes("--candidats")
  ? Object.keys(paths).filter((id) => LANGS.includes(id.slice(0, 2)))
  : [...new Set(models)];

let failures = 0;
for (const id of ids) {
  if (!paths[id]) { console.log(`KO  ${id}  (absent de piper-tts-web)`); failures += models.includes(id); continue; }
  try {
    const cfg = await config(id);
    const problem = compatible(cfg, ref);
    const speakers = Object.keys(cfg.speaker_id_map ?? {});
    const extra = speakers.length ? `  locuteurs: ${speakers.slice(0, 8).join(", ")}${speakers.length > 8 ? ` (+${speakers.length - 8})` : ""}` : "";
    const inCatalog = models.includes(id);
    const missing = Object.entries(speakersOf).filter(([k]) => k.startsWith(id + ":")).map(([, sp]) => sp).filter((sp) => !(sp in (cfg.speaker_id_map ?? {})));
    const issue = problem ?? (missing.length ? `locuteur(s) introuvable(s) : ${missing.join(", ")}` : null);
    console.log(`${issue ? "KO" : "OK"}  ${id} ${inCatalog ? "[catalogue]" : ""} ${issue ?? ""}${extra}`);
    if (issue && inCatalog) failures++;
  } catch (e) {
    console.log(`KO  ${id}  ${e.message}`);
    if (models.includes(id)) failures++;
  }
}
if (failures) { console.error(`${failures} voix du catalogue incompatibles.`); process.exit(1); }
console.log("Toutes les voix du catalogue sont compatibles.");
