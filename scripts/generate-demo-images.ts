// Draws the demo restaurant's artwork: every image in public/images is an original illustration, regenerated at its
// existing size so layouts stay put. Run with `npm run images:generate`.
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public", "images");

function seeded(text: string) {
  let a = [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rand = () => number;

function pizza(cx: number, cy: number, r: number, rand: Rand) {
  const palette = [["#b5281c", "#7f1d12"], ["#6b7a3a", "#4c5729"], ["#3f3f46", "#27272a"], ["#c2632a", "#8f4418"]];
  const [fill, edge] = palette[Math.floor(rand() * palette.length)];
  const toppings = Array.from({ length: 11 }, () => {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * r * 0.68;
    return `<circle cx="${cx + Math.cos(a) * d}" cy="${cy + Math.sin(a) * d}" r="${r * 0.095}" fill="${fill}" stroke="${edge}" stroke-width="2"/>`;
  }).join("");
  const cuts = [0, 1, 2, 3]
    .map((i) => {
      const a = (i * Math.PI) / 4;
      return `<line x1="${cx - Math.cos(a) * r * 0.84}" y1="${cy - Math.sin(a) * r * 0.84}" x2="${cx + Math.cos(a) * r * 0.84}" y2="${cy + Math.sin(a) * r * 0.84}" stroke="#d99a2e" stroke-width="2"/>`;
    })
    .join("");
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#d99a4e" stroke="#a86a28" stroke-width="3"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.88}" fill="#b5341a"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.84}" fill="#f6c445"/>${cuts}${toppings}`;
}

function wings(cx: number, cy: number, s: number, rand: Rand) {
  return Array.from({ length: 6 }, (_, i) => {
    const x = cx + ((i % 3) - 1) * s * 0.62 + (rand() - 0.5) * s * 0.1;
    const y = cy + (Math.floor(i / 3) - 0.5) * s * 0.62;
    const turn = rand() * 80 - 40;
    return `<g transform="translate(${x} ${y}) rotate(${turn}) scale(${s / 100})">
      <rect x="-7" y="10" width="14" height="38" rx="7" fill="#f3e3c7"/>
      <ellipse cx="0" cy="-8" rx="30" ry="36" fill="#b5541c" stroke="#7c3412" stroke-width="3"/>
      <ellipse cx="-9" cy="-20" rx="9" ry="13" fill="#d4772e"/></g>`;
  }).join("");
}

function burger(cx: number, cy: number, s: number) {
  return `<g transform="translate(${cx} ${cy}) scale(${s / 100})">
    <path d="M-92 -8C-92 -70 92 -70 92 -8Z" fill="#d99a4e"/>
    <rect x="-100" y="-8" width="200" height="16" rx="8" fill="#5da53f"/>
    <rect x="-96" y="8" width="192" height="30" rx="14" fill="#6d3a1e"/>
    <rect x="-100" y="34" width="200" height="12" rx="6" fill="#f6c445"/>
    <path d="M-92 46H92C92 84 -92 84 -92 46Z" fill="#c98a40"/></g>`;
}

function hotDog(cx: number, cy: number, s: number) {
  return `<g transform="translate(${cx} ${cy}) rotate(-12) scale(${s / 100})">
    <rect x="-120" y="-34" width="240" height="68" rx="34" fill="#d99a4e"/>
    <rect x="-132" y="-20" width="264" height="40" rx="20" fill="#a8421e"/>
    <path d="M-110 0Q-90 -18 -70 0T-30 0T10 0T50 0T90 0" fill="none" stroke="#f6c445" stroke-width="7" stroke-linecap="round"/></g>`;
}

function fries(cx: number, cy: number, s: number, rand: Rand) {
  const sticks = Array.from({ length: 11 }, (_, i) => {
    const x = (i - 5) * 13;
    const h = 110 + rand() * 50;
    return `<rect x="${x - 6}" y="${-h}" width="13" height="${h}" rx="3" fill="#f6c445" stroke="#d99a2e" transform="rotate(${(i - 5) * 2.4})"/>`;
  }).join("");
  return `<g transform="translate(${cx} ${cy + s * 0.5}) scale(${s / 100})">${sticks}
    <path d="M-84 -66H84L66 40H-66Z" fill="#b5281c"/></g>`;
}

function rings(cx: number, cy: number, s: number) {
  return [[-46, 18], [46, 18], [0, -34]]
    .map(([x, y]) => `<circle cx="${cx + (x * s) / 100}" cy="${cy + (y * s) / 100}" r="${s * 0.46}" fill="none" stroke="#d99a4e" stroke-width="${s * 0.2}"/>`)
    .join("");
}

function bread(cx: number, cy: number, s: number) {
  return [-1, 0, 1]
    .map((i) => `<g transform="translate(${cx + i * s * 0.62} ${cy}) rotate(${i * 8})">
      <rect x="${-s * 0.3}" y="${-s * 0.62}" width="${s * 0.6}" height="${s * 1.24}" rx="${s * 0.2}" fill="#d99a4e" stroke="#a86a28" stroke-width="3"/>
      <rect x="${-s * 0.2}" y="${-s * 0.5}" width="${s * 0.4}" height="${s}" rx="${s * 0.14}" fill="#f6e0a8"/></g>`)
    .join("");
}

function bowl(cx: number, cy: number, s: number, food: string) {
  return `<ellipse cx="${cx}" cy="${cy - s * 0.2}" rx="${s * 1.02}" ry="${s * 0.34}" fill="${food}"/>
    <path d="M${cx - s * 1.1} ${cy - s * 0.2}H${cx + s * 1.1}C${cx + s} ${cy + s * 0.8} ${cx - s} ${cy + s * 0.8} ${cx - s * 1.1} ${cy - s * 0.2}Z" fill="#e7e5e0" stroke="#b9b5ad" stroke-width="3"/>`;
}

function can(cx: number, cy: number, s: number) {
  return `<g transform="translate(${cx} ${cy}) scale(${s / 100})">
    <rect x="-52" y="-96" width="104" height="192" rx="16" fill="#0f766e"/>
    <rect x="-52" y="-30" width="104" height="60" fill="#f6c445"/>
    <rect x="-42" y="-106" width="84" height="14" rx="6" fill="#c9c6bf"/>
    <rect x="-42" y="92" width="84" height="14" rx="6" fill="#c9c6bf"/></g>`;
}

function art(file: string, w: number, h: number) {
  const rand = seeded(file);
  const cx = w / 2;
  const cy = h / 2;
  const s = Math.min(w, h) * 0.38;
  const name = path.basename(file);
  if (file.includes("wings")) return wings(cx, cy, s * 0.72, rand);
  if (name.startsWith("burger")) return burger(cx, cy, s);
  if (name.startsWith("hot-dog")) return hotDog(cx, cy, s);
  if (/fries|wedges|banners.sides/.test(file)) return fries(cx, cy, s, rand);
  if (name.startsWith("onion")) return rings(cx, cy, s * 0.8);
  if (name.startsWith("garlic")) return bread(cx, cy, s * 0.9);
  if (name.startsWith("coleslaw")) return bowl(cx, cy, s * 0.9, "#c7dc8a");
  if (name.startsWith("poutine")) return bowl(cx, cy, s * 0.9, "#c98a40");
  if (name.startsWith("dipping")) return bowl(cx, cy, s * 0.8, "#b5341a");
  if (name.startsWith("canned")) return can(cx, cy, s);
  if (file.includes("deals")) return pizza(cx - s * 0.32, cy, s * 0.82, rand) + wings(cx + s * 0.78, cy, s * 0.36, rand);
  return pizza(cx, cy, s * 1.05, rand);
}

function picture(file: string, w: number, h: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs><radialGradient id="bg" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#2a5a48"/><stop offset="1" stop-color="#0f2e24"/></radialGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#bg)"/>${art(file, w, h)}</svg>`;
}

function logo(w: number, h: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 400 500">
    <circle cx="200" cy="200" r="180" fill="#0f5c46"/>
    <path d="M200 356L84 118Q200 62 316 118Z" fill="#f6c445" stroke="#d99a4e" stroke-width="16" stroke-linejoin="round"/>
    <circle cx="170" cy="170" r="22" fill="#b5281c"/><circle cx="236" cy="158" r="22" fill="#b5281c"/><circle cx="204" cy="244" r="22" fill="#b5281c"/>
    <text x="200" y="450" text-anchor="middle" font-family="Arial, sans-serif" font-size="52" font-weight="700" fill="#0f5c46">DEMO</text></svg>`;
}

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])));
  return nested.flat();
}

async function main() {
  const files = (await walk(ROOT)).filter((f) => /\.(webp|png)$/.test(f));
  for (const file of files) {
    // Read into memory first: on Windows sharp keeps the file locked, which blocks the overwrite below.
    const { width, height } = await sharp(await readFile(file)).metadata();
    const relative = path.relative(ROOT, file).replaceAll("\\", "/");
    const svg = relative.startsWith("logo") ? logo(width, height) : picture(relative, width, height);
    const image = sharp(Buffer.from(svg));
    const output = file.endsWith(".png") ? await image.png().toBuffer() : await image.webp({ quality: 82 }).toBuffer();
    await writeFile(file, output);
  }
  console.log(`Drew ${files.length} images.`);
}

void main();
