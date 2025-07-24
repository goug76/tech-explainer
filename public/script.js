// ============ Theme Toggle ============ //
const themes = ["auto", "light", "dark"];
const icons = ["mode_icon_1.png", "mode_icon_2.png", "mode_icon_3.png"];
let currentIndex = 0;
const themeToggleIcon = document.getElementById("themeToggleIcon");

function getPreferredTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function setTheme(mode) {
  const theme = mode === "auto" ? getPreferredTheme() : mode;
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", mode);
  themeToggleIcon.src = `img/${icons[themes.indexOf(mode)]}`;
}

// Initialize theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme && themes.includes(savedTheme)) {
  currentIndex = themes.indexOf(savedTheme);
  setTheme(savedTheme);
} else {
  setTheme("auto");
}

// Toggle on click
themeToggleIcon.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % themes.length;
  setTheme(themes[currentIndex]);
});

// ============ Help Modal ============ //
const helpBtn = document.getElementById("helpBtn");
const helpModal = document.getElementById("helpModal");

if (helpBtn && helpModal) {
  const closeModal = helpModal.querySelector(".close");
  helpBtn.addEventListener("click", () => helpModal.style.display = "block");
  closeModal.addEventListener("click", () => helpModal.style.display = "none");
  window.addEventListener("click", (e) => {
    if (e.target === helpModal) helpModal.style.display = "none";
  });
}

// ============ Jargon Tooltip Helper ============ //
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

// ============ Term Lookup ============ //
const explainBtn = document.getElementById("explainBtn");
const termInput = document.getElementById("termInput");
const results = document.getElementById("results");
const suggestions = document.getElementById("suggestions");

explainBtn.addEventListener("click", () => explainTerm(termInput.value.trim()));

function explainTerm(term) {
  results.innerHTML = "";
  if (!term) {
    results.innerHTML = "<p>Please enter a tech term first.</p>";
    return;
  }

  fetch(`/.netlify/functions/getTerm?term=${term}`)
    .then(res => {
      if (!res.ok) throw new Error("Not found");
      return res.json();
    })
    .then(data => {
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
              <p>${data.related.map(rel => `<button class="related-btn" data-term="${rel}">${rel}</button>`).join(" ")}</p>
            </div>` : ""}
        </div>
      `;

      // Handle related term clicks
      document.querySelectorAll(".related-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          termInput.value = btn.dataset.term;
          explainBtn.click();
        });
      });
    })
    .catch(() => {
      results.innerHTML = `<p>No explanation found for "${term}".</p>`;
    });
}

// ============ Autocomplete / Suggestions ============ //
if (typeof termsData !== "undefined" && suggestions) {
  const termList = Object.keys(termsData);
  
  termInput.addEventListener("input", () => {
    const input = termInput.value.toLowerCase();
    suggestions.innerHTML = "";
    if (!input) {
      suggestions.style.display = "none";
      return;
    }

    const matches = termList.filter(t => t.toLowerCase().includes(input)).slice(0, 5);
    matches.forEach(match => {
      const li = document.createElement("li");
      li.textContent = match;
      li.onclick = () => {
        termInput.value = match;
        suggestions.style.display = "none";
        explainBtn.click();
      };
      suggestions.appendChild(li);
    });

    suggestions.style.display = matches.length ? "block" : "none";
  });

  // Hide suggestions on blur
  termInput.addEventListener("blur", () => {
    setTimeout(() => suggestions.style.display = "none", 100);
  });
}
