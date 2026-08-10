import React, { useEffect, useState } from 'react';
import { Bell, AlertTriangle, XCircle, CheckCircle2, Clock, CreditCard } from 'lucide-react';
import { api } from '../services/api';

export const AlertsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getNotifications(), api.getDashboardStats()])
      .then(([n, s]) => { setNotifications(n || []); setStats(s); })
      .finally(() => setLoading(false));
  }, []);

  const alertCategories = [
    {
      title: '⚠ Plan Expiry Alerts',
      color: '#F59E0B',
      bgColor: 'rgba(245,158,11,0.08)',
      borderColor: 'rgba(245,158,11,0.25)',
      count: stats?.expiring_plans || 0,
      desc: 'Plans expiring within 7 days',
      icon: <Clock size={18} color="#F59E0B" />
    },
    {
      title: '🔴 Overdue Payments',
      color: '#F43F5E',
      bgColor: 'rgba(244,63,94,0.08)',
      borderColor: 'rgba(244,63,94,0.25)',
      count: 0,
      desc: 'Clients with pending balances',
      icon: <CreditCard size={18} color="#F43F5E" />
    },
    {
      title: '📡 Device Alerts',
      color: '#8B5CF6',
      bgColor: 'rgba(139,92,246,0.08)',
      borderColor: 'rgba(139,92,246,0.25)',
      count: 0,
      desc: 'Offline devices or sync failures',
      icon: <XCircle size={18} color="#8B5CF6" />
    },
    {
      title: '✅ System Health',
      color: '#10B981',
      bgColor: 'rgba(16,185,129,0.08)',
      borderColor: 'rgba(16,185,129,0.25)',
      count: 1,
      desc: 'Backend & WebSocket active',
      icon: <CheckCircle2 size={18} color="#10B981" />
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.1), rgba(245,158,11,0.06))', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '16px', padding: '1.25rem 1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🔔 Alerts & Notifications</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Low attendance · Payment due · Plan expiry · Device failure · System events
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {alertCategories.map((cat, i) => (
          <div key={i} style={{ padding: '1.25rem', borderRadius: '14px', background: cat.bgColor, border: `1px solid ${cat.borderColor}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              {cat.icon}
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: cat.color }}>{cat.title}</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: cat.color }}>{cat.count}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{cat.desc}</div>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={16} color="#06B6D4" /> System Notifications
        </h3>
        {notifications.length === 0 && (stats?.expiring_plans || 0) === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={36} color="#10B981" style={{ marginBottom: '0.75rem', opacity: 0.6 }} />
            <p style={{ fontWeight: 600 }}>All Systems Clear</p>
            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>No alerts at this time. The system is operating normally.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats?.expiring_plans > 0 && (
              <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <AlertTriangle size={16} color="#F59E0B" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#FBBF24', fontSize: '0.88rem' }}>Plan Expiry Warning</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
                    {stats.expiring_plans} client plan(s) are expiring within the next 7 days. Go to Client Directory → renew plans to avoid service interruption.
                  </div>
                </div>
              </div>
            )}
            {notifications.map((n: any, i: number) => (
              <div key={i} style={{ padding: '1rem', borderRadius: '10px', background: n.type === 'danger' ? 'rgba(244,63,94,0.08)' : 'rgba(6,182,212,0.08)', border: `1px solid ${n.type === 'danger' ? 'rgba(244,63,94,0.2)' : 'rgba(6,182,212,0.2)'}`, display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Bell size={15} color={n.type === 'danger' ? '#F43F5E' : '#06B6D4'} style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: n.type === 'danger' ? '#FB7185' : '#06B6D4' }}>{n.title}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>{n.message}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
