const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.jsx', 'utf8');

// 1. Change the main container
code = code.replace(
  'className="bento-grid"',
  'className="cyber-dashboard"'
);

// 2. Wrap the KPIs in cyber-kpi-row
code = code.replace(
  '{/* 1. KPI Cards */}',
  '{/* 1. KPI Cards */}\n      <div className="cyber-kpi-row">'
);

// We need to close the cyber-kpi-row after the 4th KPI.
// The 4th KPI ends right before {/* 2. Charts Visual Section */}
code = code.replace(
  '{/* 2. Charts Visual Section */}',
  '</div>\n\n      {/* 2. Charts Visual Section */}'
);

// 3. Remove .bento-col-3 from KPIs
code = code.replace(/className="kpi-card bento-col-3 success"/g, 'className="kpi-card"');
code = code.replace(/className="kpi-card bento-col-3"/g, 'className="kpi-card"');
code = code.replace(/className="kpi-card bento-col-3 pending"/g, 'className="kpi-card"');

// 4. Update the Main Chart Section
// We want to make the BarChart take up the majority of vertical space.
code = code.replace(
  'className="glass-panel bento-col-8" style={{ height: \'420px\', display: \'flex\', flexDirection: \'column\' }}',
  'className="glass-panel cyber-main-chart"'
);

// Also set barSize to thinner as requested.
code = code.replace(
  'barSize={12}',
  'barSize={8}'
);

// 5. Wrap the secondary charts (Pie chart and daily progress) in a secondary row to keep it clean, 
// or let them stack naturally.
// Chart 2 starts at {/* Chart 2: Status Distribution */}
// Let's remove bento-col-* from the rest
code = code.replace(
  'className="glass-panel bento-col-4" style={{ height: \'420px\', display: \'flex\', flexDirection: \'column\' }}',
  'className="glass-panel" style={{ height: \'420px\', display: \'flex\', flexDirection: \'column\' }}'
);

code = code.replace(
  'className="glass-panel bento-col-12"',
  'className="glass-panel"'
);

// Let's put Chart 2 and the next full width block into a container? No, they can just be block elements.
// Wait, to make them side by side if we want, but sticking to block elements is fine for now.

fs.writeFileSync('src/components/Dashboard.jsx', code);
console.log('Restructured Dashboard.jsx');
