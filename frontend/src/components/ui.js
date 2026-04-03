import React from 'react';

/* ── Spinner ─────────────────────────────────────────────────────── */
export function Spinner({ size = 20 }) {
  return (
    <div style={{
      width: size, height: size, border: `2px solid #2a2f3e`,
      borderTop: `2px solid #6c8fff`, borderRadius: '50%',
      animation: 'spin 0.7s linear infinite', display: 'inline-block'
    }} />
  );
}

/* ── Button ──────────────────────────────────────────────────────── */
export function Button({ children, variant = 'primary', size = 'md', loading, disabled, style, ...props }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    fontFamily: 'var(--font)', fontWeight: 500, borderRadius: 8,
    transition: 'all 0.15s', cursor: disabled || loading ? 'not-allowed' : 'pointer',
    border: 'none', outline: 'none', opacity: disabled || loading ? 0.6 : 1,
    padding: size === 'sm' ? '6px 14px' : size === 'lg' ? '12px 28px' : '9px 20px',
    fontSize: size === 'sm' ? 12 : 14,
  };
  const variants = {
    primary: { background: '#6c8fff', color: '#fff' },
    danger:  { background: '#f87171', color: '#fff' },
    ghost:   { background: 'transparent', color: '#8b91a8', border: '1px solid #2a2f3e' },
    success: { background: '#34d399', color: '#0d1117' },
  };
  return (
    <button style={{ ...base, ...variants[variant], ...style }} disabled={disabled || loading} {...props}>
      {loading ? <Spinner size={14} /> : null}
      {children}
    </button>
  );
}

/* ── Input ───────────────────────────────────────────────────────── */
export function Input({ label, error, style, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, color: '#8b91a8', fontWeight: 500 }}>{label}</label>}
      <input
        style={{
          background: '#1a1e28', border: `1px solid ${error ? '#f87171' : '#2a2f3e'}`,
          borderRadius: 8, padding: '9px 12px', color: '#e8eaf0', fontSize: 14,
          transition: 'border 0.15s', width: '100%', ...style
        }}
        {...props}
      />
      {error && <span style={{ fontSize: 11, color: '#f87171' }}>{error}</span>}
    </div>
  );
}

/* ── Select ──────────────────────────────────────────────────────── */
export function Select({ label, error, children, style, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, color: '#8b91a8', fontWeight: 500 }}>{label}</label>}
      <select
        style={{
          background: '#1a1e28', border: `1px solid ${error ? '#f87171' : '#2a2f3e'}`,
          borderRadius: 8, padding: '9px 12px', color: '#e8eaf0', fontSize: 14,
          width: '100%', ...style
        }}
        {...props}
      >
        {children}
      </select>
      {error && <span style={{ fontSize: 11, color: '#f87171' }}>{error}</span>}
    </div>
  );
}

/* ── Card ────────────────────────────────────────────────────────── */
export function Card({ children, style, ...props }) {
  return (
    <div style={{
      background: '#1f2330', border: '1px solid #2a2f3e',
      borderRadius: 16, padding: '20px 24px', ...style
    }} {...props}>
      {children}
    </div>
  );
}

/* ── Badge ───────────────────────────────────────────────────────── */
export function Badge({ children, variant = 'default' }) {
  const colors = {
    income:   { bg: '#0f2a20', color: '#34d399' },
    expense:  { bg: '#2a0f0f', color: '#f87171' },
    admin:    { bg: '#1a1633', color: '#6c8fff' },
    analyst:  { bg: '#2a1f0a', color: '#fbbf24' },
    viewer:   { bg: '#1a1e28', color: '#8b91a8' },
    active:   { bg: '#0f2a20', color: '#34d399' },
    inactive: { bg: '#2a0f0f', color: '#f87171' },
    default:  { bg: '#1a1e28', color: '#8b91a8' },
  };
  const c = colors[children?.toLowerCase?.()] || colors[variant] || colors.default;
  return (
    <span style={{
      background: c.bg, color: c.color, padding: '3px 10px',
      borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em'
    }}>
      {children}
    </span>
  );
}

/* ── Modal ───────────────────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fade-in" style={{
        background: '#1f2330', border: '1px solid #2a2f3e', borderRadius: 16,
        width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #2a2f3e' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8b91a8', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
}

/* ── Alert ───────────────────────────────────────────────────────── */
export function Alert({ type = 'error', children }) {
  const c = type === 'error'
    ? { bg: '#2a0f0f', border: '#f87171', color: '#f87171' }
    : { bg: '#0f2a20', border: '#34d399', color: '#34d399' };
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, padding: '10px 14px', color: c.color, fontSize: 13 }}>
      {children}
    </div>
  );
}

/* ── Stat Card ───────────────────────────────────────────────────── */
export function StatCard({ label, value, sub, color = '#6c8fff', icon }) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: '#8b91a8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, color, fontFamily: 'var(--mono)', letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#555c72' }}>{sub}</div>}
    </Card>
  );
}

/* ── Empty State ─────────────────────────────────────────────────── */
export function Empty({ message = 'No data found', icon = '📭' }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: '#555c72' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14 }}>{message}</div>
    </div>
  );
}

/* ── Format helpers ──────────────────────────────────────────────── */
export function fmtCurrency(n) {
  if (!n && n !== 0) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
