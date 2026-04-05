/* ============================================================
   BUTACA 32 — main.js
   ============================================================ */

'use strict';

/* ── DOM refs ── */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');
const heroBg = document.querySelector('.hero-bg');
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lbClose = document.getElementById('lightboxClose');
const lbPrev = document.getElementById('lightboxPrev');
const lbNext = document.getElementById('lightboxNext');
const socialSidebar = document.querySelector('.social-sidebar');

/* ============================================================
   NAVBAR — scroll effect + active link tracking
   ============================================================ */
let ticking = false;

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      const y = window.scrollY;

      // Scrolled class
      navbar.classList.toggle('scrolled', y > 60);

      // Barra lateral: aparece al salir del hero
      if (socialSidebar) {
        const heroH = document.querySelector('.hero')?.offsetHeight ?? 400;
        socialSidebar.classList.toggle('visible', y > heroH * 0.6);
      }

      // Parallax hero bg (subtle)
      if (heroBg) {
        heroBg.style.transform = `translateY(${y * 0.28}px)`;
      }

      // Active nav link
      let current = '';
      sections.forEach((sec) => {
        if (y >= sec.offsetTop - 130) current = sec.id;
      });
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
      });

      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });

/* ============================================================
   MOBILE HAMBURGER
   ============================================================ */
hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navLinksEl.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

function closeMenu() {
  hamburger.classList.remove('open');
  navLinksEl.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

navLinksEl.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

/* ============================================================
   SCROLL REVEAL (Intersection Observer)
   ============================================================ */
const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
);

document.querySelectorAll('.reveal').forEach((el) => revealObs.observe(el));

/* ============================================================
   GALLERY LIGHTBOX
   ============================================================ */
const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
const galleryImages = galleryItems.map((item) => ({
  src: item.dataset.src,
  alt: item.querySelector('img')?.alt ?? '',
}));

let currentLbIndex = 0;

function openLightbox(index) {
  currentLbIndex = index;
  lightboxImg.src = galleryImages[index].src;
  lightboxImg.alt = galleryImages[index].alt;
  lightbox.removeAttribute('hidden');
  // Force reflow so opacity transition fires
  requestAnimationFrame(() => lightbox.classList.add('open'));
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.addEventListener(
    'transitionend',
    () => {
      lightbox.setAttribute('hidden', '');
    },
    { once: true },
  );
  document.body.style.overflow = '';
}

function navigate(dir) {
  currentLbIndex = (currentLbIndex + dir + galleryImages.length) % galleryImages.length;
  lightboxImg.style.opacity = '0';
  setTimeout(() => {
    lightboxImg.src = galleryImages[currentLbIndex].src;
    lightboxImg.alt = galleryImages[currentLbIndex].alt;
    lightboxImg.style.opacity = '1';
  }, 180);
}

galleryItems.forEach((item, i) => {
  item.addEventListener('click', () => openLightbox(i));
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(i);
    }
  });
});

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', () => navigate(-1));
lbNext.addEventListener('click', () => navigate(1));

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') navigate(-1);
  if (e.key === 'ArrowRight') navigate(1);
});

/* ============================================================
   CONTACT FORM — validation + mock submit
   ============================================================ */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateField(field) {
  const group = field.closest('.form-group');
  let valid = field.value.trim() !== '';
  if (valid && field.type === 'email') valid = EMAIL_RE.test(field.value.trim());
  group.classList.toggle('error', !valid);
  return valid;
}

contactForm.querySelectorAll('input, textarea').forEach((field) => {
  field.addEventListener('input', () => {
    if (field.closest('.form-group').classList.contains('error')) {
      validateField(field);
    }
  });
  field.addEventListener('blur', () => validateField(field));
});

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  formSuccess.classList.remove('show');

  const fields = Array.from(contactForm.querySelectorAll('[required]'));
  const allOk = fields.map(validateField).every(Boolean);

  if (!allOk) {
    const firstError = contactForm.querySelector('.form-group.error input, .form-group.error textarea');
    firstError?.focus();
    return;
  }

  const submitBtn = contactForm.querySelector('.btn');
  submitBtn.textContent = 'ENVIANDO...';
  submitBtn.disabled = true;

  // Simulate async send
  setTimeout(() => {
    contactForm.reset();
    submitBtn.textContent = 'ENVIAR MENSAJE';
    submitBtn.disabled = false;
    formSuccess.classList.add('show');
    setTimeout(() => formSuccess.classList.remove('show'), 6000);
  }, 1600);
});

/* ============================================================
   SMOOTH SCROLL — override for anchor links (safety net)
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
