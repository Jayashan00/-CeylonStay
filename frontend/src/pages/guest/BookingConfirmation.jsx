import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'

/**
 * Given the guest's email address, works out the best "open your inbox"
 * link we can offer: the real webmail inbox for the big free providers
 * (opens Gmail/Outlook/Yahoo directly in a new tab), falling back to a
 * plain mailto: link for anything else so the button always does
 * *something* useful.
 */
function inboxLinkFor(email) {
  const domain = (email.split('@')[1] || '').toLowerCase()
  if (domain.includes('gmail')) {
    return { url: `https://mail.google.com/mail/u/?authuser=${encodeURIComponent(email)}#search/${encodeURIComponent('subject:booking OR subject:confirmation OR subject:reservation')}`, label: 'Open Gmail' }
  }
  if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live.')) {
    return { url: 'https://outlook.live.com/mail/0/inbox', label: 'Open Outlook' }
  }
  if (domain.includes('yahoo')) {
    return { url: 'https://mail.yahoo.com/', label: 'Open Yahoo Mail' }
  }
  return { url: `mailto:${email}`, label: 'Open my email' }
}

/**
 * A dismissible highlighted banner shown right after a booking succeeds,
 * pointing the guest straight at the confirmation email that was just
 * sent, with a one-click button to jump into their inbox to check it —
 * so the confirmation isn't just a small line of text they might miss.
 */
function CheckEmailBanner({ email, onClose }) {
  const { url, label } = inboxLinkFor(email)
  return (
    <div className="fixed inset-0 bg-black/40 z-[1000] overflow-y-auto p-4 flex items-start sm:items-center justify-center">
      <div className="bg-white rounded-xl shadow-cardHover max-w-md w-full p-6 my-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        <p className="text-5xl mb-3 text-center">📧</p>
        <h3 className="font-display font-bold text-xl mb-2 text-center">Check your email!</h3>
        <p className="text-slate-500 text-sm mb-5 text-center">
          We've sent your booking confirmation and PDF receipt to <span className="font-semibold text-slate-700">{email}</span>.
          Open it now to see your full booking details and the link to manage your reservation.
        </p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-center block mb-2">
          {label} →
        </a>
        <button onClick={onClose} className="w-full text-sm text-slate-400 hover:text-slate-600 py-2">
          I'll check it later
        </button>
      </div>
    </div>
  )
}

export default function BookingConfirmation() {
  const { id } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEmailBanner, setShowEmailBanner] = useState(true)

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
        <p className="text-slate-500 mb-1">Your reservation reference is <span className="font-semibold text-primary">{booking.bookingReference}</span></p>

        <div className="mt-3 mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg text-left flex items-start gap-3">
          <span className="text-2xl leading-none">📧</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700">A confirmation email is on its way</p>
            <p className="text-xs text-slate-500 mt-0.5">
              We sent your receipt and full booking details to <span className="font-medium">{booking.guestEmail}</span>. Go check it out!
            </p>
          </div>
          <button
            onClick={() => setShowEmailBanner(true)}
            className="text-xs font-semibold text-primary hover:underline whitespace-nowrap self-center"
          >
            Open email →
          </button>
        </div>

        <div className="text-left bg-slate-50 rounded-lg p-5 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-400">Hotel</span><span className="font-medium">{booking.hotelName}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Room type</span><span className="font-medium">{booking.roomType}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Check-in</span><span className="font-medium">{booking.checkIn}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Check-out</span><span className="font-medium">{booking.checkOut}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Guests</span><span className="font-medium">{booking.adults} adults, {booking.children} children</span></div>
          <div className="flex justify-between border-t border-slate-200 pt-2 mt-2"><span className="text-slate-500 font-medium">Total price</span><span className="font-bold text-primary">Rs {booking.totalPrice.toLocaleString()}</span></div>
        </div>

        {booking.manageToken && (
          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg text-left">
            <p className="text-sm font-medium mb-1">Need to change or cancel later?</p>
            <p className="text-xs text-slate-500 mb-2">Use the link below any time — no login needed. It's also in your confirmation email.</p>
            <Link to={`/manage-booking/${booking.manageToken}`} className="text-sm text-primary font-medium hover:underline">
              Manage this booking →
            </Link>
          </div>
        )}

        <div className="flex gap-3 justify-center mt-8">
          <Link to="/my-bookings" className="btn-primary">View my bookings</Link>
          <Link to="/hotels" className="btn-outline">Explore more stays</Link>
        </div>
      </div>

      {showEmailBanner && (
        <CheckEmailBanner email={booking.guestEmail} onClose={() => setShowEmailBanner(false)} />
      )}
    </div>
  )
}