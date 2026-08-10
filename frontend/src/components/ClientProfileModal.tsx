import React, { useEffect, useState } from 'react';
import { X, User as UserIcon, Calendar, CreditCard, Clock, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { Client } from '../types';
import { api } from '../services/api';

interface ClientProfileModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenStatement?: (clientId: number) => void;
}

export const ClientProfileModal: React.FC<ClientProfileModalProps> = ({
  client,
  isOpen,
  onClose,
  onOpenStatement
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (client && isOpen) {
      loadData();
      setImageError(false);
    }
  }, [client, isOpen]);

  const loadData = async () => {
    if (!client) return;
    setLoading(true);
    try {
      const [attData, payData] = await Promise.all([
        api.getClientAttendanceHistory(client.id),
        api.getPayments(client.id)
      ]);
      setHistory(attData);
      setPayments(payData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !client) return null;

  const presentCount = history.filter(h => h.status === 'PRESENT').length;
  const totalLogs = history.length;
  const attendanceRate = totalLogs > 0 ? ((presentCount / totalLogs) * 100).toFixed(1) : '100.0';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {client.photo_url && !imageError ? (
              <img
                src={client.photo_url}
                alt={client.name}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  border: '2px solid rgba(6, 182, 212, 0.5)'
                }}
                onError={() => setImageError(true)}
              />
            ) : (
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#ffffff'
              }}>
                {client.name.charAt(0)}
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{client.name}</h2>
                <span className={`badge badge-${client.status}`}>
                  {client.status}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Client ID: <strong style={{ color: '#06B6D4' }}>{client.client_code}</strong> • Biometric ID: <strong>{client.biometric_user_id}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {onOpenStatement && (
              <button
                onClick={() => onOpenStatement(client.id)}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                <FileSpreadsheet size={16} color="#34D399" />
                Monthly Statement
              </button>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={22} />
            </button>
          </div>
        </div>

        {/* 3-Column Info Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
              CLIENT DETAILS
            </div>
            <div style={{ fontSize: '0.85rem' }}>📱 {client.mobile}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={client.email}>📧 {client.email || 'N/A'}</div>
            {client.enrollment_id && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>🆔 {client.enrollment_id}</div>}
            {client.gender && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>🚻 {client.gender}</div>}
            {client.date_of_birth && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📅 {client.date_of_birth}</div>}
            {client.address && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={client.address}>📍 {client.address}</div>}
            <div style={{ fontSize: '0.8rem', marginTop: '6px', color: '#06B6D4', fontWeight: 600 }}>
              Type: {client.client_type}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
              ACTIVE SUBSCRIPTION
            </div>
            {client.active_plan ? (
              <>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34D399' }}>
                  {client.active_plan.plan_name || 'Active Plan'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {client.active_plan.start_date} → {client.active_plan.end_date}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '4px' }}>
                  ₹{client.active_plan.amount} / month
                </div>
              </>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#FB7185', fontStyle: 'italic' }}>
                No active plan found
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
              ATTENDANCE RATE
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#06B6D4' }}>
              {attendanceRate}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Present: {presentCount} days | Total: {totalLogs} logs
            </div>
          </div>
        </div>

        {/* Tabbed History List */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} />
            Recent Attendance Log
          </h3>

          <div className="data-table-container" style={{ maxHeight: '240px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Punch Type</th>
                  <th>Device</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                      No attendance logs recorded yet
                    </td>
                  </tr>
                ) : (
                  history.slice(0, 15).map((log) => (
                    <tr key={log.id}>
                      <td>{log.attendance_date}</td>
                      <td>{log.attendance_time}</td>
                      <td>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#06B6D4' }}>
                          {log.punch_type}
                        </span>
                      </td>
                      <td>{log.device_id}</td>
                      <td>
                        <span className={`badge badge-${log.status.toLowerCase()}`}>
                          {log.status}
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
