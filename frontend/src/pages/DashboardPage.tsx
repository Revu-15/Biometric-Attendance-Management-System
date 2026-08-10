import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Clock, AlertTriangle, Zap, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import { DashboardStats } from '../types';
import { api } from '../services/api';

interface DashboardPageProps {
  onOpenSimulator: () => void;
  onSelectClient?: (clientId: number) => void;
  wsPunchEvent: any;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenSimulator, onSelectClient, wsPunchEvent }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [liveStream, setLiveStream] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (wsPunchEvent && wsPunchEvent.data) {
      // Prepend to live stream ticker
      setLiveStream(prev => [wsPunchEvent.data, ...prev.slice(0, 7)]);
      // Refresh stats counters
      loadStats();
    }
  }, [wsPunchEvent]);

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading Dashboard Analytics...</div>;
  }

  const maxWeeklyCount = Math.max(...stats.weekly_trend.map(w => w.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Real-time Ticker Notification Bar */}
      {liveStream.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1))',
          border: '1px solid var(--accent-cyan)',
          borderRadius: '12px',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)'
        }}>
          <span className="pulse-dot" />
          <div style={{ fontSize: '0.85rem', flex: 1 }}>
            <strong>REAL-TIME PUNCH RECEIVED:</strong>{' '}
            {liveStream[0].client ? liveStream[0].client.name : 'Unknown Biometric ID'}{' '}
            <span className={`badge badge-${liveStream[0].status.toLowerCase()}`} style={{ marginLeft: '8px' }}>
              {liveStream[0].status}
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total Clients
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px' }}>
                {stats.total_clients.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#34D399', marginTop: '4px' }}>
                {stats.active_clients} Active Accounts
              </div>
            </div>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4' }}>
              <Users size={22} />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Active Plans
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: '#34D399' }}>
                {stats.active_plans.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Subscriptions active today
              </div>
            </div>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
              <BookOpen size={22} />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Today's Attendance
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: '#06B6D4' }}>
                {stats.todays_attendance.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#06B6D4', marginTop: '4px' }}>
                Validated scans
              </div>
            </div>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
              <Clock size={22} />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Expiring Plans
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: '#FBBF24' }}>
                {stats.expiring_plans.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#FBBF24', marginTop: '4px' }}>
                Expiring within 7 days
              </div>
            </div>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24' }}>
              <AlertTriangle size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Attendance Chart & Live Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem' }}>
        {/* Chart Card */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Weekly Attendance Trend</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Daily validated biometric present punches</p>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#06B6D4', fontWeight: 600 }}>Last 7 Days</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '180px', paddingTop: '1rem' }}>
            {stats.weekly_trend.map((day, idx) => {
              const heightPct = Math.round((day.count / maxWeeklyCount) * 100);
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>{day.count}</span>
                  <div style={{
                    width: '100%',
                    maxWidth: '36px',
                    height: `${Math.max(heightPct, 8)}%`,
                    background: 'linear-gradient(to top, #3B82F6, #06B6D4)',
                    borderRadius: '8px 8px 0 0',
                    transition: 'height 0.4s ease'
                  }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>{day.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Simulator CTA Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Biometric Hardware Test</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
              Use the built-in punch simulator to test how your system handles active clients, duplicate scan protection, and plan expirations.
            </p>
          </div>

          <button
            onClick={onOpenSimulator}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.5rem' }}
          >
            Launch Punch Simulator
          </button>
        </div>
      </div>

      {/* Recent Punch Activity Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Today's Recent Biometric Punches</h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Client Name</th>
                <th>Client ID</th>
                <th>Punch Type</th>
                <th>Device ID</th>
                <th>Validation Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_punches.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No punches recorded yet today. Use the Punch Simulator to test!
                  </td>
                </tr>
              ) : (
                stats.recent_punches.map((punch) => (
                  <tr key={punch.id}>
                    <td style={{ fontWeight: 700 }}>{punch.time}</td>
                    <td style={{ fontWeight: 600 }}>{punch.client_name}</td>
                    <td><span style={{ color: '#06B6D4' }}>{punch.client_code}</span></td>
                    <td><span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3B82F6' }}>{punch.punch_type}</span></td>
                    <td>{punch.device_id}</td>
                    <td>
                      <span className={`badge badge-${punch.status.toLowerCase()}`}>
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
  );
};
