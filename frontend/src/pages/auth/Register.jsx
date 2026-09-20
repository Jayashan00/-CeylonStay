import React, { useState } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import GoogleSignInButton from '../../components/GoogleSignInButton.jsx'
import FacebookSignInButton from '../../components/FacebookSignInButton.jsx'

export default function Register() {
  const { register, loginWithGoogle, loginWithFacebook } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const defaultRole = searchParams.get('role') === 'HOTEL_OWNER' ? 'HOTEL_OWNER' : 'GUEST'

  // If arriving here after being bounced from a page that needs login
  // (e.g. mid-booking), send them straight back there once they sign up
  // instead of the homepage/dashboard, so they never lose their place.
  function redirectAfterAuth(role) {
    const from = location.state?.from
    if (from) return navigate(from, { state: location.state?.fromState, replace: true })
    if (role === 'HOTEL_OWNER') return navigate('/owner')
    return navigate('/my-bookings')
  }

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(defaultRole)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleError, setGoogleError] = useState('')
  const [facebookError, setFacebookError] = useState('')

  async function handleGoogleCredential(idToken) {
    setGoogleError('')
    try {
      const data = await loginWithGoogle(idToken)
      redirectAfterAuth(data.role)
    } catch (err) {
      setGoogleError(err.response?.data?.message || 'Could not sign up with Google. Please try again.')
    }
  }

  async function handleFacebookToken(accessToken) {
    setFacebookError('')
    try {
      const data = await loginWithFacebook(accessToken)
      redirectAfterAuth(data.role)
    } catch (err) {
      setFacebookError(err.response?.data?.message || 'Could not sign up with Facebook. Please try again.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await register({ fullName, email, phone, password, role })
      redirectAfterAuth(data.role)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="font-display font-bold text-2xl mb-1">Create your account</h1>
        <p className="text-slate-500 text-sm mb-6">Join CeylonStay as a guest or list your property</p>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <button type="button" onClick={() => setRole('GUEST')} className={`rounded-lg border py-2.5 text-sm font-medium ${role === 'GUEST' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500'}`}>
            I'm a guest
          </button>
          <button type="button" onClick={() => setRole('HOTEL_OWNER')} className={`rounded-lg border py-2.5 text-sm font-medium ${role === 'HOTEL_OWNER' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500'}`}>
            I'm a hotel owner
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" />
          <input type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
          <input placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
          <input type="password" required minLength={6} placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button disabled={loading} className="btn-primary w-full">{loading ? 'Creating account...' : 'Create account'}</button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">OR</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <div className="space-y-2">
          <GoogleSignInButton onCredential={handleGoogleCredential} text="signup_with" />
          <FacebookSignInButton onAccessToken={handleFacebookToken} label="Sign up with Facebook" />
        </div>
        {googleError && <p className="text-red-600 text-sm text-center mt-2">{googleError}</p>}
        {facebookError && <p className="text-red-600 text-sm text-center mt-2">{facebookError}</p>}
        <p className="text-xs text-slate-400 text-center mt-2">Signing up with Google always creates a guest account — switch to a hotel owner account afterward from your profile if needed.</p>

        <p className="text-sm text-slate-500 mt-6 text-center">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}