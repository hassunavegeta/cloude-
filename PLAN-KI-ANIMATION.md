# Nächster Schritt: KI-animierte Filmszenen für den Scroll

Stand: 07.11.2026, Übergabe aus der Cloud-Sitzung „Website redesign schwarz gelb“.

## Ziel
Fotos der Seite mit KI animieren, damit sich das Scrollen noch mehr wie ein Film anfühlt.
Dafür sollen die lokalen Skills für Webseiten und Scroll-Erlebnisse benutzt werden (dieselben wie beim Projekt „Andrijana Visage“).

## Technik
- Videos mit Artlist erzeugen (Image-to-Video, ohne Ton).
- Mit ffmpeg in eine Bildfolge zerlegen: etwa 120–180 Einzelbilder als WebP, rund 1280 px breit.
- Die Bildfolge auf ein `<canvas>` zeichnen, gesteuert vom Scroll (GSAP ScrollTrigger, Scrub).
- Für Loops (Opener, Standort) reicht ein normales `<video muted autoplay loop playsinline>` als MP4 oder WebM.
- Bei „Bewegung reduzieren“ (reduced motion) wird nur das Standbild gezeigt.

## Geplante Szenen
| # | Szene | Vorlage | Einsatz |
|---|---|---|---|
| 1 | Grillplatte lebt: Zischen, Dampf, langsame Kamerafahrt | `assets/img/grillplatte.webp` | Hintergrund im Opener (Loop) |
| 2 | Burger-Aufbau fotorealistisch: Zutaten fallen nacheinander | Startbild unterer Bun, Endbild fertiger Bebe Spezial (beide vorher per KI erzeugen) | ersetzt oder ergänzt die SVG-Burger-Sequenz (Scroll-Scrub) |
| 3 | Burger mit Jalapeños: Käse tropft, Kamerafahrt | `assets/img/burger-jalapeno.webp` | Bestseller oder Filmstreifen |
| 4 | Double Smash in der Hand | `assets/img/double-smash-hand.webp` | Filmstreifen |
| 5 | Laden-Front: Wolken ziehen | `assets/img/laden-front.webp` | Standort |

## Bereits zu Artlist hochgeladen (Asset-IDs)
- Grillplatte: `78a9e829-97ca-4a83-b328-3597c0ea86a0`
- Burger mit Jalapeños: `ba639011-5efc-4fe2-94af-7320c7669b3c`
- Laden-Front: `365694b4-e2a7-4a7a-a967-2f61f319c60a`
- Double Smash in der Hand: `156b4e77-e229-4e06-a3e3-1da09117c923`

## Kostenangebote von Artlist (noch nichts erzeugt)
Guthaben zum Zeitpunkt der Übergabe: 36.500 Credits (Plan AI Suite 40K).

| Modell | Länge | Auflösung | Credits |
|---|---|---|---|
| Kling v3 Pro, ohne Ton | 5 s | 1080p | 500 |
| Kling v3 Pro, Start- und Endbild | 10 s | 1080p | 1.000 |
| Seedance 2.5, Start- und Endbild | 10 s | 480p (Entwurf) | 2.000 |
| Seedance 2.5, Start- und Endbild | 10 s | 1080p | 10.000 |
| Standbild (Text-to-Image) | – | 2K | 130 |

Empfehlung: Kling v3 Pro (1080p). Grobe Summe für die Szenen 1–5 inklusive zwei Standbildern: etwa 3.300 Credits.
Vor dem Erzeugen die Freigabe der Nutzerin bzw. des Nutzers einholen.
