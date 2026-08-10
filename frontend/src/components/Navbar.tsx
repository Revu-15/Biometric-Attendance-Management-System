import React from 'react';
import { User, Shield, Radio, Search } from 'lucide-react';

interface NavbarProps {
  userName: string;
  userRole: string;
  onOpenSimulator: () => void;
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ userName, userRole, onOpenSimulator, title }) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: '1.5rem',
      marginBottom: '1.5rem',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>{title}</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Biometric Attendance & Client Management Engine
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onOpenSimulator}
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem' }}
        >
          <Radio size={16} color="#06B6D4" />
          Test Punch Simulator
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--bg-card)',
          padding: '6px 14px',
          borderRadius: '9999px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            fontWeight: 700
          }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{userName}</div>
            <div style={{ fontSize: '0.7rem', color: userRole === 'super_admin' ? '#06B6D4' : '#FBBF24', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Shield size={10} />
              {userRole === 'super_admin' ? 'Super Admin' : 'Staff Operator'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
