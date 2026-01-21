## AGAD Candidate Cost Calculator (React/Vite)

This project was converted from plain HTML/CSS/JS to a **React app (Vite)**.

### What changed
- **React entrypoint**: `index.html` now mounts React into `#root`.
- **UI**: the original HTML UI is rendered from `src/App.jsx` (keeps all the same element `id`s).
- **Logic**: the calculator logic lives in `src/legacy/calculator.js` and is initialized from React after mount.
- **Assets**: `public/logo.png` is served at `/logo.png`.

### Prerequisites
Install **Node.js LTS** (which includes npm). Recommended: Node 20+.

### Run locally
From the project folder:

```bash
npm install
npm run dev
```

Then open the dev server URL shown in the terminal.

### Build

```bash
npm run build
npm run preview
```

