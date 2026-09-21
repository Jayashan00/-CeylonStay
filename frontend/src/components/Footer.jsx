import React from 'react'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../context/SiteSettingsContext.jsx'

export default function Footer() {
  const { settings } = useSiteSettings()
  const year = new Date().getFullYear()
  return (
    <footer className="bg-primary-dark text-slate-300 mt-12 sm:mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <p className="text-white font-display font-extrabold text-xl mb-3">Official Direct Booking Platform</p>
          <p className="text-sm leading-6 text-slate-400">{settings.footerAbout || 'Direct booking for hotels, resorts, villas, guest houses, bungalows and accommodation across Sri Lanka.'}</p>
        </div>
        <div><p className="text-white font-semibold mb-3 text-sm">Explore</p><ul className="space-y-2 text-sm"><li><Link to="/hotels" className="hover:text-white">All stays</Link></li><li><Link to="/hotels?district=Galle" className="hover:text-white">Galle</Link></li><li><Link to="/hotels?district=Kandy" className="hover:text-white">Kandy</Link></li><li><Link to="/hotels?district=Colombo" className="hover:text-white">Colombo</Link></li></ul></div>
        <div><p className="text-white font-semibold mb-3 text-sm">Partners</p><ul className="space-y-2 text-sm"><li><Link to="/register?role=HOTEL_OWNER" className="hover:text-white">List your property</Link></li><li><Link to="/login" className="hover:text-white">Owner sign in</Link></li></ul></div>
        <div><p className="text-white font-semibold mb-3 text-sm">Support</p><ul className="space-y-2 text-sm"><li>{settings.contactPhone}</li><li className="break-all">{settings.contactEmail}</li></ul></div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs sm:text-sm text-slate-500 leading-5">
        {settings.footerCopyright || `© ${year} Official Direct Booking Platform. All rights reserved from Layathraa Holidays.`}
      </div>
    </footer>
  )
}