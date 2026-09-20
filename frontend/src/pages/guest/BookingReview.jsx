import React, { useState } from 'react'
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom'
import api from '../../api/client.js'
import BookingStepper from '../../components/BookingStepper.jsx'

function loadDraft(locationState, roomId) {
  if (locationState?.guestEmail) return locationState
  try {
    const stored = JSON.parse(sessionStorage.getItem('ceylonstay_booking_draft') || 'null')
    if (stored && String(stored.roomId) === String(roomId) && stored.guestEmail) return stored
  } catch { /* ignore malformed storage */ }
  return null
}

function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0
  return Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
}

export default function BookingReview() {
  const { roomId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [draft] = useState(() => loadDraft(location.state, roomId))
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')

  if (!draft) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 mb-4">We couldn't find your booking details — this can happen if you refreshed or arrived here directly.</p>
        <Link to="/hotels" className="btn-primary">Start a new search</Link>
      </div>
    )
  }

  const nights = nightsBetween(draft.checkIn, draft.checkOut)
  const subtotal = draft.pricePerNight * nights * draft.numberOfRooms

  async function handleConfirm() {
    setError('')
    setConfirming(true)
    try {
      const { data } = await api.post('/bookings', {
        hotelId: draft.hotelId,
        roomId: draft.roomId,
        checkIn: draft.checkIn,
        checkOut: draft.checkOut,
        adults: draft.adults,
        children: draft.children,
        numberOfRooms: draft.numberOfRooms,
        guestFullName: draft.guestFullName,
        guestEmail: draft.guestEmail,
        guestPhone: draft.guestPhone,
        specialRequests: draft.specialRequests,
      })
      sessionStorage.removeItem('ceylonstay_booking_draft')
      navigate(`/booking-confirmation/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not complete your booking. Please try again, or go back and pick different dates.')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to={`/book/${roomId}`} state={draft} className="text-primary text-sm hover:underline">← Back to edit details</Link>
      <h1 className="font-display font-bold text-2xl mt-2 mb-4">Review your booking</h1>

      <BookingStepper current={3} />

      <div className="card p-6 space-y-6">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Your stay</h2>
            <Link to={`/hotels/${draft.hotelSlug || draft.hotelId}`} className="text-xs text-primary hover:underline">Change room or dates</Link>
          </div>
          <div className="flex gap-4">
            {draft.hotelImage && <img src={draft.hotelImage} className="w-28 h-28 object-cover rounded-lg flex-shrink-0" alt="" />}
            <div className="text-sm space-y-1">
              <p className="font-semibold text-base">{draft.hotelName}</p>
              <p className="text-slate-500">{draft.roomType} · Sleeps {draft.maxOccupancy}{draft.breakfastIncluded ? ' · Breakfast included' : ''}</p>
              <p><span className="text-slate-400">Check-in:</span> <span className="font-medium">{draft.checkIn}</span></p>
              <p><span className="text-slate-400">Check-out:</span> <span className="font-medium">{draft.checkOut}</span></p>
              <p><span className="text-slate-400">Guests:</span> <span className="font-medium">{draft.adults} adults, {draft.children} children</span></p>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-100 pt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Your details</h2>
            <Link to={`/book/${roomId}`} state={draft} className="text-xs text-primary hover:underline">Edit</Link>
          </div>
          <div className="text-sm space-y-1">
            <p><span className="text-slate-400">Name:</span> <span className="font-medium">{draft.guestFullName}</span></p>
            <p><span className="text-slate-400">Email:</span> <span className="font-medium">{draft.guestEmail}</span></p>
            {draft.guestPhone && <p><span className="text-slate-400">Phone:</span> <span className="font-medium">{draft.guestPhone}</span></p>}
            {draft.specialRequests && <p><span className="text-slate-400">Special requests:</span> <span className="font-medium">{draft.specialRequests}</span></p>}
          </div>
        </section>

        <section className="border-t border-slate-100 pt-5">
          <h2 className="font-semibold mb-3">Price breakdown</h2>
          <div className="text-sm space-y-1.5">
            <div className="flex justify-between"><span className="text-slate-500">Rs {draft.pricePerNight.toLocaleString()} × {nights} night{nights !== 1 ? 's' : ''}</span><span>Rs {subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between border-t border-slate-100 pt-2 mt-2 text-base"><span className="font-semibold">Total</span><span className="font-bold text-primary">Rs {subtotal.toLocaleString()}</span></div>
          </div>
          <p className="text-xs text-slate-400 mt-2">No payment is taken online — you'll pay the hotel directly according to their policy.</p>
        </section>

        {error && <p className="text-red-600 text-sm border-t border-slate-100 pt-4">{error}</p>}

        <button onClick={handleConfirm} disabled={confirming} className="btn-primary w-full py-3 text-base">
          {confirming ? 'Confirming your booking...' : 'Confirm & reserve'}
        </button>
        <p className="text-xs text-slate-400 text-center -mt-3">
          By confirming, a confirmation email with your receipt and a link to manage this booking will be sent to {draft.guestEmail}.
        </p>
      </div>
    </div>
  )
}