const fs = require('fs');

let overrides = `
/* ==============================================================
   DEEP NAVY OVERRIDES: PROGRESS BARS AND ICONS
   ============================================================== */
[data-theme="dark"] .progress-bar-fill,
[data-theme="dark"] .progress-bar-fill.success,
[data-theme="dark"] .progress-bar-fill.warning {
  background: linear-gradient(90deg, #0d9488, #38bdf8) !important; /* Cool Teal to Electric Blue */
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.5) !important;
}

[data-theme="dark"] .recharts-bar-rectangle path {
  /* This is handled by SVG defs now, but just in case */
}
`;

fs.appendFileSync('src/index.css', overrides);
console.log('Appended Deep Navy Progress Bar overrides.');
