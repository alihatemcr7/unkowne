import React from 'react';
import { LayoutDashboard, ClipboardList, Layers, LogOut, ChevronLeft, ChevronRight, Construction, MessageSquare, FileText } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed, user, onLogout, t, lang, mobileOpen, setMobileOpen }) {
  const menuItems = [
    { id: 'dashboard', label: t('menuDashboard'), icon: LayoutDashboard },
    { id: 'tracking', label: t('menuTracking'), icon: ClipboardList },
    { id: 'marble', label: t('menuMarble'), icon: Layers },
    { id: 'materials-consumption', label: t('menuMaterialsConsumption'), icon: FileText },
    { id: 'daily-updates', label: lang === 'ar' ? 'التحديث اليومي' : 'Daily Log & Chat', icon: MessageSquare }
  ];

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Construction size={22} style={{ color: 'var(--bg-base)' }} />
        </div>
        <span className="sidebar-title">{t('sidebarTitle')}</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                if (setMobileOpen) setMobileOpen(false);
              }}
            >
              <Icon size={20} style={{ flexShrink: 0 }} />
              <span className="nav-label">{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button
          className="nav-item"
          onClick={onLogout}
          style={{ 
            background: 'none', 
            border: 'none', 
            width: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-3)' 
          }}
        >
          <LogOut size={20} style={{ flexShrink: 0 }} />
          <span className="nav-label">{t('logout')}</span>
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn btn-secondary"
          style={{ padding: '0.4rem', borderRadius: '50%', width: '32px', height: '32px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {collapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </div>
  );
}
