'use strict';

document.documentElement.classList.add('js');

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const opened = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!opened));
  navigation.classList.toggle('is-open', !opened);
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 641px)').addEventListener('change', closeMenu);

const filterButtons = [...document.querySelectorAll('[data-filter]')];
const projects = [...document.querySelectorAll('[data-category]')];
const filterStatus = document.querySelector('#filter-status');
for (const button of filterButtons) {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    for (const other of filterButtons) other.setAttribute('aria-pressed', String(other === button));
    let visible = 0;
    for (const project of projects) {
      project.hidden = category !== 'all' && project.dataset.category !== category;
      if (!project.hidden) visible++;
    }
    filterStatus.textContent = `${visible} projects shown. ${button.textContent}.`;
  });
}

const emailButton = document.querySelector('[data-copy-email]');
const copyStatus = document.querySelector('.copy-status');
let copyTimer;
if (navigator.clipboard && window.isSecureContext) {
  emailButton.hidden = false;
  emailButton.addEventListener('click', async () => {
    clearTimeout(copyTimer);
    try {
      await navigator.clipboard.writeText('xuanangchen2029@u.northwestern.edu');
      copyStatus.textContent = 'Email address copied.';
    } catch {
      copyStatus.textContent = 'Please select the address above to copy it.';
    }
    copyTimer = setTimeout(() => { copyStatus.textContent = ''; }, 5000);
  });
}

const sectionLinks = [...navigation.querySelectorAll('a[href^="#"]')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const link of sectionLinks) {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }
  }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
  for (const id of ['home', 'research', 'approach', 'background', 'contact']) {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  }
}
document.querySelector('[data-year]').textContent = String(new Date().getFullYear());
