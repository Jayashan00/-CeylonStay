import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'
import ImageUploadField from '../../components/ImageUploadField.jsx'
import { useSiteSettings } from '../../context/SiteSettingsContext.jsx'

export default function AdminSettings() {
  const { refresh } = useSiteSettings()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    siteName: '', tagline: '', logoUrl: '', faviconUrl: '', heroImageUrl: '',
    primaryColor: '#003580', accentColor: '#febb02',
    contactEmail: '', contactPhone: '', footerAbout: '', currencySymbol: 'Rs',
  })

  useEffect(() => {
    api.get('/settings').then((res) => setForm(res.data)).finally(() => setLoading(false))
  }, [])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setSuccess(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await api.put('/admin/settings', form)
      await refresh() // re-applies the new branding/colors across the whole site immediately
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/admin" className="text-primary text-sm hover:underline">← Back to dashboard</Link>
      <h1 className="font-display font-bold text-2xl mt-2 mb-1">Site settings</h1>
      <p className="text-slate-500 text-sm mb-6">
        Customize the site name, logo, colors and contact details shown across the whole platform.
      </p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <section>
          <h2 className="font-semibold mb-3">Branding</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Site name</label>
              <input required value={form.siteName} onChange={(e) => update('siteName', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tagline (shown in the homepage hero)</label>
              <input value={form.tagline} onChange={(e) => update('tagline', e.target.value)} className="input-field" />
            </div>
            <div>
              <ImageUploadField label="Logo" value={form.logoUrl} onChange={(url) => update('logoUrl', url)} previewClassName="h-8 object-contain" />
              <p className="text-xs text-slate-400 mt-1">Leave empty to use the default 🏝️ icon.</p>
            </div>
            <div>
              <ImageUploadField label="Favicon" value={form.faviconUrl} onChange={(url) => update('faviconUrl', url)} previewClassName="h-8 w-8 object-contain" />
            </div>
            <div>
              <ImageUploadField label="Homepage hero image" value={form.heroImageUrl} onChange={(url) => update('heroImageUrl', url)} previewClassName="h-16 w-28 object-cover rounded" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-semibold mb-3">Theme colors</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Primary color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} className="w-12 h-10 rounded border border-slate-300" />
                <input value={form.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} className="input-field" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Used for the navbar, buttons and links site-wide.</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Accent color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.accentColor} onChange={(e) => update('accentColor', e.target.value)} className="w-12 h-10 rounded border border-slate-300" />
                <input value={form.accentColor} onChange={(e) => update('accentColor', e.target.value)} className="input-field" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Used for highlights like the Search button.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-semibold mb-3">Contact & footer</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Contact email</label>
              <input type="email" value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Contact phone</label>
              <input value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} className="input-field" />
            </div>
          </div>
          <div className="mt-3">
            <label className="text-sm font-medium mb-1 block">Footer "about" text</label>
            <textarea rows={2} value={form.footerAbout} onChange={(e) => update('footerAbout', e.target.value)} className="input-field" />
          </div>
          <div className="mt-3">
            <label className="text-sm font-medium mb-1 block">Currency symbol</label>
            <input value={form.currencySymbol} onChange={(e) => update('currencySymbol', e.target.value)} className="input-field w-32" />
            <p className="text-xs text-slate-400 mt-1">
              Currently for display reference only — prices elsewhere in the app are shown with "Rs" hardcoded; see README for wiring this up everywhere.
            </p>
          </div>
        </section>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">Settings saved — the new branding is now live across the site.</p>}

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save settings'}</button>
        </div>
      </form>
    </div>
  )
}