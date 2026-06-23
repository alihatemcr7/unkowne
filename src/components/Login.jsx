import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Sun, Moon, Languages } from 'lucide-react';
import companyLogo from '../assets/company-logo.webp';
import BorderGlow from './BorderGlow';

export default function Login({ onLoginSuccess, t, lang, setLang, theme, setTheme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error ? (lang === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' : 'Incorrect email or password.') : t('invalidLogin'));
      }
    } catch (err) {
      console.error('Login request failed', err);
      setError(t('connError'));
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="login-container" style={{ flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
      


      {/* Top switches on login screen */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ display: 'flex', gap: '0.75rem', zIndex: 10, position: 'relative' }}
      >
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
          className="switch-btn"
          title={lang === 'ar' ? 'تغيير المظهر' : 'Toggle Theme'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          <span style={{ fontSize: '0.8rem' }}>
            {theme === 'dark' 
              ? (lang === 'ar' ? 'فاتح' : 'Light') 
              : (lang === 'ar' ? 'داكن' : 'Dark')}
          </span>
        </button>

        <button 
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} 
          className="switch-btn"
          title={lang === 'ar' ? 'English' : 'العربية'}
        >
          <Languages size={16} />
          <span style={{ fontSize: '0.8rem' }}>{lang === 'ar' ? 'English' : 'العربية'}</span>
        </button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ position: 'relative', zIndex: 10 }}
      >
        <BorderGlow
          className="login-card glass-panel"
          edgeSensitivity={64}
          glowColor="190 90 60"
          backgroundColor="var(--surface)"
          borderRadius={24}
          glowRadius={40}
          animated={true}
        >
          <div className="login-logo-container">
          <div className="sidebar-logo login-logo" style={{ background: '#fff', padding: '4px' }}>
            <img src={companyLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h2 className="login-title">{t('loginTitle')}</h2>
          <p className="login-subtitle">{t('loginSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">{t('email')}</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@project.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('password')}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ 
                  paddingLeft: lang === 'ar' ? '2.5rem' : '1rem', 
                  paddingRight: lang === 'ar' ? '1rem' : '2.5rem' 
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  left: lang === 'ar' ? '10px' : 'auto',
                  right: lang === 'ar' ? 'auto' : '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="error-msg"
            >
              <Shield size={16} />
              <span>{error}</span>
            </motion.div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
            disabled={loading}
          >
            {loading ? t('checking') : t('loginBtn')}
          </button>


        </form>

        </BorderGlow>
      </motion.div>
    </div>
  );
}
