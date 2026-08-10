import React, { useEffect, useState } from 'react';
import { Clock, Filter, PlusCircle, Download, CheckCircle2, AlertTriangle, XCircle, Search } from 'lucide-react';
import { Attendance, Client } from '../types';
import { api } from '../services/api';

export const AttendancePage: React.FC = () => {
  const [logs, setLogs] = useState<Attendance[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual Punch Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualClientId, setManualClientId] = useState('');
  const [manualPunchType, setManualPunchType] = useState('IN');
  const [manualNotes, setManualNotes] = useState('');

  useEffect(() => {
    loadAttendance();
    loadClients();
  }, [statusFilter]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const data = await api.getAttendanceLogs(undefined, undefined, statusFilter || undefined);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const data = await api.getClients();
      setClients(data);
    } catch (err) {}
  };

  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualClientId) return;
    try {
      await api.manualAttendance({
        client_id: Number(manualClientId),
        punch_type: manualPunchType,
        notes: manualNotes
      });
      setIsManualModalOpen(false);
      loadAttendance();
      setManualNotes('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExportCSV = () => {
    window.open('/api/v1/reports/export/attendance-csv', '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            className="input-field"
            style={{ width: '220px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Validation Statuses</option>
            <option value="PRESENT">🟢 PRESENT (Valid)</option>
            <option value="DUPLICATE_REJECTED">🟡 DUPLICATE_REJECTED</option>
            <option value="PLAN_EXPIRED">🔴 PLAN_EXPIRED</option>
            <option value="ACCOUNT_INACTIVE">🔴 ACCOUNT_INACTIVE</option>
            <option value="UNKNOWN_USER">🔴 UNKNOWN_USER</option>
          </select>

          <button onClick={loadAttendance} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            Refresh Logs
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            <Download size={16} color="#34D399" />
            Export CSV
          </button>
          <button onClick={() => setIsManualModalOpen(true)} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
            <PlusCircle size={16} />
            Manual Attendance Entry
          </button>
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Client Name</th>
                <th>Client Code</th>
                <th>Biometric ID</th>
                <th>Device ID</th>
                <th>Punch Type</th>
                <th>Status</th>
                <th>Validation Message</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No attendance records found</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{log.attendance_date}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{log.attendance_time}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{log.client_name || 'Unknown User'}</td>
                    <td><span style={{ color: '#06B6D4' }}>{log.client_code || 'N/A'}</span></td>
                    <td><strong>{log.biometric_user_id}</strong></td>
                    <td>{log.device_id}</td>
                    <td><span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3B82F6' }}>{log.punch_type}</span></td>
                    <td>
                      <span className={`badge badge-${log.status.toLowerCase()}`}>
                        {log.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '220px' }}>
                      {log.validation_message}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {isManualModalOpen && (
        <div className="modal-overlay" onClick={() => setIsManualModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Manual Attendance Entry</h3>

            <form onSubmit={handleManualEntry} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Select Client</label>
                <select
                  required
                  className="input-field"
                  value={manualClientId}
                  onChange={(e) => setManualClientId(e.target.value)}
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.client_code} - Bio ID: {c.biometric_user_id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Punch / Meal Type</label>
                <select
                  className="input-field"
                  value={manualPunchType}
                  onChange={(e) => setManualPunchType(e.target.value)}
                >
                  <option value="IN">General IN</option>
                  <option value="OUT">General OUT</option>
                  <option value="BREAKFAST">Breakfast</option>
                  <option value="LUNCH">Lunch</option>
                  <option value="DINNER">Dinner</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Reason / Notes</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="e.g. Biometric scanner issue / Approved by Admin"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsManualModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Attendance</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
