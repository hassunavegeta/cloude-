# BB Smash it Burger & More – Redesign

Ein Neuentwurf von [bb-smashit.de](https://www.bb-smashit.de) in Schwarz und Gelb, aufgebaut wie eine Filmsequenz, die man beim Scrollen abspielt.

## Was die Seite macht

| Bereich | Effekt |
|---|---|
| **Vorlauf** | Countdown 3-2-1 wie bei einem alten Filmvorlauf, endet mit einem gelben Blitz. Wird pro Sitzung nur einmal gezeigt, ein Klick überspringt ihn. |
| **Opener** | Kinobalken (Letterbox) öffnen sich. „SMASH“ knallt Buchstabe für Buchstabe ins Bild, dazu Kamera-Shake, Schockwelle und Funkenregen. Danach wird „IT.“ platt gesmasht. Glutpartikel steigen auf. |
| **Der Film** | Die Szene bleibt beim Scrollen stehen. Elf Zutaten des *Bebe Spezial* fallen nacheinander ins Bild und landen mit Squash-Effekt: Bun, Haussauce, Patty, zweimal Cheddar, Gurken, Jalapeños, rote Zwiebeln, Tomate, Salat, Top Bun. Dazu laufen Untertitel, eine Besetzungsliste, Timecode und Szenenzähler. Am Ende folgen Smash, Blitz und das Angebot. |
| **Bestseller** | Die Top 3 aus dem Online-Shop als Filmplakate, mit 3D-Neigung beim Überfahren mit der Maus. |
| **Speisekarte** | Alle 118 Positionen in 8 Tabs, per Tastatur bedienbar. |
| **Über uns** | Echte Fotos als Filmstreifen. Auf dem Desktop läuft er horizontal und gepinnt, auf dem Handy wischt man. |
| **Kritiken / Standort** | Gästestimmen, Live-Status „geöffnet / geschlossen“ (Zeitzone Berlin), Öffnungszeiten mit Markierung für heute. |
| **Abspann** | „The End.“ mit Abspann-Credits. |

Wer „Bewegung reduzieren“ im Betriebssystem aktiviert hat, bekommt eine ruhige Version: kein Vorlauf, kein Pinning, der Burger ist sofort fertig zu sehen.

## Technik

- Statisches HTML, CSS und JS ohne Build-Schritt. Die Seite läuft auf jedem Webspace, auf Netlify, Vercel oder GitHub Pages.
- Animation mit [GSAP 3.12.5](https://gsap.com) und ScrollTrigger, Smooth Scroll mit [Lenis 1.1.13](https://github.com/darkroomengineering/lenis).
- **Alles liegt lokal**: Schriften (Anton, Inter, JetBrains Mono), Bibliotheken und Bilder. Die Seite baut keine Verbindung zu Google Fonts oder CDNs auf und setzt keine Cookies.
- Der Burger wird als Vektorgrafik in `assets/js/burger.js` erzeugt. Jede Zutat ist eine eigene SVG-Ebene.

```
index.html
assets/
  css/style.css        Design (Tokens, Layout, Responsive)
  js/burger.js         SVG-Zutaten des Burgers
  js/menu-data.js      Speisekarte (Quelle & Stand im Dateikopf)
  js/main.js           Animationen, Menü, Öffnungszeiten
  vendor/              GSAP, ScrollTrigger, Lenis
  fonts/               WOFF2-Schriften
  img/                 Fotos von bb-smashit.de (WebP)
```

## Lokal ansehen

```bash
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

## Vor dem Livegang prüfen

1. **Bestell-Links** führen zum bestehenden FoodAmigos-Shop `https://www.bb-smashit.de/speisekarte/bbsmashitburgermore`. Ersetzt diese Seite die aktuelle Domain, muss die Shop-URL angepasst werden. Suchen und Ersetzen in `index.html` genügt.
2. **Impressum und Datenschutz** verlinken auf die aktuelle Seite. Bei einem Umzug müssen sie mitgenommen werden.
3. **Preise** sind die regulären Preise laut Online-Speisekarte, Stand 06.11.2026. Bei Änderungen `assets/js/menu-data.js` anpassen.
4. **Öffnungszeiten** stehen auf der Startseite und der Standortseite der aktuellen Website: Samstag 16:00–23:00. Der Bestellshop zeigte für Samstag dagegen „öffnet 15:00“. Bitte kurz klären, welche Zeit gilt.
5. **Bildrechte**: Logo und Fotos stammen von der aktuellen Website.
