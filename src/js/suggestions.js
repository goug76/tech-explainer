// src/js/suggestions.js
import { getState } from './state.js';
import { fetchAndDisplayTerm } from './fetcher.js';

let selectedSuggestionIndex = -1;

export function initSuggestions() {
  const termInput = document.getElementById("termInput");
  const suggestions = document.getElementById("suggestions");

  if (!termInput || !suggestions) {
    console.warn("⚠️ Term input or suggestions element missing");
    return;
  }

  termInput.addEventListener("input", () => {
    const input = termInput.value.toLowerCase();
    suggestions.innerHTML = "";
    selectedSuggestionIndex = -1;

    if (!input) {
      suggestions.style.display = "none";
      return;
    }

    const { termList } = getState();
    const matches = termList
      .filter(term => term.toLowerCase().startsWith(input))
      .slice(0, 5);

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

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!items.length) return;

      selectedSuggestionIndex = (e.key === "ArrowDown")
        ? (selectedSuggestionIndex + 1) % items.length
        : (selectedSuggestionIndex - 1 + items.length) % items.length;

      updateHighlight(items);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedSuggestionIndex > -1 && items[selectedSuggestionIndex]) {
        const selectedText = items[selectedSuggestionIndex].textContent;
        termInput.value = selectedText;
        suggestions.style.display = "none";
        fetchAndDisplayTerm(selectedText);
      } else {
        fetchAndDisplayTerm(termInput.value.trim());
        suggestions.style.display = "none";
      }
    }
  });

  termInput.addEventListener("blur", () => {
    suggestions.style.display = "none";
  });
}

function updateHighlight(items, inputEl) {
  items.forEach((item, index) => {
    const isActive = index === selectedSuggestionIndex;
    item.classList.toggle("highlighted", isActive);
    if (isActive) {
      inputEl.value = item.textContent;
    }
  });
}
