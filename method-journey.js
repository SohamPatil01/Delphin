/**
 * ALIGN Framework™ — 2×3 flip-card matrix
 * Desktop: brief hover threshold → flip; leave → return
 * Touch: tap to flip / tap again to return (one at a time)
 * Keyboard: Enter / Space toggles; Escape closes
 */
(function () {
  const section = document.getElementById('method');
  if (!section || !section.classList.contains('align-framework')) return;

  const wrap = section.querySelector('.af-wrap');
  const matrix = document.getElementById('afCards');
  if (!wrap || !matrix) return;

  const cards = Array.from(matrix.querySelectorAll('.af-card'));
  const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const HOVER_DELAY = 140;
  const READY_LEAD = 90;

  let hoverTimer = null;
  let readyTimer = null;
  let activeCard = null;
  let flipSource = null; // 'hover' | 'manual'

  function syncReduced() {
    wrap.classList.toggle('is-reduced', reducedMotion.matches);
  }

  function setNeighbors(card, on) {
    cards.forEach((c) => c.classList.remove('is-neighbor'));
    if (!on || !card) return;
    const raw = card.getAttribute('data-neighbors') || '';
    raw.split(',').forEach((id) => {
      const n = cards.find((c) => c.dataset.stage === id.trim());
      if (n) n.classList.add('is-neighbor');
    });
  }

  function setFlipped(card, open, source) {
    const btn = card.querySelector('.af-card__btn');
    const back = card.querySelector('.af-card__face--back');
    if (!btn || !back) return;

    if (open && activeCard && activeCard !== card) {
      setFlipped(activeCard, false);
    }

    card.classList.toggle('is-flipped', open);
    card.classList.toggle('is-ready', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    back.setAttribute('aria-hidden', open ? 'false' : 'true');

    if (open) {
      activeCard = card;
      flipSource = source || 'manual';
      setNeighbors(card, true);
    } else {
      if (activeCard === card) {
        activeCard = null;
        flipSource = null;
      }
      card.classList.remove('is-ready');
      setNeighbors(null, false);
    }
  }

  function closeAll() {
    cards.forEach((card) => {
      card.classList.remove('is-flipped', 'is-ready', 'is-neighbor');
      const btn = card.querySelector('.af-card__btn');
      const back = card.querySelector('.af-card__face--back');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (back) back.setAttribute('aria-hidden', 'true');
    });
    activeCard = null;
    flipSource = null;
  }

  function clearTimers() {
    if (hoverTimer) {
      window.clearTimeout(hoverTimer);
      hoverTimer = null;
    }
    if (readyTimer) {
      window.clearTimeout(readyTimer);
      readyTimer = null;
    }
  }

  function armHover(card) {
    clearTimers();
    readyTimer = window.setTimeout(() => {
      if (!card.classList.contains('is-flipped')) card.classList.add('is-ready');
    }, READY_LEAD);
    hoverTimer = window.setTimeout(() => {
      setFlipped(card, true, 'hover');
    }, HOVER_DELAY);
  }

  function disarmHover(card) {
    clearTimers();
    if (activeCard === card && flipSource === 'hover') {
      setFlipped(card, false);
    } else if (!card.classList.contains('is-flipped')) {
      card.classList.remove('is-ready');
    }
  }

  cards.forEach((card) => {
    const btn = card.querySelector('.af-card__btn');
    if (!btn) return;

    card.addEventListener('mouseenter', () => {
      if (!fineHover.matches) return;
      armHover(card);
    });

    card.addEventListener('mouseleave', () => {
      if (!fineHover.matches) return;
      disarmHover(card);
    });

    btn.addEventListener('click', (e) => {
      if (fineHover.matches) {
        e.preventDefault();
        return;
      }
      const willOpen = !card.classList.contains('is-flipped');
      setFlipped(card, willOpen, 'manual');
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      const willOpen = !card.classList.contains('is-flipped');
      setFlipped(card, willOpen, 'manual');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });

  fineHover.addEventListener('change', () => {
    clearTimers();
    closeAll();
  });
  reducedMotion.addEventListener('change', syncReduced);
  syncReduced();
})();
