// ================================
// DOM Elements
// ================================
const termInput = document.getElementById("termInput");
const suggestions = document.getElementById("suggestions");
const results = document.getElementById("results");
const explainBtn = document.getElementById("explainBtn");
const themeToggleIcon = document.getElementById("themeToggleIcon");

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
// Help Modal
// ================================
const helpBtn = document.getElementById("helpBtn");
const helpModal = document.getElementById("helpModal");
const closeModal = helpModal?.querySelector(".close");

helpBtn?.addEventListener("click", () => (helpModal.style.display = "block"));
closeModal?.addEventListener("click", () => (helpModal.style.display = "none"));
window.addEventListener("click", e => {
  if (e.target === helpModal) helpModal.style.display = "none";
});

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
    selectedSuggestionIndex = (selectedSuggestionIndex + 1) % items.length;
    updateHighlight(items);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
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
  const data = termsData[term.toLowerCase()];
  
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
          <p>${data.related.map(t => `<button class="related-btn" data-term="${t}">${t}</button>`).join(" ")}</p>
        </div>` : ""}
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

  updateMetaTags(term, data.eli5);
  injectSchema(term, data);
  
  // ================================
  // Generate share URLs
  // ================================
  const shareUrl = encodeURIComponent(`${window.location.origin}?term=${term}`);
  const shareText = encodeURIComponent(`Check out this explanation of "${term}" on ExplainThisTech!`);

  const twitterShare = document.getElementById("twitterShare");
  const facebookShare = document.getElementById("facebookShare");
  const redditShare = document.getElementById("redditShare");
  const shareSection = document.getElementById("shareButtons");

  if (twitterShare && facebookShare && redditShare && shareSection) {
    twitterShare.href = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`;
    facebookShare.href = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
    redditShare.href = `https://www.reddit.com/submit?url=${shareUrl}&title=${shareText}`;

    shareSection.style.display = "block"; // Now safe to show
  }

  document.querySelectorAll(".related-btn").forEach(button => {
    button.addEventListener("click", () => {
      termInput.value = button.dataset.term;
      explainBtn.click();
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

  fetch("data/terms.json")
    .then(res => res.json())
    .then(data => {
      termsData = data;
      termList = Object.keys(data);

      // 🧭 Generate crawlable sitemap links
      generateSitemapLinks(termList);

      if (urlTerm) {
        termInput.value = urlTerm;
        fetchAndDisplayTerm(urlTerm);
      }
    });
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
// Dynamic inject schema
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

// ================================
// Generate Sitemap Links
// ================================
function generateSitemapLinks(terms) {
  const termLinksContainer = document.getElementById("termLinks");
  if (!termLinksContainer) return;

  terms.sort().forEach(term => {
    const link = document.createElement("a");
    link.href = `?term=${encodeURIComponent(term)}`;
    link.textContent = term;
    link.classList.add("sitemap-link");
    termLinksContainer.appendChild(link);
  });
}