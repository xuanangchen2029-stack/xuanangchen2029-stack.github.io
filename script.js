'use strict';

(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  window.__siteReady = true;

  /* ── Theme: a bistable switch with two stable states ─────────────────── */
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = () => root.getAttribute('data-theme') || (darkQuery.matches ? 'dark' : 'light');
  const syncTheme = () => {
    const dark = currentTheme() === 'dark';
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(dark));
      themeToggle.title = dark ? 'Switch to light theme' : 'Switch to dark theme';
    }
    const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => { if (root.hasAttribute('data-theme')) m.setAttribute('content', bg); });
  };
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
      syncTheme();
    });
  }
  darkQuery.addEventListener('change', syncTheme);
  syncTheme();

  /* ── Mobile navigation ────────────────────────────────────────────────── */
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  const setMenu = (open) => {
    if (!menuButton || !nav) return;
    menuButton.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { setMenu(false); menuButton.focus(); }
    });
    window.matchMedia('(min-width: 721px)').addEventListener('change', () => setMenu(false));
  }

  /* ── Scroll progress, header state, current section ───────────────────── */
  const header = document.querySelector('.site-header');
  const bar = document.querySelector('.scroll-progress span');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      if (bar) bar.style.setProperty('--progress', (max > 0 ? el.scrollTop / max : 0).toFixed(4));
      if (header) header.classList.toggle('is-scrolled', el.scrollTop > 8);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (nav && 'IntersectionObserver' in window) {
    const links = [...nav.querySelectorAll('a[href^="#"]')];
    const inView = new Set();
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) inView.add(entry.target.id); else inView.delete(entry.target.id);
      });
      const current = links.find((l) => inView.has(l.hash.slice(1)));
      links.forEach((l) => {
        if (l === current) l.setAttribute('aria-current', 'true');
        else l.removeAttribute('aria-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((l) => { const s = document.querySelector(l.hash); if (s) spy.observe(s); });
  }

  /* ── Reveal on scroll ─────────────────────────────────────────────────── */
  const reveals = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const groups = new Map();
    reveals.forEach((el) => {
      const key = el.parentElement;
      const i = groups.get(key) || 0;
      groups.set(key, i + 1);
      el.style.transitionDelay = `${Math.min(i, 5) * 70}ms`;
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    reveals.forEach((el) => io.observe(el));
    root.classList.add('reveal-ready');
  } else {
    root.classList.remove('reveal-ready');
  }

  /* ── Project filters ──────────────────────────────────────────────────── */
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.card[data-category]')];
  const filterStatus = document.querySelector('[data-filter-status]');
  const inCategory = (card, f) => f === 'all' || card.dataset.category.split(/\s+/).includes(f);
  filterButtons.forEach((button) => {
    const f = button.dataset.filter;
    const count = document.createElement('span');
    count.className = 'count';
    count.textContent = String(cards.filter((c) => inCategory(c, f)).length);
    button.append(count);
    button.addEventListener('click', () => {
      filterButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      let shown = 0;
      cards.forEach((card) => {
        const match = inCategory(card, f);
        if (match) {
          shown += 1;
          if (card.hidden) {
            card.hidden = false;
            card.classList.add('is-visible');
            card.classList.remove('is-entering');
            void card.offsetWidth;
            card.classList.add('is-entering');
          }
        } else {
          card.hidden = true;
        }
      });
      if (filterStatus) filterStatus.textContent = `${shown} project${shown === 1 ? '' : 's'} shown`;
    });
  });

  /* ── Copy e-mail ──────────────────────────────────────────────────────── */
  const copyButton = document.querySelector('[data-copy-email]');
  const copyStatus = document.querySelector('[data-copy-status]');
  let copyTimer;
  if (copyButton && navigator.clipboard && window.isSecureContext) {
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
      clearTimeout(copyTimer);
      try {
        await navigator.clipboard.writeText('xuanangchen2029@u.northwestern.edu');
        copyStatus.textContent = 'Copied to clipboard.';
      } catch (e) {
        copyStatus.textContent = 'Please select the address to copy it.';
      }
      copyTimer = setTimeout(() => { copyStatus.textContent = ''; }, 4000);
    });
  }

  /* ── Looping teaser video ─────────────────────────────────────────────── */
  const player = document.querySelector('[data-loop-player]');
  let pauseLoop = () => {};
  if (player) {
    const video = player.querySelector('video');
    const toggle = player.querySelector('[data-loop-toggle]');
    const label = player.querySelector('[data-loop-label]');
    let userPaused = reduceMotion.matches;
    const setUI = (playing) => {
      toggle.setAttribute('aria-pressed', String(playing));
      label.textContent = playing ? 'Pause loop' : 'Play loop';
    };
    const play = () => {
      const p = video.play();
      if (p && p.then) p.then(() => setUI(true)).catch(() => setUI(false));
    };
    pauseLoop = () => { if (!video.paused) video.pause(); setUI(false); };
    toggle.addEventListener('click', () => {
      if (video.paused) { userPaused = false; play(); } else { userPaused = true; pauseLoop(); }
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !userPaused) play();
        else if (!entry.isIntersecting) pauseLoop();
      }, { threshold: 0.35 }).observe(player);
    }
    setUI(false);
  }

  /* ── Lightbox for videos and figures ──────────────────────────────────── */
  const dialog = document.querySelector('[data-lightbox]');
  if (dialog && typeof dialog.showModal === 'function') {
    const body = dialog.querySelector('[data-lightbox-body]');
    const title = dialog.querySelector('[data-lightbox-title]');
    let lastFocus = null;
    const open = (node, label, paper) => {
      lastFocus = document.activeElement;
      body.replaceChildren(node);
      body.classList.toggle('is-paper', Boolean(paper));
      title.textContent = label || '';
      pauseLoop();
      dialog.showModal();
    };
    dialog.addEventListener('close', () => {
      body.replaceChildren();
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    });
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());

    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const videoLink = e.target.closest('[data-lightbox-video]');
      const ytLink = e.target.closest('[data-lightbox-youtube]');
      const imageLink = e.target.closest('[data-lightbox-image]');
      if (videoLink) {
        e.preventDefault();
        const v = document.createElement('video');
        v.controls = true; v.autoplay = true; v.playsInline = true; v.preload = 'auto';
        [[videoLink.dataset.lightboxVideo, 'video/mp4'], [videoLink.dataset.webm, 'video/webm']].forEach(([src, type]) => {
          if (!src) return;
          const source = document.createElement('source');
          source.src = src; source.type = type;
          v.append(source);
        });
        if (videoLink.dataset.poster) v.poster = videoLink.dataset.poster;
        v.setAttribute('aria-label', videoLink.dataset.title || 'Video');
        open(v, videoLink.dataset.title);
      } else if (ytLink) {
        e.preventDefault();
        const f = document.createElement('iframe');
        const start = ytLink.dataset.start ? `&start=${encodeURIComponent(ytLink.dataset.start)}` : '';
        f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(ytLink.dataset.lightboxYoutube)}?autoplay=1&rel=0&modestbranding=1${start}`;
        f.title = ytLink.dataset.title || 'Video';
        f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        f.allowFullscreen = true;
        f.referrerPolicy = 'strict-origin-when-cross-origin';
        open(f, ytLink.dataset.title);
      } else if (imageLink) {
        e.preventDefault();
        const img = new Image();
        img.src = imageLink.dataset.lightboxImage;
        img.alt = imageLink.dataset.title || '';
        img.decoding = 'async';
        const paper = imageLink.classList.contains('thumb-paper') || imageLink.classList.contains('card-media-paper');
        open(img, imageLink.dataset.title, paper);
      }
    });
  }

  /* ── Snap-through explorer ────────────────────────────────────────────── */
  const lab = document.querySelector('[data-snap-lab]');
  if (lab) initSnapLab(lab);

  function initSnapLab(labEl) {
    // Mean baseline curve traced from the force–displacement test
    // (H = 10 mm, rho = 50, t = 0.3 mm PETG): [apex displacement mm, force N].
    const SET = [[0, 0], [0.3, 0.12], [0.6, 0.25], [1, 0.4], [1.4, 0.5], [1.8, 0.545], [2.2, 0.55], [2.35, 0.49], [2.6, 0.42], [3.2, 0.36], [4, 0.29], [5, 0.21], [6, 0.155], [7, 0.1], [7.6, 0.06]];
    const GAP = [[7.6, 0.06], [9, 0.035], [10.5, 0.015], [12.3, 0]];
    const RESET = [[12.3, 0], [12.8, -0.06], [13.5, -0.14], [14.5, -0.19], [15.5, -0.22], [16.5, -0.245], [17.3, -0.22], [18, -0.15], [18.6, -0.07], [19, 0]];
    const CURVE = SET.concat(GAP.slice(1), RESET.slice(1));
    const D_MAX = 19;
    const D_U = 12.3;
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const force = (d) => {
      const x = clamp(d, 0, D_MAX);
      for (let i = 1; i < CURVE.length; i += 1) {
        const [x1, y1] = CURVE[i - 1];
        const [x2, y2] = CURVE[i];
        if (x <= x2) return y1 + (y2 - y1) * ((x - x1) / (x2 - x1));
      }
      return 0;
    };

    // Plot
    const NS = 'http://www.w3.org/2000/svg';
    const plot = labEl.querySelector('[data-snap-plot]');
    const X0 = 46; const X1 = 408; const Y0 = 14; const Y1 = 206;
    const FMIN = -0.35; const FMAX = 0.68;
    const sx = (d) => X0 + (d / 20) * (X1 - X0);
    const sy = (f) => Y0 + ((FMAX - f) / (FMAX - FMIN)) * (Y1 - Y0);
    const add = (tag, attrs, text) => {
      const n = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
      if (text !== undefined) n.textContent = text;
      plot.appendChild(n);
      return n;
    };
    const line = (pts) => pts.map(([d, f], i) => `${i ? 'L' : 'M'}${sx(d).toFixed(1)} ${sy(f).toFixed(1)}`).join(' ');
    add('path', { class: 'lobe-set', d: `${line(SET.concat(GAP.slice(1)))} Z` });
    add('path', { class: 'lobe-reset', d: `${line(RESET)} Z` });
    add('line', { class: 'axis', x1: X0, y1: Y0, x2: X0, y2: Y1 });
    add('line', { class: 'axis', x1: X0, y1: Y1, x2: X1, y2: Y1 });
    add('line', { class: 'zero', x1: X0, y1: sy(0), x2: X1, y2: sy(0) });
    [0, 5, 10, 15, 20].forEach((d) => {
      add('line', { class: 'axis', x1: sx(d), y1: Y1, x2: sx(d), y2: Y1 + 4 });
      add('text', { class: 'tick', x: sx(d), y: Y1 + 16, 'text-anchor': 'middle' }, String(d));
    });
    [-0.2, 0, 0.2, 0.4, 0.6].forEach((f) => {
      add('line', { class: 'axis', x1: X0 - 4, y1: sy(f), x2: X0, y2: sy(f) });
      add('text', { class: 'tick', x: X0 - 8, y: sy(f) + 3, 'text-anchor': 'end' }, f.toFixed(1));
    });
    add('text', { class: 'ax-label', x: (X0 + X1) / 2, y: Y1 + 34, 'text-anchor': 'middle' }, 'apex displacement δ (mm)');
    add('text', { class: 'ax-label', x: 12, y: (Y0 + Y1) / 2, 'text-anchor': 'middle', transform: `rotate(-90 12 ${(Y0 + Y1) / 2})` }, 'force F (N)');
    add('path', { class: 'curve-set', d: line(SET) });
    add('path', { class: 'curve-interp', d: line(GAP) });
    add('path', { class: 'curve-reset', d: line(RESET) });
    add('text', { class: 'energy-set', x: sx(1.2), y: sy(0.08) }, 'ΔU₁ ≈ 2.4 mJ');
    add('text', { class: 'energy-reset', x: sx(13.4), y: sy(-0.3), }, 'ΔU₂ ≈ 1.1 mJ');
    add('text', { class: 'note', x: sx(2.6), y: sy(0.585) }, 'set 0.54 N');
    add('text', { class: 'note', x: sx(19.6), y: sy(-0.27), 'text-anchor': 'end' }, 'reset');
    add('circle', { class: 'eq-stable', cx: sx(0), cy: sy(0), r: 4 });
    add('circle', { class: 'eq-stable', cx: sx(D_MAX), cy: sy(0), r: 4 });
    add('circle', { class: 'eq-unstable', cx: sx(D_U), cy: sy(0), r: 4 });
    add('text', { class: 'note', x: sx(D_U), y: sy(0) - 10, 'text-anchor': 'middle' }, 'unstable');
    add('text', { class: 'note', x: sx(D_MAX), y: sy(0) - 10, 'text-anchor': 'middle' }, 'state 2');
    add('text', { class: 'note', x: sx(0) + 6, y: sy(0) + 16 }, 'state 1');
    const guide = add('line', { class: 'guide', y1: Y0, y2: Y1 });
    const marker = add('circle', { class: 'marker', r: 6 });

    // Shell drawing
    const shell = labEl.querySelector('[data-snap-shell]');
    const shellPath = shell.querySelector('[data-shell-path]');
    const magnet = shell.querySelector('[data-magnet]');
    const handle = shell.querySelector('[data-shell-handle]');
    const coil = shell.querySelector('[data-coil]');
    const BASE_Y = 100; const AMP = 52; const MAG_Y = 48;

    const range = labEl.querySelector('[data-snap-range]');
    const outD = labEl.querySelector('[data-snap-d]');
    const outF = labEl.querySelector('[data-snap-f]');
    const outState = labEl.querySelector('[data-snap-state]');
    const announce = labEl.querySelector('[data-snap-announce]');
    const pulseButton = labEl.querySelector('[data-snap-pulse]');

    let d = 0;
    let state = 1;
    let raf = 0;
    let dragging = false;
    let releaseTimer = 0;

    const render = (value, fromRange) => {
      const A = AMP * (1 - (2 * value) / D_MAX);
      const apexY = BASE_Y - A;
      shellPath.setAttribute('d', `M50 ${BASE_Y} Q150 ${(BASE_Y - 2 * A).toFixed(2)} 250 ${BASE_Y}`);
      magnet.setAttribute('transform', `translate(0 ${(apexY - MAG_Y).toFixed(2)})`);
      handle.setAttribute('cy', apexY.toFixed(2));
      const dc = clamp(value, 0, D_MAX);
      const fc = force(dc);
      marker.setAttribute('cx', sx(dc).toFixed(1));
      marker.setAttribute('cy', sy(fc).toFixed(1));
      guide.setAttribute('x1', sx(dc).toFixed(1));
      guide.setAttribute('x2', sx(dc).toFixed(1));
      outD.textContent = dc.toFixed(1);
      outF.textContent = (Math.abs(fc) < 0.005 ? 0 : fc).toFixed(2);
      outState.textContent = dc < D_U ? '1' : '2';
      if (!fromRange) range.value = dc.toFixed(1);
    };

    const easeInOut = (t) => 0.5 - Math.cos(Math.PI * t) / 2;
    const easeOutBack = (t) => { const c1 = 1.9; const c3 = c1 + 1; return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2; };
    const easeOutCubic = (t) => 1 - (1 - t) ** 3;

    const animateTo = (target, kind) => {
      cancelAnimationFrame(raf);
      const from = d;
      if (reduceMotion.matches || from === target) { d = target; render(d); return; }
      const span = target - from;
      const barrierFrac = clamp(Math.abs(D_U - from) / Math.abs(span), 0, 1);
      const duration = kind === 'pulse' ? 620 : kind === 'snap' ? 320 : 420;
      const t0 = performance.now();
      const shape = (p) => {
        if (kind === 'pulse') return p < 0.55 ? barrierFrac * easeInOut(p / 0.55) : barrierFrac + (1 - barrierFrac) * easeOutBack((p - 0.55) / 0.45);
        if (kind === 'snap') return easeOutBack(p);
        return easeOutCubic(p);
      };
      const step = (now) => {
        const p = Math.min(1, (now - t0) / duration);
        d = from + span * shape(p);
        render(d);
        if (p < 1) raf = requestAnimationFrame(step);
        else { d = target; render(d); }
      };
      raf = requestAnimationFrame(step);
    };

    const settle = () => {
      clearTimeout(releaseTimer);
      const previous = state;
      const target = d >= D_U ? D_MAX : 0;
      state = target === 0 ? 1 : 2;
      const snapped = state !== previous;
      animateTo(target, snapped ? 'snap' : 'spring');
      announce.textContent = snapped ? `Snapped into state ${state}. It stays there without power.` : `Released before the barrier; springs back to state ${state}.`;
    };

    const pointToDisplacement = (evt) => {
      const pt = shell.createSVGPoint();
      pt.x = evt.clientX; pt.y = evt.clientY;
      const ctm = shell.getScreenCTM();
      if (!ctm) return d;
      const p = pt.matrixTransform(ctm.inverse());
      const A = BASE_Y - p.y;
      return clamp(((1 - A / AMP) * D_MAX) / 2, 0, D_MAX);
    };
    shell.addEventListener('pointerdown', (evt) => {
      cancelAnimationFrame(raf);
      dragging = true;
      shell.setPointerCapture(evt.pointerId);
      shell.classList.add('is-dragging');
      d = pointToDisplacement(evt);
      render(d);
    });
    shell.addEventListener('pointermove', (evt) => {
      if (!dragging) return;
      d = pointToDisplacement(evt);
      render(d);
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      shell.classList.remove('is-dragging');
      settle();
    };
    shell.addEventListener('pointerup', endDrag);
    shell.addEventListener('pointercancel', endDrag);

    range.addEventListener('input', () => {
      cancelAnimationFrame(raf);
      d = Number(range.value);
      render(d, true);
      clearTimeout(releaseTimer);
      releaseTimer = setTimeout(settle, 700);
    });
    range.addEventListener('pointerup', settle);

    pulseButton.addEventListener('click', () => {
      clearTimeout(releaseTimer);
      coil.classList.add('is-firing');
      setTimeout(() => coil.classList.remove('is-firing'), 420);
      state = state === 1 ? 2 : 1;
      animateTo(state === 2 ? D_MAX : 0, 'pulse');
      announce.textContent = `Coil pulse: the cell snaps into state ${state}.`;
    });

    render(0);
  }

  /* ── Footer year ──────────────────────────────────────────────────────── */
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
