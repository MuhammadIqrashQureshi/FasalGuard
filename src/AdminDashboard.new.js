import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Eye } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RePieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('today');

  useEffect(() => {
    setTimeout(() => {
      setDashboardData({
        total_predictions: 2847,
        active_users: 342,
        model_accuracy: 89.5,
        weather_requests: 1523,
        system_health: 'Healthy',
        avg_response_time: 145,
        accuracy_trend: '+3.2%',
        prediction_growth: 18,
        top_crops: [
          { crop: 'Wheat', value: 45 },
          { crop: 'Rice', value: 25 },
          { crop: 'Cotton', value: 15 },
          { crop: 'Maize', value: 15 }
        ]
      });
    }, 300);
  }, []);

  const statsCards = [
    { id: 1, title: 'Total Predictions', value: dashboardData?.total_predictions || 0, color: '#10b981', description: 'Crop predictions made' },
    { id: 2, title: 'Active Users', value: dashboardData?.active_users || 0, color: '#34d399', description: 'Users (7d)' },
    { id: 3, title: 'ML Accuracy', value: dashboardData?.model_accuracy ? `${dashboardData.model_accuracy}%` : 'N/A', color: '#059669', description: 'Average accuracy' }
  ];

  const trendData = Array.from({ length: 12 }).map((_, i) => ({ name: `D${i + 1}`, value: Math.round((Math.sin(i / 3) + 1.5) * (200 + i * 8)) }));
  const pieData = dashboardData?.top_crops || [ { name: 'Wheat', value: 45 }, { name: 'Rice', value: 25 }, { name: 'Cotton', value: 15 }, { name: 'Maize', value: 15 } ];
  const PIE_COLORS = ['#10b981', '#34d399', '#059669', '#6ee7b7'];

  return (
    <div style={{ minHeight: '100vh', padding: 16, background: 'linear-gradient(180deg,#04121a 0%,#052221 40%,#072b22 100%)', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <style>{`
        .glass { background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)); backdrop-filter: blur(12px); border:1px solid rgba(255,255,255,0.06); border-radius: 12px; }
        .glass-soft { background: rgba(255,255,255,0.03); border-radius:10px; border:1px solid rgba(255,255,255,0.05); }
        .kpi-value { font-size: 28px; font-weight:700; color:#fff }
        .kpi-title { color: rgba(255,255,255,0.9); font-weight:600 }
        .muted { color: rgba(255,255,255,0.6) }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 20 }}>
        <main style={{ flex: 1 }}>
          <div className="glass" style={{ padding: 20, marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ color: '#fff', fontSize: 24, margin: 0 }}>FasalGuard Admin</h1>
                <div className="muted" style={{ marginTop: 6 }}>Real-time analytics and climate-smart insights</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.06)', padding: '8px 12px', borderRadius: 10 }}>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
                <button onClick={() => setLoading(true)} style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.16)', color: '#fff' }}>
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 18 }}>
            {statsCards.map((s) => (
              <div key={s.id} className="glass" style={{ padding: 18 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 8, height: 56, borderRadius: 8, background: s.color }} />
                  <div style={{ flex: 1 }}>
                    <div className="kpi-value">{s.value}</div>
                    <div className="kpi-title">{s.title}</div>
                    <div className="muted" style={{ marginTop: 6 }}>{s.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
            <div className="glass" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ color: '#fff', margin: 0 }}>Crop Prediction Distribution</h3>
                <button className="glass-soft" style={{ padding: 8 }}><Download size={14} /></button>
              </div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={pieData} dataKey="value" nameKey="crop" innerRadius={36} outerRadius={80} paddingAngle={4}>
                      {pieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip wrapperStyle={{ background: 'rgba(0,0,0,0.6)', borderRadius: 8 }} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ color: '#fff', margin: 0 }}>Prediction Trends</h3>
                <div className="muted">Last 30 days</div>
              </div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.75)' }} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.75)' }} />
                    <Tooltip wrapperStyle={{ background: 'rgba(0,0,0,0.6)', borderRadius: 8 }} />
                    <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#g1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="glass" style={{ padding: 18, marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ color: '#fff', margin: 0 }}>Recent Predictions</h3>
              <button style={{ background: 'transparent', color: '#9ae6b4', border: 'none' }}><Eye size={14} /> View All</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th style={{ textAlign: 'left', padding: 8, color: 'rgba(255,255,255,0.8)' }}>Time</th>
                    <th style={{ textAlign: 'left', padding: 8, color: 'rgba(255,255,255,0.8)' }}>Location</th>
                    <th style={{ textAlign: 'left', padding: 8, color: 'rgba(255,255,255,0.8)' }}>Crop</th>
                    <th style={{ textAlign: 'left', padding: 8, color: 'rgba(255,255,255,0.8)' }}>Yield</th>
                    <th style={{ textAlign: 'left', padding: 8, color: 'rgba(255,255,255,0.8)' }}>Confidence</th>
                    <th style={{ textAlign: 'left', padding: 8, color: 'rgba(255,255,255,0.8)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData && (
                    [
                      { id: 1, time: '10:30 AM', location: 'Lahore, Punjab', crop: 'Wheat', yield: '4.2 t/ha', confidence: 0.85, status: 'Completed' },
                      { id: 2, time: '11:15 AM', location: 'Faisalabad, Punjab', crop: 'Rice', yield: '3.8 t/ha', confidence: 0.72, status: 'Completed' }
                    ].map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: 8, color: 'rgba(255,255,255,0.9)' }}>{r.time}</td>
                        <td style={{ padding: 8, color: 'rgba(255,255,255,0.9)' }}>{r.location}</td>
                        <td style={{ padding: 8, color: 'rgba(255,255,255,0.9)' }}>{r.crop}</td>
                        <td style={{ padding: 8, color: 'rgba(255,255,255,0.9)' }}>{r.yield}</td>
                        <td style={{ padding: 8 }}><span style={{ padding: '4px 8px', borderRadius: 999, background: r.confidence > 0.8 ? 'rgba(16,185,129,0.12)' : 'rgba(250,204,21,0.08)', color: '#fff' }}>{Math.round(r.confidence*100)}%</span></td>
                        <td style={{ padding: 8, color: 'rgba(255,255,255,0.9)' }}>{r.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
