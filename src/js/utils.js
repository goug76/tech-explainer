// src/js/utils.js

// ⭐ Jargon Tooltip
export function getJargonTooltip(score) {
  const levels = {
    1: "Totally beginner-friendly.",
    2: "Mild tech terms, mostly safe.",
    3: "Tech-savvy folk preferred.",
    4: "Now we're getting spicy.",
    5: "Only your network engineer cousin gets this."
  };
  return levels[score] || "Tech lingo level unknown.";
}

// 🧠 Dynamic <title> + <meta name="description">
export function updateMetaTags(term, description) {
  document.title = `${term.toUpperCase()} | Tech Decoded`;

  let metaDesc = document.querySelector("meta[name='description']");
  if (!metaDesc) {
    metaDesc = document.createElement("meta");
    metaDesc.setAttribute("name", "description");
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute("content", description);
}

// 📄 JSON-LD Structured Data
export function injectSchema(term, data) {
  const existing = document.getElementById("term-schema");
  if (existing) existing.remove();

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
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

// 📆 Term of the Day Widget
export function showDailyTerm(termsData) {
  const key = getDailyKey();
  let stored = localStorage.getItem(key);

  if (!stored) {
    const termKeys = Object.keys(termsData).filter(k => termsData[k]?.eli5);
    const randomKey = termKeys[Math.floor(Math.random() * termKeys.length)];
    localStorage.setItem(key, randomKey);
    stored = randomKey;
  }

  const data = termsData[stored];
  const dailyDiv = document.getElementById("dailyTerm");

  if (data && dailyDiv) {
    const mobile = isMobile();

    const newHTML = mobile
      ? `
        <div class="daily-mobile">
          <div class="emoji";">${data.emoji || '📘'}</div>
          <h3><strong>${stored.toUpperCase()}</strong></h3>
          <p class="term-explainer">${data.eli5}</p>
          <button class="daily-btn" onclick="window.location.search='?term=${encodeURIComponent(stored)}'">Learn More</button>
        </div>
      `
      : `
        <h3><span class="term-emoji">${data.emoji || '📘'}</span> Term of the Day: <strong>${stored.toUpperCase()}</strong></h3>
        <p class="term-explainer">${data.eli5}</p>
        <button onclick="window.location.search='?term=${encodeURIComponent(stored)}'">Learn More</button>
      `;

    dailyDiv.innerHTML = newHTML;
    dailyDiv.classList.remove("hidden");
  }
}

export function offsetMainFromDailyTerm() {
  const dailyTerm = document.getElementById("dailyTerm");
  const container = document.getElementById("container");

  if (!dailyTerm || !container) return;

  const offset = dailyTerm.offsetHeight + 88; // 24px = 1.5rem
  container.style.paddingTop = `${offset}px`;
}

function getDailyKey() {
  const now = new Date();
  return `termOfDay-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

export function isMobile() {
  return window.innerWidth <= 480 || /Mobi|Android/i.test(navigator.userAgent);
}
