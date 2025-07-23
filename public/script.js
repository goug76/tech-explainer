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
        <div class="label"><strong>🧒 Explain Like I’m 5: </strong>
            ${data.eli5}
        </div>

        <div class="label"><strong>💼 Explain to a Boss: </strong>
            ${data.boss}
        </div>

        <div class="label"><strong>🧑‍💻 Explain to a Sysadmin: </strong> 
            ${data.sysadmin}
        </div>

        <div class="label"><strong>😹 Emoji Summary: </strong>
            ${data.emoji}
        </div>

        <hr class="info-separator" />

        ${data.use_case ? `<div class="label"><stron>🛠️ Use Case: </strong>${data.use_case}</div>` : ""}

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
            </div>
        ` : ""}

        ${data.related ? `
            <div class="label"><strong>🔗 Related Terms: </strong>
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
