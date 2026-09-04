/**
 * Delphin Method — interactive horizontal accordion.
 * Desktop: hover expands one row; click also works.
 * Touch / coarse pointer: tap toggles one open row.
 */
(function () {
  const section = document.getElementById('method');
  const accordion = document.getElementById('dmAccordion');
  if (!section || !accordion || !section.classList.contains('delphin-method')) return;

  const rows = Array.from(accordion.querySelectorAll('.dm-row'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  let openIndex = -1;
  let hoverIndex = -1;

  function setOpen(index, { fromClick } = {}) {
    if (index === openIndex && fromClick) {
      // Toggle closed on second click / tap
      openIndex = -1;
    } else if (index >= 0) {
      openIndex = index;
    } else {
      openIndex = -1;
    }

    rows.forEach((row, i) => {
      const open = i === openIndex;
      row.classList.toggle('is-open', open);
      const btn = row.querySelector('.dm-row__trigger');
      if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setHover(index) {
    if (!finePointer.matches) return;
    hoverIndex = index;
    rows.forEach((row, i) => {
      row.classList.toggle('is-hover', i === hoverIndex);
    });
  }

  function clearHover() {
    hoverIndex = -1;
    rows.forEach((row) => row.classList.remove('is-hover'));
  }

  rows.forEach((row, i) => {
    const btn = row.querySelector('.dm-row__trigger');
    if (!btn) return;

    row.addEventListener('mouseenter', () => setHover(i));
    row.addEventListener('mouseleave', () => {
      if (hoverIndex === i) {
        // leave handling is on accordion mouseleave
      }
    });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setOpen(i, { fromClick: true });
      if (finePointer.matches) setHover(i);
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setOpen(-1);
        clearHover();
        btn.blur();
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const next = e.key === 'ArrowDown'
          ? (i + 1) % rows.length
          : (i - 1 + rows.length) % rows.length;
        const nextBtn = rows[next].querySelector('.dm-row__trigger');
        nextBtn?.focus();
        if (finePointer.matches) setHover(next);
      }
    });
  });

  accordion.addEventListener('mouseleave', () => {
    if (!finePointer.matches) return;
    clearHover();
    openIndex = -1;
    rows.forEach((row) => {
      row.classList.remove('is-open');
      const btn = row.querySelector('.dm-row__trigger');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  });

  // Section enter reveal
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            section.classList.add('is-inview');
            io.disconnect();
          }
        });
      },
      { threshold: 0.18 }
    );
    io.observe(section);
  } else {
    section.classList.add('is-inview');
  }

  if (reducedMotion) {
    section.classList.add('is-inview');
  }
})();
