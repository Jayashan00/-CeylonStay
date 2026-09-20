import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client.js'
import SearchBar from '../components/SearchBar.jsx'
import HotelCard from '../components/HotelCard.jsx'
import SriLankaMap from '../components/SriLankaMap.jsx'
import Loader from '../components/Loader.jsx'
import { useSiteSettings } from '../context/SiteSettingsContext.jsx'

// Real photography of actual Sri Lankan locations (sourced from Pexels — free
// to use, no AI-generated imagery), rotated as a slow crossfade behind the
// hero. Each one is a genuinely different place, not a repeat.
const HERO_SLIDES = [
  { url: 'https://images.pexels.com/photos/28838276/pexels-photo-28838276.jpeg?auto=compress&cs=tinysrgb&w=1920', caption: 'Sigiriya Rock Fortress' },
  { url: 'https://images.pexels.com/photos/30581907/pexels-photo-30581907.jpeg?auto=compress&cs=tinysrgb&w=1920', caption: 'Nine Arches Bridge, Ella' },
  { url: 'https://images.pexels.com/photos/29644514/pexels-photo-29644514.jpeg?auto=compress&cs=tinysrgb&w=1920', caption: 'Mirissa Beach' },
  { url: 'https://images.pexels.com/photos/14041994/pexels-photo-14041994.jpeg?auto=compress&cs=tinysrgb&w=1920', caption: 'Temple of the Tooth, Kandy' },
]

const HIGHLIGHT_DISTRICTS = [
  { name: 'Colombo', tag: 'City & culture', img: 'https://images.pexels.com/photos/8910835/pexels-photo-8910835.jpeg?auto=compress&cs=tinysrgb&w=500' },
  { name: 'Galle', tag: 'Fort & beaches', img: 'https://images.pexels.com/photos/33224238/pexels-photo-33224238.jpeg?auto=compress&cs=tinysrgb&w=500' },
  { name: 'Kandy', tag: 'Temples & heritage', img: 'https://images.pexels.com/photos/14041994/pexels-photo-14041994.jpeg?auto=compress&cs=tinysrgb&w=500' },
  { name: 'Nuwara Eliya', tag: 'Tea country', img: 'https://images.pexels.com/photos/33437258/pexels-photo-33437258.jpeg?auto=compress&cs=tinysrgb&w=500' },
  { name: 'Hambantota', tag: 'Safari & coast', img: 'https://images.pexels.com/photos/15883403/pexels-photo-15883403.jpeg?auto=compress&cs=tinysrgb&w=500' },
  { name: 'Trincomalee', tag: 'East coast diving', img: 'https://images.pexels.com/photos/6437583/pexels-photo-6437583.jpeg?auto=compress&cs=tinysrgb&w=500' },
]

const TRUST_POINTS = [
  { icon: '🔒', title: 'Real-time availability', text: 'No double-bookings — every room shown is genuinely free for your dates, checked live.' },
  { icon: '💬', title: 'Direct with the hotel', text: 'No middleman markups. Your booking goes straight to the property.' },
  { icon: '🇱🇰', title: 'Sri Lanka, done right', text: 'Built for local hotels, resorts, villas and homestays — from the coast to the hills.' },
]

export default function Home() {
  const { settings } = useSiteSettings()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/hotels', { params: { sortBy: 'rating' } })
      .then((res) => setHotels(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <section className="relative overflow-hidden h-[560px] sm:h-[620px]">
        <div className="absolute inset-0">
          {HERO_SLIDES.map((slide, i) => (
            <img
              key={slide.url}
              src={slide.url}
              alt={slide.caption}
              className="hero-slide absolute inset-0 w-full h-full object-cover"
              style={{ animationDelay: `${i * 6}s`, opacity: i === 0 ? 1 : 0 }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/85 via-primary-dark/55 to-surface" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-28 h-full flex flex-col justify-center">
          <div className="animate-fade-in-up">
            <span className="inline-block bg-white/15 backdrop-blur-sm text-white text-xs font-semibold tracking-wide uppercase px-3 py-1.5 rounded-full mb-4 border border-white/20">
              🌴 Sri Lanka's own booking platform
            </span>
            <h1 className="text-white font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl max-w-xl leading-[1.15] [text-shadow:0_2px_16px_rgba(0,0,0,0.55)]">
              {settings.tagline}
            </h1>
            <p className="text-white mt-4 max-w-lg text-base sm:text-lg [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
              From colonial hotels on Galle Face Green to clifftop resorts above Weligama Bay — search hotels, resorts, villas and homestays island-wide.
            </p>
          </div>
          <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 sm:-mt-10 relative z-10 mb-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TRUST_POINTS.map((p) => (
            <div key={p.title} className="card p-5 flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{p.icon}</span>
              <div>
                <p className="font-semibold text-sm">{p.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="font-display font-bold text-xl mb-1">Explore by region</h2>
        <p className="text-slate-500 text-sm mb-4">From ancient rock fortresses to palm-lined beaches — every corner of the island.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {HIGHLIGHT_DISTRICTS.map((d) => (
            <Link
              key={d.name}
              to={`/hotels?district=${encodeURIComponent(d.name)}`}
              className="relative rounded-xl overflow-hidden h-36 group card"
            >
              <img src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-3">
                <p className="text-white font-semibold text-sm">{d.name}</p>
                <p className="text-white/80 text-xs">{d.tag}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl">All properties on the map</h2>
          <Link to="/hotels?map=1" className="text-primary text-sm font-medium hover:underline">Open full map →</Link>
        </div>
        {loading ? <Loader /> : <SriLankaMap hotels={hotels} height="420px" />}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14 mb-16">
        <h2 className="font-display font-bold text-xl mb-1">Top rated stays right now</h2>
        <p className="text-slate-500 text-sm mb-4">Loved by real guests, verified by real bookings.</p>
        {loading ? (
          <Loader />
        ) : (
          <div className="grid gap-4">
            {hotels.slice(0, 6).map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
        {!loading && hotels.length === 0 && (
          <p className="text-slate-500 text-center py-10">No properties published yet — check back soon.</p>
        )}
      </section>
    </div>
  )
}