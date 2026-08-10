import React, { useState } from 'react';
import {
  LayoutDashboard, Users, Clock, CreditCard, BookOpen, FileText, Cpu,
  ShieldCheck, LogOut, Fingerprint, Radio, Sliders, ChevronDown,
  UtensilsCrossed, BarChart3, Lock, AlertCircle, RefreshCw, CalendarCheck
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: string;
  wsConnected: boolean;
  onOpenSimulator: () => void;
  onLogout: () => void;
}

interface NavGroup {
  label: string;
  color: string;
  items: { id: string; label: string; icon: any; role?: string; badge?: string }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab, setCurrentTab, userRole, wsConnected, onOpenSimulator, onLogout
}) => {
  const isSuperAdmin = userRole === 'super_admin';
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const navGroups: NavGroup[] = [
    {
      label: 'Operations',
      color: '#06B6D4',
      items: [
        { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      label: 'People',
      color: '#8B5CF6',
      items: [
        { id: 'clients', label: 'Client Directory', icon: Users },
        { id: 'plans', label: 'Plans & Membership', icon: BookOpen },
      ]
    },
    {
      label: 'Attendance',
      color: '#3B82F6',
      items: [
        { id: 'attendance', label: 'Attendance Logs', icon: CalendarCheck },
        { id: 'meals', label: 'Meal Consumption', icon: UtensilsCrossed },
        { id: 'devices', label: 'Biometric Devices', icon: Cpu },
        { id: 'sync-recovery', label: 'Error & Sync Recovery', icon: RefreshCw, badge: 'BETA' },
      ]
    },
    {
      label: 'Finance',
      color: '#10B981',
      items: [
        { id: 'payments', label: 'Payments & Billing', icon: CreditCard },
        { id: 'reports', label: 'Monthly Settlement', icon: FileText },
      ]
    },
    {
      label: 'Intelligence',
      color: '#F59E0B',
      items: [
        { id: 'analytics', label: 'Analytics & Forecast', icon: BarChart3 },
      ]
    },
    {
      label: 'Admin & Security',
      color: '#F43F5E',
      items: [
        { id: 'settings', label: 'Attendance Rules', icon: Sliders, role: 'super_admin' },
        { id: 'monthly-lock', label: 'Monthly Lock', icon: Lock, role: 'super_admin' },
        { id: 'audit', label: 'Audit Logs', icon: ShieldCheck, role: 'super_admin' },
        { id: 'alerts', label: 'Alerts', icon: AlertCircle },
      ]
    }
  ];

  const toggleGroup = (label: string) => {
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="sidebar" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
      {/* Brand */}
      <div style={{ padding: '1.25rem 1rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(6,182,212,0.45)'
          }}>
            <Fingerprint size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.03em', color: '#F9FAFB' }}>
              ATTENDIQ
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.06em' }}>
              ATTENDANCE MANAGEMENT
            </div>
          </div>
        </div>

        {/* WS Status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          marginTop: '10px', padding: '5px 10px', borderRadius: '8px',
          background: wsConnected ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
          border: `1px solid ${wsConnected ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            backgroundColor: wsConnected ? '#10B981' : '#F43F5E',
            boxShadow: wsConnected ? '0 0 0 3px rgba(16,185,129,0.2)' : 'none',
            animation: wsConnected ? 'pulse-ring 1.8s infinite' : 'none'
          }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: wsConnected ? '#34D399' : '#FB7185' }}>
            {wsConnected ? 'Live WebSocket Active' : 'Reconnecting...'}
          </span>
        </div>

        {/* Punch Simulator Button */}
        <button onClick={onOpenSimulator} className="btn btn-primary"
          style={{ width: '100%', marginTop: '10px', fontSize: '0.78rem', padding: '0.5rem 0.85rem' }}>
          <Radio size={14} />
          Biometric Punch Simulator
        </button>
      </div>

      {/* Nav Groups */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navGroups.map((group) => {
          const isCollapsed = collapsed[group.label];
          const visibleItems = group.items.filter(item => !item.role || item.role !== 'super_admin' || isSuperAdmin);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label}>
              {/* Group Header */}
              <button onClick={() => toggleGroup(group.label)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '0.45rem 0.5rem', border: 'none', background: 'transparent',
                  cursor: 'pointer', marginTop: '0.5rem', marginBottom: '2px'
                }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: group.color }}>
                  {group.label}
                </span>
                <ChevronDown size={12} color="var(--text-muted)"
                  style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </button>

              {/* Group Items */}
              {!isCollapsed && visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button key={item.id} onClick={() => setCurrentTab(item.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      width: '100%', padding: '0.6rem 0.75rem', borderRadius: '9px',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      fontSize: '0.82rem', fontWeight: isActive ? 700 : 500,
                      background: isActive
                        ? `linear-gradient(135deg, ${group.color}22, ${group.color}10)`
                        : 'transparent',
                      color: isActive ? group.color : 'var(--text-secondary)',
                      borderLeft: isActive ? `3px solid ${group.color}` : '3px solid transparent',
                      transition: 'all 0.15s ease', marginBottom: '1px'
                    }}>
                    <Icon size={16} color={isActive ? group.color : '#6B7280'} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span style={{
                        fontSize: '0.55rem', fontWeight: 700, padding: '1px 5px',
                        borderRadius: '4px', background: 'rgba(245,158,11,0.15)',
                        color: '#FBBF24', border: '1px solid rgba(245,158,11,0.3)'
                      }}>{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
        <button onClick={onLogout} style={{
          display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
          padding: '0.6rem 0.75rem', borderRadius: '9px', background: 'rgba(244,63,94,0.06)',
          border: '1px solid rgba(244,63,94,0.15)', color: '#FB7185',
          fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s'
        }}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
