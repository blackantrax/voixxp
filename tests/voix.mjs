// Test de bout en bout : genere un extrait avec CHAQUE voix du catalogue dans un vrai Chromium.
// Usage : node tests/voix.mjs http://localhost:3000   (necessite playwright + acces a Hugging Face)
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3000";
const only = process.argv[3];
const voices = [...readFileSync("src/lib/voices.ts", "utf8").matchAll(/id: "([^"]+)", engine: "(\w+)", name: "([^"]+)"/g)]
  .map(([, id, engine, name]) => ({ id, engine, name }))
  .filter((v) => !only || v.id.includes(only));

const browser = await chromium.launch();
const page = await browser.newPage();
const results = [];
for (const v of voices) {
  await page.goto(`${base}/studio?voix=${encodeURIComponent(v.id)}`);
  await page.getByRole("button", { name: `Générer avec ${v.name}` }).click();
  const t0 = Date.now();
  const outcome = await Promise.race([
    page.locator("ul li a[download]").first().waitFor({ timeout: 240_000 }).then(() => "OK"),
    page.getByTestId("erreur-detail").waitFor({ state: "attached", timeout: 240_000 }).then(async () => `KO ${await page.getByTestId("erreur-detail").textContent()}`),
  ]).catch((e) => `KO timeout ${e.message.split("\n")[0]}`);
  const line = `${outcome.startsWith("OK") ? "OK" : "KO"}  ${v.name.padEnd(18)} ${v.id.padEnd(42)} ${((Date.now() - t0) / 1000).toFixed(1)}s ${outcome.startsWith("KO") ? outcome.slice(3) : ""}`;
  console.log(line);
  results.push(outcome.startsWith("OK"));
}
await browser.close();
const ko = results.filter((r) => !r).length;
console.log(`${results.length - ko}/${results.length} voix fonctionnelles.`);
process.exit(ko ? 1 : 0);
