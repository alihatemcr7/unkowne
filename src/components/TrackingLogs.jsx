import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Save, Edit3, X, Printer } from 'lucide-react';

export default function TrackingLogs({ nazalat, user, onUpdateNazalaDetails, loading, t, lang, translateText }) {
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';

  // Apply filters
  const filteredNazalat = nazalat.filter((n) => {
    const matchesZone = selectedZone === '' || n.zone === selectedZone;
    const matchesStatus = selectedStatus === '' || n.status === selectedStatus;
    const matchesSearch = searchQuery === '' || n.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesZone && matchesStatus && matchesSearch;
  });

  const getStats = () => {
    const total = filteredNazalat.length;
    const completed = filteredNazalat.filter(n => n.status === 'منجز').length;
    const pending = total - completed;
    return { total, completed, pending };
  };

  const stats = getStats();

  const handleEditClick = (n) => {
    setEditingId(n.id);
    setEditForm({
      white_marked: n.white_marked || 0,
      white_extra: n.white_extra || 0,
      white_applied: n.white_applied || 0,
      white_date: n.white_date || '',
      brown_marked: n.brown_marked || 0,
      brown_extra: n.brown_extra || 0,
      brown_applied: n.brown_applied || 0,
      brown_date: n.brown_date || '',
      status: n.status || 'متبقي'
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id) => {
    setSavingId(id);
    try {
      await onUpdateNazalaDetails(id, editForm);
      setEditingId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const handleChange = (e, field) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value, 10) || 0 : e.target.value;
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1 }
  };

  const handleExportPDF = (zoneFilter = null) => {
    // If zoneFilter is provided, print only that zone from filtered results; else print all filtered results
    const source = zoneFilter
      ? filteredNazalat.filter(n => n.zone === zoneFilter)
      : filteredNazalat;

    const grouped = source.reduce((acc, n) => {
      acc[n.zone] = acc[n.zone] || [];
      acc[n.zone].push(n);
      return acc;
    }, {});

    let titleZone = zoneFilter || selectedZone;
    const docTitle = titleZone
      ? `جدول تقدم أعمال سجل النزلات - ${titleZone.replace('Zone', 'زون')}`
      : 'جدول تقدم أعمال سجل النزلات - جميع الزونات';

    let zonesHTML = '';
    let grandWhiteApplied = 0;
    let grandBrownApplied = 0;

    Object.entries(grouped).forEach(([zone, zoneNazalat]) => {
      const zTWM = zoneNazalat.reduce((s, n) => s + (n.white_marked || 0), 0);
      const zTWE = zoneNazalat.reduce((s, n) => s + (n.white_extra || 0), 0);
      const zTWA = zoneNazalat.reduce((s, n) => s + (n.white_applied || 0), 0);
      const zTBM = zoneNazalat.reduce((s, n) => s + (n.brown_marked || 0), 0);
      const zTBE = zoneNazalat.reduce((s, n) => s + (n.brown_extra || 0), 0);
      const zTBA = zoneNazalat.reduce((s, n) => s + (n.brown_applied || 0), 0);
      const zEntitlement = zTWA + zTBA;

      grandWhiteApplied += zTWA;
      grandBrownApplied += zTBA;

      const rowsHTML = zoneNazalat.map((n, i) => {
        const ent = (n.white_applied || 0) + (n.brown_applied || 0);
        const bg = i % 2 === 0 ? '#ffffff' : '#fafafa';
        return `
          <tr style="background:${bg};">
            <td style="font-weight:700; text-align:center;">${n.code}</td>
            <td style="text-align:center;">${n.white_marked || 0}</td>
            <td style="text-align:center; color:#16a34a;">${n.white_extra || 0}</td>
            <td style="text-align:center; font-weight:600;">${n.white_applied || 0}</td>
            <td style="text-align:center; color:#6b7280;">${n.white_date || '-'}</td>
            <td style="text-align:center;">${n.brown_marked || 0}</td>
            <td style="text-align:center; color:#16a34a;">${n.brown_extra || 0}</td>
            <td style="text-align:center; font-weight:600; color:#b45309;">${n.brown_applied || 0}</td>
            <td style="text-align:center; color:#6b7280;">${n.brown_date || '-'}</td>
            <td style="text-align:center; font-weight:800; color:#1d4ed8;">${ent || '-'}</td>
            <td style="text-align:center;">
              <span style="padding:2px 8px; border-radius:10px; font-size:9pt; background:${n.status === 'منجز' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}; color:${n.status === 'منجز' ? '#059669' : '#b45309'};">${n.status || 'متبقي'}</span>
            </td>
          </tr>`;
      }).join('');

      zonesHTML += `
        <div class="zone-section">
          <div class="zone-title">
            <span class="zone-badge">${zone.replace('Zone', 'زون')}</span>
            جدول النزلات
          </div>
          <table>
            <thead>
              <tr>
                <th rowspan="2" style="width:70px;">الجناح</th>
                <th colspan="4" style="background:#e8f4fd; color:#1e40af;">الأبيض</th>
                <th colspan="4" style="background:#fef3e2; color:#92400e;">الجوزي</th>
                <th rowspan="2" style="background:#e0f2fe; color:#0369a1;">استحقاق الخلفة</th>
                <th rowspan="2">الحالة</th>
              </tr>
              <tr style="font-size:9pt; color:#555;">
                <th>المؤشر</th>
                <th style="color:#16a34a;">إضافي أخضر</th>
                <th>التطبيك</th>
                <th>التاريخ</th>
                <th>المؤشر</th>
                <th style="color:#16a34a;">إضافي أخضر</th>
                <th>التطبيك</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
              <tr class="summary-row">
                <td style="font-weight:900;">المجموع</td>
                <td style="font-weight:800;">${zTWM}</td>
                <td style="font-weight:800; color:#16a34a;">${zTWE}</td>
                <td style="font-weight:800;">${zTWA}</td>
                <td>-</td>
                <td style="font-weight:800;">${zTBM}</td>
                <td style="font-weight:800; color:#16a34a;">${zTBE}</td>
                <td style="font-weight:800; color:#b45309;">${zTBA}</td>
                <td>-</td>
                <td style="font-weight:900; color:#059669; font-size:12pt;">${zEntitlement}</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>`;
    });

    const grandEntitlement = grandWhiteApplied + grandBrownApplied;
    const today = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeNow = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const summaryCells = zoneFilter ? `
      <div class="summary-cell"><div class="lbl">نزلات الزون</div><div class="val">${source.length}</div></div>
      <div class="summary-cell"><div class="lbl">المطبق (أبيض)</div><div class="val">${grandWhiteApplied.toLocaleString()}</div></div>
      <div class="summary-cell"><div class="lbl">المطبق (جوزي)</div><div class="val amber">${grandBrownApplied.toLocaleString()}</div></div>
      <div class="summary-cell"><div class="lbl">استحقاق الخلفة</div><div class="val blue">${grandEntitlement.toLocaleString()}</div></div>
    ` : `
      <div class="summary-cell"><div class="lbl">إجمالي النزلات</div><div class="val">${source.length}</div></div>
      <div class="summary-cell"><div class="lbl">المجموع المطبق (أبيض)</div><div class="val">${grandWhiteApplied.toLocaleString()}</div></div>
      <div class="summary-cell"><div class="lbl">المجموع المطبق (جوزي)</div><div class="val amber">${grandBrownApplied.toLocaleString()}</div></div>
      <div class="summary-cell"><div class="lbl">إجمالي استحقاق الخلفة</div><div class="val blue">${grandEntitlement.toLocaleString()}</div></div>
    `;

    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${docTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Cairo', 'Noto Sans Arabic', Arial, sans-serif;
      color: #1a1a2e;
      background: #fff;
      direction: rtl;
      font-size: 10.5pt;
      line-height: 1.55;
    }
    .page {
      width: 297mm;
      min-height: 210mm;
      margin: 0 auto;
      padding: 12mm 15mm 15mm 15mm;
      background: #fff;
    }
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 3px solid #1a1a2e;
      margin-bottom: 16px;
    }
    .header-org { display: flex; align-items: center; gap: 12px; }
    .org-text h1 { font-size: 14pt; font-weight: 900; color: #1a1a2e; }
    .org-text p { font-size: 9pt; color: #555; margin-top: 2px; }
    .header-meta { text-align: left; font-size: 9pt; color: #444; line-height: 2; }
    .header-meta .doc-title { font-size: 13pt; font-weight: 800; color: #1a1a2e; margin-bottom: 4px; }
    .meta-badge {
      display: inline-block;
      background: #f59e0b;
      color: #fff;
      font-weight: 700;
      padding: 2px 10px;
      border-radius: 20px;
      font-size: 8.5pt;
      margin-bottom: 4px;
    }
    .summary-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0;
      border: 1.5px solid #d0d0d8;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 18px;
    }
    .summary-cell {
      padding: 8px 12px;
      border-left: 1px solid #d0d0d8;
      text-align: center;
    }
    .summary-cell:last-child { border-left: none; }
    .summary-cell .lbl { font-size: 8pt; color: #888; font-weight: 600; }
    .summary-cell .val { font-size: 14pt; font-weight: 900; color: #1a1a2e; margin-top: 2px; }
    .summary-cell .val.green { color: #059669; }
    .summary-cell .val.amber { color: #b45309; }
    .summary-cell .val.blue { color: #1d4ed8; }
    .zone-section { margin-bottom: 22px; }
    .zone-title {
      font-size: 11pt;
      font-weight: 800;
      color: #fff;
      background: #1a1a2e;
      padding: 7px 14px;
      border-radius: 6px 6px 0 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .zone-badge {
      background: #f59e0b;
      color: #1a1a2e;
      border-radius: 4px;
      padding: 1px 8px;
      font-size: 9.5pt;
      font-weight: 900;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
      border: 1.5px solid #d0d0d8;
      border-top: none;
    }
    th {
      background: #f0f0f5;
      font-weight: 700;
      color: #333;
      padding: 6px 8px;
      border: 1px solid #d0d0d8;
      text-align: center;
    }
    td {
      padding: 5px 8px;
      border: 1px solid #e0e0e8;
      text-align: center;
      color: #1a1a2e;
    }
    .summary-row {
      background: #1a1a2e !important;
      color: #fff;
      font-weight: 800;
      border-top: 2px solid #1a1a2e;
    }
    .summary-row td {
      color: #fff;
      border-color: #333;
      background: transparent;
    }
    .grand-total {
      background: #1a1a2e;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #fff;
    }
    .grand-total .gt-label { font-size: 12pt; font-weight: 700; }
    .grand-total .gt-val {
      font-size: 22pt;
      font-weight: 900;
      color: #f59e0b;
    }
    .grand-total .gt-breakdown { font-size: 9.5pt; color: #aaa; margin-top: 4px; }
    .signatures {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 2px dashed #bbb;
    }
    .sig-box {
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    .sig-box .sig-title { font-size: 9.5pt; font-weight: 800; color: #1a1a2e; margin-bottom: 6px; }
    .sig-box .sig-line {
      border-top: 1px solid #999;
      margin: 24px 8px 4px;
      padding-top: 4px;
      font-size: 8pt;
      color: #888;
    }
    .report-footer {
      margin-top: 18px;
      padding-top: 8px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      font-size: 7.5pt;
      color: #aaa;
    }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .page { width: 100%; padding: 8mm 12mm; }
      @page { size: A3 landscape; margin: 8mm; }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- HEADER -->
    <div class="report-header">
      <div class="header-org">
        <div style="width:70px; height:70px;">
          <img src="https://mvco-iq.com/wp-content/uploads/2024/10/cropped-2color_logo.webp" alt="Logo" style="max-width:100%; max-height:100%; object-fit:contain;" />
        </div>
        <div class="org-text">
          <h1>متابعة موقع الجندي المجهول</h1>
          <p>شركة رؤية الحداثة للخدمات الهندسية والاستثمار العقاري</p>
        </div>
      </div>
      <div class="header-meta">
        <div class="doc-title">${docTitle}</div>
        <div class="meta-badge">وثيقة رسمية</div><br/>
        <span>تاريخ الطباعة: <strong>${today}</strong></span><br/>
        <span>الوقت: <strong>${timeNow}</strong></span>
      </div>
    </div>

    <!-- SUMMARY BAR -->
    <div class="summary-bar">
      ${summaryCells}
    </div>

    <!-- ZONES TABLES -->
    ${zonesHTML}

    <!-- SIGNATURES -->
    <div class="signatures">
      <div class="sig-box"><div class="sig-title">دائرة المهندس المقيم</div><div class="sig-line">التوقيع والختم</div></div>
      <div class="sig-box"><div class="sig-title">الشركة المنفذة</div><div class="sig-line">التوقيع والختم</div></div>
      <div class="sig-box"><div class="sig-title">ممثل الجهة المستفيدة</div><div class="sig-line">التوقيع والختم</div></div>
    </div>

    <!-- FOOTER -->
    <div class="report-footer">
      <span>متابعة موقع الجندي المجهول &mdash; شركة رؤية الحداثة للخدمات الهندسية والاستثمار العقاري</span>
      <span>تم الإنشاء: ${today} &nbsp;|&nbsp; ${timeNow}</span>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 800);
    };
  <\/script>
</body>
</html>`;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.top = '-1000px';
      printFrame.style.left = '-1000px';
      printFrame.style.width = '1px';
      printFrame.style.height = '1px';
      printFrame.style.border = 'none';
      document.body.appendChild(printFrame);

      const frameDoc = printFrame.contentWindow.document;
      frameDoc.open();
      frameDoc.write(html.replace('window.close();', ''));
      frameDoc.close();

      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 15000);
    } else {
      const win = window.open('', '_blank', 'width=1200,height=900');
      if (win) {
        win.document.open();
        win.document.write(html);
        win.document.close();
      } else {
        const printFrame = document.createElement('iframe');
        printFrame.style.position = 'fixed';
        printFrame.style.top = '-1000px';
        printFrame.style.left = '-1000px';
        printFrame.style.width = '1px';
        printFrame.style.height = '1px';
        printFrame.style.border = 'none';
        document.body.appendChild(printFrame);

        const frameDoc = printFrame.contentWindow.document;
        frameDoc.open();
        frameDoc.write(html.replace('window.close();', ''));
        frameDoc.close();

        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 15000);
      }
    }
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowX: 'auto' }}>
      
      {/* Search and Filter Controls */}
      <div className="filter-bar" style={{ flexDirection: lang === 'ar' ? 'row' : 'row-reverse' }}>
        <div className="filters-group" style={{ flexDirection: lang === 'ar' ? 'row' : 'row' }}>
          
          <div style={{ position: 'relative', minWidth: '180px', flex: 1 }}>
            <input
              type="text"
              className="form-input"
              style={{ 
                paddingRight: lang === 'ar' ? '2.5rem' : '1rem', 
                paddingLeft: lang === 'ar' ? '1rem' : '2.5rem', 
                fontSize: '0.85rem' 
              }}
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search 
              size={18} 
              style={{ 
                position: 'absolute', 
                right: lang === 'ar' ? '12px' : 'auto', 
                left: lang === 'ar' ? 'auto' : '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--muted)' 
              }} 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--fg-2)' }}>{t('filterZone')}</span>
            <select
              className="form-input"
              style={{ width: '120px', padding: '0.5rem', fontSize: '0.85rem' }}
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
            >
              <option value="">{t('allZones')}</option>
              <option value="Zone A">{lang === 'ar' ? 'زون A' : 'Zone A'}</option>
              <option value="Zone B">{lang === 'ar' ? 'زون B' : 'Zone B'}</option>
              <option value="Zone C">{lang === 'ar' ? 'زون C' : 'Zone C'}</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--fg-2)' }}>{t('filterStatus')}</span>
            <select
              className="form-input"
              style={{ width: '120px', padding: '0.5rem', fontSize: '0.85rem' }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">{t('allStatuses')}</option>
              <option value="منجز">{t('statusDone')}</option>
              <option value="متبقي">{t('statusPending')}</option>
            </select>
          </div>

        </div>

        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', direction: lang === 'ar' ? 'rtl' : 'ltr', alignItems: 'center' }}>
          <div>
            <span style={{ color: 'var(--muted)' }}>{t('statsShowing')}</span>
            <span className="tabular-nums" style={{ fontWeight: '700' }}>{stats.total}</span>
          </div>
          <div>
            <span style={{ color: 'var(--success)' }}>{t('statsCompleted')}</span>
            <span className="tabular-nums" style={{ fontWeight: '700' }}>{stats.completed}</span>
          </div>
          <div>
            <span style={{ color: 'var(--warn)' }}>{t('statsPending')}</span>
            <span className="tabular-nums" style={{ fontWeight: '700' }}>{stats.pending}</span>
          </div>
          <button
            onClick={() => handleExportPDF()}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)', color: 'var(--success)', fontSize: '0.85rem', marginRight: lang === 'ar' ? 'auto' : 0, marginLeft: lang === 'ar' ? 0 : 'auto' }}
          >
            <Printer size={16} />
            {lang === 'ar' ? 'تصدير PDF' : 'Export PDF'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
          {t('loadingNazalat')}
        </div>
      ) : filteredNazalat.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', border: '1px dashed var(--border)', borderRadius: '10px' }}>
          {t('noNazalatFound')}
        </div>
      ) : (
        <motion.div 
          style={{ direction: lang === 'ar' ? 'rtl' : 'ltr', overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border)' }}
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <table className="custom-table" style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead style={{ backgroundColor: 'var(--bg-3)', borderBottom: '2px solid var(--border)' }}>
              <tr>
                <th rowSpan="2" style={{ padding: '0.75rem', borderRight: '1px solid var(--border)' }}>الجناح</th>
                <th colSpan="4" style={{ padding: '0.5rem', borderRight: '1px solid var(--border)', backgroundColor: 'rgba(255,255,255,0.05)' }}>الابيض</th>
                <th colSpan="4" style={{ padding: '0.5rem', borderRight: '1px solid var(--border)', backgroundColor: 'rgba(139, 69, 19, 0.1)' }}>الجوزي</th>
                <th rowSpan="2" style={{ padding: '0.75rem', borderRight: '1px solid var(--border)' }}>استحقاق الخلفة</th>
                <th rowSpan="2" style={{ padding: '0.75rem', borderRight: '1px solid var(--border)' }}>الحالة</th>
                {isAdmin && <th rowSpan="2" style={{ padding: '0.75rem' }}>إجراء</th>}
              </tr>
              <tr style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                {/* White Columns */}
                <th style={{ padding: '0.5rem', borderRight: '1px solid var(--border)' }}>المؤشر</th>
                <th style={{ padding: '0.5rem', borderRight: '1px solid var(--border)', color: 'var(--success)' }}>تأشير اضافي اخضر</th>
                <th style={{ padding: '0.5rem', borderRight: '1px solid var(--border)' }}>التطبيك</th>
                <th style={{ padding: '0.5rem', borderRight: '1px solid var(--border)' }}>التاريخ</th>
                {/* Brown Columns */}
                <th style={{ padding: '0.5rem', borderRight: '1px solid var(--border)' }}>المؤشر</th>
                <th style={{ padding: '0.5rem', borderRight: '1px solid var(--border)', color: 'var(--success)' }}>تأشير اضافي اخضر</th>
                <th style={{ padding: '0.5rem', borderRight: '1px solid var(--border)' }}>التطبيك</th>
                <th style={{ padding: '0.5rem', borderRight: '1px solid var(--border)' }}>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(
                filteredNazalat.reduce((acc, n) => {
                  acc[n.zone] = acc[n.zone] || [];
                  acc[n.zone].push(n);
                  return acc;
                }, {})
              ).map(([zone, zoneNazalat]) => {
                const totalWhiteApplied = zoneNazalat.reduce((sum, n) => sum + (n.white_applied || 0), 0);
                const totalBrownApplied = zoneNazalat.reduce((sum, n) => sum + (n.brown_applied || 0), 0);
                const zoneEntitlement = totalWhiteApplied + totalBrownApplied;
                const totalWhiteMarked = zoneNazalat.reduce((sum, n) => sum + (n.white_marked || 0), 0);
                const totalBrownMarked = zoneNazalat.reduce((sum, n) => sum + (n.brown_marked || 0), 0);

                return (
                  <React.Fragment key={zone}>
                    {zoneNazalat.map((n) => {
                      const isEditing = editingId === n.id;
                      const entitlement = isEditing 
                        ? (editForm.white_applied || 0) + (editForm.brown_applied || 0)
                        : (n.white_applied || 0) + (n.brown_applied || 0);

                      return (
                        <tr key={n.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s', backgroundColor: isEditing ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent' }} className="hover-row">
                    <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border)', fontWeight: 'bold' }}>
                      {n.code} <br/> <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 'normal' }}>{lang === 'ar' ? n.zone.replace('Zone', 'المنطقة') : n.zone}</span>
                    </td>
                    
                    {/* White Fields */}
                    <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border)' }}>
                      {isEditing ? <input type="number" className="form-input" style={{ width: '60px', padding: '4px' }} value={editForm.white_marked} onChange={(e) => handleChange(e, 'white_marked')} /> : n.white_marked || 0}
                    </td>
                    <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border)' }}>
                      {isEditing ? <input type="number" className="form-input" style={{ width: '60px', padding: '4px' }} value={editForm.white_extra} onChange={(e) => handleChange(e, 'white_extra')} /> : n.white_extra || 0}
                    </td>
                    <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border)' }}>
                      {isEditing ? <input type="number" className="form-input" style={{ width: '60px', padding: '4px' }} value={editForm.white_applied} onChange={(e) => handleChange(e, 'white_applied')} /> : n.white_applied || 0}
                    </td>
                    <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border)' }}>
                      {isEditing ? <input type="text" className="form-input" style={{ width: '100px', padding: '4px' }} value={editForm.white_date} onChange={(e) => handleChange(e, 'white_date')} placeholder="DD/MM/YYYY" /> : n.white_date || '-'}
                    </td>

                    {/* Brown Fields */}
                    <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border)' }}>
                      {isEditing ? <input type="number" className="form-input" style={{ width: '60px', padding: '4px' }} value={editForm.brown_marked} onChange={(e) => handleChange(e, 'brown_marked')} /> : n.brown_marked || 0}
                    </td>
                    <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border)' }}>
                      {isEditing ? <input type="number" className="form-input" style={{ width: '60px', padding: '4px' }} value={editForm.brown_extra} onChange={(e) => handleChange(e, 'brown_extra')} /> : n.brown_extra || 0}
                    </td>
                    <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border)' }}>
                      {isEditing ? <input type="number" className="form-input" style={{ width: '60px', padding: '4px' }} value={editForm.brown_applied} onChange={(e) => handleChange(e, 'brown_applied')} /> : n.brown_applied || 0}
                    </td>
                    <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border)' }}>
                      {isEditing ? <input type="text" className="form-input" style={{ width: '100px', padding: '4px' }} value={editForm.brown_date} onChange={(e) => handleChange(e, 'brown_date')} placeholder="DD/MM/YYYY" /> : n.brown_date || '-'}
                    </td>

                    {/* Entitlement & Status */}
                    <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border)', fontWeight: 'bold', color: 'var(--primary)' }}>
                      {entitlement}
                    </td>
                    <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border)' }}>
                      {isEditing ? (
                        <select className="form-input" style={{ padding: '4px' }} value={editForm.status} onChange={(e) => handleChange(e, 'status')}>
                          <option value="متبقي">متبقي</option>
                          <option value="منجز">منجز</option>
                        </select>
                      ) : (
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '0.8rem', 
                          backgroundColor: n.status === 'منجز' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: n.status === 'منجز' ? 'var(--success)' : 'var(--warn)'
                        }}>
                          {n.status}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    {isAdmin && (
                      <td style={{ padding: '0.75rem' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button 
                              onClick={() => handleSave(n.id)} 
                              disabled={savingId === n.id}
                              className="btn btn-primary" 
                              style={{ padding: '0.3rem 0.6rem', minWidth: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Save size={14} /> {savingId === n.id ? '...' : 'حفظ'}
                            </button>
                            <button 
                              onClick={handleCancelEdit} 
                              className="btn btn-secondary" 
                              style={{ padding: '0.3rem 0.6rem', minWidth: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleEditClick(n)} 
                            className="btn btn-secondary" 
                            style={{ padding: '0.3rem 0.6rem', minWidth: 'auto', display: 'flex', alignItems: 'center', gap: '4px', margin: '0 auto' }}
                          >
                            <Edit3 size={14} /> تعديل
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
                    {/* Summary Row for Zone */}
                    <tr style={{ backgroundColor: 'var(--bg-3)', fontWeight: 'bold', borderTop: '2px solid var(--border)', borderBottom: '2px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border)' }}>مجموع <br/> <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 'normal' }}>{lang === 'ar' ? zone.replace('Zone', 'المنطقة') : zone}</span></td>
                      
                      {/* White Summary */}
                      <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border)' }}>{totalWhiteMarked}</td>
                      <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border)' }}>-</td>
                      <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border)', color: 'var(--primary)' }}>{totalWhiteApplied}</td>
                      <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border)' }}>-</td>

                      {/* Brown Summary */}
                      <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border)' }}>{totalBrownMarked}</td>
                      <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border)' }}>-</td>
                      <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border)', color: 'var(--primary)' }}>{totalBrownApplied}</td>
                      <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border)' }}>-</td>

                      {/* Zone Entitlement Summary */}
                      <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border)', color: 'var(--success)' }}>{zoneEntitlement}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }} colSpan={isAdmin ? 1 : 1}>
                        <button
                          onClick={() => handleExportPDF(zone)}
                          title={`طباعة ${zone.replace('Zone', 'زون')} فقط`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600' }}
                        >
                          <Printer size={13} /> طباعة الزون
                        </button>
                      </td>
                      {isAdmin && <td style={{ padding: '0.75rem' }}>-</td>}
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          <style>{`
            .hover-row:hover {
              background-color: rgba(255, 255, 255, 0.02) !important;
            }
          `}</style>
        </motion.div>
      )}
    </div>
  );
}
