import React from 'react'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-cardHover max-w-sm w-full p-6">
        <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-outline">Cancel</button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-lg font-semibold text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-dark'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
