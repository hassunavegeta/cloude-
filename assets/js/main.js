/* ==========================================================================
   BB SMASH IT – Interaktion & Cinematic Scroll
   Abhängigkeiten (lokal): GSAP 3.12.5, ScrollTrigger 3.12.5, Lenis 1.1.13
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  var motion = hasGSAP && !reduceMotion;
  document.documentElement.classList.add(motion ? 'has-motion' : 'no-motion');

  /* ======================================================================
     1) Burger bauen + Untertitel / Besetzung
     ==================================================================== */
  var CAPTIONS = [
    ['Brioche Bun', 'Goldbraun. Die Bühne für alles, was jetzt kommt.'],
    ['Haussauce', 'Hausgemacht. Kommt als Erstes drauf.'],
    ['Smashed Beef Patty', 'Auf die heiße Platte, flach gesmasht. Außen knusprig, innen saftig.'],
    ['Cheddar', 'Schmilzt genau da, wo er landet.'],
    ['Noch mehr Cheddar', 'Doppelt Cheddar. Weil einer nicht reicht.'],
    ['Gurken', 'Säure und Crunch – für die Balance.'],
    ['Jalapeños', 'Ein bisschen Feuer.'],
    ['Rote Zwiebeln', 'Frisch und mit Biss.'],
    ['Tomate', 'Saftige Scheiben.'],
    ['Salat', 'Knackig grün.'],
    ['Brioche Top Bun', 'Deckel drauf. Der Bebe Spezial ist fertig.']
  ];

  var frame = $('#burger');
  var layers = (window.BBBurger && frame) ? window.BBBurger.build(frame) : [];
  var N = layers.length;
  layers.forEach(function (el) {
    var ring = document.createElement('span');
    ring.className = 'layer__impact';
    el.appendChild(ring);
  });

  var capsEl = $('#captions');
  if (capsEl) {
    capsEl.innerHTML = CAPTIONS.map(function (c, i) {
      return '<div class="cap"><span class="cap__num">' + pad(i + 1) + '</span>' +
        '<span class="cap__scene">Szene ' + pad(i + 1) + ' / ' + pad(CAPTIONS.length) + '</span>' +
        '<p class="cap__title">' + c[0] + '</p><p class="cap__text">' + c[1] + '</p></div>';
    }).join('');
  }
  var creditsEl = $('#credits');
  if (creditsEl) {
    creditsEl.innerHTML = CAPTIONS.map(function (c) { return '<li>' + c[0] + '</li>'; }).join('');
  }

  /* ======================================================================
     2) Speisekarte
     ==================================================================== */
  var MENU = window.BB_MENU || [];
  var tabsEl = $('#menuTabs');
  var gridEl = $('#menuGrid');
  var euro = function (p) { return p.toFixed(2).replace('.', ',') + ' €'; };
  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
    });
  };

  function renderMenu(key, animate) {
    var cat = MENU.filter(function (c) { return c.key === key; })[0];
    if (!cat || !gridEl) return;
    gridEl.setAttribute('aria-labelledby', 'tab-' + key);
    gridEl.innerHTML = cat.items.map(function (it) {
      var tags = '';
      if (it.r) tags += '<span class="tag tag--hot">#' + it.r + ' beliebt</span>';
      if (it.v) tags += '<span class="tag tag--veg">Vegetarisch</span>';
      return '<article class="dish">' +
        '<div class="dish__head"><h3 class="dish__name">' + esc(it.n) + '</h3><span class="dish__dots" aria-hidden="true"></span>' +
        '<span class="dish__price">' + euro(it.p) + '</span></div>' +
        (it.d ? '<p class="dish__desc">' + esc(it.d) + '</p>' : '') +
        '<div class="dish__tags">' + tags + '</div></article>';
    }).join('');
    if (animate && motion) {
      gsap.fromTo(gridEl.children, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.02, ease: 'power2.out' });
    }
    if (hasGSAP) ScrollTrigger.refresh();
  }

  if (tabsEl && MENU.length) {
    tabsEl.innerHTML = MENU.map(function (c, i) {
      return '<button class="menu__tab" role="tab" type="button" id="tab-' + c.key + '" data-key="' + c.key + '" aria-controls="menuGrid" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' +
        c.label + '<small>' + c.items.length + '</small></button>';
    }).join('');
    var tabs = $$('.menu__tab', tabsEl);
    var select = function (btn, focus) {
      tabs.forEach(function (t) {
        var on = t === btn;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
      });
      if (focus) btn.focus();
      renderMenu(btn.dataset.key, true);
    };
    tabsEl.addEventListener('click', function (e) {
      var btn = e.target.closest('.menu__tab');
      if (btn && btn.getAttribute('aria-selected') !== 'true') select(btn);
    });
    tabsEl.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); select(next, true); }
    });
    renderMenu(MENU[0].key, false);
  }

  /* ======================================================================
     3) Öffnungszeiten & Live-Status (Zeitzone Europe/Berlin)
     ==================================================================== */
  var HOURS = {
    0: [[15, 0, 22, 0]],
    1: [],
    2: [[17, 0, 21, 30]],
    3: [[11, 0, 14, 0], [17, 0, 21, 30]],
    4: [[17, 0, 21, 30]],
    5: [[16, 0, 23, 0]],
    6: [[16, 0, 23, 0]]
  };
  var DAY_NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

  function berlinNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Berlin', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      }).formatToParts(new Date());
      var get = function (t) { return parts.filter(function (p) { return p.type === t; })[0].value; };
      return {
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')),
        min: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10)
      };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function updateStatus() {
    var el = $('#openStatus');
    if (!el) return;
    var now = berlinNow();
    var hm = function (m) { return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
    var today = HOURS[now.day].map(function (s) { return [s[0] * 60 + s[1], s[2] * 60 + s[3]]; });
    var open = today.filter(function (s) { return now.min >= s[0] && now.min < s[1]; })[0];
    var text;
    if (open) {
      text = 'Jetzt geöffnet · bis ' + hm(open[1]) + ' Uhr';
    } else {
      var later = today.filter(function (s) { return now.min < s[0]; })[0];
      if (later) {
        text = 'Gerade geschlossen · öffnet heute um ' + hm(later[0]) + ' Uhr';
      } else {
        for (var k = 1; k <= 7; k++) {
          var d = (now.day + k) % 7;
          if (HOURS[d].length) {
            var s = HOURS[d][0];
            text = 'Gerade geschlossen · öffnet ' + (k === 1 ? 'morgen' : DAY_NAMES[d]) + ' um ' + pad(s[0]) + ':' + pad(s[1]) + ' Uhr';
            break;
          }
        }
      }
    }
    el.classList.toggle('is-open', !!open);
    el.classList.toggle('is-closed', !open);
    $('span', el).textContent = text;
    $$('.hours tr').forEach(function (tr) {
      tr.classList.toggle('is-today', parseInt(tr.dataset.day, 10) === now.day);
    });
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ======================================================================
     4) Navigation (Mobile-Menü, Scroll-Zustände)
     ==================================================================== */
  var nav = $('#nav');
  var toggle = $('#navToggle');
  var mobileMenu = $('#mobileMenu');
  var lenis = null;

  function setMenu(open) {
    if (!toggle || !mobileMenu) return;
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    mobileMenu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (lenis) { open ? lenis.stop() : lenis.start(); }
    if (open && motion) {
      gsap.fromTo($$('a', mobileMenu), { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.05, duration: 0.5, ease: 'power3.out' });
    }
  }
  if (toggle) toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });

  // Ankerlinks (sanft, berücksichtigt gepinnte Sektionen)
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    setMenu(false);
    var dest = (target.parentElement && target.parentElement.classList.contains('pin-spacer')) ? target.parentElement : target;
    if (lenis) lenis.scrollTo(dest, { offset: 0, duration: 1.4 });
    else dest.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    if (history.replaceState) history.replaceState(null, '', id);
  });

  var lastY = 0;
  var tcEl = $('#timecode');
  function onScroll(y) {
    if (nav) {
      nav.classList.toggle('is-scrolled', y > 40);
      document.body.classList.toggle('promo-hidden', y > 160);
      var hide = y > 500 && y > lastY + 2 && (!toggle || toggle.getAttribute('aria-expanded') !== 'true');
      var show = y < lastY - 2 || y <= 500;
      if (hide) nav.style.transform = 'translateY(-110%)';
      else if (show) nav.style.transform = '';
    }
    if (tcEl) {
      var px = Math.max(0, y);
      var secs = Math.floor(px / 60);
      var fr = Math.floor(((px % 60) / 60) * 24);
      tcEl.textContent = pad(Math.floor(secs / 3600)) + ':' + pad(Math.floor(secs / 60) % 60) + ':' + pad(secs % 60) + ':' + pad(fr);
    }
    lastY = y;
  }

  /* ======================================================================
     Ohne Animation: alles sofort sichtbar
     ==================================================================== */
  if (!motion) {
    var leaderEl = $('#leader');
    if (leaderEl) leaderEl.parentNode.removeChild(leaderEl);
    document.body.classList.remove('is-loading');
    var film = $('#film');
    if (film) film.classList.add('is-done');
    window.addEventListener('scroll', function () { onScroll(window.scrollY); }, { passive: true });
    onScroll(window.scrollY);
    return;
  }

  /* ======================================================================
     5) GSAP + Lenis
     ==================================================================== */
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  if (window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true
    });
    lenis.on('scroll', function (e) { ScrollTrigger.update(); onScroll(e.scroll); });
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  } else {
    window.addEventListener('scroll', function () { onScroll(window.scrollY); }, { passive: true });
  }

  var navLinks = $$('.nav__links a');
  function setNavActive(id) {
    navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === id); });
  }

  /* ---------- Glut-Partikel im Opener --------------------------------- */
  var burst = function () {};
  (function embers() {
    var c = $('#embers');
    if (!c || !c.getContext) return;
    var ctx = c.getContext('2d');
    var w = 0, h = 0, parts = [], running = true;
    function resize() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn(p, anywhere) {
      p.x = Math.random() * w;
      p.y = anywhere ? Math.random() * h : h + Math.random() * h * 0.2;
      p.vx = (Math.random() - 0.5) * 0.35;
      p.vy = -(0.35 + Math.random() * 1.1);
      p.r = 0.6 + Math.random() * 1.9;
      p.life = 0; p.max = 220 + Math.random() * 320;
      p.burst = false; p.hue = 36 + Math.random() * 14;
      return p;
    }
    resize();
    window.addEventListener('resize', resize);
    var count = w < 700 ? 38 : 80;
    for (var i = 0; i < count; i++) parts.push(spawn({}, true));
    burst = function (n) {
      n = n || 90;
      for (var j = 0; j < n; j++) {
        var a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 8;
        parts.push({ x: w / 2, y: h * 0.44, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1.5, r: 0.8 + Math.random() * 2.4, life: 0, max: 45 + Math.random() * 55, burst: true, hue: 40 + Math.random() * 16 });
      }
    };
    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (var k = parts.length - 1; k >= 0; k--) {
        var p = parts[k];
        p.life++;
        p.x += p.vx + (p.burst ? 0 : Math.sin((p.life + k) * 0.03) * 0.3);
        p.y += p.vy;
        if (p.burst) { p.vy += 0.13; p.vx *= 0.985; }
        var t = p.life / p.max;
        var alpha = p.burst ? (1 - t) : Math.sin(Math.min(1, t) * Math.PI) * 0.85;
        ctx.beginPath();
        ctx.fillStyle = 'hsla(' + p.hue + ',100%,' + (p.burst ? 66 : 58) + '%,' + Math.max(0, alpha).toFixed(3) + ')';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (p.life >= p.max || p.y < -20) {
          if (p.burst) parts.splice(k, 1); else spawn(p, false);
        }
      }
      requestAnimationFrame(tick);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var vis = entries[0].isIntersecting;
        if (vis && !running) { running = true; requestAnimationFrame(tick); }
        running = vis;
      }).observe($('.hero'));
    }
    requestAnimationFrame(tick);
  })();

  /* ---------- Opener: Kamera-Shake ------------------------------------ */
  function shake(strength) {
    strength = strength || 1;
    gsap.fromTo(['.hero__title', '.hero__bg'], { x: 0, y: 0 }, {
      x: function () { return gsap.utils.random(-14, 14) * strength; },
      y: function () { return gsap.utils.random(-9, 9) * strength; },
      duration: 0.045, repeat: 7, yoyo: true, ease: 'none', repeatRefresh: true,
      onComplete: function () { gsap.set(['.hero__title', '.hero__bg'], { x: 0, y: 0 }); }
    });
  }

  /* ---------- Opener: Intro-Sequenz ----------------------------------- */
  function heroIntro(onUnlock) {
    gsap.set('.hero .bars i', { height: '50vh' });
    document.body.classList.remove('is-loading');

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.hero .bars i', { height: '9vh', duration: 1.25, ease: 'expo.inOut' }, 0);
    tl.fromTo('.hero__bg img', { scale: 1.45 }, { scale: 1, duration: 2.8, ease: 'power2.out' }, 0);
    tl.fromTo('.hero__kicker', { autoAlpha: 0, letterSpacing: '1.3em' }, { autoAlpha: 1, letterSpacing: '0.5em', duration: 1.1 }, 0.45);

    var t1 = 0.75;
    tl.fromTo('.hero__line--1 .ch',
      { yPercent: -150, scale: 2.3, autoAlpha: 0, filter: 'blur(16px)' },
      { yPercent: 0, scale: 1, autoAlpha: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power4.in', stagger: 0.075, clearProps: 'filter' }, t1);
    var impact1 = t1 + 0.5 + 0.075 * 4;
    tl.call(function () { shake(1); burst(110); }, null, impact1);
    tl.fromTo('.hero__shock', { scale: 0, autoAlpha: 1 }, { scale: 3.2, autoAlpha: 0, duration: 1, ease: 'power2.out' }, impact1);

    tl.fromTo('.hero__line--2 .ch', { yPercent: -220, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.42, ease: 'power4.in', stagger: 0.06 }, impact1 + 0.15);
    var impact2 = impact1 + 0.15 + 0.42 + 0.12;
    tl.to('.hero__line--2', { scaleY: 0.5, scaleX: 1.2, duration: 0.08, ease: 'power2.in' }, impact2);
    tl.to('.hero__line--2', { scaleY: 1, scaleX: 1, duration: 0.9, ease: 'elastic.out(1, 0.32)' }, impact2 + 0.08);
    tl.call(function () { shake(0.6); burst(50); }, null, impact2 + 0.06);

    tl.fromTo(['.hero__tag', '.hero__cta', '.hero__billing', '.scroll-cue'],
      { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1 }, impact2 + 0.3);
    tl.call(onUnlock, null, impact2 + 0.3);
    return tl;
  }

  /* ---------- Film-Vorlauf (3-2-1) ------------------------------------ */
  function playLeader(done) {
    var leader = $('#leader');
    if (!leader) { done(); return; }
    var seen = false;
    try { seen = sessionStorage.getItem('bb-leader') === '1'; } catch (e) { seen = false; }
    if (seen) { leader.parentNode.removeChild(leader); done(); return; }

    var num = $('#leaderNum');
    var sweep = $('.leader__sweep', leader);
    var step = 0.44;
    var tl = gsap.timeline({
      onComplete: function () {
        try { sessionStorage.setItem('bb-leader', '1'); } catch (e) { /* ignorieren */ }
        if (leader.parentNode) leader.parentNode.removeChild(leader);
        done();
      }
    });
    [3, 2, 1].forEach(function (n, i) {
      tl.call(function () { num.textContent = n; }, null, i * step);
      tl.fromTo(sweep, { '--a': '0deg' }, { '--a': '360deg', duration: step, ease: 'none' }, i * step);
      tl.fromTo(num, { scale: 1.18, autoAlpha: 0.5 }, { scale: 1, autoAlpha: 1, duration: 0.22, ease: 'power2.out' }, i * step);
    });
    tl.to(leader, { backgroundColor: '#ffc700', duration: 0.06 }, 3 * step);
    tl.to(leader, { autoAlpha: 0, duration: 0.3 }, 3 * step + 0.06);
    var skip = function () { if (tl.progress() < 1) tl.progress(1); };
    leader.addEventListener('click', skip);
    window.addEventListener('keydown', skip, { once: true });
  }

  /* ---------- Opener beim Scrollen: Kamerafahrt ---------------------- */
  gsap.timeline({
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  })
    .to('.hero__inner', { yPercent: -10, scale: 1.12, autoAlpha: 0, ease: 'none' }, 0)
    .to('.hero__bg', { scale: 1.18, ease: 'none' }, 0)
    .to('.bars__top', { yPercent: -100, ease: 'none' }, 0)
    .to('.bars__bottom', { yPercent: 100, ease: 'none' }, 0);

  /* ---------- DER FILM: Burger Schicht für Schicht -------------------- */
  (function film() {
    var filmEl = $('#film');
    var wrap = $('#burgerWrap');
    if (!filmEl || !N) return;
    var caps = $$('.cap');
    var credits = $$('#credits li');
    var hudScene = $('#hudScene');
    var progressBar = $('#filmProgress');
    var wide = function () { return window.innerWidth > 900; };
    var fallY = function () { return -window.innerHeight * 1.05; };
    var LAND = 0.7;         // Dauer des Falls
    var START = 0.6;        // Start der ersten Zutat
    var END = START + N;    // alle Zutaten gelandet

    gsap.set(wrap, { x: 0, y: 0, xPercent: -50, yPercent: -50 });

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      onUpdate: function () { sync(tl.time(), tl.duration()); },
      scrollTrigger: {
        trigger: filmEl,
        start: 'top top',
        end: function () { return '+=' + Math.round(window.innerHeight * (N * 0.62 + 2.8)); },
        pin: true,
        scrub: 0.7,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onToggle: function (self) {
          filmEl.classList.toggle('is-active', self.isActive);
          document.body.classList.toggle('in-film', self.isActive);
          if (self.isActive) setNavActive('#film');
        }
      }
    });

    tl.to('.film__intro', { autoAlpha: 0, duration: 0.35 }, 0.1);
    tl.to('.film__intro > *', { y: -30, stagger: 0.04, duration: 0.35 }, 0.05);

    layers.forEach(function (el, i) {
      var at = START + i;
      var dir = i % 2 ? 1 : -1;
      var rot = dir * (9 + (i * 7) % 15);
      var dx = dir * (30 + (i * 23) % 70);
      tl.fromTo(el, { y: fallY, x: dx, rotation: rot }, { y: 0, x: 0, rotation: 0, duration: LAND, ease: 'power2.in' }, at);
      tl.fromTo(el, { scaleY: 0.8, scaleX: 1.07 }, { scaleY: 1, scaleX: 1, duration: 0.3, ease: 'back.out(2.5)', immediateRender: false }, at + LAND);
      var ring = el.querySelector('.layer__impact');
      if (ring) tl.fromTo(ring, { scale: 0.4, autoAlpha: 0.95 }, { scale: 1.5, autoAlpha: 0, duration: 0.4, ease: 'power2.out', immediateRender: false }, at + LAND);
      if (i > 0) tl.fromTo(layers.slice(0, i), { y: 0 }, { y: 4, duration: 0.1, yoyo: true, repeat: 1, ease: 'power1.out', immediateRender: false }, at + LAND);
      if (caps[i]) tl.fromTo(caps[i], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.3, immediateRender: false }, at + 0.18);
      if (i > 0 && caps[i - 1]) tl.to(caps[i - 1], { autoAlpha: 0, y: -40, duration: 0.18 }, at - 0.02);
    });

    // Finale: Smash, Blitz, Titel, Angebot
    if (caps[N - 1]) tl.to(caps[N - 1], { autoAlpha: 0, y: -40, duration: 0.3 }, END + 0.25);
    tl.to('#burger', { scaleY: 0.86, scaleX: 1.06, duration: 0.12, ease: 'power2.in' }, END + 0.05);
    tl.to('#burger', { scaleY: 1, scaleX: 1, duration: 0.55, ease: 'elastic.out(1, 0.35)' }, END + 0.17);
    tl.fromTo('.film__flash', { autoAlpha: 0 }, { autoAlpha: 0.7, duration: 0.06, immediateRender: false }, END + 0.12);
    tl.to('.film__flash', { autoAlpha: 0, duration: 0.45 }, END + 0.18);
    tl.fromTo('.film__bigtitle span', { autoAlpha: 0, scale: 1.5 }, { autoAlpha: 1, scale: 1, stagger: 0.12, duration: 0.6, ease: 'power3.out', immediateRender: false }, END + 0.2);
    tl.to('.film__credits', { autoAlpha: 0, duration: 0.4 }, END + 0.4);
    tl.to('.film__bigtitle', {
      x: function () { return wide() ? -window.innerWidth * 0.18 : 0; },
      duration: 0.9, ease: 'power2.inOut'
    }, END + 0.7);
    tl.to(wrap, {
      x: function () { return wide() ? -window.innerWidth * 0.2 : 0; },
      y: function () { return wide() ? 0 : -window.innerHeight * 0.12; },
      scale: function () { return wide() ? 0.95 : 0.74; },
      duration: 0.9, ease: 'power2.inOut'
    }, END + 0.7);
    tl.fromTo('#final', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05, immediateRender: false }, END + 1.1);
    tl.fromTo('#final > *', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'power3.out', immediateRender: false }, END + 1.1);
    tl.to({}, { duration: 0.9 });

    function sync(t, total) {
      var landed = 0;
      for (var i = 0; i < N; i++) if (t >= START + i + LAND) landed++;
      var current = t < START ? -1 : Math.min(N - 1, Math.floor(t - START));
      credits.forEach(function (li, j) {
        li.classList.toggle('is-on', j < landed);
        li.classList.toggle('is-current', j === current && j >= landed);
      });
      if (hudScene && filmEl.classList.contains('is-active')) {
        hudScene.textContent = t >= END ? 'BEBE SPEZIAL' : 'SZENE ' + pad(Math.max(0, current) + 1) + ' / ' + pad(N);
      }
      if (progressBar) progressBar.style.transform = 'scaleX(' + Math.min(1, t / total).toFixed(4) + ')';
      filmEl.classList.toggle('is-done', t >= END + 0.3);
    }
  })();

  /* ---------- Filmstreifen (Desktop: horizontal gepinnt) ------------- */
  var mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', function () {
    var track = $('#stripTrack');
    if (!track) return;
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
    gsap.to(track, {
      x: function () { return -dist(); },
      ease: 'none',
      scrollTrigger: {
        trigger: '.story', start: 'top top',
        end: function () { return '+=' + dist(); },
        pin: true, scrub: 0.6, invalidateOnRefresh: true
      }
    });
  });

  /* ---------- Bestseller-Poster: leichte 3D-Neigung ------------------ */
  if (window.matchMedia('(hover: hover)').matches) {
    $$('.poster').forEach(function (p) {
      p.addEventListener('pointermove', function (e) {
        var r = p.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(p, { rotateY: x * 8, rotateX: -y * 8, transformPerspective: 900, duration: 0.5, ease: 'power2.out' });
      });
      p.addEventListener('pointerleave', function () { gsap.to(p, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'power3.out' }); });
    });
  }

  /* ---------- HUD-Szenen & aktive Navigation ------------------------- */
  var SCENES = [
    ['#top', 'OPENER'], ['#bestseller', 'BESTSELLER'], ['#speisekarte', 'SPEISEKARTE'],
    ['#story', 'HINTER DEN KULISSEN'], ['#stimmen', 'KRITIKEN'], ['#standort', 'DREHORT'], ['.footer', 'ABSPANN']
  ];
  var hud = $('#hudScene');
  SCENES.forEach(function (s) {
    var el = $(s[0]);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el, start: 'top 55%', end: 'bottom 55%',
      onToggle: function (self) {
        if (s[0] === '#top') document.body.classList.toggle('hud-off', self.isActive);
        if (!self.isActive) return;
        if (hud) hud.textContent = s[1];
        setNavActive(s[0]);
      }
    });
  });

  /* ---------- Reveals ------------------------------------------------- */
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%', once: true,
    onEnter: function (els) {
      gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', overwrite: true });
    }
  });

  /* ---------- „The End“ ---------------------------------------------- */
  gsap.from('.footer__endword', {
    scale: 0.6, autoAlpha: 0, letterSpacing: '0.3em', ease: 'power3.out',
    scrollTrigger: { trigger: '.footer', start: 'top 80%', end: 'top 30%', scrub: 1 }
  });

  /* ---------- Start ---------------------------------------------------- */
  var started = false;
  function start() {
    if (started) return;
    started = true;
    playLeader(function () {
      heroIntro(function () {
        if (lenis) lenis.start();
        ScrollTrigger.refresh();
      });
    });
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(start);
    setTimeout(start, 2500);
  } else {
    start();
  }
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  onScroll(window.scrollY);
})();
