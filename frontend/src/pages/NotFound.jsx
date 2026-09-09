import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto text-center py-24 px-4">
      <p className="text-6xl mb-4">🧭</p>
      <h1 className="text-2xl font-display font-bold mb-2">Page not found</h1>
      <p className="text-slate-500 mb-6">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn-primary">Back to home</Link>
    </div>
  )
}
