const fs = require('fs');

let oledCSS = `
/* ==============================================================
   OLED UI/UX PRO MAX REDESIGN
   ============================================================== */
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&family=Cairo:wght@400;600;700&display=swap');

:root {
  --font-arabic: 'Cairo', system-ui, sans-serif !important;
  --font-english: 'Fira Sans', system-ui, sans-serif !important;
  --font-mono: 'Fira Code', monospace !important;
  
  --accent: #22C55E !important;
  --accent-on: #ffffff !important;
  --accent-hover: #16A34A !important;
  --accent-active: #15803D !important;
  --success: #22C55E !important;
}

[data-theme="dark"] {
  --bg-color-1: #020617 !important; /* Deep Space Black */
  --bg-color-2: #020617 !important;
  --bg-color-3: #020617 !important;

  --bg-1: #020617 !important;
  --bg-2: #020617 !important;
  --bg-3: #020617 !important;

  --surface: #0F172A !important; /* Slate Navy */
  --surface-warm: #1E293B !important;
  --surface-solid: #0F172A !important;

  --fg: #F8FAFC !important;
  --fg-2: #CBD5E1 !important;
  --muted: #64748B !important;

  --border: #334155 !important;
  --border-soft: #1E293B !important;

  --accent: #22C55E !important;
  --accent-on: #020617 !important;
  --accent-hover: #16A34A !important;
  --accent-glow: rgba(34, 197, 94, 0.35) !important;

  --elev-glass: 0 10px 25px -5px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05) !important;
  --elev-raised: 0 20px 40px -10px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.1) !important;
  --focus-ring: 0 0 0 3px rgba(34, 197, 94, 0.4) !important;
}

[data-theme="dark"] .app-container::before,
[data-theme="dark"] .app-container::after {
  display: none !important; /* Remove bright neon glow for OLED */
}

/* Ensure Fira Sans is used */
body, button, input, select, textarea {
  font-family: var(--font-english);
}
html[dir="rtl"] body,
html[dir="rtl"] button,
html[dir="rtl"] input,
html[dir="rtl"] select,
html[dir="rtl"] textarea {
  font-family: var(--font-arabic);
}

.kpi-value, .stat-value {
  font-family: var(--font-mono) !important;
  letter-spacing: -0.02em;
}

/* Glass panel enhancements for OLED */
.glass-panel, .kpi-card {
  background: var(--surface) !important;
  border: 1px solid var(--border) !important;
  box-shadow: var(--elev-glass) !important;
  backdrop-filter: blur(12px) !important;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.kpi-card:hover, .glass-panel:hover {
  border-color: rgba(34, 197, 94, 0.4) !important;
  transform: translateY(-2px) !important;
  box-shadow: var(--elev-raised) !important;
}

/* Remove gradient borders or set them to match OLED */
.glass-panel::before, .kpi-card::before {
  opacity: 0.2 !important;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent) !important;
}
`;

fs.appendFileSync('src/index.css', oledCSS);
console.log('Successfully applied OLED UI/UX Pro Max CSS overrides to index.css!');
