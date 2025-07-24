// script.js

// Theme toggle logic
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

// Autocomplete logic
const termInput = document.getElementById("termInput");
const suggestions = document.getElementById("suggestions");
let selectedIndex = -1;

// Fetch terms.json and initialize list
let termList = [];
fetch("data/terms.json")
  .then((res) => res.json())
  .then((data) => {
    termList = Object.keys(data);
  });

termInput.addEventListener("input", () => {
  const input = termInput.value.toLowerCase();
  suggestions.innerHTML = "";
  selectedIndex = -1;

  if (!input) return (suggestions.style.display = "none");

  const matches = termList.filter(term => term.toLowerCase().includes(input)).slice(0, 5);

  matches.forEach((match) => {
    const li = document.createElement("li");
    li.textContent = match;
    li.classList.add("suggestion-item");
    li.tabIndex = 0;
    li.addEventListener("click", () => {
      termInput.value = match;
      suggestions.style.display = "none";
      explainTerm(match);
    });
    suggestions.appendChild(li);
  });

  suggestions.style.display = matches.length ? "block" : "none";
});

termInput.addEventListener("keydown", (e) => {
  const items = suggestions.querySelectorAll(".suggestion-item");
  if (!items.length) return;

  if (e.key === "ArrowDown") {
    selectedIndex = (selectedIndex + 1) % items.length;
    updateHighlight(items);
    e.preventDefault();
  } else if (e.key === "ArrowUp") {
    selectedIndex = (selectedIndex - 1 + items.length) % items.length;
    updateHighlight(items);
    e.preventDefault();
  } else if (e.key === "Enter") {
    if (selectedIndex >= 0 && items[selectedIndex]) {
      termInput.value = items[selectedIndex].textContent;
      suggestions.style.display = "none";
      explainTerm(termInput.value);
      e.preventDefault();
    }
  }
});

function updateHighlight(items) {
  items.forEach((item, index) => {
    item.classList.toggle("highlighted", index === selectedIndex);
  });
}

termInput.addEventListener("blur", () => {
  setTimeout(() => {
    suggestions.style.display = "none";
    selectedIndex = -1;
  }, 100);
});

// Main explain function
const explainBtn = document.getElementById("explainBtn");
const results = document.getElementById("results");

explainBtn.addEventListener("click", () => {
  const term = termInput.value.trim();
  if (!term) {
    results.innerHTML = "<p>Please enter a tech term first.</p>";
    return;
  }
  explainTerm(term);
});

async function explainTerm(term) {
  results.innerHTML = "";
  try {
    const res = await fetch("data/terms.json");
    const data = await res.json();
    const explanation = data[term.toLowerCase()];

    if (!explanation) {
      results.innerHTML = `<p>No explanation found for "${term}".</p>`;
      return;
    }

    results.innerHTML = `
      <h2>${term.toUpperCase()}</h2>
      <div class="explanation">
        <div class="label"><strong>🧒 Explain Like I’m 5: </strong>${explanation.eli5}</div>
        <div class="label"><strong>💼 Explain to a Boss: </strong>${explanation.boss}</div>
        <div class="label"><strong>🧑‍💻 Explain to a Sysadmin: </strong>${explanation.sysadmin}</div>
        <div class="label"><strong>😹 Emoji Summary: </strong>${explanation.emoji}</div>
        <hr class="info-separator" />
        ${explanation.use_case ? `<div class="label"><strong>🛠️ Use Case: </strong>${explanation.use_case}</div>` : ""}
        ${explanation.jargon_score ? `<div class="label"><strong>📏 Jargon Score: </strong><span class="tooltip" title="${getJargonTooltip(explanation.jargon_score)}">${"★".repeat(explanation.jargon_score)}${"☆".repeat(5 - explanation.jargon_score)}</span></div>` : ""}
        ${explanation.level ? `<div class="label"><strong>🎓 Complexity Level: </strong>${explanation.level}</div>` : ""}
        ${explanation.categories ? `<div class="label"><strong>📚 Categories: </strong>${explanation.categories.map(cat => `<span class="category-tag">${cat}</span>`).join(" ")}</div>` : ""}
        ${explanation.related ? `<div class="label"><strong>🔗 Related Terms: </strong><p>${explanation.related.map(term => `<button class="related-btn" data-term="${term}">${term}</button>`).join(" ")}</p></div>` : ""}
      </div>
    `;

    document.querySelectorAll(".related-btn").forEach(button => {
      button.addEventListener("click", () => {
        termInput.value = button.dataset.term;
        explainBtn.click();
      });
    });
  } catch (err) {
    results.innerHTML = `<p>Error loading explanation for "${term}".</p>`;
  }
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
