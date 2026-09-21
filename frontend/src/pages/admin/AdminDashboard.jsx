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
    { label: 'Total properties', value: stats.totalHotels, icon: '🏨', tint: 'bg-blue-50 text-blue-600' },
    { label: 'Approved & live', value: stats.approvedHotels, icon: '✅', tint: 'bg-green-50 text-green-600' },
    { label: 'Pending review', value: stats.pendingHotels, icon: '⏳', tint: 'bg-amber-50 text-amber-600' },
    { label: 'Registered users', value: stats.totalUsers, icon: '👤', tint: 'bg-indigo-50 text-indigo-600' },
    { label: 'Total bookings', value: stats.totalBookings, icon: '📅', tint: 'bg-purple-50 text-purple-600' },
    { label: 'Total revenue (Rs)', value: Math.round(stats.totalRevenue).toLocaleString(), icon: '💰', tint: 'bg-emerald-50 text-emerald-600' },
  ]

  const quickLinks = [
    { to: '/admin/hotels', label: 'Manage all properties', icon: '🏨' },
    { to: '/admin/users', label: 'Manage users', icon: '👥' },
    { to: '/admin/bookings', label: 'View all bookings', icon: '📋' },
    { to: '/admin/region-admins', label: 'Region admins', icon: '🗺️' },
    { to: '/admin/email-templates', label: 'Email templates', icon: '✉️' },
    { to: '/admin/reviews', label: 'Reviews', icon: '⭐' },
    { to: '/admin/settings', label: 'Site settings', icon: '⚙️' },
    { to: '/admin/facilities', label: 'Hotel & room facilities', icon: '🛏️' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-6 sm:p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -right-2 top-16 w-20 h-20 rounded-full bg-white/10" />
        <div className="relative">
          <h1 className="font-display font-bold text-2xl sm:text-3xl">Admin dashboard</h1>
          <p className="text-white/80 text-sm mt-1">Platform-wide overview and moderation</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-2 ${c.tint}`}>{c.icon}</div>
            <p className="text-xl font-bold">{c.value}</p>
            <p className="text-xs text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-10">
        {quickLinks.map((l) => (
          <Link key={l.to} to={l.to} className="card p-3 flex items-center gap-2 text-sm font-medium hover:text-primary">
            <span>{l.icon}</span> {l.label}
          </Link>
        ))}
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