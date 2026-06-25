const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// Replace the previous OLED CSS override with the new Deep Navy / Luminous Electric Blue override.
let deepNavyCSS = `
/* ==============================================================
   DEEP NAVY / ELECTRIC BLUE REDESIGN
   ============================================================== */
:root {
  --accent: #38bdf8 !important; /* Luminous Electric Blue */
  --accent-on: #ffffff !important;
  --accent-hover: #0ea5e9 !important;
  --accent-active: #0284c7 !important;
  
  --success: #38bdf8 !important; /* Unified to Electric Blue */
  --warn: #38bdf8 !important;    /* Unified to Electric Blue */
  --info: #38bdf8 !important;    /* Unified to Electric Blue */
  
  --color-success: var(--success);
  --color-danger: var(--success);
}

[data-theme="dark"] {
  --bg-color-1: #0B1120 !important; /* Deep Navy */
  --bg-color-2: #0B1120 !important;
  --bg-color-3: #0B1120 !important;

  --bg-1: #0B1120 !important;
  --bg-2: #0B1120 !important;
  --bg-3: #0B1120 !important;

  --surface: #1E293B !important; /* Slightly lighter navy for surfaces */
  --surface-warm: #1E293B !important;
  --surface-solid: #0F172A !important;

  --fg: #F8FAFC !important; /* Off-White */
  --fg-2: #94A3B8 !important; /* Slate Blue */
  --muted: #64748B !important; /* Slate Blue darker */

  --border: #334155 !important;
  --border-soft: #1E293B !important;

  --accent: #38bdf8 !important;
  --accent-on: #0B1120 !important;
  --accent-hover: #0ea5e9 !important;
  --accent-glow: rgba(56, 189, 248, 0.4) !important;

  --elev-glass: 0 10px 25px -5px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05) !important;
  --elev-raised: 0 20px 40px -10px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.1) !important;
  --focus-ring: 0 0 0 3px rgba(56, 189, 248, 0.4) !important;
}

[data-theme="dark"] .kpi-icon-container {
  color: var(--accent) !important;
  text-shadow: 0 0 10px var(--accent-glow) !important;
}

[data-theme="dark"] .kpi-value, [data-theme="dark"] .stat-value {
  color: var(--accent) !important;
  text-shadow: 0 0 8px var(--accent-glow) !important;
}

[data-theme="dark"] .nav-item {
  color: var(--fg-2) !important;
}
[data-theme="dark"] .nav-item.active {
  color: var(--accent) !important;
  background: rgba(56, 189, 248, 0.1) !important;
}
[data-theme="dark"] .nav-item.active svg {
  color: var(--accent) !important;
  filter: drop-shadow(0 0 4px var(--accent-glow));
}
`;

fs.appendFileSync('src/index.css', deepNavyCSS);
console.log('Successfully applied Deep Navy CSS overrides to index.css!');
