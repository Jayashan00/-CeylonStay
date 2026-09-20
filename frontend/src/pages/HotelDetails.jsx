import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client.js'
import StarRating from '../components/StarRating.jsx'
import ScoreBadge from '../components/ScoreBadge.jsx'
import SriLankaMap from '../components/SriLankaMap.jsx'
import DateRangeField from '../components/DateRangeField.jsx'
import Loader from '../components/Loader.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import BookingAuthGate from '../components/BookingAuthGate.jsx'
import { toLocalDateString, parseLocalDate } from '../utils/dateUtils.js'

export default function HotelDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [hotel, setHotel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)

  const [checkIn, setCheckIn] = useState(null)
  const [checkOut, setCheckOut] = useState(null)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [availabilityByRoom, setAvailabilityByRoom] = useState({})
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [blockedIntervals, setBlockedIntervals] = useState([])
  const [loadingBlockedDates, setLoadingBlockedDates] = useState(false)

  const [bookingError, setBookingError] = useState('')
  const [showAuthGate, setShowAuthGate] = useState(false)
  const [pendingRoom, setPendingRoom] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/hotels/${id}`),
      api.get(`/hotels/${id}/rooms`),
      api.get(`/reviews/hotel/${id}`),
    ]).then(([h, r, rv]) => {
      setHotel(h.data)
      setRooms(r.data)
      setReviews(rv.data)
      if (r.data.length > 0) setSelectedRoomId(r.data[0].id)
    }).finally(() => setLoading(false))
  }, [id])

  // Whenever the guest picks (or the page defaults to) a room type, fetch
  // that room's actual fully-booked date ranges so the calendar itself
  // greys them out — the guest can't even click a date that's unavailable,
  // rather than finding out only after selecting it.
  useEffect(() => {
    if (!selectedRoomId) return
    let cancelled = false
    setLoadingBlockedDates(true)
    api.get(`/rooms/${selectedRoomId}/blocked-dates`, { params: { daysAhead: 365 } })
      .then((res) => {
        if (cancelled) return
        const intervals = res.data.map((r) => ({ start: parseLocalDate(r.start), end: parseLocalDate(r.end) }))
        setBlockedIntervals(intervals)
      })
      .catch(() => { if (!cancelled) setBlockedIntervals([]) })
      .finally(() => { if (!cancelled) setLoadingBlockedDates(false) })
    return () => { cancelled = true }
  }, [selectedRoomId])

  function nights() {
    if (!checkIn || !checkOut) return 0
    return Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24))
  }

  // Real-time availability: whenever the guest picks a valid date range,
  // check every room type against the backend's actual booking ledger so
  // they know immediately which rooms are bookable — not just after they
  // click Reserve and get rejected.
  useEffect(() => {
    if (!checkIn || !checkOut || rooms.length === 0) {
      setAvailabilityByRoom({})
      return
    }
    let cancelled = false
    setCheckingAvailability(true)
    const ci = toLocalDateString(checkIn)
    const co = toLocalDateString(checkOut)

    Promise.all(
      rooms.map((room) =>
        api.get(`/rooms/${room.id}/availability`, { params: { checkIn: ci, checkOut: co, rooms: 1 } })
          .then((res) => [room.id, res.data])
          .catch(() => [room.id, null])
      )
    ).then((entries) => {
      if (cancelled) return
      const map = {}
      entries.forEach(([roomId, data]) => { map[roomId] = data })
      setAvailabilityByRoom(map)
    }).finally(() => {
      if (!cancelled) setCheckingAvailability(false)
    })

    return () => { cancelled = true }
  }, [checkIn, checkOut, rooms])

  // Step 1 of the booking flow: once dates + an available room are picked,
  // move on to Step 2 (guest details) rather than booking immediately —
  // this matches the familiar "search → details → review" flow guests
  // already know from sites like Booking.com.
  function handleReserveClick(room) {
    setBookingError('')
    if (!checkIn || !checkOut) {
      setBookingError('Please select your check-in and check-out dates.')
      return
    }
    const availability = availabilityByRoom[room.id]
    if (availability && !availability.available) {
      setBookingError(availability.message || 'This room is not available for the selected dates.')
      return
    }

    if (!user) {
      // Not logged in yet — show the inline sign-in/create-account gate
      // right here instead of navigating away. Once they sign in (email or
      // Google), proceedToBooking() runs automatically for this same room.
      setPendingRoom(room)
      setShowAuthGate(true)
      return
    }

    proceedToBooking(room)
  }

  function proceedToBooking(room) {
    const draft = {
      hotelId: id,
      hotelSlug: hotel.slug || id,
      hotelName: hotel.name,
      hotelImage: hotel.images?.[0] || '',
      roomId: room.id,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      breakfastIncluded: room.breakfastIncluded,
      maxOccupancy: room.maxOccupancy,
      checkIn: toLocalDateString(checkIn),
      checkOut: toLocalDateString(checkOut),
      adults,
      children,
      numberOfRooms: 1,
    }
    // Saved to sessionStorage too (not just router state) so refreshing the
    // next couple of pages doesn't lose everything the guest already picked.
    sessionStorage.setItem('ceylonstay_booking_draft', JSON.stringify(draft))
    navigate(`/book/${room.id}`, { state: draft })
  }

  if (loading) return <Loader />
  if (!hotel) return <p className="text-center py-20">Property not found.</p>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-4">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-primary-dark">{hotel.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StarRating stars={hotel.starRating} />
              <span className="text-sm text-slate-500">{hotel.propertyType} · {hotel.address}</span>
            </div>
          </div>
          <ScoreBadge score={hotel.averageRating} reviewCount={hotel.reviewCount} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden mb-8 h-80 sm:h-96">
        <div className="col-span-4 sm:col-span-2 row-span-2">
          <img src={hotel.images?.[activeImg] || hotel.images?.[0]} className="w-full h-full object-cover" alt={hotel.name} />
        </div>
        {hotel.images?.slice(0, 4).map((img, i) => (
          <button key={i} onClick={() => setActiveImg(i)} className="hidden sm:block h-full w-full overflow-hidden">
            <img src={img} className="w-full h-full object-cover hover:opacity-80 transition" alt="" />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="font-display font-bold text-xl mb-2">About this property</h2>
            <p className="text-slate-600 leading-relaxed">{hotel.description}</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl mb-3">Property facilities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(hotel.facilities || []).map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-green-600">✓</span> {f}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl mb-3">Location</h2>
            <SriLankaMap hotels={[hotel]} height="320px" />
          </section>

          <section>
            <h2 className="font-display font-bold text-xl mb-3">Guest reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="text-slate-500 text-sm">No reviews yet. Be the first to stay and share your experience.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rv) => (
                  <div key={rv.id} className="border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-primary text-white text-xs font-bold rounded px-2 py-1">{rv.rating}/10</span>
                      <span className="font-medium text-sm">{rv.guestName}</span>
                    </div>
                    <p className="text-sm text-slate-600">{rv.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-20">
            <h3 className="font-semibold mb-1">Book your stay</h3>
            {selectedRoomId && rooms.length > 0 && (
              <p className="text-xs text-slate-400 mb-3">
                Calendar showing availability for: <span className="font-medium text-slate-600">{rooms.find((r) => r.id === selectedRoomId)?.roomType}</span>
                {loadingBlockedDates && ' · updating...'}
              </p>
            )}
            <DateRangeField
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={(s, e) => { setCheckIn(s); setCheckOut(e) }}
              excludeDateIntervals={blockedIntervals}
            />
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

            {bookingError && <p className="text-red-600 text-xs mt-2">{bookingError}</p>}
            {checkIn && checkOut && checkingAvailability && (
              <p className="text-xs text-slate-400 mt-2">Checking availability...</p>
            )}

            <h4 className="font-semibold text-sm mt-5 mb-2">Available room types</h4>
            <p className="text-xs text-slate-400 mb-2">Tap a room to check its calendar above.</p>
            <div className="space-y-3">
              {rooms.map((room) => {
                const availability = availabilityByRoom[room.id]
                const showAvailability = checkIn && checkOut && availability
                const isUnavailable = showAvailability && !availability.available
                const isSelected = room.id === selectedRoomId
                return (
                  <div
                    key={room.id}
                    onClick={() => {
                      if (room.id === selectedRoomId) return
                      setSelectedRoomId(room.id)
                      setCheckIn(null)
                      setCheckOut(null)
                    }}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      isUnavailable ? 'border-red-200 bg-red-50/40' : isSelected ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-medium text-sm flex items-center gap-1.5">
                          {room.roomType}
                          {isSelected && <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Selected</span>}
                        </p>
                        <p className="text-xs text-slate-400">Sleeps {room.maxOccupancy} · {room.breakfastIncluded ? 'Breakfast included' : 'Room only'}</p>
                      </div>
                      <p className="text-primary font-bold text-sm whitespace-nowrap">Rs {room.pricePerNight.toLocaleString()}<span className="text-xs text-slate-400">/night</span></p>
                    </div>
                    {nights() > 0 && (
                      <p className="text-xs text-slate-500 mt-1">Rs {(room.pricePerNight * nights()).toLocaleString()} for {nights()} night{nights() > 1 ? 's' : ''}</p>
                    )}
                    {showAvailability && (
                      <p className={`text-xs mt-1.5 font-medium ${isUnavailable ? 'text-red-600' : 'text-green-600'}`}>
                        {isUnavailable ? '✕ ' : '✓ '}{availability.message}
                      </p>
                    )}
                    <button
                      disabled={isUnavailable}
                      onClick={(e) => { e.stopPropagation(); handleReserveClick(room) }}
                      className="btn-primary w-full mt-2 text-sm py-2"
                    >
                      {isUnavailable ? 'Not available' : 'Reserve'}
                    </button>
                  </div>
                )
              })}
              {rooms.length === 0 && <p className="text-sm text-slate-400">No rooms configured for this property yet.</p>}
            </div>
          </div>
        </div>
      </div>

      {showAuthGate && pendingRoom && (
        <BookingAuthGate
          onClose={() => { setShowAuthGate(false); setPendingRoom(null) }}
          onSuccess={() => {
            setShowAuthGate(false)
            const room = pendingRoom
            setPendingRoom(null)
            proceedToBooking(room)
          }}
        />
      )}
    </div>
  )
}