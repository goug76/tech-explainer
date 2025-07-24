// script.js - Enhanced with animations, 404 handling, and future-proofing

let termsData = {};
let selectedIndex = -1;

// Load the terms.json for autocomplete
fetch("/data/terms.json")
  .then((res) => res.json())
  .then((data) => {
    termsData = data;
  })
  .catch((err) => console.error("Failed to load terms:", err));

document.getElementById("explainBtn").addEventListener("click", explainTerm);

termInput.addEventListener("keydown", (e) => {
  const items = suggestions.querySelectorAll("li");

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
      const selected = items[selectedIndex];
      termInput.value = selected.textContent;
      suggestions.style.display = "none";
      explainTerm(selected.textContent);
      e.preventDefault();
    } else {
      document.getElementById("explainBtn").click();
    }
  }
})

let currentSuggestions = [];
let selectedSuggestionIndex = -1;

const suggestions = document.getElementById("suggestions");
const input = document.getElementById("termInput");

input.addEventListener("input", () => {
  const value = input.value.toLowerCase();
  suggestions.innerHTML = "";
  selectedSuggestionIndex = -1;

  if (!value || !termsData) return (suggestions.style.display = "none");

  currentSuggestions = Object.keys(termsData)
    .filter((term) => term.toLowerCase().includes(value))
    .slice(0, 5);

  if (!currentSuggestions.length) return (suggestions.style.display = "none");

  currentSuggestions.forEach((term, index) => {
    const li = document.createElement("li");
    li.textContent = term;
    li.className = "suggestion-item";
    li.addEventListener("mousedown", () => {
      input.value = term;
      suggestions.style.display = "none";
      explainTerm();
    });
    suggestions.appendChild(li);
  });
  suggestions.style.display = "block";
});

input.addEventListener("blur", () => setTimeout(() => (suggestions.style.display = "none"), 100));

function handleArrowNavigation(e) {
  const items = suggestions.querySelectorAll(".suggestion-item");
  if (!items.length) return;

  if (e.key === "ArrowDown") {
    selectedSuggestionIndex = (selectedSuggestionIndex + 1) % items.length;
  } else if (e.key === "ArrowUp") {
    selectedSuggestionIndex =
      (selectedSuggestionIndex - 1 + items.length) % items.length;
  }

  items.forEach((item, index) => {
    item.classList.toggle("selected", index === selectedSuggestionIndex);
  });
}

async function explainTerm() {
  const term = input.value.trim().toLowerCase();
  const results = document.getElementById("results");
  results.classList.remove("fade-in");
  void results.offsetWidth;
  results.classList.add("fade-in");
  results.innerHTML = "";

  if (!term) {
    results.innerHTML = "<p>Please enter a tech term first.</p>";
    return;
  }

  try {
    const res = await fetch(`/.netlify/functions/getTerm?term=${term}`);
    if (!res.ok) throw new Error("Not found");
    const data = await res.json();

    results.innerHTML = `
      <h2>${term.toUpperCase()}</h2>
      <div class="explanation">
        <div class="label"><strong>🧒 Explain Like I’m 5: </strong>${data.eli5}</div>
        <div class="label"><strong>💼 Explain to a Boss: </strong>${data.boss}</div>
        <div class="label"><strong>🧑‍💻 Explain to a Sysadmin: </strong>${data.sysadmin}</div>
        <div class="label"><strong>😹 Emoji Summary: </strong>${data.emoji}</div>
        <hr class="info-separator" />
        ${data.use_case ? `<div class="label"><strong>🛠️ Use Case: </strong>${data.use_case}</div>` : ""}
        ${data.jargon_score ? `<div class="label"><strong>📏 Jargon Score: </strong><span class="tooltip" title="${getJargonTooltip(data.jargon_score)}">${"★".repeat(data.jargon_score)}${"☆".repeat(5 - data.jargon_score)}</span></div>` : ""}
        ${data.level ? `<div class="label"><strong>🎓 Complexity Level: </strong>${data.level}</div>` : ""}
        ${data.categories ? `<div class="label"><strong>📚 Categories: </strong>${data.categories.map(cat => `<span class="category-tag">${cat}</span>`).join(" ")}</div>` : ""}
        ${data.related ? `<div class="label"><strong>🔗 Related Terms: </strong><p>${data.related.map(term => `<button class="related-btn" data-term="${term}">${term}</button>`).join(" ")}</p></div>` : ""}
      </div>`;

    document.querySelectorAll(".related-btn").forEach(button => {
      button.addEventListener("click", () => {
        input.value = button.dataset.term;
        explainTerm();
      });
    });
  } catch (err) {
    results.innerHTML = `
      <div class="error-message">
        <p>No explanation found for "${term}".</p>
        <button class="request-btn" onclick="alert('This feature will later request the term via automation.')">Request This Term</button>
      </div>
    `;
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

// Theme Mode Toggle
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
  const selected = themes[currentIndex];
  setTheme(selected);
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
