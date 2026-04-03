import React, { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../../api/client';
import { StatCard, Card, Badge, Spinner, fmtCurrency, fmtDate } from '../ui';

const COLORS = ['#6c8fff','#34d399','#fbbf24','#f87171','#a78bfa','#38bdf8','#fb923c','#4ade80'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1f2330', border: '1px solid #2a2f3e', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: '#8b91a8', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: {fmtCurrency(p.value)}
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getSummary(), api.getMonthly(12), api.getCategories(), api.getRecent(8)])
      .then(([s, m, c, r]) => { setSummary(s); setMonthly(m); setCategories(c); setRecent(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={36} /></div>;

  // Pie data: income vs expense categories
  const expenseCats = categories.filter(c => c.type === 'expense').slice(0, 6);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Dashboard</h1>
        <p style={{ color: '#8b91a8', marginTop: 4, fontSize: 13 }}>Financial overview & analytics</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Income"   value={fmtCurrency(summary?.total_income)}   color="#34d399" icon="↑" />
        <StatCard label="Total Expenses" value={fmtCurrency(summary?.total_expenses)} color="#f87171" icon="↓" />
        <StatCard label="Net Balance"    value={fmtCurrency(summary?.net_balance)}    color={summary?.net_balance >= 0 ? '#34d399' : '#f87171'} icon="≈" />
        <StatCard label="Total Records"  value={summary?.total_records || 0}          color="#6c8fff" icon="⊞" />
      </div>

      {/* Monthly chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 20, color: '#8b91a8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monthly Trend</div>
          {monthly.length === 0
            ? <div style={{ textAlign: 'center', color: '#555c72', padding: 40 }}>No data yet</div>
            : <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthly} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: '#555c72', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#555c72', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="income"   name="Income"   stroke="#34d399" strokeWidth={2} fill="url(#ig)" />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f87171" strokeWidth={2} fill="url(#eg)" />
                </AreaChart>
              </ResponsiveContainer>
          }
          <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
            {[['#34d399','Income'],['#f87171','Expenses']].map(([c,l]) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8b91a8' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block' }}/>
                {l}
              </span>
            ))}
          </div>
        </Card>

        {/* Expense by category pie */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 20, color: '#8b91a8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Expenses by Category</div>
          {expenseCats.length === 0
            ? <div style={{ textAlign: 'center', color: '#555c72', padding: 40 }}>No data yet</div>
            : <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={expenseCats} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={75} strokeWidth={2} stroke="#1f2330">
                      {expenseCats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => fmtCurrency(v)} contentStyle={{ background: '#1f2330', border: '1px solid #2a2f3e', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {expenseCats.slice(0, 4).map((c, i) => (
                    <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8b91a8' }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i], display: 'inline-block' }} />
                        {c.category}
                      </span>
                      <span style={{ color: '#e8eaf0', fontFamily: 'var(--mono)' }}>{fmtCurrency(c.total)}</span>
                    </div>
                  ))}
                </div>
              </>
          }
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 20, color: '#8b91a8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recent Activity</div>
        {recent.length === 0
          ? <div style={{ textAlign: 'center', color: '#555c72', padding: 32 }}>No recent activity</div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {recent.map(r => (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 0', borderBottom: '1px solid #1f2330'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: r.type === 'income' ? '#0f2a20' : '#2a0f0f',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16
                    }}>
                      {r.type === 'income' ? '↑' : '↓'}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{r.category}</div>
                      <div style={{ fontSize: 11, color: '#555c72' }}>{fmtDate(r.date)} · {r.created_by}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: r.type === 'income' ? '#34d399' : '#f87171' }}>
                    {r.type === 'income' ? '+' : '-'}{fmtCurrency(r.amount)}
                  </div>
                </div>
              ))}
            </div>
        }
      </Card>
    </div>
  );
}
