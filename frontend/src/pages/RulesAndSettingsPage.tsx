import React, { useEffect, useState } from 'react';
import { Sliders, Lock, Unlock, Download, Save, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export const RulesAndSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    late_threshold_time: '09:00',
    duplicate_cooldown_seconds: '300',
    business_name: 'BioSync Enterprise'
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Monthly Lock State
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [lockStatus, setLockStatus] = useState<any>(null);
  const [lockLoading, setLockLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    loadLockStatus();
  }, [selectedMonth, selectedYear]);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(prev => ({ ...prev, ...data }));
    } catch (err) {}
  };

  const loadLockStatus = async () => {
    setLockLoading(true);
    try {
      const res = await api.getMonthlyLockStatus(selectedMonth, selectedYear);
      setLockStatus(res);
    } catch (err) {}
    finally { setLockLoading(false); }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    try {
      await api.updateSettings(settings);
      setSuccessMsg('Attendance Rules & Settings updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleLock = async (action: 'LOCK' | 'UNLOCK') => {
    if (!window.confirm(`Are you sure you want to ${action} attendance records for ${selectedMonth}/${selectedYear}?`)) return;
    try {
      const res = await api.toggleMonthlyLock(selectedMonth, selectedYear, action);
      alert(res.message);
      loadLockStatus();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDownloadBackup = () => {
    window.open('/api/v1/reports/backup-db', '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Attendance Rules, Security & Settings</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Configure system rules, monthly lock approval, and database backup</p>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34D399', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid: Rules Config & Monthly Approval Lock */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Attendance Rules Form */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
            <Sliders size={22} color="#06B6D4" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Attendance Rules Engine</h3>
          </div>

          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                Business / Enterprise Name
              </label>
              <input
                type="text"
                className="input-field"
                value={settings.business_name}
                onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                Late Threshold Cutoff Time (HH:MM)
              </label>
              <input
                type="time"
                className="input-field"
                value={settings.late_threshold_time}
                onChange={(e) => setSettings({ ...settings, late_threshold_time: e.target.value })}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                Punches after this time will automatically be flagged as <strong>LATE</strong>.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                Duplicate Scan Cooldown Window (Seconds)
              </label>
              <input
                type="number"
                className="input-field"
                value={settings.duplicate_cooldown_seconds}
                onChange={(e) => setSettings({ ...settings, duplicate_cooldown_seconds: e.target.value })}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                Prevents rapid scans within this duration (Default: 300s = 5 mins).
              </span>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              <Save size={16} /> Save System Rules
            </button>
          </form>
        </div>

        {/* Feature 21: Monthly Lock & Approval Engine */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
              <Lock size={22} color="#FBBF24" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Monthly Settlement Approval & Lock</h3>
            </div>

            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Finalize monthly attendance & billing records. Once locked, records for that month become <strong>READ-ONLY</strong> and unauthorized changes or retroactive punches are strictly blocked.
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '1.25rem' }}>
              <select
                className="input-field"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                  <option key={m} value={m}>{new Date(2026, m-1, 1).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>

              <select
                className="input-field"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>
            </div>

            {lockStatus && (
              <div style={{
                padding: '1rem',
                borderRadius: '12px',
                background: lockStatus.is_locked ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: `1px solid ${lockStatus.is_locked ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: lockStatus.is_locked ? '#FBBF24' : '#34D399' }}>
                  {lockStatus.is_locked ? '🔒 MONTH FINALIZED & LOCKED' : '🔓 MONTH OPEN FOR EDITS'}
                </div>
                {lockStatus.is_locked && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Locked by: {lockStatus.locked_by}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
            {lockStatus?.is_locked ? (
              <button onClick={() => handleToggleLock('UNLOCK')} className="btn btn-secondary" style={{ width: '100%', color: '#FB7185' }}>
                <Unlock size={16} /> Unlock Month for Maintenance
              </button>
            ) : (
              <button onClick={() => handleToggleLock('LOCK')} className="btn btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                <Lock size={16} /> Approve & Lock Month
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feature 20: Security & Database Backup */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Database Backup & Disaster Recovery</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Download an instant raw encrypted copy of the system database</p>
          </div>

          <button onClick={handleDownloadBackup} className="btn btn-secondary">
            <Download size={16} color="#34D399" /> Download DB Backup (.db)
          </button>
        </div>
      </div>
    </div>
  );
};
