/**
 * Where we create value — 2×2 expandable pillar cards.
 * Click/tap toggles one open at a time. Hover is visual only.
 */
(function () {
  const section = document.getElementById('capabilities');
  const grid = document.getElementById('vpGrid');
  if (!section || !grid || !section.classList.contains('value-pillars')) return;

  const cards = Array.from(grid.querySelectorAll('.vp-card'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let openIndex = -1;

  function setOpen(index, { toggle } = {}) {
    if (toggle && index === openIndex) {
      openIndex = -1;
    } else if (index >= 0) {
      openIndex = index;
    } else {
      openIndex = -1;
    }

    grid.classList.toggle('has-open', openIndex >= 0);

    cards.forEach((card, i) => {
      const open = i === openIndex;
      card.classList.toggle('is-open', open);
      const btn = card.querySelector('.vp-card__trigger');
      const panel = card.querySelector('.vp-card__panel');
      if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (panel) panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
  }

  cards.forEach((card, i) => {
    const btn = card.querySelector('.vp-card__trigger');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setOpen(i, { toggle: true });
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setOpen(-1);
        btn.blur();
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (i + 1) % cards.length;
        cards[next].querySelector('.vp-card__trigger')?.focus();
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (i - 1 + cards.length) % cards.length;
        cards[prev].querySelector('.vp-card__trigger')?.focus();
      }
      if (e.key === 'Home') {
        e.preventDefault();
        cards[0].querySelector('.vp-card__trigger')?.focus();
      }
      if (e.key === 'End') {
        e.preventDefault();
        cards[cards.length - 1].querySelector('.vp-card__trigger')?.focus();
      }
    });
  });

  if (reducedMotion) {
    section.classList.add('vp-reduced');
    section.querySelectorAll('animateMotion, animate, animateTransform').forEach((el) => {
      el.setAttribute('repeatCount', '0');
      try { el.endElement(); } catch (_) {}
    });
  }
})();
