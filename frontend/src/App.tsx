import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { PunchSimulatorModal } from './components/PunchSimulatorModal';
import { ClientProfileModal } from './components/ClientProfileModal';
import { MonthlyStatementModal } from './components/MonthlyStatementModal';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StaffDashboardPage } from './pages/StaffDashboardPage';
import { ClientsPage } from './pages/ClientsPage';
import { AttendancePage } from './pages/AttendancePage';
import { PlansPage } from './pages/PlansPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { DevicesPage } from './pages/DevicesPage';
import { RulesAndSettingsPage } from './pages/RulesAndSettingsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { MealsPage } from './pages/MealsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AlertsPage } from './pages/AlertsPage';

import { getAuthToken, clearAuthToken, api } from './services/api';
import { Client } from './types';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getAuthToken());
  const [userRole, setUserRole] = useState<string>(localStorage.getItem('bio_user_role') || '');
  const [userName, setUserName] = useState<string>(localStorage.getItem('bio_user_name') || 'User');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [wsPunchEvent, setWsPunchEvent] = useState<any>(null);

  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [statementClientId, setStatementClientId] = useState<number | null>(null);

  const isSuperAdmin = userRole === 'super_admin';

  // Verify token on mount
  useEffect(() => {
    if (isAuthenticated) {
      api.getMe().then(user => {
        setUserRole(user.role);
        setUserName(user.name);
        localStorage.setItem('bio_user_role', user.role);
        localStorage.setItem('bio_user_name', user.name);
      }).catch(() => handleLogout());
    }
  }, [isAuthenticated]);

  // WebSocket live punch feed
  useEffect(() => {
    if (!isAuthenticated) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//127.0.0.1:8000/ws/attendance`;
    let ws: WebSocket;

    const connectWs = () => {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => setWsConnected(true);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'NEW_PUNCH') setWsPunchEvent(data);
        } catch {}
      };
      ws.onclose = () => { setWsConnected(false); setTimeout(connectWs, 3000); };
      ws.onerror = () => setWsConnected(false);
    };

    connectWs();
    return () => { if (ws) ws.close(); };
  }, [isAuthenticated]);

  const handleLoginSuccess = (role: string, name: string) => {
    setUserRole(role);
    setUserName(name);
    setCurrentTab('dashboard');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    clearAuthToken();
    localStorage.removeItem('bio_user_role');
    localStorage.removeItem('bio_user_name');
    setIsAuthenticated(false);
    setUserRole('');
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // ─── SUPER ADMIN: Full tab map ─────────────────────────────────────────
  const renderAdminTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardPage
            onOpenSimulator={() => setIsSimulatorOpen(true)}
            onSelectClient={(id) => setStatementClientId(id)}
            wsPunchEvent={wsPunchEvent}
          />
        );
      case 'clients':      return <ClientsPage onSelectClient={(c) => setSelectedClient(c)} onOpenStatement={(id) => setStatementClientId(id)} userRole={userRole} />;
      case 'attendance':   return <AttendancePage />;
      case 'meals':        return <MealsPage />;
      case 'plans':        return <PlansPage userRole={userRole} />;
      case 'payments':     return <PaymentsPage />;
      case 'reports':      return <ReportsPage onOpenStatement={(id) => setStatementClientId(id)} />;
      case 'analytics':    return <AnalyticsPage />;
      case 'devices':      return <DevicesPage userRole={userRole} />;
      case 'sync-recovery':return <RulesAndSettingsPage />;
      case 'monthly-lock': return <ReportsPage onOpenStatement={(id) => setStatementClientId(id)} />;
      case 'settings':     return <RulesAndSettingsPage />;
      case 'audit':        return <AuditLogsPage />;
      case 'alerts':       return <AlertsPage />;
      default:             return <DashboardPage onOpenSimulator={() => setIsSimulatorOpen(true)} wsPunchEvent={wsPunchEvent} />;
    }
  };

  // ─── STAFF OPERATOR: Limited tab map ──────────────────────────────────
  const renderStaffTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <StaffDashboardPage
            userName={userName}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
            wsPunchEvent={wsPunchEvent}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'clients':    return <ClientsPage onSelectClient={(c) => setSelectedClient(c)} onOpenStatement={(id) => setStatementClientId(id)} userRole={userRole} />;
      case 'attendance': return <AttendancePage />;
      case 'payments':   return <PaymentsPage />;
      case 'reports':    return <ReportsPage onOpenStatement={(id) => setStatementClientId(id)} />;
      // Blocked pages — redirect to dashboard
      default:
        setCurrentTab('dashboard');
        return null;
    }
  };

  const getTabTitle = (): string => {
    const titles: Record<string, string> = {
      'dashboard':       isSuperAdmin ? 'Attendance Operations Overview' : 'Staff Operations Dashboard',
      'clients':         isSuperAdmin ? 'Client Directory & Membership' : 'Search Clients',
      'attendance':      "Today's Biometric Attendance",
      'meals':           'Meal & Service Consumption',
      'plans':           'Subscription & Meal Plans',
      'payments':        'Payments & Billing',
      'reports':         isSuperAdmin ? 'Monthly Settlement & Reports' : 'Daily Attendance Report',
      'analytics':       'Analytics & Intelligence',
      'devices':         'Biometric Device Manager',
      'sync-recovery':   'Error & Sync Recovery',
      'settings':        'Attendance Rules & System Settings',
      'monthly-lock':    'Monthly Lock & Approval',
      'audit':           'Audit Logs & Security Trail',
      'alerts':          'Alerts & Notifications',
    };
    return titles[currentTab] || 'ATTENDIQ';
  };

  return (
    <div className="app-container">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={userRole}
        wsConnected={wsConnected}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onLogout={handleLogout}
        userName={userName}
      />

      <main className="main-content">
        <Navbar
          userName={userName}
          userRole={userRole}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          title={getTabTitle()}
        />

        {/* Role-gated content */}
        {isSuperAdmin ? renderAdminTab() : renderStaffTab()}

        {/* Global Modals (available to both roles) */}
        <PunchSimulatorModal
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
        />
        <ClientProfileModal
          client={selectedClient}
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
          onOpenStatement={(id) => setStatementClientId(id)}
        />
        {/* Monthly Statement — Admin only */}
        {isSuperAdmin && (
          <MonthlyStatementModal
            clientId={statementClientId}
            isOpen={!!statementClientId}
            onClose={() => setStatementClientId(null)}
          />
        )}
      </main>
    </div>
  );
};
