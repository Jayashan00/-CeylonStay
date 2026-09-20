import React, { useRef, useState } from 'react'
import api from '../api/client.js'

/**
 * Multi-image upload with a thumbnail grid: used for hotel property photos
 * and room photos. Value is an array of hosted image URLs; onChange
 * receives the updated array after each upload or removal.
 */
export default function MultiImageUpload({ images = [], onChange, label = 'Photos' }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFilesSelect(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setError('')
    setUploading(true)

    try {
      const uploadedUrls = []
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        const { data } = await api.post('/uploads.php', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        uploadedUrls.push(data.url)
      }
      onChange([...images, ...uploadedUrls])
    } catch (err) {
      setError(err.response?.data?.message || 'One or more uploads failed. Please try again.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function removeAt(index) {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div>
      {label && <label className="text-sm font-medium mb-2 block">{label}</label>}

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
        {images.map((url, i) => (
          <div key={url + i} className="relative group aspect-video rounded-lg overflow-hidden border border-slate-200">
            <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              title="Remove photo"
            >
              ✕
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 bg-primary text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                Cover
              </span>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="aspect-video rounded-lg border-2 border-dashed border-slate-300 hover:border-primary hover:text-primary text-slate-400 flex flex-col items-center justify-center text-xs gap-1 transition"
        >
          <span className="text-xl">{uploading ? '⏳' : '+'}</span>
          {uploading ? 'Uploading...' : 'Add photos'}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        onChange={handleFilesSelect}
        className="hidden"
      />

      <p className="text-xs text-slate-400">The first photo is used as the cover image.</p>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  )
}