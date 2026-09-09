import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'

const PAYMENT_STYLES = {
  UNPAID: 'bg-red-100 text-red-700',
  PARTIALLY_PAID: 'bg-amber-100 text-amber-700',
  PAID: 'bg-green-100 text-green-700',
  REFUNDED: 'bg-slate-200 text-slate-600',
}

const BOOKING_STATUS_STYLES = {
  CONFIRMED: 'bg-green-100 text-green-700',
  MODIFIED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
}

export default function OwnerOverview() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/owner/stats').then((res) => setStats(res.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  if (!stats) return null

  const cards = [
    { label: 'Properties', value: stats.totalProperties, icon: '🏨', sub: `${stats.approvedProperties} live · ${stats.pendingProperties} pending` },
    { label: 'Active bookings', value: stats.totalBookings, icon: '📅' },
    { label: 'Check-ins next 7 days', value: stats.upcomingCheckIns, icon: '🧳' },
    { label: 'Revenue collected', value: `Rs ${Math.round(stats.totalRevenueCollected).toLocaleString()}`, icon: '💰' },
    { label: 'Outstanding balance', value: `Rs ${Math.round(stats.totalOutstanding).toLocaleString()}`, icon: '⏳' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl">Owner dashboard</h1>
          <p className="text-slate-500 text-sm">Your properties, bookings and payments at a glance</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/owner/properties" className="btn-outline">Manage properties</Link>
          <Link to="/owner/bookings" className="btn-outline">All bookings</Link>
          <Link to="/owner/payments" className="btn-outline">Payments</Link>
          <Link to="/owner/hotels/new" className="btn-accent">+ Add property</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <p className="text-2xl mb-1">{c.icon}</p>
            <p className="text-xl font-bold">{c.value}</p>
            <p className="text-xs text-slate-500">{c.label}</p>
            {c.sub && <p className="text-[11px] text-slate-400 mt-0.5">{c.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display font-bold text-lg mb-3">Check-ins in the next 7 days</h2>
          {stats.upcomingCheckInsList.length === 0 ? (
            <p className="text-slate-500 card p-6 text-center text-sm">No check-ins expected this week.</p>
          ) : (
            <div className="space-y-2">
              {stats.upcomingCheckInsList.map((b) => (
                <div key={b.id} className="card p-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{b.guestFullName}</p>
                    <p className="text-xs text-slate-500">{b.hotelName} · {b.roomType}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{b.checkIn}</p>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${PAYMENT_STYLES[b.paymentStatus]}`}>
                      {b.paymentStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-display font-bold text-lg mb-3">Recent bookings</h2>
          {stats.recentBookings.length === 0 ? (
            <p className="text-slate-500 card p-6 text-center text-sm">No bookings yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.recentBookings.map((b) => (
                <Link
                  key={b.id}
                  to={`/owner/bookings/${b.id}/payments`}
                  className="card p-3 flex items-center justify-between text-sm hover:shadow-cardHover transition-shadow"
                >
                  <div>
                    <p className="font-medium">{b.hotelName}</p>
                    <p className="text-xs text-slate-500">{b.guestFullName} · {b.checkIn} → {b.checkOut}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">Rs {b.totalPrice.toLocaleString()}</p>
                    <div className="flex gap-1 justify-end mt-0.5">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${BOOKING_STATUS_STYLES[b.status]}`}>{b.status}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${PAYMENT_STYLES[b.paymentStatus]}`}>{b.paymentStatus.replace('_', ' ')}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
