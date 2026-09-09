import React, { useState } from 'react'

export default function FacilityChecklist({ masterList = [], selected = [], onChange }) {
  const [custom, setCustom] = useState('')

  function toggle(facility) {
    if (selected.includes(facility)) {
      onChange(selected.filter((f) => f !== facility))
    } else {
      onChange([...selected, facility])
    }
  }

  function addCustom() {
    const trimmed = custom.trim()
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed])
      setCustom('')
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
        {masterList.map((facility) => (
          <label key={facility} className="flex items-center gap-2 text-sm bg-slate-50 hover:bg-slate-100 rounded-lg px-3 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(facility)}
              onChange={() => toggle(facility)}
              className="accent-primary w-4 h-4"
            />
            {facility}
          </label>
        ))}
      </div>

      {selected.filter((f) => !masterList.includes(f)).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selected.filter((f) => !masterList.includes(f)).map((f) => (
            <span key={f} className="chip bg-primary/10 text-primary">
              {f}
              <button type="button" onClick={() => toggle(f)} className="ml-1 text-primary/60 hover:text-primary">✕</button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
          placeholder="Add a facility not listed above"
          className="input-field flex-1"
        />
        <button type="button" onClick={addCustom} className="btn-outline whitespace-nowrap">Add</button>
      </div>
    </div>
  )
}
