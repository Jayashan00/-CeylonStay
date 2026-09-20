import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import GoogleSignInButton from '../../components/GoogleSignInButton.jsx'
import FacebookSignInButton from '../../components/FacebookSignInButton.jsx'

export default function Login() {
  const { login, loginWithGoogle, loginWithFacebook } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleError, setGoogleError] = useState('')
  const [facebookError, setFacebookError] = useState('')

  async function handleGoogleCredential(idToken) {
    setGoogleError('')
    try {
      const data = await loginWithGoogle(idToken)
      redirectByRole(data.role)
    } catch (err) {
      setGoogleError(err.response?.data?.message || 'Could not sign in with Google. Please try again.')
    }
  }

  async function handleFacebookToken(accessToken) {
    setFacebookError('')
    try {
      const data = await loginWithFacebook(accessToken)
      redirectByRole(data.role)
    } catch (err) {
      setFacebookError(err.response?.data?.message || 'Could not sign in with Facebook. Please try again.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      redirectByRole(data.role)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  function redirectByRole(role) {
    const from = location.state?.from
    if (from) return navigate(from)
    if (role === 'ADMIN') return navigate('/admin')
    if (role === 'REGION_ADMIN') return navigate('/admin/hotels')
    if (role === 'HOTEL_OWNER') return navigate('/owner')
    return navigate('/') // guests land on the homepage, not a dashboard
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="font-display font-bold text-2xl mb-1">Sign in</h1>
        <p className="text-slate-500 text-sm mb-6">Access your CeylonStay account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
          <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button disabled={loading} className="btn-primary w-full">{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">OR</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <div className="space-y-2">
          <GoogleSignInButton onCredential={handleGoogleCredential} />
          <FacebookSignInButton onAccessToken={handleFacebookToken} label="Continue with Facebook" />
        </div>
        {googleError && <p className="text-red-600 text-sm text-center mt-2">{googleError}</p>}
        {facebookError && <p className="text-red-600 text-sm text-center mt-2">{facebookError}</p>}

        <p className="text-sm text-slate-500 mt-6 text-center">
          New to CeylonStay? <Link to="/register" className="text-primary font-medium hover:underline">Create an account</Link>
        </p>

        <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-500">Demo accounts</p>
          <p>Admin: admin@ceylonstay.lk / admin123</p>
          <p>Hotel owner: owner1@ceylonstay.lk / owner123</p>
          <p>Guest: guest@ceylonstay.lk / guest123</p>
        </div>
      </div>
    </div>
  )
}