import React, { useEffect, useState } from 'react';
import { X, Printer, Download, CheckCircle, FileText, Utensils } from 'lucide-react';
import { MonthlyStatement } from '../types';
import { api } from '../services/api';

interface MonthlyStatementModalProps {
  clientId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MonthlyStatementModal: React.FC<MonthlyStatementModalProps> = ({
  clientId,
  isOpen,
  onClose
}) => {
  const [statement, setStatement] = useState<MonthlyStatement | null>(null);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clientId && isOpen) {
      loadStatement();
    }
  }, [clientId, month, year, isOpen]);

  const loadStatement = async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const data = await api.getMonthlyStatement(clientId, month, year);
      setStatement(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !clientId) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <FileText size={22} color="#06B6D4" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Monthly Settlement Statement</h3>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              className="input-field"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
            >
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                <option key={m} value={m}>{new Date(2026, m-1, 1).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
            <select
              className="input-field"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>

            <button onClick={handlePrint} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
              <Printer size={16} /> Print / Export PDF
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Statement Invoice Printable Container */}
        {statement && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '2rem',
            color: 'var(--text-primary)'
          }}>
            {/* Invoice Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#06B6D4' }}>BioSync Enterprise</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Biometric Attendance & Monthly Settlement Invoice</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>STATEMENT PERIOD</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{statement.statement_period}</div>
              </div>
            </div>

            {/* Client Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '10px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>CLIENT INFORMATION</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '2px' }}>{statement.client.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Client ID: {statement.client.client_code}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Biometric ID: {statement.client.biometric_user_id}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mobile: {statement.client.mobile}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>SUBSCRIPTION PLAN</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '2px', color: '#34D399' }}>{statement.plan.name}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Plan Fee: ₹{statement.plan.amount.toLocaleString()}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Validity: {statement.plan.start_date || 'N/A'} → {statement.plan.end_date || 'N/A'}
                </div>
              </div>
            </div>

            {/* Attendance & Meal Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '1.5rem' }}>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: '#06B6D4' }}>📅 Attendance Summary</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span>Total Calendar Days:</span>
                  <strong>{statement.attendance.total_days}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span>Days Present:</span>
                  <strong style={{ color: '#34D399' }}>{statement.attendance.present_days}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span>Days Absent:</span>
                  <strong style={{ color: '#FB7185' }}>{statement.attendance.absent_days}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700, borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '6px' }}>
                  <span>Attendance %:</span>
                  <span style={{ color: '#06B6D4' }}>{statement.attendance.attendance_percentage}%</span>
                </div>
              </div>

              <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Utensils size={14} /> Service / Meal Usage
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span>Breakfast Count:</span>
                  <strong>{statement.attendance.meals_used.breakfast}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span>Lunch Count:</span>
                  <strong>{statement.attendance.meals_used.lunch}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span>Dinner Count:</span>
                  <strong>{statement.attendance.meals_used.dinner}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>General Check-ins:</span>
                  <span>{statement.attendance.meals_used.general_checkins}</span>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '10px', padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px', color: '#06B6D4' }}>💳 Billing & Payment Summary</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                <span>Monthly Plan Charge:</span>
                <strong>₹{statement.financials.plan_fee.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px', color: '#34D399' }}>
                <span>Total Amount Paid:</span>
                <strong>₹{statement.financials.total_paid.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '8px', marginTop: '6px' }}>
                <span>Outstanding Balance:</span>
                <span style={{ color: statement.financials.balance_due > 0 ? '#FB7185' : '#34D399' }}>
                  ₹{statement.financials.balance_due.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
