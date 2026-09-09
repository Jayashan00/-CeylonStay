import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'

const ROLE_STYLES = {
  ADMIN: 'bg-purple-100 text-purple-700',
  HOTEL_OWNER: 'bg-blue-100 text-blue-700',
  GUEST: 'bg-slate-100 text-slate-600',
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('ALL')

  function load() {
    setLoading(true)
    api.get('/admin/users').then((res) => setUsers(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function toggleActive(user) {
    await api.put(`/admin/users/${user.id}/active`, { active: !user.active })
    load()
  }

  if (loading) return <Loader />

  const filtered = roleFilter === 'ALL' ? users : users.filter((u) => u.role === roleFilter)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link to="/admin" className="text-primary text-sm hover:underline">← Back to dashboard</Link>
      <div className="flex items-center justify-between mt-2 mb-6 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl">All users ({users.length})</h1>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field w-48 text-sm">
          <option value="ALL">All roles</option>
          <option value="GUEST">Guests</option>
          <option value="HOTEL_OWNER">Hotel owners</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="p-3 font-medium">{u.fullName}</td>
                <td className="p-3 text-slate-500">{u.email}</td>
                <td className="p-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_STYLES[u.role]}`}>{u.role.replace('_', ' ')}</span></td>
                <td className="p-3">{u.active ? <span className="text-green-600 text-xs font-semibold">Active</span> : <span className="text-red-600 text-xs font-semibold">Deactivated</span>}</td>
                <td className="p-3">
                  {u.role !== 'ADMIN' && (
                    <button onClick={() => toggleActive(u)} className={`text-xs font-semibold hover:underline ${u.active ? 'text-red-600' : 'text-green-600'}`}>
                      {u.active ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
