import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, CheckCircle2, AlertCircle, Edit, Save } from 'lucide-react';

export default function MaterialsReport({ marble, nazalat, user, onUpdateMarbleStatus, t, lang, translateText }) {
  const [editingId, setEditingId] = useState(null);
  const [tempStatus, setTempStatus] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [tempWhite, setTempWhite] = useState('');
  const [tempBrown, setTempBrown] = useState('');

  // Group by Zone
  const zones = ['Zone A', 'Zone B', 'Zone C'];

  // Calculate totals
  let totalWhite = 0;
  let totalBrown = 0;

  marble.forEach(item => {
    totalWhite += item.white_qty || 0;
    totalBrown += item.brown_qty || 0;
  });

  const grandTotal = totalWhite + totalBrown;

  const handleEditClick = (item) => {
    if (user.role !== 'admin' && user.role !== 'super_admin') return;
    setEditingId(item.id);
    setTempStatus(item.status || '');
    setTempWhite(item.white_qty !== null ? String(item.white_qty) : '');
    setTempBrown(item.brown_qty !== null ? String(item.brown_qty) : '');
  };

  const handleSaveClick = async (id) => {
    setSavingId(id);
    try {
      const whiteVal = tempWhite === '' ? null : parseInt(tempWhite, 10);
      const brownVal = tempBrown === '' ? null : parseInt(tempBrown, 10);
      await onUpdateMarbleStatus(id, tempStatus, whiteVal, brownVal);
      setEditingId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
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
      
      {/* 1. Marble Summary Cards */}
      <div className="marble-summary-cards">
        
        {/* White Alabaster */}
        <motion.div variants={itemVariants} className="glass-panel marble-summary-card" style={{ borderLeft: lang === 'ar' ? '3px solid #eef2f7' : 'none', borderRight: lang === 'en' ? '3px solid #eef2f7' : 'none' }}>
          <span className="kpi-title">{t('marbleWhiteTitle')}</span>
          <span className="kpi-value" style={{ fontSize: '1.75rem', color: '#eef2f7' }}>
            {totalWhite.toLocaleString()}
          </span>
          <div style={{ fontSize: '0.85rem', color: '#ccc', marginTop: '4px', fontWeight: 'bold' }}>
            {lang === 'ar' 
              ? `سيكبة: ${Math.floor(totalWhite / 198).toLocaleString()} (السيكبة 198 قطعة) | مفرط: ${totalWhite % 198}` 
              : `Pallets: ${Math.floor(totalWhite / 198).toLocaleString()} (198 pcs/pallet) | Loose: ${totalWhite % 198}`}
          </div>
          <span className="kpi-subtext" style={{ marginTop: '8px' }}>
            {lang === 'ar' ? 'إجمالي القطع البيضاء المطبقة ميدانياً' : 'Total white pieces applied in the field'}
          </span>
        </motion.div>

        {/* Brown Alabaster */}
        <motion.div variants={itemVariants} className="glass-panel marble-summary-card" style={{ borderLeft: lang === 'ar' ? '3px solid var(--accent)' : 'none', borderRight: lang === 'en' ? '3px solid var(--accent)' : 'none' }}>
          <span className="kpi-title">{t('marbleBrownTitle')}</span>
          <span className="kpi-value" style={{ fontSize: '1.75rem', color: 'var(--accent)' }}>
            {totalBrown.toLocaleString()}
          </span>
          <div style={{ fontSize: '0.85rem', color: '#ccc', marginTop: '4px', fontWeight: 'bold' }}>
            {lang === 'ar' 
              ? `سيكبة: ${Math.floor(totalBrown / 198).toLocaleString()} (السيكبة 198 قطعة) | مفرط: ${totalBrown % 198}` 
              : `Pallets: ${Math.floor(totalBrown / 198).toLocaleString()} (198 pcs/pallet) | Loose: ${totalBrown % 198}`}
          </div>
          <span className="kpi-subtext" style={{ marginTop: '8px' }}>
            {lang === 'ar' ? 'إجمالي القطع الجوزية المطبقة ميدانياً' : 'Total brown pieces applied in the field'}
          </span>
        </motion.div>

        {/* Combined Grand Total */}
        <motion.div variants={itemVariants} className="glass-panel marble-summary-card" style={{ borderLeft: lang === 'ar' ? '3px solid var(--success)' : 'none', borderRight: lang === 'en' ? '3px solid var(--success)' : 'none' }}>
          <span className="kpi-title">{t('marbleTotalTitle')}</span>
          <span className="kpi-value" style={{ fontSize: '1.75rem', color: 'var(--success)' }}>
            {grandTotal.toLocaleString()}
          </span>
          <div style={{ fontSize: '0.85rem', color: '#ccc', marginTop: '4px', fontWeight: 'bold' }}>
            {lang === 'ar' 
              ? `سيكبة: ${Math.floor(grandTotal / 198).toLocaleString()} (السيكبة 198 قطعة) | مفرط: ${grandTotal % 198}` 
              : `Pallets: ${Math.floor(grandTotal / 198).toLocaleString()} (198 pcs/pallet) | Loose: ${grandTotal % 198}`}
          </div>
          <span className="kpi-subtext" style={{ marginTop: '8px' }}>
            {lang === 'ar' ? 'المجموع الكلي لقطع المرمر المطبقة' : 'Grand total of applied marble pieces'}
          </span>
        </motion.div>

      </div>

      {/* 2. Detailed Distribution Table */}
      <motion.div variants={itemVariants} className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem', width: '100%' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={20} style={{ color: 'var(--accent)' }} />
              {t('tableMaterialsTitle')}
            </h3>
            {(user.role === 'admin' || user.role === 'super_admin') && (
              <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>
                {t('tableMaterialsInstruction')}
              </span>
            )}
          </div>

          <div className="table-responsive" style={{ width: '100%' }}>
            <table className="project-table" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
              <thead>
                <tr>
                  <th style={{ width: '15%', ...textDirectionStyle }}>{t('colZoneName')}</th>
                  <th style={{ width: '25%', ...textDirectionStyle }}>{t('colTaskNature')}</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>{t('colWhiteQty')}</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>{t('colBrownQty')}</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>{t('colTotal')}</th>
                  <th style={{ width: '24%', ...textDirectionStyle }}>{t('colFieldStatus')}</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zoneName) => {
                  const zoneItems = marble.filter(item => item.zone === zoneName);
                  
                  // Zone Totals
                  let zoneWhite = 0, zoneBrown = 0;
                  zoneItems.forEach(item => {
                    zoneWhite += item.white_qty || 0;
                    zoneBrown += item.brown_qty || 0;
                  });

                  return (
                    <React.Fragment key={zoneName}>
                      {/* Zone Header Row */}
                      <tr className="category-header-row" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <td colSpan="2" style={{ fontWeight: '800', ...textDirectionStyle }}>
                          {lang === 'ar' ? zoneName.replace('Zone', 'المنطقة') : zoneName}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: '800', fontFamily: 'var(--font-english)' }}>
                          {zoneWhite > 0 ? zoneWhite.toLocaleString() : '-'}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: '800', fontFamily: 'var(--font-english)' }}>
                          {zoneBrown > 0 ? zoneBrown.toLocaleString() : '-'}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: '800', fontFamily: 'var(--font-english)' }}>
                          {(zoneWhite + zoneBrown) > 0 ? (zoneWhite + zoneBrown).toLocaleString() : '-'}
                        </td>
                        <td></td>
                      </tr>

                      {/* Zone Detail Rows */}
                      {zoneItems.map((item) => {
                        const hasQty = item.white_qty !== null || item.brown_qty !== null;
                        const whiteDisplay = item.white_qty !== null ? item.white_qty.toLocaleString() : '-';
                        const brownDisplay = item.brown_qty !== null ? item.brown_qty.toLocaleString() : '-';
                        const totalDisplay = hasQty ? ((item.white_qty || 0) + (item.brown_qty || 0)).toLocaleString() : '-';
                        
                        const isEditing = editingId === item.id;

                        return (
                          <tr 
                            key={item.id}
                            onClick={() => !isEditing && handleEditClick(item)}
                            style={{ cursor: (user.role === 'admin' || user.role === 'super_admin') ? 'pointer' : 'default' }}
                          >
                            <td style={{ color: 'var(--muted)', fontSize: '0.85rem', ...textDirectionStyle }}>
                              {lang === 'ar' ? item.zone.replace('Zone', 'المنطقة') : item.zone}
                            </td>
                            <td style={{ fontWeight: '500', ...textDirectionStyle }}>
                              {translateText(item.task_name, lang)}
                            </td>
                            <td style={{ textAlign: 'center', fontFamily: 'var(--font-english)' }}>
                              {isEditing ? (
                                <input
                                  type="number"
                                  className="input-number"
                                  value={tempWhite}
                                  onChange={(e) => setTempWhite(e.target.value)}
                                  disabled={savingId === item.id}
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ width: '70px', padding: '0.2rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--fg)', fontFamily: 'var(--font-english)' }}
                                />
                              ) : (
                                whiteDisplay
                              )}
                            </td>
                            <td style={{ textAlign: 'center', fontFamily: 'var(--font-english)' }}>
                              {isEditing ? (
                                <input
                                  type="number"
                                  className="input-number"
                                  value={tempBrown}
                                  onChange={(e) => setTempBrown(e.target.value)}
                                  disabled={savingId === item.id}
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ width: '70px', padding: '0.2rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--fg)', fontFamily: 'var(--font-english)' }}
                                />
                              ) : (
                                brownDisplay
                              )}
                            </td>
                            <td style={{ textAlign: 'center', fontFamily: 'var(--font-english)', fontWeight: '600' }}>
                              {isEditing ? (
                                ((parseInt(tempWhite, 10) || 0) + (parseInt(tempBrown, 10) || 0)).toLocaleString()
                              ) : (
                                totalDisplay
                              )}
                            </td>
                            <td style={textDirectionStyle}>
                              {isEditing ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="text"
                                    className="notes-input"
                                    value={tempStatus}
                                    onChange={(e) => setTempStatus(e.target.value)}
                                    placeholder={t('enterFieldStatus')}
                                    disabled={savingId === item.id}
                                    style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)', fontSize: '0.85rem', color: 'var(--fg)' }}
                                  />
                                  <button
                                    onClick={() => handleSaveClick(item.id)}
                                    className="btn btn-primary"
                                    style={{ padding: '0.3rem', borderRadius: '4px' }}
                                    disabled={savingId === item.id}
                                  >
                                    <Save size={14} />
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                  {item.status && (item.status.includes('مكتمل') || item.status.includes('Completed') || item.status.includes('مستقر')) ? (
                                    <CheckCircle2 size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                                  ) : (
                                    <AlertCircle size={14} style={{ color: 'var(--warn)', flexShrink: 0 }} />
                                  )}
                                  <span>{translateText(item.status, lang) || t('notSpecifiedYet')}</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
                
                {/* Grand Cumulative Total Row */}
                <tr style={{ background: 'rgba(255,255,255,0.04)', borderTop: '2px solid var(--border)', fontWeight: '800' }}>
                  <td style={textDirectionStyle}>{t('grandTotalCumulative')}</td>
                  <td style={textDirectionStyle}>{t('allTasksAndZones')}</td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-english)', color: '#eef2f7' }}>
                    {totalWhite.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-english)', color: 'var(--accent)' }}>
                    {totalBrown.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-english)', color: 'var(--success)' }}>
                    {grandTotal.toLocaleString()}
                  </td>
                  <td style={textDirectionStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                      <span>
                        {lang === 'ar' ? 'مسجل ومطبق بالكامل' : 'Fully recorded & applied'}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
      </motion.div>

    </motion.div>
  );
}
