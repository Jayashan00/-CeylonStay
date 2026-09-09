import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'

const TYPE_LABELS = { ADVANCE: 'Advance', BALANCE: 'Balance', FULL: 'Full payment', REFUND: 'Refund' }
const METHOD_LABELS = { CASH: 'Cash', BANK_TRANSFER: 'Bank transfer', CARD: 'Card', ONLINE: 'Online', OTHER: 'Other' }

export default function OwnerPayments() {
  const [payments, setPayments] = useState([])
  const [bookingsById, setBookingsById] = useState({})
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('ALL')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/owner/payments'),
      api.get('/owner/bookings'),
    ]).then(([p, b]) => {
      setPayments(p.data)
      const map = {}
      b.data.forEach((bk) => { map[bk.id] = bk })
      setBookingsById(map)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  const filtered = typeFilter === 'ALL' ? payments : payments.filter((p) => p.type === typeFilter)
  const totalCollected = filtered
    .filter((p) => p.type !== 'REFUND')
    .reduce((sum, p) => sum + p.amount, 0)
  const totalRefunded = filtered
    .filter((p) => p.type === 'REFUND')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link to="/owner" className="text-primary text-sm hover:underline">← Back to dashboard</Link>

      <div className="flex items-center justify-between mt-2 mb-6 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl">Payments</h1>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field w-48 text-sm">
          <option value="ALL">All types</option>
          <option value="ADVANCE">Advance payments</option>
          <option value="BALANCE">Balance payments</option>
          <option value="FULL">Full payments</option>
          <option value="REFUND">Refunds</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-xs text-slate-400">Total collected</p>
          <p className="text-xl font-bold text-green-600">Rs {totalCollected.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400">Total refunded</p>
          <p className="text-xl font-bold text-red-600">Rs {totalRefunded.toLocaleString()}</p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-slate-500 card p-6 text-center">No payments recorded yet.</p>
      ) : (
        <div className="overflow-x-auto card">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Booking</th>
                <th className="p-3">Type</th>
                <th className="p-3">Method</th>
                <th className="p-3">Amount</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((p) => {
                const booking = bookingsById[p.bookingId]
                return (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="p-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      {booking ? (
                        <>
                          <p className="font-medium">{booking.hotelName}</p>
                          <p className="text-xs text-slate-400">{booking.guestFullName} · {booking.bookingReference}</p>
                        </>
                      ) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="p-3">{TYPE_LABELS[p.type]}</td>
                    <td className="p-3">{METHOD_LABELS[p.method]}</td>
                    <td className={`p-3 font-semibold ${p.type === 'REFUND' ? 'text-red-600' : 'text-green-600'}`}>
                      {p.type === 'REFUND' ? '-' : '+'}Rs {p.amount.toLocaleString()}
                    </td>
                    <td className="p-3">
                      {booking && <Link to={`/owner/bookings/${booking.id}/payments`} className="text-primary text-xs hover:underline">View</Link>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
