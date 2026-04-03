import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { path: '/dashboard', label: 'Dashboard', icon: '◈', roles: ['analyst','admin'] },
  { path: '/records',   label: 'Records',   icon: '⊞', roles: ['viewer','analyst','admin'] },
  { path: '/users',     label: 'Users',     icon: '⊙', roles: ['admin'] },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const links = NAV.filter(n => n.roles.includes(user?.role));
  const W = collapsed ? 64 : 220;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: W, minWidth: W, background: '#13161d',
        borderRight: '1px solid #1f2330', display: 'flex', flexDirection: 'column',
        transition: 'width 0.2s', overflow: 'hidden', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #1f2330', display: 'flex', alignItems: 'center', gap: 12, minHeight: 64 }}>
          <div style={{
            width: 32, height: 32, background: 'linear-gradient(135deg,#6c8fff,#4d6fe0)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0
          }}>₹</div>
          {!collapsed && <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>FinanceDash</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {links.map(link => {
            const active = location.pathname.startsWith(link.path);
            return (
              <button key={link.path} onClick={() => navigate(link.path)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                borderRadius: 8, background: active ? '#1f2a4a' : 'transparent',
                color: active ? '#6c8fff' : '#8b91a8', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: active ? 600 : 400, textAlign: 'left',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{link.icon}</span>
                {!collapsed && link.label}
              </button>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid #1f2330' }}>
          {!collapsed && (
            <div style={{ padding: '10px 12px', marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: '#8b91a8', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          )}
          <button onClick={() => setCollapsed(c => !c)} style={{
            width: '100%', padding: '8px 12px', borderRadius: 8, background: 'transparent',
            color: '#555c72', border: 'none', cursor: 'pointer', fontSize: 12, textAlign: collapsed ? 'center' : 'left'
          }}>
            {collapsed ? '→' : '← Collapse'}
          </button>
          <button onClick={() => { logout(); navigate('/login'); }} style={{
            width: '100%', padding: '8px 12px', borderRadius: 8, background: 'transparent',
            color: '#f87171', border: 'none', cursor: 'pointer', fontSize: 12, textAlign: 'left'
          }}>
            {collapsed ? '⏻' : '⏻  Logout'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: W, flex: 1, padding: '32px', transition: 'margin-left 0.2s', minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
