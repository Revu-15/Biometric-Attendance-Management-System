import React, { useEffect, useState } from 'react';
import { CreditCard, Plus, CheckCircle, Search } from 'lucide-react';
import { Payment, Client } from '../types';
import { api } from '../services/api';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Record Payment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    client_id: '',
    amount: 3500,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'UPI',
    transaction_reference: '',
    notes: ''
  });

  useEffect(() => {
    loadPayments();
    loadClients();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await api.getPayments();
      setPayments(data);
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

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id) return;
    try {
      await api.recordPayment({
        client_id: Number(form.client_id),
        amount: Number(form.amount),
        payment_date: form.payment_date,
        payment_method: form.payment_method,
        transaction_reference: form.transaction_reference,
        notes: form.notes
      });
      setIsModalOpen(false);
      loadPayments();
      alert('Payment recorded successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* KPI Header & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Payments & Financial Logs</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Total Collected Revenue: <strong style={{ color: '#34D399', fontSize: '1.05rem' }}>₹{totalCollected.toLocaleString()}</strong>
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
          <Plus size={16} /> Record Payment
        </button>
      </div>

      {/* Payment Records Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Client Name</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Transaction Ref</th>
                <th>Recorded By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading payments...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No payment records found</td></tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.payment_date}</td>
                    <td style={{ fontWeight: 600 }}>{p.client_name}</td>
                    <td style={{ fontWeight: 800, color: '#34D399' }}>₹{p.amount.toLocaleString()}</td>
                    <td><span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#06B6D4' }}>{p.payment_method}</span></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.transaction_reference || 'N/A'}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.recorded_by}</td>
                    <td><span className="badge badge-paid">{p.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Record Client Payment</h3>

            <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Select Client</label>
                <select required className="input-field" value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
                  <option value="">-- Choose Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.client_code})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Amount (₹)</label>
                  <input type="number" required className="input-field" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Payment Date</label>
                  <input type="date" required className="input-field" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Payment Method</label>
                <select className="input-field" value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="CASH">Cash Payment</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="BANK_TRANSFER">Bank NetBanking</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Transaction Ref / UTR (Optional)</label>
                <input type="text" className="input-field" placeholder="e.g. UTR12398745" value={form.transaction_reference} onChange={(e) => setForm({ ...form, transaction_reference: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
