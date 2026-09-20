import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editRating, setEditRating] = useState(10)
  const [editComment, setEditComment] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    api.get('/admin/reviews').then((res) => {
      setReviews(res.data.reviews)
      setStats(res.data.stats)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function startEdit(r) {
    setEditingId(r.id)
    setEditRating(r.rating)
    setEditComment(r.comment || '')
  }

  async function saveEdit(id) {
    setError('')
    try {
      await api.put(`/admin/reviews/${id}`, { rating: editRating, comment: editComment })
      setEditingId(null)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save changes.')
    }
  }

  async function confirmDelete() {
    await api.delete(`/admin/reviews/${deleteTarget}`)
    setDeleteTarget(null)
    load()
  }

  if (loading) return <Loader />

  const maxCount = Math.max(1, ...(stats?.ratingDistribution || []).map((d) => d.c))

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link to="/admin" className="text-primary text-sm hover:underline">← Back to dashboard</Link>
      <h1 className="font-display font-bold text-2xl mt-2 mb-6">Reviews</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="card p-5">
          <p className="text-3xl font-bold text-primary">{stats.totalReviews}</p>
          <p className="text-sm text-slate-500">Total reviews across all properties</p>
        </div>
        <div className="card p-5">
          <p className="text-3xl font-bold text-primary">{stats.averageRating || '—'}<span className="text-lg text-slate-400">/10</span></p>
          <p className="text-sm text-slate-500">Site-wide average rating</p>
        </div>
      </div>

      {stats.ratingDistribution.length > 0 && (
        <div className="card p-5 mb-8">
          <h2 className="font-semibold mb-3 text-sm">Rating distribution</h2>
          <div className="space-y-1.5">
            {stats.ratingDistribution.map((d) => (
              <div key={d.rating} className="flex items-center gap-2 text-xs">
                <span className="w-8 text-slate-500">{d.rating}/10</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${(d.c / maxCount) * 100}%` }} />
                </div>
                <span className="w-6 text-right text-slate-400">{d.c}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <h2 className="font-semibold mb-3">All reviews ({reviews.length})</h2>
      {reviews.length === 0 ? (
        <p className="text-slate-500 card p-6 text-center">No reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-medium text-sm">{r.hotelName}</p>
                  <p className="text-xs text-slate-400">{r.guestName} · {new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="bg-primary text-white text-xs font-bold rounded px-2 py-1 flex-shrink-0">{r.rating}/10</span>
              </div>

              {editingId === r.id ? (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-400">Rating:</label>
                    <input type="number" min={1} max={10} value={editRating} onChange={(e) => setEditRating(Number(e.target.value))} className="input-field text-sm w-20" />
                  </div>
                  <textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} rows={3} className="input-field text-sm" />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(r.id)} className="btn-primary text-xs px-3 py-1.5">Save</button>
                    <button onClick={() => setEditingId(null)} className="btn-outline text-xs px-3 py-1.5">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-600 mt-2">{r.comment || <span className="italic text-slate-400">No written comment.</span>}</p>
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => startEdit(r)} className="text-xs text-primary hover:underline">Edit</button>
                    <button onClick={() => setDeleteTarget(r.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this review?"
        message="This can't be undone. The hotel's rating will be recalculated automatically."
        confirmLabel="Delete review"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}