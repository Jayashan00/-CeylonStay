import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'

export default function BookingConfirmation() {
  const { id } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/bookings/${id}`).then((res) => setBooking(res.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loader />
  if (!booking) return <p className="text-center py-20">Booking not found.</p>

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="card p-8 text-center">
        <p className="text-5xl mb-3">✅</p>
        <h1 className="font-display font-bold text-2xl mb-1">Booking confirmed!</h1>
        <p className="text-slate-500 mb-6">Your reservation reference is <span className="font-semibold text-primary">{booking.bookingReference}</span></p>

        <div className="text-left bg-slate-50 rounded-lg p-5 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-400">Hotel</span><span className="font-medium">{booking.hotelName}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Room type</span><span className="font-medium">{booking.roomType}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Check-in</span><span className="font-medium">{booking.checkIn}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Check-out</span><span className="font-medium">{booking.checkOut}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Guests</span><span className="font-medium">{booking.adults} adults, {booking.children} children</span></div>
          <div className="flex justify-between border-t border-slate-200 pt-2 mt-2"><span className="text-slate-500 font-medium">Total price</span><span className="font-bold text-primary">Rs {booking.totalPrice.toLocaleString()}</span></div>
        </div>

        <div className="flex gap-3 justify-center mt-8">
          <Link to="/my-bookings" className="btn-primary">View my bookings</Link>
          <Link to="/hotels" className="btn-outline">Explore more stays</Link>
        </div>
      </div>
    </div>
  )
}
