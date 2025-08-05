// src/js/loadTerms.js
import { setState } from './state.js';
import { fetchAndDisplayTerm } from './fetcher.js';
import { showTermComparison } from './comparison.js';
import { setupCategoryFilter } from './filters.js';
import { setupAlphabetFilter } from './filters.js';
import { renderTermLinks } from './filters.js';
import { showDailyTerm } from './utils.js'; // optional, depending on where you put it

export async function loadTerms() {
  try {
    const res = await fetch('/data/terms.json');
    const terms = await res.json();

    const aliases = {};
    const list = Object.keys(terms);

    for (const [term, data] of Object.entries(terms)) {
      aliases[term.toLowerCase()] = term;

      if (Array.isArray(data.aliases)) {
        data.aliases.forEach(alias => {
          aliases[alias.toLowerCase()] = term;
        });
      }
    }

    setState({
      terms,
      list,
      aliases
    });

    // Optional daily term setup
    showDailyTerm?.(terms);

    const visibleTerms = list.filter(t => {
      const resolved = aliases[t.toLowerCase()] || t.toLowerCase();
      return terms[resolved];
    });

    setupCategoryFilter(visibleTerms);
    setupAlphabetFilter(visibleTerms);
    renderTermLinks(visibleTerms);

    // 🔁 Inside async function loadTerms(), after setState() and filters
    const params = new URLSearchParams(window.location.search);
    const urlTerm = params.get("term");
    const compareParam = params.get("compare");

    if (compareParam) {
        const [a, b] = compareParam
            .split("-vs-")
            .map(part => decodeURIComponent(part.trim().toLowerCase()));

        if (a && b) {
            // Wait for #compareOutput to exist before showing comparison
            const waitForContainer = setInterval(() => {
            if (document.getElementById("compareOutput")) {
                clearInterval(waitForContainer);
                showTermComparison(a, b);
            }
            }, 50);
            return;
        }
    }

    if (urlTerm) {
        fetchAndDisplayTerm(urlTerm.toLowerCase()); // ✅ Same here
    }
  } catch (err) {
    console.error("❌ Failed to load terms.json", err);
  }
}
