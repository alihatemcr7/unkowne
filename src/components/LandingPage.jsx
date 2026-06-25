import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, Box, ShieldCheck, Zap, Layers, Users } from 'lucide-react';
import companyLogo from '../assets/company-logo.webp';

export default function LandingPage({ onNavigateToLogin, lang, setLang, theme, setTheme }) {
  const isAr = lang === 'ar';
  
  const content = {
    heroTitle: isAr ? 'متابعة موقع الجندي المجهول' : 'Unknown Soldier Monument',
    heroSubtitle: isAr ? 'منصة هندسية متطورة لإدارة الموارد ومتابعة نسب الإنجاز بدقة متناهية.' : 'Advanced Engineering Platform for Resource Management & Precision Tracking.',
    cta: isAr ? 'الدخول للوحة التحكم' : 'Access Dashboard',
    featuresTitle: isAr ? 'الميزات الرئيسية' : 'Key Features',
    features: [
      {
        icon: <BarChart3 size={32} style={{ color: 'var(--accent)' }} />,
        title: isAr ? 'إحصائيات دقيقة' : 'Precision Analytics',
        desc: isAr ? 'تتبع لحظي لنسب الإنجاز والموقف الهندسي بدقة عالية.' : 'Real-time tracking of engineering progress with high accuracy.'
      },
      {
        icon: <Layers size={32} style={{ color: 'var(--info)' }} />,
        title: isAr ? 'توزيع المرمر' : 'Marble Distribution',
        desc: isAr ? 'خريطة متكاملة لبيان موقف توزيع المرمر في الموقع.' : 'Comprehensive map showing marble distribution on site.'
      },
      {
        icon: <Box size={32} style={{ color: 'var(--warn)' }} />,
        title: isAr ? 'إدارة الموارد' : 'Resource Management',
        desc: isAr ? 'تتبع المخزون واستهلاك المواد اليومية لضمان استمرارية العمل.' : 'Track inventory and daily material consumption for workflow continuity.'
      },
      {
        icon: <Zap size={32} style={{ color: 'var(--success)' }} />,
        title: isAr ? 'أداء فائق' : 'High Performance',
        desc: isAr ? 'واجهة مستخدم سريعة وسهلة مدعومة بنظام OLED المتطور.' : 'Fast and intuitive user interface powered by advanced OLED system.'
      }
    ],
    stats: [
      { value: '100%', label: isAr ? 'دقة البيانات' : 'Data Accuracy' },
      { value: '24/7', label: isAr ? 'تزامن لحظي' : 'Real-time Sync' },
      { value: '0', label: isAr ? 'أخطاء ورقية' : 'Paper Errors' }
    ],
    footerText: isAr ? '© 2026 جميع الحقوق محفوظة - إدارة المهندس المقيم.' : '© 2026 All Rights Reserved - Site Engineering Management.'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="landing-page" style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-1)', 
      color: 'var(--fg)',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden'
    }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 5%',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#fff', padding: '0.25rem', borderRadius: '8px', width: '48px', height: '48px' }}>
            <img src={companyLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
            UMSP
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setLang(isAr ? 'en' : 'ar')} className="btn btn-secondary">
            {isAr ? 'English' : 'عربي'}
          </button>
          <button onClick={onNavigateToLogin} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {content.cta} {isAr ? <ArrowLeft size={18} /> : <ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1 }}>
        <section style={{ 
          padding: '6rem 5%', 
          textAlign: 'center',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Subtle background glow */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, rgba(2,6,23,0) 70%)',
            zIndex: 0,
            pointerEvents: 'none'
          }} />

          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}
          >
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.5rem 1rem', 
              background: 'rgba(34, 197, 94, 0.1)', 
              color: 'var(--accent)',
              borderRadius: '999px',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              marginBottom: '2rem',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              <ShieldCheck size={16} />
              {isAr ? 'نظام آمن وموثوق v2.0' : 'Secure & Reliable System v2.0'}
            </div>
            
            <h1 style={{ 
              fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
              fontWeight: '800', 
              lineHeight: '1.2',
              marginBottom: '1.5rem',
              background: 'linear-gradient(to bottom right, #fff, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {content.heroTitle}
            </h1>
            
            <p style={{ 
              fontSize: 'clamp(1.1rem, 2vw, 1.25rem)', 
              color: 'var(--fg-2)', 
              marginBottom: '3rem',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto 3rem auto'
            }}>
              {content.heroSubtitle}
            </p>
            
            <button 
              onClick={onNavigateToLogin}
              style={{
                padding: '1rem 2.5rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                background: 'var(--accent)',
                color: 'var(--accent-on)',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.6)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(34, 197, 94, 0.4)';
              }}
            >
              {content.cta}
              {isAr ? <ArrowLeft size={20} /> : <ArrowLeft size={20} style={{ transform: 'rotate(180deg)' }} />}
            </button>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section style={{ padding: '2rem 5%', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface-warm)' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem' }}>
            {content.stats.map((stat, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                  {stat.value}
                </div>
                <div style={{ color: 'var(--fg-2)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Bento Grid Features */}
        <section style={{ padding: '6rem 5%' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '3rem' }}>{content.featuresTitle}</h2>
            
            <motion.div 
              className="bento-grid"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem'
              }}
            >
              {content.features.map((feature, idx) => (
                <motion.div 
                  key={idx} 
                  variants={itemVariants}
                  className="glass-panel"
                  style={{
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ 
                    width: '64px', height: '64px', 
                    borderRadius: '16px', 
                    background: 'var(--bg-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--border)'
                  }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '0.5rem' }}>{feature.title}</h3>
                  <p style={{ color: 'var(--fg-2)', lineHeight: '1.6' }}>{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ padding: '2rem 5%', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--muted)' }}>
        <p>{content.footerText}</p>
      </footer>
    </div>
  );
}
