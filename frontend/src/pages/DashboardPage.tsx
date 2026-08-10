import React, { useEffect, useState } from 'react';
import {
  Users, Clock, AlertTriangle, Zap, CheckCircle2, XCircle, WifiOff,
  Cpu, RefreshCw, UtensilsCrossed, TrendingUp, ArrowRight, Activity,
  ShieldAlert, CreditCard
} from 'lucide-react';
import { DashboardStats } from '../types';
import { api } from '../services/api';

interface DashboardPageProps {
  onOpenSimulator: () => void;
  onSelectClient?: (clientId: number) => void;
  wsPunchEvent: any;
}

// Mini donut SVG chart
function DonutChart({ present, absent, late, unknown }: { present: number; absent: number; late: number; unknown: number }) {
  const total = present + absent + late + unknown || 1;
  const r = 48; const cx = 60; const cy = 60; const strokeW = 14;
  const circumference = 2 * Math.PI * r;

  const segments = [
    { value: present, color: '#10B981', label: 'Present' },
    { value: late,    color: '#F59E0B', label: 'Late' },
    { value: absent,  color: '#F43F5E', label: 'Absent' },
    { value: unknown, color: '#6B7280', label: 'Unknown' },
  ];

  let offset = 0;
  const arcs = segments.map(seg => {
    const pct = seg.value / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const arc = { ...seg, dash, gap, offset: offset * circumference, pct: Math.round(pct * 100) };
    offset += pct;
    return arc;
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeW} />
        {arcs.map((arc, i) => arc.value > 0 && (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={arc.color} strokeWidth={strokeW}
            strokeDasharray={`${arc.dash} ${arc.gap}`}
            strokeDashoffset={-arc.offset + circumference * 0.25}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#F9FAFB" fontSize="15" fontWeight="800">
          {Math.round((present / total) * 100)}%
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#9CA3AF" fontSize="9">
          Present
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {arcs.map((arc, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: arc.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{arc.label}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F9FAFB', marginLeft: 'auto' }}>{arc.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenSimulator, onSelectClient, wsPunchEvent }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [liveStream, setLiveStream] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<any[]>([]);

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (wsPunchEvent?.data) {
      setLiveStream(prev => [wsPunchEvent.data, ...prev.slice(0, 9)]);
      loadAll();
    }
  }, [wsPunchEvent]);

  const loadAll = async () => {
    try {
      const [statsData, notifData, devData] = await Promise.all([
        api.getDashboardStats(),
        api.getNotifications(),
        api.getDevices(),
      ]);
      setStats(statsData);
      setNotifications(notifData || []);
      setDevices(devData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(6,182,212,0.2)', borderTopColor: '#06B6D4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading ATTENDIQ Operations Dashboard…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const maxWeekly = Math.max(...stats.weekly_trend.map(w => w.count), 1);
  const todayPresent = stats.todays_attendance;
  const todayAbsent = Math.max(0, stats.active_clients - stats.todays_attendance);
  const todayLate = stats.recent_punches.filter(p => p.status === 'LATE').length;
  const unknownPunches = stats.recent_punches.filter(p => p.status === 'UNKNOWN_USER').length;
  const onlineDevices = devices.filter(d => d.status === 'ONLINE').length;
  const syncRate = devices.length ? Math.round((onlineDevices / devices.length) * 100) : 0;

  const topStatCards = [
    {
      label: 'Attendance Today',
      value: todayPresent,
      sub: `Present: ${todayPresent} | Absent: ${todayAbsent}`,
      color: '#3B82F6', bg: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
      icon: <Clock size={22} color="white" />
    },
    {
      label: 'Biometric Logs Today',
      value: stats.recent_punches.length,
      sub: unknownPunches > 0 ? `⚠ ${unknownPunches} unknown punches` : 'All events validated',
      color: '#10B981', bg: 'linear-gradient(135deg, #065F46, #10B981)',
      icon: <Activity size={22} color="white" />
    },
    {
      label: 'Device Health',
      value: `${onlineDevices}/${devices.length}`,
      sub: `Online devices`,
      color: '#8B5CF6', bg: 'linear-gradient(135deg, #4C1D95, #8B5CF6)',
      icon: <Cpu size={22} color="white" />
    },
    {
      label: 'Sync Success Rate',
      value: `${syncRate}%`,
      sub: devices.filter(d => d.status !== 'ONLINE').length > 0 ? `⚠ ${devices.filter(d => d.status !== 'ONLINE').length} device offline` : 'All devices syncing',
      color: '#A855F7', bg: 'linear-gradient(135deg, #581C87, #A855F7)',
      icon: <RefreshCw size={22} color="white" />
    },
  ];

  const secondRowCards = [
    {
      label: 'Monthly Manual Entries',
      value: '—',
      sub: 'Manual overrides this month',
      icon: <CheckCircle2 size={18} color="#06B6D4" />, color: '#06B6D4'
    },
    {
      label: 'Plans Expiring Soon',
      value: stats.expiring_plans,
      sub: 'Within 7 days',
      icon: <AlertTriangle size={18} color="#F59E0B" />, color: '#F59E0B'
    },
    {
      label: 'Late Arrivals Today',
      value: todayLate,
      sub: 'After late threshold',
      icon: <Clock size={18} color="#F43F5E" />, color: '#F43F5E'
    },
    {
      label: 'Total Active Clients',
      value: stats.active_clients,
      sub: `of ${stats.total_clients} registered`,
      icon: <Users size={18} color="#10B981" />, color: '#10B981'
    },
  ];

  const workflowSteps = [
    { step: 'CLIENT SCANS', icon: '👆', desc: 'Fingerprint detected' },
    { step: 'DEVICE SENDS', icon: '📡', desc: 'Webhook POST' },
    { step: 'ENGINE VALIDATES', icon: '⚙️', desc: 'Plan / Dupe / Rules' },
    { step: 'DB RECORDS', icon: '💾', desc: 'Attendance saved' },
    { step: 'DASHBOARD', icon: '⚡', desc: 'Real-time update' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Live Punch Alert Bar */}
      {liveStream.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(59,130,246,0.08))',
          border: '1px solid rgba(6,182,212,0.4)', borderRadius: '12px', padding: '0.8rem 1.2rem',
          display: 'flex', alignItems: 'center', gap: '12px',
          boxShadow: '0 0 24px rgba(6,182,212,0.18)'
        }}>
          <span className="pulse-dot" />
          <div style={{ flex: 1, fontSize: '0.85rem' }}>
            <strong style={{ color: '#06B6D4' }}>LIVE PUNCH RECEIVED</strong>
            {' → '}
            <strong>{liveStream[0].client?.name || 'Unknown Biometric ID'}</strong>
            {' '}
            <span className={`badge badge-${liveStream[0].status?.toLowerCase?.()}`}>{liveStream[0].status}</span>
            {liveStream[0].attendance && (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginLeft: '8px' }}>
                · {liveStream[0].attendance.time} · {liveStream[0].attendance.punch_type}
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>WebSocket</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.08))',
        border: '1px solid rgba(59,130,246,0.2)', borderRadius: '16px', padding: '1.25rem 1.5rem'
      }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '4px' }}>
          Attendance Operations Overview
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          End-to-end attendance analytics across devices, biometric logs, processed attendance, manual corrections, and sync reliability.
        </p>
      </div>

      {/* TOP STAT CARDS — 4 colored */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {topStatCards.map((card, i) => (
          <div key={i} style={{
            background: card.bg, borderRadius: '14px', padding: '1.25rem',
            position: 'relative', overflow: 'hidden', boxShadow: `0 8px 24px ${card.color}30`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
                {card.label}
              </div>
              <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)' }}>
                {card.icon}
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white', margin: '8px 0 4px', letterSpacing: '-0.03em' }}>
              {card.value}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)' }}>{card.sub}</div>
            <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          </div>
        ))}
      </div>

      {/* SECOND ROW — smaller info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {secondRowCards.map((card, i) => (
          <div key={i} className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              {card.icon}
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {card.label}
              </span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* MAIN CHARTS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem' }}>

        {/* Bar Chart — Attendance vs Trend */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Attendance vs Biometric Trend</h3>
              <p style={{ fontSize: '0.77rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Daily biometric records — last 7 days</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.72rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#3B82F6' }} />
                Attendance
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#F59E0B' }} />
                Manual Entries
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '160px' }}>
            {stats.weekly_trend.map((day, idx) => {
              const h = Math.round((day.count / maxWeekly) * 100);
              const manualH = Math.max(2, Math.round(Math.random() * 15)); // placeholder manual bar
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-secondary)' }}>{day.count}</span>
                  <div style={{ width: '100%', display: 'flex', gap: '2px', alignItems: 'flex-end', justifyContent: 'center', height: '130px' }}>
                    <div style={{ width: '12px', height: `${Math.max(h, 6)}%`, background: 'linear-gradient(to top, #1D4ED8, #3B82F6)', borderRadius: '4px 4px 0 0', transition: 'height 0.4s' }} />
                    <div style={{ width: '12px', height: `${manualH}%`, background: 'linear-gradient(to top, #D97706, #F59E0B)', borderRadius: '4px 4px 0 0', transition: 'height 0.4s' }} />
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '6px' }}>{day.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Donut Chart — Today's Status */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>Today Attendance Status</h3>
          <p style={{ fontSize: '0.77rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Present, absent, late, and unknown distribution
          </p>
          <DonutChart
            present={todayPresent}
            absent={todayAbsent}
            late={todayLate}
            unknown={unknownPunches}
          />
        </div>
      </div>

      {/* WORKFLOW VISUALIZER */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Live Workflow Pipeline
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', overflowX: 'auto' }}>
          {workflowSteps.map((step, i) => (
            <React.Fragment key={i}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                padding: '0.75rem 1rem', borderRadius: '12px', minWidth: '110px',
                background: i === 4 ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i === 4 ? 'rgba(6,182,212,0.3)' : 'var(--border-color)'}`,
                flexShrink: 0
              }}>
                <span style={{ fontSize: '1.4rem' }}>{step.icon}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.06em', color: i === 4 ? '#06B6D4' : 'var(--text-primary)', textTransform: 'uppercase', textAlign: 'center' }}>{step.step}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>{step.desc}</span>
              </div>
              {i < workflowSteps.length - 1 && (
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px', color: 'var(--text-muted)', flexShrink: 0 }}>
                  <ArrowRight size={16} />
                </div>
              )}
            </React.Fragment>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', flexShrink: 0, paddingLeft: '1rem' }}>
            <button onClick={onOpenSimulator} className="btn btn-primary" style={{ fontSize: '0.78rem', padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}>
              <Zap size={14} /> Simulate Punch
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM GRID: Alerts + Recent Punches */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.25rem' }}>

        {/* Alerts Panel */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={16} color="#F59E0B" /> Alerts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notifications.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                ✅ No active alerts
              </div>
            ) : notifications.slice(0, 5).map((n: any, i: number) => (
              <div key={i} style={{
                padding: '0.65rem 0.85rem', borderRadius: '8px',
                background: n.type === 'danger' ? 'rgba(244,63,94,0.08)' : n.type === 'warning' ? 'rgba(245,158,11,0.08)' : 'rgba(6,182,212,0.08)',
                border: `1px solid ${n.type === 'danger' ? 'rgba(244,63,94,0.2)' : n.type === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(6,182,212,0.2)'}`
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: n.type === 'danger' ? '#FB7185' : n.type === 'warning' ? '#FBBF24' : '#06B6D4' }}>
                  {n.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.message}</div>
              </div>
            ))}
            {stats.expiring_plans > 0 && (
              <div style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FBBF24' }}>⚠ Plans Expiring</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{stats.expiring_plans} plan(s) expire within 7 days</div>
              </div>
            )}
            {devices.filter(d => d.status !== 'ONLINE').length > 0 && (
              <div style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FB7185', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <WifiOff size={12} /> Device Offline
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{devices.filter(d => d.status !== 'ONLINE').length} device(s) offline</div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Punches Table */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
              Today's Recent Biometric Punches
            </h3>
            {liveStream.length > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#06B6D4', fontWeight: 600 }}>
                <span className="pulse-dot" /> Live updating
              </span>
            )}
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Client Name</th>
                  <th>Client ID</th>
                  <th>Punch Type</th>
                  <th>Device</th>
                  <th>Validation</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_punches.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>
                      No biometric punches recorded yet today.{' '}
                      <button onClick={onOpenSimulator}
                        style={{ background: 'none', border: 'none', color: '#06B6D4', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                        Launch Punch Simulator →
                      </button>
                    </td>
                  </tr>
                ) : (
                  stats.recent_punches.map((punch) => (
                    <tr key={punch.id}>
                      <td style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{punch.time}</td>
                      <td style={{ fontWeight: 600 }}>{punch.client_name}</td>
                      <td><span style={{ color: '#06B6D4', fontFamily: 'monospace', fontSize: '0.8rem' }}>{punch.client_code}</span></td>
                      <td>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px',
                          background: 'rgba(59,130,246,0.12)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.25)'
                        }}>{punch.punch_type}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{punch.device_id}</td>
                      <td>
                        <span className={`badge badge-${punch.status.toLowerCase().replace(/ /g, '_')}`}>
                          {punch.status === 'PRESENT' ? '✓ ' : punch.status === 'DUPLICATE_REJECTED' ? '⊘ ' : ''}
                          {punch.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
