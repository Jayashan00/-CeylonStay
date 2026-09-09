import React, { useEffect, useState } from 'react'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'
import DateRangeField from '../../components/DateRangeField.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'

const STATUS_STYLES = {
  CONFIRMED: 'bg-green-100 text-green-700',
  MODIFIED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
}

export default function GuestBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [editCheckIn, setEditCheckIn] = useState(null)
  const [editCheckOut, setEditCheckOut] = useState(null)
  const [editAdults, setEditAdults] = useState(2)
  const [editChildren, setEditChildren] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [cancelTarget, setCancelTarget] = useState(null)
  const [editAvailability, setEditAvailability] = useState(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  function load() {
    setLoading(true)
    api.get('/bookings/my').then((res) => setBookings(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function openEdit(b) {
    setEditing(b)
    setEditCheckIn(new Date(b.checkIn))
    setEditCheckOut(new Date(b.checkOut))
    setEditAdults(b.adults)
    setEditChildren(b.children)
    setError('')
    setEditAvailability(null)
  }

  // Live-check availability as the guest picks new dates in the modify
  // dialog, excluding this booking's own current hold so it doesn't
  // falsely collide with itself.
  useEffect(() => {
    if (!editing || !editCheckIn || !editCheckOut) return
    let cancelled = false
    setCheckingAvailability(true)
    api.get(`/rooms/${editing.roomId}/availability`, {
      params: {
        checkIn: editCheckIn.toISOString().slice(0, 10),
        checkOut: editCheckOut.toISOString().slice(0, 10),
        rooms: editing.numberOfRooms,
        excludeBookingId: editing.id,
      },
    }).then((res) => { if (!cancelled) setEditAvailability(res.data) })
      .catch(() => { if (!cancelled) setEditAvailability(null) })
      .finally(() => { if (!cancelled) setCheckingAvailability(false) })
    return () => { cancelled = true }
  }, [editing, editCheckIn, editCheckOut])

  async function saveEdit() {
    if (editAvailability && !editAvailability.available) {
      setError(editAvailability.message || 'These dates are not available.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await api.put(`/bookings/${editing.id}`, {
        checkIn: editCheckIn.toISOString().slice(0, 10),
        checkOut: editCheckOut.toISOString().slice(0, 10),
        adults: editAdults,
        children: editChildren,
        numberOfRooms: editing.numberOfRooms,
      })
      setEditing(null)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update booking.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmCancel() {
    await api.put(`/bookings/${cancelTarget}/cancel`)
    setCancelTarget(null)
    load()
  }

  if (loading) return <Loader />

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display font-bold text-2xl mb-6">My bookings</h1>

      {bookings.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">
          <p className="text-4xl mb-3">🧳</p>
          <p>You don't have any bookings yet. Time to plan a trip!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((b) => (
            <div key={b.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-lg">{b.hotelName}</p>
                  <p className="text-sm text-slate-500">{b.roomType} · Ref {b.bookingReference}</p>
                  <p className="text-sm text-slate-500 mt-1">{b.checkIn} → {b.checkOut} · {b.adults} adults, {b.children} children</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                  <p className="font-bold text-primary mt-1">Rs {b.totalPrice.toLocaleString()}</p>
                </div>
              </div>

              {b.status !== 'CANCELLED' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  <button onClick={() => openEdit(b)} className="btn-outline text-sm py-2">Modify dates</button>
                  <button onClick={() => setCancelTarget(b.id)} className="text-sm py-2 px-4 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold">
                    Cancel booking
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-cardHover max-w-md w-full p-6">
            <h3 className="font-display font-semibold text-lg mb-4">Modify booking</h3>
            <DateRangeField checkIn={editCheckIn} checkOut={editCheckOut} onChange={(s, e) => { setEditCheckIn(s); setEditCheckOut(e) }} />
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Adults</label>
                <input type="number" min={1} value={editAdults} onChange={(e) => setEditAdults(Number(e.target.value))} className="input-field text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Children</label>
                <input type="number" min={0} value={editChildren} onChange={(e) => setEditChildren(Number(e.target.value))} className="input-field text-sm" />
              </div>
            </div>
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
              <button disabled={saving} onClick={saveEdit} className="btn-primary">{saving ? 'Saving...' : 'Save changes'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel this booking?"
        message="This action can't be undone. Depending on the property's policy, cancellation charges may apply."
        confirmLabel="Yes, cancel booking"
        danger
        onConfirm={confirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  )
}
