import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useSiteSettings } from '../context/SiteSettingsContext.jsx'
import LanguageSelector from './LanguageSelector.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    logout(); setMenuOpen(false); setMobileOpen(false); navigate('/')
  }

  function dashboardLink() {
    if (user?.role === 'ADMIN') return '/admin'
    if (user?.role === 'REGION_ADMIN') return '/admin/hotels'
    if (user?.role === 'HOTEL_OWNER') return '/owner'
    return '/my-bookings'
  }

  return (
    <header className="bg-primary sticky top-0 z-[100] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-white min-w-0">
          {settings.logoUrl ? <img src={settings.logoUrl} alt={settings.siteName} className="h-9 w-auto max-w-[44px] object-contain shrink-0" /> : <span className="text-2xl shrink-0">🏝️</span>}
          <span className="font-display font-extrabold text-base sm:text-xl tracking-tight truncate">{settings.siteName}</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          <Link to="/hotels" className="text-white/90 hover:text-white px-3 py-2 text-sm font-medium">Explore stays</Link>
          <Link to="/hotels?map=1" className="text-white/90 hover:text-white px-3 py-2 text-sm font-medium">Map of Sri Lanka</Link>
          {user?.role === 'HOTEL_OWNER' && <Link to="/owner/hotels/new" className="text-white/90 hover:text-white px-3 py-2 text-sm font-medium">List your property</Link>}
          {user?.role === 'GUEST' && <Link to="/my-bookings" className="text-white/90 hover:text-white px-3 py-2 text-sm font-medium">My bookings</Link>}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block"><LanguageSelector /></div>
          {!user ? <>
            <Link to="/register?role=HOTEL_OWNER" className="hidden lg:block text-white text-sm font-medium px-3 py-2 hover:underline">List your property</Link>
            <Link to="/login" className="text-white text-sm font-medium border border-white/40 rounded-lg px-3 sm:px-4 py-2 hover:bg-white/10">Sign in</Link>
            <Link to="/register" className="btn-accent text-sm py-2 hidden sm:block">Register</Link>
          </> : (
            <div className="relative hidden sm:block">
              <button onClick={() => setMenuOpen(v => !v)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-2 text-sm font-medium">
                <span className="w-7 h-7 rounded-full bg-accent text-primary-dark flex items-center justify-center font-bold text-xs">{user.fullName?.[0]?.toUpperCase() || 'U'}</span>
                <span className="hidden lg:inline">{user.fullName?.split(' ')[0]}</span><span>▾</span>
              </button>
              {menuOpen && <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-cardHover overflow-hidden text-slate-700">
                <div className="px-4 py-3 border-b border-slate-100"><p className="font-semibold text-sm truncate">{user.fullName}</p><p className="text-xs text-slate-400 truncate">{user.email}</p></div>
                <Link to={dashboardLink()} onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-slate-50">{user.role === 'GUEST' ? 'My bookings' : 'Dashboard'}</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 text-red-600">Sign out</button>
              </div>}
            </div>
          )}
          <button type="button" onClick={() => setMobileOpen(v => !v)} className="lg:hidden w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center text-xl" aria-label="Open menu">☰</button>
        </div>
      </div>

      {mobileOpen && <div className="lg:hidden bg-white border-t border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
          <div className="sm:hidden pb-2"><LanguageSelector /></div>
          <Link onClick={() => setMobileOpen(false)} to="/hotels" className="block rounded-lg px-3 py-3 font-medium hover:bg-slate-50">Explore stays</Link>
          <Link onClick={() => setMobileOpen(false)} to="/hotels?map=1" className="block rounded-lg px-3 py-3 font-medium hover:bg-slate-50">Map of Sri Lanka</Link>
          {!user && <><Link onClick={() => setMobileOpen(false)} to="/register?role=HOTEL_OWNER" className="block rounded-lg px-3 py-3 font-medium hover:bg-slate-50">List your property</Link><Link onClick={() => setMobileOpen(false)} to="/register" className="block rounded-lg px-3 py-3 font-medium hover:bg-slate-50">Create account</Link></>}
          {user && <><Link onClick={() => setMobileOpen(false)} to={dashboardLink()} className="block rounded-lg px-3 py-3 font-medium hover:bg-slate-50">Dashboard</Link><button onClick={handleLogout} className="w-full text-left rounded-lg px-3 py-3 font-medium text-red-600 hover:bg-red-50">Sign out</button></>}
        </div>
      </div>}
    </header>
  )
}