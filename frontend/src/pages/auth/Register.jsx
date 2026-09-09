import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultRole = searchParams.get('role') === 'HOTEL_OWNER' ? 'HOTEL_OWNER' : 'GUEST'

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(defaultRole)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await register({ fullName, email, phone, password, role })
      if (data.role === 'HOTEL_OWNER') navigate('/owner')
      else navigate('/my-bookings')
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

        <p className="text-sm text-slate-500 mt-6 text-center">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
