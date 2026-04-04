const BASE = process.env.REACT_APP_API_URL || '/api';

function getToken() { return localStorage.getItem('token'); }

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, message: data.error || 'Request failed', details: data.details };
  return data;
}

export const api = {
  // Auth
  login:    (body) => request('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me:       ()     => request('/auth/me'),

  // Records
  getRecords: (params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/records${q ? '?' + q : ''}`);
  },
  getRecord:    (id)       => request(`/records/${id}`),
  createRecord: (body)     => request('/records',     { method: 'POST',   body: JSON.stringify(body) }),
  updateRecord: (id, body) => request(`/records/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteRecord: (id)       => request(`/records/${id}`, { method: 'DELETE' }),

  // Dashboard
  getSummary:    ()       => request('/dashboard/summary'),
  getCategories: ()       => request('/dashboard/categories'),
  getMonthly:    (months) => request(`/dashboard/monthly?months=${months || 12}`),
  getWeekly:     (weeks)  => request(`/dashboard/weekly?weeks=${weeks || 8}`),
  getRecent:     (limit)  => request(`/dashboard/recent?limit=${limit || 10}`),

  // Users
  getUsers: (params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/users${q ? '?' + q : ''}`);
  },
  getUser:    (id)        => request(`/users/${id}`),
  updateUser: (id, body)  => request(`/users/${id}`, { method: 'PATCH',  body: JSON.stringify(body) }),
  deleteUser: (id)        => request(`/users/${id}`, { method: 'DELETE' }),
};