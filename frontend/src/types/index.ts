export interface User {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'staff';
  status: string;
  last_login?: string;
}

export interface ClientPlan {
  id: number;
  plan_id: number;
  plan_name?: string;
  start_date: string;
  end_date: string;
  amount: number;
  status: string;
}

export interface Client {
  id: number;
  client_code: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  gender?: string;
  date_of_birth?: string;
  photo_url?: string;
  biometric_user_id: string;
  client_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  active_plan?: ClientPlan;
}

export interface Plan {
  id: number;
  name: string;
  description?: string;
  monthly_fee: number;
  meal_limit: number;
  validity_days: number;
  status: string;
  created_at: string;
}

export interface Attendance {
  id: number;
  client_id?: number;
  biometric_user_id: string;
  device_id: string;
  attendance_date: string;
  attendance_time: string;
  punch_type: string;
  source: string;
  status: string;
  validation_message?: string;
  created_at: string;
  client_name?: string;
  client_code?: string;
}

export interface Payment {
  id: number;
  client_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  transaction_reference?: string;
  notes?: string;
  status: string;
  recorded_by?: string;
  created_at: string;
  client_name?: string;
}

export interface Device {
  id: number;
  device_id: string;
  name: string;
  location?: string;
  adapter_type: string;
  status: string;
  last_seen: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_email: string;
  action: string;
  target_entity?: string;
  target_id?: string;
  details?: string;
  created_at: string;
}

export interface DashboardStats {
  total_clients: number;
  active_clients: number;
  active_plans: number;
  todays_attendance: number;
  expiring_plans: number;
  weekly_trend: Array<{ date: string; count: number }>;
  recent_punches: Array<{
    id: number;
    time: string;
    client_name: string;
    client_code: string;
    status: string;
    punch_type: string;
    device_id: string;
  }>;
}

export interface MonthlyStatement {
  statement_period: string;
  client: {
    id: number;
    client_code: string;
    name: string;
    mobile: string;
    email?: string;
    biometric_user_id: string;
    client_type: string;
    status: string;
  };
  plan: {
    name: string;
    amount: number;
    start_date?: string;
    end_date?: string;
  };
  attendance: {
    total_days: number;
    present_days: number;
    absent_days: number;
    attendance_percentage: number;
    meals_used: {
      breakfast: number;
      lunch: number;
      dinner: number;
      general_checkins: number;
    };
  };
  financials: {
    plan_fee: number;
    total_paid: number;
    balance_due: number;
    payment_history: Array<{
      date: string;
      amount: number;
      method: string;
      reference?: string;
    }>;
  };
}
