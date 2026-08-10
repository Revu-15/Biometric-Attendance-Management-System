import React, { useState } from 'react';
import { X, Fingerprint, CheckCircle2, AlertTriangle, XCircle, Zap } from 'lucide-react';
import { api } from '../services/api';

interface PunchSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPunchComplete?: () => void;
}

export const PunchSimulatorModal: React.FC<PunchSimulatorModalProps> = ({
  isOpen,
  onClose,
  onPunchComplete
}) => {
  const [biometricId, setBiometricId] = useState('105');
  const [deviceId, setDeviceId] = useState('DEVICE-01');
  const [punchType, setPunchType] = useState('IN');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulate = async (bioIdToUse?: string) => {
    setLoading(true);
    setResult(null);
    setError(null);
    const targetBioId = bioIdToUse || biometricId;

    try {
      const res = await api.simulatePunch(targetBioId, deviceId, punchType);
      setResult(res);
      if (onPunchComplete) onPunchComplete();
    } catch (err: any) {
      setError(err.message || 'Simulation error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4' }}>
              <Fingerprint size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Biometric Machine Simulator</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Emulate live thumb/finger punches & test validation pipeline
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Preset Test Scenarios */}
        <div style={{ marginBottom: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
            Quick Test Shortcuts
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setBiometricId('105'); handleSimulate('105'); }}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              🟢 Valid Active Client (ID 105)
            </button>
            <button
              onClick={() => { setBiometricId('107'); handleSimulate('107'); }}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              🔴 Expired Plan (ID 107)
            </button>
            <button
              onClick={() => { setBiometricId('999'); handleSimulate('999'); }}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              ⚠️ Unknown User (ID 999)
            </button>
          </div>
        </div>

        {/* Form fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
              Biometric User ID
            </label>
            <input
              type="text"
              className="input-field"
              value={biometricId}
              onChange={(e) => setBiometricId(e.target.value)}
              placeholder="e.g. 105"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                Device ID
              </label>
              <input
                type="text"
                className="input-field"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                Punch / Meal Type
              </label>
              <select
                className="input-field"
                value={punchType}
                onChange={(e) => setPunchType(e.target.value)}
              >
                <option value="IN">General IN</option>
                <option value="OUT">General OUT</option>
                <option value="BREAKFAST">Breakfast</option>
                <option value="LUNCH">Lunch</option>
                <option value="DINNER">Dinner</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => handleSimulate()}
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Validating Punch...' : '⚡ Trigger Biometric Scan'}
          </button>
        </div>

        {/* Validation Result Box */}
        {result && (
          <div style={{
            marginTop: '1.25rem',
            padding: '1rem',
            borderRadius: '12px',
            background: result.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
            border: `1px solid ${result.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              {result.success ? (
                <CheckCircle2 size={22} color="#34D399" />
              ) : result.status === 'DUPLICATE_REJECTED' ? (
                <AlertTriangle size={22} color="#FBBF24" />
              ) : (
                <XCircle size={22} color="#FB7185" />
              )}
              <div>
                <span className={`badge badge-${result.status.toLowerCase()}`}>
                  {result.status}
                </span>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '2px' }}>
                  {result.message}
                </p>
              </div>
            </div>

            {result.client && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '8px', marginTop: '8px' }}>
                👤 <strong>Client:</strong> {result.client.name} ({result.client.id})
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', color: '#FB7185', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
