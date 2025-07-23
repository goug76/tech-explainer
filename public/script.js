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
      <div class="explanation">
        <div class="label">🧒 Explain Like I’m 5:</div>
        <p>${data.eli5}</p>
        <div class="label">💼 Explain to a Boss:</div>
        <p>${data.boss}</p>
        <div class="label">🧑‍💻 Explain to a Sysadmin:</div>
        <p>${data.sysadmin}</p>
        <div class="label">😹 Emoji Summary:</div>
        <p>${data.emoji}</p>
      </div>
    `;
  } catch (err) {
    results.innerHTML = `<p>No explanation found for "${term}".</p>`;
  }
});