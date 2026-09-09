import React from 'react'

export default function StarRating({ stars = 0, size = 'text-sm' }) {
  return (
    <span className={`text-accent-dark ${size}`} title={`${stars} star property`}>
      {'★'.repeat(stars)}
      <span className="text-slate-300">{'★'.repeat(Math.max(0, 5 - stars))}</span>
    </span>
  )
}
