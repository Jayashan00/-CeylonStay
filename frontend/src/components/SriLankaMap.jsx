import React from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { useNavigate } from 'react-router-dom'

// Fix default marker icon paths (Leaflet + bundlers issue)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Sri Lanka's bounding box, with a little padding — used to stop the map
// from ever panning/zooming out far enough to show India or open ocean.
const SRI_LANKA_BOUNDS = L.latLngBounds([5.6, 79.3], [10.0, 82.0])
const SRI_LANKA_CENTER = [7.6, 80.7]

function formatPrice(price) {
  if (!price) return 'Rs —'
  if (price >= 1000) return `Rs ${Math.round(price / 1000)}k`
  return `Rs ${price}`
}

const priceIcon = (price) =>
  L.divIcon({
    className: 'price-marker',
    html: `
      <div class="price-marker-pill">${formatPrice(price)}</div>
      <div class="price-marker-tail"></div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 8],
  })

const clusterIcon = (cluster) => {
  const count = cluster.getChildCount()
  return L.divIcon({
    className: 'cluster-marker',
    html: `<div class="cluster-marker-pill">${count}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

function FitToMarkers({ hotels }) {
  const map = useMap()
  React.useEffect(() => {
    const points = hotels.filter((h) => h.location).map((h) => [h.location.lat, h.location.lng])
    if (points.length === 0) {
      map.fitBounds(SRI_LANKA_BOUNDS)
      return
    }
    // Fit to the markers, but never zoom out further than the Sri Lanka
    // bounding box view, and never zoom in so far that a single hotel
    // fills the whole screen.
    map.fitBounds(points, { padding: [50, 50], maxZoom: 11 })
  }, [hotels, map])
  return null
}

export default function SriLankaMap({ hotels = [], height = '500px' }) {
  const navigate = useNavigate()

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-slate-200">
      <MapContainer
        center={SRI_LANKA_CENTER}
        zoom={8}
        minZoom={7}
        maxZoom={16}
        maxBounds={SRI_LANKA_BOUNDS}
        maxBoundsViscosity={1.0}
        className="leaflet-container"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToMarkers hotels={hotels} />
        <MarkerClusterGroup
          iconCreateFunction={clusterIcon}
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
        >
          {hotels.filter((h) => h.location).map((hotel) => (
            <Marker
              key={hotel.id}
              position={[hotel.location.lat, hotel.location.lng]}
              icon={priceIcon(hotel.lowestPrice)}
              eventHandlers={{ click: () => navigate(`/hotels/${hotel.id}`) }}
            >
              <Popup>
                <div className="w-44">
                  <p className="font-semibold text-sm mb-1">{hotel.name}</p>
                  <p className="text-xs text-slate-500 mb-1">{hotel.city}, {hotel.district}</p>
                  <p className="text-primary font-bold text-sm">Rs {hotel.lowestPrice?.toLocaleString()} / night</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}