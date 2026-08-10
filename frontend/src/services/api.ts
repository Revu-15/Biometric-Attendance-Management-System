const getApiBase = (): string => {
  const customUrl = localStorage.getItem('bio_api_server_url');
  if (customUrl) {
    const trimmed = customUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
  }
  const envUrl = (import.meta as any).env?.VITE_API_BASE;
  if (envUrl) return envUrl;

  // On GitHub Pages, if no server URL configured, fallback to live Render production API
  if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
    return 'https://biometric-attendance-management-system-kefe.onrender.com/api/v1';
  }
  return '/api/v1';
};

export function getAuthToken(): string | null {
  return localStorage.getItem('bio_auth_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('bio_auth_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('bio_auth_token');
  localStorage.removeItem('bio_user_role');
  localStorage.removeItem('bio_user_name');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${getApiBase()}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = 'API Request Failed';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errorDetail;
    } catch (e) {}
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<any>('/auth/me'),

  // Dashboard Stats & Notifications
  getDashboardStats: () => request<any>('/reports/dashboard-stats'),
  getNotifications: () => request<any[]>('/reports/notifications'),

  // Clients
  getClients: (query?: string, clientType?: string, statusFilter?: string) => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (clientType) params.append('client_type', clientType);
    if (statusFilter) params.append('status_filter', statusFilter);
    return request<any[]>(`/clients?${params.toString()}`);
  },
  createClient: (data: any) => request<any>('/clients', { method: 'POST', body: JSON.stringify(data) }),
  getClientDetails: (id: number) => request<any>(`/clients/${id}`),
  updateClient: (id: number, data: any) => request<any>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClient: (id: number) => request<any>(`/clients/${id}`, { method: 'DELETE' }),

  // Plans
  getPlans: () => request<any[]>('/plans'),
  createPlan: (data: any) => request<any>('/plans', { method: 'POST', body: JSON.stringify(data) }),
  assignPlan: (data: any) => request<any>('/plans/assign', { method: 'POST', body: JSON.stringify(data) }),

  // Attendance & Simulator
  getTodaysAttendance: (statusFilter?: string) => {
    const query = statusFilter ? `?status_filter=${statusFilter}` : '';
    return request<any[]>(`/attendance/today${query}`);
  },
  getAttendanceLogs: (startDate?: string, endDate?: string, statusFilter?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (statusFilter) params.append('status_filter', statusFilter);
    return request<any[]>(`/attendance/logs?${params.toString()}`);
  },
  getClientAttendanceHistory: (clientId: number) => request<any[]>(`/attendance/client/${clientId}`),
  manualAttendance: (data: any) => request<any>('/attendance/manual', { method: 'POST', body: JSON.stringify(data) }),
  simulatePunch: (biometricUserId: string, deviceId = 'DEVICE-01', punchType = 'IN') => {
    const params = new URLSearchParams({
      biometric_user_id: biometricUserId,
      device_id: deviceId,
      punch_type: punchType
    });
    return request<any>(`/attendance/simulate?${params.toString()}`, { method: 'POST' });
  },

  // Payments
  getPayments: (clientId?: number) => {
    const query = clientId ? `?client_id=${clientId}` : '';
    return request<any[]>(`/payments${query}`);
  },
  recordPayment: (data: any) => request<any>('/payments', { method: 'POST', body: JSON.stringify(data) }),

  // Monthly Statement, Locks & Settings
  getMonthlyStatement: (clientId: number, month: number, year: number) => 
    request<any>(`/reports/monthly-statement/${clientId}?month=${month}&year=${year}`),
  getMonthlyLockStatus: (month: number, year: number) =>
    request<any>(`/reports/monthly-lock-status?month=${month}&year=${year}`),
  toggleMonthlyLock: (month: number, year: number, action: 'LOCK' | 'UNLOCK') =>
    request<any>('/reports/monthly-lock-toggle', { method: 'POST', body: JSON.stringify({ month, year, action }) }),

  getSettings: () => request<any>('/reports/settings'),
  updateSettings: (data: Record<string, string>) => request<any>('/reports/settings', { method: 'POST', body: JSON.stringify(data) }),
  getFailedPunches: () => request<any[]>('/reports/failed-punches'),

  // Devices & Audit
  getDevices: () => request<any[]>('/devices'),
  createDevice: (data: any) => request<any>('/devices', { method: 'POST', body: JSON.stringify(data) }),
  getAuditLogs: () => request<any[]>('/audit-logs')
};
