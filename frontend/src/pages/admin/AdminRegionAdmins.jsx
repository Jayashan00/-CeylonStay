import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'

export default function AdminRegionAdmins() {
  const [regionAdmins, setRegionAdmins] = useState([])
  const [districtOptions, setDistrictOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [email, setEmail] = useState('')
  const [selectedDistricts, setSelectedDistricts] = useState([])
  const [adding, setAdding] = useState(false)

  const [removeTarget, setRemoveTarget] = useState(null)

  function load() {
    setLoading(true)
    Promise.all([
      api.get('/admin/region-admins'),
      api.get('/meta/districts'),
    ]).then(([ra, d]) => {
      setRegionAdmins(ra.data)
      setDistrictOptions(d.data.map((x) => x.name))
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function toggleNewDistrict(district) {
    setSelectedDistricts((cur) => cur.includes(district) ? cur.filter((d) => d !== district) : [...cur, district])
  }

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Enter the email of an existing registered user.'); return }
    if (selectedDistricts.length === 0) { setError('Pick at least one district for them to manage.'); return }
    setAdding(true)
    try {
      await api.post('/admin/region-admins', { email: email.trim(), districts: selectedDistricts })
      setEmail('')
      setSelectedDistricts([])
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add this region admin.')
    } finally {
      setAdding(false)
    }
  }

  async function addDistrictTo(userId, district) {
    if (!district) return
    await api.post(`/admin/region-admins/${userId}/districts`, { district })
    load()
  }

  async function removeDistrictFrom(userId, district) {
    await api.delete(`/admin/region-admins/${userId}/districts/${encodeURIComponent(district)}`)
    load()
  }

  async function confirmRemoveAdmin() {
    await api.delete(`/admin/region-admins/${removeTarget}`)
    setRemoveTarget(null)
    load()
  }

  if (loading) return <Loader />

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link to="/admin" className="text-primary text-sm hover:underline">← Back to dashboard</Link>
      <h1 className="font-display font-bold text-2xl mt-2 mb-1">Region admins</h1>
      <p className="text-slate-500 text-sm mb-6">
        Give someone approval/moderation power over hotels in specific districts only — without making them a full
        super admin. They can approve, reject, suspend or delete hotels and view bookings in their assigned
        district(s), but can't manage users, site settings, or hotels outside those districts.
      </p>

      <div className="card p-5 mb-8">
        <h2 className="font-semibold mb-3">Add a region admin</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Email of an existing registered user</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. someone@example.com" className="input-field"
            />
            <p className="text-xs text-slate-400 mt-1">They must already have an account on the site (any role) — this upgrades their existing account.</p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">District(s) they'll manage</label>
            <div className="flex flex-wrap gap-2">
              {districtOptions.map((d) => (
                <button
                  type="button" key={d} onClick={() => toggleNewDistrict(d)}
                  className={`text-sm px-3 py-1.5 rounded-full border ${selectedDistricts.includes(d) ? 'bg-primary text-white border-primary' : 'border-slate-300 text-slate-600'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button disabled={adding} className="btn-primary">{adding ? 'Adding...' : 'Make region admin'}</button>
        </form>
      </div>

      <h2 className="font-semibold mb-3">Current region admins ({regionAdmins.length})</h2>
      {regionAdmins.length === 0 ? (
        <p className="text-slate-500 card p-6 text-center">No region admins yet.</p>
      ) : (
        <div className="space-y-3">
          {regionAdmins.map((ra) => (
            <div key={ra.id} className="card p-4">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <p className="font-semibold">{ra.fullName}</p>
                  <p className="text-sm text-slate-500">{ra.email}</p>
                </div>
                <button onClick={() => setRemoveTarget(ra.id)} className="text-sm text-red-600 hover:underline">Remove region admin role</button>
              </div>

              <div className="mt-3">
                <p className="text-xs text-slate-400 mb-1.5">Manages:</p>
                <div className="flex flex-wrap gap-2">
                  {ra.districts.map((d) => (
                    <span key={d} className="chip text-xs py-1 px-2.5 flex items-center gap-1.5">
                      {d}
                      <button onClick={() => removeDistrictFrom(ra.id, d)} className="text-slate-400 hover:text-red-600" title="Remove this district">×</button>
                    </span>
                  ))}
                  {ra.districts.length === 0 && <span className="text-xs text-slate-400 italic">No districts assigned yet — they can't manage anything until you add one.</span>}
                </div>
                <select
                  onChange={(e) => { addDistrictTo(ra.id, e.target.value); e.target.value = '' }}
                  value=""
                  className="input-field text-sm mt-2 w-56"
                >
                  <option value="">+ Add a district...</option>
                  {districtOptions.filter((d) => !ra.districts.includes(d)).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!removeTarget}
        title="Remove region admin role?"
        message="This user goes back to a regular guest account and loses access to all admin functions."
        confirmLabel="Remove role"
        danger
        onConfirm={confirmRemoveAdmin}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  )
}