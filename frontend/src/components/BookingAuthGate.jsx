import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import GoogleSignInButton from './GoogleSignInButton.jsx'
import FacebookSignInButton from './FacebookSignInButton.jsx'

/**
 * A compact sign-in/create-account modal shown right at the moment a guest
 * clicks "Reserve" without being logged in — so booking a room never
 * bounces them away to a separate page. Supports the site's normal
 * email+password login/register AND "Continue with Google" (which skips
 * the password step entirely and logs them straight in).
 */
export default function BookingAuthGate({ onSuccess, onClose }) {
  const { login, register, loginWithGoogle, loginWithFacebook } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGoogleCredential(idToken) {
    setError('')
    try {
      await loginWithGoogle(idToken)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not sign in with Google. Please try again.')
    }
  }

  async function handleFacebookToken(accessToken) {
    setError('')
    try {
      await loginWithFacebook(accessToken)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not sign in with Facebook. Please try again.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        if (!fullName.trim()) { setError('Please enter your full name.'); setLoading(false); return }
        await register({ fullName, email, phone, password, role: 'GUEST' })
      }
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[1000] overflow-y-auto p-4">
      <div className="bg-white rounded-xl shadow-cardHover max-w-md w-full p-6 my-8 mx-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>

        <h3 className="font-display font-bold text-xl mb-1">
          {mode === 'login' ? 'Sign in to reserve' : 'Create an account to reserve'}
        </h3>
        <p className="text-slate-500 text-sm mb-5">Just one quick step, then straight back to your booking.</p>

        <div className="space-y-2">
          <GoogleSignInButton onCredential={handleGoogleCredential} text={mode === 'login' ? 'signin_with' : 'signup_with'} />
          <FacebookSignInButton onAccessToken={handleFacebookToken} label={mode === 'login' ? 'Continue with Facebook' : 'Sign up with Facebook'} />
        </div>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">OR USE EMAIL & PASSWORD</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <>
              <input required placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field text-sm" />
              <input placeholder="Phone number (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field text-sm" />
            </>
          )}
          <input type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field text-sm" />
          <input type="password" required minLength={mode === 'register' ? 6 : undefined} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field text-sm" />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button disabled={loading} className="btn-primary w-full">
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in & continue' : 'Create account & continue'}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-4 text-center">
          {mode === 'login' ? (
            <>New here? <button onClick={() => { setMode('register'); setError('') }} className="text-primary font-medium hover:underline">Create an account</button></>
          ) : (
            <>Already have an account? <button onClick={() => { setMode('login'); setError('') }} className="text-primary font-medium hover:underline">Sign in</button></>
          )}
        </p>
      </div>
    </div>
  )
}