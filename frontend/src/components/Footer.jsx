import React from 'react'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../context/SiteSettingsContext.jsx'

export default function Footer() {
  const { settings } = useSiteSettings()

  return (
    <footer className="bg-primary-dark text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <p className="text-white font-display font-extrabold text-xl mb-3">{settings.siteName}</p>
          <p className="text-sm text-slate-400">{settings.footerAbout}</p>
        </div>
        <div>
          <p className="text-white font-semibold mb-3 text-sm">Explore</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/hotels" className="hover:text-white">All stays</Link></li>
            <li><Link to="/hotels?district=Galle" className="hover:text-white">Galle</Link></li>
            <li><Link to="/hotels?district=Kandy" className="hover:text-white">Kandy</Link></li>
            <li><Link to="/hotels?district=Colombo" className="hover:text-white">Colombo</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold mb-3 text-sm">Partners</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/register?role=HOTEL_OWNER" className="hover:text-white">List your property</Link></li>
            <li><Link to="/login" className="hover:text-white">Owner sign in</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold mb-3 text-sm">Support</p>
          <ul className="space-y-2 text-sm">
            <li><span className="text-slate-400">{settings.contactPhone}</span></li>
            <li><span className="text-slate-400">{settings.contactEmail}</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {settings.siteName}. Demo project — not affiliated with Booking.com.
      </div>
    </footer>
  )
}