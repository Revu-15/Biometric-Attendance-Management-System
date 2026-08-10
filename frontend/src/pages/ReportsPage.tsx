import React, { useEffect, useState } from 'react';
import { FileText, Download, Printer, Search, Eye } from 'lucide-react';
import { Client } from '../types';
import { api } from '../services/api';

interface ReportsPageProps {
  onOpenStatement: (clientId: number) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onOpenStatement }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, [search]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await api.getClients(search);
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    window.open('/api/v1/reports/export/attendance-csv', '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Monthly Settlement & Reports</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Generate monthly statements, attendance summaries, and export CSV reports</p>
        </div>

        <button onClick={handleExportCSV} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
          <Download size={16} /> Export Full Attendance CSV
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem', maxWidth: '400px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search client to generate statement..."
            className="input-field"
            style={{ paddingLeft: '2.5rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client Code</th>
                <th>Client Name</th>
                <th>Biometric ID</th>
                <th>Client Type</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Monthly Statement</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading clients...</td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No clients found</td></tr>
              ) : (
                clients.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700, color: '#06B6D4' }}>{c.client_code}</td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td><strong>{c.biometric_user_id}</strong></td>
                    <td>{c.client_type}</td>
                    <td>
                      <span className={`badge badge-${c.status}`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => onOpenStatement(c.id)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <FileText size={14} color="#06B6D4" /> Generate Statement
                      </button>
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
