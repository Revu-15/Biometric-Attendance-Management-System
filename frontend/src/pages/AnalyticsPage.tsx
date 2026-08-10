import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertOctagon, BarChart3, Users, Calendar } from 'lucide-react';
import { api } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getDashboardStats(), api.getClients(), api.getAttendanceLogs()])
      .then(([s, c, a]) => { setStats(s); setClients(c); setAttendance(a); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh', color: 'var(--text-secondary)' }}>
      Loading Analytics...
    </div>
  );

  // Attendance % per client
  const clientAttendancePct = clients.map(c => {
    const clientLogs = attendance.filter(a => a.client_id === c.id && a.status === 'PRESENT');
    const daysInMonth = 26; // working days
    const pct = Math.min(100, Math.round((clientLogs.length / daysInMonth) * 100));
    return { name: c.name, code: c.client_code, pct, present: clientLogs.length };
  }).sort((a, b) => b.pct - a.pct);

  // Anomaly detection — clients with duplicate/unknown punches
  const anomalies = clients.map(c => {
    const duplicates = attendance.filter(a => a.client_id === c.id && a.status === 'DUPLICATE_REJECTED').length;
    const unknowns = attendance.filter(a => a.biometric_user_id && !a.client_id && a.status === 'UNKNOWN_USER').length;
    return { name: c.name, code: c.client_code, duplicates, unknowns };
  }).filter(a => a.duplicates > 0);

  // Punch type breakdown across all logs
  const punchBreakdown: Record<string, number> = {};
  attendance.forEach(a => {
    punchBreakdown[a.punch_type || 'IN'] = (punchBreakdown[a.punch_type || 'IN'] || 0) + 1;
  });

  // Forecast (simplified trend extrapolation)
  const weeklyTrend = stats?.weekly_trend || [];
  const avgWeekly = weeklyTrend.length ? Math.round(weeklyTrend.reduce((s: number, d: any) => s + d.count, 0) / weeklyTrend.length) : 0;
  const forecastMonthly = avgWeekly * 4;

  const kpiCards = [
    {
      label: 'Avg Daily Attendance', value: avgWeekly, sub: 'Based on last 7 days',
      color: '#3B82F6', icon: <BarChart3 size={20} color="#3B82F6" />
    },
    {
      label: 'Monthly Forecast', value: forecastMonthly, sub: 'Projected attendances',
      color: '#10B981', icon: <TrendingUp size={20} color="#10B981" />
    },
    {
      label: 'Active Clients', value: stats?.active_clients || 0, sub: 'With valid plans',
      color: '#8B5CF6', icon: <Users size={20} color="#8B5CF6" />
    },
    {
      label: 'Anomalies Detected', value: anomalies.length, sub: 'Unusual duplicate patterns',
      color: '#F43F5E', icon: <AlertOctagon size={20} color="#F43F5E" />
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(139,92,246,0.08))',
        border: '1px solid rgba(245,158,11,0.2)', borderRadius: '16px', padding: '1.25rem 1.5rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>📊 Analytics & Intelligence</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Attendance trends · Anomaly detection · Client-level insights · Monthly forecasting
        </p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {kpiCards.map((card, i) => (
          <div key={i} className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{card.label}</span>
              {card.icon}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Client Attendance % Ranking */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Client Attendance % Ranking
          </h3>
          {clientAttendancePct.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>No data yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {clientAttendancePct.slice(0, 8).map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: '20px', textAlign: 'right', fontWeight: 700 }}>#{i + 1}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, width: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                  <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${c.pct}%`, height: '100%', borderRadius: '4px',
                      background: c.pct >= 75 ? 'linear-gradient(to right, #065F46, #10B981)' : c.pct >= 50 ? 'linear-gradient(to right, #D97706, #F59E0B)' : 'linear-gradient(to right, #9F1239, #F43F5E)',
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                  <span style={{
                    fontSize: '0.78rem', fontWeight: 800, width: '38px', textAlign: 'right',
                    color: c.pct >= 75 ? '#34D399' : c.pct >= 50 ? '#FBBF24' : '#FB7185'
                  }}>{c.pct}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Punch Type Breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Punch Type Breakdown
          </h3>
          {Object.keys(punchBreakdown).length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>No punch data yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(punchBreakdown).sort((a, b) => b[1] - a[1]).map(([type, count], i) => {
                const total = Object.values(punchBreakdown).reduce((s, v) => s + v, 0);
                const pct = Math.round((count / total) * 100);
                const colors = ['#06B6D4', '#10B981', '#F59E0B', '#8B5CF6', '#F43F5E', '#3B82F6'];
                const color = colors[i % colors.length];
                return (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, width: '80px', color }}>{type}</span>
                    <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: '4px', background: color, transition: 'width 0.6s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, width: '30px', textAlign: 'right' }}>{count}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: '32px', textAlign: 'right' }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Anomaly Detection */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertOctagon size={18} color="#F43F5E" /> Anomaly Detection
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Clients with unusual patterns: repeated duplicate punches, same biometric used excessively.
        </p>
        {anomalies.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(16,185,129,0.05)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.15)' }}>
            ✅ No anomalies detected — all punch patterns look normal.
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr><th>Client Name</th><th>Client ID</th><th>Duplicate Punches</th><th>Risk Level</th></tr>
              </thead>
              <tbody>
                {anomalies.map((a, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{a.name}</td>
                    <td><span style={{ color: '#06B6D4', fontFamily: 'monospace' }}>{a.code}</span></td>
                    <td><span style={{ color: '#FBBF24', fontWeight: 700 }}>{a.duplicates} duplicates</span></td>
                    <td>
                      <span className={`badge ${a.duplicates > 5 ? 'badge-plan_expired' : 'badge-warning'}`}>
                        {a.duplicates > 5 ? '🔴 HIGH' : '🟡 MEDIUM'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Forecast Card */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.06))' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} color="#8B5CF6" /> Attendance Forecast
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {[
            { label: 'Expected This Week', value: avgWeekly * 5, unit: 'attendances', color: '#3B82F6' },
            { label: 'Expected This Month', value: forecastMonthly, unit: 'attendances', color: '#8B5CF6' },
            { label: 'Expected Revenue', value: `₹${((stats?.active_plans || 0) * 3500).toLocaleString()}`, unit: 'monthly estimate', color: '#10B981' },
          ].map((f, i) => (
            <div key={i} style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{f.label}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: f.color }}>{f.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{f.unit}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          * Forecast based on 7-day rolling average. Actual figures depend on plan renewals, new registrations, and device uptime.
        </p>
      </div>
    </div>
  );
};
