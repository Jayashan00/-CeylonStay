import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/client.js'
import FacilityChecklist from '../../components/FacilityChecklist.jsx'
import MultiImageUpload from '../../components/MultiImageUpload.jsx'
import Loader from '../../components/Loader.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'

const emptyForm = {
  roomType: '', description: '', pricePerNight: '', maxOccupancy: 2, totalUnits: 1,
  facilities: [], images: [], breakfastIncluded: false, freeCancellation: true,
}

export default function OwnerHotelRooms() {
  const { id } = useParams()
  const [hotel, setHotel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [roomFacilityMaster, setRoomFacilityMaster] = useState([])

  const [showForm, setShowForm] = useState(false)
  const [editingRoomId, setEditingRoomId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  function load() {
    setLoading(true)
    Promise.all([
      api.get(`/hotels/${id}`),
      api.get(`/hotels/${id}/rooms`),
    ]).then(([h, r]) => { setHotel(h.data); setRooms(r.data) }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])
  useEffect(() => { api.get('/meta/room-facilities').then((res) => setRoomFacilityMaster(res.data)) }, [])

  function openAdd() {
    setForm(emptyForm)
    setEditingRoomId(null)
    setShowForm(true)
    setError('')
  }

  function openEdit(room) {
    setForm({
      roomType: room.roomType, description: room.description || '',
      pricePerNight: room.pricePerNight, maxOccupancy: room.maxOccupancy, totalUnits: room.totalUnits,
      facilities: room.facilities || [], images: room.images || [],
      breakfastIncluded: room.breakfastIncluded, freeCancellation: room.freeCancellation,
    })
    setEditingRoomId(room.id)
    setShowForm(true)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      roomType: form.roomType,
      description: form.description,
      pricePerNight: Number(form.pricePerNight),
      maxOccupancy: Number(form.maxOccupancy),
      totalUnits: Number(form.totalUnits),
      facilities: form.facilities,
      images: form.images,
      breakfastIncluded: form.breakfastIncluded,
      freeCancellation: form.freeCancellation,
    }
    try {
      if (editingRoomId) {
        await api.put(`/owner/rooms/${editingRoomId}`, payload)
      } else {
        await api.post(`/owner/hotels/${id}/rooms`, payload)
      }
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save room.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    await api.delete(`/owner/rooms/${deleteTarget}`)
    setDeleteTarget(null)
    load()
  }

  if (loading) return <Loader />

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link to="/owner/properties" className="text-primary text-sm hover:underline">← Back to properties</Link>
      <div className="flex items-center justify-between mt-2 mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl">{hotel?.name} — Rooms</h1>
          <p className="text-slate-500 text-sm">Add room types, prices and in-room facilities</p>
        </div>
        <button onClick={openAdd} className="btn-accent">+ Add room type</button>
      </div>

      {rooms.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">
          <p className="mb-4">No room types added yet. Guests can't book until you add at least one.</p>
          <button onClick={openAdd} className="btn-primary">Add your first room type</button>
        </div>
      ) : (
        <div className="grid gap-3">
          {rooms.map((room) => (
            <div key={room.id} className="card p-4 flex flex-col sm:flex-row justify-between gap-3">
              <div>
                <p className="font-semibold">{room.roomType}</p>
                <p className="text-sm text-slate-500">Sleeps {room.maxOccupancy} · {room.totalUnits} unit(s) · Rs {room.pricePerNight.toLocaleString()}/night</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(room.facilities || []).slice(0, 5).map((f) => <span key={f} className="chip text-xs py-1 px-2">{f}</span>)}
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <Link to={`/owner/rooms/${room.id}/calendar`} className="btn-outline text-sm py-1.5 px-3">Calendar</Link>
                <button onClick={() => openEdit(room)} className="btn-outline text-sm py-1.5 px-3">Edit</button>
                <button onClick={() => setDeleteTarget(room.id)} className="text-sm py-1.5 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-[1000] overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-cardHover max-w-lg w-full p-6 my-8 mx-auto space-y-4">
            <h3 className="font-display font-semibold text-lg">{editingRoomId ? 'Edit room type' : 'Add room type'}</h3>

            <input required placeholder="Room type (e.g. Deluxe Double)" value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })} className="input-field" />
            <textarea placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" />

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Price / night (Rs)</label>
                <input required type="number" min={0} value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Max occupancy</label>
                <input required type="number" min={1} value={form.maxOccupancy} onChange={(e) => setForm({ ...form, maxOccupancy: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Units available</label>
                <input required type="number" min={1} value={form.totalUnits} onChange={(e) => setForm({ ...form, totalUnits: e.target.value })} className="input-field" />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-2 block">Room facilities</label>
              <FacilityChecklist masterList={roomFacilityMaster} selected={form.facilities} onChange={(f) => setForm({ ...form, facilities: f })} />
            </div>

            <MultiImageUpload images={form.images} onChange={(imgs) => setForm({ ...form, images: imgs })} label="Room photos" />

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.breakfastIncluded} onChange={(e) => setForm({ ...form, breakfastIncluded: e.target.checked })} className="accent-primary w-4 h-4" />
                Breakfast included
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.freeCancellation} onChange={(e) => setForm({ ...form, freeCancellation: e.target.checked })} className="accent-primary w-4 h-4" />
                Free cancellation
              </label>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save room'}</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this room type?"
        message="Guests will no longer be able to book this room type."
        confirmLabel="Delete room"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}