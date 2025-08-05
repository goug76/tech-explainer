import { getState } from './state.js';
import { cleanUrl } from './fetcher.js';

export function renderCompareButtons(baseTerm, relatedTerms) {
  const container = document.getElementById("compareButtons");
  const output = document.getElementById("compareOutput");
  container.innerHTML = "";
  output.innerHTML = "";
  output.classList.add("hidden");

  if (!relatedTerms || relatedTerms.length === 0) return;

  relatedTerms
    .filter(t => {
      // ✅ Only include if it exists in the JSON
      const { aliases, terms } = getState();
      const key = aliases[t.toLowerCase()];
      return terms[key];
    })
    .forEach(related => {
      const btn = document.createElement("button");
      btn.type = "button"; // ✅ Add this line
      btn.textContent = `Compare with ${related}`;
      btn.className = "compare-btn"; // ✅ Unique class for comparison
      btn.addEventListener("click", () => {
        showTermComparison(baseTerm, related);
      });
      container.appendChild(btn);
    });
}

export function showTermComparison(termA, termB) {
  const { termsData: terms, aliasLookup: aliases } = getState();

  const resolvedA = aliases[termA.toLowerCase()];
  const resolvedB = aliases[termB.toLowerCase()];

  const dataA = terms[resolvedA];
  const dataB = terms[resolvedB];

  const container = document.getElementById("compareOutput");
  if (!container) return;

  if (!dataA || !dataB) {
    container.innerHTML = `<p>Could not compare these terms.</p>`;
    container.classList.remove("hidden");
    return;
  }

  container.classList.remove("hidden");
  container.innerHTML = `
    <h2>Comparing: ${resolvedA.toUpperCase()} vs ${resolvedB.toUpperCase()}</h2>
    <div class="compare-columns">
      <div class="compare-box">
        <h4>${resolvedA.toUpperCase()}</h4>
        <p><strong>ELI5:</strong> ${dataA.eli5}</p>
        <p><strong>Boss:</strong> ${dataA.boss}</p>
        <p><strong>Sysadmin:</strong> ${dataA.sysadmin}</p>
      </div>
      <div class="compare-box">
        <h4>${resolvedB.toUpperCase()}</h4>
        <p><strong>ELI5:</strong> ${dataB.eli5}</p>
        <p><strong>Boss:</strong> ${dataB.boss}</p>
        <p><strong>Sysadmin:</strong> ${dataB.sysadmin}</p>
      </div>
    </div>
  `;

  showCompareModal(); // ✅ Show modal now that content is ready
}

// Handle compare suggestion buttons
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".compare-suggest-btn");
  if (btn) {
    const compareValue = btn.dataset.compare;
    if (compareValue && compareValue.includes("-vs-")) {
      const [termA, termB] = compareValue.split("-vs-").map(t => t.toLowerCase());

      renderComparison([mainTerm, relatedTerm]);

      // Update URL without reloading
      history.pushState(null, "", `?compare=${termA}-vs-${termB}`);
    }
  }
});

// Handle back/forward navigation
window.addEventListener("popstate", () => {
  const params = new URLSearchParams(window.location.search);
  const compareParam = params.get("compare");
  const termParam = params.get("term");

  if (compareParam) {
    const [termA, termB] = compareParam.toLowerCase().split("-vs-");
    if (termA && termB) showTermComparison(termA, termB);
  } else if (termParam) {
    fetchAndDisplayTerm(termParam.toLowerCase());
  } else {
    results.innerHTML = ""; // Or show a welcome message
  }
});

export function renderComparison(terms) {
  const { termsData, aliasLookup } = getState();
  const output = document.getElementById("compareOutput");
  if (!output) return;

  output.innerHTML = ""; // Clear previous

  const columns = document.createElement("div");
  columns.className = "compare-columns";

  terms.forEach(raw => {
    const normalized = raw.toLowerCase();
    const resolvedKey = aliasLookup[normalized] || normalized;
    const data = termsData[resolvedKey];
    if (!data) return;

    const box = document.createElement("div");
    box.className = "compare-box";

    box.innerHTML = `
      <h3>${resolvedKey.toUpperCase()}</h3>
      <p><strong>ELI5:</strong> ${data.eli5}</p>
      <p><strong>Boss:</strong> ${data.boss}</p>
      <p><strong>Sysadmin:</strong> ${data.sysadmin}</p>
    `;

    columns.appendChild(box);
  });

  output.appendChild(columns);
  showCompareModal();
}

export function showCompareModal() {
  const modal = document.getElementById("compareModal");
  modal.classList.remove("hidden");
}

export function hideCompareModal() {
  const modal = document.getElementById("compareModal");
  modal.classList.add("hidden");
  cleanUrl();
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("compareModal");

  // Close modal on ✖ button click
  document.querySelector(".modal-close").addEventListener("click", hideCompareModal);

  // Close modal on background click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) hideCompareModal();
  });
});
