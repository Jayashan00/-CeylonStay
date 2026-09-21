import React, { useState } from 'react'

export default function ShareButton({ hotel, className = '' }) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/hotels/${hotel.slug || hotel.id}`
  const text = `Check out ${hotel.name} on Official Direct Booking Platform`

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: hotel.name, text, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {}
  }

  function open(network) {
    const encodedUrl = encodeURIComponent(url)
    const encodedText = encodeURIComponent(text)
    const targets = {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      email: `mailto:?subject=${encodeURIComponent(hotel.name)}&body=${encodedText}%0A${encodedUrl}`,
    }
    window.open(targets[network], '_blank', 'noopener,noreferrer,width=700,height=650')
  }

  return (
    <div className="relative group">
      <button type="button" onClick={share} className={className || 'btn-outline text-sm py-2 px-3'}>
        ↗ {copied ? 'Link copied' : 'Share'}
      </button>
      <div className="hidden group-hover:flex absolute right-0 top-full mt-2 z-40 bg-white rounded-xl shadow-cardHover border border-slate-100 p-2 gap-1 min-w-max">
        <button onClick={() => open('whatsapp')} className="px-3 py-2 text-xs font-semibold hover:bg-slate-50 rounded-lg">WhatsApp</button>
        <button onClick={() => open('facebook')} className="px-3 py-2 text-xs font-semibold hover:bg-slate-50 rounded-lg">Facebook</button>
        <button onClick={() => open('x')} className="px-3 py-2 text-xs font-semibold hover:bg-slate-50 rounded-lg">X</button>
        <button onClick={() => open('email')} className="px-3 py-2 text-xs font-semibold hover:bg-slate-50 rounded-lg">Email</button>
      </div>
    </div>
  )
}