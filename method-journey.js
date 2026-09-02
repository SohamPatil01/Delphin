/**
 * Delphin Method — editorial scroll section with network visual.
 * Scroll progress drives stage activation; SVG nodes interpolate between layouts.
 */
(function () {
  const section = document.getElementById('method');
  const pin = document.getElementById('methodJourneyPin');
  const placeholder = document.getElementById('methodPlaceholder');
  const stepsNav = document.getElementById('methodStepsNav');
  const svg = document.getElementById('methodNetwork');
  const nodesGroup = document.getElementById('networkNodes');
  const chaosLines = document.getElementById('networkLinesChaos');
  const gridLines = document.getElementById('networkLinesGrid');
  const markersGroup = document.getElementById('networkMarkers');
  const particlesGroup = document.getElementById('networkParticles');
  const clarityGroup = document.getElementById('networkClarity');
  const payoffGroup = document.getElementById('networkPayoff');
  const mobileRoot = document.getElementById('methodMobile');

  if (!section || !pin || !svg) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileQuery = window.matchMedia('(max-width: 900px)');

  const NODE_IDS = ['people', 'finance', 'operations', 'technology', 'sales', 'marketing'];
  const NODE_LABELS = {
    people: 'PEOPLE',
    finance: 'FINANCE',
    operations: 'OPERATIONS',
    technology: 'TECHNOLOGY',
    sales: 'SALES',
    marketing: 'MARKETING',
  };

  const LAYOUT_CHAOS = {
    people: { x: 40, y: 36 },
    finance: { x: 220, y: 22 },
    operations: { x: 400, y: 50 },
    technology: { x: 108, y: 168 },
    sales: { x: 352, y: 218 },
    marketing: { x: 36, y: 288 },
  };

  const LAYOUT_GRID = {
    people: { x: 52, y: 64 },
    operations: { x: 240, y: 64 },
    technology: { x: 428, y: 64 },
    finance: { x: 52, y: 224 },
    sales: { x: 240, y: 224 },
    marketing: { x: 428, y: 224 },
  };

  const CHAOS_EDGES = [
    ['people', 'finance'],
    ['people', 'technology'],
    ['people', 'marketing'],
    ['finance', 'operations'],
    ['finance', 'technology'],
    ['operations', 'sales'],
    ['operations', 'technology'],
    ['technology', 'sales'],
    ['technology', 'marketing'],
    ['sales', 'marketing'],
    ['finance', 'sales'],
  ];

  const GRID_EDGES = [
    ['people', 'operations'],
    ['operations', 'technology'],
    ['finance', 'sales'],
    ['sales', 'marketing'],
    ['people', 'finance'],
    ['operations', 'sales'],
    ['technology', 'marketing'],
  ];

  const KEY_GRID_EDGES = new Set([
    'people-operations',
    'operations-technology',
    'finance-sales',
    'sales-marketing',
  ]);

  const HIGHLIGHT_EDGES = new Set([
    'finance-technology',
    'operations-sales',
    'people-marketing',
    'finance-sales',
  ]);

  const MARKERS = [
    { id: 'bottleneck', label: 'BOTTLENECK', edge: ['finance', 'technology'], t: 0.45 },
    { id: 'duplication', label: 'DUPLICATION', edge: ['operations', 'sales'], t: 0.5 },
    { id: 'manual', label: 'MANUAL', edge: ['people', 'marketing'], t: 0.55 },
    { id: 'risk', label: 'RISK', edge: ['finance', 'sales'], t: 0.4 },
  ];

  const STAGE_COUNT = 5;
  const SCROLL_HOLD = 0.9;

  function createEaseBezier(x1, y1, x2, y2) {
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;
    const sampleX = t => ((ax * t + bx) * t + cx) * t;
    const sampleY = t => ((ay * t + by) * t + cy) * t;
    const sampleDX = t => (3 * ax * t + 2 * bx) * t + cx;

    return t => {
      if (t <= 0) return 0;
      if (t >= 1) return 1;
      let x = t;
      for (let i = 0; i < 8; i++) {
        const err = sampleX(x) - t;
        if (Math.abs(err) < 1e-5) break;
        x -= err / sampleDX(x);
      }
      return sampleY(x);
    };
  }

  const EASE = createEaseBezier(0.22, 1, 0.36, 1);

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const edgeKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

  const lerpLayout = (from, to, t) => {
    const out = {};
    NODE_IDS.forEach(id => {
      out[id] = {
        x: lerp(from[id].x, to[id].x, t),
        y: lerp(from[id].y, to[id].y, t),
      };
    });
    return out;
  };

  const nodeEls = {};
  const chaosLineEls = [];
  const gridLineEls = [];
  const markerEls = [];
  let particles = [];
  let rafId = null;
  let currentStage = 0;
  let stageProgress = 0;
  let mobileVisualsPopulated = false;

  function buildNodes() {
    NODE_IDS.forEach(id => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('network-node');
      g.dataset.id = id;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '10');
      circle.classList.add('network-node__dot');

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.classList.add('network-node__label');
      label.textContent = NODE_LABELS[id];
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('y', '28');

      g.appendChild(circle);
      g.appendChild(label);
      nodesGroup.appendChild(g);
      nodeEls[id] = g;
    });
  }

  function edgePoint(layout, a, b, t = 0.5) {
    const p1 = layout[a];
    const p2 = layout[b];
    return { x: lerp(p1.x, p2.x, t), y: lerp(p1.y, p2.y, t) };
  }

  function lineLength(layout, a, b) {
    const p1 = layout[a];
    const p2 = layout[b];
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
  }

  function buildLines(container, edges, store, extraClass) {
    edges.forEach(([a, b], i) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.classList.add('network-line');
      if (extraClass) line.classList.add(extraClass);
      line.dataset.edge = edgeKey(a, b);
      container.appendChild(line);
      const len = lineLength(LAYOUT_CHAOS, a, b);
      store.push({ el: line, a, b, len, index: i });
    });
  }

  function buildMarkers() {
    MARKERS.forEach(m => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('network-marker');
      g.dataset.id = m.id;

      const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring.setAttribute('r', '18');
      ring.classList.add('network-marker__ring');

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.classList.add('network-marker__label');
      text.textContent = m.label;
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('y', '3');

      g.appendChild(ring);
      g.appendChild(text);
      markersGroup.appendChild(g);
      markerEls.push({ el: g, ...m });
    });
  }

  function buildParticles() {
    GRID_EDGES.slice(0, 5).forEach((edge, i) => {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('r', '3.5');
      c.classList.add('network-particle');
      particlesGroup.appendChild(c);
      particles.push({
        el: c,
        edge,
        offset: i * 0.2,
        speed: 0.00018,
      });
    });
  }

  function updateMarkers(layout, visible, p) {
    markerEls.forEach((m, i) => {
      const pt = edgePoint(layout, m.edge[0], m.edge[1], m.t);
      m.el.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);
      const markerT = visible
        ? EASE(clamp((p * (markerEls.length + 1) - i) / 1.2, 0, 1))
        : 0;
      m.el.style.opacity = markerT * 0.55;
    });
  }

  function updateParticles(layout, time, visible, p) {
    particles.forEach(part => {
      if (!visible) {
        part.el.style.opacity = 0;
        return;
      }
      const fadeIn = EASE(clamp((p - 0.1) / 0.6, 0, 1));
      const t = (part.offset + time * part.speed) % 1;
      const pt = edgePoint(layout, part.edge[0], part.edge[1], t);
      part.el.setAttribute('cx', pt.x);
      part.el.setAttribute('cy', pt.y);
      part.el.style.opacity = fadeIn * (0.18 + Math.sin(t * Math.PI) * 0.32);
    });
  }

  function renderVisual(stage, t, time, targetSvg) {
    const activeSvg = targetSvg || svg;
    const p = EASE(t);
    let layout = LAYOUT_CHAOS;
    let chaosBase = 0;
    let gridBase = 0;
    let nodeOpacity = 0.88;
    let markerVis = false;
    let particleVis = false;
    let clarityOp = 0;
    let payoffOp = 0;
    let trimGrid = false;

    if (stage === 0) {
      nodeOpacity = 0.88;
      chaosBase = lerp(0, 0.42, p);
      layout = LAYOUT_CHAOS;
    } else if (stage === 1) {
      layout = LAYOUT_CHAOS;
      chaosBase = 0.38;
      nodeOpacity = 0.88;
      markerVis = true;
    } else if (stage === 2) {
      layout = lerpLayout(LAYOUT_CHAOS, LAYOUT_GRID, p);
      chaosBase = lerp(0.38, 0, p);
      gridBase = lerp(0, 0.42, p);
      nodeOpacity = 0.88;
    } else if (stage === 3) {
      layout = LAYOUT_GRID;
      gridBase = 0.48;
      nodeOpacity = 0.88;
      particleVis = p > 0.12;
    } else if (stage === 4) {
      layout = LAYOUT_GRID;
      trimGrid = true;
      const simplifyT = EASE(clamp(p / 0.45, 0, 1));
      gridBase = lerp(0.48, 0.22, simplifyT);
      nodeOpacity = lerp(0.88, 0.08, EASE(clamp((p - 0.15) / 0.55, 0, 1)));
      clarityOp = EASE(clamp((p - 0.35) / 0.45, 0, 1));
      payoffOp = EASE(clamp((p - 0.62) / 0.38, 0, 1));
    }

    const useGroups = !targetSvg;
    const nodes = useGroups
      ? nodeEls
      : Object.fromEntries(
          [...activeSvg.querySelectorAll('.network-node')].map(el => [el.dataset.id, el])
        );

    NODE_IDS.forEach((id, i) => {
      const g = nodes[id];
      if (!g) return;
      const { x, y } = layout[id];
      g.setAttribute('transform', `translate(${x}, ${y})`);
      let opacity = nodeOpacity;
      if (stage === 0) {
        const nodeT = EASE(clamp((p * (NODE_IDS.length + 1.5) - i) / 1.4, 0, 1));
        opacity = lerp(0, nodeOpacity, nodeT);
      }
      g.style.opacity = opacity;
    });

    const updateStore = (store, isChaos) => {
      store.forEach(entry => {
        const { el, a, b, len, index } = entry;
        const key = edgeKey(a, b);
        let opacity = isChaos ? chaosBase : gridBase;
        let drawT = 1;

        if (stage === 0 && isChaos) {
          drawT = EASE(clamp((p * (CHAOS_EDGES.length + 1) - index) / 1.3, 0, 1));
          opacity = drawT * chaosBase;
        }

        if (stage === 1 && isChaos) {
          el.classList.toggle('is-highlight', HIGHLIGHT_EDGES.has(key));
          opacity = HIGHLIGHT_EDGES.has(key) ? lerp(0.35, 0.65, p) : 0.22;
        } else {
          el.classList.remove('is-highlight');
        }

        if (stage === 4 && !isChaos && trimGrid) {
          const isKey = KEY_GRID_EDGES.has(key);
          opacity = isKey ? gridBase * 1.4 : gridBase * lerp(1, 0.15, EASE(clamp(p / 0.5, 0, 1)));
        }

        const p1 = layout[a];
        const p2 = layout[b];
        el.setAttribute('x1', p1.x);
        el.setAttribute('y1', p1.y);
        el.setAttribute('x2', p2.x);
        el.setAttribute('y2', p2.y);

        const dashLen = len || lineLength(layout, a, b);
        if (isChaos && stage === 0) {
          el.style.strokeDasharray = `${dashLen}`;
          el.style.strokeDashoffset = `${dashLen * (1 - drawT)}`;
        } else {
          el.style.strokeDasharray = '';
          el.style.strokeDashoffset = '';
        }

        el.style.opacity = opacity;
      });
    };

    if (useGroups) {
      updateStore(chaosLineEls, true);
      updateStore(gridLineEls, false);
      updateMarkers(layout, markerVis, p);
      updateParticles(layout, time, particleVis, p);
    } else {
      [...activeSvg.querySelectorAll('.network-lines--chaos .network-line')].forEach((el, i) => {
        const entry = chaosLineEls[i];
        if (!entry) return;
        updateStore([{ ...entry, el }], true);
      });
      [...activeSvg.querySelectorAll('.network-lines--grid .network-line')].forEach((el, i) => {
        const entry = gridLineEls[i];
        if (!entry) return;
        updateStore([{ ...entry, el }], false);
      });
      activeSvg.querySelectorAll('.network-marker').forEach((el, i) => {
        const m = markerEls[i];
        if (!m) return;
        const pt = edgePoint(layout, m.edge[0], m.edge[1], m.t);
        el.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);
        const markerT = markerVis
          ? EASE(clamp((p * (markerEls.length + 1) - i) / 1.2, 0, 1))
          : 0;
        el.style.opacity = markerT * 0.55;
      });
    }

    const clarity = useGroups ? clarityGroup : activeSvg.querySelector('.network-clarity');
    const payoff = useGroups ? payoffGroup : activeSvg.querySelector('.network-payoff');
    if (clarity) clarity.style.opacity = clarityOp;
    if (payoff) payoff.style.opacity = payoffOp;

    activeSvg.dataset.stage = String(stage);
    activeSvg.classList.toggle('is-clarity', clarityOp > 0.55);
    activeSvg.classList.toggle('is-payoff', payoffOp > 0.45);
  }

  function setActiveStage(stage) {
    currentStage = stage;

    document.querySelectorAll('.method-steps-nav__item[data-stage]').forEach(el => {
      const idx = Number(el.dataset.stage);
      el.classList.toggle('is-active', idx === stage);
      el.classList.toggle('is-complete', idx < stage);
    });
  }

  function getScrollMetrics() {
    const rect = section.getBoundingClientRect();
    const total = Math.max(1, section.offsetHeight - window.innerHeight);
    const scrolled = Math.max(0, -rect.top);
    const progress = Math.min(1, scrolled / total);
    return { progress, total, scrolled };
  }

  function updatePin() {
    if (mobileQuery.matches || reducedMotion) return;
    const start = section.offsetTop;
    const pinH = pin.offsetHeight;
    const end = start + section.offsetHeight - pinH - 78;
    const y = window.scrollY;

    pin.classList.remove('is-fixed', 'is-ended');
    placeholder?.classList.remove('is-active');
    if (y < start) {
      pin.style.width = '';
    } else if (y >= end) {
      pin.classList.add('is-ended');
      pin.style.width = '';
    } else {
      pin.classList.add('is-fixed');
      placeholder?.classList.add('is-active');
      pin.style.width = `${section.offsetWidth}px`;
    }
  }

  function progressToStage(progress) {
    const mapped = progress >= SCROLL_HOLD ? 1 : progress / SCROLL_HOLD;
    const scaled = mapped * STAGE_COUNT;
    const stage = Math.min(STAGE_COUNT - 1, Math.floor(scaled));
    const t = scaled - stage;
    return { stage, t };
  }

  function onScroll() {
    updatePin();
    if (mobileQuery.matches) return;
    const { progress } = getScrollMetrics();
    const { stage, t } = progressToStage(progress);
    stageProgress = t;
    setActiveStage(stage);
  }

  function tick(time) {
    if (!mobileQuery.matches && !reducedMotion) {
      renderVisual(currentStage, stageProgress, time);
    }
    rafId = requestAnimationFrame(tick);
  }

  function scrollToStage(index) {
    if (mobileQuery.matches) {
      const target = mobileRoot?.querySelector(`.method-steps-nav__item[data-stage="${index}"]`);
      target?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      return;
    }
    const { total } = getScrollMetrics();
    const progress = (index / STAGE_COUNT) * SCROLL_HOLD;
    const top = section.offsetTop + progress * total;
    window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  function populateMobileVisuals() {
    if (!mobileRoot || mobileVisualsPopulated) return;
    mobileRoot.querySelectorAll('.method-journey__mobile-visual').forEach(container => {
      const stage = Number(container.dataset.stage);
      container.innerHTML = svg.outerHTML;
      const clone = container.querySelector('svg');
      clone?.classList.add('method-network--mobile');
      clone?.removeAttribute('id');
      clone?.setAttribute('aria-hidden', 'true');
      renderVisual(Number.isNaN(stage) ? 0 : stage, 1, 0, clone);
    });
    mobileVisualsPopulated = true;
  }

  function updateMobileVisual(stage) {
    populateMobileVisuals();
    mobileRoot?.querySelectorAll('.method-journey__mobile-visual').forEach(container => {
      const clone = container.querySelector('svg');
      if (!clone) return;
      const itemStage = Number(container.dataset.stage);
      if (itemStage === stage) {
        renderVisual(stage, 1, 0, clone);
      }
    });
  }

  function initDesktop() {
    updatePin();
    onScroll();
  }

  function initMobile() {
    pin.classList.remove('is-fixed', 'is-ended');
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    populateMobileVisuals();
    setActiveStage(0);
    stageProgress = 0;
  }

  function initReducedMotion() {
    renderVisual(4, 1, 0);
    if (clarityGroup) clarityGroup.style.opacity = 1;
    if (payoffGroup) payoffGroup.style.opacity = 1;
    svg.classList.add('is-clarity', 'is-payoff');
    setActiveStage(4);
    stageProgress = 1;
    populateMobileVisuals();
  }

  function handleMode() {
    if (reducedMotion) {
      initReducedMotion();
      return;
    }
    if (mobileQuery.matches) initMobile();
    else {
      initDesktop();
      if (!rafId) rafId = requestAnimationFrame(tick);
    }
  }

  buildNodes();
  buildLines(chaosLines, CHAOS_EDGES, chaosLineEls);
  buildLines(gridLines, GRID_EDGES, gridLineEls);
  buildMarkers();
  buildParticles();
  renderVisual(0, 0, 0);

  stepsNav?.querySelectorAll('.method-steps-nav__item').forEach(item => {
    item.addEventListener('click', () => scrollToStage(Number(item.dataset.stage)));
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    mobileVisualsPopulated = false;
    handleMode();
    onScroll();
  }, { passive: true });

  mobileQuery.addEventListener('change', () => {
    mobileVisualsPopulated = false;
    handleMode();
  });

  const mobileObserver = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const stage = Number(e.target.dataset.stage);
        if (Number.isNaN(stage)) return;
        setActiveStage(stage);
        updateMobileVisual(stage);
      });
    },
    { threshold: 0.45, rootMargin: '-15% 0px -15% 0px' }
  );
  mobileRoot?.querySelectorAll('.method-steps-nav__item[data-stage]').forEach(el => {
    mobileObserver.observe(el);
  });

  handleMode();
  updatePin();
  onScroll();

  window.addEventListener('load', () => {
    updatePin();
    onScroll();
  });
})();
