/* NuMetrik Systems — main.js v4.0 */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile nav toggle --------------------------------- */
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks  = document.querySelector('.nav__links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
  }

  /* ---- Active nav link ----------------------------------- */
  const fullPath = window.location.pathname;
  document.querySelectorAll('.nav__links a').forEach(link => {
    const href = link.getAttribute('href') || '';
    try {
      const resolved = new URL(href, window.location.href).pathname;
      if (resolved === fullPath || (fullPath.endsWith('/') && resolved === fullPath + 'index.html')) {
        link.classList.add('active');
      }
    } catch(e) {}
  });

  /* ---- Multi-dropdown nav -------------------------------- */
  const dropdowns = document.querySelectorAll('.has-dropdown');

  dropdowns.forEach(item => {
    const trigger = item.querySelector('.nav__link-btn');
    if (!trigger) return;

    trigger.addEventListener('click', e => {
      if (window.innerWidth <= 768) {
        e.stopPropagation();
        const wasOpen = item.classList.contains('open');
        dropdowns.forEach(d => {
          d.classList.remove('open');
          const t = d.querySelector('.nav__link-btn');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
        if (!wasOpen) {
          item.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      }
    });

    // Mark trigger active when a child link matches current URL
    const dropLinks = item.querySelectorAll('.dropdown a');
    dropLinks.forEach(dl => {
      try {
        const resolved = new URL(dl.getAttribute('href'), window.location.href).pathname;
        if (resolved === fullPath) trigger.classList.add('active');
      } catch(e) {}
    });
  });

  // Close all dropdowns on outside click
  document.addEventListener('click', e => {
    dropdowns.forEach(item => {
      if (!item.contains(e.target)) {
        item.classList.remove('open');
        const trigger = item.querySelector('.nav__link-btn');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ---- Audience tabs ------------------------------------- */
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b   => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  /* ---- ROI Calculator ------------------------------------ */
  initROICalculator();

  /* ---- Resources Library Filter ------------------------- */
  initResourcesFilter();

});

/* =========================================================
   ROI Calculator
   ========================================================= */
function initROICalculator() {
  const calc = document.getElementById('roi-calculator');
  if (!calc) return;

  const inputs = {
    throughput:   document.getElementById('roi-throughput'),
    instrCost:    document.getElementById('roi-instr-cost'),
    samplingFreq: document.getElementById('roi-sampling'),
    energyCost:   document.getElementById('roi-energy'),
  };
  const displays = {
    throughput:   document.getElementById('roi-throughput-val'),
    instrCost:    document.getElementById('roi-instr-cost-val'),
    samplingFreq: document.getElementById('roi-sampling-val'),
    energyCost:   document.getElementById('roi-energy-val'),
  };
  const outputs = {
    annualSavings: document.getElementById('roi-annual-savings'),
    payback:       document.getElementById('roi-payback'),
  };

  function formatCurrency(n) {
    if (n >= 1000000) return '$' + (n/1000000).toFixed(1) + 'M';
    if (n >= 1000) return '$' + Math.round(n/1000) + 'k';
    return '$' + Math.round(n);
  }

  function calculate() {
    const throughput   = parseFloat(inputs.throughput?.value   || 5000);
    const instrCost    = parseFloat(inputs.instrCost?.value    || 80000);
    const samplingFreq = parseFloat(inputs.samplingFreq?.value || 14);
    const energyCost   = parseFloat(inputs.energyCost?.value   || 0.08);

    if (displays.throughput)   displays.throughput.textContent   = throughput.toLocaleString() + ' t/day';
    if (displays.instrCost)    displays.instrCost.textContent    = formatCurrency(instrCost) + '/yr';
    if (displays.samplingFreq) displays.samplingFreq.textContent = samplingFreq + ' samples/wk';
    if (displays.energyCost)   displays.energyCost.textContent   = '$' + energyCost.toFixed(3) + '/kWh';

    // Illustrative model — requires site-specific validation before reliance
    const sampSavingsLow  = samplingFreq * 52 * 350 * 0.30;
    const sampSavingsHigh = samplingFreq * 52 * 350 * 0.50;
    const maintSavings    = instrCost * 0.25;
    const throughputSavLow  = throughput * 365 * 0.005 * 12;
    const throughputSavHigh = throughput * 365 * 0.015 * 12;
    const energySavLow  = throughput * 365 * energyCost * 0.4;
    const energySavHigh = throughput * 365 * energyCost * 0.9;

    const totalLow  = Math.round(sampSavingsLow  + maintSavings + throughputSavLow  + energySavLow);
    const totalHigh = Math.round(sampSavingsHigh + maintSavings + throughputSavHigh + energySavHigh);

    const systemCost = 80000;
    const paybackLow  = (systemCost / totalHigh * 12).toFixed(1);
    const paybackHigh = (systemCost / totalLow  * 12).toFixed(1);

    if (outputs.annualSavings) {
      outputs.annualSavings.textContent = formatCurrency(totalLow) + ' – ' + formatCurrency(totalHigh);
    }
    if (outputs.payback) {
      outputs.payback.textContent = paybackLow + ' – ' + paybackHigh + ' months';
    }
  }

  Object.values(inputs).forEach(input => {
    if (input) input.addEventListener('input', calculate);
  });
  calculate();

  const captureForm = document.getElementById('roi-capture-form');
  if (captureForm) {
    captureForm.addEventListener('submit', e => {
      e.preventDefault();
      const emailInput = captureForm.querySelector('input[type="email"]');
      const email = emailInput?.value?.trim();
      if (!email) return;
      // [PLACEHOLDER: wire to form backend / email service]
      const btn = captureForm.querySelector('button');
      if (btn) { btn.textContent = '✓ Sent — check your inbox'; btn.disabled = true; }
      if (emailInput) emailInput.disabled = true;
    });
  }
}

/* =========================================================
   Resources Library — Two-Dimension Filter
   data-type: whitepaper | field-report | case-study | presentation
   data-audience: operators | executives | oem | consultants | research | esg | investors
   ========================================================= */
function initResourcesFilter() {
  const library = document.getElementById('resource-library');
  if (!library) return;

  let activeType     = 'all';
  let activeAudience = 'all';

  const typeChips     = document.querySelectorAll('[data-filter-type]');
  const audienceChips = document.querySelectorAll('[data-filter-audience]');
  const cards         = library.querySelectorAll('.doc-card');
  const noResults     = document.getElementById('no-results');

  function applyFilters() {
    let visible = 0;
    cards.forEach(card => {
      const typeMatch     = activeType     === 'all' || card.dataset.type     === activeType;
      const audienceMatch = activeAudience === 'all' || card.dataset.audience === activeAudience;
      const show = typeMatch && audienceMatch;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (noResults) noResults.style.display = visible === 0 ? '' : 'none';
  }

  typeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      typeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeType = chip.dataset.filterType;
      applyFilters();
    });
  });

  audienceChips.forEach(chip => {
    chip.addEventListener('click', () => {
      audienceChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeAudience = chip.dataset.filterAudience;
      applyFilters();
    });
  });
}
