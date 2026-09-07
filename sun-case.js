/**
 * Sun Investments — visual case study (TJSB-structured)
 */
(() => {
  if (!document.body.classList.contains('page-case--sun')) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const LENSES = {
    mf: {
      title: 'Mutual Funds',
      items: [
        'Mutual Fund performance',
        'Volatility',
        'Risk-adjusted returns',
        'AUM and fund-performance relationships',
        'Comparative risk-return analysis',
      ],
    },
    ipo: {
      title: 'IPOs',
      items: [
        'IPO listing performance',
        'Long-term returns',
        'Market behaviour',
        'Short-term versus sustainable performance',
      ],
    },
    etf: {
      title: 'ETFs',
      items: [
        'ETF returns',
        'Tracking error',
        'Liquidity',
        'Comparative performance',
      ],
    },
  };

  const SCALE = {
    years: {
      label: '10 Years',
      body: 'Historical analysis period covering the investment-product evaluation.',
    },
    cats: {
      label: '3 Investment categories',
      body: 'Mutual Funds · IPOs · ETFs',
    },
    ipos: {
      label: '164 IPOs analysed',
      body: 'IPO analysis covering 2018–2022.',
    },
    cohort: {
      label: '64 IPOs analysed',
      body: '2021 IPO cohort.',
    },
  };

  const FUNDS = {
    equity: {
      label: 'Equity funds',
      metrics: [
        { value: '12.5%', note: 'Average annual return' },
        { value: '18.0%', note: 'Volatility' },
        { value: '0.69', note: 'Sharpe ratio' },
      ],
      body: 'Higher return does not automatically mean better risk-adjusted performance.',
      tip: 'Equity · Return 12.5% · Volatility 18.0% · Sharpe 0.69',
    },
    hybrid: {
      label: 'Hybrid funds',
      metrics: [{ value: '9.0%', note: 'Average return' }],
      body: 'Hybrid average return is shown as context. Volatility was not part of the available project data for this category.',
      tip: 'Hybrid · Return 9.0%',
    },
    debt: {
      label: 'Debt funds',
      metrics: [{ value: '1.02', note: 'Sharpe ratio' }],
      body: 'Debt funds showed a stronger risk-adjusted profile on Sharpe. Return and volatility figures were not part of the available project data for this category.',
      tip: 'Debt · Sharpe 1.02',
    },
  };

  const ETF = {
    return: {
      label: 'Average return',
      body: 'Equity ETF average return across the evaluated set.',
    },
    track: {
      label: 'Tracking error',
      body: "Measures the difference between an ETF's performance and its underlying benchmark.",
    },
    liq: {
      label: 'Liquidity',
      body: 'Indicates the ability to enter and exit positions with less friction.',
    },
    bond: {
      label: 'Bond ETF tracking error',
      body: 'Bond ETFs in the set tracked their benchmarks with a lower tracking error.',
    },
  };

  const FINDINGS = {
    risk: {
      label: 'Return ≠ Risk',
      rich: `<dl class="sun-expand__dl">
        <div><dt>Equity Mutual Funds</dt><dd>12.5% avg. annual return</dd></div>
        <div><dt>Volatility</dt><dd>18.0%</dd></div>
        <div><dt>Sharpe Ratio</dt><dd>0.69</dd></div>
      </dl>`,
      body: 'Higher returns came with higher volatility, making risk-adjusted performance an important consideration.',
    },
    term: {
      label: 'Short term ≠ Long term',
      rich: `<dl class="sun-expand__dl">
        <div><dt>2021 IPOs · First-day return</dt><dd>28.4%</dd></div>
        <div><dt>2021 IPOs · 1-year return</dt><dd>15.6%</dd></div>
      </dl>`,
      body: 'Initial listing performance did not tell the full longer-term story.',
    },
    whole: {
      label: 'Return ≠ The whole story',
      rich: `<p class="sun-expand__stack">Return <i>+</i> Liquidity <i>+</i> Tracking efficiency</p>`,
      body: 'Historical returns alone were not sufficient for evaluating ETF performance.',
    },
  };

  function showPanel(panel, open) {
    if (!panel) return;
    if (open) {
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add('is-open'));
    } else {
      panel.classList.remove('is-open');
      window.setTimeout(() => {
        if (!panel.classList.contains('is-open')) panel.hidden = true;
      }, reduceMotion ? 0 : 420);
    }
  }

  function exclusiveToggle(buttons, activeBtn, panel, render) {
    const wasActive = activeBtn.classList.contains('is-active');
    buttons.forEach((btn) => {
      const on = !wasActive && btn === activeBtn;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-expanded', on ? 'true' : 'false');
      if (btn.hasAttribute('aria-pressed')) {
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      }
    });
    if (wasActive) {
      showPanel(panel, false);
      return false;
    }
    render();
    showPanel(panel, true);
    return true;
  }

  /* Lenses — override/supplement work-case.js for panel content */
  const lensBtns = [...document.querySelectorAll('.sun-lenses .case-lens')];
  const lensTitle = document.getElementById('sunLensTitle');
  const lensList = document.getElementById('sunLensList');

  function renderLens(key) {
    const data = LENSES[key];
    if (!data || !lensTitle || !lensList) return;
    lensTitle.textContent = data.title;
    lensList.innerHTML = data.items.map((item) => `<li>${item}</li>`).join('');
  }

  lensBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      renderLens(btn.dataset.lens);
    });
  });
  renderLens('mf');

  /* Scale */
  const scaleBtns = [...document.querySelectorAll('.sun-scale__item')];
  const scalePanel = document.getElementById('sunScalePanel');
  const scaleLabel = document.getElementById('sunScaleLabel');
  const scaleBody = document.getElementById('sunScaleBody');

  scaleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      exclusiveToggle(scaleBtns, btn, scalePanel, () => {
        const data = SCALE[btn.dataset.scale];
        if (!data) return;
        scaleLabel.textContent = data.label;
        scaleBody.textContent = data.body;
      });
    });
  });

  /* Count-up */
  function animateCount(el) {
    const target = Number(el.dataset.count || 0);
    if (reduceMotion) {
      el.textContent = String(target);
      return;
    }
    const duration = 700;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const countNodes = [...document.querySelectorAll('.sun-count')];
  if (countNodes.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    countNodes.forEach((n) => io.observe(n));
  }

  /* Scatter */
  const chartHost = document.getElementById('sunScatterChart');
  const tooltip = document.getElementById('sunTooltip');
  const fundPanel = document.getElementById('sunFundPanel');
  const fundLabel = document.getElementById('sunFundLabel');
  const fundMetrics = document.getElementById('sunFundMetrics');
  const fundBody = document.getElementById('sunFundBody');
  const chips = [...document.querySelectorAll('.sun-chip')];

  function openFund(key) {
    const data = FUNDS[key];
    if (!data || !fundPanel) return;
    chips.forEach((c) => {
      const on = c.dataset.fund === key;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    document.querySelectorAll('.sun-scatter__point').forEach((p) => {
      p.classList.toggle('is-active', p.dataset.fund === key);
    });
    document.querySelectorAll('.sun-scatter__href').forEach((p) => {
      p.classList.toggle('is-active', p.dataset.fund === key);
    });
    fundLabel.textContent = data.label;
    fundMetrics.innerHTML = data.metrics
      .map((m) => `<div><strong>${m.value}</strong><span>${m.note}</span></div>`)
      .join('');
    fundBody.textContent = data.body;
    showPanel(fundPanel, true);
  }

  function buildScatter() {
    if (!chartHost) return;
    const W = 640;
    const H = 360;
    const pad = { t: 28, r: 28, b: 52, l: 56 };
    const plotW = W - pad.l - pad.r;
    const plotH = H - pad.t - pad.b;
    const xMax = 22;
    const yMax = 16;
    const xScale = (v) => pad.l + (v / xMax) * plotW;
    const yScale = (v) => pad.t + plotH - (v / yMax) * plotH;
    const equity = { x: 18, y: 12.5 };
    const hybridY = 9;
    const gridX = [0, 5, 10, 15, 20];
    const gridY = [0, 4, 8, 12, 16];

    chartHost.innerHTML = `
      <svg class="sun-scatter__svg" viewBox="0 0 ${W} ${H}" role="presentation">
        <g class="sun-scatter__grid">
          ${gridX.map((v) => `<line x1="${xScale(v)}" y1="${pad.t}" x2="${xScale(v)}" y2="${pad.t + plotH}" />`).join('')}
          ${gridY.map((v) => `<line x1="${pad.l}" y1="${yScale(v)}" x2="${pad.l + plotW}" y2="${yScale(v)}" />`).join('')}
        </g>
        <line class="sun-scatter__axis" x1="${pad.l}" y1="${pad.t + plotH}" x2="${pad.l + plotW}" y2="${pad.t + plotH}" />
        <line class="sun-scatter__axis" x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${pad.t + plotH}" />
        <text class="sun-scatter__axis-label" x="${pad.l + plotW / 2}" y="${H - 12}" text-anchor="middle">Volatility →</text>
        <text class="sun-scatter__axis-label" x="16" y="${pad.t + plotH / 2}" text-anchor="middle" transform="rotate(-90 16 ${pad.t + plotH / 2})">Average return →</text>
        ${gridX.filter((v) => v > 0).map((v) => `<text class="sun-scatter__tick" x="${xScale(v)}" y="${pad.t + plotH + 18}" text-anchor="middle">${v}%</text>`).join('')}
        ${gridY.filter((v) => v > 0).map((v) => `<text class="sun-scatter__tick" x="${pad.l - 10}" y="${yScale(v) + 4}" text-anchor="end">${v}%</text>`).join('')}
        <line class="sun-scatter__href" data-fund="hybrid" x1="${pad.l}" y1="${yScale(hybridY)}" x2="${pad.l + plotW}" y2="${yScale(hybridY)}" />
        <text class="sun-scatter__href-label" data-fund="hybrid" x="${pad.l + plotW - 4}" y="${yScale(hybridY) - 8}" text-anchor="end">Hybrid · 9.0%</text>
        <g class="sun-scatter__point" data-fund="equity" tabindex="0" role="button" aria-label="Equity funds, 12.5 percent return, 18 percent volatility">
          <circle class="sun-scatter__halo" cx="${xScale(equity.x)}" cy="${yScale(equity.y)}" r="14" />
          <circle class="sun-scatter__dot" cx="${xScale(equity.x)}" cy="${yScale(equity.y)}" r="6" />
          <text class="sun-scatter__point-label" x="${xScale(equity.x) + 12}" y="${yScale(equity.y) + 4}">Equity</text>
        </g>
      </svg>
    `;

    const equityEl = chartHost.querySelector('.sun-scatter__point[data-fund="equity"]');
    const hybridLine = chartHost.querySelector('.sun-scatter__href[data-fund="hybrid"]');
    const hybridLabel = chartHost.querySelector('.sun-scatter__href-label[data-fund="hybrid"]');

    const placeTip = (clientX, clientY, text) => {
      if (!tooltip) return;
      tooltip.hidden = false;
      tooltip.textContent = text;
      const rect = chartHost.getBoundingClientRect();
      const x = clientX - rect.left + 12;
      const y = clientY - rect.top - 12;
      tooltip.style.left = `${Math.min(rect.width - 180, Math.max(8, x))}px`;
      tooltip.style.top = `${Math.max(8, y)}px`;
    };
    const hideTip = () => {
      if (tooltip) tooltip.hidden = true;
    };

    if (equityEl) {
      equityEl.addEventListener('mouseenter', (e) => {
        equityEl.classList.add('is-hover');
        placeTip(e.clientX, e.clientY, FUNDS.equity.tip);
      });
      equityEl.addEventListener('mousemove', (e) => placeTip(e.clientX, e.clientY, FUNDS.equity.tip));
      equityEl.addEventListener('mouseleave', () => {
        equityEl.classList.remove('is-hover');
        hideTip();
      });
      equityEl.addEventListener('click', () => openFund('equity'));
      equityEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openFund('equity');
        }
      });
    }

    const hybridEnter = (e) => {
      hybridLine?.classList.add('is-hover');
      hybridLabel?.classList.add('is-hover');
      placeTip(e.clientX, e.clientY, FUNDS.hybrid.tip);
    };
    const hybridLeave = () => {
      hybridLine?.classList.remove('is-hover');
      hybridLabel?.classList.remove('is-hover');
      hideTip();
    };
    [hybridLine, hybridLabel].forEach((el) => {
      if (!el) return;
      el.style.cursor = 'pointer';
      el.addEventListener('mouseenter', hybridEnter);
      el.addEventListener('mousemove', (e) => placeTip(e.clientX, e.clientY, FUNDS.hybrid.tip));
      el.addEventListener('mouseleave', hybridLeave);
      el.addEventListener('click', () => openFund('hybrid'));
    });

    const scatterRoot = document.getElementById('sunScatter');
    if (scatterRoot && !reduceMotion) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            scatterRoot.classList.add('is-inview');
            io.unobserve(entry.target);
          });
        },
        { threshold: 0.25 }
      );
      io.observe(scatterRoot);
    } else {
      scatterRoot?.classList.add('is-inview');
    }
  }

  buildScatter();

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const key = chip.dataset.fund;
      if (!key) return;
      if (chip.classList.contains('is-active')) {
        chip.classList.remove('is-active');
        chip.setAttribute('aria-pressed', 'false');
        document.querySelectorAll('.sun-scatter__point, .sun-scatter__href').forEach((p) => {
          p.classList.remove('is-active');
        });
        showPanel(fundPanel, false);
        return;
      }
      openFund(key);
    });
  });

  /* IPO slope */
  const slope = document.getElementById('sunSlope');
  const ipoPanel = document.getElementById('sunIpoPanel');
  slope?.addEventListener('click', () => {
    const open = slope.getAttribute('aria-expanded') === 'true';
    slope.setAttribute('aria-expanded', open ? 'false' : 'true');
    slope.classList.toggle('is-active', !open);
    showPanel(ipoPanel, !open);
  });
  if (slope && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          slope.classList.add('is-inview');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );
    io.observe(slope);
  } else {
    slope?.classList.add('is-inview');
  }

  /* ETF */
  const etfBtns = [...document.querySelectorAll('.sun-etf__item')];
  const etfPanel = document.getElementById('sunEtfPanel');
  const etfLabel = document.getElementById('sunEtfLabel');
  const etfBody = document.getElementById('sunEtfBody');
  etfBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      exclusiveToggle(etfBtns, btn, etfPanel, () => {
        const data = ETF[btn.dataset.etf];
        if (!data) return;
        etfLabel.textContent = data.label;
        etfBody.textContent = data.body;
      });
    });
  });

  /* Findings */
  const findingBtns = [...document.querySelectorAll('.sun-finding')];
  const findingPanel = document.getElementById('sunFindingPanel');
  const findingLabel = document.getElementById('sunFindingLabel');
  const findingRich = document.getElementById('sunFindingRich');
  const findingBody = document.getElementById('sunFindingBody');
  findingBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      exclusiveToggle(findingBtns, btn, findingPanel, () => {
        const data = FINDINGS[btn.dataset.finding];
        if (!data) return;
        findingLabel.textContent = data.label;
        findingRich.innerHTML = data.rich;
        findingBody.textContent = data.body;
      });
    });
  });

  /* Framework — static path, animate on view */
  const frameRoot = document.getElementById('sunFrame');
  if (frameRoot && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          frameRoot.classList.add('is-inview');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );
    io.observe(frameRoot);
  } else {
    frameRoot?.classList.add('is-inview');
  }

  /* Compare bars draw on view */
  const compare = document.querySelector('.sun-compare');
  if (compare) {
    if (reduceMotion) compare.classList.add('is-inview');
    else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            compare.classList.add('is-inview');
            io.unobserve(entry.target);
          });
        },
        { threshold: 0.25 }
      );
      io.observe(compare);
    }
  }
})();
