import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [rejectTarget, setRejectTarget] = useState(null)

  function load() {
    setLoading(true)
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/hotels/pending'),
    ]).then(([s, p]) => { setStats(s.data); setPending(p.data) }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function approve(id) {
    await api.put(`/admin/hotels/${id}/status`, { status: 'APPROVED' })
    load()
  }

  async function reject() {
    await api.put(`/admin/hotels/${rejectTarget}/status`, { status: 'REJECTED' })
    setRejectTarget(null)
    load()
  }

  if (loading) return <Loader />

  const cards = [
    { label: 'Total properties', value: stats.totalHotels, icon: '🏨' },
    { label: 'Approved & live', value: stats.approvedHotels, icon: '✅' },
    { label: 'Pending review', value: stats.pendingHotels, icon: '⏳' },
    { label: 'Registered users', value: stats.totalUsers, icon: '👤' },
    { label: 'Total bookings', value: stats.totalBookings, icon: '📅' },
    { label: 'Total revenue (Rs)', value: Math.round(stats.totalRevenue).toLocaleString(), icon: '💰' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display font-bold text-2xl mb-1">Admin dashboard</h1>
      <p className="text-slate-500 text-sm mb-6">Platform-wide overview and moderation</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <p className="text-2xl mb-1">{c.icon}</p>
            <p className="text-xl font-bold">{c.value}</p>
            <p className="text-xs text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <Link to="/admin/hotels" className="btn-outline">Manage all properties</Link>
        <Link to="/admin/users" className="btn-outline">Manage users</Link>
        <Link to="/admin/bookings" className="btn-outline">View all bookings</Link>
        <Link to="/admin/settings" className="btn-outline">Site settings</Link>
      </div>

      <h2 className="font-display font-bold text-xl mb-4">Pending approvals</h2>
      {pending.length === 0 ? (
        <p className="text-slate-500 card p-6 text-center">No properties waiting for review. 🎉</p>
      ) : (
        <div className="grid gap-3">
          {pending.map((h) => (
            <div key={h.id} className="card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex gap-3 items-center">
                <img src={h.images?.[0]} className="w-20 h-16 object-cover rounded-lg" alt="" />
                <div>
                  <p className="font-semibold">{h.name}</p>
                  <p className="text-sm text-slate-500">{h.city}, {h.district} · {h.propertyType}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => approve(h.id)} className="btn-primary text-sm py-2">Approve</button>
                <button onClick={() => setRejectTarget(h.id)} className="text-sm py-2 px-4 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!rejectTarget}
        title="Reject this property?"
        message="The owner will see this listing marked as rejected and it won't be shown to guests."
        confirmLabel="Reject listing"
        danger
        onConfirm={reject}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  )
}