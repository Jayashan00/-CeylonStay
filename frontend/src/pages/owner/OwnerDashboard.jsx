import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import StarRating from '../../components/StarRating.jsx'

const STATUS_STYLES = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  SUSPENDED: 'bg-slate-200 text-slate-600',
}

export default function OwnerDashboard() {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)

  function load() {
    setLoading(true)
    api.get('/owner/hotels').then((res) => setHotels(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function confirmDelete() {
    await api.delete(`/owner/hotels/${deleteTarget}`)
    setDeleteTarget(null)
    load()
  }

  if (loading) return <Loader />

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl">Your properties</h1>
          <p className="text-slate-500 text-sm">Manage listings, rooms, facilities and bookings</p>
        </div>
        <div className="flex gap-2">
          <Link to="/owner/bookings" className="btn-outline">View all bookings</Link>
          <Link to="/owner/hotels/new" className="btn-accent">+ Add new property</Link>
        </div>
      </div>

      {hotels.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">
          <p className="text-4xl mb-3">🏨</p>
          <p className="mb-4">You haven't listed any properties yet.</p>
          <Link to="/owner/hotels/new" className="btn-primary">List your first property</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {hotels.map((h) => (
            <div key={h.id} className="card p-4 flex flex-col sm:flex-row gap-4">
              <img src={h.images?.[0]} alt={h.name} className="w-full sm:w-48 h-32 object-cover rounded-lg" />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-semibold text-lg">{h.name}</p>
                    <div className="flex items-center gap-2">
                      <StarRating stars={h.starRating} />
                      <span className="text-sm text-slate-400">{h.city}, {h.district}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[h.status]}`}>{h.status}</span>
                </div>
                <p className="text-sm text-slate-500 mt-1">From Rs {h.lowestPrice?.toLocaleString() || 0} / night · {h.reviewCount} reviews</p>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Link to={`/owner/hotels/${h.id}/edit`} className="btn-outline text-sm py-1.5 px-3">Edit details</Link>
                  <Link to={`/owner/hotels/${h.id}/rooms`} className="btn-outline text-sm py-1.5 px-3">Manage rooms</Link>
                  <button onClick={() => setDeleteTarget(h.id)} className="text-sm py-1.5 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this property?"
        message="This will remove the property and all its rooms permanently. This cannot be undone."
        confirmLabel="Delete property"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
