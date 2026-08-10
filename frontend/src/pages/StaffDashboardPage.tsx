import React, { useEffect, useState } from 'react';
import { Users, Clock, CheckCircle2, XCircle, Search, Edit3, CreditCard, Zap } from 'lucide-react';
import { api } from '../services/api';

interface StaffDashboardProps {
  userName: string;
  onOpenSimulator: () => void;
  wsPunchEvent: any;
  setCurrentTab: (tab: string) => void;
}

export const StaffDashboardPage: React.FC<StaffDashboardProps> = ({
  userName, onOpenSimulator, wsPunchEvent, setCurrentTab
}) => {
  const [stats, setStats] = useState<any>(null);
  const [todayLogs, setTodayLogs] = useState<any[]>([]);
  const [liveStream, setLiveStream] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (wsPunchEvent?.data) {
      setLiveStream(prev => [wsPunchEvent.data, ...prev.slice(0, 6)]);
      loadData();
    }
  }, [wsPunchEvent]);

  const loadData = async () => {
    try {
      const [s, logs] = await Promise.all([
        api.getDashboardStats(),
        api.getTodaysAttendance()
      ]);
      setStats(s);
      setTodayLogs(logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid rgba(245,158,11,0.2)', borderTopColor: '#F59E0B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)' }}>Loading Operations Dashboard…</span>
      </div>
    );
  }

  const presentCount = todayLogs.filter(l => l.status === 'PRESENT').length;
  const absentCount = Math.max(0, stats.active_clients - presentCount);
  const lateCount = todayLogs.filter(l => l.status === 'LATE').length;

  const quickActions = [
    { label: 'Search Client', icon: <Search size={16} />, tab: 'clients', color: '#06B6D4' },
    { label: 'Manual Attendance', icon: <Edit3 size={16} />, tab: 'attendance', color: '#10B981' },
    { label: 'Record Payment', icon: <CreditCard size={16} />, tab: 'payments', color: '#8B5CF6' },
    { label: 'Punch Simulator', icon: <Zap size={16} />, tab: 'simulator', color: '#F59E0B' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Live event bar */}
      {liveStream.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(234,88,12,0.06))',
          border: '1px solid rgba(245,158,11,0.35)', borderRadius: '12px',
          padding: '0.8rem 1.2rem', display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <span className="pulse-dot" style={{ background: '#F59E0B', boxShadow: '0 0 0 0 rgba(245,158,11,0.7)' }} />
          <span style={{ fontSize: '0.85rem' }}>
            <strong style={{ color: '#FBBF24' }}>LIVE SCAN → </strong>
            <strong>{liveStream[0].client?.name || 'Unknown ID'}</strong>
            {' '}
            <span className={`badge badge-${liveStream[0].status?.toLowerCase?.()}`}>{liveStream[0].status}</span>
          </span>
        </div>
      )}

      {/* Greeting */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(234,88,12,0.06))',
        border: '1px solid rgba(245,158,11,0.2)', borderRadius: '16px', padding: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{greeting}, {userName.split(' ')[0]} 👋</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Staff Operator · Daily Operations View
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #D97706, #F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(245,158,11,0.35)' }}>
            <Users size={24} color="white" />
          </div>
        </div>
      </div>

      {/* 3 KPI Cards — Staff view */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'linear-gradient(135deg, #1e3a5f, #2563EB)', boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Today's Clients</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white', margin: '6px 0 2px' }}>{stats.active_clients}</div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)' }}>Active registered clients</div>
        </div>

        <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'linear-gradient(135deg, #064E3B, #10B981)', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <CheckCircle2 size={12} /> Present
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white', margin: '6px 0 2px' }}>{presentCount}</div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)' }}>{lateCount > 0 ? `incl. ${lateCount} late` : 'On time today'}</div>
        </div>

        <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'linear-gradient(135deg, #7F1D1D, #F43F5E)', boxShadow: '0 8px 24px rgba(244,63,94,0.3)' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <XCircle size={12} /> Absent
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white', margin: '6px 0 2px' }}>{absentCount}</div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)' }}>Not scanned today</div>
        </div>
      </div>

      {/* Main panel: Attendance feed + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '1.25rem' }}>

        {/* Today's Attendance Feed */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Clock size={17} color="#06B6D4" /> Today's Attendance
            </h3>
            {liveStream.length > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: '#06B6D4', fontWeight: 600 }}>
                <span className="pulse-dot" /> Live
              </span>
            )}
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Client Name</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>
                      No attendance recorded yet today.
                      <button onClick={onOpenSimulator} style={{ background: 'none', border: 'none', color: '#06B6D4', cursor: 'pointer', fontWeight: 600, marginLeft: '6px' }}>
                        Use Simulator →
                      </button>
                    </td>
                  </tr>
                ) : (
                  todayLogs.slice(0, 20).map((log, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem' }}>
                        {log.attendance_time ? String(log.attendance_time).slice(0, 5) : '—'}
                      </td>
                      <td style={{ fontWeight: 600 }}>{log.client_name || '—'}</td>
                      <td>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', background: 'rgba(59,130,246,0.1)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.2)' }}>
                          {log.punch_type || 'IN'}
                        </span>
                      </td>
                      <td><span className={`badge badge-${(log.status || '').toLowerCase()}`}>{log.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {quickActions.map((action, i) => (
                <button key={i}
                  onClick={() => action.tab === 'simulator' ? onOpenSimulator() : setCurrentTab(action.tab)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '0.7rem 0.9rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                    background: `${action.color}12`, color: action.color,
                    fontWeight: 700, fontSize: '0.82rem', textAlign: 'left',
                    transition: 'all 0.15s ease', width: '100%',
                    borderLeft: `3px solid ${action.color}`
                  }}>
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Attendance Summary Box */}
          <div className="glass-card" style={{ padding: '1.1rem' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
              Today Summary
            </h4>
            {[
              { label: 'Present', value: presentCount, color: '#10B981' },
              { label: 'Absent', value: absentCount, color: '#F43F5E' },
              { label: 'Late', value: lateCount, color: '#F59E0B' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < 2 ? '1px solid var(--border-color)' : 'none' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
