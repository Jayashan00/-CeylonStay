import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import BookingStepper from '../../components/BookingStepper.jsx'

function loadDraft(locationState, roomId) {
  if (locationState?.roomId) return locationState
  try {
    const stored = JSON.parse(sessionStorage.getItem('ceylonstay_booking_draft') || 'null')
    if (stored && String(stored.roomId) === String(roomId)) return stored
  } catch { /* ignore malformed storage */ }
  return null
}

function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0
  return Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
}

export default function BookingDetails() {
  const { roomId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [draft, setDraft] = useState(() => loadDraft(location.state, roomId))
  const [guestFullName, setGuestFullName] = useState(user?.fullName || '')
  const [guestEmail, setGuestEmail] = useState(user?.email || '')
  const [guestPhone, setGuestPhone] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!draft) return
    // Restore previously entered guest details if the guest came back to edit.
    if (draft.guestFullName) setGuestFullName(draft.guestFullName)
    if (draft.guestEmail) setGuestEmail(draft.guestEmail)
    if (draft.guestPhone) setGuestPhone(draft.guestPhone)
    if (draft.specialRequests) setSpecialRequests(draft.specialRequests)
  }, [draft])

  if (!draft) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 mb-4">We couldn't find your search details — this can happen if you refreshed or arrived here directly.</p>
        <Link to="/hotels" className="btn-primary">Start a new search</Link>
      </div>
    )
  }

  const nights = nightsBetween(draft.checkIn, draft.checkOut)
  const subtotal = draft.pricePerNight * nights * draft.numberOfRooms

  function handleContinue(e) {
    e.preventDefault()
    setError('')
    if (!guestFullName.trim() || !guestEmail.trim()) {
      setError('Please enter the guest name and a valid email — this is who the confirmation goes to.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(guestEmail.trim())) {
      setError('That email address doesn\'t look right — please double check it.')
      return
    }
    const updated = { ...draft, guestFullName: guestFullName.trim(), guestEmail: guestEmail.trim(), guestPhone: guestPhone.trim(), specialRequests: specialRequests.trim() }
    sessionStorage.setItem('ceylonstay_booking_draft', JSON.stringify(updated))
    navigate(`/book/${roomId}/review`, { state: updated })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link to={`/hotels/${draft.hotelId}`} className="text-primary text-sm hover:underline">← Back to {draft.hotelName}</Link>
      <h1 className="font-display font-bold text-2xl mt-2 mb-4">Your details</h1>

      <BookingStepper current={2} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleContinue} className="lg:col-span-2 card p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Full name</label>
            <input
              value={guestFullName} onChange={(e) => setGuestFullName(e.target.value)}
              placeholder="As it appears on your ID" className="input-field" required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Email address</label>
            <input
              type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="you@example.com" className="input-field" required
            />
            <p className="text-xs text-slate-400 mt-1">Your confirmation, receipt, and booking management link will be sent here.</p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Phone number <span className="text-slate-400 font-normal">(optional)</span></label>
            <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="+94 7X XXX XXXX" className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Special requests <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea
              value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="E.g. late check-in, ground floor room, extra pillows..." className="input-field" rows={3}
            />
            <p className="text-xs text-slate-400 mt-1">The hotel will try their best, but requests aren't guaranteed.</p>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button className="btn-primary w-full py-3 text-base">Continue to review →</button>
        </form>

        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-20">
            <h3 className="font-semibold mb-3">Your stay</h3>
            {draft.hotelImage && <img src={draft.hotelImage} className="w-full h-32 object-cover rounded-lg mb-3" alt="" />}
            <p className="font-medium">{draft.hotelName}</p>
            <p className="text-sm text-slate-500 mb-3">{draft.roomType}</p>
            <div className="text-sm space-y-1.5 border-t border-slate-100 pt-3">
              <div className="flex justify-between"><span className="text-slate-400">Check-in</span><span className="font-medium">{draft.checkIn}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Check-out</span><span className="font-medium">{draft.checkOut}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Guests</span><span className="font-medium">{draft.adults} adults, {draft.children} children</span></div>
              <div className="flex justify-between border-t border-slate-100 pt-2 mt-2"><span className="text-slate-500 font-medium">Total ({nights} night{nights !== 1 ? 's' : ''})</span><span className="font-bold text-primary">Rs {subtotal.toLocaleString()}</span></div>
            </div>
            <p className="text-xs text-slate-400 mt-3">No payment is taken online — you'll settle the bill directly with the hotel.</p>
          </div>
        </div>
      </div>
    </div>
  )
}