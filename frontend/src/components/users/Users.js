import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, Badge, Modal, Select, Alert, Spinner, Empty, fmtDate } from '../ui';

function UserForm({ user, onSave, onCancel }) {
  const [form, setForm] = useState({ name: user.name, role: user.role, status: user.status });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try { onSave(await api.updateUser(user.id, form)); }
    catch (err) { setError(err.message || 'Failed to update'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && <Alert type="error">{error}</Alert>}
      <div style={{ background: '#13161d', borderRadius: 10, padding: '14px 16px' }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{user.name}</div>
        <div style={{ fontSize: 12, color: '#8b91a8', marginTop: 2 }}>{user.email}</div>
      </div>
      <Select label="Role" value={form.role} onChange={set('role')}>
        <option value="viewer">Viewer</option>
        <option value="analyst">Analyst</option>
        <option value="admin">Admin</option>
      </Select>
      <Select label="Status" value={form.status} onChange={set('status')}>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </Select>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>Save Changes</Button>
      </div>
    </form>
  );
}

export default function Users() {
  const { user: currentUser } = useAuth();
  const [data, setData]     = useState({ rows: [], total: 0 });
  const [filters, setFilters] = useState({ role: '', status: '', page: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await api.getUsers(filters)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleSave = updated => {
    setEditing(null);
    setData(d => ({ ...d, rows: d.rows.map(u => u.id === updated.id ? updated : u) }));
    setSuccess('User updated successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this user permanently?')) return;
    setDeleting(id);
    try { await api.deleteUser(id); load(); setSuccess('User deleted'); setTimeout(() => setSuccess(''), 3000); }
    catch (e) { setError(e.message); }
    finally { setDeleting(null); }
  };

  const setFilter = k => e => setFilters(f => ({ ...f, [k]: e.target.value, page: 1 }));

  const roleColors = { admin: '#6c8fff', analyst: '#fbbf24', viewer: '#8b91a8' };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>User Management</h1>
        <p style={{ color: '#8b91a8', fontSize: 13, marginTop: 4 }}>{data.total} registered users</p>
      </div>

      {error   && <Alert type="error"   style={{ marginBottom: 16 }}>{error}</Alert>}
      {success && <Alert type="success" style={{ marginBottom: 16 }}>{success}</Alert>}

      {/* Filters */}
      <Card style={{ marginBottom: 16, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Select value={filters.role} onChange={setFilter('role')} style={{ minWidth: 140 }}>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="analyst">Analyst</option>
            <option value="viewer">Viewer</option>
          </Select>
          <Select value={filters.status} onChange={setFilter('status')} style={{ minWidth: 140 }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <Button variant="ghost" onClick={() => setFilters({ role:'', status:'', page:1, limit:20 })}>Clear</Button>
        </div>
      </Card>

      {/* User cards grid */}
      {loading
        ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={32} /></div>
        : data.rows.length === 0
          ? <Empty message="No users found" icon="👥" />
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {data.rows.map(u => (
                <Card key={u.id} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {/* Avatar */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: `${roleColors[u.role]}22`, border: `1px solid ${roleColors[u.role]}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 700, color: roleColors[u.role]
                    }}>
                      {u.name[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {u.name}
                        {u.id === currentUser.id && <span style={{ fontSize: 10, color: '#6c8fff', background: '#1a1e45', padding: '2px 7px', borderRadius: 10 }}>You</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#555c72', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Badge>{u.role}</Badge>
                    <Badge>{u.status}</Badge>
                  </div>

                  <div style={{ fontSize: 11, color: '#555c72' }}>Joined {fmtDate(u.created_at)}</div>

                  {u.id !== currentUser.id && (
                    <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #2a2f3e', paddingTop: 14 }}>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(u)} style={{ flex: 1, justifyContent: 'center' }}>Edit</Button>
                      <Button size="sm" variant="danger" loading={deleting === u.id} onClick={() => handleDelete(u.id)} style={{ flex: 1, justifyContent: 'center' }}>Delete</Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
      }

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit User">
        {editing && <UserForm user={editing} onSave={handleSave} onCancel={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}
