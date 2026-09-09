import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/client.js'
import FacilityChecklist from '../../components/FacilityChecklist.jsx'
import LocationPicker from '../../components/LocationPicker.jsx'
import MultiImageUpload from '../../components/MultiImageUpload.jsx'
import Loader from '../../components/Loader.jsx'

export default function OwnerHotelForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [districts, setDistricts] = useState([])
  const [propertyTypes, setPropertyTypes] = useState([])
  const [facilityMaster, setFacilityMaster] = useState([])

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [propertyType, setPropertyType] = useState('Hotel')
  const [district, setDistrict] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [location, setLocation] = useState(null)
  const [starRating, setStarRating] = useState(3)
  const [facilities, setFacilities] = useState([])
  const [images, setImages] = useState([])
  const [checkInTime, setCheckInTime] = useState('14:00')
  const [checkOutTime, setCheckOutTime] = useState('11:00')
  const [cancellationPolicy, setCancellationPolicy] = useState('Free cancellation up to 48 hours before check-in.')

  useEffect(() => {
    api.get('/meta/districts').then((res) => setDistricts(res.data))
    api.get('/meta/property-types').then((res) => setPropertyTypes(res.data))
    api.get('/meta/hotel-facilities').then((res) => setFacilityMaster(res.data))
  }, [])

  useEffect(() => {
    if (!isEdit) return
    api.get(`/hotels/${id}`).then((res) => {
      const h = res.data
      setName(h.name); setDescription(h.description || ''); setPropertyType(h.propertyType || 'Hotel')
      setDistrict(h.district); setCity(h.city || ''); setAddress(h.address || '')
      setLocation(h.location); setStarRating(h.starRating || 3)
      setFacilities(h.facilities || []); setImages(h.images || [])
      setCheckInTime(h.checkInTime || '14:00'); setCheckOutTime(h.checkOutTime || '11:00')
      setCancellationPolicy(h.cancellationPolicy || '')
    }).finally(() => setLoading(false))
  }, [id, isEdit])

  function handleDistrictChange(name) {
    setDistrict(name)
    if (!location) {
      const d = districts.find((x) => x.name === name)
      if (d) setLocation({ lat: d.lat, lng: d.lng })
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!location) {
      setError('Please pick your property\'s location on the map.')
      return
    }
    if (images.length === 0) {
      setError('Please upload at least one photo of your property.')
      return
    }
    setSaving(true)
    const payload = {
      name, description, propertyType, district, city, address, location,
      starRating: Number(starRating), facilities,
      images,
      checkInTime, checkOutTime, cancellationPolicy,
    }
    try {
      if (isEdit) {
        await api.put(`/owner/hotels/${id}`, payload)
        navigate('/owner/properties')
      } else {
        const { data } = await api.post('/owner/hotels', payload)
        navigate(`/owner/hotels/${data.id}/rooms`)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save property.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-display font-bold text-2xl mb-1">{isEdit ? 'Edit property' : 'List a new property'}</h1>
      <p className="text-slate-500 text-sm mb-6">
        {isEdit ? 'Update your property details below.' : 'New listings are reviewed by our team before going live — usually within 24 hours.'}
      </p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div>
          <label className="text-sm font-medium mb-1 block">Property name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="e.g. Green Hills Boutique Villa" />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Description</label>
          <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" placeholder="Describe what makes your property special..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Property type</label>
            <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="input-field">
              {propertyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Star rating</label>
            <select value={starRating} onChange={(e) => setStarRating(e.target.value)} className="input-field">
              {[1, 2, 3, 4, 5].map((s) => <option key={s} value={s}>{s} star{s > 1 ? 's' : ''}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">District</label>
            <select required value={district} onChange={(e) => handleDistrictChange(e.target.value)} className="input-field">
              <option value="">Select district</option>
              {districts.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">City / Town</label>
            <input required value={city} onChange={(e) => setCity(e.target.value)} className="input-field" placeholder="e.g. Unawatuna" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Street address</label>
          <input required value={address} onChange={(e) => setAddress(e.target.value)} className="input-field" placeholder="Full street address" />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Pin your location on the map</label>
          <LocationPicker value={location} onChange={setLocation} />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Property facilities</label>
          <FacilityChecklist masterList={facilityMaster} selected={facilities} onChange={setFacilities} />
        </div>

        <div>
          <MultiImageUpload images={images} onChange={setImages} label="Property photos" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Check-in time</label>
            <input type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Check-out time</label>
            <input type="time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} className="input-field" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Cancellation policy</label>
          <textarea rows={2} value={cancellationPolicy} onChange={(e) => setCancellationPolicy(e.target.value)} className="input-field" />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Continue to add rooms →'}
          </button>
        </div>
      </form>
    </div>
  )
}
