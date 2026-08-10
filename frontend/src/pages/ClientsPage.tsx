import React, { useEffect, useState } from 'react';
import { Search, UserPlus, Fingerprint, Eye, FileSpreadsheet, Trash2, Filter } from 'lucide-react';
import { Client, Plan } from '../types';
import { api } from '../services/api';

interface ClientsPageProps {
  onSelectClient: (client: Client) => void;
  onOpenStatement: (clientId: number) => void;
  userRole: string;
}

export const ClientsPage: React.FC<ClientsPageProps> = ({ onSelectClient, onOpenStatement, userRole }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [search, setSearch] = useState('');
  const [clientTypeFilter, setClientTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_code: `STU-2026-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    mobile: '',
    email: '',
    biometric_user_id: `${Math.floor(100 + Math.random() * 900)}`,
    client_type: 'Student',
    status: 'active',
    plan_id: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
    loadPlans();
  }, [search, clientTypeFilter]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await api.getClients(search, clientTypeFilter);
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const data = await api.getPlans();
      setPlans(data);
    } catch (err) {}
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const payload: any = {
        ...formData,
        plan_id: formData.plan_id ? Number(formData.plan_id) : undefined
      };
      await api.createClient(payload);
      setIsAddModalOpen(false);
      loadClients();
      // Reset form
      setFormData({
        client_code: `STU-2026-${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        mobile: '',
        email: '',
        biometric_user_id: `${Math.floor(100 + Math.random() * 900)}`,
        client_type: 'Student',
        status: 'active',
        plan_id: ''
      });
    } catch (err: any) {
      setFormError(err.message || 'Error creating client');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete client ${name}?`)) return;
    try {
      await api.deleteClient(id);
      loadClients();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1, maxWidth: '600px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Search by name, client code, mobile, or biometric ID..."
              className="input-field"
              style={{ paddingLeft: '2.5rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <select
            className="input-field"
            style={{ width: '180px' }}
            value={clientTypeFilter}
            onChange={(e) => setClientTypeFilter(e.target.value)}
          >
            <option value="">All Client Types</option>
            <option value="Student">Student</option>
            <option value="Monthly Mess Customer">Monthly Mess Customer</option>
            <option value="Hotel Resident">Hotel Resident</option>
            <option value="Staff">Staff</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary"
        >
          <UserPlus size={18} />
          Register New Client
        </button>
      </div>

      {/* Clients Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client Code</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Biometric ID</th>
                <th>Type</th>
                <th>Active Plan</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading clients...</td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No clients found matching search</td></tr>
              ) : (
                clients.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700, color: '#06B6D4' }}>{c.client_code}</td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.mobile}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem' }}>
                        <Fingerprint size={12} /> {c.biometric_user_id}
                      </span>
                    </td>
                    <td><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.client_type}</span></td>
                    <td>
                      {c.active_plan ? (
                        <span style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 700 }}>
                          {c.active_plan.plan_name}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#FB7185', fontStyle: 'italic' }}>No active plan</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${c.status}`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => onSelectClient(c)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          title="View Profile"
                        >
                          <Eye size={14} /> Profile
                        </button>
                        <button
                          onClick={() => onOpenStatement(c.id)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          title="Monthly Statement"
                        >
                          <FileSpreadsheet size={14} color="#34D399" /> Statement
                        </button>
                        {userRole === 'super_admin' && (
                          <button
                            onClick={() => handleDelete(c.id, c.name)}
                            className="btn btn-danger"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Register New Client</h3>

            {formError && (
              <div style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#FB7185', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Client Code</label>
                  <input type="text" required className="input-field" value={formData.client_code} onChange={(e) => setFormData({ ...formData, client_code: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Biometric User ID</label>
                  <input type="text" required className="input-field" value={formData.biometric_user_id} onChange={(e) => setFormData({ ...formData, biometric_user_id: e.target.value })} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Full Name</label>
                <input type="text" required className="input-field" placeholder="e.g. Rahul Patil" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Mobile Number</label>
                  <input type="text" required className="input-field" placeholder="9876543210" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Email Address</label>
                  <input type="email" className="input-field" placeholder="client@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Client Type</label>
                  <select className="input-field" value={formData.client_type} onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}>
                    <option value="Student">Student</option>
                    <option value="Monthly Mess Customer">Monthly Mess Customer</option>
                    <option value="Hotel Resident">Hotel Resident</option>
                    <option value="Staff">Staff</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Initial Plan Assignment</label>
                  <select className="input-field" value={formData.plan_id} onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}>
                    <option value="">No Plan (Assign Later)</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (₹{p.monthly_fee})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Register Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
