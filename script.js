const heroOpener = document.getElementById('heroOpener');
const nav = document.querySelector('.nav');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (heroOpener) {
  document.body.classList.add('intro-active');

  const showFinal = () => {
    heroOpener.classList.add('is-enter', 'is-tagline');
    document.body.classList.remove('intro-active');
    document.body.classList.add('hero-ready');
    nav?.classList.remove('nav-hidden');
    document.querySelectorAll('.hero-lead.reveal').forEach(el => el.classList.add('visible'));
  };

  if (reducedMotion) {
    showFinal();
  } else {
    setTimeout(() => {
      heroOpener.classList.add('is-enter');
      nav?.classList.remove('nav-hidden');
    }, 100);
    setTimeout(() => {
      heroOpener.classList.add('is-tagline');
      document.querySelectorAll('.hero-lead.reveal').forEach(el => el.classList.add('visible'));
    }, 900);
    setTimeout(showFinal, 1600);
  }
} else {
  document.body.classList.add('hero-ready');
  nav?.classList.remove('nav-hidden');
  if (document.body.classList.contains('page-sub')) {
    nav?.classList.add('nav-solid');
  }
  document.querySelectorAll('.hero-lead.reveal').forEach(el => el.classList.add('visible'));
}

const progress = document.querySelector('.progress');
const hero = document.querySelector('.hero');
const menu = document.querySelector('.menu');
const navPanel = document.getElementById('navPanel');
const navOverlay = document.getElementById('navOverlay');

const closeMenu = () => {
  nav?.classList.remove('is-menu-open');
  document.body.classList.remove('nav-menu-open');
  menu?.setAttribute('aria-expanded', 'false');
  menu?.setAttribute('aria-label', 'Open menu');
  navOverlay?.setAttribute('aria-hidden', 'true');
};

const openMenu = () => {
  nav?.classList.add('is-menu-open');
  document.body.classList.add('nav-menu-open');
  menu?.setAttribute('aria-expanded', 'true');
  menu?.setAttribute('aria-label', 'Close menu');
  navOverlay?.setAttribute('aria-hidden', 'false');
};

const syncNav = () => {
  if (nav && hero) nav.classList.toggle('nav-solid', scrollY > window.innerHeight * 0.6);
};
window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (h ? scrollY / h * 100 : 0) + '%';
  if (nav?.classList.contains('is-menu-open')) closeMenu();
  syncNav();
}, { passive: true });
syncNav();

const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.querySelectorAll('.cap-item').forEach(item => {
  item.setAttribute('tabindex', '0');
  const toggle = () => {
    const isOpen = item.classList.contains('is-expanded');
    document.querySelectorAll('.cap-item').forEach(x => x.classList.remove('is-expanded'));
    if (!isOpen) item.classList.add('is-expanded');
  };
  item.addEventListener('click', () => {
    if (window.matchMedia('(hover: none)').matches) toggle();
  });
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });
});

menu?.addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();
  if (nav?.classList.contains('is-menu-open')) closeMenu();
  else openMenu();
});

navOverlay?.addEventListener('click', e => {
  if (e.target === navOverlay) closeMenu();
});

navPanel?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', () => {
  closeMenu();
}));

document.querySelectorAll('.work-card').forEach(card => {
  const visual = card.querySelector('.demo-window');
  card.addEventListener('mousemove', e => {
    if (innerWidth < 900) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    visual.style.transform = `perspective(900px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg)`;
  });
  card.addEventListener('mouseleave', () => visual.style.transform = '');
});

const contactForm = document.getElementById('contactForm');
contactForm?.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const data = new FormData(form);
  const name = data.get('name');
  const email = data.get('email');
  const company = data.get('company');
  const message = data.get('message');
  const subject = encodeURIComponent(`Delphin inquiry from ${name}`);
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nCompany: ${company || '—'}\n\n${message}`
  );
  window.location.href = `mailto:hello@delphininc.com?subject=${subject}&body=${body}`;
  const note = document.getElementById('contactFormNote');
  if (note) {
    note.hidden = false;
    note.textContent = 'Thanks — your email client should open to send the message.';
  }
});
