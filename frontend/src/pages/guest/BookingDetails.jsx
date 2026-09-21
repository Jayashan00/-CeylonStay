import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import BookingStepper from '../../components/BookingStepper.jsx'
import api from '../../api/client.js'

function loadDraft(locationState, roomId) {
  if (locationState?.roomId) return locationState

  try {
    const stored = JSON.parse(
      sessionStorage.getItem('ceylonstay_booking_draft') || 'null'
    )

    if (stored && String(stored.roomId) === String(roomId)) {
      return stored
    }
  } catch {
    /* ignore malformed storage */
  }

  return null
}

function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0

  return Math.round(
    (new Date(checkOut) - new Date(checkIn)) /
      (1000 * 60 * 60 * 24)
  )
}

export default function BookingDetails() {
  const { roomId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [draft, setDraft] = useState(() =>
    loadDraft(location.state, roomId)
  )

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const [guestEmail, setGuestEmail] = useState(
    user?.email || ''
  )

  const [guestPhone, setGuestPhone] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [error, setError] = useState('')

  // Selected room information
  const [room, setRoom] = useState(null)
  const [roomImages, setRoomImages] = useState([])
  const [activeRoomImage, setActiveRoomImage] = useState(0)
  const [loadingRoom, setLoadingRoom] = useState(false)

  /*
   * Load the selected room using roomId.
   *
   * This is important because the booking draft previously only stored
   * hotelImage. Room photos are stored inside the Room object by the
   * hotel owner, so we retrieve the selected room here.
   */
  useEffect(() => {
    if (!draft?.hotelId || !roomId) return

    let cancelled = false

    async function loadSelectedRoom() {
      setLoadingRoom(true)

      try {
        const response = await api.get(
          `/hotels/${draft.hotelId}/rooms`
        )

        if (cancelled) return

        const rooms = Array.isArray(response.data)
          ? response.data
          : []

        const selectedRoom = rooms.find(
          (item) => String(item.id) === String(roomId)
        )

        if (selectedRoom) {
          setRoom(selectedRoom)

          const images = Array.isArray(selectedRoom.images)
            ? selectedRoom.images.filter(Boolean)
            : []

          setRoomImages(images)
          setActiveRoomImage(0)
        }
      } catch (err) {
        console.error('Could not load selected room:', err)

        if (!cancelled) {
          setRoom(null)
          setRoomImages([])
        }
      } finally {
        if (!cancelled) {
          setLoadingRoom(false)
        }
      }
    }

    loadSelectedRoom()

    return () => {
      cancelled = true
    }
  }, [draft?.hotelId, roomId])

  /*
   * Restore previously entered guest details if the guest
   * came back to edit the booking.
   */
  useEffect(() => {
    if (!draft) return

    if (draft.guestFullName) {
      const parts = draft.guestFullName.trim().split(/\s+/)
      setFirstName(parts.shift() || '')
      setLastName(parts.join(' '))
    } else if (user?.fullName) {
      const parts = user.fullName.trim().split(/\s+/)
      setFirstName(parts.shift() || '')
      setLastName(parts.join(' '))
    }

    if (draft.guestEmail) {
      setGuestEmail(draft.guestEmail)
    }

    if (draft.guestPhone) {
      setGuestPhone(draft.guestPhone)
    }

    if (draft.specialRequests) {
      setSpecialRequests(draft.specialRequests)
    }
  }, [draft])

  if (!draft) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 mb-4">
          We couldn't find your search details — this can happen if
          you refreshed or arrived here directly.
        </p>

        <Link to="/hotels" className="btn-primary">
          Start a new search
        </Link>
      </div>
    )
  }

  const nights = nightsBetween(
    draft.checkIn,
    draft.checkOut
  )

  const subtotal =
    draft.pricePerNight *
    nights *
    draft.numberOfRooms

  function handleContinue(e) {
    e.preventDefault()
    setError('')

    if (!firstName.trim() || !lastName.trim() || !guestEmail.trim()) {
      setError(
        'Please enter your first name, last name and a valid email — this is who the confirmation goes to.'
      )
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(guestEmail.trim())) {
      setError(
        "That email address doesn't look right — please double check it."
      )
      return
    }

    const updated = {
      ...draft,
      guestFullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
      guestEmail: guestEmail.trim(),
      guestPhone: guestPhone.trim(),
      specialRequests: specialRequests.trim(),

      // Keep room images in the booking draft as well.
      roomImages: roomImages,
    }

    sessionStorage.setItem(
      'ceylonstay_booking_draft',
      JSON.stringify(updated)
    )

    navigate(`/book/${roomId}/review`, {
      state: updated,
    })
  }

  /*
   * If the selected room has photos, use them.
   * Otherwise fall back to the hotel image.
   */
  const displayImages =
    roomImages.length > 0
      ? roomImages
      : draft.hotelImage
        ? [draft.hotelImage]
        : []

  const currentImage =
    displayImages[activeRoomImage] || displayImages[0]

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link
        to={`/hotels/${draft.hotelSlug || draft.hotelId}`}
        className="text-primary text-sm hover:underline"
      >
        ← Back to {draft.hotelName}
      </Link>

      <h1 className="font-display font-bold text-2xl mt-2 mb-4">
        Your details
      </h1>

      <BookingStepper current={2} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* =========================
            GUEST DETAILS
        ========================== */}
        <form
          onSubmit={handleContinue}
          className="lg:col-span-2 card p-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                autoComplete="given-name"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                autoComplete="family-name"
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Email address
            </label>

            <input
              type="email"
              value={guestEmail}
              onChange={(e) =>
                setGuestEmail(e.target.value)
              }
              placeholder="you@example.com"
              className="input-field"
              required
            />

            <p className="text-xs text-slate-400 mt-1">
              Your confirmation, receipt, and booking
              management link will be sent here.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Telephone number
            </label>

            <input
              value={guestPhone}
              onChange={(e) =>
                setGuestPhone(e.target.value)
              }
              placeholder="+94 7X XXX XXXX"
              autoComplete="tel"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Special requests{' '}
              <span className="text-slate-400 font-normal">
                (optional)
              </span>
            </label>

            <textarea
              value={specialRequests}
              onChange={(e) =>
                setSpecialRequests(e.target.value)
              }
              placeholder="E.g. late check-in, ground floor room, extra pillows..."
              className="input-field"
              rows={3}
            />

            <p className="text-xs text-slate-400 mt-1">
              The hotel will try their best, but requests
              aren't guaranteed.
            </p>
          </div>

          {error && (
            <p className="text-red-600 text-sm">
              {error}
            </p>
          )}

          <button className="btn-primary w-full py-3 text-base">
            Continue to review →
          </button>
        </form>

        {/* =========================
            YOUR STAY
        ========================== */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-20">

            <h3 className="font-semibold mb-3">
              Your stay
            </h3>

            {/* ROOM IMAGE GALLERY */}
            {loadingRoom ? (
              <div className="w-full h-32 rounded-lg bg-slate-100 flex items-center justify-center text-sm text-slate-400 mb-3">
                Loading room photos...
              </div>
            ) : displayImages.length > 0 ? (
              <div className="mb-4">

                {/* Main room image */}
                <div className="relative w-full h-40 rounded-lg overflow-hidden bg-slate-100">
                  <img
                    src={currentImage}
                    className="w-full h-full object-cover"
                    alt={`${draft.roomType} room`}
                  />

                  {/* Image counter */}
                  {displayImages.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      {activeRoomImage + 1} / {displayImages.length}
                    </div>
                  )}
                </div>

                {/* Room thumbnails */}
                {displayImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {displayImages.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() =>
                          setActiveRoomImage(index)
                        }
                        className={`h-14 rounded-md overflow-hidden border-2 transition ${
                          index === activeRoomImage
                            ? 'border-primary'
                            : 'border-transparent hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Room photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {/* HOTEL + ROOM INFORMATION */}
            <p className="font-medium">
              {draft.hotelName}
            </p>

            <p className="text-sm text-slate-500 mb-3">
              {draft.roomType}
            </p>

            {/* Selected room information */}
            {room && (
              <div className="mb-3 text-xs text-slate-500 space-y-1">
                {room.maxOccupancy && (
                  <p>
                    👤 Sleeps up to {room.maxOccupancy}
                  </p>
                )}

                {room.breakfastIncluded && (
                  <p className="text-green-600">
                    ✓ Breakfast included
                  </p>
                )}

                {room.freeCancellation && (
                  <p className="text-green-600">
                    ✓ Free cancellation
                  </p>
                )}
              </div>
            )}

            <div className="text-sm space-y-1.5 border-t border-slate-100 pt-3">

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Check-in
                </span>

                <span className="font-medium">
                  {draft.checkIn}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Check-out
                </span>

                <span className="font-medium">
                  {draft.checkOut}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Guests
                </span>

                <span className="font-medium">
                  {draft.adults} adults, {draft.children}{' '}
                  children
                </span>
              </div>

              <div className="flex justify-between border-t border-slate-100 pt-2 mt-2">
                <span className="text-slate-500 font-medium">
                  Total ({nights} night
                  {nights !== 1 ? 's' : ''})
                </span>

                <span className="font-bold text-primary">
                  Rs {subtotal.toLocaleString()}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-3">
              No payment is taken online — you'll settle
              the bill directly with the hotel.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}