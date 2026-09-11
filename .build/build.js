const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const P = '.build/parts/';
const r = f => fs.readFileSync(P + f, 'utf8');
const ASSETS = 'assets';

/* ------------------------------------------------------------------
   Assets are written next to index.html instead of being inlined as
   base64. Inlining cost us twice: the browser had to download the
   whole 1.1 MB document before it could paint anything, and none of
   the images or the 3D bundle could be cached between visits.
   ------------------------------------------------------------------ */
/* assets/ holds nothing but build output, so it is rebuilt from scratch
   — otherwise every content hash change would leave an orphan behind. */
fs.rmSync(ASSETS, { recursive: true, force: true });
fs.mkdirSync(ASSETS, { recursive: true });

const written = [];
/* Content-hashed names, so a deploy can never serve a visitor a fresh
   index.html against a stale cached script. */
function writeAsset(name, buf) {
  const hash = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);
  const dot = name.lastIndexOf('.');
  const hashed = name.slice(0, dot) + '.' + hash + name.slice(dot);
  fs.writeFileSync(path.join(ASSETS, hashed), buf);
  written.push([hashed, buf.length]);
  return ASSETS + '/' + hashed;
}
const EXT = { 'image/webp':'.webp', 'image/png':'.png', 'image/jpeg':'.jpg' };
/* The part files carry their own media type, so the artwork can be
   re-encoded (see tools/optimize-images.html) without touching this. */
function writeDataUri(base, dataUri) {
  const m = /^data:([^;]+);base64,(.*)$/s.exec(dataUri.trim());
  if (!m) throw new Error('not a base64 data URI: ' + base);
  const ext = EXT[m[1]];
  if (!ext) throw new Error('unsupported media type ' + m[1] + ' for ' + base);
  return writeAsset(base + ext, Buffer.from(m[2], 'base64'));
}

const avatarUrl = writeDataUri('avatar', r('avatar.txt'));
const skinUrl   = writeDataUri('skin',    r('skin.txt'));
const thumbs = {
  OVERCLOCK: writeDataUri('thumb-overclock', r('thumb_overclock.txt')),
  IMPERIUS:  writeDataUri('thumb-imperius',  r('thumb_imperius.txt')),
  FYRE:      writeDataUri('thumb-fyre',      r('thumb_fyre.txt')),
  NEPTUNITY: writeDataUri('thumb-neptunity', r('thumb_neptunity.txt'))
};

const discord = r('discord_svg.txt').trim();

let css  = fs.readFileSync('.build/styles.css', 'utf8');
let html = fs.readFileSync('.build/body.html', 'utf8');
let js   = fs.readFileSync('.build/app.js', 'utf8');
const quizData = r('quiz-data.js');

/* the 3D skin bundle is ~470 kB of three.js — it only loads once the
   skin card is close to the viewport, so it never blocks first paint */
const bundleUrl = writeAsset('skinview3d.js', Buffer.from(r('skinview3d.js'), 'utf8'));
const quizUrl   = writeAsset('quiz-data.js',  Buffer.from(quizData, 'utf8'));

html = html
  .replace('__DISCORD_SVG__', discord)
  .replace('__AVATAR__', avatarUrl)
  .replace('__THUMB_OVERCLOCK__', thumbs.OVERCLOCK)
  .replace('__THUMB_IMPERIUS__', thumbs.IMPERIUS)
  .replace('__THUMB_FYRE__', thumbs.FYRE)
  .replace('__THUMB_NEPTUNITY__', thumbs.NEPTUNITY);

js = js
  .replace('__SKIN_URL__', skinUrl)
  .replace('__BUNDLE_URL__', bundleUrl)
  .replace('__QUIZ_URL__', quizUrl);

const appUrl = writeAsset('app.js', Buffer.from(js, 'utf8'));

/* The avatar doubles as the tab icon, but cut down to 64px (11 kB)
   rather than the full 78 kB photo the page used to embed twice. */
const faviconUrl = writeDataUri('favicon', r('favicon.txt'));

/* Theme runs before first paint so a light-theme visitor never sees a
   dark flash while the deferred bundle is still on its way. */
const themeBoot =
  '(function(){var t="dark";try{var s=localStorage.getItem("kk-theme");' +
  'if(s==="light"||s==="dark")t=s;}catch(e){}' +
  'document.documentElement.setAttribute("data-theme",t);})();';

const head = [
  '<!DOCTYPE html>',
  '<html lang="en">',
  '<head>',
  '<meta charset="UTF-8">',
  '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
  '<meta name="description" content="Kisskorboy — Minecraft server developer &amp; website developer. Plugin development, server administration, web development and staff work for Overclock, Imperius Community, FyreMC and Neptunity.">',
  '<meta name="theme-color" content="#08090b">',
  '<title>Kisskorboy | Minecraft &amp; Website Developer</title>',
  '<link rel="canonical" href="https://kisskorboy.hu/">',
  '<meta property="og:type" content="website">',
  '<meta property="og:site_name" content="kisskorboy.hu">',
  '<meta property="og:url" content="https://kisskorboy.hu/">',
  '<meta property="og:title" content="Kisskorboy | Minecraft &amp; Website Developer">',
  '<meta property="og:description" content="Minecraft server development, plugin work, server administration and websites — Overclock, Imperius Community, FyreMC and Neptunity.">',
  '<meta property="og:image" content="https://kisskorboy.hu/og.jpg">',
  '<meta name="twitter:card" content="summary_large_image">',
  '<meta name="twitter:title" content="Kisskorboy | Minecraft &amp; Website Developer">',
  '<meta name="twitter:description" content="Minecraft server development, plugin work, server administration and websites.">',
  '<meta name="twitter:image" content="https://kisskorboy.hu/og.jpg">',
  '<link rel="icon" type="image/png" sizes="64x64" href="' + faviconUrl + '">',
  '<link rel="apple-touch-icon" href="' + faviconUrl + '">',
  '<script type="application/ld+json">' + JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Kisskorboy',
    url: 'https://kisskorboy.hu/',
    jobTitle: 'Minecraft server developer & website developer',
    knowsAbout: ['Minecraft plugin development', 'Minecraft server administration', 'Web development', 'Backend systems', 'Community moderation'],
    knowsLanguage: ['hu', 'en'],
    sameAs: ['https://discord.com/users/kisskorboy', 'https://overclockgame.hu', 'https://dc.imperius.hu']
  }) + '<\/script>',
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '<link rel="preload" as="image" href="' + avatarUrl + '" fetchpriority="high">',
  '<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">',
  '<script>' + themeBoot + '<\/script>',
  '<style>',
  css,
  '</style>',
  '</head>'
].join('\n');

/* If the bundle never boots, the page is not broken so much as
   orphaned: index.html was opened away from its assets/ folder (a
   downloaded copy, a file preview that inlines the document). Say so,
   instead of leaving a page with blank bars and broken images. */
const bootGuard =
  'setTimeout(function(){' +
  'if(document.body.classList.contains("js-on"))return;' +
  'var d=document.createElement("div");d.className="boot-warn";' +
  'd.innerHTML="<b>assets\\/ not found<\\/b>" +' +
  '"<span>This copy of index.html is not next to its <code>assets\\/<\\/code> folder, so the styles you see are all it can load. ' +
  'Open index.html from the project folder, or visit <a href=\\"https:\\/\\/kisskorboy.hu\\/\\">kisskorboy.hu<\\/a>.<\\/span>" +' +
  '"<span lang=\\"hu\\">Ez az index.html nincs az <code>assets\\/<\\/code> mappája mellett. Nyisd meg a projektmappából, vagy nézd meg a <a href=\\"https:\\/\\/kisskorboy.hu\\/\\">kisskorboy.hu<\\/a> oldalt.<\\/span>";' +
  'document.body.appendChild(d);},2500);';

const out = head + '\n' + html +
  '\n<script src="' + appUrl + '" defer><\/script>' +
  '\n<script>' + bootGuard + '<\/script>\n</body>\n</html>\n';

fs.writeFileSync('index.html', out);

const kb = n => (n / 1024).toFixed(1) + ' kB';
console.log('index.html            ' + kb(Buffer.byteLength(out)));
written.forEach(([n, s]) => console.log('assets/' + n.padEnd(22) + kb(s)));

// sanity checks
const checks = [
  ['no placeholders left', !/__(SKIN_URL|AVATAR|DISCORD_SVG|THUMB_[A-Z]+|QUIZ_URL|BUNDLE_URL)__/.test(out + js)],
  ['4 proj cards', (out.match(/class="card proj-card"/g) || []).length === 4],
  ['quiz section', out.includes('id="quiz"')],
  ['app deferred, not inlined', /src="assets\/app\.[0-9a-f]{8}\.js" defer/.test(out) && !out.includes('var I18N')],
  ['every asset is content hashed', written.every(([n]) => /\.[0-9a-f]{8}\.[a-z0-9]+$/.test(n))],
  ['skin bundle is external only', !out.includes('skinview3d.SkinViewer')],
  ['quiz bank is external only', !out.includes('QUIZ_BANK = {')],
  ['index under 120 kB', Buffer.byteLength(out) < 120 * 1024]
];
let failed = 0;
checks.forEach(([n, ok]) => { if (!ok) failed++; console.log((ok ? 'OK  ' : 'FAIL') + '  ' + n); });
if (failed) process.exitCode = 1;
