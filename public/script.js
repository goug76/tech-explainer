document.getElementById("explainBtn").addEventListener("click", async () => {
  const term = document.getElementById("termInput").value.trim();
  const results = document.getElementById("results");
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
        <div class="label">🧒 Explain Like I’m 5:</div>
        <p>${data.eli5}</p>

        <div class="label">💼 Explain to a Boss:</div>
        <p>${data.boss}</p>

        <div class="label">🧑‍💻 Explain to a Sysadmin:</div>
        <p>${data.sysadmin}</p>

        <div class="label">😹 Emoji Summary:</div>
        <p>${data.emoji}</p>
        ${data.jargon_score ? `
            <div class="label">📏 Jargon Score: 
                <span class="tooltip" title="${getJargonTooltip(data.jargon_score)}">
                    ${"★".repeat(data.jargon_score)}${"☆".repeat(5 - data.jargon_score)}
                </span>
            </div>` : ""}
        ${data.categories ? `
            <div class="label">📚 Categories:
                ${data.categories.map(cat => `<span class="category-tag">${cat}</span>`).join(" ")}
            </div>
        ` : ""}
        ${data.use_case ? `<div class="label">🛠️ Use Case:</div><p>${data.use_case}</p>` : ""}
        
        ${data.level ? `<div class="label">🎓 Complexity Level:</div><p>${data.level}</p>` : ""}
        ${data.related ? `
            <div class="label">🔗 Related Terms: 
                <p>${data.related.map(term => `<button class="related-btn" data-term="${term}">${term}</button>`).join(" ")}</p>
            </div>
        ` : ""}
      </div>
    `;
    document.querySelectorAll(".related-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.getElementById("termInput").value = button.dataset.term;
        document.getElementById("explainBtn").click();
    });
});
  } catch (err) {
    results.innerHTML = `<p>No explanation found for "${term}".</p>`;
  }
});

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
