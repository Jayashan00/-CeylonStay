import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default function DateRangeField({ checkIn, checkOut, onChange, minDate, excludeDateIntervals, compact = false }) {
  const [isMobile, setIsMobile] = React.useState(() => typeof window !== 'undefined' && window.innerWidth < 768)

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const common = {
    minDate: minDate || new Date(),
    excludeDateIntervals,
    dateFormat: 'd MMM yyyy',
    withPortal: isMobile,
    portalId: isMobile ? undefined : undefined,
    popperClassName: 'ceylon-date-popper',
    calendarClassName: 'ceylon-calendar',
    showPopperArrow: false,
    shouldCloseOnSelect: true,
    isClearable: true,
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 w-full ${compact ? '' : ''}`}>
      <div className="min-w-0">
        <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Check-in</label>
        <DatePicker
          {...common}
          selected={checkIn}
          onChange={(date) => onChange(date, checkOut && date && checkOut > date ? checkOut : null)}
          selectsStart
          startDate={checkIn}
          endDate={checkOut}
          placeholderText="Select date"
          className="input-field w-full cursor-pointer"
        />
      </div>
      <div className="min-w-0">
        <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Check-out</label>
        <DatePicker
          {...common}
          selected={checkOut}
          onChange={(date) => onChange(checkIn, date)}
          selectsEnd
          startDate={checkIn}
          endDate={checkOut}
          minDate={checkIn || common.minDate}
          placeholderText="Select date"
          className="input-field w-full cursor-pointer"
        />
      </div>
    </div>
  )
}
