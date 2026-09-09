import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client.js'
import SearchBar from '../components/SearchBar.jsx'
import HotelCard from '../components/HotelCard.jsx'
import SriLankaMap from '../components/SriLankaMap.jsx'
import Loader from '../components/Loader.jsx'
import { useSiteSettings } from '../context/SiteSettingsContext.jsx'

const HIGHLIGHT_DISTRICTS = [
  { name: 'Colombo', tag: 'City & culture', img: 'https://images.pexels.com/photos/8910835/pexels-photo-8910835.jpeg?auto=compress&cs=tinysrgb&w=500' },
  { name: 'Galle', tag: 'Fort & beaches', img: 'https://images.pexels.com/photos/33224238/pexels-photo-33224238.jpeg?auto=compress&cs=tinysrgb&w=500' },
  { name: 'Kandy', tag: 'Hills & heritage', img: 'https://images.pexels.com/photos/33437258/pexels-photo-33437258.jpeg?auto=compress&cs=tinysrgb&w=500' },
  { name: 'Nuwara Eliya', tag: 'Tea country', img: 'https://images.pexels.com/photos/33437258/pexels-photo-33437258.jpeg?auto=compress&cs=tinysrgb&w=500' },
  { name: 'Hambantota', tag: 'Safari & coast', img: 'https://images.pexels.com/photos/15883403/pexels-photo-15883403.jpeg?auto=compress&cs=tinysrgb&w=500' },
  { name: 'Trincomalee', tag: 'East coast diving', img: 'https://images.pexels.com/photos/6437583/pexels-photo-6437583.jpeg?auto=compress&cs=tinysrgb&w=500' },
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
      <section className="relative">
        <div className="absolute inset-0">
          <img src={settings.heroImageUrl} alt="Sri Lanka" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/80 via-primary-dark/50 to-surface" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-28">
          <h1 className="text-white font-display font-extrabold text-3xl sm:text-5xl max-w-2xl leading-tight">
            {settings.tagline}
          </h1>
          <p className="text-white/90 mt-3 max-w-xl">
            From colonial hotels on Galle Face Green to clifftop resorts above Weligama Bay — search hotels, resorts, villas and homestays island-wide.
          </p>
          <div className="mt-8">
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-10">
        <h2 className="font-display font-bold text-xl mb-4">Explore by region</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {HIGHLIGHT_DISTRICTS.map((d) => (
            <Link
              key={d.name}
              to={`/hotels?district=${encodeURIComponent(d.name)}`}
              className="relative rounded-xl overflow-hidden h-32 group card"
            >
              <img src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/35 flex flex-col justify-end p-3">
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
        <h2 className="font-display font-bold text-xl mb-4">Top rated stays right now</h2>
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