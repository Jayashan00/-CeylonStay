import React from 'react'

const STEPS = ['Check availability', 'Your details', 'Review & confirm']

export default function BookingStepper({ current }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((label, i) => {
        const step = i + 1
        const isDone = step < current
        const isActive = step === current
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                isDone ? 'bg-green-600 text-white' : isActive ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {isDone ? '✓' : step}
              </div>
              <span className={`text-sm hidden sm:inline ${isActive ? 'font-semibold text-slate-800' : 'text-slate-400'}`}>{label}</span>
            </div>
            {step < STEPS.length && <div className={`flex-1 h-0.5 ${isDone ? 'bg-green-600' : 'bg-slate-200'}`} />}
          </React.Fragment>
        )
      })}
    </div>
  )
}