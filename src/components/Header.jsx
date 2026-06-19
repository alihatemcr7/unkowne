import React from 'react';
import { User, ShieldAlert, FileSpreadsheet, Printer, RefreshCw, Sun, Moon, Languages, Menu } from 'lucide-react';

export default function Header({ 
  activeTab, 
  user, 
  onRoleToggle, 
  onExcelExport, 
  onPdfPrint, 
  onRefresh, 
  t, 
  lang, 
  setLang, 
  theme, 
  setTheme,
  onMenuToggle
}) {
  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return t('headerDashboardTitle');
      case 'tracking':
        return t('headerTrackingTitle');
      case 'marble':
        return t('headerMarbleTitle');
      case 'materials-consumption':
        return t('headerMaterialsConsumptionTitle');
      default:
        return t('headerDefaultTitle');
    }
  };

  const getSubtitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return t('headerDashboardSubtitle');
      case 'tracking':
        return t('headerTrackingSubtitle');
      case 'marble':
        return t('headerMarbleSubtitle');
      case 'materials-consumption':
        return t('headerMaterialsConsumptionSubtitle');
      default:
        return t('headerDefaultSubtitle');
    }
  };

  return (
    <header className="header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
      <div className="header-title-section" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button 
          className="mobile-menu-btn" 
          onClick={onMenuToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--fg)',
            cursor: 'pointer',
            padding: '0.25rem',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%'
          }}
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 className="header-title" style={{ fontSize: '1.5rem' }}>{getTitle()}</h1>
          <p className="header-subtitle">{getSubtitle()}</p>
        </div>
      </div>

      <div className="header-actions" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        {/* Theme Switcher */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
          className="switch-btn"
          title={lang === 'ar' ? 'تغيير المظهر' : 'Toggle Theme'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span>
            {theme === 'dark' 
              ? (lang === 'ar' ? 'مظهر فاتح' : 'Light Mode') 
              : (lang === 'ar' ? 'مظهر داكن' : 'Dark Mode')}
          </span>
        </button>

        {/* Language Switcher */}
        <button 
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} 
          className="switch-btn"
          title={lang === 'ar' ? 'English' : 'العربية'}
        >
          <Languages size={18} />
          <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        {/* Refresh button */}
        <button 
          onClick={onRefresh} 
          className="btn btn-secondary" 
          title={t('refresh')}
          style={{ padding: '0.6rem' }}
        >
          <RefreshCw size={18} />
        </button>

        {/* Smart Export Actions */}
        <button onClick={onExcelExport} className="btn btn-secondary" title={t('exportExcel')}>
          <FileSpreadsheet size={18} />
          <span>{lang === 'ar' ? 'تصدير Excel' : 'Excel'}</span>
        </button>

        <button onClick={onPdfPrint} className="btn btn-secondary" title={t('exportPdf')}>
          <Printer size={18} />
          <span>{lang === 'ar' ? 'تصدير PDF' : 'PDF'}</span>
        </button>

        {/* User profile with dev role toggle helper */}
        <div className="user-profile">
          <div className="avatar">
            <User size={16} />
          </div>
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span className={`user-role-badge ${user.role === 'admin' ? 'role-admin' : 'role-viewer'}`}>
                {user.role === 'admin' ? (lang === 'ar' ? 'مهندس الموقع' : 'Site Engineer') : (lang === 'ar' ? 'إدارة عليا' : 'Senior Management')}
              </span>
              
              {/* Quick toggle link for review convenience */}
              <button 
                onClick={onRoleToggle}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: '0.7rem',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: '0 2px'
                }}
                title={t('toggle')}
              >
                ({t('roleToggle')})
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
