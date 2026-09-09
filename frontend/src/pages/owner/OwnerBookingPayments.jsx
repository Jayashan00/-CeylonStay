import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'

const PAYMENT_STYLES = {
  UNPAID: 'bg-red-100 text-red-700',
  PARTIALLY_PAID: 'bg-amber-100 text-amber-700',
  PAID: 'bg-green-100 text-green-700',
  REFUNDED: 'bg-slate-200 text-slate-600',
}

const TYPE_LABELS = { ADVANCE: 'Advance payment', BALANCE: 'Balance payment', FULL: 'Full payment', REFUND: 'Refund' }
const METHOD_LABELS = { CASH: 'Cash', BANK_TRANSFER: 'Bank transfer', CARD: 'Card', ONLINE: 'Online', OTHER: 'Other' }

const emptyForm = { amount: '', type: 'ADVANCE', method: 'BANK_TRANSFER', reference: '', notes: '' }

export default function OwnerBookingPayments() {
  const { id } = useParams()
  const [booking, setBooking] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  function load() {
    setLoading(true)
    Promise.all([
      api.get(`/bookings/${id}`),
      api.get(`/owner/bookings/${id}/payments`),
    ]).then(([b, p]) => { setBooking(b.data); setPayments(p.data) }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post(`/owner/bookings/${id}/payments`, {
        amount: Number(form.amount),
        type: form.type,
        method: form.method,
        reference: form.reference,
        notes: form.notes,
      })
      setForm(emptyForm)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not record payment.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    await api.delete(`/owner/payments/${deleteTarget}`)
    setDeleteTarget(null)
    load()
  }

  if (loading) return <Loader />
  if (!booking) return <p className="text-center py-20">Booking not found.</p>

  const balance = Math.max(0, booking.totalPrice - booking.totalPaid)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/owner/bookings" className="text-primary text-sm hover:underline">← Back to all bookings</Link>

      <div className="card p-6 mt-2 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h1 className="font-display font-bold text-xl">{booking.hotelName}</h1>
            <p className="text-sm text-slate-500">{booking.roomType} · Ref {booking.bookingReference}</p>
            <p className="text-sm text-slate-500 mt-1">{booking.guestFullName} · {booking.guestEmail}</p>
            <p className="text-sm text-slate-500">{booking.checkIn} → {booking.checkOut}</p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PAYMENT_STYLES[booking.paymentStatus]}`}>
            {booking.paymentStatus.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100 text-center">
          <div>
            <p className="text-xs text-slate-400">Total price</p>
            <p className="font-bold text-lg">Rs {booking.totalPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Paid so far</p>
            <p className="font-bold text-lg text-green-600">Rs {booking.totalPaid.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Balance due</p>
            <p className="font-bold text-lg text-red-600">Rs {balance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <h2 className="font-display font-bold text-lg mb-3">Record a payment</h2>
      <form onSubmit={handleSubmit} className="card p-5 mb-8 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Amount (Rs)</label>
            <input required type="number" min={1} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Payment type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
              <option value="ADVANCE">Advance payment</option>
              <option value="BALANCE">Balance payment</option>
              <option value="FULL">Full payment</option>
              <option value="REFUND">Refund</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Method</label>
            <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className="input-field">
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank transfer</option>
              <option value="CARD">Card</option>
              <option value="ONLINE">Online</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Reference (optional)</label>
            <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Bank slip no., transaction id..." className="input-field" />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Notes (optional)</label>
          <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex justify-end">
          <button disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Record payment'}</button>
        </div>
      </form>

      <h2 className="font-display font-bold text-lg mb-3">Payment history</h2>
      {payments.length === 0 ? (
        <p className="text-slate-500 card p-6 text-center text-sm">No payments recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((p) => (
            <div key={p.id} className="card p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">
                  {TYPE_LABELS[p.type]} · {METHOD_LABELS[p.method]}
                  {p.type === 'REFUND' && <span className="text-red-600"> (refund)</span>}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(p.createdAt).toLocaleString()} · recorded by {p.recordedByName}
                  {p.reference ? ` · Ref: ${p.reference}` : ''}
                </p>
                {p.notes && <p className="text-xs text-slate-500 mt-1">{p.notes}</p>}
              </div>
              <div className="flex items-center gap-3">
                <p className={`font-bold ${p.type === 'REFUND' ? 'text-red-600' : 'text-green-600'}`}>
                  {p.type === 'REFUND' ? '-' : '+'}Rs {p.amount.toLocaleString()}
                </p>
                <button onClick={() => setDeleteTarget(p.id)} className="text-xs text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this payment record?"
        message="This will remove the entry from the ledger and recalculate the booking's paid total."
        confirmLabel="Delete record"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
