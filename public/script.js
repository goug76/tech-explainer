// ================================
// DOM Elements
// ================================
const termInput = document.getElementById("termInput");
const suggestions = document.getElementById("suggestions");
const results = document.getElementById("results");
const explainBtn = document.getElementById("explainBtn");
const themeToggleIcon = document.getElementById("themeToggleIcon");

// ================================
// Alias Mapping
// ================================

// ================================
// Theme Toggle
// ================================
const themes = ["auto", "light", "dark"];
const icons = ["mode_icon_1.png", "mode_icon_2.png", "mode_icon_3.png"];
let currentIndex = 0;

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  setTheme(savedTheme);
  currentIndex = themes.indexOf(savedTheme);
} else {
  setTheme("auto");
}

themeToggleIcon.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % themes.length;
  const selectedTheme = themes[currentIndex];
  setTheme(selectedTheme);
});

function setTheme(mode) {
  document.documentElement.setAttribute("data-theme", mode === "auto" ? getPreferredTheme() : mode);
  localStorage.setItem("theme", mode);
  themeToggleIcon.src = `img/${icons[themes.indexOf(mode)]}`;
}

function getPreferredTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// ================================
// Suggestion Data
// ================================
let termsData = {};
let selectedSuggestionIndex = -1;
let termList = [];

// ================================
// Autocomplete Suggestion Logic
// ================================
termInput.addEventListener("input", () => {
  const input = termInput.value.toLowerCase();
  suggestions.innerHTML = "";
  selectedSuggestionIndex = -1;

  if (!input) return (suggestions.style.display = "none");

  const matches = termList.filter(term => term.toLowerCase().includes(input)).slice(0, 5);

  matches.forEach((match, index) => {
    const li = document.createElement("li");
    li.textContent = match;
    li.dataset.index = index;
    li.addEventListener("mousedown", () => {
      termInput.value = match;
      suggestions.style.display = "none";
      fetchAndDisplayTerm(match);
    });
    suggestions.appendChild(li);
  });

  suggestions.style.display = matches.length ? "block" : "none";
});

termInput.addEventListener("keydown", (e) => {
  const items = suggestions.querySelectorAll("li");

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (!items.length) return;
    selectedSuggestionIndex = (selectedSuggestionIndex + 1) % items.length;
    updateHighlight(items);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (!items.length) return;
    selectedSuggestionIndex = (selectedSuggestionIndex - 1 + items.length) % items.length;
    updateHighlight(items);
  } else if (e.key === "Enter") {
    if (selectedSuggestionIndex > -1 && items[selectedSuggestionIndex]) {
      e.preventDefault();
      items[selectedSuggestionIndex].click();
      suggestions.style.display = "none";
    } else {
      fetchAndDisplayTerm(termInput.value.trim());
      suggestions.style.display = "none";
    }
  }
});

function updateHighlight(items) {
  items.forEach((item, index) => {
    const isActive = index === selectedSuggestionIndex;
    item.classList.toggle("highlighted", isActive);
    if (isActive) {
      termInput.value = item.textContent;
    }
  });
}

// ================================
// Hide suggestions on blur
// ================================
termInput.addEventListener("blur", () => setTimeout(() => (suggestions.style.display = "none"), 150));

// ================================
// Explain Button Logic
// ================================
explainBtn.addEventListener("click", () => {
  const term = termInput.value.trim().toLowerCase();
  if (!term) {
    results.innerHTML = "<p>Please enter a tech term first.</p>";
    return;
  }
  fetchAndDisplayTerm(term);
});

function fetchAndDisplayTerm(term) {
  if (!term || typeof term !== "string" || term.trim() === "") {
    console.warn("⚠️ Invalid term passed to fetchAndDisplayTerm:", term);
    return;
  }

  const normalized = term.toLowerCase();
  const resolvedKey = aliasLookup[normalized];
  const data = termsData[resolvedKey];
  
  if (!data) {
    results.innerHTML = `
      <p>No explanation found for "<strong>${term}</strong>".</p>
      <button id="requestBtn">Request this term</button>
    `;
    document.getElementById("requestBtn").addEventListener("click", () => {
      alert(`Coming soon! This will trigger an n8n workflow to log the request for "${term}" 😎`);
    });
    return;
  }

  results.innerHTML = `
    <h2>${term.toUpperCase()}</h2>
    <div class="explanation">
      <div class="label"><strong>🧒 Explain Like I’m 5: </strong>${data.eli5}</div>
      <div class="label"><strong>💼 Explain to a Boss: </strong>${data.boss}</div>
      <div class="label"><strong>🧑‍💻 Explain to a Sysadmin: </strong>${data.sysadmin}</div>
      <div class="label"><strong>😹 Emoji Summary: </strong>${data.emoji}</div>
      <hr class="info-separator" />
      ${data.use_case ? `<div class="label"><strong>🛠️ Use Case: </strong>${data.use_case}</div>` : ""}
      ${data.jargon_score ? `
        <div class="label"><strong>📏 Jargon Score: </strong>
          <span class="tooltip" title="${getJargonTooltip(data.jargon_score)}">
            ${"★".repeat(data.jargon_score)}${"☆".repeat(5 - data.jargon_score)}
          </span>
        </div>` : ""}
      ${data.level ? `<div class="label"><strong>🎓 Complexity Level: </strong>${data.level}</div>` : ""}
      ${data.categories ? `
        <div class="label"><strong>📚 Categories: </strong>
          ${data.categories.map(cat => `<span class="category-tag">${cat}</span>`).join(" ")}
        </div>` : ""}
      ${data.related ? `
        <div class="label"><strong>🔗 Related Terms: </strong>
          ${data.related.map(t => `<button class="related-btn" data-term="${t}">${t}</button>`).join(" ")}
        </div>` : ""}

        <div id="comparePlaceholder"></div> <!-- ✅ INSERT THIS -->

        <div id="shareButtons" class="share-buttons">
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
  `;

  // Insert Compare Section only if related terms exist
  if (data.related?.length) {
    const compareSection = document.createElement("div");
    compareSection.className = "label";
    compareSection.innerHTML = `
      <div class="label"><strong>🔄 Compare With:</strong>
      <div id="compareButtons" class="compare-buttons"></div></div>
      <div id="compareOutput" class="compare-output hidden"></div>
    `;

    const placeholder = document.getElementById("comparePlaceholder");
    if (placeholder) {
      placeholder.replaceWith(compareSection);
    } else {
      results.appendChild(compareSection);
    }

    renderCompareButtons(resolvedKey, data.related);
  }

  const compareOutput = document.getElementById("compareOutput");
  if (compareOutput && data.related?.length > 1) {
    const suggestionSection = document.createElement("div");
    suggestionSection.className = "compare-suggestions";
    suggestionSection.innerHTML = `
      <div class="label"><strong>🧠 Try Comparing:</strong>
      ${data.related
        .filter((r, i, arr) => arr.length > i + 1) // ensure pair
        .map((r, i) => {
          const next = data.related[i + 1];
          if (!next) return "";
          return `<button class="compare-suggest-btn" data-compare="${r}-vs-${next}">${r} vs ${next}</button>`;
        }).join(" ")}
      </div>
    `;
    compareOutput.insertAdjacentElement("afterend", suggestionSection);
  }

  updateMetaTags(term, data.eli5);
  injectSchema(term, data);
  
  // ================================
  // Generate share URLs
  // ================================
  const shareUrl = encodeURIComponent(`${window.location.origin}?term=${term}`);
  const shareText = encodeURIComponent(`Check out this explanation of "${term}" on Tech Decoded!`);

  const twitterShare = document.getElementById("twitterShare");
  const facebookShare = document.getElementById("facebookShare");
  const redditShare = document.getElementById("redditShare");
  const shareSection = document.getElementById("shareButtons");

  twitterShare.setAttribute("rel", "noopener noreferrer");
  facebookShare.setAttribute("rel", "noopener noreferrer");
  redditShare.setAttribute("rel", "noopener noreferrer");

  if (twitterShare && facebookShare && redditShare && shareSection) {
    twitterShare.href = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`;
    facebookShare.href = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
    redditShare.href = `https://www.reddit.com/submit?url=${shareUrl}&title=${shareText}`;

    shareSection.classList.remove("hidden");
  }

  document.querySelectorAll(".related-btn").forEach(button => {
  button.addEventListener("click", () => {
    const term = button.dataset.term;
    if (term) {
      termInput.value = term;
      fetchAndDisplayTerm(term);
    }
  });
});
}

// ================================
// Jargon score tooltip
// ================================
function getJargonTooltip(score) {
  const messages = {
    1: "Totally beginner-friendly.",
    2: "Mild tech terms, mostly safe.",
    3: "Tech-savvy folk preferred.",
    4: "Now we're getting spicy.",
    5: "Only your network engineer cousin gets this."
  };
  return messages[score] || "Tech lingo level unknown.";
}

// ================================
// Auto-load term from URL ?term=mqtt
// ================================
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const urlTerm = params.get("term");
  const compareParam = params.get("compare");

  const randomBtn = document.getElementById("randomBtn");
  if (randomBtn) {
    randomBtn.addEventListener("click", () => {
      const randomTerm = termList[Math.floor(Math.random() * termList.length)];
      termInput.value = randomTerm;
      fetchAndDisplayTerm(randomTerm);
    });
  }

  fetch("data/terms.json")
    .then(res => res.json())
    .then(data => {
      termsData = data;
      termList = Object.keys(data);

      // ✅ Build alias lookup map from terms.json structure
      aliasLookup = {};
      for (const [term, info] of Object.entries(data)) {
        aliasLookup[term.toLowerCase()] = term;
        if (info.aliases) {
          info.aliases.forEach(alias => {
            aliasLookup[alias.toLowerCase()] = term;
          });
        }
      }

      showDailyTerm(data);

      // ✅ Filter only real, resolvable terms
      const visibleTerms = termList.filter(t => {
        const resolved = aliasLookup[t.toLowerCase()] || t.toLowerCase();
        return termsData[resolved];
      });

      // Setup filters and sitemap
      setupCategoryFilter(visibleTerms);
      setupAlphabetFilter(visibleTerms);
      renderTermLinks(visibleTerms);

      // ✅ Comparison view
      if (compareParam) {
        const [termA, termB] = compareParam.toLowerCase().split("-vs-");
        if (termA && termB) {
          showTermComparison(termA, termB);
          return; // ✅ Don't do anything else
        }
      }

      // ✅ Normal term view
      if (urlTerm) {
        termInput.value = urlTerm;
        fetchAndDisplayTerm(urlTerm);
      }
    });

  // ========== Support functions defined inside ==========

  // Daily Term
  function getDailyHashKey() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = now.getMonth() + 1;
    const dd = now.getDate();
    return `termOfDay-${yyyy}-${mm}-${dd}`;
  }

  function showDailyTerm(termsData) {
    const key = getDailyHashKey();
    let stored = localStorage.getItem(key);

    if (!stored) {
      const termKeys = Object.keys(termsData).filter(k => termsData[k]?.eli5);
      const randomKey = termKeys[Math.floor(Math.random() * termKeys.length)];
      localStorage.setItem(key, randomKey);
      stored = randomKey;
    }

    const data = termsData[stored];
    const dailyTermDiv = document.getElementById("dailyTerm");

    if (data && dailyTermDiv) {
      dailyTermDiv.innerHTML = `
        <h3><span class="term-emoji">${data.emoji || '📘'}</span> Term of the Day: <strong>${stored.toUpperCase()}</strong></h3>
        <p class="term-explainer">${data.eli5}</p>
        <button onclick="fetchAndDisplayTerm('${stored}')">Learn More</button>
      `;
      dailyTermDiv.classList.remove("hidden");
    }
  }
});

// ================================
// Dynamic Title & Description
// ================================
function updateMetaTags(term, description) {
  // Update title
  document.title = `${term.toUpperCase()} | Tech Decoded`;

  // Update meta description
  let metaDesc = document.querySelector("meta[name='description']");
  if (!metaDesc) {
    metaDesc = document.createElement("meta");
    metaDesc.setAttribute("name", "description");
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute("content", description);
}

// ================================
// Dynamically inject schema
// ================================
function injectSchema(term, data) {
  // Remove old schema
  const oldSchema = document.getElementById("term-schema");
  if (oldSchema) oldSchema.remove();

  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "name": term,
    "description": data.eli5,
    "about": data.categories || [],
    "audience": {
      "@type": "Audience",
      "audienceType": data.level || "General"
    }
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = "term-schema";
  script.innerText = JSON.stringify(schema);
  document.head.appendChild(script);
}

// =====================================
// Alphabet Filter: A-Z + '*' for All
// =====================================
function setupAlphabetFilter(termList) {
  const alphabetContainer = document.getElementById("alphabetFilter");
  if (!alphabetContainer) return;

  // ✅ Clear previous buttons before adding new ones
  alphabetContainer.innerHTML = "";

  const grouped = groupTermsByLetter(termList);
  const letters = ["*", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

  letters.forEach(letter => {
    const button = document.createElement("button");
    button.textContent = letter === "*" ? "*" : letter;

    const hasTerms = letter === "*" || grouped[letter]?.length > 0;
    if (!hasTerms) {
      button.disabled = true;
      button.classList.add("disabled");
    }

    button.addEventListener("click", () => {
      document.querySelectorAll("#alphabetFilter button").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      const termsToShow = letter === "*" ? termList : grouped[letter] || [];
      renderTermLinks(termsToShow);
    });

    alphabetContainer.appendChild(button);
  });
}

// =====================================
// Group terms alphabetically
// =====================================
function groupTermsByLetter(terms) {
  return terms.reduce((acc, term) => {
    const letter = term.charAt(0).toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(term);
    return acc;
  }, {});
}

// =====================================
// Renders links in #termLinks
// =====================================
function renderTermLinks(terms) {
  const container = document.getElementById("termLinks");
  container.innerHTML = "";

  terms.sort().forEach(term => {
    const normalized = term.toLowerCase();
    const resolved = aliasLookup[normalized];
    const data = termsData[resolved];

    const link = document.createElement("a");
    link.href = `?term=${encodeURIComponent(term)}`;
    link.textContent = term;
    link.classList.add("related-btn");

    if (data?.eli5) {
      link.title = data.eli5; // Set tooltip to ELI5 definition
    }

    container.appendChild(link);
  });
}

// =====================================
// Category Filter: Starts with All
// =====================================
function setupCategoryFilter(allTerms) {
  const categoryContainer = document.getElementById("categoryFilter");
  categoryContainer.innerHTML = ""; // clear buttons on re-init

  if (!categoryContainer) return;

  // Build category list
  const categories = new Set();
  for (const key in termsData) {
    const cats = termsData[key]?.categories || [];
    cats.forEach(cat => categories.add(cat));
  }

  const categoryList = ["All", ...Array.from(categories).sort()];

  categoryList.forEach(category => {
    const button = document.createElement("button");
    button.textContent = category;
    button.className = "category-tag";
    button.addEventListener("click", () => {
      document.querySelectorAll(".category-filter button").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

      const filtered = category === "All"
        ? allTerms
        : allTerms.filter(term => {
            const resolved = aliasLookup[term.toLowerCase()];
            return termsData[resolved]?.categories?.includes(category);
          });

      setupAlphabetFilter(filtered); // regenerate A-Z for filtered category
      renderTermLinks(filtered);     // show terms for category
    });

    categoryContainer.appendChild(button);
  });
}

// ================================
// Compare Terms Feature
// ================================
function renderCompareButtons(baseTerm, relatedTerms) {
  const container = document.getElementById("compareButtons");
  const output = document.getElementById("compareOutput");
  container.innerHTML = "";
  output.innerHTML = "";
  output.classList.add("hidden");

  if (!relatedTerms || relatedTerms.length === 0) return;
  console.log("Related terms:", relatedTerms);
  console.log("Valid terms:", relatedTerms.filter(t => termsData[aliasLookup[t.toLowerCase()]]));
  console.log("termsData keys:", Object.keys(termsData));

  relatedTerms
    .filter(t => {
      const key = aliasLookup[t.toLowerCase()];
      return termsData[key]; // ✅ Only include if it exists in the JSON
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

function showTermComparison(termA, termB) {
  const resolvedA = aliasLookup[termA.toLowerCase()];
  const resolvedB = aliasLookup[termB.toLowerCase()];

  const dataA = termsData[resolvedA];
  const dataB = termsData[resolvedB];

  const container = document.getElementById("compareOutput");

  if (!container) {
    console.error("❌ compareOutput container missing from DOM");
    return;
  }

  if (!dataA || !dataB) {
    container.innerHTML = `<p>Could not compare these terms.</p>`;
    container.classList.remove("hidden");
    return;
  }

  container.classList.remove("hidden");
  console.log("Compare container element:", container);
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
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".compare-suggest-btn");
  if (btn) {
    const compareValue = btn.dataset.compare;
    if (compareValue && compareValue.includes("-vs-")) {
      const [termA, termB] = compareValue.split("-vs-").map(t => t.toLowerCase());

      showTermComparison(termA, termB);

      // Update URL without reloading
      history.pushState(null, "", `?compare=${termA}-vs-${termB}`);
    }
  }
});

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
