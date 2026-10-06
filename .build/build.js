const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const P = '.build/parts/';
const r = f => fs.readFileSync(P + f, 'utf8');
const ASSETS = 'assets';

fs.rmSync(ASSETS, { recursive: true, force: true });
fs.mkdirSync(ASSETS, { recursive: true });

const written = [];

function writeAsset(name, buf) {
  const hash = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);
  const dot = name.lastIndexOf('.');
  const hashed = name.slice(0, dot) + '.' + hash + name.slice(dot);
  fs.writeFileSync(path.join(ASSETS, hashed), buf);
  written.push([hashed, buf.length]);
  return ASSETS + '/' + hashed;
}
const EXT = { 'image/webp':'.webp', 'image/png':'.png', 'image/jpeg':'.jpg' };

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
  ASTHETIC:  writeDataUri('thumb-asthetic',  r('thumb_asthetic.txt')),
  IMPERIUS:  writeDataUri('thumb-imperius',  r('thumb_imperius.txt')),
  FYRE:      writeDataUri('thumb-fyre',      r('thumb_fyre.txt')),
  NEPTUNITY: writeDataUri('thumb-neptunity', r('thumb_neptunity.txt')),
  SOLARYN:   writeDataUri('thumb-solaryn',   r('thumb_solaryn.txt'))
};

const discord = r('discord_svg.txt').trim();

let css  = fs.readFileSync('.build/styles.css', 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*([{};,>])\s*/g, '$1')
  .replace(/:\s+/g, ':')
  .replace(/;}/g, '}')
  .trim();
let html = fs.readFileSync('.build/body.html', 'utf8');
let js   = fs.readFileSync('.build/app.js', 'utf8');
const quizData = r('quiz-data.js');

const bundleUrl = writeAsset('skinview3d.js', Buffer.from(r('skinview3d.js'), 'utf8'));
const quizUrl   = writeAsset('quiz-data.js',  Buffer.from(quizData, 'utf8'));

html = html.replace(/__SEGS_(\d+)__/g, (_, n) => {
  const filled = parseInt(n, 10);
  let out = '';
  for (let i = 1; i <= 10; i++) out += '<i' + (i <= filled ? ' class="on"' : '') + '></i>';
  return out;
});

html = html
  .replace(/__DISCORD_SVG__/g, discord)
  .replace(/__AVATAR__/g, avatarUrl)
  .replace(/__THUMB_OVERCLOCK__/g, thumbs.OVERCLOCK)
  .replace(/__THUMB_ASTHETIC__/g, thumbs.ASTHETIC)
  .replace(/__THUMB_IMPERIUS__/g, thumbs.IMPERIUS)
  .replace(/__THUMB_FYRE__/g, thumbs.FYRE)
  .replace(/__THUMB_NEPTUNITY__/g, thumbs.NEPTUNITY)
  .replace(/__THUMB_SOLARYN__/g, thumbs.SOLARYN);

js = js
  .replace('__SKIN_URL__', skinUrl)
  .replace('__BUNDLE_URL__', bundleUrl)
  .replace('__QUIZ_URL__', quizUrl);

const appUrl = writeAsset('app.js', Buffer.from(js, 'utf8'));

const faviconUrl = writeDataUri('favicon', r('favicon.txt'));

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
  '<meta name="description" content="Kisskorboy — Minecraft server developer &amp; website developer. Plugin development, server administration, web development and staff work for Solaryn, Overclock, Asthetic Game, Imperius Community, FyreMC and Neptunity.">',
  '<meta name="theme-color" content="#08090b">',
  '<title>Kisskorboy | Minecraft &amp; Website Developer</title>',
  '<link rel="canonical" href="https://kisskorboy.hu/">',
  '<meta property="og:type" content="website">',
  '<meta property="og:site_name" content="kisskorboy.hu">',
  '<meta property="og:url" content="https://kisskorboy.hu/">',
  '<meta property="og:title" content="Kisskorboy | Minecraft &amp; Website Developer">',
  '<meta property="og:description" content="Minecraft server development, plugin work, server administration and websites — Solaryn, Overclock, Asthetic Game, Imperius Community, FyreMC and Neptunity.">',
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
    sameAs: ['https://discord.com/users/kisskorboy', 'https://www.solaryn.hu', 'https://overclockgame.hu', 'https://asthetic.hu', 'https://dc.imperius.hu']
  }) + '<\/script>',
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '<link rel="preload" as="image" href="' + avatarUrl + '" fetchpriority="high">',
  '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">',
  '<script>' + themeBoot + '<\/script>',
  '<style>',
  css,
  '</style>',
  '</head>'
].join('\n');

const MISSING_EN = 'This copy of index.html is not next to its <code>assets\\/<\\/code> folder, so the styles you see are all it can load. ' +
  "Open index.html from the project folder, or visit <a href='https:\\/\\/kisskorboy.hu\\/'>kisskorboy.hu<\\/a>.";
const MISSING_HU = 'Ez az index.html nincs az <code>assets\\/<\\/code> mappája mellett. Nyisd meg a projektmappából, vagy nézd meg a ' +
  "<a href='https:\\/\\/kisskorboy.hu\\/'>kisskorboy.hu<\\/a> oldalt.";
const BROKEN_EN = 'The page loaded but its script did not start. A reload usually fixes it.';
const BROKEN_HU = 'Az oldal betöltött, de a szkriptje nem indult el. Általában elég újratölteni.';

const bootGuard =
  '(function(){var shown=false;' +
  'function warn(orphan){if(shown||document.body.classList.contains("js-on"))return;shown=true;' +
  'var d=document.createElement("div");d.className="boot-warn";' +
  'd.innerHTML=orphan' +
  '?("<b>assets\\/ not found<\\/b><span>' + MISSING_EN + '<\\/span><span lang=\\"hu\\">' + MISSING_HU + '<\\/span>")' +
  ':("<b>page did not finish loading<\\/b><span>' + BROKEN_EN + '<\\/span><span lang=\\"hu\\">' + BROKEN_HU + '<\\/span>");' +
  'document.body.appendChild(d);}' +
  'function orphaned(){var i=document.images[0];return !!i&&i.complete&&i.naturalWidth===0;}' +
  'var s=document.getElementById("app-bundle");' +
  'if(s)s.addEventListener("error",function(){warn(true);});' +
  'setTimeout(function(){warn(orphaned());},6000);})();';

const out = head + '\n' + html +
  '\n<script id="app-bundle" src="' + appUrl + '" defer><\/script>' +
  '\n<script>' + bootGuard + '<\/script>\n</body>\n</html>\n';

fs.writeFileSync('index.html', out);

const kb = n => (n / 1024).toFixed(1) + ' kB';
console.log('index.html            ' + kb(Buffer.byteLength(out)));
written.forEach(([n, s]) => console.log('assets/' + n.padEnd(22) + kb(s)));

// sanity checks
const checks = [
  ['no placeholders left', !/__(SKIN_URL|AVATAR|DISCORD_SVG|THUMB_[A-Z]+|QUIZ_URL|BUNDLE_URL)__/.test(out + js)],
  ['5 proj cards', (out.match(/class="card proj-card"/g) || []).length === 5],
  ['asthetic is the second project',
    (out.match(/class="card proj-card"[^>]*href="([^"]+)"/g) || [])[1] === 'class="card proj-card" data-tilt href="https://asthetic.hu"'],
  ['solaryn is the main project, above the list',
    out.indexOf('class="card proj-main"') > -1 && out.indexOf('class="card proj-main"') < out.indexOf('class="proj-list"')],
  ['solaryn countdown target', out.includes('data-open="2026-10-23T00:00:00+02:00"')],
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
