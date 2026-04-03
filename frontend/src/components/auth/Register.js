import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Button, Input, Select, Alert } from '../ui';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.register(form);
      navigate('/login');
    } catch (err) { setError(err.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 16 }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#6c8fff,#4d6fe0)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px' }}>₹</div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Create Account</h1>
        </div>
        <div style={{ background: '#1f2330', border: '1px solid #2a2f3e', borderRadius: 16, padding: 32 }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {error && <Alert type="error">{error}</Alert>}
            <Input label="Full Name" value={form.name} onChange={set('name')} placeholder="Jane Doe" required />
            <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
            <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" required />
            <Select label="Role" value={form.role} onChange={set('role')}>
              <option value="viewer">Viewer</option>
              <option value="analyst">Analyst</option>
              <option value="admin">Admin</option>
            </Select>
            <Button type="submit" loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              Create Account
            </Button>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: 20, color: '#555c72', fontSize: 13 }}>
          Already have an account? <Link to="/login" style={{ color: '#6c8fff' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
