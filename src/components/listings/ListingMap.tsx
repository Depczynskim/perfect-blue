'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useTranslations } from 'next-intl'
import 'leaflet/dist/leaflet.css'
import { defaultMarkerIcon } from '@/lib/map/icon'

interface ListingMapProps {
  latitude: number
  longitude: number
}

export default function ListingMap({ latitude, longitude }: ListingMapProps) {
  const t = useTranslations('listingDetail')
  const [mounted, setMounted] = useState(false)

  // Leaflet wymaga aby mapa była renderowana tylko po stronie klienta
  useEffect(() => {
    setMounted(true)
  }, [])

  // Walidacja współrzędnych
  const validLat = !isNaN(latitude) && latitude >= -90 && latitude <= 90;
  const validLng = !isNaN(longitude) && longitude >= -180 && longitude <= 180;

  if (!validLat || !validLng) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-100 text-slate-500">
        {t('invalidCoordinates')}
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-100 text-slate-500">
        Loading map...
      </div>
    );
  }

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%' }}
      key={`listing-map-${latitude}-${longitude}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={defaultMarkerIcon}>
        <Popup>
          {t('mapLabel')}
        </Popup>
      </Marker>
    </MapContainer>
  )
}

