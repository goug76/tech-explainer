// src/js/theme.js

const themes = ["auto", "light", "dark"];
const icons = ["mode_icon_1.png", "mode_icon_2.png", "mode_icon_3.png"];
let currentIndex = 0;

export function initTheme() {
  const themeToggleIcon = document.getElementById("themeToggleIcon");
  if (!themeToggleIcon) {
    console.warn("⚠️ themeToggleIcon not found");
    return;
  }

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme && themes.includes(savedTheme)) {
    setTheme(savedTheme, themeToggleIcon);
    currentIndex = themes.indexOf(savedTheme);
  } else {
    setTheme("auto", themeToggleIcon);
  }

  themeToggleIcon.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % themes.length;
    const selectedTheme = themes[currentIndex];
    setTheme(selectedTheme, themeToggleIcon);
  });
}

function setTheme(mode, iconEl) {
  const resolved = mode === "auto" ? getPreferredTheme() : mode;
  document.documentElement.setAttribute("data-theme", resolved);
  localStorage.setItem("theme", mode);

  const iconPath = `img/${icons[themes.indexOf(mode)]}`;
  if (iconEl) iconEl.src = iconPath;
}

function getPreferredTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
