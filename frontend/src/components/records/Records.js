import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, Badge, Modal, Input, Select, Alert, Spinner, Empty, fmtCurrency, fmtDate } from '../ui';

const CATEGORIES = ['Salary','Rent','Food','Transport','Utilities','Healthcare','Entertainment','Education','Investment','Other'];
const EMPTY_FORM = { amount: '', type: 'income', category: 'Salary', date: new Date().toISOString().slice(0,10), notes: '' };

function RecordForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      const result = initial?.id
        ? await api.updateRecord(initial.id, payload)
        : await api.createRecord(payload);
      onSave(result);
    } catch (err) { setError(err.message || 'Failed to save'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && <Alert type="error">{error}</Alert>}
      <Input label="Amount (₹)" type="number" min="0.01" step="0.01" value={form.amount} onChange={set('amount')} placeholder="e.g. 5000" required />
      <Select label="Type" value={form.type} onChange={set('type')}>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </Select>
      <Select label="Category" value={form.category} onChange={set('category')}>
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </Select>
      <Input label="Date" type="date" value={form.date} onChange={set('date')} required />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, color: '#8b91a8', fontWeight: 500 }}>Notes</label>
        <textarea value={form.notes} onChange={set('notes')} rows={3} placeholder="Optional notes..."
          style={{ background: '#1a1e28', border: '1px solid #2a2f3e', borderRadius: 8, padding: '9px 12px', color: '#e8eaf0', fontSize: 14, resize: 'vertical', fontFamily: 'var(--font)' }} />
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{initial?.id ? 'Update' : 'Create'} Record</Button>
      </div>
    </form>
  );
}

export default function Records() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [data, setData] = useState({ rows: [], total: 0, page: 1, limit: 15 });
  const [filters, setFilters] = useState({ type: '', category: '', startDate: '', endDate: '', page: 1, limit: 15 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | record obj
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await api.getRecords(filters)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleSave = () => { setModal(null); load(); };

  const handleDelete = async id => {
    setDeleting(id);
    try { await api.deleteRecord(id); load(); }
    catch (e) { setError(e.message); }
    finally { setDeleting(null); }
  };

  const setFilter = k => e => setFilters(f => ({ ...f, [k]: e.target.value, page: 1 }));

  const totalPages = Math.ceil(data.total / data.limit);

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Records</h1>
          <p style={{ color: '#8b91a8', fontSize: 13, marginTop: 4 }}>{data.total} total records</p>
        </div>
        {isAdmin && <Button onClick={() => setModal('create')}>+ New Record</Button>}
      </div>

      {error && <Alert type="error" style={{ marginBottom: 16 }}>{error}</Alert>}

      {/* Filters */}
      <Card style={{ marginBottom: 16, padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          <Select value={filters.type} onChange={setFilter('type')}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
          <Select value={filters.category} onChange={setFilter('category')}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input type="date" value={filters.startDate} onChange={setFilter('startDate')} placeholder="From" />
          <Input type="date" value={filters.endDate} onChange={setFilter('endDate')} placeholder="To" />
          <Button variant="ghost" onClick={() => setFilters({ type:'', category:'', startDate:'', endDate:'', page:1, limit:15 })}>
            Clear
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading
          ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={32} /></div>
          : data.rows.length === 0
            ? <Empty message="No records match your filters" icon="📋" />
            : <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2a2f3e' }}>
                      {['Date','Type','Category','Amount','Notes','By', isAdmin?'Actions':''].filter(Boolean).map(h => (
                        <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#555c72', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((r, i) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #1a1e28', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                        <td style={{ padding: '14px 20px', fontSize: 13, color: '#8b91a8', whiteSpace: 'nowrap', fontFamily: 'var(--mono)' }}>{fmtDate(r.date)}</td>
                        <td style={{ padding: '14px 20px' }}><Badge>{r.type}</Badge></td>
                        <td style={{ padding: '14px 20px', fontSize: 13 }}>{r.category}</td>
                        <td style={{ padding: '14px 20px', fontFamily: 'var(--mono)', fontWeight: 600, color: r.type === 'income' ? '#34d399' : '#f87171', whiteSpace: 'nowrap' }}>
                          {r.type === 'income' ? '+' : '-'}{fmtCurrency(r.amount)}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 12, color: '#555c72', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes || '—'}</td>
                        <td style={{ padding: '14px 20px', fontSize: 12, color: '#8b91a8' }}>{r.created_by_name}</td>
                        {isAdmin && (
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <Button size="sm" variant="ghost" onClick={() => setModal(r)}>Edit</Button>
                              <Button size="sm" variant="danger" loading={deleting === r.id} onClick={() => handleDelete(r.id)}>Del</Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
        }

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid #2a2f3e' }}>
            <span style={{ fontSize: 12, color: '#555c72' }}>Page {data.page} of {totalPages}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm" variant="ghost" disabled={data.page <= 1}
                onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Prev</Button>
              <Button size="sm" variant="ghost" disabled={data.page >= totalPages}
                onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next →</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? 'Edit Record' : 'New Record'}>
        <RecordForm
          initial={modal?.id ? modal : null}
          onSave={handleSave}
          onCancel={() => setModal(null)}
        />
      </Modal>
    </div>
  );
}
