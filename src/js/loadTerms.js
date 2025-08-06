// src/js/loadTerms.js
import { setState } from './state.js';
import { fetchAndDisplayTerm } from './fetcher.js';
import { showTermComparison } from './comparison.js';
import { setupCategoryFilter } from './filters.js';
import { setupAlphabetFilter } from './filters.js';
import { renderTermLinks } from './filters.js';
import { showDailyTerm } from './utils.js'; // optional

export async function loadTerms() {
  try {
    // 🔁 Dynamically import all .json files in data folder at build time
    const modules = import.meta.glob('../data/*.json', { eager: true });

    const terms = {};
    const aliases = {};
    const list = [];

    for (const path in modules) {
      const file = modules[path];
      const data = file.default ?? file; // ✅ fix import inconsistency

      console.log(`Processing file: ${path}`);
      console.log('Term count in file:', Object.keys(data).length);

      for (const [term, info] of Object.entries(data)) {
        if (!terms[term]) {
          terms[term] = info;
          list.push(term);
        } else {
          // 🛠 Log the conflict
          console.warn(`🔁 Duplicate term "${term}" found in: ${path}`, {
            original: terms[term],
            incoming: info
          });
        }

        aliases[term.toLowerCase()] = term;

        if (Array.isArray(info.aliases)) {
          info.aliases.forEach(alias => {
            const normalized = alias.toLowerCase();
            if (!aliases[normalized]) {
              aliases[normalized] = term;
            }
          });
        }
      }
    }

    // 🧠 Save state
    setState({ terms, list, aliases });

    // 🌞 Daily Term
    showDailyTerm?.(terms);

    // 📚 Sitemap filters
    const visibleTerms = list.filter(t => {
      const resolved = aliases[t.toLowerCase()] || t.toLowerCase();
      return terms[resolved];
    });

    setupCategoryFilter(visibleTerms);
    setupAlphabetFilter(visibleTerms);
    renderTermLinks(visibleTerms);

    // 🔀 Check for deep-link params
    const params = new URLSearchParams(window.location.search);
    const urlTerm = params.get("term");
    const compareParam = params.get("compare");

    if (compareParam) {
      const [a, b] = compareParam
        .split("-vs-")
        .map(part => decodeURIComponent(part.trim().toLowerCase()));

      if (a && b) {
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
      fetchAndDisplayTerm(urlTerm.toLowerCase());
    }

  } catch (err) {
    console.error("❌ Failed to load terms data", err);
  }
}
