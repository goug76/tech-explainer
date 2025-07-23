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

        ${data.categories ? `<div class="label">📚 Categories:</div><p>${data.categories.join(", ")}</p>` : ""}
        ${data.related ? `<div class="label">🔗 Related Terms:</div><p>${data.related.join(", ")}</p>` : ""}
        ${data.use_case ? `<div class="label">🛠️ Use Case:</div><p>${data.use_case}</p>` : ""}
        ${data.jargon_score ? `<div class="label">📏 Jargon Score:</div><p>${"★".repeat(data.jargon_score)}</p>` : ""}
        ${data.level ? `<div class="label">🎓 Complexity Level:</div><p>${data.level}</p>` : ""}
      </div>
    `;
  } catch (err) {
    results.innerHTML = `<p>No explanation found for "${term}".</p>`;
  }
});