import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/client.js'
import HotelCard from '../components/HotelCard.jsx'
import SriLankaMap from '../components/SriLankaMap.jsx'
import Loader from '../components/Loader.jsx'
import SearchBar from '../components/SearchBar.jsx'

export default function HotelListing() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMap, setShowMap] = useState(searchParams.get('map') === '1')

  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minStars, setMinStars] = useState('')
  const [sortBy, setSortBy] = useState('rating')

  const district = searchParams.get('district') || 'all'
  const query = searchParams.get('query') || ''

  useEffect(() => {
    setLoading(true)
    api.get('/hotels', {
      params: {
        district: district === 'all' ? undefined : district,
        query: query || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        minStars: minStars || undefined,
        sortBy,
      },
    })
      .then((res) => setHotels(res.data))
      .finally(() => setLoading(false))
  }, [district, query, minPrice, maxPrice, minStars, sortBy])

  // The "Map of Sri Lanka" navbar link points to /hotels?map=1. If this page
  // is already mounted (e.g. the person just clicked "Explore stays"),
  // React Router updates the URL without remounting the component, so the
  // initial useState read of the "map" param never re-runs. This effect
  // re-checks the param on every URL change so the link works from any page.
  useEffect(() => {
    if (searchParams.get('map') === '1') {
      setShowMap(true)
    }
  }, [searchParams])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <SearchBar initial={{ district, query }} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-600 text-sm">
          {loading ? 'Searching...' : `${hotels.length} propert${hotels.length === 1 ? 'y' : 'ies'} found`}
          {district !== 'all' ? ` in ${district}` : ' across Sri Lanka'}
        </p>
        <div className="flex items-center gap-2">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field text-sm py-2 w-44">
            <option value="rating">Top rated</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="stars">Star rating</option>
          </select>
          <button
            onClick={() => setShowMap((v) => !v)}
            className={
              showMap
                ? 'bg-primary text-white border border-primary font-semibold px-5 py-2 rounded-lg text-sm transition-colors duration-150'
                : 'btn-outline text-sm py-2'
            }
          >
            {showMap ? 'Hide map' : 'Show map'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <div className="card p-4 sticky top-20">
            <h3 className="font-semibold mb-3">Filter by</h3>
            <div className="mb-4">
              <label className="text-xs text-slate-400 mb-1 block">Min stars</label>
              <select value={minStars} onChange={(e) => setMinStars(e.target.value)} className="input-field text-sm">
                <option value="">Any</option>
                <option value="3">3+ stars</option>
                <option value="4">4+ stars</option>
                <option value="5">5 stars</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="text-xs text-slate-400 mb-1 block">Price range (Rs / night)</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="input-field text-sm" />
                <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="input-field text-sm" />
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3">
          {showMap && (
            <div className="mb-6">
              <SriLankaMap hotels={hotels} height="420px" />
            </div>
          )}
          {loading ? (
            <Loader />
          ) : hotels.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <p className="text-4xl mb-3">🔍</p>
              <p>No properties match your search. Try widening your filters.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}