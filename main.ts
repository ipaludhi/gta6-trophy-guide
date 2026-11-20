// Vice City Platinum Atlas — entry program for make.fun gta6-trophy-guide-01.
//
// What this program does: it takes the finished guide in app/ (index.html,
// style.css, app.js, data/trophies.json) plus the four screenshots in
// screenshots/, copies both folders into the grader's output directory, and
// writes dossier.json there with the vendored make.fun library. The dossier
// is the judge's view of the entry: the screenshot sheet, the first-load
// totals, and an outline of the source files.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Inside the grader the output directory is /output (MAKEFUN_OUTPUT_DIR
// unset). Node 22, standard library only, no network, no build step.
//
// vendor/makefun-frontend.ts must stay exactly as the kit shipped it: the
// scorer rebuilds the dossier with its own copy and compares byte for byte.
// The caps below mirror the gate so a bad entry fails here, loudly, instead
// of passing locally and failing on the server.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function countEntries(dir: string): number {
  let total = 0;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    total += 1;
    if (statSync(path).isDirectory()) total += countEntries(path);
  }
  return total;
}

function fail(message: string): never {
  console.error('main.ts: ' + message);
  process.exit(1);
}

function handInGuide(): void {
  const appDir = join(repoRoot, 'app');
  const shotsDir = join(repoRoot, 'screenshots');
  if (!existsSync(join(appDir, 'index.html'))) fail('app/index.html is missing');
  if (!existsSync(join(appDir, 'data', 'trophies.json'))) fail('app/data/trophies.json is missing');
  if (!existsSync(shotsDir)) fail('screenshots/ is missing');
  const shots = readdirSync(shotsDir).filter((n) => !n.startsWith('.'));
  if (shots.length < 3 || shots.length > 4) fail('expected 3 or 4 screenshots, found ' + shots.length);
  if (countEntries(appDir) > 993) fail('app/ holds more than 993 files and directories');

  mkdirSync(outputDir, { recursive: true });
  cpSync(appDir, join(outputDir, 'app'), { recursive: true });
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });

  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
  console.log('handed in: ' + shots.length + ' screenshots, dossier ' + dossier.length + ' bytes -> ' + outputDir);
}

handInGuide();
