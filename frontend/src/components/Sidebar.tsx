import React, { useState } from 'react';
import {
  LayoutDashboard, Users, Clock, CreditCard, BookOpen, FileText, Cpu,
  ShieldCheck, LogOut, Fingerprint, Radio, Sliders, ChevronDown,
  UtensilsCrossed, BarChart3, Lock, AlertCircle, RefreshCw,
  CalendarCheck, UserPlus, UserX, List, Search, Edit3,
  PlusCircle, Wallet, Receipt, TrendingUp, Settings, User
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: string;
  wsConnected: boolean;
  onOpenSimulator: () => void;
  onLogout: () => void;
  userName: string;
}

interface NavItem { id: string; label: string; icon: any; }
interface NavGroup { label: string; color: string; items: NavItem[]; }

// ─── SUPER ADMIN full menu ─────────────────────────────────────────────────
const ADMIN_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    color: '#06B6D4',
    items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }]
  },
  {
    label: 'Clients',
    color: '#8B5CF6',
    items: [
      { id: 'clients',         label: 'All Clients',       icon: Users },
      { id: 'client-add',      label: 'Add Client',        icon: UserPlus },
      { id: 'plans',           label: 'Plans & Membership',icon: BookOpen },
    ]
  },
  {
    label: 'Attendance',
    color: '#3B82F6',
    items: [
      { id: 'attendance',      label: "Today's Attendance", icon: CalendarCheck },
      { id: 'attendance-history', label: 'Attendance History', icon: Clock },
      { id: 'meals',           label: 'Meal Consumption',   icon: UtensilsCrossed },
      { id: 'settings',        label: 'Attendance Rules',   icon: Sliders },
    ]
  },
  {
    label: 'Finance',
    color: '#10B981',
    items: [
      { id: 'payments',        label: 'Payments & Billing', icon: CreditCard },
      { id: 'reports',         label: 'Monthly Settlement', icon: Receipt },
      { id: 'monthly-lock',    label: 'Monthly Lock',       icon: Lock },
    ]
  },
  {
    label: 'Devices',
    color: '#F59E0B',
    items: [
      { id: 'devices',         label: 'Biometric Devices',  icon: Cpu },
      { id: 'sync-recovery',   label: 'Error & Sync',       icon: RefreshCw },
    ]
  },
  {
    label: 'Reports',
    color: '#06B6D4',
    items: [
      { id: 'analytics',       label: 'Analytics & Forecast', icon: BarChart3 },
      { id: 'reports',         label: 'Export Reports',      icon: FileText },
    ]
  },
  {
    label: 'Admin & Security',
    color: '#F43F5E',
    items: [
      { id: 'alerts',          label: 'Alerts',              icon: AlertCircle },
      { id: 'audit',           label: 'Audit Logs',          icon: ShieldCheck },
      { id: 'settings',        label: 'System Settings',     icon: Settings },
    ]
  }
];

// ─── STAFF OPERATOR limited menu ──────────────────────────────────────────
const STAFF_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    color: '#F59E0B',
    items: [{ id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard }]
  },
  {
    label: 'Clients',
    color: '#8B5CF6',
    items: [
      { id: 'clients',         label: 'Search Clients',      icon: Search },
    ]
  },
  {
    label: 'Attendance',
    color: '#3B82F6',
    items: [
      { id: 'attendance',      label: "Today's Attendance",  icon: CalendarCheck },
      { id: 'attendance-history', label: 'Attendance History', icon: Clock },
    ]
  },
  {
    label: 'Payments',
    color: '#10B981',
    items: [
      { id: 'payments',        label: 'Record Payment',      icon: CreditCard },
      { id: 'payment-history', label: 'Payment History',     icon: Wallet },
    ]
  },
  {
    label: 'Reports',
    color: '#06B6D4',
    items: [
      { id: 'reports',         label: 'Daily Attendance',    icon: FileText },
    ]
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab, setCurrentTab, userRole, wsConnected,
  onOpenSimulator, onLogout, userName
}) => {
  const isSuperAdmin = userRole === 'super_admin';
  const navGroups = isSuperAdmin ? ADMIN_GROUPS : STAFF_GROUPS;
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // De-dupe tabs (e.g. 'reports' appears twice in admin menu)
  const seenIds = new Set<string>();

  const toggle = (label: string) =>
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Brand */}
      <div style={{ padding: '1.1rem 1rem 0.85rem', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
            background: isSuperAdmin
              ? 'linear-gradient(135deg, #06B6D4, #3B82F6)'
              : 'linear-gradient(135deg, #D97706, #F59E0B)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 14px ${isSuperAdmin ? 'rgba(6,182,212,0.45)' : 'rgba(245,158,11,0.45)'}`
          }}>
            <Fingerprint size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '-0.02em', color: '#F9FAFB' }}>
              ATTENDIQ
            </div>
            <div style={{
              fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: isSuperAdmin ? '#06B6D4' : '#F59E0B'
            }}>
              {isSuperAdmin ? '⬡ Super Admin' : '◈ Staff Operator'}
            </div>
          </div>
        </div>

        {/* Role badge */}
        <div style={{
          padding: '6px 10px', borderRadius: '8px', fontSize: '0.68rem',
          background: isSuperAdmin ? 'rgba(6,182,212,0.08)' : 'rgba(245,158,11,0.08)',
          border: `1px solid ${isSuperAdmin ? 'rgba(6,182,212,0.2)' : 'rgba(245,158,11,0.2)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
            {userName}
          </span>
          <span style={{ color: isSuperAdmin ? '#06B6D4' : '#F59E0B', fontWeight: 700, flexShrink: 0 }}>
            {isSuperAdmin ? 'ADMIN' : 'STAFF'}
          </span>
        </div>

        {/* WS status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '8px', fontSize: '0.65rem', color: wsConnected ? '#34D399' : '#FB7185' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: wsConnected ? '#10B981' : '#F43F5E', animation: wsConnected ? 'pulse-ring 1.8s infinite' : 'none' }} />
          {wsConnected ? 'Live WebSocket Connected' : 'Reconnecting...'}
        </div>

        {/* Punch Simulator (both roles can use) */}
        <button onClick={onOpenSimulator} className="btn btn-primary"
          style={{ width: '100%', marginTop: '10px', fontSize: '0.75rem', padding: '0.45rem 0.8rem' }}>
          <Radio size={13} />
          Biometric Punch Simulator
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0.6rem 0.7rem', display: 'flex', flexDirection: 'column', gap: '1px' }}
        className="sidebar-nav">
        {navGroups.map((group) => {
          const isCollapsed = collapsed[group.label];
          return (
            <div key={group.label}>
              <button onClick={() => toggle(group.label)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '0.4rem 0.5rem', border: 'none',
                  background: 'transparent', cursor: 'pointer', marginTop: '6px', marginBottom: '2px'
                }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: group.color }}>
                  {group.label}
                </span>
                <ChevronDown size={11} color="var(--text-muted)"
                  style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {!isCollapsed && group.items.map((item) => {
                // Skip duplicates in admin menu
                if (seenIds.has(item.id + item.label)) return null;
                seenIds.add(item.id + item.label);

                const Icon = item.icon;
                const isActive = currentTab === item.id ||
                  (item.id === 'attendance-history' && currentTab === 'attendance');

                return (
                  <button key={item.id + item.label}
                    onClick={() => setCurrentTab(
                      item.id === 'attendance-history' ? 'attendance' :
                      item.id === 'payment-history' ? 'payments' :
                      item.id === 'client-add' ? 'clients' : item.id
                    )}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '9px', width: '100%',
                      padding: '0.55rem 0.7rem', borderRadius: '8px', border: 'none',
                      cursor: 'pointer', textAlign: 'left', marginBottom: '1px',
                      fontSize: '0.8rem', fontWeight: isActive ? 700 : 500,
                      background: isActive ? `${group.color}18` : 'transparent',
                      color: isActive ? group.color : 'var(--text-secondary)',
                      borderLeft: isActive ? `3px solid ${group.color}` : '3px solid transparent',
                      transition: 'all 0.12s ease'
                    }}>
                    <Icon size={15} color={isActive ? group.color : '#6B7280'} style={{ flexShrink: 0 }} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '0.65rem 0.7rem', borderTop: '1px solid var(--border-color)', flexShrink: 0 }}>
        <button onClick={onLogout} style={{
          display: 'flex', alignItems: 'center', gap: '9px', width: '100%',
          padding: '0.55rem 0.7rem', borderRadius: '8px',
          background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.12)',
          color: '#FB7185', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer'
        }}>
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
