import React from 'react'

function label(score) {
  if (score >= 9) return 'Exceptional'
  if (score >= 8) return 'Excellent'
  if (score >= 7) return 'Very Good'
  if (score >= 6) return 'Good'
  return 'New'
}

export default function ScoreBadge({ score = 0, reviewCount = 0 }) {
  return (
    <div className="flex items-center gap-2 justify-end">
      <div className="text-right">
        <p className="text-sm font-semibold text-slate-700 leading-tight">{label(score)}</p>
        <p className="text-xs text-slate-400 leading-tight">{reviewCount} review{reviewCount === 1 ? '' : 's'}</p>
      </div>
      <div className="bg-primary text-white font-bold rounded-lg px-2.5 py-1.5 text-sm">
        {score > 0 ? score.toFixed(1) : 'New'}
      </div>
    </div>
  )
}
