import React, { useEffect, useState } from 'react';
import { UtensilsCrossed, Coffee, Sun, Moon, Users, TrendingUp } from 'lucide-react';
import { api } from '../services/api';

export const MealsPage: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getClients(), api.getAttendanceLogs()])
      .then(([c, a]) => { setClients(c); setAttendance(a); })
      .finally(() => setLoading(false));
  }, []);

  // Aggregate meal data from attendance records (punch_type = BREAKFAST/LUNCH/DINNER)
  const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER'];
  const mealIcons: Record<string, any> = {
    BREAKFAST: <Coffee size={16} color="#F59E0B" />,
    LUNCH:     <Sun size={16} color="#10B981" />,
    DINNER:    <Moon size={16} color="#8B5CF6" />,
  };
  const mealColors: Record<string, string> = {
    BREAKFAST: '#F59E0B',
    LUNCH:     '#10B981',
    DINNER:    '#8B5CF6',
  };

  const today = new Date().toISOString().split('T')[0];
  const todayLogs = attendance.filter(a => a.attendance_date === today);

  const mealCounts = mealTypes.reduce((acc, m) => {
    acc[m] = todayLogs.filter(a => a.punch_type === m).length;
    return acc;
  }, {} as Record<string, number>);

  // Per-client meal summary
  const clientMealMap: Record<string, Record<string, number>> = {};
  todayLogs.forEach(log => {
    if (!log.client_name) return;
    if (!clientMealMap[log.client_name]) clientMealMap[log.client_name] = { BREAKFAST: 0, LUNCH: 0, DINNER: 0 };
    if (mealTypes.includes(log.punch_type)) clientMealMap[log.client_name][log.punch_type]++;
  });

  const clientMealRows = Object.entries(clientMealMap);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh', color: 'var(--text-secondary)' }}>
      Loading Meal Consumption Data...
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(139,92,246,0.08))',
        border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '1.25rem 1.5rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🍽️ Meal & Service Consumption</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Track Breakfast / Lunch / Dinner separately from general attendance. Each meal scan is a separate biometric event.
        </p>
      </div>

      {/* Concept Explainer */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
          How It Works
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {[
            { icon: '👆', step: '1. Finger Scan', desc: 'Client scans at meal station' },
            { icon: '📡', step: '2. Punch Type', desc: 'Device sends BREAKFAST / LUNCH / DINNER' },
            { icon: '⚙️', step: '3. Attendance Engine', desc: 'Validates and records separately from entry attendance' },
            { icon: '📊', step: '4. Settlement', desc: 'Meals counted in monthly settlement statement' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{item.icon}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>{item.step}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Meal Totals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {mealTypes.map(meal => (
          <div key={meal} style={{
            padding: '1.5rem', borderRadius: '14px', textAlign: 'center',
            background: `linear-gradient(135deg, ${mealColors[meal]}18, ${mealColors[meal]}06)`,
            border: `1px solid ${mealColors[meal]}30`
          }}>
            <div style={{ marginBottom: '8px' }}>{mealIcons[meal]}</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: mealColors[meal] }}>{mealCounts[meal]}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '4px' }}>{meal.charAt(0) + meal.slice(1).toLowerCase()}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>meals served today</div>
          </div>
        ))}
      </div>

      {/* Per-Client Meal Breakdown */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
          Today's Per-Client Meal Breakdown
        </h3>
        {clientMealRows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <UtensilsCrossed size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <p>No meal punches recorded today.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Use the Biometric Punch Simulator with BREAKFAST / LUNCH / DINNER punch types to test.</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th style={{ textAlign: 'center' }}>☕ Breakfast</th>
                  <th style={{ textAlign: 'center' }}>☀️ Lunch</th>
                  <th style={{ textAlign: 'center' }}>🌙 Dinner</th>
                  <th style={{ textAlign: 'center' }}>Total Meals</th>
                </tr>
              </thead>
              <tbody>
                {clientMealRows.map(([name, meals], i) => {
                  const total = meals.BREAKFAST + meals.LUNCH + meals.DINNER;
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{name}</td>
                      <td style={{ textAlign: 'center' }}>
                        {meals.BREAKFAST > 0
                          ? <span style={{ color: '#F59E0B', fontWeight: 700 }}>✓ {meals.BREAKFAST}</span>
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {meals.LUNCH > 0
                          ? <span style={{ color: '#10B981', fontWeight: 700 }}>✓ {meals.LUNCH}</span>
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {meals.DINNER > 0
                          ? <span style={{ color: '#8B5CF6', fontWeight: 700 }}>✓ {meals.DINNER}</span>
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem' }}>{total}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info note */}
      <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.2)', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        <strong style={{ color: '#06B6D4' }}>Monthly Settlement:</strong> At month-end, the Monthly Settlement module uses meal counts (Breakfast: {'{'}count{'}'}, Lunch, Dinner) to finalize each client's billing.
        The meal plan limit (e.g., 90 meals/month) is tracked against consumption and reflected in the Monthly Statement.
      </div>
    </div>
  );
};
