import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Check, UserCheck } from 'lucide-react';
import { Plan, Client } from '../types';
import { api } from '../services/api';

interface PlansPageProps {
  userRole: string;
}

export const PlansPage: React.FC<PlansPageProps> = ({ userRole }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Plan Modal State
  const [isAddPlanModal, setIsAddPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    monthly_fee: 3500,
    meal_limit: 90,
    validity_days: 30
  });

  // Assign Plan Modal State
  const [isAssignModal, setIsAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    client_id: '',
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansData, clientsData] = await Promise.all([
        api.getPlans(),
        api.getClients()
      ]);
      setPlans(plansData);
      setClients(clientsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPlan(planForm);
      setIsAddPlanModal(false);
      loadData();
      setPlanForm({ name: '', description: '', monthly_fee: 3500, meal_limit: 90, validity_days: 30 });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAssignPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.client_id || !assignForm.plan_id) return;
    try {
      await api.assignPlan({
        client_id: Number(assignForm.client_id),
        plan_id: Number(assignForm.plan_id),
        start_date: assignForm.start_date
      });
      setIsAssignModal(false);
      alert('Plan assigned successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Subscription & Meal Plans</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Configure membership pricing and assign plans to clients</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setIsAssignModal(true)} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            <UserCheck size={16} color="#34D399" /> Assign Plan to Client
          </button>
          {userRole === 'super_admin' && (
            <button onClick={() => setIsAddPlanModal(true)} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              <Plus size={16} /> Create New Plan
            </button>
          )}
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        {loading ? (
          <div style={{ color: 'var(--text-secondary)' }}>Loading plans...</div>
        ) : plans.map((p) => (
          <div key={p.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#06B6D4' }}>{p.name}</h3>
                <span className="badge badge-active">{p.status}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', minHeight: '40px' }}>
                {p.description || 'No description provided.'}
              </p>

              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>
                ₹{p.monthly_fee.toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {p.validity_days} days</span>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={14} color="#34D399" />
                  <span>Validity: <strong>{p.validity_days} Days</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={14} color="#34D399" />
                  <span>Meal Limit: <strong>{p.meal_limit > 0 ? `${p.meal_limit} meals / month` : 'Unlimited'}</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setAssignForm(prev => ({ ...prev, plan_id: String(p.id) }));
                setIsAssignModal(true);
              }}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '1.5rem', fontSize: '0.85rem' }}
            >
              Assign This Plan
            </button>
          </div>
        ))}
      </div>

      {/* Create Plan Modal */}
      {isAddPlanModal && (
        <div className="modal-overlay" onClick={() => setIsAddPlanModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Create New Plan</h3>

            <form onSubmit={handleCreatePlan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Plan Name</label>
                <input type="text" required className="input-field" placeholder="e.g. Monthly Meal Plan" value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Description</label>
                <textarea className="input-field" rows={2} value={planForm.description} onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Monthly Fee (₹)</label>
                  <input type="number" required className="input-field" value={planForm.monthly_fee} onChange={(e) => setPlanForm({ ...planForm, monthly_fee: Number(e.target.value) })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Validity (Days)</label>
                  <input type="number" required className="input-field" value={planForm.validity_days} onChange={(e) => setPlanForm({ ...planForm, validity_days: Number(e.target.value) })} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Meal Limit (0 for Unlimited)</label>
                <input type="number" className="input-field" value={planForm.meal_limit} onChange={(e) => setPlanForm({ ...planForm, meal_limit: Number(e.target.value) })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsAddPlanModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Plan Modal */}
      {isAssignModal && (
        <div className="modal-overlay" onClick={() => setIsAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Assign Plan to Client</h3>

            <form onSubmit={handleAssignPlan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Select Client</label>
                <select required className="input-field" value={assignForm.client_id} onChange={(e) => setAssignForm({ ...assignForm, client_id: e.target.value })}>
                  <option value="">-- Choose Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.client_code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Select Plan</label>
                <select required className="input-field" value={assignForm.plan_id} onChange={(e) => setAssignForm({ ...assignForm, plan_id: e.target.value })}>
                  <option value="">-- Choose Plan --</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - ₹{p.monthly_fee}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Start Date</label>
                <input type="date" required className="input-field" value={assignForm.start_date} onChange={(e) => setAssignForm({ ...assignForm, start_date: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsAssignModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Assign Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
