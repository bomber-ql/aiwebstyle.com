// scripts/build-og.mjs
// 作用：生成 favicon 与社交分享图（og:image），产物全部落在 img/ 下
// 用法：node scripts/build-og.mjs [--force]
//
// 为什么这么做：
//   - 111 个页面原来一张 og:image 都没有，分享出去是空白卡片
//   - 全站也没有 favicon，/favicon.ico 一直 404，搜索结果里是灰色地球
//   - 风格页的图直接截「预览页」的 1200×630 首屏 —— 图就是真实界面，不用另做设计稿
//
// 依赖本机 Chrome 做栅格化（svg → png、页面 → png），再用 macOS 自带 sips 转 jpg。
// 找不到 Chrome 时整步跳过并提示，不阻塞构建。

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const force = process.argv.includes('--force');

const OG_DIR = path.join(ROOT, 'img', 'og');
const W = 1200;
const H = 630;

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
// new-styles.json 里的 6 条在 styles.json 中已存在，按 id 去重，否则会重复栅格化
const styleIds = [
  ...new Set([...readJson('data/styles.json'), ...readJson('data/new-styles.json')].map((s) => s.id)),
];

const icons = {
  'favicon.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="AI Web Style">
  <rect width="96" height="96" rx="21" fill="#0e1116"/>
  <rect x="17" y="17" width="27" height="27" rx="5" fill="#f4f1ea"/>
  <rect x="50" y="17" width="29" height="12" rx="5" fill="#7c5cff"/>
  <rect x="50" y="36" width="29" height="8" rx="4" fill="#22d3ee"/>
  <rect x="17" y="50" width="62" height="29" rx="5" fill="#f4f1ea"/>
</svg>
`,
};

function chromeShot(url, out, w, h, transparent = false) {
  const args = [
    '--headless=old', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--window-size=${w},${h}`,
    `--screenshot=${out}`,
    '--allow-file-access-from-files',
    '--virtual-time-budget=4000',
  ];
  if (transparent) args.push('--default-background-color=00000000');
  args.push(url);
  const r = spawnSync(CHROME, args, { stdio: 'ignore' });
  return r.status === 0 && fs.existsSync(out);
}

function toJpg(src, dest) {
  const r = spawnSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', src, '--out', dest], { stdio: 'ignore' });
  if (r.status === 0 && fs.existsSync(dest)) { fs.unlinkSync(src); return true; }
  return false;
}

if (!fs.existsSync(CHROME)) {
  console.log('· 未找到 Chrome，跳过 favicon / og:image 生成（产物保留原状）');
  process.exit(0);
}

fs.mkdirSync(OG_DIR, { recursive: true });

/* ---------- 1. favicon ---------- */
let iconCount = 0;
for (const [name, svg] of Object.entries(icons)) {
  const p = path.join(ROOT, 'img', name);
  const old = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
  if (old !== svg) { fs.writeFileSync(p, svg); iconCount++; }
}

const svgUrl = 'file://' + path.join(ROOT, 'img', 'favicon.svg');
const ico96 = path.join(ROOT, 'img', 'favicon-96.png');
if (force || !fs.existsSync(ico96)) {
  if (chromeShot(svgUrl, ico96, 96, 96, true)) iconCount++;
}

// apple-touch-icon 必须不透明（iOS 会自己套圆角，透明边会变黑）
const apple = path.join(ROOT, 'img', 'apple-touch-icon.png');
if (force || !fs.existsSync(apple)) {
  const tmpHtml = path.join(ROOT, 'img', '_apple.html');
  fs.writeFileSync(tmpHtml, `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;padding:0;background:#0e1116;width:180px;height:180px;overflow:hidden}
  svg{display:block;width:180px;height:180px}
  </style></head><body>${icons['favicon.svg']}</body></html>`);
  if (chromeShot('file://' + tmpHtml, apple, 180, 180)) iconCount++;
  fs.unlinkSync(tmpHtml);
}

/* ---------- 2. 每个风格的社交图（截预览页首屏） ---------- */
// 增量判断用内容指纹，不用 mtime：build-previews 每次构建都会重写预览页，
// 按 mtime 比会把 29 张图全部重截一遍（每张一次 Chrome 启动，几十秒白花）。
const MANIFEST = path.join(OG_DIR, '.manifest.json');
const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};
const cssStamp = fs.existsSync(path.join(ROOT, 'style.css'))
  ? crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, 'style.css'))).digest('hex').slice(0, 16)
  : 'none';

function fingerprint(parts) {
  return crypto.createHash('sha1').update(parts.join('\u0000')).digest('hex').slice(0, 16);
}

function styleHash(id) {
  const parts = [fs.readFileSync(path.join(ROOT, 'previews', `${id}.html`), 'utf8'), String(cssStamp)];
  const card = path.join(ROOT, 'card-styles', `${id}.css`);
  if (fs.existsSync(card)) parts.push(fs.readFileSync(card, 'utf8'));
  return fingerprint(parts);
}

const previewExists = (id) => fs.existsSync(path.join(ROOT, 'previews', `${id}.html`));
let made = 0;
let kept = 0;
const failed = [];

for (const id of styleIds) {
  const out = path.join(OG_DIR, `${id}.jpg`);
  const src = path.join(ROOT, 'previews', `${id}.html`);
  if (!previewExists(id)) { failed.push(id + '(缺预览页)'); continue; }
  if (!force && fs.existsSync(out) && manifest[id] === styleHash(id)) { kept++; continue; }
  const tmp = path.join(OG_DIR, `_${id}.png`);
  if (chromeShot('file://' + src, tmp, W, H) && toJpg(tmp, out)) { made++; manifest[id] = styleHash(id); }
  else { failed.push(id); if (fs.existsSync(tmp)) fs.unlinkSync(tmp); }
}

/* ---------- 3. 默认图（首页首屏，锁一套克制配色，缩略图里更耐看） ---------- */
const defOut = path.join(OG_DIR, 'default.jpg');
const defSrc = path.join(ROOT, 'index.html');
const defHash = fingerprint([fs.readFileSync(defSrc, 'utf8'), String(cssStamp)]);
if (force || !fs.existsSync(defOut) || manifest.__default !== defHash) {
  const tmp = path.join(OG_DIR, '_default.png');
  const url = 'file://' + defSrc + '?style=editorial';
  if (chromeShot(url, tmp, W, H) && toJpg(tmp, defOut)) { made++; manifest.__default = defHash; }
  else if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

if (failed.length) console.log(`  ! 以下风格未生成社交图：${failed.join(', ')}`);
console.log(
  `✓ favicon ${iconCount} 个文件 | 社交图新增 ${made} 张 / 复用 ${kept} 张（共 ${styleIds.length + 1} 张）`
);
