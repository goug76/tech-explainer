// src/js/filters.js
import { getState } from './state.js';

export function setupCategoryFilter(allTerms) {
  const { termsData, aliasLookup } = getState();
  const container = document.getElementById("categoryFilter");
  if (!container) return;

  container.innerHTML = "";

  const categories = new Set();
  for (const term in termsData) {
    const cats = termsData[term].categories || [];
    cats.forEach(cat => categories.add(cat));
  }

  const buttons = ["All", ...Array.from(categories).sort()];
  buttons.forEach(category => {
    const btn = document.createElement("button");
    btn.textContent = category;
    btn.className = "category-tag";
    btn.addEventListener("click", () => {
      document.querySelectorAll(".category-filter button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filtered = category === "All"
        ? allTerms
        : allTerms.filter(term => {
            const resolved = aliasLookup[term.toLowerCase()];
            return termsData[resolved]?.categories?.includes(category);
          });

      setupAlphabetFilter(filtered);
      renderTermLinks(filtered);
    });

    container.appendChild(btn);
  });
}

export function setupAlphabetFilter(termList) {
  const grouped = groupTermsByLetter(termList);
  const container = document.getElementById("alphabetFilter");
  if (!container) return;

  container.innerHTML = "";
  const letters = ["*", "#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

  letters.forEach(letter => {
    const btn = document.createElement("button");
    btn.textContent = letter;

    const hasTerms = letter === "*" || grouped[letter]?.length > 0;
    if (!hasTerms) {
      btn.disabled = true;
      btn.classList.add("disabled");
    }

    btn.addEventListener("click", () => {
      document.querySelectorAll("#alphabetFilter button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const visible = letter === "*" ? termList : grouped[letter] || [];
      renderTermLinks(visible);
    });

    container.appendChild(btn);
  });
}

function groupTermsByLetter(terms) {
  return terms.reduce((acc, term) => {
    const firstChar = term.charAt(0).toUpperCase();

    let key;
    if (/^[0-9]/.test(firstChar)) {
      key = "#"; // Group numeric terms under '#'
    } else if (/^[A-Z]$/.test(firstChar)) {
      key = firstChar;
    } else {
      return acc; // skip symbols or unsupported prefixes
    }

    if (!acc[key]) acc[key] = [];
    acc[key].push(term);
    return acc;
  }, {});
}

export function renderTermLinks(terms) {
  const { termsData, aliasLookup } = getState();
  const container = document.getElementById("termLinks");
  const countTop = document.getElementById("sitemapCountTop");
  const countBottom = document.getElementById("sitemapCountBottom");

  container.innerHTML = "";

  terms.sort().forEach(term => {
    const normalized = term.toLowerCase();
    const resolvedKey = aliasLookup[normalized] || normalized;
    const data = termsData[resolvedKey];

    const link = document.createElement("a");
    link.href = `?term=${encodeURIComponent(term)}`;
    link.textContent = term;
    link.classList.add("related-btn");

    if (data?.eli5) {
      link.setAttribute("data-term", term);
      link.setAttribute("data-definition", data.eli5);
    }

    container.appendChild(link);
  });

  // ✅ Only call once, after rendering
  enableGlossaryTooltips();

  const totalTerms = Object.keys(termsData).length;
  const displayed = terms.length;

  const formatted = `Showing ${displayed.toLocaleString()} of ${totalTerms.toLocaleString()} terms`;
  if (countTop) countTop.textContent = formatted;
  if (countBottom) countBottom.textContent = formatted;
}

export function enableGlossaryTooltips() {
  const tooltip = document.getElementById("customTooltip");
  const title = tooltip.querySelector(".glossary-title");
  const body = tooltip.querySelector(".glossary-body");

  document.querySelectorAll("#termLinks a").forEach(link => {
    const term = link.dataset.term;
    const definition = link.dataset.definition;

    link.addEventListener("mouseenter", () => {
      title.textContent = term;
      body.textContent = definition;
      tooltip.classList.add("visible");
    });

    link.addEventListener("mousemove", (e) => {
      const padding = 15;
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = e.clientY + padding;
      let left = e.clientX + padding;

      // Flip vertically if going off bottom edge
      if (e.clientY + tooltipRect.height + padding > viewportHeight) {
        top = e.clientY - tooltipRect.height - padding;
        if (top < 0) top = padding;
      }

      // Flip horizontally if going off right edge
      if (e.clientX + tooltipRect.width + padding > viewportWidth) {
        left = e.clientX - tooltipRect.width - padding;
        if (left < 0) left = padding;
      }

      tooltip.style.top = `${top + window.scrollY}px`;
      tooltip.style.left = `${left + window.scrollX}px`;
    });

    link.addEventListener("mouseleave", () => {
      tooltip.classList.remove("visible");
    });
  });
}
