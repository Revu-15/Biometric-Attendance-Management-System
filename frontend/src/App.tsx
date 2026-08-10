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
      }).catch(() => {
        handleLogout();
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/attendance`;
    
    let ws: WebSocket;

    const connectWs = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'NEW_PUNCH') {
            setWsPunchEvent(data);
          }
        } catch (err) {}
      };

      ws.onclose = () => {
        setWsConnected(false);
        setTimeout(connectWs, 3000);
      };

      ws.onerror = () => {
        setWsConnected(false);
      };
    };

    connectWs();

    return () => {
      if (ws) ws.close();
    };
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
      case 'plans':
        return <PlansPage userRole={userRole} />;
      case 'payments':
        return <PaymentsPage />;
      case 'reports':
        return <ReportsPage onOpenStatement={(id) => setStatementClientId(id)} />;
      case 'devices':
        return <DevicesPage userRole={userRole} />;
      case 'settings':
        return <RulesAndSettingsPage />;
      case 'audit':
        return <AuditLogsPage />;
      default:
        return <DashboardPage onOpenSimulator={() => setIsSimulatorOpen(true)} wsPunchEvent={wsPunchEvent} />;
    }
  };

  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Live Operations Dashboard';
      case 'clients': return 'Client Directory & Membership';
      case 'attendance': return 'Biometric Attendance Logs';
      case 'plans': return 'Subscription & Meal Plans';
      case 'payments': return 'Payments & Billing Logs';
      case 'reports': return 'Monthly Statements & Settlement';
      case 'devices': return 'Biometric Machine Adapter Manager';
      case 'settings': return 'Attendance Rules & Security Settings';
      case 'audit': return 'Audit Logs & Security Trail';
      default: return 'Dashboard';
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
