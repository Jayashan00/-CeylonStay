import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'
import DateRangeField from '../../components/DateRangeField.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { toLocalDateString, parseLocalDate } from '../../utils/dateUtils.js'

export default function ManageBooking() {
  const { token } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [editing, setEditing] = useState(false)
  const [checkIn, setCheckIn] = useState(null)
  const [checkOut, setCheckOut] = useState(null)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  function load() {
    setLoading(true)
    api.get(`/bookings/manage/${token}`)
      .then((res) => {
        setBooking(res.data)
        setCheckIn(parseLocalDate(res.data.checkIn))
        setCheckOut(parseLocalDate(res.data.checkOut))
        setAdults(res.data.adults)
        setChildren(res.data.children)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [token])

  function startEditing() {
    setError('')
    setEditing(true)
  }

  async function handleSaveChanges() {
    setError('')
    if (!checkIn || !checkOut) { setError('Please pick both a check-in and check-out date.'); return }
    setSaving(true)
    try {
      await api.put(`/bookings/manage/${token}`, {
        checkIn: toLocalDateString(checkIn),
        checkOut: toLocalDateString(checkOut),
        adults, children,
      })
      setEditing(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update this booking. Please try different dates.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmCancel() {
    setCancelling(true)
    try {
      await api.put(`/bookings/manage/${token}/cancel`)
      setShowCancelConfirm(false)
      load()
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <Loader />

  if (notFound) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-3">🔍</p>
        <h1 className="font-display font-bold text-xl mb-2">Booking not found</h1>
        <p className="text-slate-500 text-sm">This link may be incorrect, or the booking may have been removed. Please check the link in your confirmation email, or contact the hotel directly.</p>
      </div>
    )
  }

  const isCancelled = booking.status === 'CANCELLED'

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display font-bold text-2xl mb-1">Manage your booking</h1>
      <p className="text-slate-500 text-sm mb-6">Reference: <span className="font-semibold text-primary">{booking.bookingReference}</span></p>

      {isCancelled && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
          This booking has been cancelled. If this wasn't you, please contact the hotel directly.
        </div>
      )}

      <div className="card p-6 space-y-5">
        <section>
          <h2 className="font-semibold mb-3">Stay details</h2>
          <div className="text-sm space-y-1.5">
            <p><span className="text-slate-400">Hotel:</span> <span className="font-medium">{booking.hotelName}</span></p>
            <p><span className="text-slate-400">Room type:</span> <span className="font-medium">{booking.roomType}</span></p>
            <p><span className="text-slate-400">Guest:</span> <span className="font-medium">{booking.guestFullName}</span></p>
            <p><span className="text-slate-400">Status:</span> <span className={`font-medium ${isCancelled ? 'text-red-600' : 'text-green-600'}`}>{booking.status}</span></p>
          </div>
        </section>

        {!editing ? (
          <section className="border-t border-slate-100 pt-5">
            <div className="text-sm space-y-1.5 mb-4">
              <p><span className="text-slate-400">Check-in:</span> <span className="font-medium">{booking.checkIn}</span></p>
              <p><span className="text-slate-400">Check-out:</span> <span className="font-medium">{booking.checkOut}</span></p>
              <p><span className="text-slate-400">Guests:</span> <span className="font-medium">{booking.adults} adults, {booking.children} children</span></p>
              <p><span className="text-slate-400">Total price:</span> <span className="font-bold text-primary">Rs {booking.totalPrice.toLocaleString()}</span></p>
            </div>
            {!isCancelled && (
              <div className="flex flex-wrap gap-3">
                <button onClick={startEditing} className="btn-outline text-sm">Change dates or guests</button>
                <button onClick={() => setShowCancelConfirm(true)} className="text-sm text-red-600 hover:underline">Cancel this booking</button>
              </div>
            )}
          </section>
        ) : (
          <section className="border-t border-slate-100 pt-5">
            <h3 className="font-semibold text-sm mb-3">Update your stay</h3>
            <DateRangeField checkIn={checkIn} checkOut={checkOut} onChange={(s, e) => { setCheckIn(s); setCheckOut(e) }} />
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Adults</label>
                <input type="number" min={1} value={adults} onChange={(e) => setAdults(Number(e.target.value))} className="input-field text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Children</label>
                <input type="number" min={0} value={children} onChange={(e) => setChildren(Number(e.target.value))} className="input-field text-sm" />
              </div>
            </div>
            {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
            <div className="flex gap-3 mt-4">
              <button onClick={handleSaveChanges} disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : 'Save changes'}</button>
              <button onClick={() => { setEditing(false); setError('') }} className="btn-outline text-sm">Cancel editing</button>
            </div>
            <p className="text-xs text-slate-400 mt-3">Your total price will be recalculated based on the new dates.</p>
          </section>
        )}
      </div>

      <ConfirmDialog
        open={showCancelConfirm}
        title="Cancel this booking?"
        message="This can't be undone. The room will become available for others to book again."
        confirmLabel={cancelling ? 'Cancelling...' : 'Yes, cancel booking'}
        danger
        onConfirm={confirmCancel}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </div>
  )
}