// Load and store the JSON terms
let termsData = {};
fetch("/data/terms.json")
  .then(res => res.json())
  .then(data => termsData = data)
  .catch(err => console.error("Error loading terms:", err));

const explainBtn = document.getElementById("explainBtn");
const termInput = document.getElementById("termInput");
const results = document.getElementById("results");
const suggestions = document.getElementById("suggestions");

// Trigger explanation
explainBtn.addEventListener("click", () => explainTerm(termInput.value.trim()));

function explainTerm(term) {
  const data = termsData[term.toLowerCase()];
  results.innerHTML = "";

  if (!data) {
    results.innerHTML = `<p>No explanation found for "${term}".</p>`;
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
          <p>${data.related.map(term => `<button class="related-btn" data-term="${term}">${term}</button>`).join(" ")}</p>
        </div>` : ""}
    </div>
  `;

  document.querySelectorAll(".related-btn").forEach(button => {
    button.addEventListener("click", () => {
      termInput.value = button.dataset.term;
      explainBtn.click();
    });
  });
}

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

// Theme Mode
const themes = ["auto", "light", "dark"];
const icons = ["mode_icon_1.png", "mode_icon_2.png", "mode_icon_3.png"];
let currentIndex = 0;
const themeToggleIcon = document.getElementById("themeToggleIcon");

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

// Help Modal
const helpBtn = document.getElementById("helpBtn");
const helpModal = document.getElementById("helpModal");
const closeModal = helpModal?.querySelector(".close");

helpBtn?.addEventListener("click", () => helpModal.style.display = "block");
closeModal?.addEventListener("click", () => helpModal.style.display = "none");
window.addEventListener("click", (e) => {
  if (e.target === helpModal) helpModal.style.display = "none";
});

// Suggestions Logic
let activeSuggestionIndex = -1;
termInput.addEventListener("input", () => {
  const input = termInput.value.toLowerCase();
  suggestions.innerHTML = "";
  activeSuggestionIndex = -1;

  if (!input) return suggestions.style.display = "none";

  const matches = Object.keys(termsData)
    .filter(term => term.toLowerCase().includes(input))
    .slice(0, 5);

  matches.forEach(match => {
    const li = document.createElement("li");
    li.textContent = match;
    li.tabIndex = 0;
    li.onclick = () => {
      termInput.value = match;
      suggestions.style.display = "none";
      explainTerm(match);
    };
    suggestions.appendChild(li);
  });

  suggestions.style.display = matches.length ? "block" : "none";
});

termInput.addEventListener("keydown", (e) => {
  const items = suggestions.querySelectorAll("li");
  if (!items.length) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
    updateActiveSuggestion(items);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length;
    updateActiveSuggestion(items);
  } else if (e.key === "Enter" && activeSuggestionIndex > -1) {
    e.preventDefault();
    items[activeSuggestionIndex].click();
  }
});

function updateActiveSuggestion(items) {
  items.forEach((item, i) => {
    item.classList.toggle("active", i === activeSuggestionIndex);
  });
}

termInput.addEventListener("blur", () => setTimeout(() => suggestions.style.display = "none", 100));
