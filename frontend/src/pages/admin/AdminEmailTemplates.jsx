import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'

const LABELS = {
  GUEST: 'Guest (booking confirmation)',
  HOTEL_OWNER: 'Hotel owner (new booking alert)',
  REGION_ADMIN: 'Region admin (new booking in their district)',
  ADMIN: 'Super admin (new booking alert)',
}

const PLACEHOLDERS = ['guestName', 'guestEmail', 'hotelName', 'roomType', 'checkIn', 'checkOut', 'totalPrice', 'bookingReference', 'district', 'ownerName', 'siteName']

function TemplateEditor({ template, onSaved }) {
  const [subject, setSubject] = useState(template.subject)
  const [body, setBody] = useState(template.body)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const { data } = await api.put(`/admin/email-templates/${template.recipientType}`, { subject, body })
      onSaved(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this template.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-5">
      <h3 className="font-semibold mb-3">{LABELS[template.recipientType] || template.recipientType}</h3>

      <label className="text-xs text-slate-400 mb-1 block">Subject line</label>
      <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field mb-3" />

      <label className="text-xs text-slate-400 mb-1 block">Email body (HTML allowed)</label>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} className="input-field font-mono text-sm mb-2" />

      <p className="text-xs text-slate-400 mb-3">
        Available placeholders: {PLACEHOLDERS.map((p) => `{{${p}}}`).join(', ')}
        {template.recipientType === 'REGION_ADMIN' && ', {{recipientName}}'}
      </p>

      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
        {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save template'}
      </button>
    </div>
  )
}

export default function AdminEmailTemplates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    api.get('/admin/email-templates').then((res) => setTemplates(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function handleSaved(updated) {
    setTemplates((cur) => cur.map((t) => t.recipientType === updated.recipientType ? updated : t))
  }

  if (loading) return <Loader />

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/admin" className="text-primary text-sm hover:underline">← Back to dashboard</Link>
      <h1 className="font-display font-bold text-2xl mt-2 mb-1">Booking email notifications</h1>
      <p className="text-slate-500 text-sm mb-6">
        Whenever a guest completes a booking, four emails go out automatically: to the guest (confirmation), the
        hotel owner (new booking alert), any region admin assigned to that hotel's district, and the super admin.
        Customize the wording for each below.
      </p>

      <div className="space-y-6">
        {templates.map((t) => (
          <TemplateEditor key={t.recipientType} template={t} onSaved={handleSaved} />
        ))}
      </div>
    </div>
  )
}