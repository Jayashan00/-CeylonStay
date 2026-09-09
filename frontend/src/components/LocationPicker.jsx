import React from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const SRI_LANKA_BOUNDS = L.latLngBounds([5.6, 79.3], [10.0, 82.0])

function ClickCapture({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

export default function LocationPicker({ value, onChange }) {
  const center = value?.lat ? [value.lat, value.lng] : [7.8731, 80.7718]

  return (
    <div>
      <div style={{ height: '320px' }} className="rounded-xl overflow-hidden border border-slate-200 mb-2">
        <MapContainer
          center={center}
          zoom={value?.lat ? 12 : 8}
          minZoom={7}
          maxBounds={SRI_LANKA_BOUNDS}
          maxBoundsViscosity={1.0}
          className="leaflet-container"
        >
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickCapture onPick={onChange} />
          {value?.lat && <Marker position={[value.lat, value.lng]} />}
        </MapContainer>
      </div>
      <p className="text-xs text-slate-400">
        Click anywhere on the map to place a pin for your property's exact location.
        {value?.lat ? ` Selected: ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}` : ' No location selected yet.'}
      </p>
    </div>
  )
}