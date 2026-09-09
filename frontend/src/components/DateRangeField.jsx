import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

/**
 * excludeDateIntervals: optional array of { start: Date, end: Date } —
 * fully-booked ranges (from the availability API) that get greyed out and
 * made unselectable in both calendars, so a guest can see at a glance which
 * dates are unavailable before they even try to submit a booking.
 */
export default function DateRangeField({ checkIn, checkOut, onChange, minDate, excludeDateIntervals }) {
  const [start, end] = [checkIn, checkOut]

  return (
    <div className="grid grid-cols-2 gap-2 w-full">
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Check-in</label>
        <DatePicker
          selected={start}
          onChange={(date) => onChange(date, end && end > date ? end : null)}
          selectsStart
          startDate={start}
          endDate={end}
          minDate={minDate || new Date()}
          excludeDateIntervals={excludeDateIntervals}
          dateFormat="d MMM yyyy"
          className="input-field"
          placeholderText="Add date"
        />
      </div>
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Check-out</label>
        <DatePicker
          selected={end}
          onChange={(date) => onChange(start, date)}
          selectsEnd
          startDate={start}
          endDate={end}
          minDate={start || new Date()}
          excludeDateIntervals={excludeDateIntervals}
          dateFormat="d MMM yyyy"
          className="input-field"
          placeholderText="Add date"
        />
      </div>
    </div>
  )
}
