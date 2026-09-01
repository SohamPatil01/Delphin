const heroOpener = document.getElementById('heroOpener');
const nav = document.querySelector('.nav');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (heroOpener) {
  document.body.classList.add('intro-active');

  const showFinal = () => {
    heroOpener.classList.add('is-enter', 'is-shifted', 'is-tagline');
    document.body.classList.remove('intro-active');
    document.body.classList.add('hero-ready');
    document.querySelectorAll('.hero-lead.reveal').forEach(el => el.classList.add('visible'));
  };

  if (reducedMotion) {
    showFinal();
  } else {
    setTimeout(() => heroOpener.classList.add('is-enter'), 100);
    setTimeout(() => heroOpener.classList.add('is-shifted'), 900);
    setTimeout(() => heroOpener.classList.add('is-tagline'), 1500);
    setTimeout(showFinal, 2400);
  }
} else {
  document.body.classList.add('hero-ready');
  document.querySelectorAll('.hero-lead.reveal').forEach(el => el.classList.add('visible'));
}

const progress = document.querySelector('.progress');
const hero = document.querySelector('.hero');
const syncNav = () => {
  if (nav && hero) nav.classList.toggle('nav-solid', scrollY > window.innerHeight * 0.6);
};
window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (h ? scrollY / h * 100 : 0) + '%';
  syncNav();
}, { passive: true });
syncNav();

const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.querySelectorAll('.method-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    document.querySelectorAll('.method-item').forEach(x => x.classList.remove('active'));
    item.classList.add('active');
  });
});

document.querySelectorAll('.cap-item').forEach(item => {
  item.addEventListener('mouseenter', () => item.classList.add('is-highlighted'));
  item.addEventListener('mouseleave', () => item.classList.remove('is-highlighted'));
});

const menu = document.querySelector('.menu');
menu?.addEventListener('click', () => {
  const navLinks = document.querySelector('.nav-links');
  const open = navLinks.classList.toggle('open');
  if (open) {
    navLinks.style.cssText = 'display:flex;position:absolute;top:78px;left:6vw;right:6vw;flex-direction:column;gap:20px;padding:25px;background:#101010;color:#fff;mix-blend-mode:normal;border:1px solid #333';
  } else navLinks.style.cssText = '';
});

document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', () => {
  const navLinks = document.querySelector('.nav-links');
  if (navLinks?.classList.contains('open')) {
    navLinks.classList.remove('open');
    navLinks.style.cssText = '';
  }
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
