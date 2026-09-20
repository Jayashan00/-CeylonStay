import React from 'react'
import { Link } from 'react-router-dom'
import StarRating from './StarRating.jsx'
import ScoreBadge from './ScoreBadge.jsx'

export default function HotelCard({ hotel }) {
  return (
    <Link to={`/hotels/${hotel.slug || hotel.id}`} className="card flex flex-col sm:flex-row overflow-hidden group">
      <div className="sm:w-72 h-56 sm:h-auto overflow-hidden shrink-0">
        <img
          src={hotel.images?.[0]}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-semibold text-lg text-primary group-hover:underline">{hotel.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <StarRating stars={hotel.starRating} />
                <span className="text-xs text-slate-400">{hotel.propertyType}</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">{hotel.city}, {hotel.district}</p>
            </div>
            <ScoreBadge score={hotel.averageRating} reviewCount={hotel.reviewCount} />
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {(hotel.facilities || []).slice(0, 4).map((f) => (
              <span key={f} className="chip text-xs py-1 px-2.5">{f}</span>
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between mt-4 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">Free cancellation on most rooms</p>
          <div className="text-right">
            <p className="text-xs text-slate-400">Starting from</p>
            <p className="text-primary font-extrabold text-xl">Rs {hotel.lowestPrice?.toLocaleString()}</p>
            <p className="text-xs text-slate-400">per night</p>
          </div>
        </div>
      </div>
    </Link>
  )
}