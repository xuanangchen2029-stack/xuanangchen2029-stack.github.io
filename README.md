# Xuanang Chen — Research Website

Static research website for GitHub Pages. No build step, package manager or backend.
Live at https://xuanangchen2029-stack.github.io/

## Preview locally

Run `python -m http.server 8769 --bind 127.0.0.1` in this folder, then open `http://127.0.0.1:8769/`.
Opening `index.html` directly also works. The copy-email button only appears on HTTPS or localhost.

## Files

- `index.html`: all page content (hero, recent updates, research threads, projects, publications, approach, background, contact).
- `assets/css/style.css`: design tokens (light and dark), layout, responsive and print styles.
- `assets/js/script.js`: theme switch, mobile menu, scroll progress and section highlighting, reveal on scroll, project filters, copy email, looping teaser, video/figure lightbox, and the snap-through explorer.
- `assets/fonts/`: self-hosted Newsreader, Inter and IBM Plex Mono (SIL Open Font License; license files included).
- `assets/media/`: optimized WebP images and posters used by the page (originals remain in `assets/research/` and `assets/images/`).
- `assets/video/`: `beambot-progress.*` (42-s captioned progress video) and `beambot-turning-loop.*` (8-s muted loop), each as MP4 (H.264) with a WebM (VP9) fallback.

## Interactions

- **Bistable theme switch** (header): the dome snaps between two stable states for light/dark. It follows the system theme until the visitor chooses; the choice is kept in `localStorage`.
- **Snap-through explorer** (under BEAMbot): drag the shell or use the slider; the curve is traced from the baseline force–displacement test (H = 10 mm, t = 0.3 mm PETG) and is interpolated between 7.6 and 12.3 mm. The data points live in `initSnapLab()` in `script.js`.
- **Lightbox**: elements with `data-lightbox-video`, `data-lightbox-youtube` or `data-lightbox-image` open in a dialog; without JavaScript the links still work.
- **Filters**: cards use `data-category` with space-separated values (`actuation`, `modeling`, `fabrication`).
- Motion respects `prefers-reduced-motion`; the loop video does not autoplay for those visitors.

## Content notes (as of September 2026)

- Hydrogel paper: co-first author (†), major revision at *Science Advances*. BEAMbot manuscript and the origami review: in preparation. Update the chips in the Publications section and the "Recent" list when a status changes.
- Current role: Visiting Research Scholar, VAK Embodied Systems Lab, Northwestern (PI: Nivedita Arora). BEAMbot and LeafBreath link to the lab's project pages.
- BEAMbot numbers (stroke, set/reset force, jump clearance) come from the public lab project page.
- No CV link yet. To add one, put the PDF in `assets/` and add a button next to "Email" in the hero and in the contact card.

## Updating the progress video

Replace the files in `assets/video/` using the same names, then regenerate the posters in `assets/media/`. Example web encodes:

```
ffmpeg -i master.mp4 -vf scale=1280:720 -c:v libx264 -crf 25 -preset slow -pix_fmt yuv420p -movflags +faststart -an assets/video/beambot-progress.mp4
ffmpeg -i master.mp4 -vf scale=1280:720 -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -an assets/video/beambot-progress.webm
```

## Publishing

GitHub Pages serves the repository root on `main`. Push to `main` and check the Pages deployment. Keep relative paths intact; updating only `index.html` would drop styles, scripts, fonts and media.

The original template license is kept in `LICENSE`.
