const fs = require('fs');

let cyberFintechCSS = `
/* ==============================================================
   MODERN CYBER / FINTECH REDESIGN
   ============================================================== */
:root {
  --font-arabic: 'Cairo', system-ui, sans-serif !important;
  --font-english: 'Inter', Roboto, system-ui, sans-serif !important;
  --font-mono: 'Fira Code', 'JetBrains Mono', monospace !important;
  
  --accent: #06B6D4 !important; /* Electric Cyan */
  --accent-secondary: #3B82F6 !important; /* Electric Blue */
  
  --success: #06B6D4 !important; 
  --warn: #06B6D4 !important;    
  --info: #06B6D4 !important;    
  --danger: #06B6D4 !important;
}

[data-theme="dark"] {
  --bg-color-1: #090E17 !important; /* Deep Navy / Slate 950 */
  --bg-color-2: #090E17 !important;
  --bg-color-3: #090E17 !important;

  --bg-1: #090E17 !important;
  --bg-2: #090E17 !important;
  --bg-3: #090E17 !important;

  --surface: rgba(30, 41, 59, 0.5) !important; /* Slate 800/50 */
  --surface-warm: rgba(30, 41, 59, 0.5) !important;
  --surface-solid: #090E17 !important;

  --fg: #FFFFFF !important; /* Pure White */
  --fg-2: #94A3B8 !important; /* Cool Slate */
  --muted: #64748B !important;

  --border: rgba(30, 41, 59, 0.5) !important; /* border-slate-800/50 */
  --border-soft: rgba(30, 41, 59, 0.3) !important;

  --accent-on: #090E17 !important;
  --accent-hover: #0891B2 !important;
  --accent-active: #0E7490 !important;
  --accent-glow: rgba(6, 182, 212, 0.4) !important;

  --elev-glass: inset 0 0 0 1px rgba(30, 41, 59, 0.5), 0 4px 6px -1px rgba(0, 0, 0, 0.5) !important;
  --elev-raised: inset 0 0 0 1px rgba(30, 41, 59, 0.8), 0 10px 15px -3px rgba(0, 0, 0, 0.7) !important;
  --focus-ring: 0 0 0 4px rgba(6, 182, 212, 0.4) !important;
}

/* Ensure glassmorphism is active */
.glass-panel, .kpi-card {
  background: var(--surface) !important;
  border: 1px solid var(--border) !important;
  box-shadow: var(--elev-glass) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
}

.kpi-card:hover, .glass-panel:hover {
  border-color: rgba(6, 182, 212, 0.3) !important;
  box-shadow: var(--elev-raised), 0 0 20px rgba(6, 182, 212, 0.1) !important;
}

/* KPI Numbers glowing effect */
[data-theme="dark"] .kpi-value, [data-theme="dark"] .stat-value {
  color: var(--accent) !important;
  text-shadow: 0 0 12px var(--accent-glow) !important;
  font-family: var(--font-mono) !important;
  font-weight: 700;
}

[data-theme="dark"] .kpi-icon-container {
  color: var(--accent) !important;
  text-shadow: 0 0 12px var(--accent-glow) !important;
}

/* Progress Bars */
[data-theme="dark"] .progress-bar-fill,
[data-theme="dark"] .progress-bar-fill.success,
[data-theme="dark"] .progress-bar-fill.warning {
  background: linear-gradient(90deg, #3B82F6, #06B6D4) !important;
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.5) !important;
}

/* Header Pill buttons */
.btn-pill {
  border-radius: 9999px !important; /* fully rounded */
  padding: 8px 16px !important;
  background: var(--surface) !important;
  border: 1px solid var(--border) !important;
  color: var(--fg-2) !important;
  transition: all 0.2s ease !important;
}
.btn-pill:hover {
  color: var(--fg) !important;
  background: rgba(30, 41, 59, 0.8) !important;
  border-color: rgba(6, 182, 212, 0.3) !important;
}
`;

fs.appendFileSync('src/index.css', cyberFintechCSS);
console.log('Appended Cyber/Fintech overrides to index.css');
