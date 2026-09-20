import React, { useEffect, useState } from 'react'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'
import DateRangeField from '../../components/DateRangeField.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { toLocalDateString, parseLocalDate } from '../../utils/dateUtils.js'

const STATUS_STYLES = {
  CONFIRMED: 'bg-green-100 text-green-700',
  MODIFIED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
}

function StarPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          key={n} type="button" onClick={() => onChange(n)}
          className={`w-6 h-6 rounded text-[11px] font-bold flex items-center justify-center transition ${
            n <= value ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

export default function GuestBookings() {
  const [bookings, setBookings] = useState([])
  const [myReviews, setMyReviews] = useState([])
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

  // Review composer state, keyed by booking id
  const [reviewingBookingId, setReviewingBookingId] = useState(null)
  const [reviewRating, setReviewRating] = useState(9)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSaving, setReviewSaving] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [deleteReviewTarget, setDeleteReviewTarget] = useState(null)

  function load() {
    setLoading(true)
    Promise.all([
      api.get('/bookings/my'),
      api.get('/reviews/mine'),
    ]).then(([b, r]) => {
      setBookings(b.data)
      setMyReviews(r.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function reviewForBooking(bookingId) {
    return myReviews.find((r) => r.bookingId === bookingId)
  }

  function openEdit(b) {
    setEditing(b)
    setEditCheckIn(parseLocalDate(b.checkIn))
    setEditCheckOut(parseLocalDate(b.checkOut))
    setEditAdults(b.adults)
    setEditChildren(b.children)
    setError('')
    setEditAvailability(null)
  }

  useEffect(() => {
    if (!editing || !editCheckIn || !editCheckOut) return
    let cancelled = false
    setCheckingAvailability(true)
    api.get(`/rooms/${editing.roomId}/availability`, {
      params: {
        checkIn: toLocalDateString(editCheckIn),
        checkOut: toLocalDateString(editCheckOut),
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
        checkIn: toLocalDateString(editCheckIn),
        checkOut: toLocalDateString(editCheckOut),
        adults: editAdults,
        children: editChildren,
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

  function openReview(booking, existing) {
    setReviewingBookingId(booking.id)
    setReviewRating(existing?.rating || 9)
    setReviewComment(existing?.comment || '')
    setReviewError('')
  }

  async function saveReview(booking) {
    setReviewSaving(true)
    setReviewError('')
    const existing = reviewForBooking(booking.id)
    try {
      if (existing) {
        await api.put(`/reviews/${existing.id}`, { rating: reviewRating, comment: reviewComment })
      } else {
        await api.post('/reviews', { hotelId: booking.hotelId, bookingId: booking.id, rating: reviewRating, comment: reviewComment })
      }
      setReviewingBookingId(null)
      load()
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Could not save your review.')
    } finally {
      setReviewSaving(false)
    }
  }

  async function confirmDeleteReview() {
    await api.delete(`/reviews/${deleteReviewTarget}`)
    setDeleteReviewTarget(null)
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
          {bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((b) => {
            const existingReview = reviewForBooking(b.id)
            const isReviewing = reviewingBookingId === b.id
            return (
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
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                    <button onClick={() => openEdit(b)} className="btn-outline text-sm py-2">Modify dates</button>
                    <button onClick={() => setCancelTarget(b.id)} className="text-sm py-2 px-4 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold">
                      Cancel booking
                    </button>
                    {!isReviewing && (
                      <button onClick={() => openReview(b, existingReview)} className="text-sm py-2 px-4 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 font-semibold ml-auto">
                        {existingReview ? '★ Edit your review' : '★ Leave a review'}
                      </button>
                    )}
                  </div>
                )}

                {existingReview && !isReviewing && (
                  <div className="mt-3 bg-slate-50 rounded-lg p-3 text-sm flex items-start justify-between gap-3">
                    <div>
                      <span className="bg-primary text-white text-xs font-bold rounded px-2 py-1 mr-2">{existingReview.rating}/10</span>
                      <span className="text-slate-600">{existingReview.comment}</span>
                    </div>
                    <button onClick={() => setDeleteReviewTarget(existingReview.id)} className="text-xs text-red-600 hover:underline flex-shrink-0">Delete</button>
                  </div>
                )}

                {isReviewing && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                    <label className="text-xs text-slate-400 block">Your rating (1-10)</label>
                    <StarPicker value={reviewRating} onChange={setReviewRating} />
                    <textarea
                      value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="How was your stay?" rows={3} className="input-field text-sm"
                    />
                    {reviewError && <p className="text-red-600 text-sm">{reviewError}</p>}
                    <div className="flex gap-2">
                      <button onClick={() => saveReview(b)} disabled={reviewSaving} className="btn-primary text-sm px-4 py-2">
                        {reviewSaving ? 'Saving...' : 'Submit review'}
                      </button>
                      <button onClick={() => setReviewingBookingId(null)} className="btn-outline text-sm px-4 py-2">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-[1000] overflow-y-auto p-4">
          <div className="bg-white rounded-xl shadow-cardHover max-w-md w-full p-6 my-8 mx-auto">
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
            {checkingAvailability && <p className="text-xs text-slate-400 mt-2">Checking availability...</p>}
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

      <ConfirmDialog
        open={!!deleteReviewTarget}
        title="Delete your review?"
        message="This can't be undone."
        confirmLabel="Delete review"
        danger
        onConfirm={confirmDeleteReview}
        onCancel={() => setDeleteReviewTarget(null)}
      />
    </div>
  )
}