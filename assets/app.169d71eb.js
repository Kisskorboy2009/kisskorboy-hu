(function(){
'use strict';

var body = document.body;
var root = document.documentElement;
var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var finePointer = window.matchMedia('(pointer:fine)').matches;

/* ============================================================
   0. Effect budget

   Everything decorative on this page is opt-in per tier. A weak
   machine starts with the cheap tier from its own hardware hints,
   and any machine that then fails to hold a frame rate gets demoted
   while it is running — so the page degrades instead of stuttering.
   ============================================================ */
var perf = (function(){
  var cores = navigator.hardwareConcurrency || 4;
  var mem = navigator.deviceMemory || 4;
  var small = window.innerWidth < 760;
  var weak = reduced || cores <= 4 || mem <= 4 || (small && cores <= 6);
  return {
    low: weak,
    // capped separately: a retina phone paints 4x the pixels for the
    // same canvas, and the starfield is the most fill-heavy thing here
    dpr: weak ? 1 : Math.min(window.devicePixelRatio || 1, 1.75),
    cubes: weak ? (small ? 8 : 14) : (small ? 14 : 24),
    dust: weak ? (small ? 24 : 40) : (small ? 50 : 100),
    tilt: !weak && !reduced && finePointer
  };
})();
if (perf.low) body.classList.add('perf-low');

/* Demote once if the page cannot keep up. Sampled over real frames
   rather than a timer, and only for the first few seconds, so a
   background tab or a one-off hitch never triggers it. */
var perfDemote = null;
(function(){
  if (perf.low) return;
  var frames = 0, slow = 0, t0 = 0, done = false;
  perfDemote = function(now){
    if (done) return;
    if (!t0){ t0 = now; return; }
    var dt = now - t0;
    t0 = now;
    if (dt > 34) slow++;            // slower than ~30fps
    if (++frames < 150) return;     // ~2.5s of frames
    done = true;
    perfDemote = null;
    if (slow / frames > 0.3){
      perf.low = true;
      perf.tilt = false;
      body.classList.add('perf-low');
      if (typeof trimBackground === 'function') trimBackground();
      // drop the per-frame tilt work and let any lifted card settle back
      updateHoverTilt = null;
      var lifted = document.querySelectorAll('[data-tilt], .btn, .copy-btn');
      for (var i = 0; i < lifted.length; i++) lifted[i].style.transform = '';
    }
  };
})();

/* ============================================================
   1. i18n  (default: English)
   ============================================================ */
var I18N = {
  en: {
    'meta.title':'Kisskorboy | Minecraft & Website Developer',
    'nav.skills':'Skills','nav.projects':'Projects','nav.stack':'Stack','nav.quiz':'Tree of Knowledge','nav.contact':'Contact',
    'hero.role1':'Minecraft Developer',
    'hero.role2':'Website Developer',
    'hero.tagline':'Server administration, plugin configuration and staff work across Hungarian Minecraft networks — plus the websites and dashboards behind them.',
    'hero.cta1':'See my work',
    'hero.cta2':'Get in touch',
    'stat.servers':'Networks','stat.owned':'Owned','stat.staff':'Staff roles',
    'label.skills':'SKILLS',
    'skill.plugin':'Plugin development','skill.frontend':'Frontend','skill.backend':'Backend','skill.server':'Server administration',
    'label.skin':'MINECRAFT SKIN',
    'skin.hint':'Drag to rotate · Scroll to zoom',
    'skin.sub':'My in-game skin — worn across every server I staff or own.',
    'label.projects':'PROJECTS',
    'badge.owner':'Owner','badge.former':'Former Staff',
    'proj.fyre.title':'FyreMC Team / Configurator',
    'proj.fyre.sub':'Staff membership & plugin configuration',
    'proj.nept.title':'Neptunity Admin',
    'proj.nept.sub':'Server administration & moderation',
    'label.whatido':'WHAT I DO',
    'whatido.h2':'Minecraft servers and the web around them.',
    'whatido.p':'From day-to-day admin work to the plugins, panels and websites behind the scenes.',
    'do.1.h':'Plugin Development','do.1.p':'From minigames to admin tools — if a server needs custom logic, I can build it.',
    'do.2.h':'Server Administration','do.2.p':'Permissions, backups, updates and uptime — the day-to-day that keeps a server alive.',
    'do.3.h':'Staff & Team Management','do.3.p':'Recruiting, training and coordinating staff teams across Discord and in-game.',
    'do.4.h':'Community Moderation','do.4.p':'Reports, appeals, and enforcing the rules — keeping communities safe and fair.',
    'do.5.h':'Web Development','do.5.p':'Server sites, landing pages and dashboards — built clean, fast and responsive.',
    'do.6.h':'Backend Systems','do.6.p':'APIs, databases and the backend glue that keeps plugins and panels in sync.',
    'label.stack':'TECH STACK',
    'stack.h2':'Tools I build with.',
    'stack.note':'Drag to spin',
    'contact.h2':"Let's talk.",
    'contact.p':'Got a server project, a website idea, or need staff help? Hit me up on Discord.',
    'copy.hint':'Click to copy','copy.copied':'Copied!',
    'timer.label':'Staff time:','timer.day':'d','timer.ended':'(ended)',
    'label.quiz':'MINIGAME',
    'quiz.h2':'The Tree of Knowledge.',
    'quiz.p':'Answer right and climb one branch higher. Answer wrong and you fall all the way down. Fifteen levels, three difficulty tiers, three lifelines — how high do you get?',
    'quiz.level':'Level','quiz.best':'Best','quiz.streak':'Streak','quiz.tier':'Tier',
    'quiz.ready':'Ready to climb?',
    'quiz.readyp':'Fifteen questions stand between you and the top of the tree. Minecraft, code and general knowledge — mixed, shuffled and timed.',
    'quiz.start':'Start climbing','quiz.retry':'Climb again',
    'quiz.kbd':'Tip: keys 1–4 pick an answer',
    'quiz.pool':'{n} questions in the pool',
    'quiz.ll.fifty':'Halve it','quiz.ll.skip':'Swap question','quiz.ll.shield':'Shield',
    'quiz.tier.easy':'EASY','quiz.tier.medium':'MEDIUM','quiz.tier.hard':'HARD',
    'quiz.cat.mc':'MINECRAFT','quiz.cat.dev':'CODE & WEB','quiz.cat.gen':'GENERAL',
    'quiz.over.title':'Down you go…',
    'quiz.over.desc':'You made it to level {n} of {max}.',
    'quiz.over.desc0':'You fell on the very first branch. Everyone starts somewhere.',
    'quiz.timeup.title':'Out of time!',
    'quiz.timeup.desc':'The clock ran out on level {n}.',
    'quiz.win.title':'Top of the tree!',
    'quiz.win.desc':'All {max} levels cleared. Nothing left to climb.',
    'quiz.truth':'The right answer was {a}.',
    'quiz.newbest':'New personal best!',
    'quiz.shieldnote':'Your shield absorbed that one — keep going.',
    'quiz.offline':'Could not load the questions. Check your connection and try again.',
    'quiz.share':'Copy result','quiz.shared':'Copied!',
    'quiz.sharetext':'Tree of Knowledge — level {n}/{max} ({tier}) · kisskorboy.hu',
    'quiz.sharewin':'Tree of Knowledge — cleared all {max} levels! · kisskorboy.hu',
    'quiz.hot':'On fire!',
    'dot.top':'TOP','dot.skills':'SKILLS','dot.projects':'PROJECTS','dot.what-i-do':'WHAT I DO','dot.stack':'STACK','dot.quiz':'MINIGAME','dot.contact':'CONTACT'
  },
  hu: {
    'meta.title':'Kisskorboy | Minecraft & Weboldal Fejlesztő',
    'nav.skills':'Képességek','nav.projects':'Projektek','nav.stack':'Eszközök','nav.quiz':'Tudás fája','nav.contact':'Kapcsolat',
    'hero.role1':'Minecraft Fejlesztő',
    'hero.role2':'Weboldal Fejlesztő',
    'hero.tagline':'Szerver adminisztráció, plugin konfiguráció és staff munka magyar Minecraft hálózatoknál — valamint a mögöttük álló weboldalak és vezérlőpultok.',
    'hero.cta1':'Munkáim megtekintése',
    'hero.cta2':'Kapcsolatfelvétel',
    'stat.servers':'Hálózat','stat.owned':'Sajátom','stat.staff':'Staff szerep',
    'label.skills':'KÉPESSÉGEK',
    'skill.plugin':'Plugin fejlesztés','skill.frontend':'Frontend','skill.backend':'Backend','skill.server':'Szerver adminisztráció',
    'label.skin':'MINECRAFT SKIN',
    'skin.hint':'Húzd a forgatáshoz · Görgess a nagyításhoz',
    'skin.sub':'A saját skinem — ezt hordom minden szerveren, ahol staff vagyok vagy tulajdonos.',
    'label.projects':'PROJEKTEK',
    'badge.owner':'Tulajdonos','badge.former':'Korábbi Staff',
    'proj.fyre.title':'FyreMC Team / Konfigurátor',
    'proj.fyre.sub':'Staff tagság és plugin konfiguráció',
    'proj.nept.title':'Neptunity Admin',
    'proj.nept.sub':'Szerver adminisztráció és moderáció',
    'label.whatido':'AMIVEL FOGLALKOZOM',
    'whatido.h2':'Minecraft szerverek és a körülöttük lévő web.',
    'whatido.p':'A napi admin munkától a háttérben futó pluginokig, panelekig és weboldalakig.',
    'do.1.h':'Plugin Fejlesztés','do.1.p':'Minijátékoktól az admin eszközökig — ha egy szervernek egyedi logika kell, megcsinálom.',
    'do.2.h':'Szerver Adminisztráció','do.2.p':'Jogosultságok, mentések, frissítések és uptime — a napi munka, ami életben tartja a szervert.',
    'do.3.h':'Staff és Csapatkezelés','do.3.p':'Staff csapatok toborzása, betanítása és koordinálása Discordon és játékon belül.',
    'do.4.h':'Közösségi Moderáció','do.4.p':'Bejelentések, fellebbezések és a szabályok betartatása — biztonságos, fair közösség.',
    'do.5.h':'Webfejlesztés','do.5.p':'Szerver oldalak, landing page-ek és vezérlőpultok — tisztán, gyorsan, reszponzívan.',
    'do.6.h':'Backend Rendszerek','do.6.p':'API-k, adatbázisok és a backend, ami szinkronban tartja a pluginokat és paneleket.',
    'label.stack':'TECHNOLÓGIÁK',
    'stack.h2':'Amivel dolgozom.',
    'stack.note':'Húzd a forgatáshoz',
    'contact.h2':'Beszéljünk.',
    'contact.p':'Van egy szerver projekted, egy weboldal ötleted, vagy staff segítség kell? Írj Discordon.',
    'copy.hint':'Kattints a másoláshoz','copy.copied':'Másolva!',
    'timer.label':'Staff idő:','timer.day':'n','timer.ended':'(vége)',
    'label.quiz':'MINIJÁTÉK',
    'quiz.h2':'A tudás fája.',
    'quiz.p':'Válaszolj helyesen, és egy ággal feljebb mászol. Ha rontasz, egészen az aljáig zuhansz. Tizenöt szint, három nehézségi fokozat, három segítség — meddig jutsz?',
    'quiz.level':'Szint','quiz.best':'Legjobb','quiz.streak':'Sorozat','quiz.tier':'Szakasz',
    'quiz.ready':'Kezdhetjük a mászást?',
    'quiz.readyp':'Tizenöt kérdés választ el a fa tetejétől. Minecraft, kód és általános műveltség — keverve, véletlen sorrendben, órával.',
    'quiz.start':'Mászás indítása','quiz.retry':'Új próbálkozás',
    'quiz.kbd':'Tipp: az 1–4 billentyűkkel is válaszolhatsz',
    'quiz.pool':'{n} kérdés a készletben',
    'quiz.ll.fifty':'Felezés','quiz.ll.skip':'Kérdéscsere','quiz.ll.shield':'Pajzs',
    'quiz.tier.easy':'KÖNNYŰ','quiz.tier.medium':'KÖZEPES','quiz.tier.hard':'NEHÉZ',
    'quiz.cat.mc':'MINECRAFT','quiz.cat.dev':'KÓD & WEB','quiz.cat.gen':'ÁLTALÁNOS',
    'quiz.over.title':'Lezuhantál…',
    'quiz.over.desc':'A(z) {n}. szintig jutottál a(z) {max}-ből.',
    'quiz.over.desc0':'Mindjárt az első ágon leestél. Valahol mindenki elkezdi.',
    'quiz.timeup.title':'Lejárt az idő!',
    'quiz.timeup.desc':'Az óra a(z) {n}. szinten futott ki.',
    'quiz.win.title':'A fa tetején!',
    'quiz.win.desc':'Mind a(z) {max} szint megvan. Nincs hova feljebb mászni.',
    'quiz.truth':'A helyes válasz: „{a}”.',
    'quiz.newbest':'Új egyéni rekord!',
    'quiz.shieldnote':'A pajzsod elnyelte ezt — mehetsz tovább.',
    'quiz.offline':'Nem sikerült betölteni a kérdéseket. Nézd meg a kapcsolatot, és próbáld újra.',
    'quiz.share':'Eredmény másolása','quiz.shared':'Másolva!',
    'quiz.sharetext':'Tudás fája — {n}/{max}. szint ({tier}) · kisskorboy.hu',
    'quiz.sharewin':'Tudás fája — mind a(z) {max} szint megvan! · kisskorboy.hu',
    'quiz.hot':'Ez az!',
    'dot.top':'ELEJE','dot.skills':'KÉPESSÉGEK','dot.projects':'PROJEKTEK','dot.what-i-do':'MIT CSINÁLOK','dot.stack':'ESZKÖZÖK','dot.quiz':'MINIJÁTÉK','dot.contact':'KAPCSOLAT'
  }
};

var lang = 'en';
try { var saved = localStorage.getItem('kk-lang'); if (saved === 'hu' || saved === 'en') lang = saved; } catch (e) {}

// the quiz renders its own text from the bank, so it needs a callback
// rather than the [data-i18n] sweep — set once the minigame boots
var quizRelang = null;

function t(key){
  var d = I18N[lang];
  return (d && d[key] !== undefined) ? d[key] : (I18N.en[key] !== undefined ? I18N.en[key] : key);
}

function applyLang(next){
  lang = (next === 'hu') ? 'hu' : 'en';
  try { localStorage.setItem('kk-lang', lang); } catch (e) {}
  document.documentElement.setAttribute('lang', lang);
  body.setAttribute('data-lang', lang);
  document.title = t('meta.title');

  var nodes = document.querySelectorAll('[data-i18n]');
  for (var i = 0; i < nodes.length; i++){
    var key = nodes[i].getAttribute('data-i18n');
    nodes[i].textContent = t(key);
  }
  var btns = document.querySelectorAll('[data-lang-set]');
  for (var j = 0; j < btns.length; j++){
    btns[j].classList.toggle('on', btns[j].getAttribute('data-lang-set') === lang);
  }
  var dotBtns = document.querySelectorAll('.dots button');
  for (var k = 0; k < dotBtns.length; k++){
    dotBtns[k].setAttribute('data-label', t('dot.' + dotBtns[k].getAttribute('data-target')));
  }
  updateTimers();
  if (copyHint) copyHint.textContent = t('copy.hint');
  if (quizRelang) quizRelang();
}

var langSwitch = document.getElementById('langSwitch');
langSwitch.addEventListener('click', function(e){
  var btn = e.target.closest('[data-lang-set]');
  if (!btn) return;
  applyLang(btn.getAttribute('data-lang-set'));
});

/* ============================================================
   2. Theme
   ============================================================ */
/* The attribute itself is set by the inline bootstrap in <head>, before
   first paint — this only handles the toggle from here on. */
var onThemeChange = null;

document.getElementById('themeToggle').addEventListener('click', function(){
  var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('kk-theme', next); } catch (e) {}
  if (onThemeChange) onThemeChange();
});

/* ============================================================
   3. Rotating role (3D flip): Minecraft Dev <-> Website Dev
   ============================================================ */
(function(){
  if (reduced) return;
  var inner = document.getElementById('rolesInner');
  var flipped = false;
  setInterval(function(){
    flipped = !flipped;
    inner.classList.toggle('flip', flipped);
  }, 3400);
})();

/* ============================================================
   4. 3D tech ring — hand-driven: grab and spin it, it keeps the
      momentum, eases back to a slow idle drift, and slows right
      down while the pointer is over it so chips are easy to hit.
   ============================================================ */
var spinRings = null;
(function(){
  var items = ['Paper API','Spigot','Velocity','MySQL','MariaDB','SQLite','Redis','Java 17','Java 21','JDA','Discord.js','HTML / CSS / JS','Git'];
  var stage = document.querySelector('.ring-stage');
  var radius = window.innerWidth < 760 ? 250 : 380;
  var half = Math.ceil(items.length / 2);
  var DEG = Math.PI / 180;
  var IDLE = reduced ? 0 : 0.075;   // degrees per frame when nobody is touching it
  var rows = [];

  function build(el, list, dir, tilt){
    var step = 360 / list.length;
    var html = '';
    for (var i = 0; i < list.length; i++){
      html += '<span class="chip" style="transform:rotateY(' + (i * step).toFixed(2) +
              'deg) translateZ(' + radius + 'px)">' + list[i] + '</span>';
    }
    el.innerHTML = html;
    rows.push({
      el: el,
      dir: dir,
      tilt: tilt,
      chips: [].slice.call(el.children),
      base: list.map(function(_, i){ return i * step; })
    });
  }
  build(document.getElementById('techRingA'), items.slice(0, half), 1, -4);
  build(document.getElementById('techRingB'), items.slice(half), -1, -4);

  var angle = 0, vel = IDLE, hovering = false, dragging = false, lastX = 0, dragVel = 0;

  stage.addEventListener('pointerenter', function(){ hovering = true; });
  stage.addEventListener('pointerleave', function(){ hovering = false; });

  stage.addEventListener('pointerdown', function(e){
    dragging = true; dragVel = 0; lastX = e.clientX;
    stage.classList.add('dragging');
    try { stage.setPointerCapture(e.pointerId); } catch (err) {}
  });
  stage.addEventListener('pointermove', function(e){
    if (!dragging) return;
    var dx = (e.clientX - lastX) * 0.28;
    lastX = e.clientX;
    angle += dx;
    dragVel = dx;
  });
  function endDrag(){
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('dragging');
    // hand the throw over to the idle spin, clamped so it never whips
    vel = Math.max(-6, Math.min(6, dragVel));
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  spinRings = function(){
    if (!dragging){
      var target = hovering ? IDLE * 0.15 : IDLE;
      // fast throws decay quickly, then settle onto the idle drift
      vel += (target - vel) * (Math.abs(vel) > IDLE * 2 ? 0.04 : 0.08);
      angle += vel;
    }
    if (angle > 3600 || angle < -3600) angle = angle % 360;

    for (var r = 0; r < rows.length; r++){
      var row = rows[r];
      var a = angle * row.dir;
      row.el.style.transform = 'rotateX(' + row.tilt + 'deg) rotateY(' + a.toFixed(2) + 'deg)';

      var best = -1, bestFacing = 0.72;   // only one chip per row is ever "front"
      for (var i = 0; i < row.chips.length; i++){
        var facing = Math.cos((a + row.base[i]) * DEG);   // 1 = straight at the camera
        var chip = row.chips[i];
        var o = (facing + 0.25) / 1.25;
        if (o < 0) o = 0; else if (o > 1) o = 1;
        chip.style.opacity = (0.12 + o * 0.88).toFixed(3);
        chip.style.pointerEvents = facing > 0.6 ? 'auto' : 'none';
        if (facing > bestFacing){ bestFacing = facing; best = i; }
      }
      for (var k = 0; k < row.chips.length; k++){
        var isFront = (k === best);
        if (isFront !== row.chips[k].__front){
          row.chips[k].classList.toggle('front', isFront);
          row.chips[k].__front = isFront;
        }
      }
    }
  };
})();

/* ============================================================
   5. Slide dots
   ============================================================ */
var slides = [].slice.call(document.querySelectorAll('[data-slide]'));
var dotsWrap = document.getElementById('slideDots');
(function(){
  var html = '';
  for (var i = 0; i < slides.length; i++){
    var id = slides[i].getAttribute('data-slide');
    html += '<button type="button" data-target="' + id + '" data-label=""></button>';
  }
  dotsWrap.innerHTML = html;
  var total = document.getElementById('slideTotal');
  if (total) total.textContent = ('0' + slides.length).slice(-2);
  dotsWrap.addEventListener('click', function(e){
    var b = e.target.closest('button');
    if (!b) return;
    var idx = dotButtons.indexOf(b);
    if (idx > -1) goToSlide(idx);
  });
})();
var dotButtons = [].slice.call(dotsWrap.querySelectorAll('button'));

/* ============================================================
   6. Scroll engine: depth transforms, progress, active dot
   ============================================================ */
var scene = document.querySelector('.scene');
var depthEls = [].slice.call(document.querySelectorAll('[data-depth]'));
var progressBar = document.getElementById('progressBar');
var scrollVelocity = 0;
var lastScrollY = window.pageYOffset;
var needsScrollUpdate = true;
var depthTops = [];
var slideTops = [];
var staggerEls = [].slice.call(document.querySelectorAll('[data-stagger]'));
var staggerTops = [];
var slideNum = document.getElementById('slideNum');
var activeSlide = -1;

// Layout offset, unaffected by the 3D transforms we apply — using
// getBoundingClientRect() here would feed each element's own transform
// back into its progress value.
function layoutTop(el){
  var y = 0;
  while (el){ y += el.offsetTop; el = el.offsetParent; }
  return y;
}

function measure(){
  depthTops = depthEls.map(layoutTop);
  slideTops = slides.map(layoutTop);
  staggerTops = staggerEls.map(layoutTop);
  needsScrollUpdate = true;
}

function onScroll(){ needsScrollUpdate = true; }
window.addEventListener('scroll', onScroll, { passive: true });
var resizeTimer = null;
window.addEventListener('resize', function(){
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(measure, 120);
});
window.addEventListener('load', function(){ measure(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

function updateScroll(){
  var y = window.pageYOffset;
  scrollVelocity += ((y - lastScrollY) - scrollVelocity) * 0.25;
  lastScrollY = y;

  if (!needsScrollUpdate) return;
  needsScrollUpdate = false;

  var vh = window.innerHeight;

  // keep the vanishing point at the centre of the viewport, so translateZ
  // reads as depth instead of sliding elements toward a fixed page point
  scene.style.perspectiveOrigin = '50% ' + Math.round(y + vh * 0.5) + 'px';

  if (!reduced){
    for (var i = 0; i < depthEls.length; i++){
      var top = depthTops[i] - y;
      var p = (vh + 80 - top) / (vh * 0.55);
      if (p < 0) p = 0; else if (p > 1) p = 1;
      depthEls[i].style.setProperty('--p', p.toFixed(3));
    }
  }

  // card groups fade in one after another once their block is on screen
  for (var s = 0; s < staggerEls.length; s++){
    if (!staggerEls[s].classList.contains('in') && staggerTops[s] - y < vh * 0.88){
      staggerEls[s].classList.add('in');
    }
  }

  var max = document.documentElement.scrollHeight - vh;
  progressBar.style.width = (max > 0 ? Math.min(y / max, 1) * 100 : 0).toFixed(2) + '%';

  var active = 0;
  for (var j = 0; j < slides.length; j++){
    if (slideTops[j] - y <= vh * 0.42) active = j;
  }
  if (active !== activeSlide){
    activeSlide = active;
    for (var k = 0; k < dotButtons.length; k++){
      dotButtons[k].classList.toggle('on', k === active);
    }
    if (slideNum) slideNum.textContent = pad(active + 1);
  }
}

/* Own easing instead of scrollIntoView({behavior:'smooth'}) — the deck's
   transforms change every frame, and the browser abandons a native smooth
   scroll when the layout under it keeps moving. */
var scrollToken = 0;
function smoothScrollTo(targetY){
  var maxY = document.documentElement.scrollHeight - window.innerHeight;
  if (targetY < 0) targetY = 0;
  if (targetY > maxY) targetY = maxY;
  scrollToken++;
  if (reduced){ window.scrollTo(0, targetY); return; }
  var startY = window.pageYOffset;
  var dist = targetY - startY;
  if (Math.abs(dist) < 2) return;
  var dur = Math.min(950, 340 + Math.abs(dist) * 0.32);
  var t0 = (window.performance && performance.now) ? performance.now() : Date.now();
  var id = scrollToken;
  (function step(){
    if (id !== scrollToken) return;
    var now = (window.performance && performance.now) ? performance.now() : Date.now();
    var p = (now - t0) / dur;
    if (p > 1) p = 1;
    var e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    window.scrollTo(0, startY + dist * e);
    if (p < 1) requestAnimationFrame(step);
  })();
}
// any manual scroll wins over an in-flight animated jump
window.addEventListener('wheel', function(){ scrollToken++; }, { passive: true });
window.addEventListener('touchstart', function(){ scrollToken++; }, { passive: true });

/* Jump between slides like a deck — Page Up/Down, Home, End */
function goToSlide(i){
  if (i < 0) i = 0;
  if (i > slides.length - 1) i = slides.length - 1;
  smoothScrollTo(layoutTop(slides[i]) - 110);
}
// in-page links use the same animated jump, for the same reason
document.addEventListener('click', function(e){
  var a = e.target.closest('a[href^="#"]');
  if (!a) return;
  var el = document.getElementById(a.getAttribute('href').slice(1));
  if (!el) return;
  e.preventDefault();
  smoothScrollTo(layoutTop(el) - 110);
});

window.addEventListener('keydown', function(e){
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  var k = e.key;
  if (k === 'PageDown'){ e.preventDefault(); goToSlide(activeSlide + 1); }
  else if (k === 'PageUp'){ e.preventDefault(); goToSlide(activeSlide - 1); }
  else if (k === 'Home'){ e.preventDefault(); goToSlide(0); }
  else if (k === 'End'){ e.preventDefault(); goToSlide(slides.length - 1); }
});

/* ============================================================
   7. Pointer parallax: whole deck + nav pill + cursor glow
   ============================================================ */
var deck = document.getElementById('deck');
var navPill = document.getElementById('navPill');
var glow = document.getElementById('cursorGlow');
var pointerX = 0.5, pointerY = 0.5, curX = 0.5, curY = 0.5;
var glowX = 0, glowY = 0, glowTX = 0, glowTY = 0;

if (!reduced && finePointer){
  window.addEventListener('pointermove', function(e){
    pointerX = e.clientX / window.innerWidth;
    pointerY = e.clientY / window.innerHeight;
    glowTX = e.clientX; glowTY = e.clientY;
    if (!body.classList.contains('pointer-live')) body.classList.add('pointer-live');
  }, { passive: true });
}

function updateParallax(){
  curX += (pointerX - curX) * 0.06;
  curY += (pointerY - curY) * 0.06;
  var ry = (curX - 0.5) * 7;
  var rx = (0.5 - curY) * 4.5;
  deck.style.transform = 'rotateY(' + ry.toFixed(2) + 'deg) rotateX(' + rx.toFixed(2) + 'deg)';
  navPill.style.transform = 'rotateY(' + (ry * 0.9).toFixed(2) + 'deg) rotateX(' + (rx * 0.8).toFixed(2) + 'deg) translateZ(10px)';

  glowX += (glowTX - glowX) * 0.14;
  glowY += (glowTY - glowY) * 0.14;
  glow.style.transform = 'translate3d(' + glowX.toFixed(1) + 'px,' + glowY.toFixed(1) + 'px,0)';
}

/* ============================================================
   8. Per-card 3D tilt + sheen tracking
   ============================================================ */
/* One delegated pointer listener for the whole page instead of two per
   element. The hovered element's box is measured once on enter and the
   transform is written once per animation frame — a pointermove that
   both measures and writes forces a synchronous layout on every single
   move event, which is what used to make dense sections stutter. */
var updateHoverTilt = null;
(function(){
  if (!perf.tilt) return;

  var px = 0, py = 0, moved = false;
  var card = null, cardRect = null, cardLift = 0;
  var btn = null, btnRect = null, btnLift = 0;

  function liftFor(el){
    return el.classList.contains('proj-card') ? 34
         : el.classList.contains('do-card') ? 40
         : el.classList.contains('avatar-stage') ? 0
         : 18;
  }

  document.addEventListener('pointerover', function(e){
    var c = e.target.closest ? e.target.closest('[data-tilt]') : null;
    if (c && c !== card){
      if (card) card.style.transform = '';
      card = c; cardRect = c.getBoundingClientRect(); cardLift = liftFor(c);
    }
    var b = e.target.closest ? e.target.closest('.btn, .copy-btn') : null;
    if (b && b !== btn){
      if (btn) btn.style.transform = '';
      btn = b; btnRect = b.getBoundingClientRect();
      btnLift = b.classList.contains('copy-btn') ? 66 : 26;
    }
    moved = true;
  }, { passive: true });

  document.addEventListener('pointerout', function(e){
    if (card && !card.contains(e.relatedTarget)){ card.style.transform = ''; card = null; }
    if (btn && !btn.contains(e.relatedTarget)){ btn.style.transform = ''; btn = null; }
  }, { passive: true });

  document.addEventListener('pointermove', function(e){
    px = e.clientX; py = e.clientY; moved = true;
  }, { passive: true });

  // the cached boxes move with the page, so they are stale after a scroll
  window.addEventListener('scroll', function(){
    if (card) cardRect = card.getBoundingClientRect();
    if (btn) btnRect = btn.getBoundingClientRect();
  }, { passive: true });

  updateHoverTilt = function(){
    if (!moved) return;
    moved = false;
    if (card && cardRect.width){
      var cx2 = (px - cardRect.left) / cardRect.width;
      var cy2 = (py - cardRect.top) / cardRect.height;
      card.style.setProperty('--mx', (cx2 * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (cy2 * 100).toFixed(1) + '%');
      card.style.transform = 'translateZ(' + cardLift + 'px) rotateY(' +
        ((cx2 - 0.5) * 12).toFixed(2) + 'deg) rotateX(' + ((0.5 - cy2) * 10).toFixed(2) + 'deg)';
    }
    if (btn && btnRect.width){
      var dx = (px - (btnRect.left + btnRect.width / 2)) / btnRect.width;
      var dy = (py - (btnRect.top + btnRect.height / 2)) / btnRect.height;
      btn.style.transform =
        'translateZ(' + btnLift + 'px) translate3d(' + (dx * 12).toFixed(1) + 'px,' +
        (dy * 7 - 3).toFixed(1) + 'px,0) rotateY(' + (dx * 14).toFixed(1) +
        'deg) rotateX(' + (-dy * 12).toFixed(1) + 'deg)';
    }
  };
})();

/* ============================================================
   9. Skill bars + stat counters
   ============================================================ */
/* The meters used to fill on the load event, which on a desktop happens
   while the visitor is still looking at the hero — by the time they
   scrolled down the animation was long over. They run on arrival now,
   and the score beside each meter counts in step with its blocks
   instead of on a separate timer that drifted out of sync. */
var ROW_MS = 90;    // must match the transition-delay in the stylesheet
var SEG_MS = 42;

(function(){
  var card = document.querySelector('.skill-card');
  if (!card) return;

  var tracks = [].slice.call(card.querySelectorAll('.bar-track'));
  var scores = [].slice.call(card.querySelectorAll('[data-score]'));
  tracks.forEach(function(tr, row){ tr.style.setProperty('--row', row); });

  if (reduced) return;    // the build already wrote the meters filled

  card.classList.add('js-bars');
  scores.forEach(function(el){ el.textContent = '0/10'; });

  var played = false;
  function play(){
    if (played) return;
    played = true;
    card.classList.add('bars-in');
    scores.forEach(function(el, row){
      var target = parseInt(el.getAttribute('data-score'), 10) || 0;
      for (var k = 1; k <= target; k++){
        (function(n){
          setTimeout(function(){ el.textContent = n + '/10'; },
                     row * ROW_MS + (n - 1) * SEG_MS);
        })(k);
      }
    });
  }

  if (!('IntersectionObserver' in window)){ play(); return; }
  var io = new IntersectionObserver(function(entries){
    if (entries[0].isIntersecting){ io.disconnect(); play(); }
  }, { rootMargin: '0px 0px -12% 0px' });
  io.observe(card);
})();

/* Hero counters. These sit above the fold, so the load event is the
   right moment for them. */
(function(){
  var fired = false;
  function run(){
    if (fired) return;
    fired = true;
    var stats = document.querySelectorAll('[data-count]');
    for (var j = 0; j < stats.length; j++){
      (function(el){
        var target = parseInt(el.getAttribute('data-count'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        if (reduced){ el.textContent = target + suffix; return; }
        var n = 0;
        var step = 780 / Math.max(target, 1);
        var timer = setInterval(function(){
          n++;
          el.textContent = n + (n >= target ? suffix : '');
          if (n >= target) clearInterval(timer);
        }, step);
      })(stats[j]);
    }
  }
  if (document.readyState === 'complete') setTimeout(run, 400);
  else window.addEventListener('load', function(){ setTimeout(run, 400); });
})();

/* ============================================================
   10. Staff-time counters
   ============================================================ */
var fyreStart = new Date(2025, 7, 18, 13, 35, 0);
var fyreEnd = new Date(2026, 6, 22, 0, 0, 0);
var neptunityStart = new Date(2026, 4, 15, 15, 59, 0);
var neptunityEnd = new Date(2026, 6, 22, 0, 0, 0);

function pad(n){ return n < 10 ? '0' + n : '' + n; }

function formatStaffTime(start, end){
  var now = new Date();
  var cap = now < end ? now : end;
  var diffMs = cap - start;
  if (diffMs < 0) diffMs = 0;
  var total = Math.floor(diffMs / 1000);
  var days = Math.floor(total / 86400); total -= days * 86400;
  var hours = Math.floor(total / 3600); total -= hours * 3600;
  var minutes = Math.floor(total / 60);
  var seconds = total - minutes * 60;
  var suffix = now >= end ? ' ' + t('timer.ended') : '';
  return t('timer.label') + ' ' + days + t('timer.day') + ' ' + pad(hours) + ':' + pad(minutes) + ':' + pad(seconds) + suffix;
}

function updateTimers(){
  var a = document.getElementById('fyreTimer');
  var b = document.getElementById('neptunityTimer');
  if (a) a.textContent = formatStaffTime(fyreStart, fyreEnd);
  if (b) b.textContent = formatStaffTime(neptunityStart, neptunityEnd);
}
setInterval(updateTimers, 1000);

/* ============================================================
   11. Copy Discord tag
   ============================================================ */
var copyHint = document.getElementById('copyHint');
document.getElementById('copyDiscord').addEventListener('click', function(){
  var done = function(){
    copyHint.textContent = t('copy.copied');
    setTimeout(function(){ copyHint.textContent = t('copy.hint'); }, 1800);
  };
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText('kisskorboy').then(done, done);
  } else {
    done();
  }
});

/* ============================================================
   11a. Back-to-top button
   ============================================================ */
(function(){
  var btn = document.getElementById('toTop');
  if (!btn) return;
  btn.addEventListener('click', function(){ smoothScrollTo(0); });
  // the scroll engine already runs every frame; piggyback on its listener
  window.addEventListener('scroll', function(){
    btn.classList.toggle('on', window.pageYOffset > window.innerHeight * 0.9);
  }, { passive: true });
})();

/* ============================================================
   11b. Tree of Knowledge — quiz minigame

   Fifteen levels in three difficulty tiers. A wrong answer or an
   expired clock ends the run, unless the shield lifeline is armed.
   Questions come from QUIZ_BANK, shuffled per run so a second
   attempt is never the same climb.
   ============================================================ */
(function(){
  var tree = document.querySelector('.quiz-tree');
  if (!tree) return;

  /* The bank is a separate file so its weight never lands on first
     paint. It is prefetched as the section approaches, so pressing
     Start is instant in practice. */
  var QUIZ_URL = 'assets/quiz-data.1c560320.js';
  var bankState = 0;   // 0 idle, 1 loading, 2 ready, 3 failed
  var bankWaiting = [];

  // cb is optional: the prefetch that runs when the section approaches
  // passes none, and by then the bank may already be loaded
  function withBank(cb){
    if (bankState === 2){ if (cb) cb(true); return; }
    if (bankState === 3){ if (cb) cb(false); return; }
    if (cb) bankWaiting.push(cb);
    if (bankState === 1) return;
    bankState = 1;
    var s = document.createElement('script');
    s.src = QUIZ_URL;
    s.async = true;
    s.onload = function(){
      bankState = window.QUIZ_BANK ? 2 : 3;
      if (bankState === 2) paintPool();
      var q = bankWaiting; bankWaiting = [];
      q.forEach(function(fn){ fn(bankState === 2); });
    };
    s.onerror = function(){
      bankState = 3;
      var q = bankWaiting; bankWaiting = [];
      q.forEach(function(fn){ fn(false); });
    };
    document.head.appendChild(s);
  }

  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      if (entries[0].isIntersecting){ io.disconnect(); withBank(null); }
    }, { rootMargin: '700px 0px' });
    io.observe(tree);
  }

  var MAX_LEVEL = 15;
  // upper bound of each tier, and how many seconds that tier allows
  var TIERS = [
    { key: 'easy',   top: 5,  secs: 22 },
    { key: 'medium', top: 10, secs: 18 },
    { key: 'hard',   top: 15, secs: 14 }
  ];

  var rungsWrap = document.getElementById('treeRungs');
  var elLevel   = document.getElementById('qLevel');
  var elBest    = document.getElementById('qBest');
  var elStreak  = document.getElementById('qStreak');
  var elTier    = document.getElementById('qTier');
  var intro     = document.getElementById('quizIntro');
  var game      = document.getElementById('quizGame');
  var over      = document.getElementById('quizOver');
  var elCat     = document.getElementById('qCat');
  var elClock   = document.getElementById('qClock');
  var elClockN  = document.getElementById('qClockNum');
  var elBar     = document.getElementById('qTimerBar');
  var elText    = document.getElementById('qText');
  var elAnswers = document.getElementById('qAnswers');
  var lifelines = document.getElementById('qLifelines');
  var overBadge = document.getElementById('quizOverBadge');
  var overTitle = document.getElementById('quizOverTitle');
  var overDesc  = document.getElementById('quizOverDesc');
  var overTruth = document.getElementById('quizTruth');
  var overBest  = document.getElementById('quizNewBest');

  var level = 0;          // branches already cleared
  var streak = 0;
  var best = 0;
  var playing = false;
  var locked = false;     // true between answering and the next question
  var queues = {};        // per-tier shuffled question pools
  var current = null;     // { entry, opts, correct }
  var used = { fifty: false, skip: false, shield: false };
  var shieldArmed = false;
  var lastEnd = null;     // { kind, level, entry } — kept so re-language can redraw
  var deadline = 0, tickTimer = null;

  try { best = parseInt(localStorage.getItem('kk-quiz-best'), 10) || 0; } catch (e) {}

  function shuffle(arr){
    for (var i = arr.length - 1; i > 0; i--){
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }
  function fill(str, map){
    return str.replace(/\{(\w+)\}/g, function(_, k){ return map[k]; });
  }
  function tierFor(lvl){
    for (var i = 0; i < TIERS.length; i++){ if (lvl <= TIERS[i].top) return TIERS[i]; }
    return TIERS[TIERS.length - 1];
  }

  /* ---- the tree ---- */
  var rungEls = [];
  (function buildTree(){
    var html = '';
    for (var i = 1; i <= MAX_LEVEL; i++){
      var mark = (i === 5 || i === 10 || i === 15) ? ' tier-mark' : '';
      html += '<li class="tree-rung' + mark + '"><span class="node"></span><span class="num">' + i + '</span></li>';
    }
    rungsWrap.innerHTML = html;
    rungEls = [].slice.call(rungsWrap.children);
  })();

  function paintTree(){
    for (var i = 0; i < rungEls.length; i++){
      rungEls[i].classList.toggle('done', i < level);
      rungEls[i].classList.toggle('now', playing && i === level);
    }
  }

  var streakStat = document.getElementById('qStreakStat');
  function paintHud(){
    elLevel.textContent = level;
    elBest.textContent = best;
    elStreak.textContent = streak;
    elTier.textContent = playing ? t('quiz.tier.' + tierFor(level + 1).key) : '—';
    streakStat.classList.toggle('hot', streak >= 4);
  }

  /* ---- clock ---- */
  function stopClock(){
    if (tickTimer){ clearInterval(tickTimer); tickTimer = null; }
  }
  function startClock(secs){
    stopClock();
    deadline = Date.now() + secs * 1000;
    elBar.style.transition = 'none';
    elBar.style.transform = 'scaleX(1)';
    // force a reflow so the reset above is not folded into the animation below
    void elBar.offsetWidth;
    elBar.style.transition = 'transform ' + secs + 's linear';
    elBar.style.transform = 'scaleX(0)';
    elClock.classList.remove('warn');
    elClockN.textContent = secs;
    tickTimer = setInterval(function(){
      var left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      elClockN.textContent = left;
      elClock.classList.toggle('warn', left <= 5);
      if (left <= 0){ stopClock(); resolve(-1); }
    }, 200);
  }
  function freezeClock(){
    stopClock();
    var w = elBar.getBoundingClientRect().width;
    var full = elBar.parentNode.getBoundingClientRect().width || 1;
    elBar.style.transition = 'none';
    elBar.style.transform = 'scaleX(' + (w / full).toFixed(4) + ')';
  }

  var elFlash = document.getElementById('qFlash');
  var flashTimer = null;
  function flash(msg, tone){
    if (!elFlash) return;
    elFlash.textContent = msg;
    elFlash.classList.toggle('tone-hot', tone === 'hot');
    elFlash.classList.add('on');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function(){ elFlash.classList.remove('on'); }, 1400);
  }

  /* ---- questions ---- */
  function draw(tierKey){
    if (!queues[tierKey] || !queues[tierKey].length){
      queues[tierKey] = shuffle(window.QUIZ_BANK[tierKey].slice());
    }
    return queues[tierKey].pop();
  }

  function renderQuestion(){
    var entry = current.entry;
    elText.textContent = lang === 'hu' ? entry[1] : entry[0];
    elCat.textContent = t('quiz.cat.' + entry[4]);
    var texts = lang === 'hu' ? entry[3] : entry[2];
    var html = '';
    for (var i = 0; i < current.opts.length; i++){
      html += '<button type="button" class="quiz-answer" data-idx="' + i + '">' +
                '<span class="key">' + (i + 1) + '</span>' +
                '<span class="txt"></span>' +
              '</button>';
    }
    elAnswers.innerHTML = html;
    var btns = elAnswers.children;
    for (var j = 0; j < btns.length; j++){
      btns[j].querySelector('.txt').textContent = texts[current.opts[j]];
      if (current.removed && current.removed.indexOf(j) > -1){
        btns[j].classList.add('dim');
        btns[j].disabled = true;
      }
    }
  }

  function nextQuestion(){
    var tier = tierFor(level + 1);
    var entry = draw(tier.key);
    // source order always puts the right answer first; shuffle the view of it
    var order = shuffle([0, 1, 2, 3]);
    current = { entry: entry, opts: order, correct: order.indexOf(0), removed: null };
    locked = false;
    renderQuestion();
    paintHud();
    paintTree();
    startClock(tier.secs);
  }

  /* ---- answering ---- */
  function resolve(picked){
    if (locked) return;
    locked = true;
    freezeClock();

    var btns = [].slice.call(elAnswers.children);
    btns.forEach(function(b){ b.disabled = true; });
    if (btns[current.correct]) btns[current.correct].classList.add('correct');
    if (picked > -1 && picked !== current.correct && btns[picked]) btns[picked].classList.add('wrong');

    if (picked === current.correct){
      level++;
      streak++;
      paintHud();
      if (streak === 4 || streak === 8 || streak === 12) flash(t('quiz.hot'), 'hot');
      paintTree();
      setTimeout(function(){
        if (level >= MAX_LEVEL) endRun('win');
        else nextQuestion();
      }, 850);
      return;
    }

    // wrong, or the clock ran out
    if (shieldArmed){
      shieldArmed = false;
      var sh = lifelines.querySelector('[data-ll="shield"]');
      if (sh){ sh.classList.remove('armed'); sh.disabled = true; }
      streak = 0;
      paintHud();
      flash(t('quiz.shieldnote'));
      setTimeout(function(){ nextQuestion(); }, 1700);
      return;
    }
    endRun(picked === -1 ? 'timeup' : 'lost');
  }

  elAnswers.addEventListener('click', function(e){
    var b = e.target.closest('.quiz-answer');
    if (!b || b.disabled) return;
    resolve(parseInt(b.getAttribute('data-idx'), 10));
  });

  /* ---- lifelines ---- */
  lifelines.addEventListener('click', function(e){
    var b = e.target.closest('.lifeline');
    if (!b || b.disabled || !playing || locked) return;
    var kind = b.getAttribute('data-ll');
    if (used[kind]) return;
    used[kind] = true;
    b.disabled = true;

    if (kind === 'fifty'){
      var wrongIdx = [];
      for (var i = 0; i < 4; i++){ if (i !== current.correct) wrongIdx.push(i); }
      current.removed = shuffle(wrongIdx).slice(0, 2);
      renderQuestion();
    } else if (kind === 'skip'){
      stopClock();
      nextQuestion();
    } else if (kind === 'shield'){
      shieldArmed = true;
      b.classList.add('armed');
      b.disabled = false;   // stays lit until it absorbs a hit
    }
  });

  /* ---- run lifecycle ---- */
  function startRun(){
    if (bankState !== 2){
      setBusy(true);
      withBank(function(ok){
        setBusy(false);
        if (ok) startRun();
        else showError(t('quiz.offline'));
      });
      return;
    }
    level = 0;
    streak = 0;
    playing = true;
    shieldArmed = false;
    used = { fifty: false, skip: false, shield: false };
    queues = {};
    lastEnd = null;
    var lls = lifelines.querySelectorAll('.lifeline');
    for (var i = 0; i < lls.length; i++){
      lls[i].disabled = false;
      lls[i].classList.remove('armed');
    }
    if (elFlash) elFlash.classList.remove('on');
    intro.hidden = true;
    over.hidden = true;
    game.hidden = false;
    nextQuestion();
  }

  function endRun(kind){
    stopClock();
    playing = false;
    var reached = level;
    var isBest = reached > best;
    if (isBest){
      best = reached;
      try { localStorage.setItem('kk-quiz-best', String(best)); } catch (e) {}
    }
    lastEnd = { kind: kind, level: reached, entry: current ? current.entry : null, isBest: isBest };
    setTimeout(function(){
      game.hidden = true;
      over.hidden = false;
      paintEnd();
      paintHud();
      paintTree();
    }, kind === 'win' ? 500 : 1100);
  }

  function paintEnd(){
    if (!lastEnd) return;
    var k = lastEnd.kind;
    over.classList.toggle('win', k === 'win');
    overBadge.innerHTML = k === 'win' ? '&#9733;' : '&#10005;';
    if (k === 'win'){
      overTitle.textContent = t('quiz.win.title');
      overDesc.textContent = fill(t('quiz.win.desc'), { max: MAX_LEVEL });
      overTruth.hidden = true;
    } else {
      overTitle.textContent = k === 'timeup' ? t('quiz.timeup.title') : t('quiz.over.title');
      if (lastEnd.level === 0 && k !== 'timeup'){
        overDesc.textContent = t('quiz.over.desc0');
      } else {
        overDesc.textContent = k === 'timeup'
          ? fill(t('quiz.timeup.desc'), { n: lastEnd.level + 1, max: MAX_LEVEL })
          : fill(t('quiz.over.desc'), { n: lastEnd.level, max: MAX_LEVEL });
      }
      if (lastEnd.entry){
        var right = (lang === 'hu' ? lastEnd.entry[3] : lastEnd.entry[2])[0];
        var tpl = t('quiz.truth').split('{a}');
        var strong = document.createElement('b');
        strong.textContent = right;
        overTruth.textContent = tpl[0];
        overTruth.appendChild(strong);
        overTruth.appendChild(document.createTextNode(tpl[1] || ''));
        overTruth.hidden = false;
      } else {
        overTruth.hidden = true;
      }
    }
    overBest.hidden = !lastEnd.isBest || lastEnd.level === 0;
  }

  var startBtn = document.getElementById('quizStart');
  var retryBtn = document.getElementById('quizRetry');
  var shareBtn = document.getElementById('quizShare');
  var errorBox = document.getElementById('quizError');

  function setBusy(on){
    [startBtn, retryBtn].forEach(function(b){
      b.disabled = on;
      b.classList.toggle('is-busy', on);
    });
  }
  function showError(msg){
    errorBox.textContent = msg || '';
    errorBox.hidden = !msg;
  }
  startBtn.addEventListener('click', function(){ showError(''); startRun(); });
  retryBtn.addEventListener('click', startRun);

  /* A line worth pasting into a Discord chat — the whole point of a
     score you cannot otherwise prove. */
  shareBtn.addEventListener('click', function(){
    if (!lastEnd) return;
    var text = lastEnd.kind === 'win'
      ? fill(t('quiz.sharewin'), { max: MAX_LEVEL })
      : fill(t('quiz.sharetext'), {
          n: lastEnd.level, max: MAX_LEVEL,
          tier: t('quiz.tier.' + tierFor(Math.max(lastEnd.level, 1)).key)
        });
    var done = function(){
      var label = shareBtn.textContent;
      shareBtn.textContent = t('quiz.shared');
      setTimeout(function(){ shareBtn.textContent = label; }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(done, done);
    } else {
      done();
    }
  });

  /* number keys pick an answer, but only while the game is actually on screen */
  window.addEventListener('keydown', function(e){
    if (!playing || locked || e.ctrlKey || e.altKey || e.metaKey) return;
    var n = parseInt(e.key, 10);
    if (!(n >= 1 && n <= 4)) return;
    var r = game.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    var b = elAnswers.children[n - 1];
    if (b && !b.disabled){ e.preventDefault(); resolve(n - 1); }
  });

  // a backgrounded tab should not silently burn the clock
  document.addEventListener('visibilitychange', function(){
    if (document.hidden && playing && !locked){
      freezeClock();
      var left = Math.max(1, Math.ceil((deadline - Date.now()) / 1000));
      current.pausedAt = left;
    } else if (!document.hidden && playing && !locked && current && current.pausedAt){
      startClock(current.pausedAt);
      current.pausedAt = 0;
    }
  });

  var poolEl = document.getElementById('quizPool');
  function paintPool(){
    if (!poolEl || !window.QUIZ_BANK) return;
    var n = 0;
    for (var k in window.QUIZ_BANK) if (window.QUIZ_BANK.hasOwnProperty(k)) n += window.QUIZ_BANK[k].length;
    poolEl.textContent = fill(t('quiz.pool'), { n: n });
    poolEl.hidden = false;
  }

  quizRelang = function(){
    paintHud();
    paintPool();
    if (!errorBox.hidden) showError(t('quiz.offline'));
    if (playing && current && !locked) renderQuestion();
    if (!over.hidden) paintEnd();
  };

  paintHud();
  paintTree();
})();

/* ============================================================
   12. 3D voxel starfield background
   ============================================================ */
var renderBackground = null;
var trimBackground = null;
(function(){
  var canvas = document.getElementById('bgCanvas');
  // alpha is required (the canvas sits over the page background), but
  // telling the browser we never read pixels back keeps it on the GPU
  var ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  var w = 0, h = 0, cx = 0, cy = 0, dpr = 1;
  var FOCAL = 560;
  var FAR = 1400;
  var NEAR = 90;

  var CUBE_COUNT = perf.cubes;
  var DUST_COUNT = perf.dust;

  // unit cube corners
  var CORNERS = [
    [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
    [-1,-1, 1],[1,-1, 1],[1,1, 1],[-1,1, 1]
  ];
  var FACES = [
    { idx:[0,1,2,3], n:[0,0,-1] },
    { idx:[5,4,7,6], n:[0,0,1] },
    { idx:[4,0,3,7], n:[-1,0,0] },
    { idx:[1,5,6,2], n:[1,0,0] },
    { idx:[4,5,1,0], n:[0,-1,0] },
    { idx:[3,2,6,7], n:[0,1,0] }
  ];
  var LIGHT = [-0.44, -0.66, -0.61];

  function resize(){
    dpr = perf.dpr;
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = w / 2; cy = h / 2;
  }
  var bgResizeTimer = null;
  window.addEventListener('resize', function(){
    clearTimeout(bgResizeTimer);
    bgResizeTimer = setTimeout(resize, 120);
  });
  resize();

  function rnd(a, b){ return a + Math.random() * (b - a); }

  function makeCube(deep){
    var spread = Math.max(w, h) * 0.85;
    return {
      x: rnd(-spread, spread),
      y: rnd(-spread * 0.75, spread * 0.75),
      z: deep ? rnd(NEAR, FAR) : FAR,
      size: rnd(14, 46),
      ax: rnd(0, Math.PI * 2), ay: rnd(0, Math.PI * 2),
      vax: rnd(-0.004, 0.004), vay: rnd(-0.005, 0.005),
      vz: rnd(0.5, 1.5),
      accent: Math.random() < 0.34
    };
  }
  function makeDust(deep){
    var spread = Math.max(w, h) * 1.1;
    return {
      x: rnd(-spread, spread),
      y: rnd(-spread * 0.8, spread * 0.8),
      z: deep ? rnd(NEAR, FAR) : FAR,
      vz: rnd(0.8, 2.4),
      accent: Math.random() < 0.14
    };
  }

  var cubes = [], dust = [];
  for (var i = 0; i < CUBE_COUNT; i++) cubes.push(makeCube(true));
  for (var d = 0; d < DUST_COUNT; d++) dust.push(makeDust(true));

  var themeNeutral, themeAccent;
  function readTheme(){
    var light = root.getAttribute('data-theme') === 'light';
    themeNeutral = light ? '90,86,80' : '235,238,240';
    themeAccent  = light ? '179,24,42' : '200,30,46';
  }
  readTheme();
  onThemeChange = readTheme;
  function neutralRGB(){ return themeNeutral; }
  function accentRGB(){ return themeAccent; }

  var rc = new Float32Array(24);   // rotated corners (8 * xyz)
  var pc = new Float32Array(16);   // projected corners (8 * xy)
  var pz = new Float32Array(8);

  function drawCube(c, boost){
    var sx = Math.sin(c.ax), cxr = Math.cos(c.ax);
    var sy = Math.sin(c.ay), cyr = Math.cos(c.ay);
    var half = c.size / 2;
    var ok = true;

    for (var i = 0; i < 8; i++){
      var px = CORNERS[i][0] * half, py = CORNERS[i][1] * half, pzz = CORNERS[i][2] * half;
      // rotate X
      var y1 = py * cxr - pzz * sx;
      var z1 = py * sx + pzz * cxr;
      // rotate Y
      var x2 = px * cyr + z1 * sy;
      var z2 = -px * sy + z1 * cyr;

      var wx = c.x + x2, wy = c.y + y1, wz = c.z + z2;
      if (wz < 40){ ok = false; break; }
      rc[i * 3] = wx; rc[i * 3 + 1] = wy; rc[i * 3 + 2] = wz;
      var s = FOCAL / wz;
      pc[i * 2] = cx + wx * s;
      pc[i * 2 + 1] = cy + wy * s;
      pz[i] = wz;
    }
    if (!ok) return;

    var fade = 1;
    if (c.z > FAR * 0.65) fade = 1 - (c.z - FAR * 0.65) / (FAR * 0.35);
    if (c.z < 260) fade = Math.min(fade, (c.z - 40) / 220);
    if (fade <= 0) return;
    fade *= 0.55;

    var base = c.accent ? accentRGB() : neutralRGB();

    for (var f = 0; f < 6; f++){
      var face = FACES[f];
      // rotate the face normal
      var nx0 = face.n[0], ny0 = face.n[1], nz0 = face.n[2];
      var ny1 = ny0 * cxr - nz0 * sx;
      var nz1 = ny0 * sx + nz0 * cxr;
      var nx2 = nx0 * cyr + nz1 * sy;
      var nz2 = -nx0 * sy + nz1 * cyr;

      // face centroid in camera space
      var a = face.idx[0], b = face.idx[1], cc = face.idx[2], dd = face.idx[3];
      var ccx = (rc[a*3] + rc[b*3] + rc[cc*3] + rc[dd*3]) / 4;
      var ccy = (rc[a*3+1] + rc[b*3+1] + rc[cc*3+1] + rc[dd*3+1]) / 4;
      var ccz = (rc[a*3+2] + rc[b*3+2] + rc[cc*3+2] + rc[dd*3+2]) / 4;

      // visible if normal points back toward the camera (origin)
      if (nx2 * ccx + ny1 * ccy + nz2 * ccz >= 0) continue;

      var lambert = nx2 * LIGHT[0] + ny1 * LIGHT[1] + nz2 * LIGHT[2];
      if (lambert < 0) lambert = 0;
      var shade = 0.22 + lambert * 0.78;

      ctx.beginPath();
      ctx.moveTo(pc[a*2], pc[a*2+1]);
      ctx.lineTo(pc[b*2], pc[b*2+1]);
      ctx.lineTo(pc[cc*2], pc[cc*2+1]);
      ctx.lineTo(pc[dd*2], pc[dd*2+1]);
      ctx.closePath();
      ctx.fillStyle = 'rgba(' + base + ',' + (fade * shade * 0.32).toFixed(3) + ')';
      ctx.fill();
      ctx.strokeStyle = 'rgba(' + base + ',' + (fade * (0.35 + shade * 0.5)).toFixed(3) + ')';
      ctx.lineWidth = boost > 1.6 ? 1.4 : 1;
      ctx.stroke();
    }
  }

  renderBackground = function(){
    ctx.clearRect(0, 0, w, h);

    var boost = 1 + Math.min(Math.abs(scrollVelocity) * 0.09, 5);
    var nRGB = neutralRGB(), aRGB = accentRGB();

    // dust first (far layer)
    for (var i = 0; i < dust.length; i++){
      var p = dust[i];
      p.z -= p.vz * boost;
      if (p.z < NEAR){ dust[i] = makeDust(false); continue; }
      var s = FOCAL / p.z;
      var x = cx + p.x * s, y = cy + p.y * s;
      if (x < -40 || x > w + 40 || y < -40 || y > h + 40) continue;
      var alpha = (1 - p.z / FAR) * 0.5;
      var r = Math.max(0.4, s * 1.1);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + (p.accent ? aRGB : nRGB) + ',' + alpha.toFixed(3) + ')';
      ctx.fill();
    }

    // cubes, far to near
    cubes.sort(function(m, n){ return n.z - m.z; });
    for (var j = 0; j < cubes.length; j++){
      var c = cubes[j];
      c.z -= c.vz * boost;
      c.ax += c.vax; c.ay += c.vay;
      if (c.z < NEAR){ cubes[j] = makeCube(false); continue; }
      drawCube(c, boost);
    }
  };

  // called if the runtime frame check decides this machine is struggling
  trimBackground = function(){
    dpr = 1;
    resize();
    cubes.length = Math.min(cubes.length, 8);
    dust.length = Math.min(dust.length, 24);
  };
})();

/* ============================================================
   13. Minecraft skin viewer
   ============================================================ */
/* skinview3d bundles three.js — around half a megabyte for one card that
   most visitors never scroll past. It is fetched only when the card gets
   close, and its render loop is parked whenever the card is off screen
   or the tab is in the background. */
(function(){
  var SKIN_URL = 'assets/skin.775ec2e7.png';
  var BUNDLE_URL = 'assets/skinview3d.d196e9c9.js';
  var wrap = document.getElementById('skinViewerWrap');
  var card = wrap && wrap.closest('.skin-card');
  if (!wrap || !card) return;

  var viewer = null, started = false, visible = false;

  function fallback(){
    wrap.innerHTML = '<img src="' + SKIN_URL + '" alt="Kisskorboy Minecraft skin" ' +
      'style="width:100%;height:100%;object-fit:contain;image-rendering:pixelated;">';
  }

  function build(){
    try {
      viewer = new skinview3d.SkinViewer({
        canvas: document.getElementById('skinCanvas'),
        width: 210,
        height: 270,
        skin: SKIN_URL
      });
      viewer.fov = 50;
      viewer.zoom = 0.85;
      viewer.autoRotate = true;
      viewer.autoRotateSpeed = 1.1;
      viewer.controls.enablePan = false;
      viewer.controls.minDistance = 30;
      viewer.controls.maxDistance = 100;
      applyRunState();
    } catch (e) {
      fallback();
    }
  }

  function applyRunState(){
    if (!viewer) return;
    var run = visible && !document.hidden;
    // skinview3d exposes its loop through .animate / .renderPaused across
    // versions; guard both so an upgrade cannot silently peg a core
    try {
      if ('renderPaused' in viewer) viewer.renderPaused = !run;
      else if (typeof viewer.setRenderPaused === 'function') viewer.setRenderPaused(!run);
      viewer.autoRotate = run;
    } catch (e) {}
  }

  function load(){
    if (started) return;
    started = true;
    var s = document.createElement('script');
    s.src = BUNDLE_URL;
    s.async = true;
    s.onload = build;
    s.onerror = fallback;
    document.head.appendChild(s);
  }

  if (!('IntersectionObserver' in window)){ load(); visible = true; return; }

  // a generous margin so the model is already there by the time it scrolls in
  new IntersectionObserver(function(entries){
    for (var i = 0; i < entries.length; i++){
      visible = entries[i].isIntersecting;
      if (visible) load();
      applyRunState();
    }
  }, { rootMargin: '600px 0px' }).observe(card);

  document.addEventListener('visibilitychange', applyRunState);
})();

/* ============================================================
   14. Intro curtain
   ============================================================ */
(function(){
  var intro = document.getElementById('intro');
  var hide = function(){ intro.classList.add('done'); };
  if (reduced){ hide(); return; }
  // never gate the page on the load event — the curtain is a flourish, not a loader
  setTimeout(hide, 900);
  ['pointerdown','keydown','wheel','touchstart'].forEach(function(ev){
    window.addEventListener(ev, hide, { once: true, passive: true });
  });
})();

/* ============================================================
   15. Light source-protection deterrents (kept from before)
   ============================================================ */
document.addEventListener('contextmenu', function(e){ e.preventDefault(); });
document.addEventListener('keydown', function(e){
  var k = (e.key || '').toUpperCase();
  if (k === 'F12'){ e.preventDefault(); return; }
  if (e.ctrlKey && e.shiftKey && ['I','J','C','K'].indexOf(k) !== -1){ e.preventDefault(); return; }
  if (e.ctrlKey && (k === 'U' || k === 'S')){ e.preventDefault(); return; }
});

/* ============================================================
   Master frame loop — kept separate so a failure in any one
   effect can never freeze the rest of the page.
   ============================================================ */
var frameId = 0;
function frame(now){
  frameId = requestAnimationFrame(frame);
  if (perfDemote) perfDemote(now);

  try { updateScroll(); } catch (e) {}
  if (spinRings){
    try { spinRings(); } catch (e) { spinRings = null; }
  }
  if (!reduced){
    if (updateHoverTilt){
      try { updateHoverTilt(); } catch (e) { updateHoverTilt = null; }
    }
    try { updateParallax(); } catch (e) {}
    if (renderBackground){
      try { renderBackground(); } catch (e) { renderBackground = null; }
    }
  }
}

/* A hidden tab still gets animation frames in some browsers, and the
   starfield is the most expensive thing on the page — stop the loop
   outright rather than paying for frames nobody sees. */
document.addEventListener('visibilitychange', function(){
  if (document.hidden){
    if (frameId){ cancelAnimationFrame(frameId); frameId = 0; }
  } else if (!frameId){
    measure();
    frameId = requestAnimationFrame(frame);
  }
});

/* ============================================================
   Boot
   ============================================================ */
body.classList.add('js-on');
applyLang(lang);
measure();
updateScroll();
frameId = requestAnimationFrame(frame);

})();
