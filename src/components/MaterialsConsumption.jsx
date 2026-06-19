import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, Calendar, Clock, User, Save, Trash2, Edit2, 
  Plus, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, FileText, Sparkles
} from 'lucide-react';

const INITIAL_FORM_STATE = {
  date: new Date().toISOString().split('T')[0],
  day: 'الأحد',
  start_time: '08:00',
  end_time: '17:00',
  prepared_by: 'علي حاتم',
  basics: {
    varnish: { pulled: '', remaining: '' },
    granite_granules: { pulled: '', remaining: '' },
    brown_paint: { pulled: '', remaining: '' },
    gray_base: { pulled: '', remaining: '' },
    putty: { pulled: '', remaining: '' },
    primer: { pulled: '', remaining: '' },
    roller: { pulled: '', remaining: '' }
  },
  marble: {
    zone_a: {
      white: { skiliat: '', pieces_per_skilia: '198', loose: '', total: 0 },
      brown: { skiliat: '', pieces_per_skilia: '198', loose: '', total: 0 }
    },
    zone_b: {
      white: { skiliat: '', pieces_per_skilia: '198', loose: '', total: 0 },
      brown: { skiliat: '', pieces_per_skilia: '198', loose: '', total: 0 }
    },
    zone_c: {
      white: { skiliat: '', pieces_per_skilia: '198', loose: '', total: 0 },
      brown: { skiliat: '', pieces_per_skilia: '198', loose: '', total: 0 }
    }
  },
  sealants: {
    beige_paint: { pulled: '', remaining: '' },
    white_paint: { pulled: '', remaining: '' },
    primer: { pulled: '', remaining: '' },
    tape: { pulled: '', remaining: '' },
    sponge_1cm: { pulled: '', remaining: '' },
    sponge_2cm: { pulled: '', remaining: '' },
    sponge_3cm: { pulled: '', remaining: '' }
  },
  bulk: {
    cement: '',
    sand: '',
    foam: { pulled: '', remaining: '' }
  },
  notes: ''
};

const DAYS_OF_WEEK = {
  ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
};

export default function MaterialsConsumption({ user, t, lang }) {
  const [viewMode, setViewMode] = useState('history'); // 'history' or 'form'
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isEditingId, setIsEditingId] = useState(null);
  const [showAutoSaveIndicator, setShowAutoSaveIndicator] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [expandedReportId, setExpandedReportId] = useState(null);

  // 1. Fetch submitted reports on mount
  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/materials-consumption');
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error('Error fetching materials reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // 2. Load draft from localStorage on switching to Form Mode
  useEffect(() => {
    if (viewMode === 'form' && !isEditingId) {
      const savedDraft = localStorage.getItem('materials_consumption_draft');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          // Set draft, keeping date fresh if it was default
          setFormData({
            ...parsed,
            date: parsed.date || new Date().toISOString().split('T')[0]
          });
          setHasRestoredDraft(true);
          setTimeout(() => setHasRestoredDraft(false), 4000);
        } catch (e) {
          console.error('Failed to parse draft', e);
        }
      }
    }
  }, [viewMode, isEditingId]);

  // 3. Auto-save form changes to localStorage
  useEffect(() => {
    if (viewMode === 'form' && !isEditingId) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('materials_consumption_draft', JSON.stringify(formData));
        setShowAutoSaveIndicator(true);
        setTimeout(() => setShowAutoSaveIndicator(false), 2000);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [formData, viewMode, isEditingId]);

  // 4. Calculate zone and cumulative totals dynamically
  const calculateTotals = (currentData) => {
    const updated = { ...currentData };
    const zones = ['zone_a', 'zone_b', 'zone_c'];
    
    zones.forEach(zone => {
      ['white', 'brown'].forEach(color => {
        const zoneData = updated.marble[zone][color];
        const skiliat = parseInt(zoneData.skiliat) || 0;
        const pcsPerSkilia = parseInt(zoneData.pieces_per_skilia) || 0;
        const loose = parseInt(zoneData.loose) || 0;
        updated.marble[zone][color].total = (skiliat * pcsPerSkilia) + loose;
      });
    });
    
    return updated;
  };

  const handleFieldChange = (section, item, field, value) => {
    setFormData(prev => {
      let nextState = { ...prev };
      if (section === 'basics' || section === 'sealants') {
        nextState[section][item][field] = value;
      } else if (section === 'bulk') {
        if (item === 'foam') {
          nextState.bulk.foam[field] = value;
        } else {
          nextState.bulk[item] = value;
        }
      } else if (section === 'marble') {
        nextState.marble[item][field][value] = arguments[4]; // handles (marble, zone, color, subfield, val)
      } else {
        nextState[section] = value;
      }
      return section === 'marble' ? calculateTotals(nextState) : nextState;
    });
  };

  // Specialized change handler for marble sub-fields
  const handleMarbleChange = (zone, color, subField, val) => {
    setFormData(prev => {
      const nextState = JSON.parse(JSON.stringify(prev)); // Deep copy
      nextState.marble[zone][color][subField] = val;
      return calculateTotals(nextState);
    });
  };

  // 5. Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError('');

    try {
      const method = isEditingId ? 'PUT' : 'POST';
      const url = isEditingId 
        ? `/api/materials-consumption/${isEditingId}` 
        : '/api/materials-consumption';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        if (!isEditingId) {
          // Clear draft on successful creation
          localStorage.removeItem('materials_consumption_draft');
        }
        setFormData(INITIAL_FORM_STATE);
        setIsEditingId(null);
        setViewMode('history');
        fetchReports();
      } else {
        const errorData = await res.json();
        setSubmitError(errorData.error || 'Failed to submit the report');
      }
    } catch (err) {
      console.error(err);
      setSubmitError('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 6. Delete Report
  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDeleteReport'))) return;
    try {
      const res = await fetch(`/api/materials-consumption/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchReports();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Edit Setup
  const handleEdit = (report) => {
    setFormData(report);
    setIsEditingId(report.id);
    setViewMode('form');
  };

  // Cumulative Sums computed from current form data
  const getCumulativeTotals = () => {
    const zones = ['zone_a', 'zone_b', 'zone_c'];
    let totalWhiteSkiliat = 0, totalBrownSkiliat = 0;
    let totalWhiteLoose = 0, totalBrownLoose = 0;
    let netWhite = 0, netBrown = 0;

    zones.forEach(zone => {
      const w = formData.marble[zone].white;
      const b = formData.marble[zone].brown;

      totalWhiteSkiliat += parseInt(w.skiliat) || 0;
      totalBrownSkiliat += parseInt(b.skiliat) || 0;
      totalWhiteLoose += parseInt(w.loose) || 0;
      totalBrownLoose += parseInt(b.loose) || 0;
      netWhite += w.total || 0;
      netBrown += b.total || 0;
    });

    return {
      totalWhiteSkiliat,
      totalBrownSkiliat,
      totalWhiteLoose,
      totalBrownLoose,
      netWhite,
      netBrown
    };
  };

  const cumulative = getCumulativeTotals();

  // Helper to translate Arabic days
  const getDayTranslation = (dayName) => {
    const idx = DAYS_OF_WEEK.ar.indexOf(dayName);
    return idx !== -1 ? DAYS_OF_WEEK[lang][idx] : dayName;
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={24} style={{ color: 'var(--accent)' }} />
            {t('headerMaterialsConsumptionTitle')}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px' }}>
            {t('headerMaterialsConsumptionSubtitle')}
          </p>
        </div>

        <div>
          {viewMode === 'history' ? (
            <button 
              className="btn btn-primary"
              onClick={() => {
                setFormData(INITIAL_FORM_STATE);
                setIsEditingId(null);
                setViewMode('form');
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={18} />
              {t('addNewReport')}
            </button>
          ) : (
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setIsEditingId(null);
                setViewMode('history');
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {lang === 'ar' ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
              {t('backToHistory')}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'history' ? (
          <motion.div 
            key="history"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-panel"
            style={{ width: '100%' }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.2rem' }}>
              {t('reportHistory')}
            </h3>

            {loading && reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                {t('loading')}
              </div>
            ) : reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <FileText size={48} style={{ opacity: 0.4 }} />
                <span>{t('noReportsYet')}</span>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="project-table" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '15%' }}>{t('materialsReportDate')}</th>
                      <th style={{ width: '10%' }}>{t('materialsReportDay')}</th>
                      <th style={{ width: '15%' }}>{t('materialsReportStartTime')} - {t('materialsReportEndTime')}</th>
                      <th style={{ width: '15%' }}>{t('materialsReportPreparedBy')}</th>
                      <th style={{ width: '25%' }}>{t('totalPieces')}</th>
                      <th style={{ width: '20%', textAlign: 'center' }}>{t('edit')} / {t('deleteReport')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => {
                      // Sum total marble pieces in report
                      let rWhite = 0, rBrown = 0;
                      ['zone_a', 'zone_b', 'zone_c'].forEach(z => {
                        rWhite += report.marble?.[z]?.white?.total || 0;
                        rBrown += report.marble?.[z]?.brown?.total || 0;
                      });

                      const isExpanded = expandedReportId === report.id;

                      return (
                        <React.Fragment key={report.id}>
                          <tr 
                            onClick={() => setExpandedReportId(isExpanded ? null : report.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td style={{ fontWeight: '700', fontFamily: 'var(--font-english)' }}>
                              {report.date}
                            </td>
                            <td>{getDayTranslation(report.day)}</td>
                            <td style={{ fontFamily: 'var(--font-english)' }}>
                              {report.start_time} - {report.end_time}
                            </td>
                            <td style={{ fontWeight: '500' }}>{report.prepared_by}</td>
                            <td>
                              <span style={{ fontSize: '0.85rem' }}>
                                {lang === 'ar' 
                                  ? `مرمر: ${rWhite + rBrown} (أبيض ${rWhite} | جوزي ${rBrown})` 
                                  : `Marble: ${rWhite + rBrown} (W: ${rWhite} | B: ${rBrown})`}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                                <button 
                                  className="btn btn-secondary" 
                                  onClick={() => handleEdit(report)}
                                  style={{ padding: '6px 10px', minWidth: 'auto', minHeight: 'auto' }}
                                >
                                  <Edit2 size={14} />
                                </button>
                                {(user.role === 'admin' || user.role === 'super_admin') && (
                                  <button 
                                    className="btn btn-secondary" 
                                    onClick={() => handleDelete(report.id)}
                                    style={{ padding: '6px 10px', minWidth: 'auto', minHeight: 'auto', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Details Row */}
                          {isExpanded && (
                            <tr style={{ background: 'rgba(0, 0, 0, 0.15)' }}>
                              <td colSpan="6" style={{ padding: '1.5rem', cursor: 'default' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                  
                                  {/* Basics details */}
                                  <div className="glass-panel" style={{ padding: '1.2rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '800', borderBottom: '1px solid var(--border)', paddingBottom: '0.6rem', marginBottom: '1rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <Layers size={18} />
                                      {t('sectionBasics')}
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                      {Object.entries(report.basics || {}).map(([key, item]) => (
                                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '4px 0', borderBottom: '1px solid var(--border-soft)' }}>
                                          <span style={{ fontWeight: '500' }}>{t(key)}</span>
                                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(243, 151, 22, 0.08)', color: 'var(--accent)', fontWeight: '600' }}>
                                              {t('materialPulled')}: {item.pulled || 0}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(22, 163, 74, 0.08)', color: 'var(--success)', fontWeight: '600' }}>
                                              {t('materialRemaining')}: {item.remaining || 0}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Sealants details */}
                                  <div className="glass-panel" style={{ padding: '1.2rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '800', borderBottom: '1px solid var(--border)', paddingBottom: '0.6rem', marginBottom: '1rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <Sparkles size={18} />
                                      {t('sectionSealants')}
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                      {Object.entries(report.sealants || {}).map(([key, item]) => (
                                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '4px 0', borderBottom: '1px solid var(--border-soft)' }}>
                                          <span style={{ fontWeight: '500' }}>{t(key)}</span>
                                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(243, 151, 22, 0.08)', color: 'var(--accent)', fontWeight: '600' }}>
                                              {t('materialPulled')}: {item.pulled || 0}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(22, 163, 74, 0.08)', color: 'var(--success)', fontWeight: '600' }}>
                                              {t('materialRemaining')}: {item.remaining || 0}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Bulk & Notes */}
                                  <div className="glass-panel" style={{ padding: '1.2rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '800', borderBottom: '1px solid var(--border)', paddingBottom: '0.6rem', marginBottom: '1rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <FileText size={18} />
                                      {lang === 'ar' ? `${t('sectionBulk')} و ${t('notes')}` : `${t('sectionBulk')} & ${t('notes')}`}
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '4px 0', borderBottom: '1px solid var(--border-soft)' }}>
                                        <span style={{ fontWeight: '500' }}>{t('cementQty')}</span>
                                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--fg)', fontWeight: '600', fontFamily: 'var(--font-english)' }}>
                                          {report.bulk?.cement || 0}
                                        </span>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '4px 0', borderBottom: '1px solid var(--border-soft)' }}>
                                        <span style={{ fontWeight: '500' }}>{t('sandQty')}</span>
                                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--fg)', fontWeight: '600', fontFamily: 'var(--font-english)' }}>
                                          {report.bulk?.sand || 0}
                                        </span>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '4px 0', borderBottom: '1px solid var(--border-soft)' }}>
                                        <span style={{ fontWeight: '500' }}>{t('foam')}</span>
                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                          <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(243, 151, 22, 0.08)', color: 'var(--accent)', fontWeight: '600' }}>
                                            {t('materialPulled')}: {report.bulk?.foam?.pulled || 0}
                                          </span>
                                          <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(22, 163, 74, 0.08)', color: 'var(--success)', fontWeight: '600' }}>
                                            {t('materialRemaining')}: {report.bulk?.foam?.remaining || 0}
                                          </span>
                                        </div>
                                      </div>
                                      {report.notes && (
                                        <div style={{ marginTop: '0.5rem', padding: '0.6rem 0.8rem', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', borderLeft: lang === 'ar' ? 'none' : '3px solid var(--accent)', borderRight: lang === 'ar' ? '3px solid var(--accent)' : 'none' }}>
                                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '2px', fontWeight: '600' }}>{t('notes')}:</div>
                                          <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--fg-2)' }}>{report.notes}</div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Marble details (Full width spanning) */}
                                  <div className="glass-panel" style={{ padding: '1.2rem', background: 'rgba(255, 255, 255, 0.02)', gridColumn: '1 / -1' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '800', borderBottom: '1px solid var(--border)', paddingBottom: '0.6rem', marginBottom: '1rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <Layers size={18} />
                                      {t('sectionMarble')}
                                    </h4>
                                    <div className="table-responsive" style={{ marginTop: '0', background: 'transparent', border: 'none' }}>
                                      <table className="project-table" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr', fontSize: '0.85rem', background: 'transparent' }}>
                                        <thead>
                                          <tr>
                                            <th style={{ background: 'transparent', padding: '8px 12px', fontSize: '0.8rem' }}>{t('colZoneName')}</th>
                                            <th style={{ background: 'transparent', padding: '8px 12px', fontSize: '0.8rem', textAlign: 'center' }}>{t('skiliatCount')}</th>
                                            <th style={{ background: 'transparent', padding: '8px 12px', fontSize: '0.8rem', textAlign: 'center' }}>{t('piecesPerSkilia')}</th>
                                            <th style={{ background: 'transparent', padding: '8px 12px', fontSize: '0.8rem', textAlign: 'center' }}>{t('loosePieces')}</th>
                                            <th style={{ background: 'transparent', padding: '8px 12px', fontSize: '0.8rem', textAlign: 'center' }}>{t('totalPieces')}</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {['zone_a', 'zone_b', 'zone_c'].map((zone) => (
                                            <React.Fragment key={zone}>
                                              {/* White */}
                                              <tr>
                                                <td style={{ padding: '8px 12px', fontWeight: '600' }}>
                                                  {(lang === 'ar' ? zone.replace('zone_', 'زون ').toUpperCase() : zone.replace('zone_', 'Zone ').toUpperCase())} - {t('marbleWhiteTitle')}
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '8px 12px', fontFamily: 'var(--font-english)' }}>
                                                  {report.marble?.[zone]?.white?.skiliat || 0}
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '8px 12px', fontFamily: 'var(--font-english)' }}>
                                                  {report.marble?.[zone]?.white?.pieces_per_skilia || 198}
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '8px 12px', fontFamily: 'var(--font-english)' }}>
                                                  {report.marble?.[zone]?.white?.loose || 0}
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '8px 12px', fontWeight: '800', fontFamily: 'var(--font-english)' }}>
                                                  {(report.marble?.[zone]?.white?.total || 0).toLocaleString()}
                                                </td>
                                              </tr>
                                              {/* Brown */}
                                              <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                                                <td style={{ padding: '8px 12px', color: 'var(--accent)', fontWeight: '600' }}>
                                                  {(lang === 'ar' ? zone.replace('zone_', 'زون ').toUpperCase() : zone.replace('zone_', 'Zone ').toUpperCase())} - {t('marbleBrownTitle')}
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '8px 12px', fontFamily: 'var(--font-english)' }}>
                                                  {report.marble?.[zone]?.brown?.skiliat || 0}
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '8px 12px', fontFamily: 'var(--font-english)' }}>
                                                  {report.marble?.[zone]?.brown?.pieces_per_skilia || 198}
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '8px 12px', fontFamily: 'var(--font-english)' }}>
                                                  {report.marble?.[zone]?.brown?.loose || 0}
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '8px 12px', fontWeight: '800', fontFamily: 'var(--font-english)', color: 'var(--accent)' }}>
                                                  {(report.marble?.[zone]?.brown?.total || 0).toLocaleString()}
                                                </td>
                                              </tr>
                                            </React.Fragment>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>

                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.form 
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}
          >
            {/* Auto-save draft notifications */}
            {hasRestoredDraft && (
              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--success)', background: 'rgba(16, 185, 129, 0.05)', padding: '0.75rem 1rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: '600' }}>
                  {t('hasDraftLoaded')}
                </span>
              </div>
            )}

            {submitError && (
              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)', padding: '0.75rem 1rem' }}>
                <AlertCircle size={16} style={{ color: 'var(--danger)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: '600' }}>
                  {submitError}
                </span>
              </div>
            )}

            {/* Header Form Cards */}
            <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.2rem', padding: '1.2rem' }}>
              <div>
                <label className="form-label">{t('materialsReportDate')}</label>
                <input 
                  type="date" 
                  className="form-input"
                  style={{ fontFamily: 'var(--font-english)' }}
                  value={formData.date}
                  onChange={(e) => handleFieldChange('date', null, null, e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">{t('materialsReportDay')}</label>
                <select 
                  className="form-input"
                  value={formData.day}
                  onChange={(e) => handleFieldChange('day', null, null, e.target.value)}
                  required
                >
                  {DAYS_OF_WEEK.ar.map((day, idx) => (
                    <option key={day} value={day}>
                      {DAYS_OF_WEEK[lang][idx]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">{t('materialsReportStartTime')}</label>
                <input 
                  type="time" 
                  className="form-input"
                  style={{ fontFamily: 'var(--font-english)' }}
                  value={formData.start_time}
                  onChange={(e) => handleFieldChange('start_time', null, null, e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">{t('materialsReportEndTime')}</label>
                <input 
                  type="time" 
                  className="form-input"
                  style={{ fontFamily: 'var(--font-english)' }}
                  value={formData.end_time}
                  onChange={(e) => handleFieldChange('end_time', null, null, e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">{t('materialsReportPreparedBy')}</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={formData.prepared_by}
                  onChange={(e) => handleFieldChange('prepared_by', null, null, e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Grid for Sections */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              
              {/* Section 1: Basics */}
              <div className="glass-panel">
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem', color: 'var(--accent)' }}>
                  {t('sectionBasics')}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {Object.keys(formData.basics).map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-soft)' }}>
                      <span style={{ fontWeight: '500', flex: 1 }}>{t(item)}</span>
                      <div style={{ display: 'flex', gap: '0.5rem', width: '180px' }}>
                        <input
                          type="number"
                          placeholder={t('materialPulled')}
                          className="form-input"
                          style={{ padding: '6px', textAlign: 'center', fontFamily: 'var(--font-english)' }}
                          value={formData.basics[item].pulled}
                          onChange={(e) => handleFieldChange('basics', item, 'pulled', e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder={t('materialRemaining')}
                          className="form-input"
                          style={{ padding: '6px', textAlign: 'center', fontFamily: 'var(--font-english)' }}
                          value={formData.basics[item].remaining}
                          onChange={(e) => handleFieldChange('basics', item, 'remaining', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Marble Inventory */}
              <div className="glass-panel">
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem', color: 'var(--accent)' }}>
                  {t('sectionMarble')}
                </h3>
                
                <div className="table-responsive">
                  <table className="project-table" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                    <thead>
                      <tr>
                        <th>{t('colZoneName')}</th>
                        <th style={{ textAlign: 'center' }}>{t('skiliatCount')}</th>
                        <th style={{ textAlign: 'center' }}>{t('piecesPerSkilia')}</th>
                        <th style={{ textAlign: 'center' }}>{t('loosePieces')}</th>
                        <th style={{ textAlign: 'center' }}>{t('totalPieces')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['zone_a', 'zone_b', 'zone_c'].map((zone) => (
                        <React.Fragment key={zone}>
                          {/* White Marble */}
                          <tr>
                            <td style={{ fontWeight: '700' }}>
                              {(lang === 'ar' ? zone.replace('zone_', 'زون ').toUpperCase() : zone.replace('zone_', 'Zone ').toUpperCase())} - {t('marbleWhiteTitle')}
                            </td>
                            <td>
                              <input 
                                type="number" 
                                className="form-input" 
                                style={{ textAlign: 'center', fontFamily: 'var(--font-english)' }}
                                value={formData.marble[zone].white.skiliat}
                                onChange={(e) => handleMarbleChange(zone, 'white', 'skiliat', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                className="form-input" 
                                style={{ textAlign: 'center', fontFamily: 'var(--font-english)' }}
                                value={formData.marble[zone].white.pieces_per_skilia}
                                onChange={(e) => handleMarbleChange(zone, 'white', 'pieces_per_skilia', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                className="form-input" 
                                style={{ textAlign: 'center', fontFamily: 'var(--font-english)' }}
                                value={formData.marble[zone].white.loose}
                                onChange={(e) => handleMarbleChange(zone, 'white', 'loose', e.target.value)}
                              />
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: '800', fontFamily: 'var(--font-english)' }}>
                              {(formData.marble[zone].white.total || 0).toLocaleString()}
                            </td>
                          </tr>
                          
                          {/* Brown Marble */}
                          <tr style={{ borderBottom: '2px solid var(--border)' }}>
                            <td style={{ fontWeight: '700', color: 'var(--accent)' }}>
                              {(lang === 'ar' ? zone.replace('zone_', 'زون ').toUpperCase() : zone.replace('zone_', 'Zone ').toUpperCase())} - {t('marbleBrownTitle')}
                            </td>
                            <td>
                              <input 
                                type="number" 
                                className="form-input" 
                                style={{ textAlign: 'center', fontFamily: 'var(--font-english)' }}
                                value={formData.marble[zone].brown.skiliat}
                                onChange={(e) => handleMarbleChange(zone, 'brown', 'skiliat', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                className="form-input" 
                                style={{ textAlign: 'center', fontFamily: 'var(--font-english)' }}
                                value={formData.marble[zone].brown.pieces_per_skilia}
                                onChange={(e) => handleMarbleChange(zone, 'brown', 'pieces_per_skilia', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                className="form-input" 
                                style={{ textAlign: 'center', fontFamily: 'var(--font-english)' }}
                                value={formData.marble[zone].brown.loose}
                                onChange={(e) => handleMarbleChange(zone, 'brown', 'loose', e.target.value)}
                              />
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: '800', fontFamily: 'var(--font-english)', color: 'var(--accent)' }}>
                              {(formData.marble[zone].brown.total || 0).toLocaleString()}
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}

                      {/* Cumulative sums row */}
                      <tr style={{ background: 'rgba(255,255,255,0.03)', fontWeight: '800' }}>
                        <td>{lang === 'ar' ? 'الإجمالي التراكمي' : 'Cumulative / Totals'}</td>
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-english)' }}>
                          <div>{lang === 'ar' ? 'أبيض: ' : 'W: '}{cumulative.totalWhiteSkiliat}</div>
                          <div style={{ color: 'var(--accent)' }}>{lang === 'ar' ? 'جوزي: ' : 'B: '}{cumulative.totalBrownSkiliat}</div>
                        </td>
                        <td style={{ textAlign: 'center', color: 'var(--muted)' }}>-</td>
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-english)' }}>
                          <div>{lang === 'ar' ? 'أبيض: ' : 'W: '}{cumulative.totalWhiteLoose}</div>
                          <div style={{ color: 'var(--accent)' }}>{lang === 'ar' ? 'جوزي: ' : 'B: '}{cumulative.totalBrownLoose}</div>
                        </td>
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-english)' }}>
                          <div style={{ color: '#eef2f7' }}>{t('netWhite')}: {cumulative.netWhite.toLocaleString()}</div>
                          <div style={{ color: 'var(--accent)' }}>{t('netBrown')}: {cumulative.netBrown.toLocaleString()}</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 3: Sealants & Sponges */}
              <div className="glass-panel">
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem', color: 'var(--accent)' }}>
                  {t('sectionSealants')}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {Object.keys(formData.sealants).map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-soft)' }}>
                      <span style={{ fontWeight: '500', flex: 1 }}>{t(item)}</span>
                      <div style={{ display: 'flex', gap: '0.5rem', width: '180px' }}>
                        <input
                          type="number"
                          placeholder={t('materialPulled')}
                          className="form-input"
                          style={{ padding: '6px', textAlign: 'center', fontFamily: 'var(--font-english)' }}
                          value={formData.sealants[item].pulled}
                          onChange={(e) => handleFieldChange('sealants', item, 'pulled', e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder={t('materialRemaining')}
                          className="form-input"
                          style={{ padding: '6px', textAlign: 'center', fontFamily: 'var(--font-english)' }}
                          value={formData.sealants[item].remaining}
                          onChange={(e) => handleFieldChange('sealants', item, 'remaining', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Bulk Materials */}
              <div className="glass-panel">
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem', color: 'var(--accent)' }}>
                  {t('sectionBulk')}
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
                  {/* Cement + Sand */}
                  <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(0,0,0,0.1)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.6rem' }}>{t('cement')}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>{t('cementQty')}</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          style={{ fontFamily: 'var(--font-english)' }}
                          value={formData.bulk.cement}
                          onChange={(e) => handleFieldChange('bulk', 'cement', null, e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>{t('sandQty')}</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          style={{ fontFamily: 'var(--font-english)' }}
                          value={formData.bulk.sand}
                          onChange={(e) => handleFieldChange('bulk', 'sand', null, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Foam */}
                  <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(0,0,0,0.1)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.6rem' }}>{t('foam')}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>{t('materialPulled')}</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          style={{ fontFamily: 'var(--font-english)' }}
                          value={formData.bulk.foam.pulled}
                          onChange={(e) => handleFieldChange('bulk', 'foam', 'pulled', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>{t('materialRemaining')}</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          style={{ fontFamily: 'var(--font-english)' }}
                          value={formData.bulk.foam.remaining}
                          onChange={(e) => handleFieldChange('bulk', 'foam', 'remaining', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Notes */}
              <div className="glass-panel">
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem', color: 'var(--accent)' }}>
                  {t('sectionNotes')}
                </h3>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder={t('materialsReportNotes')}
                  value={formData.notes}
                  onChange={(e) => handleFieldChange('notes', null, null, e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

            </div>

            {/* Form actions */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
              {showAutoSaveIndicator && !isEditingId && (
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle2 size={12} style={{ color: 'var(--success)' }} />
                  {t('autoSaveDraft')}
                </span>
              )}
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Save size={18} />
                {isEditingId ? t('updateReport') : t('submitReport')}
              </button>
            </div>

          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
