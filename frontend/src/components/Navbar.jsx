import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useSiteSettings } from '../context/SiteSettingsContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  function dashboardLink() {
    if (user?.role === 'ADMIN') return '/admin'
    if (user?.role === 'REGION_ADMIN') return '/admin/hotels'
    if (user?.role === 'HOTEL_OWNER') return '/owner'
    return '/my-bookings'
  }

  return (
    <header className="bg-primary sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.siteName} className="h-8 w-auto object-contain" />
          ) : (
            <span className="text-2xl">🏝️</span>
          )}
          <span className="font-display font-extrabold text-xl tracking-tight">{settings.siteName}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/hotels" className="text-white/90 hover:text-white px-3 py-2 text-sm font-medium">
            Explore stays
          </Link>
          <Link to="/hotels?map=1" className="text-white/90 hover:text-white px-3 py-2 text-sm font-medium">
            Map of Sri Lanka
          </Link>
          {user?.role === 'HOTEL_OWNER' && (
            <Link to="/owner/hotels/new" className="text-white/90 hover:text-white px-3 py-2 text-sm font-medium">
              List your property
            </Link>
          )}
          {user?.role === 'GUEST' && (
            <Link to="/my-bookings" className="text-white/90 hover:text-white px-3 py-2 text-sm font-medium">
              My bookings
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {!user && (
            <>
              <Link to="/register?role=HOTEL_OWNER" className="hidden sm:block text-white text-sm font-medium px-3 py-2 hover:underline">
                List your property
              </Link>
              <Link to="/login" className="text-white text-sm font-medium border border-white/40 rounded-lg px-4 py-2 hover:bg-white/10">
                Sign in
              </Link>
              <Link to="/register" className="btn-accent text-sm py-2">
                Register
              </Link>
            </>
          )}
          {user && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-2 text-sm font-medium"
              >
                <span className="w-7 h-7 rounded-full bg-accent text-primary-dark flex items-center justify-center font-bold text-xs">
                  {user.fullName?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="hidden sm:inline">{user.fullName?.split(' ')[0]}</span>
                <span>▾</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-cardHover overflow-hidden text-slate-700">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="font-semibold text-sm truncate">{user.fullName}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    <span className="chip mt-1 text-[11px] py-0.5 px-2">{user.role.replace('_', ' ')}</span>
                  </div>
                  <Link to={dashboardLink()} onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-slate-50">
                    {user.role === 'GUEST' ? 'My bookings' : 'Dashboard'}
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 text-red-600">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}