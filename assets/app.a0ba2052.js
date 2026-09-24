(function(){
'use strict';

var body = document.body;
var root = document.documentElement;
var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var finePointer = window.matchMedia('(pointer:fine)').matches;

// ---- effect budget ----
var perf = (function(){
  var cores = navigator.hardwareConcurrency || 4;
  var mem = navigator.deviceMemory || 4;
  var small = window.innerWidth < 760;
  var weak = reduced || cores <= 4 || mem <= 4 || (small && cores <= 6);
  return {
    low: weak,

    dpr: weak ? 1 : Math.min(window.devicePixelRatio || 1, 1.75),
    motes: weak ? (small ? 14 : 22) : (small ? 24 : 42),
    tilt: !weak && !reduced && finePointer
  };
})();
if (perf.low) body.classList.add('perf-low');

var perfDemote = null;
(function(){
  if (perf.low) return;
  var frames = 0, slow = 0, t0 = 0, done = false;
  perfDemote = function(now){
    if (done) return;
    if (!t0){ t0 = now; return; }
    var dt = now - t0;
    t0 = now;
    if (dt > 34) slow++;
    if (++frames < 150) return;
    done = true;
    perfDemote = null;
    if (slow / frames > 0.3){
      perf.low = true;
      perf.tilt = false;
      body.classList.add('perf-low');
      if (typeof trimBackground === 'function') trimBackground();

      updateHoverTilt = null;
      var lifted = document.querySelectorAll('[data-tilt], .btn, .copy-btn');
      for (var i = 0; i < lifted.length; i++) lifted[i].style.transform = '';
    }
  };
})();

// ---- i18n ----
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
    'badge.owner':'Owner','badge.former':'Former Staff','badge.dev':'Developer',
    'proj.asth.sub':'Music card game · asthetic.hu',
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
    'label.partners':'PARTNERS',
    'partners.h2':'People I work with.',
    'partners.p':'The creators and communities the servers and sites are built alongside.',
    'partners.imperius.role':'Content creator & community',
    'partners.kounee.role':'Overclock — server team',
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
    'quiz.readyp':'Fifteen questions stand between you and the top of the tree. Code, science, history, general knowledge and Minecraft — shuffled and timed, and never the same climb twice.',
    'quiz.start':'Start climbing','quiz.retry':'Climb again',
    'quiz.kbd':'Tip: keys 1–4 pick an answer',
    'quiz.pool':'{n} questions in the pool',
    'quiz.ll.fifty':'Halve it','quiz.ll.skip':'Swap question','quiz.ll.shield':'Shield',
    'quiz.tier.easy':'EASY','quiz.tier.medium':'MEDIUM','quiz.tier.hard':'HARD',
    'quiz.cat.mc':'MINECRAFT','quiz.cat.dev':'CODE & WEB','quiz.cat.gen':'GENERAL',
    'quiz.cat.sci':'SCIENCE','quiz.cat.his':'HISTORY',
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
    'dot.top':'TOP','dot.skills':'SKILLS','dot.projects':'PROJECTS','dot.what-i-do':'WHAT I DO','dot.partners':'PARTNERS','dot.stack':'STACK','dot.quiz':'MINIGAME','dot.contact':'CONTACT'
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
    'badge.owner':'Tulajdonos','badge.former':'Korábbi Staff','badge.dev':'Fejlesztő',
    'proj.asth.sub':'Zenei kártyajáték · asthetic.hu',
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
    'label.partners':'PARTNEREK',
    'partners.h2':'Akikkel együtt dolgozom.',
    'partners.p':'Az alkotók és közösségek, akikkel közösen épülnek a szerverek és az oldalak.',
    'partners.imperius.role':'Tartalomgyártó és közösség',
    'partners.kounee.role':'Overclock — szervercsapat',
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
    'quiz.readyp':'Tizenöt kérdés választ el a fa tetejétől. Kód, tudomány, történelem, általános műveltség és Minecraft — véletlen sorrendben, órával, és sosem ugyanaz a mászás.',
    'quiz.start':'Mászás indítása','quiz.retry':'Új próbálkozás',
    'quiz.kbd':'Tipp: az 1–4 billentyűkkel is válaszolhatsz',
    'quiz.pool':'{n} kérdés a készletben',
    'quiz.ll.fifty':'Felezés','quiz.ll.skip':'Kérdéscsere','quiz.ll.shield':'Pajzs',
    'quiz.tier.easy':'KÖNNYŰ','quiz.tier.medium':'KÖZEPES','quiz.tier.hard':'NEHÉZ',
    'quiz.cat.mc':'MINECRAFT','quiz.cat.dev':'KÓD & WEB','quiz.cat.gen':'ÁLTALÁNOS',
    'quiz.cat.sci':'TUDOMÁNY','quiz.cat.his':'TÖRTÉNELEM',
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
    'dot.top':'ELEJE','dot.skills':'KÉPESSÉGEK','dot.projects':'PROJEKTEK','dot.what-i-do':'MIT CSINÁLOK','dot.partners':'PARTNEREK','dot.stack':'ESZKÖZÖK','dot.quiz':'MINIJÁTÉK','dot.contact':'KAPCSOLAT'
  }
};

var lang = 'en';
try { var saved = localStorage.getItem('kk-lang'); if (saved === 'hu' || saved === 'en') lang = saved; } catch (e) {}

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

// ---- theme ----

var onThemeChange = null;

document.getElementById('themeToggle').addEventListener('click', function(){
  var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('kk-theme', next); } catch (e) {}
  if (onThemeChange) onThemeChange();
});

// ---- rotating role ----
(function(){
  if (reduced) return;
  var inner = document.getElementById('rolesInner');
  var flipped = false;
  setInterval(function(){
    flipped = !flipped;
    inner.classList.toggle('flip', flipped);
  }, 3400);
})();

// ---- 3d tech ring ----
var spinRings = null;
(function(){
  var items = ['Paper API','Spigot','Velocity','MySQL','MariaDB','SQLite','Redis','Java 17','Java 21','JDA','Discord.js','HTML / CSS / JS','Git'];
  var stage = document.querySelector('.ring-stage');
  var radius = window.innerWidth < 760 ? 250 : 380;
  var half = Math.ceil(items.length / 2);
  var DEG = Math.PI / 180;
  var IDLE = reduced ? 0 : 0.075;
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

    vel = Math.max(-6, Math.min(6, dragVel));
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  spinRings = function(){
    if (!dragging){
      var target = hovering ? IDLE * 0.15 : IDLE;

      vel += (target - vel) * (Math.abs(vel) > IDLE * 2 ? 0.04 : 0.08);
      angle += vel;
    }
    if (angle > 3600 || angle < -3600) angle = angle % 360;

    for (var r = 0; r < rows.length; r++){
      var row = rows[r];
      var a = angle * row.dir;
      row.el.style.transform = 'rotateX(' + row.tilt + 'deg) rotateY(' + a.toFixed(2) + 'deg)';

      var best = -1, bestFacing = 0.72;
      for (var i = 0; i < row.chips.length; i++){
        var facing = Math.cos((a + row.base[i]) * DEG);
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

// ---- slide dots ----
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

// ---- scroll engine ----
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
var navLinks = [].slice.call(document.querySelectorAll('.pill-nav a'));

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

  scene.style.perspectiveOrigin = '50% ' + Math.round(y + vh * 0.5) + 'px';

  if (!reduced){
    for (var i = 0; i < depthEls.length; i++){
      var top = depthTops[i] - y;
      var p = (vh + 80 - top) / (vh * 0.55);
      if (p < 0) p = 0; else if (p > 1) p = 1;
      depthEls[i].style.setProperty('--p', p.toFixed(3));
    }
  }

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
    var activeId = slides[active].getAttribute('data-slide');
    for (var n = 0; n < navLinks.length; n++){
      navLinks[n].classList.toggle('on', navLinks[n].getAttribute('href') === '#' + activeId);
    }
  }
}

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

function goToSlide(i){
  if (i < 0) i = 0;
  if (i > slides.length - 1) i = slides.length - 1;
  smoothScrollTo(layoutTop(slides[i]) - 110);
}

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

// ---- pointer parallax ----
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
  var ry = (curX - 0.5) * 2.4;
  var rx = (0.5 - curY) * 1.6;
  deck.style.transform = 'rotateY(' + ry.toFixed(2) + 'deg) rotateX(' + rx.toFixed(2) + 'deg)';
  navPill.style.transform = 'rotateY(' + (ry * 0.6).toFixed(2) + 'deg) rotateX(' + (rx * 0.6).toFixed(2) + 'deg)';

  glowX += (glowTX - glowX) * 0.14;
  glowY += (glowTY - glowY) * 0.14;
  glow.style.transform = 'translate3d(' + glowX.toFixed(1) + 'px,' + glowY.toFixed(1) + 'px,0)';
}

// ---- card tilt ----

var updateHoverTilt = null;
(function(){
  if (!perf.tilt) return;

  var px = 0, py = 0, moved = false;
  var card = null, cardRect = null, cardLift = 0;
  var btn = null, btnRect = null, btnLift = 0;

  function liftFor(el){
    return el.classList.contains('proj-card') ? 14
         : el.classList.contains('do-card') ? 18
         : el.classList.contains('avatar-stage') ? 0
         : 8;
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
      btnLift = b.classList.contains('copy-btn') ? 50 : 16;
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
        ((cx2 - 0.5) * 6).toFixed(2) + 'deg) rotateX(' + ((0.5 - cy2) * 5).toFixed(2) + 'deg)';
    }
    if (btn && btnRect.width){
      var dx = (px - (btnRect.left + btnRect.width / 2)) / btnRect.width;
      var dy = (py - (btnRect.top + btnRect.height / 2)) / btnRect.height;
      btn.style.transform =
        'translateZ(' + btnLift + 'px) translate3d(' + (dx * 6).toFixed(1) + 'px,' +
        (dy * 4 - 2).toFixed(1) + 'px,0) rotateY(' + (dx * 6).toFixed(1) +
        'deg) rotateX(' + (-dy * 6).toFixed(1) + 'deg)';
    }
  };
})();

// ---- skill bars + stat counters ----

var ROW_MS = 90;
var SEG_MS = 42;

(function(){
  var card = document.querySelector('.skill-card');
  if (!card) return;

  var tracks = [].slice.call(card.querySelectorAll('.bar-track'));
  var scores = [].slice.call(card.querySelectorAll('[data-score]'));
  tracks.forEach(function(tr, row){ tr.style.setProperty('--row', row); });

  if (reduced) return;

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

// ---- staff-time counters ----
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

// ---- copy discord tag ----
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

// ---- back-to-top button ----
(function(){
  var btn = document.getElementById('toTop');
  if (!btn) return;
  btn.addEventListener('click', function(){ smoothScrollTo(0); });

  window.addEventListener('scroll', function(){
    btn.classList.toggle('on', window.pageYOffset > window.innerHeight * 0.9);
  }, { passive: true });
})();

// ---- tree of knowledge ----
(function(){
  var tree = document.querySelector('.quiz-tree');
  if (!tree) return;

  var QUIZ_URL = 'assets/quiz-data.87e964ee.js';
  var bankState = 0;
  var bankWaiting = [];

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

  var level = 0;
  var streak = 0;
  var best = 0;
  var playing = false;
  var locked = false;
  var current = null;
  var used = { fifty: false, skip: false, shield: false };
  var shieldArmed = false;
  var lastEnd = null;
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

  function stopClock(){
    if (tickTimer){ clearInterval(tickTimer); tickTimer = null; }
  }
  function startClock(secs){
    stopClock();
    deadline = Date.now() + secs * 1000;
    elBar.style.transition = 'none';
    elBar.style.transform = 'scaleX(1)';

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

  var DECK_KEY = 'kk-quiz-deck';
  var decks = null;
  var usedThisRun = {};

  function loadDecks(){
    try {
      var raw = JSON.parse(localStorage.getItem(DECK_KEY));
      if (raw && raw.sizes) return raw;
    } catch (e) {}
    return { sizes: {} };
  }
  function saveDecks(){
    try { localStorage.setItem(DECK_KEY, JSON.stringify(decks)); } catch (e) {}
  }

  function draw(tierKey){
    var pool = window.QUIZ_BANK[tierKey];
    if (!decks) decks = loadDecks();

    if (decks.sizes[tierKey] !== pool.length){
      decks.sizes[tierKey] = pool.length;
      decks[tierKey] = [];
    }

    var idx, guard = 0;
    do {
      if (!decks[tierKey] || !decks[tierKey].length){
        var all = [];
        for (var i = 0; i < pool.length; i++) all.push(i);
        decks[tierKey] = shuffle(all);
      }
      idx = decks[tierKey].pop();

    } while (usedThisRun[tierKey + ':' + idx] && ++guard < 40);

    usedThisRun[tierKey + ':' + idx] = true;
    saveDecks();
    return pool[idx];
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

    var order = shuffle([0, 1, 2, 3]);
    current = { entry: entry, opts: order, correct: order.indexOf(0), removed: null };
    locked = false;
    renderQuestion();
    paintHud();
    paintTree();
    startClock(tier.secs);
  }

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
      b.disabled = false;
    }
  });

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
    usedThisRun = {};
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

var renderBackground = null;
var trimBackground = null;
(function(){
  var canvas = document.getElementById('bgCanvas');
  var ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  var w = 0, h = 0, dpr = 1;
  var small = window.innerWidth < 760;

  function resize(){
    dpr = perf.dpr;
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  var bgResizeTimer = null;
  window.addEventListener('resize', function(){
    clearTimeout(bgResizeTimer);
    bgResizeTimer = setTimeout(function(){ resize(); layoutSnips(); }, 120);
  });
  resize();

  function rnd(a, b){ return a + Math.random() * (b - a); }

  var SNIPPETS = [
    ["function applyLang(next){", "  lang = next === 'hu' ? 'hu' : 'en';", "  document.title = t('meta.title');", "  if (quizRelang) quizRelang();", "}"],
    [".card:hover{", "  border-color:var(--line-strong);", "  transform:translateY(-3px);", "}"],
    ['<a class="card proj-card" href="https://asthetic.hu">', '  <div class="proj-title">Asthetic Game</div>', '</a>'],
    ["var TIERS = [", "  { key: 'easy',   top: 5,  secs: 22 },", "  { key: 'medium', top: 10, secs: 18 },", "  { key: 'hard',   top: 15, secs: 14 }", "];"],
    [":root{", "  --bg:#08090b;", "  --accent:#c81e2e;", "  --radius:20px;", "}"],
    ["viewer = new skinview3d.SkinViewer({", "  width: 210,", "  height: 270,", "  skin: SKIN_URL", "});"],
    ["if (picked === current.correct){", "  level++;", "  streak++;", "  paintTree();", "}"],
    ["window.addEventListener('scroll', onScroll, {", "  passive: true", "});"],
    ["@keyframes spin{", "  to{ transform:rotate(360deg); }", "}"],
    ["navigator.clipboard.writeText('kisskorboy')", "  .then(done, done);"],
    ['<h1 class="name3d">', '  <span class="lyr">KISSKORBOY</span>', '</h1>'],
    ["function smoothScrollTo(targetY){", "  var dist = targetY - window.pageYOffset;", "  if (Math.abs(dist) < 2) return;", "}"],
    [".btn-primary{", "  background:linear-gradient(135deg,", "    var(--accent-hi), var(--accent));", "}"],
    ["var items = ['Paper API', 'Velocity',", "  'Redis', 'Java 21', 'Discord.js'];"]
  ];

  var TOKENS = /('[^']*'|"[^"]*")|(\b(?:var|function|return|if|new|const)\b)|(#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|deg|s|ms)?\b)|(<\/?[a-z0-9]+|\/?>)|(--[a-z-]+|[a-z-]+(?=:))|([{}()\[\];,.:=+<>|!?])/g;
  var pal;
  function readPalette(){
    var light = root.getAttribute('data-theme') === 'light';
    pal = light ? {
      text: 'rgba(40,40,44,.9)', kw: '#b3182a', str: '#b8462f', num: '#a4553c', tag: '#b3182a',
      prop: 'rgba(80,78,74,.95)', punct: 'rgba(120,117,111,.9)', ln: 'rgba(120,117,111,.45)',
      fill: 'rgba(255,255,255,.35)', stroke: 'rgba(20,16,12,.08)', dot: 'rgba(20,16,12,.12)'
    } : {
      text: 'rgba(236,238,240,.92)', kw: '#ec3d4e', str: '#ff8a7a', num: '#f5a58c', tag: '#ec3d4e',
      prop: 'rgba(170,176,185,.95)', punct: 'rgba(130,136,145,.9)', ln: 'rgba(130,136,145,.4)',
      fill: 'rgba(18,20,24,.35)', stroke: 'rgba(255,255,255,.07)', dot: 'rgba(255,255,255,.14)'
    };
  }

  var FONT = '"JetBrains Mono", ui-monospace, Consolas, monospace';

  function drawLine(g, line, x, y){
    var last = 0, m;
    TOKENS.lastIndex = 0;
    while ((m = TOKENS.exec(line))){
      if (m.index > last){ g.fillStyle = pal.text; g.fillText(line.slice(last, m.index), x + g.measureText(line.slice(0, last)).width, y); }
      g.fillStyle = m[1] ? pal.str : m[2] ? pal.kw : m[3] ? pal.num : m[4] ? pal.tag : m[5] ? pal.prop : pal.punct;
      g.fillText(m[0], x + g.measureText(line.slice(0, m.index)).width, y);
      last = m.index + m[0].length;
    }
    if (last < line.length){ g.fillStyle = pal.text; g.fillText(line.slice(last), x + g.measureText(line.slice(0, last)).width, y); }
    return x + g.measureText(line).width;
  }

  function buildSprite(lines, depth){
    var size = 10.5 + depth * 4.5;
    var lh = size * 1.65;
    var padX = size * 1.3, padTop = size * 2.6, padBottom = size * 1.1;
    var gutter = size * 2.4;
    var probe = document.createElement('canvas').getContext('2d');
    probe.font = '400 ' + size + 'px ' + FONT;
    var textW = 0;
    for (var i = 0; i < lines.length; i++) textW = Math.max(textW, probe.measureText(lines[i]).width);
    var W = Math.ceil(padX * 2 + gutter + textW), H = Math.ceil(padTop + lines.length * lh + padBottom);

    var c = document.createElement('canvas');
    c.width = Math.ceil(W * dpr); c.height = Math.ceil(H * dpr);
    var g = c.getContext('2d');
    g.scale(dpr, dpr);
    if (depth < 0.35 && 'filter' in g) g.filter = 'blur(' + (1.2 - depth * 2).toFixed(2) + 'px)';

    var r = size * 0.9;
    g.beginPath();
    if (g.roundRect) g.roundRect(0.5, 0.5, W - 1, H - 1, r); else g.rect(0.5, 0.5, W - 1, H - 1);
    g.fillStyle = pal.fill; g.fill();
    g.strokeStyle = pal.stroke; g.lineWidth = 1; g.stroke();
    for (var d = 0; d < 3; d++){
      g.beginPath();
      g.arc(padX + d * size * 0.9, size * 1.2, size * 0.24, 0, Math.PI * 2);
      g.fillStyle = d === 0 ? pal.kw : pal.dot;
      g.fill();
    }

    g.font = '400 ' + size + 'px ' + FONT;
    g.textBaseline = 'middle';
    var endX = 0, endY = 0;
    for (var j = 0; j < lines.length; j++){
      var y = padTop + j * lh + lh / 2;
      g.fillStyle = pal.ln;
      g.textAlign = 'right';
      g.fillText(String(j + 1), padX + gutter - size * 0.9, y);
      g.textAlign = 'left';
      endX = drawLine(g, lines[j], padX + gutter, y);
      endY = y;
    }
    return { canvas: c, w: W, h: H, caretX: endX + size * 0.25, caretY: endY - size * 0.6, caretW: size * 0.55, caretH: size * 1.2 };
  }

  var snips = [];
  var codeReady = false;
  var SNIP_COUNT = small ? 6 : (perf.low ? 8 : 12);

  function layoutSnips(){
    if (!snips.length) return;
    var cols = small ? 2 : 4;
    for (var i = 0; i < snips.length; i++){
      var s = snips[i];
      var col = i % cols;
      var slot = w / cols;
      s.x = col * slot + rnd(-0.15, 0.55) * slot - s.sprite.w * 0.25;
      s.y = (i / snips.length) * (h + 400) - 200 + rnd(-60, 60);
    }
  }

  function buildSnips(){
    readPalette();
    var order = shuffleCopy(SNIPPETS);
    var old = snips;
    snips = [];
    for (var i = 0; i < SNIP_COUNT; i++){
      var prev = old[i];
      var depth = prev ? prev.depth : Math.pow(Math.random(), 1.3);
      var lines = prev ? prev.lines : order[i % order.length];
      snips.push({
        lines: lines,
        depth: depth,
        sprite: buildSprite(lines, depth),
        x: prev ? prev.x : 0,
        y: prev ? prev.y : 0,
        dir: prev ? prev.dir : (Math.random() < 0.5 ? -1 : 1),
        speed: prev ? prev.speed : rnd(0.05, 0.14) * (0.6 + depth),
        bob: prev ? prev.bob : rnd(10, 26),
        period: prev ? prev.period : rnd(0.25, 0.5),
        phase: prev ? prev.phase : rnd(0, Math.PI * 2)
      });
    }
    if (!old.length) layoutSnips();
    codeReady = true;
  }
  function shuffleCopy(list){
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var t2 = a[i]; a[i] = a[j]; a[j] = t2; }
    return a;
  }

  var fontLoad = (document.fonts && document.fonts.load) ? document.fonts.load('400 13px "JetBrains Mono"') : Promise.resolve();
  fontLoad.then(buildSnips, buildSnips);

  // light motes
  var SPRITE = 128;
  var moteSprites = {};
  function makeMoteSprite(rgb, core){
    var c = document.createElement('canvas');
    c.width = c.height = SPRITE;
    var g = c.getContext('2d');
    var r = SPRITE / 2;
    var grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, 'rgba(' + rgb + ',' + core + ')');
    grad.addColorStop(0.18, 'rgba(' + rgb + ',' + (core * 0.55).toFixed(3) + ')');
    grad.addColorStop(0.5, 'rgba(' + rgb + ',' + (core * 0.14).toFixed(3) + ')');
    grad.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, SPRITE, SPRITE);
    return c;
  }
  function readMoteTheme(){
    var light = root.getAttribute('data-theme') === 'light';
    moteSprites.accent  = makeMoteSprite(light ? '179,24,42' : '236,61,78', light ? 0.5 : 0.9);
    moteSprites.neutral = makeMoteSprite(light ? '120,100,90' : '236,238,240', light ? 0.35 : 0.7);
  }
  readMoteTheme();
  onThemeChange = function(){
    readMoteTheme();
    if (codeReady) buildSnips();
  };

  function makeMote(anywhere){
    var depth = Math.random();
    return {
      x: rnd(0, w),
      y: anywhere ? rnd(0, h) : h + rnd(20, 120),
      depth: depth,
      size: 5 + depth * depth * 40,
      vy: 0.08 + depth * 0.3,
      sway: rnd(0.2, 0.9),
      phase: rnd(0, Math.PI * 2),
      tw: rnd(0.4, 1.1),
      accent: Math.random() < 0.55
    };
  }
  var motes = [];
  var MOTE_COUNT = Math.round(perf.motes * 0.6);
  for (var i = 0; i < MOTE_COUNT; i++) motes.push(makeMote(true));

  var tick = 0;
  var lastScroll = window.pageYOffset;
  var caretOn = 0, caretSwap = 0;

  renderBackground = function(){
    ctx.clearRect(0, 0, w, h);
    tick += 0.016;
    var boost = 1 + Math.min(Math.abs(scrollVelocity) * 0.06, 4);
    var ox = curX - 0.5, oy = curY - 0.5;
    var sy = window.pageYOffset;
    var dScroll = sy - lastScroll;
    lastScroll = sy;

    if (codeReady){
      var light = root.getAttribute('data-theme') === 'light';
      if (tick > caretSwap){ caretOn = Math.floor(Math.random() * snips.length); caretSwap = tick + rnd(4, 7); }
      var span = h + 400;
      for (var k = 0; k < snips.length; k++){
        var s = snips[k];
        var sp = s.sprite;

        s.y += s.dir * s.speed - dScroll * (0.05 + s.depth * 0.12);
        if (s.y < -200 - sp.h) s.y += span + sp.h;
        else if (s.y > h + 200) s.y -= span + sp.h;

        var x = s.x - ox * 36 * s.depth;
        var y = s.y + Math.sin(tick * s.period + s.phase) * s.bob - oy * 24 * s.depth;

        var edge = 1;
        if (y < 60) edge = Math.max(0, (y + sp.h) / (sp.h + 60));
        else if (y + sp.h > h - 40) edge = Math.max(0, (h + 40 - y) / (sp.h + 80));
        var a = (light ? 0.14 : 0.1) + s.depth * (light ? 0.16 : 0.12);
        a *= Math.min(1, edge);
        if (a <= 0.005) continue;

        ctx.globalAlpha = a;
        ctx.drawImage(sp.canvas, x, y, sp.w, sp.h);
        if (k === caretOn && Math.sin(tick * 6) > 0){
          ctx.globalAlpha = Math.min(1, a * 2.2);
          ctx.fillStyle = light ? '#b3182a' : '#ec3d4e';
          ctx.fillRect(x + sp.caretX, y + sp.caretY, sp.caretW, sp.caretH);
        }
      }
    }

    for (var i = 0; i < motes.length; i++){
      var m = motes[i];
      m.y -= m.vy * boost;
      if (m.y < -80){ motes[i] = makeMote(false); continue; }
      var mx = m.x + Math.sin(tick * m.sway + m.phase) * 14 * m.depth - ox * 40 * m.depth;
      var my = m.y - oy * 30 * m.depth;
      var twinkle = 0.55 + 0.45 * Math.sin(tick * m.tw + m.phase);
      ctx.globalAlpha = (0.16 + (1 - m.depth) * 0.45) * twinkle;
      var ms = m.size;
      ctx.drawImage(m.accent ? moteSprites.accent : moteSprites.neutral, mx - ms, my - ms, ms * 2, ms * 2);
    }
    ctx.globalAlpha = 1;
  };

  trimBackground = function(){
    dpr = 1;
    resize();
    motes.length = Math.min(motes.length, 10);
    SNIP_COUNT = Math.min(SNIP_COUNT, 6);
    snips.length = Math.min(snips.length, SNIP_COUNT);
    if (codeReady) buildSnips();
  };
})();

// ---- minecraft skin viewer ----

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

  new IntersectionObserver(function(entries){
    for (var i = 0; i < entries.length; i++){
      visible = entries[i].isIntersecting;
      if (visible) load();
      applyRunState();
    }
  }, { rootMargin: '600px 0px' }).observe(card);

  document.addEventListener('visibilitychange', applyRunState);
})();

// ---- intro curtain ----
(function(){
  var intro = document.getElementById('intro');
  var hide = function(){ intro.classList.add('done'); };
  if (reduced){ hide(); return; }

  setTimeout(hide, 900);
  ['pointerdown','keydown','wheel','touchstart'].forEach(function(ev){
    window.addEventListener(ev, hide, { once: true, passive: true });
  });
})();

// ---- devtools deterrents ----
document.addEventListener('contextmenu', function(e){ e.preventDefault(); });
document.addEventListener('keydown', function(e){
  var k = (e.key || '').toUpperCase();
  if (k === 'F12'){ e.preventDefault(); return; }
  if (e.ctrlKey && e.shiftKey && ['I','J','C','K'].indexOf(k) !== -1){ e.preventDefault(); return; }
  if (e.ctrlKey && (k === 'U' || k === 'S')){ e.preventDefault(); return; }
});

// ---- master frame loop ----
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

document.addEventListener('visibilitychange', function(){
  if (document.hidden){
    if (frameId){ cancelAnimationFrame(frameId); frameId = 0; }
  } else if (!frameId){
    measure();
    frameId = requestAnimationFrame(frame);
  }
});

// ---- boot ----
body.classList.add('js-on');
applyLang(lang);
measure();
updateScroll();
frameId = requestAnimationFrame(frame);

})();
