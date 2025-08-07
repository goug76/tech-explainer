// src/js/fetcher.js
import { getState } from './state.js';
import { showTermComparison } from './comparison.js';
import { setupTabs } from './tabs.js';
import { getJargonTooltip, updateMetaTags, injectSchema } from './utils.js';
import { generateShareLinks } from './share.js';
import { offsetMainFromDailyTerm } from './utils.js';
import { isMobile } from './utils.js';

export function fetchAndDisplayTerm(term) {
  if (!term || typeof term !== "string" || term.trim() === "") {
    console.warn("⚠️ Invalid term passed to fetchAndDisplayTerm:", term);
    return;
  }

  const { termsData, aliasLookup } = getState();
  const normalized = term.toLowerCase();
  const resolvedKey = aliasLookup[normalized] || normalized;
  const data = termsData[resolvedKey];
  const mobile = isMobile();

  const results = document.getElementById("results");
  if (!results) return;

  const glowwrap = document.getElementById("glowwrap");
  if (!glowwrap) return;

  const isFirstLoad = results.innerHTML.trim() === "";
  let newHTML = "";

  if (!data) {
    newHTML = `
        <div class="definition-card">
          <div class="no-results">
            <h2 class="term-title">
              <span class="term-main">${term.toUpperCase()}</span>
            </h2>
            <p>No explanation found for "<strong>${term}</strong>".</p>
            <button id="requestBtn">Request this term</button>
          </div>
        </div>
    `;
  } else {
    const aliasList = data.aliases || [];

    newHTML = `
          <div class="definition-card">
              <div class="explanation card">
                  <h2 class="term-title">
                  <span class="term-main">${resolvedKey.toUpperCase()}</span>
                  ${aliasList.length ? `<span class="term-aliases">(${aliasList.join('<span class="divider"> | </span>')})</span>` : ''}
                  </h2>
                  
                  <div class="term-meta-bar">
                    ${data.level ? `<div class="fluency-section"><strong>🎓 Fluency: </strong>${data.level}</div>` : ""}

                    <div class="term-emoji-display">${data.emoji || '📘'}</div>
                    
                    ${data.jargon_score ? `
                      <div class="jargon-section">
                        <span class="tooltip" title="${getJargonTooltip(data.jargon_score)}">
                          ${"★".repeat(data.jargon_score)}${"☆".repeat(5 - data.jargon_score)}
                        </span></div>` : ""}
                  </div>

                  <div class="tab-wrapper">
                    <div class="tabs">
                        <button class="tab-button active" data-tab="eli5"><strong>🧒 Explain Like I’m 5</strong></button>
                        <button class="tab-button" data-tab="boss"><strong>💼 Explain to a Boss</strong></button>
                        <button class="tab-button" data-tab="sysadmin"><strong>🧑‍💻 Explain to a Sysadmin</strong></button>
                    </div>
                    
                    <div class="tab-content">
                        <div class="tab-panel active" id="eli5-panel"><p>${data.eli5}</p></div>
                        <div class="tab-panel" id="boss-panel"><p>${data.boss}</p></div>
                        <div class="tab-panel" id="sysadmin-panel"><p>${data.sysadmin}</p></div>
                    </div>
                  </div>

                  ${(data.use_case || data.categories || data.related) ? `
                    <details class="term-taxonomy-details">
                      <summary>📚 More About This Term</summary>
                      <div class="term-taxonomy">
                        ${data.use_case ? `
                          <div class="usecase-section">
                            <strong>🛠️ Use Case:</strong> ${data.use_case}
                          </div>` : ""}
                        ${data.categories ? `
                          <div class="cat-section">
                            <strong>📚 Categories:</strong> ${mobile ? '<p>' : ""}
                            ${data.categories.map(cat => `<span class="category-tag">${cat}</span>`).join(" ")}
                          </div> ${mobile ? '</p>' : ""}` : ""}
                        ${data.related ? `
                          <div class="related-section">
                            <strong>🔗 Related Terms:</strong> ${mobile ? '<p>' : ""}
                            ${data.related.map(t => `<button class="related-btn" data-term="${t}">${t}</button>`).join(" ")}
                          </div> ${mobile ? '</p>' : ""}` : ""}
                          <div id="comparePlaceholder"></div>
                      </div>
                    </details>
                  ` : ""}
                  
                  <div id="shareButtons" class="share-buttons hidden">
                    <strong>📣 Share this explanation: </strong>
                    <a id="twitterShare" href="#" target="_blank" title="Share on X/Twitter">
                      <img src="img/x.svg" alt="Share on X" class="share-icon" />
                    </a>
                    <a id="facebookShare" href="#" target="_blank" title="Share on Facebook">
                      <img src="img/facebook.svg" alt="Share on Facebook" class="share-icon" />
                    </a>
                    <a id="redditShare" href="#" target="_blank" title="Share on Reddit">
                      <img src="img/reddit.svg" alt="Share on Reddit" class="share-icon" />
                    </a>
                  </div>
              </div>
          </div>
      `;
  }

  const showResults = () => {

    // Force layout reflow
    const startHeight = glowwrap.offsetHeight;
    glowwrap.style.height = `${startHeight}px`;

    results.classList.remove("results-slide-down", "results-slide-up");
    results.classList.add("results-slide-down");

    requestAnimationFrame(() => {
      results.innerHTML = newHTML;

      requestAnimationFrame(() => {

        const endHeight = glowwrap.scrollHeight;
        glowwrap.style.height = `${endHeight}px`;

        let handled = false;

        glowwrap.addEventListener("transitionend", (e) => {
          if (e.propertyName === "height") {
            handled = true;
            glowwrap.style.height = "auto";
            scrollGlowwrap();
          }
        }, { once: true });

        // 🔁 Fallback if transitionend fails to fire
        setTimeout(() => {
          if (!handled) {
            glowwrap.style.height = "auto";
            if (glowwrap) {
              scrollGlowwrap();
            }
          }
        }, 500); // should match or slightly exceed the transition duration
      });
    });

    if (!data) {
      setTimeout(() => {
        document.getElementById("requestBtn")?.addEventListener("click", () => {
          alert(
            `Coming soon! This will trigger an n8n workflow to log the request for "${term}" 😎`
          );
        });
      }, 10);
    } else {
      setTimeout(() => {
        console.log("Tabs:", document.querySelectorAll(".tab-button").length);
        setupTabs();
        generateShareLinks(resolvedKey);
        updateMetaTags(term, data.eli5);
        injectSchema(term, data);
        cleanUrl();

        if (data.related?.length) {
          setupCompareSection(resolvedKey, data.related);
        }
      }, 10);
    }
  };

  if (isFirstLoad) {
    showResults();
  } else {
    results.classList.remove("results-slide-down", "results-slide-up");
    results.classList.add("results-slide-up");

    const glowwrap = document.getElementById("glowwrap");
    if (glowwrap) {
      const currentHeight = glowwrap.offsetHeight;
      glowwrap.style.height = `${currentHeight}px`; // Fix height to current

      requestAnimationFrame(() => {
        const targetHeight = document.getElementById("main").offsetHeight;
        glowwrap.style.height = `${targetHeight}px`;
      });
    }

    setTimeout(showResults, 400);
  }

  if (data) {
    setTimeout(() => {
    }, 400);
  }
  offsetMainFromDailyTerm();
}

function scrollGlowwrap() {
  const glowwrap = document.getElementById("glowwrap");
  if (!glowwrap) return;

  const vh = window.innerHeight;
  const gh = glowwrap.offsetHeight;
  const pos = gh > vh ? "start" : "center";

  glowwrap.scrollIntoView({ behavior: "smooth", block: pos });
}

// ================================
// Compare Button Insertion
// ================================

function setupCompareSection(baseTerm, relatedTerms) {
  if (!Array.isArray(relatedTerms) || relatedTerms.length === 0) return;

  const container = document.createElement("div");
  container.className = "label";
  container.innerHTML = `
    <div class="label">
    <div id="compareButtons" class="compare-buttons"></div></div>
  `;

  const placeholder = document.getElementById("comparePlaceholder");
  if (placeholder) {
    placeholder.replaceWith(container);
  }

  const { termsData, aliasLookup } = getState();
  const compareBtnContainer = container.querySelector("#compareButtons");

  relatedTerms
    .filter(t => termsData[aliasLookup[t.toLowerCase()]])
    .forEach(related => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = `Compare with ${related}`;
      btn.className = "compare-btn";
      btn.addEventListener("click", () => {
        showTermComparison(baseTerm, related);
        history.pushState(null, "", `?compare=${baseTerm}-vs-${related}`);
      });
      compareBtnContainer.appendChild(btn);
    });
}

// ================================
// Related Buttons
// ================================
document.addEventListener("click", (e) => {
  const relatedBtn = e.target.closest(".related-btn");
  const suggestBtn = e.target.closest(".compare-suggest-btn");

  if (relatedBtn?.dataset.term) {
    const term = relatedBtn.dataset.term;
    const input = document.getElementById("termInput");
    if (input) input.value = term;
    fetchAndDisplayTerm(term);
  }

  if (suggestBtn?.dataset.compare?.includes("-vs-")) {
    const [termA, termB] = suggestBtn.dataset.compare.split("-vs-").map(t => t.toLowerCase());
    showTermComparison(termA, termB);
    history.pushState(null, "", `?compare=${termA}-vs-${termB}`);
  }
});


export function cleanUrl() {
  // Clean up URL after manual search
  if (window.history.replaceState) {
    const url = new URL(window.location);
    url.search = ""; // remove ?term= from the address bar
    window.history.replaceState({}, document.title, url.pathname);
  }
}
