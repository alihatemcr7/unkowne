const fs = require('fs');
let css = `
/* Cyber Fintech Layout Classes */
.cyber-dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cyber-kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

@media (max-width: 1024px) {
  .cyber-kpi-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .cyber-kpi-row {
    grid-template-columns: 1fr;
  }
}

.cyber-main-chart {
  display: flex;
  flex-direction: column;
  height: 600px !important;
  padding: 32px !important;
}

.cyber-secondary-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}
`;

fs.appendFileSync('src/index.css', css);
console.log('Appended Cyber Layout CSS');
