/**
 * ALIGN Framework™ — flip cards
 * Desktop: CSS hover flip
 * Touch: tap to toggle
 */
(function () {
  const section = document.getElementById('method');
  if (!section || !section.classList.contains('align-framework')) return;

  const wrap = section.querySelector('.af-wrap');
  const grid = document.getElementById('afGrid');
  const hint = section.querySelector('.af-hint');
  if (!wrap || !grid) return;

  const cards = Array.from(grid.querySelectorAll('.af-flip'));
  const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)');

  function syncHint() {
    if (!hint) return;
    const key = fineHover.matches ? 'hintHover' : 'hintTap';
    const text = hint.dataset[key];
    if (text) hint.textContent = text;
  }
  syncHint();
  fineHover.addEventListener('change', syncHint);

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        wrap.classList.add('is-inview');
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );
  io.observe(section);

  cards.forEach((card) => {
    const btn = card.querySelector('.af-flip__btn');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      if (fineHover.matches) return;
      e.preventDefault();
      const open = !card.classList.contains('is-flipped');
      cards.forEach((c) => {
        c.classList.remove('is-flipped');
        const b = c.querySelector('.af-flip__btn');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      if (open) {
        card.classList.add('is-flipped');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();
