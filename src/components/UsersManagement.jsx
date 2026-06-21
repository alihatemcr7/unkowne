import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Plus, Trash2, Edit2, Shield, Mail, Lock, User, 
  Save, X, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck
} from 'lucide-react';

export default function UsersManagement({ currentUser, t, lang }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formMode, setFormMode] = useState('list'); // 'list' | 'add' | 'edit'
  
  // Form fields
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('admin');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        throw new Error(lang === 'ar' ? 'فشل جلب الحسابات.' : 'Failed to fetch accounts.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || (lang === 'ar' ? 'خطأ في الاتصال بالخادم.' : 'Server connection error.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setUserId(null);
    setEmail('');
    setPassword('');
    setName('');
    setRole('admin');
    setError('');
    setSuccess('');
    setShowPassword(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setFormMode('add');
  };

  const handleOpenEdit = (user) => {
    resetForm();
    setUserId(user.id);
    setEmail(user.email);
    setPassword(user.password || '');
    setName(user.name);
    setRole(user.role);
    setFormMode('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || !name || !role) {
      setError(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة.' : 'Please fill all required fields.');
      return;
    }

    const payload = { email, password, name, role };
    setLoading(true);

    try {
      const method = formMode === 'edit' ? 'PUT' : 'POST';
      const url = formMode === 'edit' ? `/api/users/${userId}` : '/api/users';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(
          formMode === 'edit' 
            ? (lang === 'ar' ? 'تم تحديث الحساب بنجاح!' : 'Account updated successfully!')
            : (lang === 'ar' ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!')
        );
        setTimeout(() => {
          setFormMode('list');
          fetchUsers();
          resetForm();
        }, 1500);
      } else {
        setError(data.error || (lang === 'ar' ? 'حدث خطأ أثناء حفظ البيانات.' : 'Error saving data.'));
      }
    } catch (err) {
      console.error(err);
      setError(lang === 'ar' ? 'خطأ في الاتصال بالخادم.' : 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, userEmail) => {
    if (id === currentUser.id) {
      alert(lang === 'ar' ? 'لا يمكنك حذف حسابك الحالي الذي تستخدمه لتسجيل الدخول!' : 'You cannot delete your own logged-in account!');
      return;
    }

    const confirmMsg = lang === 'ar' 
      ? `هل أنت متأكد من حذف الحساب "${userEmail}"؟ لا يمكن التراجع عن هذا الإجراء.`
      : `Are you sure you want to delete the account "${userEmail}"? This action cannot be undone.`;

    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSuccess(lang === 'ar' ? 'تم حذف الحساب بنجاح.' : 'Account deleted successfully.');
        setTimeout(() => setSuccess(''), 3000);
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error || (lang === 'ar' ? 'فشل حذف الحساب.' : 'Failed to delete account.'));
      }
    } catch (err) {
      console.error(err);
      setError(lang === 'ar' ? 'خطأ في الاتصال بالخادم.' : 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to translate roles
  const getRoleName = (userRole) => {
    if (userRole === 'super_admin') return lang === 'ar' ? 'المدير العام (مالك)' : 'General Director (Owner)';
    if (userRole === 'admin') return lang === 'ar' ? 'مهندس الموقع' : 'Site Engineer';
    return lang === 'ar' ? 'إدارة عليا' : 'Senior Management';
  };

  const getRoleClass = (userRole) => {
    if (userRole === 'super_admin') return 'role-super-admin';
    if (userRole === 'admin') return 'role-admin';
    return 'role-viewer';
  };

  // Count user statistics
  const totalCount = users.length;
  const superAdminCount = users.filter(u => u.role === 'super_admin').length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const viewerCount = users.filter(u => u.role === 'viewer').length;

  return (
    <div style={{ width: '100%' }}>
      {/* Top Banner/Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={24} style={{ color: 'var(--accent)' }} />
            {lang === 'ar' ? 'إدارة حسابات المهندسين والمنصة' : 'Engineers & Platform Accounts Management'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px' }}>
            {lang === 'ar' ? 'إضافة وتعديل وحذف حسابات المهندسين والإدارة العليا للموقع من هنا.' : 'Add, edit, and delete engineer and senior management accounts from here.'}
          </p>
        </div>

        {formMode === 'list' && (
          <button 
            className="btn btn-primary"
            onClick={handleOpenAdd}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={18} />
            {lang === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account'}
          </button>
        )}
      </div>

      {/* KPI Cards for User Management */}
      {formMode === 'list' && (
        <div className="kpi-container" style={{ marginBottom: '1.5rem' }}>
          <div className="kpi-card">
            <div className="kpi-details">
              <span className="kpi-title">{lang === 'ar' ? 'إجمالي الحسابات' : 'Total Accounts'}</span>
              <span className="kpi-value">{totalCount}</span>
              <span className="kpi-subtext">{lang === 'ar' ? 'الحسابات النشطة بالمنصة' : 'Active accounts in the platform'}</span>
            </div>
            <div className="kpi-icon-container">
              <Users size={24} />
            </div>
          </div>

          <div className="kpi-card success">
            <div className="kpi-details">
              <span className="kpi-title">{lang === 'ar' ? 'المهندسون' : 'Site Engineers'}</span>
              <span className="kpi-value">{adminCount}</span>
              <span className="kpi-subtext">{lang === 'ar' ? 'صلاحيات تعديل كاملة للموقع' : 'Full edit permissions for the site'}</span>
            </div>
            <div className="kpi-icon-container">
              <Shield size={24} />
            </div>
          </div>

          <div className="kpi-card pending">
            <div className="kpi-details">
              <span className="kpi-title">{lang === 'ar' ? 'الإدارة العليا' : 'Senior Management'}</span>
              <span className="kpi-value">{viewerCount}</span>
              <span className="kpi-subtext">{lang === 'ar' ? 'صلاحيات قراءة فقط' : 'Read-only access permissions'}</span>
            </div>
            <div className="kpi-icon-container">
              <ShieldCheck size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {error && (
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--color-danger)', background: 'rgba(239, 68, 68, 0.05)', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
          <AlertCircle size={16} style={{ color: 'var(--color-danger)' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--color-danger)', fontWeight: '600' }}>
            {error}
          </span>
        </div>
      )}

      {success && (
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--success)', background: 'rgba(16, 185, 129, 0.05)', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
          <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: '600' }}>
            {success}
          </span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {formMode === 'list' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-panel"
            style={{ width: '100%', padding: '1.5rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                {lang === 'ar' ? 'قائمة الحسابات المسجلة' : 'Registered Accounts List'}
              </h3>
            </div>

            {loading && users.length === 0 ? (
              <div className="table-responsive">
                <table className="project-table" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                  <thead>
                    <tr>
                      <th>{lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}</th>
                      <th>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</th>
                      <th>{lang === 'ar' ? 'نوع الحساب / الصلاحية' : 'Account Type / Role'}</th>
                      <th>{lang === 'ar' ? 'كلمة المرور' : 'Password'}</th>
                      <th style={{ textAlign: 'center' }}>{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((i) => (
                      <tr key={i}>
                        <td><div className="skeleton-hint" style={{ width: '120px', height: '16px', borderRadius: '4px' }}></div></td>
                        <td><div className="skeleton-hint" style={{ width: '180px', height: '16px', borderRadius: '4px' }}></div></td>
                        <td><div className="skeleton-hint" style={{ width: '90px', height: '22px', borderRadius: '12px' }}></div></td>
                        <td><div className="skeleton-hint" style={{ width: '80px', height: '16px', borderRadius: '4px' }}></div></td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                            <div className="skeleton-hint" style={{ width: '32px', height: '28px', borderRadius: '8px' }}></div>
                            <div className="skeleton-hint" style={{ width: '32px', height: '28px', borderRadius: '8px' }}></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="project-table" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                  <thead>
                    <tr>
                      <th>{lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}</th>
                      <th>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</th>
                      <th>{lang === 'ar' ? 'نوع الحساب / الصلاحية' : 'Account Type / Role'}</th>
                      <th>{lang === 'ar' ? 'كلمة المرور' : 'Password'}</th>
                      <th style={{ textAlign: 'center' }}>{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: '700' }}>{u.name}</td>
                        <td style={{ fontFamily: 'var(--font-english)' }}>{u.email}</td>
                        <td>
                          <span className={`user-role-badge ${getRoleClass(u.role)}`}>
                            {getRoleName(u.role)}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-english)', fontSize: '0.85rem' }}>
                          <span style={{ filter: 'blur(3px)', transition: 'filter 0.2s' }} onMouseEnter={(e) => e.target.style.filter = 'none'} onMouseLeave={(e) => e.target.style.filter = 'blur(3px)'} title={lang === 'ar' ? 'حرك الماوس للمعاينة' : 'Hover to view'}>
                            {u.password || '••••••••'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                            <button 
                              className="btn btn-secondary" 
                              onClick={() => handleOpenEdit(u)}
                              style={{ padding: '6px 10px', minWidth: 'auto', minHeight: 'auto' }}
                              title={lang === 'ar' ? 'تعديل الحساب' : 'Edit Account'}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              className="btn btn-secondary" 
                              onClick={() => handleDelete(u.id, u.email)}
                              disabled={u.id === currentUser.id}
                              style={{ 
                                padding: '6px 10px', 
                                minWidth: 'auto', 
                                minHeight: 'auto', 
                                background: 'rgba(239, 68, 68, 0.1)', 
                                borderColor: 'rgba(239, 68, 68, 0.2)', 
                                color: 'var(--danger)',
                                opacity: u.id === currentUser.id ? 0.3 : 1
                              }}
                              title={lang === 'ar' ? 'حذف الحساب' : 'Delete Account'}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-panel"
            style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: '2rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent)' }}>
                {formMode === 'edit' 
                  ? (lang === 'ar' ? 'تعديل الحساب الحالي' : 'Edit Account Details') 
                  : (lang === 'ar' ? 'إنشاء حساب جديد للمنصة' : 'Create New Platform Account')}
              </h3>
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={() => setFormMode('list')}
                style={{ padding: '6px', minWidth: 'auto', minHeight: 'auto', borderRadius: '50%' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Name */}
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'الاسم الكامل للمستخدم' : 'Full Name'}</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', right: lang === 'ar' ? '12px' : 'auto', left: lang === 'ar' ? 'auto' : '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  <input 
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: المهندس علي حاتم' : 'e.g., Engineer Ali Hatem'}
                    style={{ 
                      paddingRight: lang === 'ar' ? '2.5rem' : '1rem',
                      paddingLeft: lang === 'ar' ? '1rem' : '2.5rem'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'البريد الإلكتروني (اسم المستخدم)' : 'Email Address (Username)'}</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', right: lang === 'ar' ? '12px' : 'auto', left: lang === 'ar' ? 'auto' : '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  <input 
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@project.com"
                    style={{ 
                      paddingRight: lang === 'ar' ? '2.5rem' : '1rem',
                      paddingLeft: lang === 'ar' ? '1rem' : '2.5rem',
                      fontFamily: 'var(--font-english)'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', right: lang === 'ar' ? '12px' : 'auto', left: lang === 'ar' ? 'auto' : '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ 
                      paddingRight: lang === 'ar' ? '2.5rem' : '2.5rem',
                      paddingLeft: lang === 'ar' ? '2.5rem' : '2.5rem',
                      fontFamily: 'var(--font-english)'
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      left: lang === 'ar' ? '12px' : 'auto',
                      right: lang === 'ar' ? 'auto' : '12px',
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
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'نوع الصلاحية بالمنصة' : 'Role / Permissions'}</label>
                <select 
                  className="form-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="admin">{lang === 'ar' ? 'مهندس الموقع (كامل الصلاحيات)' : 'Site Engineer (Full Edit)'}</option>
                  <option value="viewer">{lang === 'ar' ? 'إدارة عليا (قراءة فقط للتقارير)' : 'Senior Management (Read Only)'}</option>
                  <option value="super_admin">{lang === 'ar' ? 'المدير العام (إدارة الموقع والحسابات)' : 'General Director (Site & Accounts Management)'}</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  disabled={loading}
                >
                  <Save size={18} />
                  {lang === 'ar' ? 'حفظ البيانات' : 'Save User'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setFormMode('list')}
                  style={{ padding: '0.75rem' }}
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
