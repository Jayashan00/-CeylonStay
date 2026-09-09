import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'

const STATUS_STYLES = {
  CONFIRMED: 'bg-green-100 text-green-700',
  MODIFIED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
}

const PAYMENT_STYLES = {
  UNPAID: 'bg-red-100 text-red-700',
  PARTIALLY_PAID: 'bg-amber-100 text-amber-700',
  PAID: 'bg-green-100 text-green-700',
  REFUNDED: 'bg-slate-200 text-slate-600',
}

export default function OwnerBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelTarget, setCancelTarget] = useState(null)

  function load() {
    setLoading(true)
    api.get('/owner/bookings').then((res) => setBookings(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function confirmCancel() {
    await api.put(`/owner/bookings/${cancelTarget}/cancel`)
    setCancelTarget(null)
    load()
  }

  if (loading) return <Loader />

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link to="/owner" className="text-primary text-sm hover:underline">← Back to dashboard</Link>
      <h1 className="font-display font-bold text-2xl mt-2 mb-6">Bookings across your properties</h1>

      {bookings.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">No bookings yet.</div>
      ) : (
        <div className="overflow-x-auto card">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Hotel</th>
                <th className="p-3">Guest</th>
                <th className="p-3">Dates</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Payment</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((b) => (
                <tr key={b.id} className="border-t border-slate-100">
                  <td className="p-3 font-medium">{b.bookingReference}</td>
                  <td className="p-3">{b.hotelName}<br /><span className="text-xs text-slate-400">{b.roomType}</span></td>
                  <td className="p-3">{b.guestFullName}<br /><span className="text-xs text-slate-400">{b.guestEmail}</span></td>
                  <td className="p-3">{b.checkIn}<br />→ {b.checkOut}</td>
                  <td className="p-3 font-semibold text-primary">Rs {b.totalPrice.toLocaleString()}<br /><span className="text-xs text-slate-400 font-normal">Paid Rs {b.totalPaid.toLocaleString()}</span></td>
                  <td className="p-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[b.status]}`}>{b.status}</span></td>
                  <td className="p-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PAYMENT_STYLES[b.paymentStatus]}`}>{b.paymentStatus.replace('_', ' ')}</span></td>
                  <td className="p-3 space-y-1">
                    <Link to={`/owner/bookings/${b.id}/payments`} className="text-primary text-xs font-semibold hover:underline block">Manage payment</Link>
                    {b.status !== 'CANCELLED' && (
                      <button onClick={() => setCancelTarget(b.id)} className="text-red-600 text-xs font-semibold hover:underline block">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel this booking?"
        message="The guest will be notified that their reservation has been cancelled by the property."
        confirmLabel="Cancel booking"
        danger
        onConfirm={confirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  )
}
