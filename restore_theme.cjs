const fs = require('fs');
const changes = JSON.parse(fs.readFileSync('extracted_ui_changes.json', 'utf8'));

// The chunk from step 264 contains the layout and glass panel CSS
let layoutChunk = changes.find(c => c.step === 264).chunks[0].ReplacementContent;

let appendCSS = `
/* ==============================================================
   VIOLET / INDIGO DEEP SPACE GLASSMORPHISM OVERRIDES
   ============================================================== */
:root {
  --accent: #8b5cf6 !important;
  --accent-on: #ffffff !important;
  --accent-hover: #a855f7 !important;
  --accent-active: #7c3aed !important;
  --success: #10b981 !important;
}

[data-theme="dark"] {
  --bg-color-1: #060814 !important;
  --bg-color-2: #0d111d !important;
  --bg-color-3: #030409 !important;

  --surface: rgba(124, 58, 237, 0.08) !important;
  --surface-warm: rgba(124, 58, 237, 0.12) !important;
  --surface-solid: #0b0f19 !important;

  --fg: #f8fafc !important;
  --fg-2: #c4b5fd !important;
  --muted: #8b5cf6 !important;

  --border: rgba(139, 92, 246, 0.2) !important;
  --border-soft: rgba(139, 92, 246, 0.1) !important;

  --accent: #8b5cf6 !important;
  --accent-on: #ffffff !important;
  --accent-hover: #a855f7 !important;

  --elev-glass: 0 12px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(139, 92, 246, 0.15) !important;
  --elev-raised: 0 20px 40px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(139, 92, 246, 0.2) !important;
}

[data-theme="dark"] .app-container::before {
  background: #a855f7 !important;
  opacity: 0.16 !important;
}

[data-theme="dark"] .app-container::after {
  background: #3b82f6 !important;
  opacity: 0.12 !important;
}

/* ==============================================================
   BENTO GRID AND GLASS PANELS
   ============================================================== */
`;

fs.appendFileSync('src/index.css', appendCSS + layoutChunk);
console.log('Successfully appended Violet Theme and Glassmorphism CSS to index.css!');
