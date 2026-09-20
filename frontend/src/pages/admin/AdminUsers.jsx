import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'

const ROLE_STYLES = {
  ADMIN: 'bg-purple-100 text-purple-700',
  REGION_ADMIN: 'bg-teal-100 text-teal-700',
  HOTEL_OWNER: 'bg-blue-100 text-blue-700',
  GUEST: 'bg-slate-100 text-slate-600',
}

const emptyForm = { fullName: '', email: '', phone: '', role: 'GUEST', password: '' }

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('ALL')

  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null) // null = adding new
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  function load() {
    setLoading(true)
    api.get('/admin/users').then((res) => setUsers(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function toggleActive(user) {
    await api.put(`/admin/users/${user.id}/active`, { active: !user.active })
    load()
  }

  function openAdd() {
    setEditingUser(null)
    setForm(emptyForm)
    setFormError('')
    setShowForm(true)
  }

  function openEdit(u) {
    setEditingUser(u)
    setForm({ fullName: u.fullName, email: u.email, phone: u.phone || '', role: u.role, password: '' })
    setFormError('')
    setShowForm(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setFormError('')
    if (!form.fullName.trim() || !form.email.trim()) {
      setFormError('Full name and email are required.')
      return
    }
    if (!editingUser && form.password.length < 6) {
      setFormError('Password must be at least 6 characters for a new account.')
      return
    }
    setSaving(true)
    try {
      if (editingUser) {
        const payload = { fullName: form.fullName, email: form.email, phone: form.phone, role: form.role }
        if (form.password) payload.password = form.password
        await api.put(`/admin/users/${editingUser.id}`, payload)
      } else {
        await api.post('/admin/users', form)
      }
      setShowForm(false)
      load()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not save this user.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    setDeleteError('')
    try {
      await api.delete(`/admin/users/${deleteTarget}`)
      setDeleteTarget(null)
      load()
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Could not delete this user.')
    }
  }

  if (loading) return <Loader />

  const filtered = roleFilter === 'ALL' ? users : users.filter((u) => u.role === roleFilter)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link to="/admin" className="text-primary text-sm hover:underline">← Back to dashboard</Link>
      <div className="flex items-center justify-between mt-2 mb-6 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl">All users ({users.length})</h1>
        <div className="flex gap-2 flex-wrap">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field w-48 text-sm">
            <option value="ALL">All roles</option>
            <option value="GUEST">Guests</option>
            <option value="HOTEL_OWNER">Hotel owners</option>
            <option value="REGION_ADMIN">Region admins</option>
            <option value="ADMIN">Admins</option>
          </select>
          <button onClick={openAdd} className="btn-accent text-sm whitespace-nowrap">+ Add user</button>
        </div>
      </div>

      {deleteError && <p className="text-red-600 text-sm mb-4">{deleteError}</p>}

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
                  <div className="flex gap-3 justify-end flex-wrap">
                    <button onClick={() => openEdit(u)} className="text-xs font-semibold text-primary hover:underline">Edit</button>
                    {u.role !== 'ADMIN' && (
                      <button onClick={() => toggleActive(u)} className={`text-xs font-semibold hover:underline ${u.active ? 'text-red-600' : 'text-green-600'}`}>
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                    {u.role !== 'ADMIN' && (
                      <button onClick={() => { setDeleteTarget(u.id); setDeleteError('') }} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-[1000] overflow-y-auto p-4">
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-cardHover max-w-md w-full p-6 my-8 mx-auto space-y-3">
            <h3 className="font-display font-semibold text-lg mb-1">{editingUser ? 'Edit user' : 'Add user'}</h3>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Full name</label>
              <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Email</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Phone (optional)</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field text-sm">
                <option value="GUEST">Guest</option>
                <option value="HOTEL_OWNER">Hotel owner</option>
                <option value="REGION_ADMIN">Region admin</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                {editingUser ? 'New password (leave blank to keep current)' : 'Password'}
              </label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field text-sm" />
            </div>

            {formError && <p className="text-red-600 text-sm">{formError}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm">Cancel</button>
              <button disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : editingUser ? 'Save changes' : 'Create user'}</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this user?"
        message="This can't be undone. If they own any hotels or bookings, deletion will be blocked — deactivate the account instead in that case."
        confirmLabel="Delete user"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}