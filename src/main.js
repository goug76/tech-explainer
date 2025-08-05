// ✅ Import your actual SCSS entry point
import './styles/main.scss';

import { initTheme } from './js/theme.js';
import { initSuggestions } from './js/suggestions.js';
import { loadTerms } from './js/loadTerms.js';
import { getState } from './js/state.js';
import { fetchAndDisplayTerm } from './js/fetcher.js';
import { renderComparison } from './js/comparison.js';

document.addEventListener('DOMContentLoaded', () => {  
  initTheme(); // ✅ Initialize theme on DOM ready
  initSuggestions(); // ✅ New
  loadTerms(); // ✅ now loads real data

  const explainBtn = document.getElementById("explainBtn");
  const termInput = document.getElementById("termInput");
  const results = document.getElementById("results");
  const randomBtn = document.getElementById("randomBtn");
  const params = new URLSearchParams(window.location.search);
  const compare = params.get("compare");

  if (explainBtn && termInput && results) {
    explainBtn.addEventListener("click", () => {
      console.log("🖱️ Explain button clicked:", termInput?.value);
      const term = termInput.value.trim().toLowerCase();
      if (!term) {
        results.innerHTML = "<p>Please enter a tech term first.</p>";
        return;
      }
      fetchAndDisplayTerm(term);
    });
  }

  if (randomBtn) {
    randomBtn.addEventListener("click", () => {
      const { termList } = getState();
      if (termList.length) {
        const randomTerm = termList[Math.floor(Math.random() * termList.length)];
        const termInput = document.getElementById("termInput");
        if (termInput) termInput.value = randomTerm;
        fetchAndDisplayTerm(randomTerm);
      }
    });
  }

  if (compare) {
    const terms = compare.split(",").map(t => t.trim());
    renderComparison(terms);
  }
});