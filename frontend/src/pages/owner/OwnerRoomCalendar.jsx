import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'

const emptyForm = { checkIn: null, checkOut: null, unitsBlocked: 1, reason: '' }

/** True if `date` falls within [checkIn, checkOut) of any range in `ranges`. */
function isDateInAnyRange(date, ranges) {
  return ranges.some((r) => date >= r.checkIn && date < r.checkOut)
}

export default function OwnerRoomCalendar() {
  const { roomId } = useParams()
  const [room, setRoom] = useState(null)
  const [hotel, setHotel] = useState(null)
  const [bookings, setBookings] = useState([])
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  function load() {
    setLoading(true)
    api.get(`/rooms/${roomId}`).then((res) => {
      setRoom(res.data)
      return Promise.all([
        api.get(`/hotels/${res.data.hotelId}`),
        api.get(`/owner/rooms/${roomId}/bookings`),
        api.get(`/owner/rooms/${roomId}/blocks`),
      ])
    }).then(([h, b, bl]) => {
      setHotel(h.data)
      setBookings(b.data)
      setBlocks(bl.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [roomId])

  // Parsed date ranges for calendar coloring — half-open [checkIn, checkOut)
  // matching the same semantics the backend availability engine uses.
  const bookingRanges = useMemo(() => bookings.map((b) => ({
    checkIn: new Date(b.checkIn), checkOut: new Date(b.checkOut), label: b.guestFullName,
  })), [bookings])

  const blockRanges = useMemo(() => blocks.map((bl) => ({
    checkIn: new Date(bl.checkIn), checkOut: new Date(bl.checkOut), label: bl.reason || 'Blocked',
  })), [blocks])

  function dayClassName(date) {
    if (isDateInAnyRange(date, blockRanges)) return 'day-manually-blocked'
    if (isDateInAnyRange(date, bookingRanges)) return 'day-guest-booked'
    return undefined
  }

  async function handleAddBlock(e) {
    e.preventDefault()
    setError('')
    if (!form.checkIn || !form.checkOut) {
      setError('Please pick a start and end date.')
      return
    }
    setSaving(true)
    try {
      await api.post(`/owner/rooms/${roomId}/blocks`, {
        checkIn: form.checkIn.toISOString().slice(0, 10),
        checkOut: form.checkOut.toISOString().slice(0, 10),
        unitsBlocked: Number(form.unitsBlocked) || 1,
        reason: form.reason,
      })
      setForm(emptyForm)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save block.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    await api.delete(`/owner/blocks/${deleteTarget}`)
    setDeleteTarget(null)
    load()
  }

  if (loading) return <Loader />
  if (!room || !hotel) return <p className="text-center py-20">Room not found.</p>

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link to={`/owner/hotels/${hotel.id}/rooms`} className="text-primary text-sm hover:underline">← Back to rooms</Link>
      <h1 className="font-display font-bold text-2xl mt-2 mb-1">{room.roomType} — Availability calendar</h1>
      <p className="text-slate-500 text-sm mb-6">{hotel.name} · {room.totalUnits} unit(s) of this room type</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="card p-4">
            <DatePicker
              inline
              minDate={new Date()}
              dayClassName={dayClassName}
              onChange={() => {}}
            />
          </div>
          <div className="flex gap-4 mt-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Guest booking</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Manually blocked</span>
          </div>

          <h2 className="font-display font-bold text-lg mt-8 mb-3">Add a manual block</h2>
          <form onSubmit={handleAddBlock} className="card p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Start date</label>
                <DatePicker
                  selected={form.checkIn}
                  onChange={(d) => setForm({ ...form, checkIn: d, checkOut: form.checkOut && form.checkOut > d ? form.checkOut : null })}
                  minDate={new Date()}
                  dateFormat="d MMM yyyy"
                  placeholderText="Add date"
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">End date</label>
                <DatePicker
                  selected={form.checkOut}
                  onChange={(d) => setForm({ ...form, checkOut: d })}
                  minDate={form.checkIn || new Date()}
                  dateFormat="d MMM yyyy"
                  placeholderText="Add date"
                  className="input-field text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Units to block</label>
              <input
                type="number" min={1} max={room.totalUnits}
                value={form.unitsBlocked}
                onChange={(e) => setForm({ ...form, unitsBlocked: e.target.value })}
                className="input-field text-sm w-24"
              />
              <p className="text-[11px] text-slate-400 mt-1">This room type has {room.totalUnits} unit(s) total.</p>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Reason (optional)</label>
              <input
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="e.g. Maintenance, offline booking, owner use"
                className="input-field text-sm"
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Block these dates'}</button>
          </form>
        </div>

        <div>
          <h2 className="font-display font-bold text-lg mb-3">Guest bookings ({bookings.length})</h2>
          {bookings.length === 0 ? (
            <p className="text-slate-500 card p-4 text-center text-sm mb-8">No active bookings for this room.</p>
          ) : (
            <div className="space-y-2 mb-8">
              {bookings.sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn)).map((b) => (
                <div key={b.id} className="card p-3 text-sm flex items-center justify-between">
                  <div>
                    <p className="font-medium">{b.guestFullName}</p>
                    <p className="text-xs text-slate-400">{b.checkIn} → {b.checkOut} · {b.numberOfRooms} unit(s)</p>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{b.status}</span>
                </div>
              ))}
            </div>
          )}

          <h2 className="font-display font-bold text-lg mb-3">Manual blocks ({blocks.length})</h2>
          {blocks.length === 0 ? (
            <p className="text-slate-500 card p-4 text-center text-sm">No manual blocks set.</p>
          ) : (
            <div className="space-y-2">
              {blocks.sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn)).map((bl) => (
                <div key={bl.id} className="card p-3 text-sm flex items-center justify-between">
                  <div>
                    <p className="font-medium">{bl.reason || 'Blocked'}</p>
                    <p className="text-xs text-slate-400">{bl.checkIn} → {bl.checkOut} · {bl.unitsBlocked} unit(s) · by {bl.createdByName}</p>
                  </div>
                  <button onClick={() => setDeleteTarget(bl.id)} className="text-xs text-red-600 hover:underline">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove this block?"
        message="These dates will become bookable by guests again immediately."
        confirmLabel="Remove block"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
