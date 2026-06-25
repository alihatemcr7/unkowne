const fs = require('fs');

// --- 1. Dashboard.jsx ---
let dashboard = fs.readFileSync('src/components/Dashboard.jsx', 'utf8');

// Import Printer if not present
if (!dashboard.includes('Printer')) {
  dashboard = dashboard.replace(/import \{([^}]+)\} from 'lucide-react';/, (match, p1) => {
    return \`import { \${p1.trim()}, Printer } from 'lucide-react';\`;
  });
}

// Add handlePrintProgressReport
const handlePrintProgressReportCode = \`
  const handlePrintProgressReport = () => {
    let rows = '';
    categories.forEach(cat => {
      const catTasks = tasks.filter(t => t.category_name === cat.name);
      if (catTasks.length === 0) return;
      rows += \\\`<tr style="background:#f1f5f9;font-weight:bold"><td colspan="6">\\\${cat.name}</td></tr>\\\`;
      catTasks.forEach(task => {
        rows += \\\`<tr>
          <td>\\\${task.name}</td>
          <td style="text-align:center">\\\${task.total_quantity || '-'}</td>
          <td style="text-align:center">\\\${task.completed_quantity || '-'}</td>
          <td style="text-align:center">\\\${task.total_quantity ? (task.total_quantity - task.completed_quantity).toFixed(2) : '-'}</td>
          <td style="text-align:center;font-weight:bold;direction:ltr">\\\${task.progress_percent.toFixed(2)}%</td>
          <td>\\\${task.notes || ''}</td>
        </tr>\\\`;
      });
    });

    const html = \\\`<!DOCTYPE html>
<html lang="\\\${lang}" dir="\\\${lang === 'ar' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8"/>
  <title>الجدول العام لتقدم العمل</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Cairo', sans-serif; padding: 20px; color: #1e293b; }
    h1 { text-align: center; color: #0f172a; margin-bottom: 5px; }
    h3 { text-align: center; color: #475569; margin-top: 0; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
    th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: \\\${lang === 'ar' ? 'right' : 'left'}; }
    th { background-color: #0f172a; color: white; font-weight: bold; text-align: center; }
    .print-footer { display: flex; justify-content: space-between; margin-top: 50px; font-weight: bold; }
    .signature-block { text-align: center; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <h1>مشروع الجندي المجهول</h1>
  <h3>الجدول العام لتقدم العمل بالمشروع</h3>
  <div style="text-align: left; margin-bottom: 10px; font-weight: bold;">تاريخ الإصدار: \\\${new Date().toLocaleDateString('en-GB')}</div>
  <table>
    <thead>
      <tr>
        <th>الفقرة التنفيذية</th>
        <th>الكمية الكلية</th>
        <th>المنجز</th>
        <th>المتبقي</th>
        <th>نسبة الإنجاز</th>
        <th>الملاحظات</th>
      </tr>
    </thead>
    <tbody>\\\${rows}</tbody>
  </table>
  <div class="print-footer">
    <div class="signature-block">المهندس المقيم<br/><br/>.......................</div>
    <div class="signature-block">مدير المشروع<br/><br/>.......................</div>
  </div>
  <script>window.onload = function() { setTimeout(() => { window.print(); window.close(); }, 500); }</script>
</body>
</html>\\\`;

    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };
\`;

// Insert the print function before the return statement
if (!dashboard.includes('handlePrintProgressReport')) {
  dashboard = dashboard.replace(/return \(\s*<motion\.div/, handlePrintProgressReportCode + '\\n  return (\\n    <motion.div');
}

// Add the print button next to the table title
const tableTitleRegex = /<h3[^>]*>[\s\S]*?\{t\('tableTitle'\)\}[\s\S]*?<\/h3>/;
if (dashboard.match(tableTitleRegex)) {
  const replacement = \`<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Layers size={20} style={{ color: 'var(--accent)' }} />
            {t('tableTitle')}
          </h3>
          <button
            onClick={handlePrintProgressReport}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.2)' }}
          >
            <Printer size={18} />
            {lang === 'ar' ? 'طباعة / تصدير PDF' : 'Print PDF'}
          </button>
        </div>\`;
  dashboard = dashboard.replace(/<h3 style=\{\{ fontSize: '1.2rem'.*?>[\s\S]*?\{t\('tableTitle'\)\}[\s\S]*?<\/h3>/, replacement);
}

fs.writeFileSync('src/components/Dashboard.jsx', dashboard, 'utf8');


// --- 2. MaterialsReport.jsx ---
let materials = fs.readFileSync('src/components/MaterialsReport.jsx', 'utf8');

// Import Printer if not present
if (!materials.includes('Printer')) {
  materials = materials.replace(/import \{([^}]+)\} from 'lucide-react';/, (match, p1) => {
    return \`import { \${p1.trim()}, Printer } from 'lucide-react';\`;
  });
}

// Add handlePrintMarbleReport
const handlePrintMarbleReportCode = \`
  const handlePrintMarbleReport = () => {
    let rows = '';
    zones.forEach(zoneName => {
      const zoneItems = marble.filter(item => item.zone === zoneName);
      let zoneWhite = 0, zoneBrown = 0;
      zoneItems.forEach(item => {
        zoneWhite += item.white_qty || 0;
        zoneBrown += item.brown_qty || 0;
      });

      rows += \\\`<tr style="background:#f1f5f9;font-weight:bold">
        <td colspan="2">\\\${lang === 'ar' ? zoneName.replace('Zone', 'المنطقة') : zoneName}</td>
        <td style="text-align:center">\\\${zoneWhite || '-'}</td>
        <td style="text-align:center">\\\${zoneBrown || '-'}</td>
        <td style="text-align:center">\\\${(zoneWhite + zoneBrown) || '-'}</td>
        <td></td>
      </tr>\\\`;

      zoneItems.forEach(item => {
        const white = item.white_qty !== null ? item.white_qty.toLocaleString() : '-';
        const brown = item.brown_qty !== null ? item.brown_qty.toLocaleString() : '-';
        const total = (item.white_qty || 0) + (item.brown_qty || 0);
        
        rows += \\\`<tr>
          <td>\\\${item.zone}</td>
          <td>\\\${item.task_name}</td>
          <td style="text-align:center">\\\${white}</td>
          <td style="text-align:center">\\\${brown}</td>
          <td style="text-align:center;font-weight:bold">\\\${total > 0 ? total.toLocaleString() : '-'}</td>
          <td>\\\${item.status || ''}</td>
        </tr>\\\`;
      });
    });

    const html = \\\`<!DOCTYPE html>
<html lang="\\\${lang}" dir="\\\${lang === 'ar' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8"/>
  <title>تفاصيل توزيع المرمر</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Cairo', sans-serif; padding: 20px; color: #1e293b; }
    h1 { text-align: center; color: #0f172a; margin-bottom: 5px; }
    h3 { text-align: center; color: #475569; margin-top: 0; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
    th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: \\\${lang === 'ar' ? 'right' : 'left'}; }
    th { background-color: #0f172a; color: white; font-weight: bold; text-align: center; }
    .print-footer { display: flex; justify-content: space-between; margin-top: 50px; font-weight: bold; }
    .signature-block { text-align: center; }
    .totals-box { margin-bottom: 20px; padding: 15px; border: 2px solid #0f172a; border-radius: 8px; background: #f8fafc; display: flex; justify-content: space-around; font-weight: bold; font-size: 16px; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <h1>مشروع الجندي المجهول</h1>
  <h3>تفاصيل توزيع قطع المرمر حسب المناطق والألوان</h3>
  
  <div class="totals-box">
    <div>إجمالي المرمر الأبيض: <span style="color:#16a34a">\\\${totalWhite.toLocaleString()}</span> قطعة</div>
    <div>إجمالي المرمر الجوزي: <span style="color:#b45309">\\\${totalBrown.toLocaleString()}</span> قطعة</div>
    <div>المجموع الكلي: <span style="color:#0f172a">\\\${grandTotal.toLocaleString()}</span> قطعة</div>
  </div>

  <div style="text-align: left; margin-bottom: 10px; font-weight: bold;">تاريخ الإصدار: \\\${new Date().toLocaleDateString('en-GB')}</div>
  <table>
    <thead>
      <tr>
        <th>المنطقة (Zone)</th>
        <th>طبيعة العمل</th>
        <th>أبيض (قطعة)</th>
        <th>جوزي (قطعة)</th>
        <th>الإجمالي</th>
        <th>الموقف الميداني</th>
      </tr>
    </thead>
    <tbody>\\\${rows}</tbody>
  </table>
  <div class="print-footer">
    <div class="signature-block">المهندس المقيم<br/><br/>.......................</div>
    <div class="signature-block">مدير المشروع<br/><br/>.......................</div>
  </div>
  <script>window.onload = function() { setTimeout(() => { window.print(); window.close(); }, 500); }</script>
</body>
</html>\\\`;

    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };
\`;

// Insert the print function before the return statement
if (!materials.includes('handlePrintMarbleReport')) {
  materials = materials.replace(/return \(\s*<motion\.div/, handlePrintMarbleReportCode + '\\n  return (\\n    <motion.div');
}

// Add the print button next to the table title
if (materials.includes('tableMaterialsInstruction')) {
  materials = materials.replace(/\{\(user\.role === 'admin' \|\| user\.role === 'super_admin'\) && \([\s\S]*?<\/span>\s*\)\}/, (match) => {
    return match + \`
            <button
              onClick={handlePrintMarbleReport}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.2)' }}
            >
              <Printer size={18} />
              {lang === 'ar' ? 'طباعة / تصدير PDF' : 'Print PDF'}
            </button>\`;
  });
}

fs.writeFileSync('src/components/MaterialsReport.jsx', materials, 'utf8');
console.log('PDF export capabilities added to Dashboard.jsx and MaterialsReport.jsx');
