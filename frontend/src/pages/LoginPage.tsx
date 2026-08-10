import React, { useState } from 'react';
import { Fingerprint, Lock, Mail, ShieldAlert, ShieldCheck, User } from 'lucide-react';
import { api, setAuthToken } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (userRole: string, userName: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<'admin' | 'staff' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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

  const fillAdmin = () => {
    setEmail('admin@system.com');
    setPassword('admin123');
    setActiveRole('admin');
    setError(null);
  };

  const fillStaff = () => {
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
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '68px', height: '68px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 32px rgba(6,182,212,0.45), 0 0 0 1px rgba(6,182,212,0.2)',
            marginBottom: '1.25rem'
          }}>
            <Fingerprint size={36} color="white" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '6px' }}>
            ATTENDIQ
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Biometric Attendance & Management Portal
          </p>
        </div>

        {/* Role Selector Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.5rem' }}>
          {/* Super Admin Card */}
          <button type="button" onClick={fillAdmin}
            style={{
              padding: '1rem', borderRadius: '14px', border: `2px solid ${activeRole === 'admin' ? '#06B6D4' : 'rgba(255,255,255,0.08)'}`,
              background: activeRole === 'admin' ? 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(59,130,246,0.1))' : 'rgba(255,255,255,0.03)',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease',
              boxShadow: activeRole === 'admin' ? '0 0 20px rgba(6,182,212,0.2)' : 'none'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #0E7490, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={15} color="white" />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: activeRole === 'admin' ? '#06B6D4' : 'var(--text-primary)' }}>
                Super Admin
              </span>
            </div>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Full system access · All modules · Settings & Audit
            </p>
            {activeRole === 'admin' && (
              <div style={{ marginTop: '6px', fontSize: '0.65rem', color: '#06B6D4', fontWeight: 700, fontFamily: 'monospace' }}>
                admin@system.com · admin123
              </div>
            )}
          </button>

          {/* Staff Operator Card */}
          <button type="button" onClick={fillStaff}
            style={{
              padding: '1rem', borderRadius: '14px', border: `2px solid ${activeRole === 'staff' ? '#F59E0B' : 'rgba(255,255,255,0.08)'}`,
              background: activeRole === 'staff' ? 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(234,88,12,0.06))' : 'rgba(255,255,255,0.03)',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease',
              boxShadow: activeRole === 'staff' ? '0 0 20px rgba(245,158,11,0.15)' : 'none'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #D97706, #F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={15} color="white" />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: activeRole === 'staff' ? '#F59E0B' : 'var(--text-primary)' }}>
                Staff Operator
              </span>
            </div>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Daily operations · Attendance · Payments · Reports
            </p>
            {activeRole === 'staff' && (
              <div style={{ marginTop: '6px', fontSize: '0.65rem', color: '#F59E0B', fontWeight: 700, fontFamily: 'monospace' }}>
                staff@system.com · staff123
              </div>
            )}
          </button>
        </div>

        {/* Login Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
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
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setActiveRole(null); }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
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
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.25rem', letterSpacing: '0.02em' }}>
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

          <div style={{ marginTop: '1.25rem', padding: '0.85rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
              🔐 Role is enforced server-side via JWT. The backend verifies your role before granting access to any operation.
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
