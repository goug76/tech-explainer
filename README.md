# 🧠 Tech Decoded – Modular Glossary App

Tech Decoded is a blazing-fast, modular glossary tool built with Vite. It explains tech terms across multiple levels — from beginner-friendly ELI5 to sysadmin-level depth — with support for aliases, comparisons, category filters, and SEO metadata.

---

## 🚀 Features

- 🧒 ELI5 / 💼 Boss / 🧑‍💻 Sysadmin explanations per term
- 🔍 Autocomplete with keyboard & mouse support
- 🔗 Deep linking: `?term=`, `?compare=term1-vs-term2`
- 🔄 Compare any two related terms
- 📆 Daily term spotlight (localStorage-powered)
- 📚 Category + A–Z filtering with live counts
- 📣 Social sharing links (Twitter, Facebook, Reddit)
- ⚙️ JSON-LD schema injection + dynamic metadata
- 🎨 Light / dark / auto theme toggle


## 📁 Project Structure
```txt
project-root/
├── data/
│   └── terms.json             # Glossary term data
├── img/                       # Icons and emoji assets
├── node_modules/
├── src/
│   ├── main.js                # App entry point
│   ├── js/
│   │   ├── comparison.js      # Side-by-side compare view
│   │   ├── fetcher.js         # Card rendering + share + metadata
│   │   ├── filters.js         # Category + A–Z filtering
│   │   ├── loadTerms.js       # Loads terms.json & builds alias map
│   │   ├── share.js           # Twitter/Facebook/Reddit share URLs
│   │   ├── state.js           # App state (terms, aliases, list)
│   │   ├── suggestions.js     # Autocomplete suggestions
│   │   ├── tabs.js            # ELI5/Boss/Sysadmin view toggling
│   │   ├── theme.js           # Theme switching logic
│   │   └── utils.js           # Tooltips, metadata, schema, daily term
│   └── styles/
│       ├── _base.scss
│       ├── _components.scss
│       ├── _features.scss
│       ├── _layout.scss
│       ├── _results.scss
│       ├── _theme.scss
│       └── main.scss          # Main SCSS entry point
├── .gitignore
├── index.html                # Main page (loads Vite bundle)
├── test.html                 # Optional test entry
├── netlify.toml              # Netlify deployment config
├── vite.config.js            # Vite: root = src, output = dist
├── package.json
├── package-lock.json
└── README.md
```

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev
```
Then open: http://localhost:5173

## 🏗 Build for Production
```bash
npm run build
```
Outputs to /dist, ready for Netlify or any static hosting.

## ⚙️ Vite Config Summary

```js
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',             // index.html lives in project root
  publicDir: 'data',     // serves terms.json directly
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
```

## 🌐 Netlify Deployment
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
```

## ✅ Final Setup Checklist
- All JavaScript modules imported via `main.js`
- `terms.json` in `data/` loads publicly
-  Working search via input, button, and keyboard
- Compare view with deep linking
- Metadata and JSON-LD inject on load
- Netlify auto-builds to `dist/`

## 🤝 Credits
Built with ❤️ by John Goughenour
Powered by Vite, designed for clarity and speed.

## 📜 License
MIT – free for personal and commercial use.
