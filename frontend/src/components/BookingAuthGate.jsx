import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import GoogleSignInButton from './GoogleSignInButton.jsx'
import FacebookSignInButton from './FacebookSignInButton.jsx'

/**
 * Booking-first account creation.
 *
 * Guests who are not signed in should not have to leave the booking flow or
 * choose between "sign in" and "create account" before they can continue.
 * This step creates the guest account as part of the reservation flow and
 * immediately hands the guest back to the booking confirmation/review page.
 */
export default function BookingAuthGate({ onSuccess, onClose }) {
  const { register, loginWithGoogle, loginWithFacebook } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function guestDetails(fullName, fallbackEmail = email, fallbackPhone = phone) {
    return {
      guestFullName: (fullName || `${firstName} ${lastName}`).trim(),
      guestEmail: (fallbackEmail || email).trim(),
      guestPhone: (fallbackPhone || phone).trim(),
    }
  }

  async function handleGoogleCredential(idToken) {
    setError('')
    setLoading(true)
    try {
      const data = await loginWithGoogle(idToken)
      onSuccess(guestDetails(data.fullName, data.email, data.phone || ''))
    } catch (err) {
      setError(err.response?.data?.message || 'Could not continue with Google. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleFacebookToken(accessToken) {
    setError('')
    setLoading(true)
    try {
      const data = await loginWithFacebook(accessToken)
      onSuccess(guestDetails(data.fullName, data.email, data.phone || ''))
    } catch (err) {
      setError(err.response?.data?.message || 'Could not continue with Facebook. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first name and last name.')
      return
    }

    if (!phone.trim()) {
      setError('Please enter your telephone number.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
      const data = await register({
        fullName,
        email: email.trim(),
        phone: phone.trim(),
        password,
        role: 'GUEST',
      })

      onSuccess({
        guestFullName: fullName,
        guestEmail: data.email || email.trim(),
        guestPhone: phone.trim(),
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/45 z-[1000] overflow-y-auto p-3 sm:p-4 flex items-start sm:items-center justify-center">
      <div className="bg-white rounded-2xl shadow-cardHover max-w-md w-full p-5 sm:p-6 my-3 sm:my-8 relative max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-64px)] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl leading-none disabled:opacity-50"
          aria-label="Close"
        >×</button>

        <div className="pr-8">
          <h3 className="font-display font-bold text-xl sm:text-2xl mb-1">
            Reserve your room
          </h3>
          <p className="text-slate-500 text-sm leading-5 mb-5">
            Enter your details to continue to confirmation.
          </p>
        </div>

        <div className="space-y-2">
          <GoogleSignInButton
            onCredential={handleGoogleCredential}
            text="continue_with"
          />
          <FacebookSignInButton
            onAccessToken={handleFacebookToken}
            label="Continue with Facebook"
          />
        </div>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-[11px] sm:text-xs text-slate-400 whitespace-nowrap">OR CREATE WITH EMAIL</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">First name</label>
              <input
                required
                autoComplete="given-name"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Last name</label>
              <input
                required
                autoComplete="family-name"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-field text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Email address</label>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Telephone number</label>
            <input
              type="tel"
              required
              autoComplete="tel"
              placeholder="+94 7X XXX XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Password</label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field text-sm"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm sm:text-base"
          >
            {loading ? 'Reserving...' : 'Reserve room'}
          </button>
        </form>

      </div>
    </div>
  )
}
