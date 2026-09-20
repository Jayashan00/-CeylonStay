import React, { useRef, useState } from 'react'
import api from '../api/client.js'

/**
 * A single-image upload control: click to pick a file, it uploads
 * immediately and calls onChange(url) with the resulting hosted URL.
 * Used for the logo, favicon, and hero image on Admin > Site settings.
 */
export default function ImageUploadField({ label, value, onChange, previewClassName = 'h-16 object-contain' }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await api.post('/uploads.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onChange(data.url)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try a different image.')
    } finally {
      setUploading(false)
      e.target.value = '' // allow re-selecting the same file
    }
  }

  return (
    <div>
      {label && <label className="text-sm font-medium mb-1 block">{label}</label>}

      <div className="flex items-center gap-3">
        {value ? (
          <div className="bg-primary rounded-lg p-3 inline-flex items-center">
            <img src={value} alt="Preview" className={previewClassName} />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-300 text-2xl">
            🖼️
          </div>
        )}

        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="btn-outline text-sm py-1.5 px-3"
          >
            {uploading ? 'Uploading...' : value ? 'Replace image' : 'Upload image'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-xs text-red-600 hover:underline text-left"
            >
              Remove
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  )
}