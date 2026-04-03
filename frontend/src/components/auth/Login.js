import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Button, Input, Alert } from '../ui';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) { navigate('/'); return null; }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await api.login(form);
      login(data.token, data.user);
      navigate(data.user.role === 'viewer' ? '/records' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 16
    }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 52, height: 52, background: 'linear-gradient(135deg,#6c8fff,#4d6fe0)',
            borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, margin: '0 auto 16px'
          }}>₹</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>FinanceDash</h1>
          <p style={{ color: '#8b91a8', marginTop: 6, fontSize: 13 }}>Sign in to your account</p>
        </div>

        <div style={{ background: '#1f2330', border: '1px solid #2a2f3e', borderRadius: 16, padding: '32px' }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {error && <Alert type="error">{error}</Alert>}
            <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
            <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required />
            <Button type="submit" loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              Sign In
            </Button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#555c72', fontSize: 13 }}>
          No account? <Link to="/register" style={{ color: '#6c8fff' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}