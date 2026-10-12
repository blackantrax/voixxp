// Prepare les moteurs de synthese executes dans le navigateur (Web Workers).
// - Kokoro : le paquet fournit deja un bundle web autonome, on le copie.
// - Piper  : on le regroupe avec onnxruntime-web 1.18 (les .wasm viennent du CDN cdnjs, meme version).
import { build } from "esbuild";
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";

// piper-tts-web fige le locuteur (0) et la vitesse du modele. On les rend pilotables par le worker
// via globalThis.__piperSpeaker et globalThis.__piperLength.
const piperPatch = {
  name: "piper-patch",
  setup(b) {
    b.onLoad({ filter: /piper-tts-web[\\/]dist[\\/]piper-tts-web\.js$/ }, (args) => {
      let code = readFileSync(args.path, "utf8");
      const edits = [
        [
          "const speakerId = 0;",
          // Locuteur par nom (ex. « pierre ») ou par numero.
          "const speakerId = ((s, m) => (s != null && m && s in m ? m[s] : Number(s) || 0))(globalThis.__piperSpeaker, __privateGet(this, _modelConfig).speaker_id_map);",
        ],
        [".inference.length_scale;", ".inference.length_scale * (globalThis.__piperLength ?? 1);"],
      ];
      for (const [from, to] of edits) {
        if (!code.includes(from)) throw new Error(`piper-patch : motif introuvable « ${from} »`);
        code = code.replace(from, to);
      }
      return { contents: code, loader: "js" };
    });
  },
};

const out = "public/workers";
mkdirSync(out, { recursive: true });
copyFileSync("node_modules/kokoro-js/dist/kokoro.web.js", `${out}/kokoro.web.js`);

for (const name of ["kokoro", "piper"]) {
  await build({
    entryPoints: [`workers/${name}.worker.js`],
    outfile: `${out}/${name}.js`,
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2020",
    minify: true,
    external: ["./kokoro.web.js", "fs", "path"],
    logLevel: "warning",
    plugins: [piperPatch],
  });
}
console.log("workers ok");
