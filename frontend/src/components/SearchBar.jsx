import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import api from '../api/client.js'

const PinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
    <path d="M12 22s7-7.14 7-12A7 7 0 0 0 5 10c0 4.86 7 12 7 12Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)
const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </svg>
)
const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
    <circle cx="9" cy="8" r="3.2" />
    <path d="M2.5 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" />
    <path d="M16.5 8.2a3 3 0 1 1 0 5.9M21 20c0-2.7-2-5-4.8-5.7" />
  </svg>
)
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

export default function SearchBar({ initial = {} }) {
  const navigate = useNavigate()
  const [districts, setDistricts] = useState([])
  const [query, setQuery] = useState(initial.query || '')
  const [district, setDistrict] = useState(initial.district || 'all')
  const [checkIn, setCheckIn] = useState(initial.checkIn ? new Date(initial.checkIn) : null)
  const [checkOut, setCheckOut] = useState(initial.checkOut ? new Date(initial.checkOut) : null)
  const [guests, setGuests] = useState(initial.guests || 2)

  useEffect(() => {
    api.get('/meta/districts').then((res) => setDistricts(res.data)).catch(() => {})
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('query', query)
    if (district && district !== 'all') params.set('district', district)
    if (checkIn) params.set('checkIn', checkIn.toISOString().slice(0, 10))
    if (checkOut) params.set('checkOut', checkOut.toISOString().slice(0, 10))
    params.set('guests', guests)
    navigate(`/hotels?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-2xl shadow-cardHover p-2 flex flex-col md:flex-row items-stretch md:items-center gap-1 md:gap-0"
    >
      {/* Location */}
      <div className="flex-1 min-w-0 flex items-center gap-2 px-4 py-2.5 md:border-r md:border-slate-200">
        <span className="text-primary"><PinIcon /></span>
        <div className="flex-1 min-w-0">
          <label className="block mb-0.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Where in Sri Lanka?</label>
          <div className="flex items-center gap-1.5">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-800 focus:outline-none shrink-0 max-w-[110px]"
            >
              <option value="all">All districts</option>
              {districts.map((d) => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
            <span className="text-slate-300">·</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hotel, city, or landmark"
              className="flex-1 min-w-0 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Check-in */}
      <div className="flex items-center gap-2 px-4 py-2.5 md:border-r md:border-slate-200">
        <span className="text-primary"><CalendarIcon /></span>
        <div>
          <label className="block mb-0.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Check-in</label>
          <DatePicker
            selected={checkIn}
            onChange={(date) => { setCheckIn(date); if (checkOut && checkOut <= date) setCheckOut(null) }}
            selectsStart
            startDate={checkIn}
            endDate={checkOut}
            minDate={new Date()}
            dateFormat="d MMM yyyy"
            placeholderText="Add date"
            className="block bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none w-28 cursor-pointer"
          />
        </div>
      </div>

      {/* Check-out */}
      <div className="flex items-center gap-2 px-4 py-2.5 md:border-r md:border-slate-200">
        <span className="text-primary"><CalendarIcon /></span>
        <div>
          <label className="block mb-0.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Check-out</label>
          <DatePicker
            selected={checkOut}
            onChange={(date) => setCheckOut(date)}
            selectsEnd
            startDate={checkIn}
            endDate={checkOut}
            minDate={checkIn || new Date()}
            dateFormat="d MMM yyyy"
            placeholderText="Add date"
            className="block bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none w-28 cursor-pointer"
          />
        </div>
      </div>

      {/* Guests */}
      <div className="flex items-center gap-2 px-4 py-2.5 md:border-r md:border-slate-200">
        <span className="text-primary"><UsersIcon /></span>
        <div>
          <label className="block mb-0.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Guests</label>
          <input
            type="number"
            min={1}
            max={20}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="block bg-transparent text-sm font-medium text-slate-800 focus:outline-none w-14"
          />
        </div>
      </div>

      {/* Search button */}
      <button
        type="submit"
        className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-primary-dark font-bold px-6 py-3.5 md:py-3 rounded-xl transition-colors duration-150 md:ml-1"
      >
        <SearchIcon />
        Search
      </button>
    </form>
  )
}