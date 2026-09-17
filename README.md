# Xuanang Chen — Research Portfolio

A static research website for GitHub Pages. No build step, package manager, or backend is required.

## Preview locally

Run `python -m http.server 8769 --bind 127.0.0.1` in this directory, then open `http://127.0.0.1:8769/`.
Opening `index.html` directly also works; clipboard copying is available only in secure contexts such as HTTPS and localhost.

## Edit the site

- `index.html`: biography, education, project text, manuscript status, links and photo captions.
- `assets/css/style.css`: colors, layouts, typography and responsive/print styles.
- `assets/js/script.js`: accessible mobile menu, project filtering, copy-email action and current-section indication.
- `assets/research/`: BEAMbot images, copied without altering the originals.
- `assets/images/`: existing portrait and project media. Unused template assets remain in the repository to avoid deleting original files.

The email appears in several mailto links and in the copy-email action. Update both HTML and JavaScript if the address changes. No contact form is used because this static site has no email-submission backend.

Project categories use `data-category="actuation"` or `data-category="modeling"`. With JavaScript disabled, all projects and the navigation remain available. Details use native HTML disclosure controls. The site respects reduced-motion preferences and provides keyboard focus and a skip link.

## Content notes

The Northwestern entry reads `2025–2026 · Master’s degree, Theoretical and Applied Mechanics`, reflecting the completed master's qualification. Confirm the official degree abbreviation before changing it to M.S. or M.S.E. The application focus remains Ph.D. opportunities in robotics, soft robotics and embodied intelligence.

The two manuscripts retain the original website's `Submitted to` text and 2025 dates. Update these when their status changes; no accepted/published status has been inferred.

BEAMbot photos show wired experimental prototypes. Flexible-coil integration and decentralized robot behavior are described as future research directions.

Do not add a CV, Scholar, paper DOI or project-repository button until its real destination is available. Do not replace manuscript status with a stronger claim without confirmation.

## Publish with GitHub Pages

Repository: `xuanangchen2029-stack/xuanangchen2029-stack.github.io`.
Public URL: https://xuanangchen2029-stack.github.io/

GitHub Pages publishes the repository root on `main`. Preview changes locally, then commit and push them to `main` directly or merge a reviewed branch into `main`. Check the Pages deployment before treating the public site as updated.

Keep the relative file paths intact when copying or uploading the site. Updating only `index.html` will omit its stylesheet, script and BEAMbot images.

The original template license is preserved in `LICENSE`. Existing YouTube links and their preview images remain externally hosted.
