import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'

const STATUS_STYLES = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  SUSPENDED: 'bg-slate-200 text-slate-600',
}

export default function AdminHotels() {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [deleteTarget, setDeleteTarget] = useState(null)

  function load() {
    setLoading(true)
    api.get('/admin/hotels').then((res) => setHotels(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function setStatus(id, status) {
    await api.put(`/admin/hotels/${id}/status`, { status })
    load()
  }

  async function confirmDelete() {
    await api.delete(`/admin/hotels/${deleteTarget}`)
    setDeleteTarget(null)
    load()
  }

  if (loading) return <Loader />

  const filtered = filter === 'ALL' ? hotels : hotels.filter((h) => h.status === filter)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link to="/admin" className="text-primary text-sm hover:underline">← Back to dashboard</Link>
      <div className="flex items-center justify-between mt-2 mb-6 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl">All properties ({hotels.length})</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field w-48 text-sm">
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      <div className="grid gap-3">
        {filtered.map((h) => (
          <div key={h.id} className="card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex gap-3 items-center">
              <img src={h.images?.[0]} className="w-20 h-16 object-cover rounded-lg" alt="" />
              <div>
                <p className="font-semibold">{h.name}</p>
                <p className="text-sm text-slate-500">{h.city}, {h.district} · Rs {h.lowestPrice?.toLocaleString() || 0}/night</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[h.status]}`}>{h.status}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {h.status !== 'APPROVED' && <button onClick={() => setStatus(h.id, 'APPROVED')} className="btn-primary text-sm py-1.5 px-3">Approve</button>}
              {h.status !== 'SUSPENDED' && h.status === 'APPROVED' && <button onClick={() => setStatus(h.id, 'SUSPENDED')} className="btn-outline text-sm py-1.5 px-3">Suspend</button>}
              {h.status !== 'REJECTED' && <button onClick={() => setStatus(h.id, 'REJECTED')} className="text-sm py-1.5 px-3 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 font-semibold">Reject</button>}
              <button onClick={() => setDeleteTarget(h.id)} className="text-sm py-1.5 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold">Delete</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-slate-500 card p-6 text-center">No properties in this category.</p>}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Permanently delete this property?"
        message="This removes the property and all its rooms from the platform."
        confirmLabel="Delete permanently"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
