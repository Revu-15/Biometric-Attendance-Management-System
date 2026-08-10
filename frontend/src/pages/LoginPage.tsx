import React, { useState } from 'react';
import { Fingerprint, Lock, Mail, ShieldAlert, ShieldCheck, User, UserPlus, Info } from 'lucide-react';
import { api, setAuthToken } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (userRole: string, userName: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<'admin' | 'staff' | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ email, password });
      setAuthToken(res.access_token);
      localStorage.setItem('bio_user_role', res.role);
      localStorage.setItem('bio_user_name', res.name);
      onLoginSuccess(res.role, res.name);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.register({
        name: regName,
        email: regEmail,
        password: regPassword
      });
      setAuthToken(res.access_token);
      localStorage.setItem('bio_user_role', res.role);
      localStorage.setItem('bio_user_name', res.name);
      onLoginSuccess(res.role, res.name);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setMode('login');
    setEmail('admin@system.com');
    setPassword('admin123');
    setActiveRole('admin');
    setError(null);
  };

  const fillStaff = () => {
    setMode('login');
    setEmail('staff@system.com');
    setPassword('staff123');
    setActiveRole('staff');
    setError(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `
        radial-gradient(ellipse at top right, rgba(6,182,212,0.18) 0%, transparent 55%),
        radial-gradient(ellipse at bottom left, rgba(59,130,246,0.14) 0%, transparent 55%),
        radial-gradient(ellipse at center, rgba(139,92,246,0.06) 0%, transparent 70%),
        var(--bg-dark)
      `,
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '40px 40px', pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '480px', position: 'relative' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '68px', height: '68px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 32px rgba(6,182,212,0.45), 0 0 0 1px rgba(6,182,212,0.2)',
            marginBottom: '1rem'
          }}>
            <Fingerprint size={36} color="white" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '4px' }}>
            ATTENDIQ
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Biometric Attendance & Management Portal
          </p>
        </div>

        {/* Demo Quick Access Cards */}
        {mode === 'login' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.25rem' }}>
            {/* Super Admin Card */}
            <button type="button" onClick={fillAdmin}
              style={{
                padding: '0.85rem 0.9rem', borderRadius: '12px', border: `2px solid ${activeRole === 'admin' ? '#06B6D4' : 'rgba(255,255,255,0.08)'}`,
                background: activeRole === 'admin' ? 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(59,130,246,0.1))' : 'rgba(255,255,255,0.03)',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease',
                boxShadow: activeRole === 'admin' ? '0 0 20px rgba(6,182,212,0.2)' : 'none'
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '7px', background: 'linear-gradient(135deg, #0E7490, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={14} color="white" />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: activeRole === 'admin' ? '#06B6D4' : 'var(--text-primary)' }}>
                  Super Admin
                </span>
              </div>
              <p style={{ fontSize: '0.66rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                Full system access · All modules
              </p>
            </button>

            {/* Staff Operator Card */}
            <button type="button" onClick={fillStaff}
              style={{
                padding: '0.85rem 0.9rem', borderRadius: '12px', border: `2px solid ${activeRole === 'staff' ? '#F59E0B' : 'rgba(255,255,255,0.08)'}`,
                background: activeRole === 'staff' ? 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(234,88,12,0.06))' : 'rgba(255,255,255,0.03)',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease',
                boxShadow: activeRole === 'staff' ? '0 0 20px rgba(245,158,11,0.15)' : 'none'
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '7px', background: 'linear-gradient(135deg, #D97706, #F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={14} color="white" />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: activeRole === 'staff' ? '#F59E0B' : 'var(--text-primary)' }}>
                  Staff Operator
                </span>
              </div>
              <p style={{ fontSize: '0.66rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                Daily operations · Attendance
              </p>
            </button>
          </div>
        )}

        {/* Main Panel */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          {/* Mode Switch Tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              style={{
                flex: 1, padding: '0.55rem', borderRadius: '8px', border: 'none',
                background: mode === 'login' ? 'linear-gradient(135deg, #06B6D4, #3B82F6)' : 'transparent',
                color: mode === 'login' ? 'white' : 'var(--text-secondary)',
                fontWeight: mode === 'login' ? 700 : 500, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s ease'
              }}>
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              style={{
                flex: 1, padding: '0.55rem', borderRadius: '8px', border: 'none',
                background: mode === 'register' ? 'linear-gradient(135deg, #D97706, #F59E0B)' : 'transparent',
                color: mode === 'register' ? 'white' : 'var(--text-secondary)',
                fontWeight: mode === 'register' ? 700 : 500, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s ease'
              }}>
              Create Account
            </button>
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)',
              color: '#FB7185', padding: '0.75rem 1rem', borderRadius: '10px',
              fontSize: '0.83rem', marginBottom: '1.25rem'
            }}>
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    id="login-email"
                    type="email"
                    required
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setActiveRole(null); }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    id="login-password"
                    type="password"
                    required
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setActiveRole(null); }}
                  />
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.92rem', marginTop: '0.25rem', letterSpacing: '0.02em' }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Authenticating...
                  </span>
                ) : (
                  `Sign In${activeRole === 'admin' ? ' as Super Admin' : activeRole === 'staff' ? ' as Staff Operator' : ''}`
                )}
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                padding: '0.75rem', borderRadius: '10px', background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'flex-start', gap: '8px'
              }}>
                <Info size={16} color="#F59E0B" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div style={{ fontSize: '0.72rem', color: '#FBBF24', lineHeight: 1.45 }}>
                  <strong>Staff Operator Registration:</strong> Self-created accounts are automatically registered as <strong>Staff Operators</strong> (Daily Operations & Attendance). Super Admin access is restricted.
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '5px', color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="e.g. Rahul Patil"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '5px', color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="name@company.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '5px', color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    id="reg-password"
                    type="password"
                    required
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="At least 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '5px', color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    id="reg-confirm-password"
                    type="password"
                    required
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Re-enter password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%', padding: '0.85rem', fontSize: '0.92rem', marginTop: '0.35rem',
                  background: 'linear-gradient(135deg, #D97706, #F59E0B)', border: 'none', letterSpacing: '0.02em'
                }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Creating Staff Account...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                    <UserPlus size={16} /> Register as Staff Operator
                  </span>
                )}
              </button>
            </form>
          )}

          <div style={{ marginTop: '1.25rem', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.67rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
              🔐 Role is enforced server-side via JWT. Backend guarantees single Super Admin control.
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '1.25rem' }}>
          ATTENDIQ v1.0 · Biometric Attendance Management System
        </p>
      </div>
    </div>
  );
};
