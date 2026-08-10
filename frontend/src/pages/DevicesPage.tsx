import React, { useEffect, useState } from 'react';
import { Cpu, Plus, Radio, CheckCircle, AlertTriangle } from 'lucide-react';
import { Device } from '../types';
import { api } from '../services/api';

interface DevicesPageProps {
  userRole: string;
}

export const DevicesPage: React.FC<DevicesPageProps> = ({ userRole }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    device_id: `DEVICE-${Math.floor(10 + Math.random() * 90)}`,
    name: '',
    location: '',
    adapter_type: 'generic_http'
  });

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const data = await api.getDevices();
      setDevices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createDevice(form);
      setIsModalOpen(false);
      loadDevices();
      setForm({
        device_id: `DEVICE-${Math.floor(10 + Math.random() * 90)}`,
        name: '',
        location: '',
        adapter_type: 'generic_http'
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Biometric Devices & Adapters</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Hardware device connectivity & integration layer status</p>
        </div>

        {userRole === 'super_admin' && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
            <Plus size={16} /> Register Biometric Machine
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        {loading ? (
          <div style={{ color: 'var(--text-secondary)' }}>Loading devices...</div>
        ) : devices.map((d) => (
          <div key={d.id} className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4' }}>
                  <Cpu size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{d.name}</h3>
                  <div style={{ fontSize: '0.75rem', color: '#06B6D4', fontWeight: 700 }}>ID: {d.device_id}</div>
                </div>
              </div>

              <span className={`badge badge-${d.status.toLowerCase()}`}>
                {d.status}
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>📍 <strong>Location:</strong> {d.location || 'Unspecified'}</div>
              <div>🔌 <strong>Adapter:</strong> {d.adapter_type.toUpperCase()}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Last Active: {new Date(d.last_seen).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Register Biometric Device</h3>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Device Hardware ID</label>
                <input type="text" required className="input-field" value={form.device_id} onChange={(e) => setForm({ ...form, device_id: e.target.value })} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Device Display Name</label>
                <input type="text" required className="input-field" placeholder="e.g. Mess Hall Scanner Gate A" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Physical Location</label>
                <input type="text" className="input-field" placeholder="e.g. Main Lobby Entrance" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Integration Adapter Type</label>
                <select className="input-field" value={form.adapter_type} onChange={(e) => setForm({ ...form, adapter_type: e.target.value })}>
                  <option value="generic_http">Generic HTTP Webhook</option>
                  <option value="zkteco">ZKTeco ADMS Push Protocol</option>
                  <option value="essl">eSSL Security Webhook</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Register Device</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
