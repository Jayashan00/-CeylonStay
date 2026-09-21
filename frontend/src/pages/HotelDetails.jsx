import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/client.js'
import StarRating from '../components/StarRating.jsx'
import ScoreBadge from '../components/ScoreBadge.jsx'
import SriLankaMap from '../components/SriLankaMap.jsx'
import DateRangeField from '../components/DateRangeField.jsx'
import Loader from '../components/Loader.jsx'
import BookingAuthGate from '../components/BookingAuthGate.jsx'
import ShareButton from '../components/ShareButton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { toLocalDateString, parseLocalDate } from '../utils/dateUtils.js'

function Gallery({ images = [], title, onClose }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(images.length - 1, i + 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [images.length, onClose])

  if (!images.length) return null

  return (
    <div className="fixed inset-0 z-[2000] bg-black/95 p-3 sm:p-6 flex flex-col" onClick={onClose}>
      <div className="flex justify-between items-center text-white mb-3">
        <p className="font-semibold truncate pr-4">{title}</p>
        <button type="button" onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-2xl">×</button>
      </div>

      <div className="relative flex-1 min-h-0 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img src={images[index]} alt={`${title} ${index + 1}`} className="max-h-[74vh] max-w-full object-contain rounded-lg" />

        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className="absolute left-1 sm:left-4 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white text-3xl disabled:opacity-20"
          aria-label="Previous photo"
        >‹</button>

        <button
          type="button"
          disabled={index === images.length - 1}
          onClick={() => setIndex((i) => Math.min(images.length - 1, i + 1))}
          className="absolute right-1 sm:right-4 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white text-3xl disabled:opacity-20"
          aria-label="Next photo"
        >›</button>
      </div>

      <p className="text-white text-center text-sm py-2">{index + 1} / {images.length}</p>

      <div className="overflow-x-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center gap-2 min-w-max pb-1">
          {images.map((img, i) => (
            <button
              type="button"
              key={`${img}-${i}`}
              onClick={() => setIndex(i)}
              className={`w-16 h-12 sm:w-20 sm:h-14 rounded-md overflow-hidden border-2 ${i === index ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function RoomCard({ room, availability, nights, onReserve, onGallery }) {
  const images = Array.isArray(room.images) ? room.images.filter(Boolean) : []
  const unavailable = availability && !availability.available

  return (
    <article className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Room photos are deliberately full-width so guests see the room before the booking action. */}
      <div className="bg-slate-100">
        <button
          type="button"
          onClick={() => images.length && onGallery(images)}
          className="relative block w-full h-64 sm:h-80 lg:h-[360px] overflow-hidden group"
          aria-label={`View photos of ${room.roomType}`}
        >
          {images.length ? (
            <img
              src={images[0]}
              alt={room.roomType}
              className="w-full h-full object-cover group-hover:scale-[1.025] transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">No room photos</div>
          )}

          {images.length > 0 && (
            <span className="absolute left-3 bottom-3 bg-black/75 text-white rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold backdrop-blur-sm">
              📷 {images.length} room photo{images.length !== 1 ? 's' : ''} · View all
            </span>
          )}
        </button>

        {images.length > 1 && (
          <div className="px-3 sm:px-4 py-3 bg-white border-t border-slate-100">
            <div className="flex gap-2 overflow-x-auto pb-0.5">
              {images.slice(0, 7).map((img, i) => (
                <button
                  type="button"
                  key={`${img}-${i}`}
                  onClick={() => onGallery(images)}
                  className="relative shrink-0 w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden border border-slate-200 hover:border-primary"
                  aria-label={`View ${room.roomType} photo ${i + 1}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  {i === 6 && images.length > 7 && (
                    <span className="absolute inset-0 bg-black/55 text-white flex items-center justify-center text-xs font-bold">
                      +{images.length - 7}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 break-words">{room.roomType}</h3>
            <p className="text-sm text-slate-500 mt-1">
              Sleeps {room.maxOccupancy} · {room.breakfastIncluded ? 'Breakfast included' : 'Room only'}
            </p>
          </div>

          <div className="sm:text-right shrink-0">
            <p className="text-primary font-extrabold text-xl">Rs {Number(room.pricePerNight).toLocaleString()}</p>
            <p className="text-xs text-slate-400">per night</p>
          </div>
        </div>

        {room.description && (
          <p className="text-sm text-slate-600 leading-6 mt-3">{room.description}</p>
        )}

        {(room.facilities || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {(room.facilities || []).slice(0, 10).map((f) => (
              <span key={f} className="chip text-xs">{f}</span>
            ))}
          </div>
        )}

        {/* Booking information */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          {nights > 0 && (
            <p className="text-sm text-slate-600 mb-1">
              <span className="font-semibold">Rs {(Number(room.pricePerNight) * nights).toLocaleString()}</span>{' '}
              for {nights} night{nights > 1 ? 's' : ''}
            </p>
          )}

          {availability && (
            <p className={`text-xs font-semibold mb-3 ${unavailable ? 'text-red-600' : 'text-green-600'}`}>
              {unavailable ? '✕ ' : '✓ '}{availability.message}
            </p>
          )}

          {/* Reserve is ALWAYS the final action underneath the room information/photos. */}
          <button
            type="button"
            disabled={unavailable}
            onClick={() => onReserve(room)}
            className="btn-primary w-full py-3.5 text-base font-bold rounded-xl disabled:cursor-not-allowed"
          >
            {unavailable ? 'Not available for these dates' : 'Reserve this room'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default function HotelDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [hotel, setHotel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [gallery, setGallery] = useState(null)
  const [checkIn, setCheckIn] = useState(null)
  const [checkOut, setCheckOut] = useState(null)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [availabilityByRoom, setAvailabilityByRoom] = useState({})
  const [blockedIntervals, setBlockedIntervals] = useState([])
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [showAuthGate, setShowAuthGate] = useState(false)
  const [pendingRoom, setPendingRoom] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/hotels/${id}`),
      api.get(`/hotels/${id}/rooms`),
      api.get(`/reviews/hotel/${id}`),
    ])
      .then(([h, r, rv]) => {
        setHotel(h.data)
        setRooms(r.data || [])
        setReviews(rv.data || [])
        setSelectedRoomId(r.data?.[0]?.id || null)
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!selectedRoomId) return
    let cancelled = false

    api.get(`/rooms/${selectedRoomId}/blocked-dates`, { params: { daysAhead: 365 } })
      .then((res) => {
        if (!cancelled) {
          setBlockedIntervals((res.data || []).map((r) => ({
            start: parseLocalDate(r.start),
            end: parseLocalDate(r.end),
          })))
        }
      })
      .catch(() => !cancelled && setBlockedIntervals([]))

    return () => { cancelled = true }
  }, [selectedRoomId])

  useEffect(() => {
    if (!checkIn || !checkOut || !rooms.length) {
      setAvailabilityByRoom({})
      return
    }

    let cancelled = false
    setCheckingAvailability(true)
    const ci = toLocalDateString(checkIn)
    const co = toLocalDateString(checkOut)

    Promise.all(
      rooms.map((room) =>
        api.get(`/rooms/${room.id}/availability`, {
          params: { checkIn: ci, checkOut: co, rooms: 1 },
        })
          .then((r) => [room.id, r.data])
          .catch(() => [room.id, null])
      )
    )
      .then((entries) => {
        if (cancelled) return
        const map = {}
        entries.forEach(([roomId, data]) => { map[roomId] = data })
        setAvailabilityByRoom(map)
      })
      .finally(() => !cancelled && setCheckingAvailability(false))

    return () => { cancelled = true }
  }, [checkIn, checkOut, rooms])

  const nights = useMemo(
    () => checkIn && checkOut ? Math.max(0, Math.round((checkOut - checkIn) / 86400000)) : 0,
    [checkIn, checkOut]
  )

  const hotelImages = hotel?.images?.filter(Boolean) || []

  function proceed(room) {
    const draft = {
      hotelId: id,
      hotelSlug: hotel.slug || id,
      hotelName: hotel.name,
      hotelImage: hotelImages[0] || '',
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

    sessionStorage.setItem('ceylonstay_booking_draft', JSON.stringify(draft))
    navigate(`/book/${room.id}`, { state: draft })
  }

  function reserve(room) {
    setBookingError('')

    if (!checkIn || !checkOut) {
      setBookingError('Select your check-in and check-out dates first.')
      document.getElementById('room-booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    if (availabilityByRoom[room.id] && !availabilityByRoom[room.id].available) {
      setBookingError(availabilityByRoom[room.id].message || 'This room is unavailable for those dates.')
      return
    }

    if (!user) {
      setPendingRoom(room)
      setShowAuthGate(true)
      return
    }

    proceed(room)
  }

  if (loading) return <Loader />
  if (!hotel) return <p className="text-center py-20">Property not found.</p>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
      <div className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-primary-dark break-words">{hotel.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <StarRating stars={hotel.starRating} />
              <span className="text-sm text-slate-500">{hotel.propertyType}</span>
              <span className="text-slate-300">•</span>
              <span className="text-sm text-slate-500 break-words">{hotel.address}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ShareButton hotel={hotel} />
            <ScoreBadge score={hotel.averageRating} reviewCount={hotel.reviewCount} />
          </div>
        </div>
      </div>

      {/* Property gallery */}
      <section className="mb-8">
        {hotelImages.length > 0 ? (
          <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-2 h-[300px] sm:h-[430px] lg:h-[500px] rounded-2xl overflow-hidden">
            <button type="button" onClick={() => setGallery({ images: hotelImages, title: hotel.name })} className="relative col-span-2 row-span-2 overflow-hidden group bg-slate-100">
              <img src={hotelImages[0]} alt={`${hotel.name} main`} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" />
              <span className="absolute left-3 bottom-3 bg-black/75 text-white rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold">📷 View all photos</span>
            </button>
            {hotelImages.slice(1, 5).map((img, i) => {
              const index = i + 1
              const extra = Math.max(0, hotelImages.length - 5)
              return (
                <button type="button" key={`${img}-${index}`} onClick={() => setGallery({ images: hotelImages, title: hotel.name })} className="relative overflow-hidden group bg-slate-100">
                  <img src={img} alt={`${hotel.name} photo ${index + 1}`} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform" />
                  {index === 4 && extra > 0 && <span className="absolute inset-0 bg-black/55 text-white flex items-center justify-center font-bold">+{extra} photos</span>}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="h-72 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">No property photos available</div>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="font-display font-bold text-xl mb-2">About this property</h2>
            <p className="text-slate-600 leading-relaxed">{hotel.description}</p>
          </section>

          {/* Mobile booking/date selector — immediately above rooms */}
          <div className="lg:hidden">
            <div className="card p-4 sm:p-5 border-2 border-primary/10 bg-white">
              <h3 className="font-display font-bold text-lg">Choose your dates</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                Select your dates first, then reserve the exact room you want.
              </p>

              <DateRangeField
                checkIn={checkIn}
                checkOut={checkOut}
                onChange={(s, e) => { setCheckIn(s); setCheckOut(e); setBookingError('') }}
                excludeDateIntervals={blockedIntervals}
              />

              <div className="grid grid-cols-2 gap-2 mt-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Adults</label>
                  <input
                    type="number"
                    min={1}
                    value={adults}
                    onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Children</label>
                  <input
                    type="number"
                    min={0}
                    value={children}
                    onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => document.getElementById('room-booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="btn-accent w-full mt-4 py-3 font-bold"
              >
                View rooms &amp; reserve
              </button>

              {bookingError && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {bookingError}
                </div>
              )}

              {checkIn && checkOut && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm">
                  <p className="font-semibold">{toLocalDateString(checkIn)} → {toLocalDateString(checkOut)}</p>
                  <p className="text-slate-500">{adults} adults · {children} children · {nights} night{nights !== 1 ? 's' : ''}</p>
                </div>
              )}
            </div>
          </div>

          <section id="room-booking" className="scroll-mt-24">
            <div className="rounded-2xl border-2 border-primary/10 bg-white p-4 sm:p-5">
              <div className="mb-5">
                <h2 className="font-display font-bold text-xl">Rooms &amp; prices</h2>
                <p className="text-sm text-slate-500 mt-1">See the room photos first, then reserve that exact room below.</p>
              </div>

              {bookingError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{bookingError}</div>
              )}

              {checkingAvailability && checkIn && checkOut && (
                <div className="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">Checking live availability for every room…</div>
              )}

              <div className="space-y-6">
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    availability={availabilityByRoom[room.id]}
                    nights={nights}
                    onReserve={reserve}
                    onGallery={(images) => setGallery({ images, title: `${hotel.name} — ${room.roomType}` })}
                  />
                ))}
              </div>

              {!rooms.length && <p className="text-slate-500">No rooms are available at this property.</p>}
            </div>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl mb-3">Property facilities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {(hotel.facilities || []).map((f) => <div key={f} className="flex gap-2 text-sm text-slate-700"><span className="text-green-600">✓</span>{f}</div>)}
            </div>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl mb-3">Location</h2>
            <SriLankaMap hotels={[hotel]} height="320px" />
          </section>

          <section>
            <h2 className="font-display font-bold text-xl mb-3">Guest reviews ({reviews.length})</h2>
            {reviews.length ? (
              <div className="space-y-4">
                {reviews.map((rv) => (
                  <div key={rv.id} className="border-b border-slate-100 pb-4">
                    <div className="flex gap-2 items-center mb-1"><span className="bg-primary text-white text-xs font-bold rounded px-2 py-1">{rv.rating}/10</span><span className="font-medium text-sm">{rv.guestName}</span></div>
                    <p className="text-sm text-slate-600">{rv.comment}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-slate-500 text-sm">No reviews yet.</p>}
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="card p-4 sm:p-5 lg:sticky lg:top-20">
            <h3 className="font-display font-bold text-lg">Choose your dates</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">Your dates stay selected while you browse all room photos and prices.</p>

            <DateRangeField
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={(s, e) => { setCheckIn(s); setCheckOut(e); setBookingError('') }}
              excludeDateIntervals={blockedIntervals}
            />

            <div className="grid grid-cols-2 gap-2 mt-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Adults</label>
                <input type="number" min={1} value={adults} onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))} className="input-field text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Children</label>
                <input type="number" min={0} value={children} onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))} className="input-field text-sm" />
              </div>
            </div>

            <button type="button" onClick={() => document.getElementById('room-booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="btn-accent w-full mt-4 py-3 font-bold">
              View rooms &amp; reserve
            </button>

            {checkIn && checkOut && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm">
                <p className="font-semibold">{toLocalDateString(checkIn)} → {toLocalDateString(checkOut)}</p>
                <p className="text-slate-500">{adults} adults · {children} children · {nights} night{nights !== 1 ? 's' : ''}</p>
              </div>
            )}
          </div>
        </aside>
      </section>

      {gallery && <Gallery images={gallery.images} title={gallery.title} onClose={() => setGallery(null)} />}

      {showAuthGate && pendingRoom && (
        <BookingAuthGate
          onClose={() => { setShowAuthGate(false); setPendingRoom(null) }}
          onSuccess={() => { setShowAuthGate(false); const room = pendingRoom; setPendingRoom(null); proceed(room) }}
        />
      )}
    </div>
  )
}
