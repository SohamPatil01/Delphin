(() => {
  if (!document.body.classList.contains('page-case')) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observeInView = (selector, className = 'is-inview') => {
    const nodes = [...document.querySelectorAll(selector)];
    if (!nodes.length) return;
    if (reduceMotion) {
      nodes.forEach(n => n.classList.add(className));
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add(className);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    nodes.forEach(n => io.observe(n));
  };

  observeInView('.case-diagram');
  observeInView('.case-arch-flow');
  observeInView('.case-risk-system');
  observeInView('.case-capital');
  observeInView('.case-chart-block');
  observeInView('.case-pillars');
  observeInView('.case-table-wrap');

  // Fallback: ensure chart bars become visible even if IO misses
  window.setTimeout(() => {
    document.querySelectorAll('.case-chart-block').forEach(n => n.classList.add('is-inview'));
  }, 1800);

  const modules = [...document.querySelectorAll('.case-module')];
  modules.forEach(details => {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      modules.forEach(other => {
        if (other !== details) other.open = false;
      });
    });
  });

  const lenses = [...document.querySelectorAll('.case-lens')];
  lenses.forEach(btn => {
    btn.addEventListener('click', () => {
      lenses.forEach(other => {
        const active = other === btn;
        other.classList.toggle('is-active', active);
        other.setAttribute('aria-expanded', active ? 'true' : 'false');
      });
    });
  });

  const CHARTS = {
    interest: {
      unit: '₹ lakh',
      format: v => v.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
      points: [
        { label: '2020', value: 58018.75 },
        { label: '2021', value: 62937.7 },
        { label: '2022', value: 69340.75 },
        { label: '2023', value: 67086.2 },
        { label: '2024', value: 71841.4 },
      ],
    },
    npa: {
      unit: '₹ lakh',
      format: v => v.toLocaleString('en-IN'),
      points: [
        { label: '2020', value: 33057 },
        { label: '2021', value: 26443 },
        { label: '2022', value: 23843 },
        { label: '2023', value: 28809 },
        { label: '2024', value: 28793 },
      ],
    },
    crar: {
      unit: '%',
      format: v => v.toFixed(2) + '%',
      points: [
        { label: '2019', value: 15.38 },
        { label: '2020', value: 15.23 },
        { label: '2021', value: 15.28 },
        { label: '2022', value: 16.93 },
        { label: '2023', value: 17.57 },
      ],
    },
  };

  const renderChart = (el, key) => {
    const config = CHARTS[key];
    if (!config) return;
    const max = Math.max(...config.points.map(p => p.value));
    const min = Math.min(...config.points.map(p => p.value));
    // Keep relative differences readable without collapsing the shortest bar.
    const floor = Math.max(min - (max - min) * 0.35, 0);
    const span = Math.max(max - floor, max * 0.12);

    el.innerHTML = `
      <div class="case-chart__bars" style="--cols:${config.points.length}">
        ${config.points
          .map((p, i) => {
            const pct = Math.max(((p.value - floor) / span) * 100, 14);
            return `
              <div class="case-chart__col" style="--delay:${i * 0.08}s">
                <span class="case-chart__value">${config.format(p.value)}</span>
                <div class="case-chart__track" aria-hidden="true">
                  <span class="case-chart__bar" style="height:${pct.toFixed(1)}%"></span>
                </div>
                <span class="case-chart__label">${p.label}</span>
              </div>
            `;
          })
          .join('')}
      </div>
      <p class="case-chart__unit">${config.unit}</p>
    `;
  };

  document.querySelectorAll('[data-chart]').forEach(el => {
    renderChart(el, el.dataset.chart);
  });

  // Keep K2-specific script path working if both are loaded — no conflict
})();
