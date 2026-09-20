import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { toLocalDateString, parseLocalDate } from '../../utils/dateUtils.js'

const emptyForm = { checkIn: null, checkOut: null, unitsBlocked: 1, reason: '' }
const emptyChannelForm = { channelName: 'Booking.com', icalUrl: '' }

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
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  // --- Channel sync (Booking.com / Trip.lk / etc) state ---
  const [exportUrl, setExportUrl] = useState('')
  const [channels, setChannels] = useState([])
  const [channelForm, setChannelForm] = useState(emptyChannelForm)
  const [channelSaving, setChannelSaving] = useState(false)
  const [channelError, setChannelError] = useState('')
  const [copied, setCopied] = useState(false)
  const [syncingId, setSyncingId] = useState(null)

  useEffect(() => {
    function handleResize() { setIsMobile(window.innerWidth < 640) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  function loadChannels() {
    api.get(`/owner/rooms/${roomId}/channels`).then((res) => {
      setExportUrl(res.data.exportUrl)
      setChannels(res.data.links)
    })
  }

  useEffect(() => { load(); loadChannels() }, [roomId])

  // Parsed date ranges for calendar coloring — half-open [checkIn, checkOut)
  // matching the same semantics the backend availability engine uses.
  // Uses parseLocalDate (NOT `new Date(str)`) so the highlighted calendar
  // day always matches the actual stored date, regardless of timezone.
  const bookingRanges = useMemo(() => bookings.map((b) => ({
    checkIn: parseLocalDate(b.checkIn), checkOut: parseLocalDate(b.checkOut), label: b.guestFullName,
  })), [bookings])

  const blockRanges = useMemo(() => blocks.map((bl) => ({
    checkIn: parseLocalDate(bl.checkIn), checkOut: parseLocalDate(bl.checkOut), label: bl.reason || 'Blocked',
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
        checkIn: toLocalDateString(form.checkIn),
        checkOut: toLocalDateString(form.checkOut),
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

  async function handleCopyExportUrl() {
    try {
      await navigator.clipboard.writeText(exportUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API can fail on non-HTTPS/local setups — silently ignore, the link is still selectable/visible
    }
  }

  async function handleAddChannel(e) {
    e.preventDefault()
    setChannelError('')
    if (!channelForm.icalUrl.trim()) {
      setChannelError('Paste the iCal export link from that platform first.')
      return
    }
    setChannelSaving(true)
    try {
      await api.post(`/owner/rooms/${roomId}/channels`, channelForm)
      setChannelForm(emptyChannelForm)
      loadChannels()
      load() // refresh blocks so newly-synced dates show up immediately
    } catch (err) {
      setChannelError(err.response?.data?.message || 'Could not connect that calendar. Double-check the link and try again.')
    } finally {
      setChannelSaving(false)
    }
  }

  async function handleSyncNow(linkId) {
    setSyncingId(linkId)
    try {
      await api.post(`/owner/channels/${linkId}/sync-now`)
      loadChannels()
      load()
    } finally {
      setSyncingId(null)
    }
  }

  async function handleDeleteChannel(linkId) {
    await api.delete(`/owner/channels/${linkId}`)
    loadChannels()
    load()
  }

  if (loading) return <Loader />
  if (!room || !hotel) return <p className="text-center py-20">Room not found.</p>

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link to={`/owner/hotels/${hotel.id}/rooms`} className="text-primary text-sm hover:underline">← Back to rooms</Link>
      <h1 className="font-display font-bold text-2xl mt-2 mb-1">{room.roomType} — Availability calendar</h1>
      <p className="text-slate-500 text-sm mb-6">{hotel.name} · {room.totalUnits} unit(s) of this room type</p>

      {/* ---------------- Channel sync (Booking.com / Trip.lk / etc) ---------------- */}
      <div className="card p-4 mb-8 border-2 border-primary/20">
        <h2 className="font-display font-bold text-lg mb-1">Sync with Booking.com, Trip.lk & other sites</h2>
        <p className="text-xs text-slate-500 mb-4">
          Connects this room's calendar to other booking platforms using iCal (the same free method Airbnb and
          Booking.com use for calendar syncing). Once connected: a booking made on that platform blocks the date
          here automatically, and a booking made here shows up on that platform. Syncs run automatically every
          hour, or press "Sync now" for an instant check.
        </p>

        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-600 mb-1 block">
            Step 1 — Give this link to Booking.com / Trip.lk (so THEY see bookings made here)
          </label>
          <div className="flex gap-2">
            <input readOnly value={exportUrl} className="input-field text-xs flex-1" onFocus={(e) => e.target.select()} />
            <button type="button" onClick={handleCopyExportUrl} className="btn-secondary text-xs px-3 whitespace-nowrap">
              {copied ? 'Copied ✓' : 'Copy link'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Paste this into Booking.com Extranet → Rates & Availability → Sync calendars → "Export calendar", or the
            equivalent "import calendar" field on Trip.lk / Airbnb / Agoda.
          </p>
        </div>

        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-600 mb-1 block">
            Step 2 — Paste THEIR calendar link here (so we see bookings made on their site)
          </label>
          <form onSubmit={handleAddChannel} className="flex flex-col sm:flex-row gap-2">
            <select
              value={channelForm.channelName}
              onChange={(e) => setChannelForm({ ...channelForm, channelName: e.target.value })}
              className="input-field text-sm sm:w-40"
            >
              <option>Booking.com</option>
              <option>Trip.lk</option>
              <option>Agoda</option>
              <option>Airbnb</option>
              <option>Other</option>
            </select>
            <input
              value={channelForm.icalUrl}
              onChange={(e) => setChannelForm({ ...channelForm, icalUrl: e.target.value })}
              placeholder="https://admin.booking.com/.../calendar.ics"
              className="input-field text-sm flex-1"
            />
            <button disabled={channelSaving} className="btn-primary text-sm whitespace-nowrap px-4">
              {channelSaving ? 'Connecting...' : 'Connect'}
            </button>
          </form>
          {channelError && <p className="text-red-600 text-xs mt-2">{channelError}</p>}
          <p className="text-[11px] text-slate-400 mt-1">
            On Booking.com this is under Rates & Availability → Sync calendars → "Import calendar" (per room type).
            Trip.lk: ask their support team for your property's iCal export link.
          </p>
        </div>

        {channels.length > 0 && (
          <div className="space-y-2">
            {channels.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-2">
                <div>
                  <span className="font-semibold">{c.channelName}</span>{' '}
                  {c.lastSyncStatus === 'ERROR' ? (
                    <span className="text-red-600">— last sync failed{c.lastSyncError ? `: ${c.lastSyncError}` : ''}</span>
                  ) : c.lastSyncedAt ? (
                    <span className="text-slate-400">— last synced {new Date(c.lastSyncedAt).toLocaleString()}</span>
                  ) : (
                    <span className="text-slate-400">— not synced yet</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleSyncNow(c.id)} disabled={syncingId === c.id} className="text-primary hover:underline">
                    {syncingId === c.id ? 'Syncing...' : 'Sync now'}
                  </button>
                  <button onClick={() => handleDeleteChannel(c.id)} className="text-red-600 hover:underline">Disconnect</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Blocked (manual or synced)</span>
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
                  withPortal={isMobile}
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
                  withPortal={isMobile}
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

          <h2 className="font-display font-bold text-lg mb-3">Blocked dates ({blocks.length})</h2>
          {blocks.length === 0 ? (
            <p className="text-slate-500 card p-4 text-center text-sm">No blocks set.</p>
          ) : (
            <div className="space-y-2">
              {blocks.sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn)).map((bl) => (
                <div key={bl.id} className="card p-3 text-sm flex items-center justify-between">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {bl.reason || 'Blocked'}
                      {bl.source === 'EXTERNAL_SYNC' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          {bl.channelName}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">{bl.checkIn} → {bl.checkOut} · {bl.unitsBlocked} unit(s){bl.createdByName ? ` · by ${bl.createdByName}` : ''}</p>
                  </div>
                  {bl.source === 'EXTERNAL_SYNC' ? (
                    <span className="text-[11px] text-slate-400 italic">synced</span>
                  ) : (
                    <button onClick={() => setDeleteTarget(bl.id)} className="text-xs text-red-600 hover:underline">Remove</button>
                  )}
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