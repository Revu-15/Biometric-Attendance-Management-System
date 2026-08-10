import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { PunchSimulatorModal } from './components/PunchSimulatorModal';
import { ClientProfileModal } from './components/ClientProfileModal';
import { MonthlyStatementModal } from './components/MonthlyStatementModal';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
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
  const [userRole, setUserRole] = useState<string>(localStorage.getItem('bio_user_role') || 'super_admin');
  const [userName, setUserName] = useState<string>(localStorage.getItem('bio_user_name') || 'Administrator');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [wsPunchEvent, setWsPunchEvent] = useState<any>(null);

  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [statementClientId, setStatementClientId] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      api.getMe().then(user => {
        setUserRole(user.role);
        setUserName(user.name);
      }).catch(() => handleLogout());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Connect WebSocket to the backend via Vite proxy
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
        } catch (err) {}
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
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    clearAuthToken();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const getTabTitle = (): string => {
    const titles: Record<string, string> = {
      'dashboard':      'Attendance Operations Overview',
      'clients':        'Client Directory & Membership',
      'attendance':     'Biometric Attendance Logs',
      'meals':          'Meal & Service Consumption',
      'plans':          'Subscription & Meal Plans',
      'payments':       'Payments & Billing',
      'reports':        'Monthly Settlement & Reports',
      'analytics':      'Analytics & Intelligence',
      'devices':        'Biometric Device Manager',
      'sync-recovery':  'Error & Sync Recovery',
      'settings':       'Attendance Rules & Settings',
      'monthly-lock':   'Monthly Lock & Approval',
      'audit':          'Audit Logs & Security Trail',
      'alerts':         'Alerts & Notifications',
    };
    return titles[currentTab] || 'ATTENDIQ Dashboard';
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardPage
            onOpenSimulator={() => setIsSimulatorOpen(true)}
            onSelectClient={(id) => setStatementClientId(id)}
            wsPunchEvent={wsPunchEvent}
          />
        );
      case 'clients':
        return (
          <ClientsPage
            onSelectClient={(c) => setSelectedClient(c)}
            onOpenStatement={(id) => setStatementClientId(id)}
            userRole={userRole}
          />
        );
      case 'attendance':
        return <AttendancePage />;
      case 'meals':
        return <MealsPage />;
      case 'plans':
        return <PlansPage userRole={userRole} />;
      case 'payments':
        return <PaymentsPage />;
      case 'reports':
        return <ReportsPage onOpenStatement={(id) => setStatementClientId(id)} />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'devices':
        return <DevicesPage userRole={userRole} />;
      case 'sync-recovery':
        return <RulesAndSettingsPage />;  // Reuse settings page for now — shows failed punches
      case 'settings':
        return <RulesAndSettingsPage />;
      case 'monthly-lock':
        return <ReportsPage onOpenStatement={(id) => setStatementClientId(id)} />;
      case 'audit':
        return <AuditLogsPage />;
      case 'alerts':
        return <AlertsPage />;
      default:
        return <DashboardPage onOpenSimulator={() => setIsSimulatorOpen(true)} wsPunchEvent={wsPunchEvent} />;
    }
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
      />

      <main className="main-content">
        <Navbar
          userName={userName}
          userRole={userRole}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          title={getTabTitle()}
        />

        {renderTabContent()}

        {/* Global Modals */}
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
        <MonthlyStatementModal
          clientId={statementClientId}
          isOpen={!!statementClientId}
          onClose={() => setStatementClientId(null)}
        />
      </main>
    </div>
  );
};
