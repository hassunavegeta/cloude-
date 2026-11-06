/* ==========================================================================
   BB SMASH IT – Burger-Generator
   Zeichnet jede Zutat des „Bebe Spezial“ als eigene SVG-Schicht.
   Alle Formen werden deterministisch (Seed) erzeugt, damit der Burger
   bei jedem Laden identisch aussieht.
   Koordinatensystem: Rahmen 440 × 420 Einheiten.
   ========================================================================== */
(function () {
  'use strict';

  var FRAME_W = 440;
  var FRAME_H = 420;

  /* ---------- Hilfsfunktionen ------------------------------------------- */
  function rng(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function f(n) { return Math.round(n * 10) / 10; }

  /* geschlossener, geglätteter Pfad durch Punkte (Catmull-Rom -> Bézier) */
  function smoothClosed(pts) {
    var n = pts.length;
    var d = 'M' + f(pts[0][0]) + ',' + f(pts[0][1]);
    for (var i = 0; i < n; i++) {
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += 'C' + f(c1x) + ',' + f(c1y) + ' ' + f(c2x) + ',' + f(c2y) + ' ' + f(p2[0]) + ',' + f(p2[1]);
    }
    return d + 'Z';
  }

  /* unregelmäßige Ellipse */
  function blob(cx, cy, rx, ry, n, noise, r, mod) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var t = (i / n) * Math.PI * 2;
      var k = 1 + (r() - 0.5) * noise;
      var p = [cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k];
      if (mod) p = mod(p, t, k);
      pts.push(p);
    }
    return smoothClosed(pts);
  }

  function svg(h, inner, cls) {
    return '<svg class="layer-svg ' + (cls || '') + '" viewBox="0 0 ' + FRAME_W + ' ' + h +
      '" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">' + inner + '</svg>';
  }

  /* ---------- Gemeinsame Verläufe & Filter ------------------------------ */
  var DEFS =
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
      '<radialGradient id="gBunTop" cx="36%" cy="26%" r="78%">' +
        '<stop offset="0" stop-color="#FFD98F"/><stop offset=".3" stop-color="#F6AE4C"/>' +
        '<stop offset=".68" stop-color="#DD7F2C"/><stop offset="1" stop-color="#9A4A15"/></radialGradient>' +
      '<linearGradient id="gBunSide" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#E9A24A"/><stop offset=".55" stop-color="#C9732A"/>' +
        '<stop offset="1" stop-color="#8E4615"/></linearGradient>' +
      '<radialGradient id="gCrumb" cx="50%" cy="45%" r="60%">' +
        '<stop offset="0" stop-color="#FCE7B8"/><stop offset=".75" stop-color="#F2CB86"/>' +
        '<stop offset="1" stop-color="#E0A85E"/></radialGradient>' +
      '<radialGradient id="gPattyTop" cx="45%" cy="40%" r="62%">' +
        '<stop offset="0" stop-color="#7C4526"/><stop offset=".6" stop-color="#5A2E16"/>' +
        '<stop offset=".92" stop-color="#3B1D0C"/><stop offset="1" stop-color="#2A1307"/></radialGradient>' +
      '<linearGradient id="gPattySide" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#4E2814"/><stop offset=".6" stop-color="#341909"/><stop offset="1" stop-color="#1E0C04"/></linearGradient>' +
      '<linearGradient id="gCheese" x1="0" y1="0" x2="0.35" y2="1">' +
        '<stop offset="0" stop-color="#FFD34D"/><stop offset=".55" stop-color="#FFB81C"/>' +
        '<stop offset="1" stop-color="#F09A00"/></linearGradient>' +
      '<linearGradient id="gCheese2" x1="0" y1="0" x2="0.35" y2="1">' +
        '<stop offset="0" stop-color="#FFC93A"/><stop offset=".55" stop-color="#FCAA12"/>' +
        '<stop offset="1" stop-color="#E58C00"/></linearGradient>' +
      '<radialGradient id="gPickle" cx="50%" cy="50%" r="55%">' +
        '<stop offset="0" stop-color="#E3EA9C"/><stop offset=".55" stop-color="#B4C95B"/>' +
        '<stop offset=".85" stop-color="#7E9C33"/><stop offset="1" stop-color="#4F6B1C"/></radialGradient>' +
      '<radialGradient id="gTomato" cx="50%" cy="50%" r="55%">' +
        '<stop offset="0" stop-color="#FF9A7A"/><stop offset=".55" stop-color="#F2533A"/>' +
        '<stop offset="1" stop-color="#C42A1D"/></radialGradient>' +
      '<linearGradient id="gLettuce" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#C6EC78"/><stop offset=".5" stop-color="#7CC344"/>' +
        '<stop offset="1" stop-color="#3E8A2B"/></linearGradient>' +
      '<linearGradient id="gLettuce2" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#DDF59C"/><stop offset="1" stop-color="#8FCF52"/></linearGradient>' +
      '<linearGradient id="gSauce" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#FFB06A"/><stop offset="1" stop-color="#E7672C"/></linearGradient>' +
      '<filter id="fBlur4" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>' +
      '<filter id="fBlur8" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="8"/></filter>' +
    '</defs></svg>';

  /* ---------- Zutaten ---------------------------------------------------- */

  function bunBottom() {
    var r = rng(11), dots = '';
    for (var i = 0; i < 70; i++) {
      var t = r() * Math.PI * 2, k = Math.sqrt(r()) * 0.92;
      dots += '<ellipse cx="' + f(220 + Math.cos(t) * 168 * k) + '" cy="' + f(28 + Math.sin(t) * 21 * k) +
        '" rx="' + f(0.8 + r() * 2.4) + '" ry="' + f(0.5 + r() * 1) + '" fill="#C88A3F" opacity="' + f(0.2 + r() * 0.4) + '"/>';
    }
    return svg(120,
      '<path d="M40,28 C40,82 76,113 136,116 L304,116 C364,113 400,82 400,28 Z" fill="url(#gBunSide)"/>' +
      '<path d="M58,60 C96,84 160,90 220,90 C280,90 344,84 382,60" stroke="#FFD58C" stroke-opacity=".28" stroke-width="7" fill="none" stroke-linecap="round" filter="url(#fBlur4)"/>' +
      '<path d="M70,104 C110,114 160,116 220,116 C280,116 330,114 370,104" stroke="#6E3510" stroke-opacity=".45" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="220" cy="28" rx="180" ry="25" fill="#D99442"/>' +
      '<ellipse cx="220" cy="27" rx="174" ry="22.5" fill="url(#gCrumb)"/>' + dots
    );
  }

  function sauce() {
    var r = rng(23);
    var d = blob(220, 18, 170, 19, 46, 0.07, r);
    var drips = '';
    [138, 196, 251, 306, 352].forEach(function (x, i) {
      var dx = (x - 220) / 170;
      var ye = 18 + 19 * Math.sqrt(Math.max(0, 1 - dx * dx)) - 4;
      var L = 8 + ((i * 7) % 15);
      var w = 5 + (i % 2) * 2;
      drips += '<path d="M' + f(x - w) + ',' + f(ye) + ' L' + f(x - w + 1) + ',' + f(ye + L) +
        ' Q' + f(x) + ',' + f(ye + L + w * 1.3) + ' ' + f(x + w - 1) + ',' + f(ye + L) + ' L' + f(x + w) + ',' + f(ye) + ' Z" fill="url(#gSauce)"/>';
    });
    return svg(52,
      '<path d="' + d + '" fill="url(#gSauce)"/>' + drips +
      '<ellipse cx="160" cy="12" rx="38" ry="4" fill="#fff" opacity=".35" filter="url(#fBlur4)"/>' +
      '<ellipse cx="282" cy="16" rx="18" ry="2.5" fill="#fff" opacity=".4"/>'
    );
  }

  function patty() {
    var r = rng(37);
    var d = blob(220, 26, 202, 25, 96, 0.11, r, function (p, t) {
      // gelegentliche „Lace“-Zacken am Rand
      var spike = (Math.sin(t * 23) > 0.86) ? 1.035 : 1;
      return [220 + (p[0] - 220) * spike, 26 + (p[1] - 26) * spike];
    });
    var body = '';
    for (var k = 26; k >= 2; k -= 4) {
      body += '<path d="' + d + '" transform="translate(0 ' + k + ')" fill="url(#gPattySide)"/>';
    }
    var spots = '';
    for (var i = 0; i < 120; i++) {
      var t = r() * Math.PI * 2, q = Math.sqrt(r()) * 0.94;
      var dark = r() > 0.45;
      spots += '<circle cx="' + f(220 + Math.cos(t) * 196 * q) + '" cy="' + f(26 + Math.sin(t) * 23 * q) +
        '" r="' + f(0.8 + r() * 3.2) + '" fill="' + (dark ? '#22100a' : '#A8754A') + '" opacity="' + f(dark ? 0.35 + r() * 0.35 : 0.25 + r() * 0.3) + '"/>';
    }
    // knusprige Kruste an der Seite
    var crust = '';
    for (var j = 0; j < 46; j++) {
      var a = Math.PI * (0.05 + r() * 0.9);
      crust += '<circle cx="' + f(220 + Math.cos(a) * 198) + '" cy="' + f(26 + Math.sin(a) * 25 + 8 + r() * 16) +
        '" r="' + f(1 + r() * 2.4) + '" fill="#6A3A1C" opacity="' + f(0.35 + r() * 0.4) + '"/>';
    }
    return svg(84,
      body + crust +
      '<path d="' + d + '" fill="url(#gPattyTop)" stroke="#1D0D05" stroke-width="1.6"/>' + spots +
      '<ellipse cx="170" cy="18" rx="70" ry="7" fill="#FFE2B8" opacity=".14" filter="url(#fBlur4)"/>'
    );
  }

  function cheese(mirror, grad, seed) {
    var path =
      'M220,6 L372,17 Q402,20 405,36 Q408,54 401,63 Q395,70 392,59 Q390,47 378,43 L262,47 ' +
      'Q248,49 246,62 Q244,77 232,77 Q221,77 221,65 Q221,52 206,49 L78,41 Q60,42 56,54 ' +
      'Q53,65 45,63 Q37,58 38,44 Q39,22 66,18 Z';
    var tr = mirror ? ' transform="translate(440 0) scale(-1 1)"' : '';
    return svg(82,
      '<g' + tr + '>' +
        '<path d="' + path + '" fill="url(#' + grad + ')" stroke="#D98200" stroke-width="1.4" stroke-linejoin="round"/>' +
        '<path d="M86,26 L220,13 L356,24" stroke="#FFF3B0" stroke-opacity=".55" stroke-width="3" fill="none" stroke-linecap="round" filter="url(#fBlur4)"/>' +
        '<ellipse cx="236" cy="66" rx="3.5" ry="6" fill="#FFF0A6" opacity=".55"/>' +
        '<ellipse cx="399" cy="50" rx="2.2" ry="5" fill="#FFF0A6" opacity=".5"/>' +
      '</g>', 'cheese' + (seed || '')
    );
  }

  function pickles() {
    var r = rng(53), out = '';
    [[104, 18, 30], [168, 13, 32], [236, 19, 31], [300, 14, 30], [352, 21, 28]].forEach(function (p) {
      var cx = p[0], cy = p[1], rx = p[2], ry = rx * 0.29;
      var seeds = '';
      for (var i = 0; i < 7; i++) {
        var a = (i / 7) * Math.PI * 2 + r();
        seeds += '<ellipse cx="' + f(cx + Math.cos(a) * rx * 0.42) + '" cy="' + f(cy + Math.sin(a) * ry * 0.42) +
          '" rx="2.2" ry="1" fill="#F4F7CF" opacity=".9"/>';
      }
      out += '<ellipse cx="' + cx + '" cy="' + (cy + 3) + '" rx="' + rx + '" ry="' + f(ry) + '" fill="#3C5513"/>' +
        '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + f(ry) + '" fill="url(#gPickle)"/>' +
        '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + f(rx * 0.7) + '" ry="' + f(ry * 0.7) + '" fill="none" stroke="#8FAE3E" stroke-width="1.3"/>' +
        seeds;
    });
    return svg(40, out);
  }

  function jalapenos() {
    var out = '';
    [[96, 16], [146, 10], [196, 18], [250, 11], [298, 19], [344, 12], [222, 4]].forEach(function (p, i) {
      var cx = p[0], cy = p[1] + 6, rx = 15 + (i % 3), ry = 5;
      out += '<ellipse cx="' + cx + '" cy="' + (cy + 2.5) + '" rx="' + rx + '" ry="' + ry + '" fill="#1E5A21"/>' +
        '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#D9EDA2" stroke="#2F8A35" stroke-width="4.5"/>' +
        '<circle cx="' + (cx - 4) + '" cy="' + cy + '" r="1.6" fill="#FFF8DC"/>' +
        '<circle cx="' + (cx + 3) + '" cy="' + (cy - 1) + '" r="1.6" fill="#FFF8DC"/>' +
        '<circle cx="' + cx + '" cy="' + (cy + 1.5) + '" r="1.4" fill="#FFF8DC"/>';
    });
    return svg(36, out);
  }

  function onions() {
    var out = '';
    [[118, 18, 44], [196, 13, 50], [270, 19, 46], [336, 14, 40]].forEach(function (p) {
      var cx = p[0], cy = p[1], rx = p[2], ry = rx * 0.22;
      out += '<ellipse cx="' + cx + '" cy="' + (cy + 2) + '" rx="' + rx + '" ry="' + f(ry) + '" fill="none" stroke="#5E1F55" stroke-width="7" opacity=".7"/>' +
        '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + f(ry) + '" fill="none" stroke="#A9469A" stroke-width="7"/>' +
        '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + f(rx - 3.5) + '" ry="' + f(ry - 1.2) + '" fill="none" stroke="#F1D3EC" stroke-width="2"/>' +
        '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + f(rx * 0.58) + '" ry="' + f(ry * 0.58) + '" fill="none" stroke="#B957A9" stroke-width="5"/>' +
        '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + f(rx * 0.58 - 2.5) + '" ry="' + f(ry * 0.58 - 1) + '" fill="none" stroke="#F4DDF0" stroke-width="1.5"/>';
    });
    return svg(36, out);
  }

  function tomato() {
    var out = '';
    function slice(cx, cy) {
      var rx = 70, ry = 15, ch = '';
      for (var i = 0; i < 4; i++) {
        var a = (i / 4) * Math.PI * 2 + 0.4;
        var x = cx + Math.cos(a) * rx * 0.5, y = cy + Math.sin(a) * ry * 0.5;
        ch += '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="15" ry="4.2" fill="#FF7E5F"/>' +
          '<circle cx="' + f(x - 5) + '" cy="' + f(y) + '" r="1.4" fill="#FFE7A8"/>' +
          '<circle cx="' + f(x + 1) + '" cy="' + f(y + 1) + '" r="1.4" fill="#FFE7A8"/>' +
          '<circle cx="' + f(x + 6) + '" cy="' + f(y - 0.5) + '" r="1.4" fill="#FFE7A8"/>';
      }
      return '<ellipse cx="' + cx + '" cy="' + (cy + 8) + '" rx="' + rx + '" ry="' + ry + '" fill="#9C1715"/>' +
        '<rect x="' + (cx - rx) + '" y="' + cy + '" width="' + (rx * 2) + '" height="8" fill="#9C1715"/>' +
        '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="url(#gTomato)" stroke="#B11F17" stroke-width="3"/>' +
        ch + '<ellipse cx="' + cx + '" cy="' + cy + '" rx="9" ry="3" fill="#FFB49E"/>';
    }
    out += slice(138, 18) + slice(302, 18) + slice(220, 14);
    return svg(44, out);
  }

  function lettuce() {
    var r = rng(71);
    function leaf(rx, ry, cy, phase, droop, grad, seed) {
      var rr = rng(seed), pts = [], n = 140;
      for (var i = 0; i < n; i++) {
        var t = (i / n) * Math.PI * 2;
        var k = 1 + 0.055 * Math.sin(t * 13 + phase) + 0.03 * Math.sin(t * 31 + phase * 2) + (rr() - 0.5) * 0.02;
        var x = 220 + Math.cos(t) * rx * k;
        var s = Math.sin(t);
        var y = cy + s * ry * k + (s > 0 ? s * droop * (0.55 + 0.45 * Math.sin(t * 6 + phase)) : 0);
        pts.push([x, y]);
      }
      return '<path d="' + smoothClosed(pts) + '" fill="url(#' + grad + ')" stroke="#3A7F25" stroke-width="1.2"/>';
    }
    var veins = '';
    for (var i = 0; i < 9; i++) {
      var x0 = 90 + i * 32 + r() * 10;
      veins += '<path d="M' + f(x0) + ',' + f(26 + r() * 6) + ' q' + f(6 + r() * 6) + ',' + f(10 + r() * 6) + ' ' + f(2 + r() * 6) + ',' + f(22 + r() * 8) +
        '" stroke="#E9F8C6" stroke-opacity=".55" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
    }
    return svg(76,
      leaf(212, 26, 26, 0.3, 12, 'gLettuce', 5) +
      leaf(186, 20, 22, 2.1, 8, 'gLettuce2', 9) + veins
    );
  }

  function bunTop() {
    var r = rng(97), mottle = '';
    for (var i = 0; i < 30; i++) {
      var t = Math.PI + 0.25 + r() * (Math.PI - 0.5), k = 0.2 + r() * 0.75;
      mottle += '<ellipse cx="' + f(220 + Math.cos(t) * 180 * k) + '" cy="' + f(152 + Math.sin(t) * 138 * k) +
        '" rx="' + f(6 + r() * 16) + '" ry="' + f(3 + r() * 7) + '" fill="#B5591A" opacity="' + f(0.06 + r() * 0.1) + '"/>';
    }
    return svg(176,
      '<path d="M36,150 C30,68 112,10 220,10 C328,10 410,68 404,150 C404,160 330,170 220,170 C110,170 36,160 36,150 Z" fill="url(#gBunTop)"/>' +
      mottle +
      '<path d="M44,146 C80,160 150,165 220,165 C290,165 360,160 396,146" stroke="#6E3410" stroke-opacity=".55" stroke-width="7" fill="none" stroke-linecap="round" filter="url(#fBlur4)"/>' +
      '<ellipse cx="156" cy="52" rx="92" ry="22" transform="rotate(-12 156 52)" fill="#FFF6DE" opacity=".33" filter="url(#fBlur8)"/>' +
      '<ellipse cx="140" cy="48" rx="34" ry="8" transform="rotate(-16 140 48)" fill="#FFFBEF" opacity=".55" filter="url(#fBlur4)"/>' +
      '<path d="M330,40 C360,60 380,90 388,120" stroke="#FFE6B0" stroke-opacity=".25" stroke-width="6" fill="none" stroke-linecap="round" filter="url(#fBlur4)"/>'
    );
  }

  /* ---------- Schichten (von unten nach oben) --------------------------- */
  var LAYERS = [
    { key: 'bun-bottom', name: 'Brioche Bun',        svg: bunBottom, h: 120, top: 300 },
    { key: 'sauce',      name: 'Haussauce',          svg: sauce,     h: 52,  top: 306 },
    { key: 'patty',      name: 'Smashed Beef Patty', svg: patty,     h: 84,  top: 263 },
    { key: 'cheese-1',   name: 'Cheddar',            svg: function () { return cheese(false, 'gCheese', 1); },  h: 82, top: 259 },
    { key: 'cheese-2',   name: 'Noch mehr Cheddar',  svg: function () { return cheese(true, 'gCheese2', 2); },  h: 82, top: 251 },
    { key: 'pickles',    name: 'Gurken',             svg: pickles,   h: 40,  top: 250 },
    { key: 'jalapenos',  name: 'Jalapeños',          svg: jalapenos, h: 36,  top: 232 },
    { key: 'onions',     name: 'Rote Zwiebeln',      svg: onions,    h: 36,  top: 224 },
    { key: 'tomato',     name: 'Tomate',             svg: tomato,    h: 44,  top: 208 },
    { key: 'lettuce',    name: 'Salat',              svg: lettuce,   h: 76,  top: 170 },
    { key: 'bun-top',    name: 'Brioche Top Bun',    svg: bunTop,    h: 176, top: 40 }
  ];

  function build(frame) {
    if (!document.getElementById('bb-burger-defs')) {
      var holder = document.createElement('div');
      holder.id = 'bb-burger-defs';
      holder.innerHTML = DEFS;
      document.body.appendChild(holder);
    }
    var els = [];
    LAYERS.forEach(function (L, i) {
      var el = document.createElement('div');
      el.className = 'layer layer--' + L.key;
      el.dataset.index = i;
      el.style.top = (L.top / FRAME_H * 100) + '%';
      el.style.height = (L.h / FRAME_H * 100) + '%';
      el.style.zIndex = 10 + i;
      el.innerHTML = L.svg();
      frame.appendChild(el);
      els.push(el);
    });
    return els;
  }

  window.BBBurger = { build: build, layers: LAYERS, FRAME_W: FRAME_W, FRAME_H: FRAME_H };
})();
