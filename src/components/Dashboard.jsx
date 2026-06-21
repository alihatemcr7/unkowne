import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Percent, 
  Layers, 
  Grid, 
  HelpCircle,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Save,
  MessageSquare
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Dashboard({ kpis, tasks, categories, user, onUpdateProgress, onUpdateNotes, t, lang, translateText }) {
  const [editingTask, setEditingTask] = useState(null);
  const [tempProgress, setTempProgress] = useState({});
  const [tempCompleted, setTempCompleted] = useState({});
  const [tempNotes, setTempNotes] = useState({});
  const [savingId, setSavingId] = useState(null);

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

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      
      {/* 1. KPI Cards */}
      <div className="kpi-container">
        
        {/* Card 1: Overall progress */}
        <motion.div variants={itemVariants} className="kpi-card glass-panel success">
          <div className="kpi-details">
            <span className="kpi-title">{t('kpiProgressTitle')}</span>
            <span className="kpi-value">{kpis.overall_progress_percent}%</span>
            <div className="progress-bar-container" style={{ marginTop: '8px', width: '150px' }}>
              <div 
                className="progress-bar-fill success" 
                style={{ width: `${kpis.overall_progress_percent}%` }}
              ></div>
            </div>
            <span className="kpi-subtext" style={{ marginTop: '4px' }}>{t('kpiProgressSubtext')}</span>
          </div>
          <div className="kpi-icon-container" style={{ background: 'var(--success)', color: 'white' }}>
            <Award size={26} />
          </div>
        </motion.div>

        {/* Card 2: Marble pieces */}
        <motion.div variants={itemVariants} className="kpi-card glass-panel">
          <div className="kpi-details">
            <span className="kpi-title">{t('kpiMarbleTitle')}</span>
            <span className="kpi-value">
              {kpis.applied_marble_pieces.toLocaleString()}
            </span>
            <span className="kpi-subtext" style={{ marginTop: '8px' }}>
              {t('kpiMarbleSubtext')}
            </span>
          </div>
          <div className="kpi-icon-container">
            <Layers size={26} />
          </div>
        </motion.div>

        {/* Card 3: Skylight progress */}
        <motion.div variants={itemVariants} className="kpi-card glass-panel success">
          <div className="kpi-details">
            <span className="kpi-title">{t('kpiSkylightTitle')}</span>
            <span className="kpi-value">{kpis.skylight_progress_percent}%</span>
            <div className="progress-bar-container" style={{ marginTop: '8px', width: '150px' }}>
              <div 
                className="progress-bar-fill success" 
                style={{ width: '100%' }}
              ></div>
            </div>
            <span className="kpi-subtext" style={{ marginTop: '4px' }}>{t('kpiSkylightSubtext')}</span>
          </div>
          <div className="kpi-icon-container" style={{ background: 'var(--success)', color: 'white' }}>
            <CheckCircle2 size={26} />
          </div>
        </motion.div>

        {/* Card 4: Nazalat progress */}
        <motion.div variants={itemVariants} className="kpi-card glass-panel pending">
          <div className="kpi-details">
            <span className="kpi-title">{t('kpiNazalatTitle')}</span>
            <span className="kpi-value">{kpis.nazalat_progress_percent}%</span>
            <div className="progress-bar-container" style={{ marginTop: '8px', width: '150px' }}>
              <div 
                className="progress-bar-fill warning" 
                style={{ width: `${kpis.nazalat_progress_percent}%` }}
              ></div>
            </div>
            <span className="kpi-subtext" style={{ marginTop: '4px' }}>
              {t('kpiNazalatSubtext')
                .replace('{completed}', kpis.nazalat_completed)
                .replace('{total}', kpis.nazalat_total)}
            </span>
          </div>
          <div className="kpi-icon-container" style={{ background: 'var(--warn)', color: 'white' }}>
            <Clock size={26} />
          </div>
        </motion.div>

      </div>

      {/* 2. Charts Visual Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Chart 1: Progress Comparison */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ height: '420px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--accent)' }} />
            {t('chartProgressTitle')}
          </h3>
          <div style={{ flex: 1, minHeight: 0, width: '100%', minWidth: 0, overflow: 'hidden' }}>
            <ResponsiveContainer width="100%" height={340} minWidth={0}>
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 10, right: 15, left: 15, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35}/>
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.95}/>
                  </linearGradient>
                  <linearGradient id="successGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35}/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.95}/>
                  </linearGradient>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="1" dy="1" stdDeviation="3" floodOpacity="0.4" floodColor="#f59e0b" />
                  </filter>
                  <filter id="successShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="1" dy="1" stdDeviation="3" floodOpacity="0.4" floodColor="#10b981" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" horizontal={false} />
                <XAxis 
                  type="number"
                  domain={[0, 100]}
                  stroke="var(--border)"
                  tick={{ fontSize: 9.5, fill: 'var(--muted)', fontFamily: lang === 'ar' ? 'var(--font-arabic)' : 'var(--font-english)' }}
                  tickLine={false}
                />
                <YAxis 
                  type="category"
                  dataKey="name" 
                  stroke="var(--border)" 
                  tick={{ fontSize: 8, fontFamily: lang === 'ar' ? 'var(--font-arabic)' : 'var(--font-english)', fill: 'var(--fg-2)' }}
                  width={100}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--surface-warm)', 
                    backdropFilter: 'blur(8px)',
                    borderColor: 'var(--border)', 
                    color: 'var(--fg)', 
                    textAlign: lang === 'ar' ? 'right' : 'left', 
                    fontFamily: lang === 'ar' ? 'var(--font-arabic)' : 'var(--font-english)', 
                    borderRadius: 'var(--radius-sm)' 
                  }}
                />
                <Bar 
                  dataKey={lang === 'ar' ? 'نسبة الإنجاز %' : 'Progress %'} 
                  radius={lang === 'ar' ? [4, 0, 0, 4] : [0, 4, 4, 0]}
                  barSize={12}
                >
                  {chartData.map((entry, index) => {
                    const is100 = entry[lang === 'ar' ? 'نسبة الإنجاز %' : 'Progress %'] === 100;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={is100 ? 'url(#successGradient)' : 'url(#progressGradient)'} 
                        filter={is100 ? 'url(#successShadow)' : 'url(#shadow)'}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart 2: Marble Status Distribution */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ height: '420px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} style={{ color: 'var(--accent)' }} />
            {t('chartMarbleTitle')}
          </h3>
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ width: '200px', height: '200px', minWidth: 0 }}>
              <PieChart width={200} height={200}>
                <defs>
                  <linearGradient id="whiteMarbleGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity={0.95}/>
                    <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.8}/>
                  </linearGradient>
                  <linearGradient id="brownMarbleGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.95}/>
                    <stop offset="100%" stopColor="#b45309" stopOpacity={0.8}/>
                  </linearGradient>
                  <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.4" floodColor="#000000" />
                  </filter>
                </defs>
                <Pie
                  data={marbleChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {marbleChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? 'url(#whiteMarbleGrad)' : 'url(#brownMarbleGrad)'} 
                      filter="url(#pieShadow)"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${value.toLocaleString()} ${t('pieces')}`}
                  contentStyle={{ 
                    background: 'var(--surface-warm)', 
                    backdropFilter: 'blur(8px)',
                    borderColor: 'var(--border)', 
                    color: 'var(--fg)', 
                    textAlign: lang === 'ar' ? 'right' : 'left', 
                    fontFamily: lang === 'ar' ? 'var(--font-arabic)' : 'var(--font-english)', 
                    borderRadius: 'var(--radius-sm)' 
                  }}
                />
              </PieChart>
            </div>
            
            {/* Custom Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', paddingRight: '1rem', paddingLeft: '1rem' }}>
              {marbleChartData.map((entry, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '3px', 
                    background: index === 0 
                      ? 'linear-gradient(135deg, #ffffff, #94a3b8)' 
                      : 'linear-gradient(135deg, #fbbf24, #b45309)', 
                    border: '1px solid var(--border)' 
                  }}></div>
                  <span style={{ color: 'var(--muted)' }}>{entry.name}:</span>
                  <span style={{ fontWeight: '700', fontFamily: 'var(--font-english)' }}>{entry.value.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.5rem', paddingTop: '0.5rem', fontWeight: '700' }}>
                <span>{t('chartTotalApplied')}</span>
                <span style={{ color: 'var(--accent)' }}>{kpis.applied_marble_pieces.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* 3. General Project Progress Table */}
      <motion.div variants={itemVariants} className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Grid size={20} style={{ color: 'var(--accent)' }} />
            {t('tableTitle')}
          </h3>
          {(user.role === 'admin' || user.role === 'super_admin') && (
            <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>
              {t('tableInstruction')}
            </span>
          )}
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
                          <td style={{ textAlign: 'center', fontFamily: 'var(--font-english)' }}>{qtyDisplay}</td>
                          <td style={{ textAlign: 'center', fontFamily: 'var(--font-english)' }}>
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
                          <td style={{ textAlign: 'center', fontFamily: 'var(--font-english)' }}>
                            {isEditing && hasQty ? (
                              `${(task.total_quantity - (tempCompleted[task.id] !== undefined ? tempCompleted[task.id] : (task.completed_quantity ?? 0))).toLocaleString()} ${unitTrans}`
                            ) : (
                              pendDisplay
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {isEditing ? (
                              hasQty ? (
                                <span style={{ fontWeight: '700' }}>
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
                                <span style={{ fontWeight: '700', color: task.progress_percent === 100 ? 'var(--success)' : 'var(--fg)' }}>
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
