import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

export default function TrackingLogs({ nazalat, user, onToggleNazala, loading, t, lang, translateText }) {
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  // Apply filters
  const filteredNazalat = nazalat.filter((n) => {
    const matchesZone = selectedZone === '' || n.zone === selectedZone;
    const matchesStatus = selectedStatus === '' || n.status === selectedStatus;
    const matchesSearch = searchQuery === '' || n.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesZone && matchesStatus && matchesSearch;
  });

  const handleToggle = async (id) => {
    if (user.role !== 'admin' && user.role !== 'super_admin') return;
    setTogglingId(id);
    try {
      await onToggleNazala(id);
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  const getStats = () => {
    const total = filteredNazalat.length;
    const completed = filteredNazalat.filter(n => n.status === 'منجز').length;
    const pending = total - completed;
    return { total, completed, pending };
  };

  const stats = getStats();

  const textDirectionStyle = {
    textAlign: lang === 'ar' ? 'right' : 'left'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Search and Filter Controls */}
      <div className="filter-bar" style={{ flexDirection: lang === 'ar' ? 'row' : 'row-reverse' }}>
        <div className="filters-group" style={{ flexDirection: lang === 'ar' ? 'row' : 'row' }}>
          
          {/* Search Bar */}
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

          {/* Zone Selector */}
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

          {/* Status Selector */}
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

        {/* Dynamic count summary */}
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
          <div>
            <span style={{ color: 'var(--muted)' }}>{t('statsShowing')}</span>
            <span style={{ fontWeight: '700' }}>{stats.total}</span>
          </div>
          <div>
            <span style={{ color: 'var(--success)' }}>{t('statsCompleted')}</span>
            <span style={{ fontWeight: '700' }}>{stats.completed}</span>
          </div>
          <div>
            <span style={{ color: 'var(--warn)' }}>{t('statsPending')}</span>
            <span style={{ fontWeight: '700' }}>{stats.pending}</span>
          </div>
        </div>
      </div>

      {/* Grid of Nazalat downspouts */}
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
          className="nazalat-grid" 
          style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredNazalat.map((n) => {
            const isCompleted = n.status === 'منجز';
            const isToggling = togglingId === n.id;
            
            return (
              <motion.div variants={itemVariants} key={n.id} className={`nazala-card ${isCompleted ? 'completed' : ''}`}>
                <span className="nazala-code" style={{ color: isCompleted ? 'var(--success)' : 'var(--warn)' }}>
                  {n.code}
                </span>
                <span className="nazala-zone">{lang === 'ar' ? n.zone.replace('Zone', 'المنطقة') : n.zone}</span>
                
                {/* Status indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: isCompleted ? 'var(--success)' : 'var(--warn)' }}>
                  {isCompleted ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  <span>{isCompleted ? t('statusDone') : t('statusPending')}</span>
                </div>

                {/* Toggle control */}
                <button
                  onClick={() => handleToggle(n.id)}
                  disabled={(user.role !== 'admin' && user.role !== 'super_admin') || isToggling}
                  className={`nazala-toggle-btn ${isCompleted ? 'completed' : ''}`}
                >
                  {isToggling 
                    ? t('updating') 
                    : (user.role === 'admin' || user.role === 'super_admin') 
                      ? (isCompleted ? t('btnChangeToPending') : t('btnMarkAsDone')) 
                      : t('btnReadOnly')}
                </button>

                {/* Micro tooltip notes */}
                {n.notes && (
                  <span 
                    style={{ 
                      fontSize: '0.65rem', 
                      color: 'var(--muted)', 
                      marginTop: '4px', 
                      textAlign: 'center', 
                      whiteSpace: 'nowrap', 
                      textOverflow: 'ellipsis', 
                      overflow: 'hidden', 
                      width: '100%' 
                    }} 
                    title={translateText(n.notes, lang)}
                  >
                    {translateText(n.notes, lang)}
                  </span>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

    </div>
  );
}
