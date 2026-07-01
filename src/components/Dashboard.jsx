import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Layers, 
  Grid, 
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Save,
  MessageSquare,
  Printer
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import DashboardBento from './DashboardBento';

export default function Dashboard({ kpis, tasks, categories, user, onUpdateProgress, t, lang, translateText }) {
  const [editingTask, setEditingTask] = useState(null);
  const [tempProgress, setTempProgress] = useState({});
  const [tempCompleted, setTempCompleted] = useState({});
  const [tempNotes, setTempNotes] = useState({});
  const [savingId, setSavingId] = useState(null);

  // Responsive chart width detection
  const chartContainerRef = useRef(null);
  const [chartContainerWidth, setChartContainerWidth] = useState(600);
  useEffect(() => {
    const el = chartContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setChartContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    setChartContainerWidth(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  // Group tasks by category
  const groupedTasks = categories.reduce((acc, cat) => {
    acc[cat.name] = tasks.filter(t => t.category_name === cat.name);
    return acc;
  }, {});

  // Prepare chart data for task progress
  const chartData = tasks.map(t => {
    const cleanName = t.name.replace(' (محدث تلقائياً)', '').replace(' (تحديث تلقائي)', '');
    return {
      name: translateText(cleanName, lang),
      [lang === 'ar' ? 'نسبة الإنجاز %' : 'Progress %']: parseFloat(t.progress_percent.toFixed(1))
    };
  });

  // Prepare pie chart data for marble pieces (White vs Brown)
  const marbleChartData = [
    { name: lang === 'ar' ? 'مرمر أبيض مطبق' : 'Applied White Marble', value: kpis.applied_white_marble || 0, color: '#eef2f7' },
    { name: lang === 'ar' ? 'مرمر جوزي مطبق' : 'Applied Brown Marble', value: kpis.applied_brown_marble || 0, color: 'hsl(35, 90%, 52%)' }
  ];

  const handleEditClick = (task) => {
    if ((user.role !== 'admin' && user.role !== 'super_admin') || task.is_manual === 0) return;
    setEditingTask(task.id);
    setTempCompleted({ ...tempCompleted, [task.id]: task.completed_quantity ?? 0 });
    setTempProgress({ ...tempProgress, [task.id]: task.progress_percent });
    setTempNotes({ ...tempNotes, [task.id]: task.notes || '' });
  };

  const handleSaveClick = async (taskId) => {
    setSavingId(taskId);
    try {
      const progress = parseFloat(tempProgress[taskId]);
      const completed = parseFloat(tempCompleted[taskId]);
      const notes = tempNotes[taskId];

      await onUpdateProgress(taskId, progress, notes, completed);
      setEditingTask(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(false);
    }
  };

  const handleCompletedChange = (task, val) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = 0;
    if (num < 0) num = 0;
    if (num > task.total_quantity) num = task.total_quantity;
    
    setTempCompleted({
      ...tempCompleted,
      [task.id]: num
    });

    // Dynamically calculate progress percent from completed quantity
    const pct = parseFloat(((num / task.total_quantity) * 100).toFixed(2));
    setTempProgress({
      ...tempProgress,
      [task.id]: pct
    });
  };

  const handleProgressChange = (taskId, val) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = 0;
    if (num < 0) num = 0;
    if (num > 100) num = 100;
    setTempProgress({
      ...tempProgress,
      [taskId]: num
    });
  };

  const handleNotesChange = (taskId, val) => {
    setTempNotes({
      ...tempNotes,
      [taskId]: val
    });
  };

  const textDirectionStyle = {
    textAlign: lang === 'ar' ? 'right' : 'left'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const handlePrintProgressReport = () => {
    let rows = '';
    categories.forEach(cat => {
      const catTasks = tasks.filter(t => t.category_name === cat.name);
      if (catTasks.length === 0) return;
      rows += `<tr style="background:#f1f5f9;font-weight:bold"><td colspan="6">${cat.name}</td></tr>`;
      catTasks.forEach(task => {
        rows += `<tr>
          <td>${task.name}</td>
          <td style="text-align:center">${task.total_quantity || '-'}</td>
          <td style="text-align:center">${task.completed_quantity || '-'}</td>
          <td style="text-align:center">${task.total_quantity ? (task.total_quantity - task.completed_quantity).toFixed(2) : '-'}</td>
          <td style="text-align:center;font-weight:bold;direction:ltr">${task.progress_percent.toFixed(2)}%</td>
          <td>${task.notes || ''}</td>
        </tr>`;
      });
    });

    const html = `<!DOCTYPE html>
<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8"/>
  <title>الجدول العام لتقدم العمل</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Cairo', sans-serif; padding: 20px; color: #1e293b; }
    h1 { text-align: center; color: #0f172a; margin-bottom: 5px; }
    h3 { text-align: center; color: #475569; margin-top: 0; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
    th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: ${lang === 'ar' ? 'right' : 'left'}; }
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
  <div style="text-align: left; margin-bottom: 10px; font-weight: bold;">تاريخ الإصدار: ${new Date().toLocaleDateString('en-GB')}</div>
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
    <tbody>${rows}</tbody>
  </table>
  <div class="print-footer">
    <div class="signature-block">المهندس المقيم<br/><br/>.......................</div>
    <div class="signature-block">مدير المشروع<br/><br/>.......................</div>
  </div>
  <script>window.onload = function() { setTimeout(() => { window.print(); window.close(); }, 500); }</script>
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
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="cyber-dashboard"
    >
      <DashboardBento kpis={kpis} tasks={tasks} lang={lang} />
      
      {/* 1. KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
      {/* Card 1: Overall progress */}
      <motion.div variants={itemVariants} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1.5rem',
        borderRadius: '1.5rem',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-1)', borderRadius: '1rem', border: '1px solid var(--border-soft)', color: 'var(--success)' }}>
            <Award size={20} />
          </div>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--fg-2)' }}>{t('kpiProgressTitle')}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: 'var(--fg)' }}>{kpis.overall_progress_percent}%</span>
        </div>
        <div style={{ height: '6px', width: '100%', background: 'var(--bg-1)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--success)', width: `${kpis.overall_progress_percent}%`, borderRadius: '999px' }} />
        </div>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 500 }}>{t('kpiProgressSubtext')}</span>
      </motion.div>

      {/* Card 2: Marble pieces */}
      <motion.div variants={itemVariants} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1.5rem',
        borderRadius: '1.5rem',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-1)', borderRadius: '1rem', border: '1px solid var(--border-soft)', color: 'var(--accent)' }}>
            <Layers size={20} />
          </div>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--fg-2)' }}>{t('kpiMarbleTitle')}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: 'var(--fg)' }}>
            {kpis.applied_marble_pieces.toLocaleString()}
          </span>
        </div>
        <div style={{ height: '6px', width: '100%' }}></div> {/* Spacer to match height */}
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 500, marginTop: 'auto' }}>{t('kpiMarbleSubtext')}</span>
      </motion.div>

      {/* Card 3: Skylight progress */}
      <motion.div variants={itemVariants} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1.5rem',
        borderRadius: '1.5rem',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-1)', borderRadius: '1rem', border: '1px solid var(--border-soft)', color: 'var(--success)' }}>
            <CheckCircle2 size={20} />
          </div>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--fg-2)' }}>{t('kpiSkylightTitle')}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: 'var(--fg)' }}>{kpis.skylight_progress_percent}%</span>
        </div>
        <div style={{ height: '6px', width: '100%', background: 'var(--bg-1)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--success)', width: `100%`, borderRadius: '999px' }} />
        </div>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 500 }}>{t('kpiSkylightSubtext')}</span>
      </motion.div>

      {/* Card 4: Nazalat progress */}
      <motion.div variants={itemVariants} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1.5rem',
        borderRadius: '1.5rem',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-1)', borderRadius: '1rem', border: '1px solid var(--border-soft)', color: '#f59e0b' }}>
            <Clock size={20} />
          </div>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--fg-2)' }}>{t('kpiNazalatTitle')}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: 'var(--fg)' }}>{kpis.nazalat_progress_percent}%</span>
        </div>
        <div style={{ height: '6px', width: '100%', background: 'var(--bg-1)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#f59e0b', width: `${kpis.nazalat_progress_percent}%`, borderRadius: '999px' }} />
        </div>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 500 }}>
          {t('kpiNazalatSubtext').replace('{completed}', kpis.nazalat_completed).replace('{total}', kpis.nazalat_total)}
        </span>
      </motion.div>
      </div>

      {/* 2. Charts Visual Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>

      {/* Chart 1: Progress Comparison — full-width, taller, labelled bars */}
      <motion.div variants={itemVariants} style={{
        background: 'var(--surface)',
        borderRadius: '2rem',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--fg)' }}>
          <TrendingUp size={18} style={{ color: 'var(--accent)' }} />
          {t('chartProgressTitle')}
        </h3>
        <div ref={chartContainerRef} style={{ width: '100%' }}>
          {(() => {
            const isMobile = chartContainerWidth < 480;
            // On mobile: narrower YAxis so bars have room; hide right labels (tooltip covers it)
            const yAxisWidth = isMobile
              ? Math.min(120, Math.floor(chartContainerWidth * 0.38))
              : lang === 'ar' ? 200 : 180;
            const rightMargin = isMobile ? 8 : 56;
            const barHeight = isMobile ? 20 : 18;
            const yFontSize = isMobile ? 10 : 11.5;
            const showLabel = !isMobile;
            return (
              <ResponsiveContainer width="100%" height={chartData.length * (isMobile ? 44 : 48) + 40}>
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 4, right: rightMargin, left: 0, bottom: 4 }}
                  barCategoryGap="28%"
                >
                  <CartesianGrid strokeDasharray="4 4" stroke="var(--border-soft)" horizontal={false} vertical={true} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    stroke="var(--border)"
                    tick={{ fontSize: isMobile ? 9 : 11, fill: 'var(--muted)', fontFamily: lang === 'ar' ? 'var(--font-arabic)' : 'var(--font-english)' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}%`}
                    ticks={isMobile ? [0, 25, 50, 75, 100] : [0, 25, 50, 75, 100]}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="transparent"
                    tick={{ fontSize: yFontSize, fontFamily: lang === 'ar' ? 'var(--font-arabic)' : 'var(--font-english)', fill: 'var(--fg)', fontWeight: 500 }}
                    width={yAxisWidth}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => {
                      if (isMobile && v.length > 10) return v.slice(0, 9) + '…';
                      return v;
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    contentStyle={{
                      background: 'var(--surface-solid)',
                      backdropFilter: 'blur(12px)',
                      borderColor: 'var(--border)',
                      color: 'var(--fg)',
                      textAlign: lang === 'ar' ? 'right' : 'left',
                      fontFamily: lang === 'ar' ? 'var(--font-arabic)' : 'var(--font-english)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                    }}
                    itemStyle={{ color: 'var(--fg)' }}
                    labelStyle={{ color: 'var(--fg)', fontWeight: 700 }}
                    formatter={(value) => [`${value}%`, lang === 'ar' ? 'نسبة الإنجاز' : 'Progress']}
                  />
                  <Bar
                    dataKey={lang === 'ar' ? 'نسبة الإنجاز %' : 'Progress %'}
                    radius={[0, 6, 6, 0]}
                    barSize={barHeight}
                    label={showLabel ? {
                      position: 'right',
                      formatter: (v) => `${v}%`,
                      fill: 'var(--fg-2)',
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                    } : false}
                  >
                    {chartData.map((entry, index) => {
                      const val = entry[lang === 'ar' ? 'نسبة الإنجاز %' : 'Progress %'];
                      const pct = val / 100;
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={val === 100
                            ? '#10b981'
                            : val >= 75
                              ? `rgba(16,185,129,${0.55 + pct * 0.4})`
                              : val >= 40
                                ? `rgba(16,185,129,${0.35 + pct * 0.3})`
                                : 'rgba(16,185,129,0.35)'}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            );
          })()}
        </div>
      </motion.div>

      {/* Chart 2: Marble Status Donut — larger ring, centered label, side-by-side legend */}
      <motion.div variants={itemVariants} style={{
        background: 'var(--surface)',
        borderRadius: '2rem',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--fg)' }}>
          <Building2 size={18} style={{ color: 'var(--accent)' }} />
          {t('chartMarbleTitle')}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Donut */}
          <div style={{ position: 'relative', width: 'min(220px, 75vw)', height: 'min(220px, 75vw)', flexShrink: 0, margin: '0 auto' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
              <Pie
                data={marbleChartData}
                cx="50%"
                cy="50%"
                innerRadius={72}
                outerRadius={108}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
                startAngle={90}
                endAngle={-270}
              >
                {marbleChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${value.toLocaleString()} ${t('pieces')}`}
                contentStyle={{
                  background: 'var(--surface-solid)',
                  backdropFilter: 'blur(12px)',
                  borderColor: 'var(--border)',
                  color: 'var(--fg)',
                  fontFamily: lang === 'ar' ? 'var(--font-arabic)' : 'var(--font-english)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                }}
                itemStyle={{ color: 'var(--fg)' }}
                labelStyle={{ color: 'var(--fg)', fontWeight: 700 }}
              />
            </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--fg)', lineHeight: 1 }}>
                {kpis.applied_marble_pieces?.toLocaleString() || '0'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '4px', fontFamily: lang === 'ar' ? 'var(--font-arabic)' : 'var(--font-english)' }}>
                {t('pieces')}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1, minWidth: 'min(220px, 100%)' }}>
            {marbleChartData.map((entry, index) => {
              const total = marbleChartData.reduce((s, e) => s + e.value, 0);
              const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0.0';
              return (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '4px',
                        background: entry.color,
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--fg)' }}>{entry.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--fg)' }}>{entry.value.toLocaleString()}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{pct}%</span>
                    </div>
                  </div>
                  {/* Progress bar per color */}
                  <div style={{ height: '6px', width: '100%', background: 'var(--bg-3, rgba(255,255,255,0.07))', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: entry.color,
                      borderRadius: '999px',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              );
            })}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--fg)' }}>{t('chartTotalApplied')}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)' }}>{kpis.applied_marble_pieces?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </motion.div>

      </div>

      {/* 3. General Project Progress Table */}
      <motion.div variants={itemVariants} style={{
        background: 'var(--surface)',
        borderRadius: '2.5rem',
        border: '1px solid var(--border)',
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.03)',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', margin: 0, flex: '1 1 250px' }}>
            <Grid size={20} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '4px' }} />
            <span style={{ lineHeight: '1.4' }}>{t('tableTitle')}</span>
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 auto', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {(user.role === 'admin' || user.role === 'super_admin') && (
              <span style={{ fontSize: '0.8rem', color: 'var(--accent)', textAlign: 'right' }}>
                {t('tableInstruction')}
              </span>
            )}
            <button
              onClick={handlePrintProgressReport}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.2)', flexShrink: 0 }}
            >
              <Printer size={18} />
              {lang === 'ar' ? 'طباعة / تصدير PDF' : 'Print PDF'}
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="project-table" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
            <thead>
              <tr>
                <th style={{ width: '18%', ...textDirectionStyle }}>{t('colCategory')}</th>
                <th style={{ width: '22%', ...textDirectionStyle }}>{t('colTask')}</th>
                <th style={{ width: '12%', textAlign: 'center' }}>{t('colTotalQty')}</th>
                <th style={{ width: '12%', textAlign: 'center' }}>{t('colCompleted')}</th>
                <th style={{ width: '12%', textAlign: 'center' }}>{t('colRemaining')}</th>
                <th style={{ width: '12%', textAlign: 'center' }}>{t('colProgress')}</th>
                <th style={{ width: '20%', ...textDirectionStyle }}>{t('colNotes')}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const catTasks = groupedTasks[cat.name] || [];
                return (
                  <React.Fragment key={cat.id}>
                    {/* Category Title Header Row */}
                    <tr className="category-header-row">
                      <td colSpan="7" style={{ padding: '0.75rem 1rem', ...textDirectionStyle }}>
                        {translateText(cat.name, lang)}
                      </td>
                    </tr>

                    {/* Tasks belonging to this category */}
                    {catTasks.map((task) => {
                      const isEditing = editingTask === task.id;
                      const progressVal = isEditing ? tempProgress[task.id] : task.progress_percent;
                      const notesVal = isEditing ? tempNotes[task.id] : (task.notes || '');

                      // Calculate displays
                      const hasQty = task.total_quantity !== null && task.total_quantity > 0;
                      const unitTrans = translateText(task.unit, lang);
                      const qtyDisplay = hasQty ? `${task.total_quantity.toLocaleString()} ${unitTrans}` : '-';
                      
                      let compDisplay = '-';
                      let pendDisplay = '-';
                      
                      if (hasQty) {
                        if (task.name === 'تطبيك النزلات (محدث تلقائياً)' && task.is_manual === 0) {
                          compDisplay = `${kpis.nazalat_completed} ${unitTrans}`;
                          pendDisplay = `${kpis.nazalat_total - kpis.nazalat_completed} ${unitTrans}`;
                        } else {
                          compDisplay = `${task.completed_quantity.toLocaleString()} ${unitTrans}`;
                          pendDisplay = `${(task.total_quantity - task.completed_quantity).toLocaleString()} ${unitTrans}`;
                        }
                      }

                      return (
                        <tr 
                          key={task.id} 
                          onClick={() => !isEditing && handleEditClick(task)}
                          style={{ cursor: ((user.role === 'admin' || user.role === 'super_admin') && task.is_manual) ? 'pointer' : 'default' }}
                        >
                          <td style={{ color: 'var(--muted)', fontSize: '0.85rem', ...textDirectionStyle }}>
                            {translateText(cat.name, lang)}
                          </td>
                          <td style={{ fontWeight: '600', ...textDirectionStyle }}>
                            {translateText(task.name, lang)}
                            {!task.is_manual && (
                              <span style={{ 
                                fontSize: '0.7rem', 
                                color: 'var(--accent)', 
                                marginRight: lang === 'ar' ? '5px' : '0', 
                                marginLeft: lang === 'en' ? '5px' : '0', 
                                padding: '1px 5px', 
                                border: '1px solid var(--accent)', 
                                borderRadius: '3px' 
                              }}>
                                {t('badgeAuto')}
                              </span>
                            )}
                          </td>
                          <td className="tabular-nums" style={{ textAlign: 'center' }}>{qtyDisplay}</td>
                          <td className="tabular-nums" style={{ textAlign: 'center' }}>
                            {isEditing && hasQty ? (
                              <div onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="number"
                                  className="input-number"
                                  value={tempCompleted[task.id] !== undefined ? tempCompleted[task.id] : (task.completed_quantity ?? 0)}
                                  onChange={(e) => handleCompletedChange(task, e.target.value)}
                                  step="any"
                                  min="0"
                                  max={task.total_quantity}
                                  disabled={savingId === task.id}
                                  style={{ width: '85px', padding: '0.2rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--fg)' }}
                                />
                              </div>
                            ) : (
                              compDisplay
                            )}
                          </td>
                          <td className="tabular-nums" style={{ textAlign: 'center' }}>
                            {isEditing && hasQty ? (
                              `${(task.total_quantity - (tempCompleted[task.id] !== undefined ? tempCompleted[task.id] : (task.completed_quantity ?? 0))).toLocaleString()} ${unitTrans}`
                            ) : (
                              pendDisplay
                            )}
                          </td>
                          <td className="tabular-nums" style={{ textAlign: 'center' }}>
                            {isEditing ? (
                              hasQty ? (
                                <span className="tabular-nums" style={{ fontWeight: '700' }}>
                                  {(tempProgress[task.id] !== undefined ? tempProgress[task.id] : task.progress_percent).toFixed(2)}%
                                </span>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="number"
                                    className="input-number"
                                    value={progressVal}
                                    onChange={(e) => handleProgressChange(task.id, e.target.value)}
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    disabled={savingId === task.id}
                                    style={{ width: '75px' }}
                                  />
                                  <span style={{ fontSize: '0.9rem' }}>%</span>
                                </div>
                              )
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                <span className="tabular-nums" style={{ fontWeight: '700', color: task.progress_percent === 100 ? 'var(--success)' : 'var(--fg)' }}>
                                  {task.progress_percent.toFixed(2)}%
                                </span>
                                <div className="progress-bar-container" style={{ width: '70px', height: '4px' }}>
                                  <div 
                                    className={`progress-bar-fill ${task.progress_percent === 100 ? 'success' : ''}`}
                                    style={{ width: `${task.progress_percent}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="notes-cell" style={textDirectionStyle}>
                            {isEditing ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  className="notes-input"
                                  value={notesVal}
                                  onChange={(e) => handleNotesChange(task.id, e.target.value)}
                                  placeholder={t('enterNotes')}
                                  disabled={savingId === task.id}
                                  style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)', color: 'var(--fg)' }}
                                />
                                <button
                                  onClick={() => handleSaveClick(task.id)}
                                  className="btn btn-primary"
                                  style={{ padding: '0.3rem', borderRadius: '4px' }}
                                  disabled={savingId === task.id}
                                >
                                  <Save size={14} />
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
                                <MessageSquare size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                                <span>{translateText(task.notes, lang) || '-'}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

    </motion.div>
  );
}
