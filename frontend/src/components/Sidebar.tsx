import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  CreditCard, 
  BookOpen, 
  FileText, 
  Cpu, 
  ShieldCheck, 
  LogOut,
  Fingerprint,
  Radio,
  Sliders
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: string;
  wsConnected: boolean;
  onOpenSimulator: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  wsConnected,
  onOpenSimulator,
  onLogout
}) => {
  const isSuperAdmin = userRole === 'super_admin';

  const menuItems = [
    { id: 'dashboard', label: 'Live Dashboard', icon: LayoutDashboard, role: 'all' },
    { id: 'clients', label: 'Client Directory', icon: Users, role: 'all' },
    { id: 'attendance', label: 'Attendance Logs', icon: Clock, role: 'all' },
    { id: 'plans', label: 'Plans & Meals', icon: BookOpen, role: 'all' },
    { id: 'payments', label: 'Payments & Billing', icon: CreditCard, role: 'all' },
    { id: 'reports', label: 'Monthly Reports', icon: FileText, role: 'all' },
    { id: 'devices', label: 'Biometric Machines', icon: Cpu, role: 'all' },
    { id: 'settings', label: 'Rules & Settings', icon: Sliders, role: 'super_admin' },
    { id: 'audit', label: 'Audit Logs', icon: ShieldCheck, role: 'super_admin' },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #06B6D4, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)' }}>
          <Fingerprint size={24} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, background: 'linear-gradient(to right, #F9FAFB, #9CA3AF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BioSync
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: wsConnected ? '#34D399' : '#FB7185' }}>
            <span className={wsConnected ? 'pulse-dot' : ''} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: wsConnected ? '#10B981' : '#F43F5E' }} />
            {wsConnected ? 'WebSocket Live' : 'Reconnecting...'}
          </div>
        </div>
      </div>

      {/* Simulator Quick Action */}
      <div style={{ margin: '1.25rem 0' }}>
        <button 
          onClick={onOpenSimulator}
          className="btn btn-primary"
          style={{ width: '100%', fontSize: '0.8rem', padding: '0.55rem 0.85rem' }}
        >
          <Radio size={16} />
          Biometric Punch Tool
        </button>
      </div>

      {/* Menu Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {menuItems.map((item) => {
          if (item.role === 'super_admin' && !isSuperAdmin) return null;
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0.7rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.15))' : 'transparent',
                color: isActive ? '#06B6D4' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                textAlign: 'left',
                borderLeft: isActive ? '3px solid #06B6D4' : '3px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={18} color={isActive ? '#06B6D4' : '#9CA3AF'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '0.6rem 0.8rem',
            borderRadius: '8px',
            background: 'transparent',
            border: 'none',
            color: '#FB7185',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
