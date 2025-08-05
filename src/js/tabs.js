// src/js/tabs.js

export function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabPanels = document.querySelectorAll(".tab-panel");

  if (!tabButtons.length || !tabPanels.length) return;

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;

      // Deactivate all buttons and panels
      tabButtons.forEach(b => b.classList.remove("active"));
      tabPanels.forEach(p => p.classList.remove("active"));

      // Activate selected
      btn.classList.add("active");
      const panel = document.getElementById(`${targetTab}-panel`);
      if (panel) {
        panel.classList.add("active");
      }
    });
  });
}
