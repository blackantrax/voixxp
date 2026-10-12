// Prepare les moteurs de synthese executes dans le navigateur (Web Workers).
// - Kokoro : le paquet fournit deja un bundle web autonome, on le copie.
// - Piper  : on le regroupe avec onnxruntime-web 1.18 (les .wasm viennent du CDN cdnjs, meme version).
import { build } from "esbuild";
import { copyFileSync, mkdirSync } from "node:fs";

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
  });
}
console.log("workers ok");
