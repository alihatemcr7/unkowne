import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowLeft, BarChart2, Layers, Package, RefreshCw, ShieldCheck } from 'lucide-react';
import companyLogo from '../assets/company-logo.webp';

/* ─── spring helpers ──────────────────────────────────────────── */
const SPRING = { type: 'spring', stiffness: 80, damping: 18 };
const EASE_EXPO = [0.16, 1, 0.3, 1];

const fadeUp = (delay = 0) => ({
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_EXPO, delay } },
});

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
};

/* ─── feature data ────────────────────────────────────────────── */
const FEATURES = (isAr) => [
  {
    Icon: BarChart2,
    title:  isAr ? 'إحصائيات دقيقة'     : 'Precision Analytics',
    desc:   isAr ? 'تتبع لحظي لنسب الإنجاز والموقف الهندسي بدقة عالية.' : 'Real-time engineering progress tracking with field-grade accuracy.',
    tint:   'var(--accent)',
  },
  {
    Icon: Layers,
    title:  isAr ? 'توزيع المرمر'        : 'Marble Distribution',
    desc:   isAr ? 'خريطة متكاملة لبيان موقف توزيع المرمر في الموقع.'  : 'Full-site marble distribution map with zone-level status.',
    tint:   'var(--info)',
  },
  {
    Icon: Package,
    title:  isAr ? 'إدارة الموارد'       : 'Resource Management',
    desc:   isAr ? 'تتبع المخزون واستهلاك المواد اليومية.'              : 'Daily material consumption and inventory tracking.',
    tint:   'var(--warn)',
  },
  {
    Icon: RefreshCw,
    title:  isAr ? 'تحديث لحظي'          : 'Live Sync',
    desc:   isAr ? 'بيانات محدّثة فور الإدخال بدون تأخير أو ورق.'       : 'Instant data sync across all field and management endpoints.',
    tint:   'var(--success)',
  },
];

const STATS = (isAr) => [
  { value: '100%', label: isAr ? 'دقة البيانات'  : 'Data Accuracy'  },
  { value: '24/7', label: isAr ? 'تزامن لحظي'   : 'Live Sync'      },
  { value: '0',   label: isAr ? 'أخطاء ورقية'  : 'Paper Errors'   },
];

/* ─── Component ─────────────────────────────────────────────── */
export default function LandingPage({ onNavigateToLogin, lang, setLang, theme, setTheme }) {
  const isAr   = lang === 'ar';
  const reduce = useReducedMotion();

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bg-1)',
        color: 'var(--fg)',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-english)',
      }}
    >
      {/* ── Ambient orb — single subtle emerald ──────────────────── */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: '-20vw',
          right: isAr ? '-10vw' : 'auto',
          left: isAr ? 'auto' : '-10vw',
          width: '55vw',
          height: '55vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(5,150,105,0.14) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <nav
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'center',
          padding: '1.25rem 5%',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'var(--surface)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-sm)',
              background: '#fff',
              padding: 3,
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <img src={companyLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em', color: 'var(--fg)' }}>
            UMSP
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setLang(isAr ? 'en' : 'ar')}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.9rem' }}
          >
            {isAr ? 'EN' : 'عربي'}
          </button>
          <button
            onClick={onNavigateToLogin}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1.1rem' }}
          >
            {isAr ? 'دخول' : 'Sign In'}
            <ArrowIcon size={15} />
          </button>
        </div>
      </nav>

      {/* ── Hero — asymmetric split layout ───────────────────────── */}
      <motion.section
        initial={reduce ? false : 'hidden'}
        animate="visible"
        variants={stagger}
        className="landing-hero"
        style={{
          flex: 1,
          display: 'grid',
          gap: '4rem',
          alignItems: 'center',
          padding: 'clamp(3rem, 8vw, 6rem) 5%',
          maxWidth: 1280,
          margin: '0 auto',
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Left — copy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Status badge */}
          <motion.div variants={fadeUp(0)}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.85rem',
                background: 'var(--accent-subtle)',
                color: 'var(--accent)',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--accent-border)',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              <ShieldCheck size={12} />
              {isAr ? 'نظام موثوق · v2.0' : 'Verified System · v2.0'}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp(0.05)}
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              color: 'var(--fg)',
              margin: 0,
            }}
          >
            {isAr
              ? <>متابعة موقع<br /><span style={{ color: 'var(--accent)' }}>الجندي المجهول</span></>
              : <>Unknown Soldier<br /><span style={{ color: 'var(--accent)' }}>Monument</span></>
            }
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={fadeUp(0.1)}
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--fg-2)',
              lineHeight: 1.65,
              maxWidth: '52ch',
              margin: 0,
            }}
          >
            {isAr
              ? 'منصة هندسية لإدارة الموارد ومتابعة نسب الإنجاز في الموقع الميداني.'
              : 'Engineering platform for resource management and field-grade progress tracking.'}
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUp(0.15)}>
            <motion.button
              onClick={onNavigateToLogin}
              whileHover={{ translateY: -2, boxShadow: '0 8px 24px var(--accent-glow)' }}
              whileTap={{ scale: 0.97 }}
              transition={SPRING}
              className="btn btn-primary"
              style={{
                fontSize: 'var(--text-base)',
                padding: '0.8rem 1.8rem',
                gap: '0.5rem',
                width: 'fit-content',
              }}
            >
              {isAr ? 'الدخول للوحة التحكم' : 'Access Dashboard'}
              <ArrowIcon size={17} />
            </motion.button>
          </motion.div>
        </div>

        {/* Right — stats panel */}
        <motion.div
          variants={fadeUp(0.2)}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.25rem',
            boxShadow: 'var(--elev-raised)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {/* Accent top line */}
          <div style={{
            height: 3,
            borderRadius: 2,
            background: 'linear-gradient(90deg, var(--accent), transparent)',
            marginBottom: '0.25rem',
          }} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {STATS(isAr).map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-3xl)',
                    fontWeight: 700,
                    color: 'var(--accent)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)', marginTop: '0.4rem', fontWeight: 500 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Separator */}
          <div style={{ height: 1, background: 'var(--border)' }} />

          <p style={{ color: 'var(--fg-2)', fontSize: 'var(--text-sm)', lineHeight: 1.6, margin: 0 }}>
            {isAr
              ? 'بيانات حقيقية · لا يوجد إدخال ورقي · تحديث فوري عند كل تغيير ميداني.'
              : 'Live data · Zero paper input · Instant sync on every field change.'}
          </p>
        </motion.div>
      </motion.section>

      {/* ── Features — 2+2 asymmetric bento ──────────────────────── */}
      <section
        style={{
          padding: 'clamp(3rem, 8vw, 5rem) 5%',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-2)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {/* Section header — NO eyebrow here since hero already used one */}
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: EASE_EXPO }}
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--fg)',
              marginBottom: '2.5rem',
            }}
          >
            {isAr ? 'الميزات الرئيسية' : 'Key Capabilities'}
          </motion.h2>

          {/* 2×2 grid — varied cell treatment */}
          <div
            className="landing-features-grid"
            style={{
              display: 'grid',
              gap: '1.25rem',
            }}
          >
            {FEATURES(isAr).map(({ Icon, title, desc, tint }, idx) => (
              <motion.div
                key={title}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, ease: EASE_EXPO, delay: idx * 0.07 }}
                whileHover={{ translateY: -3, transition: SPRING }}
                style={{
                  background: idx === 0
                    ? 'var(--accent-subtle)'
                    : 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  cursor: 'default',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-sm)',
                    background: `${tint}18`,
                    border: `1px solid ${tint}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} style={{ color: tint }} strokeWidth={1.75} />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 700,
                      color: 'var(--fg)',
                      marginBottom: '0.4rem',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {title}
                  </h3>
                  <p style={{ color: 'var(--fg-2)', fontSize: 'var(--text-sm)', lineHeight: 1.6, margin: 0 }}>
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer
        style={{
          padding: '1.5rem 5%',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)' }}>
          {isAr ? '© 2026 إدارة المهندس المقيم' : '© 2026 Site Engineering Management'}
        </span>
        <button
          onClick={onNavigateToLogin}
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.9rem', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          {isAr ? 'دخول' : 'Sign In'}
          <ArrowIcon size={13} />
        </button>
      </footer>
    </div>
  );
}
