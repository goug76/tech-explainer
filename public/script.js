// ================================
// Elements
// ================================
const explainBtn = document.getElementById("explainBtn");
const termInput = document.getElementById("termInput");
const results = document.getElementById("results");
const suggestions = document.getElementById("suggestions");
const themeToggleIcon = document.getElementById("themeToggleIcon");
const helpBtn = document.getElementById("helpBtn");
const helpModal = document.getElementById("helpModal");
const closeModal = helpModal?.querySelector(".close");

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
function setTheme(mode) {
  document.documentElement.setAttribute("data-theme", mode === "auto" ? getPreferredTheme() : mode);
  localStorage.setItem("theme", mode);
  themeToggleIcon.src = `img/${icons[themes.indexOf(mode)]}`;
}
function getPreferredTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
themeToggleIcon.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % themes.length;
  setTheme(themes[currentIndex]);
});

// ================================
// Help Modal
// ================================
helpBtn?.addEventListener("click", () => (helpModal.style.display = "block"));
closeModal?.addEventListener("click", () => (helpModal.style.display = "none"));
window.addEventListener("click", (e) => {
  if (e.target === helpModal) helpModal.style.display = "none";
});

// ================================
// Autocomplete
// ================================
let termsData = {};
let selectedSuggestionIndex = -1;

fetch("data/terms.json")
  .then(res => res.json())
  .then(data => {
    termsData = data;
  });

termInput.addEventListener("input", () => {
  const input = termInput.value.toLowerCase();
  suggestions.innerHTML = "";
  selectedSuggestionIndex = -1;
  if (!input) return (suggestions.style.display = "none");

  const matches = Object.keys(termsData).filter(term => term.toLowerCase().includes(input)).slice(0, 5);
  if (!matches.length) return (suggestions.style.display = "none");

  matches.forEach((match, index) => {
    const li = document.createElement("li");
    li.textContent = match;
    li.tabIndex = 0;
    li.classList.add("suggestion-item");
    li.addEventListener("click", () => {
      termInput.value = match;
      suggestions.style.display = "none";
      explainTerm(match);
    });
    suggestions.appendChild(li);
  });
  suggestions.style.display = "block";
});

termInput.addEventListener("keydown", (e) => {
  const items = suggestions.querySelectorAll(".suggestion-item");
  if (e.key === "ArrowDown") {
    e.preventDefault();
    selectedSuggestionIndex = (selectedSuggestionIndex + 1) % items.length;
    updateSuggestionHighlight(items);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    selectedSuggestionIndex = (selectedSuggestionIndex - 1 + items.length) % items.length;
    updateSuggestionHighlight(items);
  } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
    e.preventDefault();
    items[selectedSuggestionIndex].click();
  }
});
function updateSuggestionHighlight(items) {
  items.forEach((item, index) => {
    item.classList.toggle("highlighted", index === selectedSuggestionIndex);
  });
}
termInput.addEventListener("blur", () => setTimeout(() => (suggestions.style.display = "none"), 150));

// ================================
// Explain Logic
// ================================
explainBtn.addEventListener("click", () => explainTerm(termInput.value.trim()));

function explainTerm(term) {
  results.innerHTML = "";
  if (!term) return (results.innerHTML = "<p>Please enter a tech term first.</p>");

  const data = termsData[term.toLowerCase()];
  if (!data) {
    results.innerHTML = `
      <h2>${term.toUpperCase()}</h2>
      <p>No explanation found for "${term}". 😢</p>
      <p>Would you like to <button class="request-btn">Request this term</button>?</p>
    `;
    return;
  }

  results.innerHTML = `
    <h2>${term.toUpperCase()}</h2>
    <div class="explanation">
      <div class="label"><strong>🧒 Explain Like I’m 5: </strong> ${data.eli5}</div>
      <div class="label"><strong>💼 Explain to a Boss: </strong> ${data.boss}</div>
      <div class="label"><strong>🧑‍💻 Explain to a Sysadmin: </strong> ${data.sysadmin}</div>
      <div class="label"><strong>😹 Emoji Summary: </strong> ${data.emoji}</div>
      <hr class="info-separator" />
      ${data.use_case ? `<div class="label"><strong>🛠️ Use Case: </strong>${data.use_case}</div>` : ""}
      ${data.jargon_score ? `<div class="label"><strong>📏 Jargon Score: </strong>
        <span class="tooltip" title="${getJargonTooltip(data.jargon_score)}">
        ${"★".repeat(data.jargon_score)}${"☆".repeat(5 - data.jargon_score)}</span></div>` : ""}
      ${data.level ? `<div class="label"><strong>🎓 Complexity Level: </strong>${data.level}</div>` : ""}
      ${data.categories ? `<div class="label"><strong>📚 Categories: </strong>
        ${data.categories.map(cat => `<span class="category-tag">${cat}</span>`).join(" ")}</div>` : ""}
      ${data.related ? `<div class="label"><strong>🔗 Related Terms: </strong>
        ${data.related.map(term => `<button class="related-btn" data-term="${term}">${term}</button>`).join(" ")}</div>` : ""}
    </div>
  `;

  document.querySelectorAll(".related-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      termInput.value = btn.dataset.term;
      explainBtn.click();
    });
  });
}
function getJargonTooltip(score) {
  const tips = {
    1: "Totally beginner-friendly.",
    2: "Mild tech terms, mostly safe.",
    3: "Tech-savvy folk preferred.",
    4: "Now we're getting spicy.",
    5: "Only your network engineer cousin gets this."
  };
  return tips[score] || "Unknown jargon level.";
}
