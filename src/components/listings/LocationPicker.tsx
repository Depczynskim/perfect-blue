'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { defaultMarkerIcon } from '@/lib/map/icon';

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  address?: string;
}

/**
 * Komponent do centrowania mapy przy zmianie pozycji z geokodowania
 */
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  const previousCenter = useRef<[number, number]>(center);
  
  useEffect(() => {
    const [prevLat, prevLng] = previousCenter.current;
    const [newLat, newLng] = center;
    
    // Oblicz różnicę w stopniach
    const latDiff = Math.abs(newLat - prevLat);
    const lngDiff = Math.abs(newLng - prevLng);
    
    // Jeśli zmiana > 0.01 stopnia (~1km), zaktualizuj widok (prawdopodobnie geokodowanie)
    // Małe zmiany (kliknięcia użytkownika <1km) ignorujemy
    if (latDiff > 0.01 || lngDiff > 0.01) {
      map.setView(center, map.getZoom(), { animate: true });
    }
    
    previousCenter.current = center;
  }, [center, map]);

  return null;
}

/**
 * Komponent obsługujący kliknięcia na mapie
 */
function LocationMarker({ 
  position, 
  onLocationChange 
}: { 
  position: [number, number]; 
  onLocationChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return <Marker key={`${position[0]}-${position[1]}`} position={position} icon={defaultMarkerIcon} />;
}

/**
 * LocationPicker - komponent wyboru lokalizacji na mapie
 * 
 * @param latitude - szerokość geograficzna
 * @param longitude - długość geograficzna
 * @param onLocationChange - callback wywoływany przy zmianie lokalizacji
 * @param address - opcjonalny adres (wyświetlany nad mapą)
 */
export default function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
  address
}: LocationPickerProps) {
  const tForm = useTranslations('createListing.form');
  const tMap = useTranslations('createListing.map');
  const [mounted, setMounted] = useState(false);

  // Leaflet wymaga aby mapa była renderowana tylko po stronie klienta
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">{tMap('loading')}</div>
      </div>
    );
  }

  const position: [number, number] = [latitude, longitude];

  return (
    <div className="w-full">
      {address && (
        <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <strong>{tForm('address')}:</strong> {address}
        </div>
      )}
      
      <div className="relative w-full h-[400px] rounded-lg overflow-hidden border-2 border-gray-300">
        <MapContainer
          center={position}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={position} />
          <LocationMarker position={position} onLocationChange={onLocationChange} />
        </MapContainer>
      </div>

      <div className="mt-2 text-xs text-gray-600 space-y-1">
        <p>💡 <strong>{tMap('hintLabel')}:</strong> {tMap('hintText')}</p>
        <p className="font-mono text-gray-500">
          {tMap('coordinatesLabel')}: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
      </div>
    </div>
  );
}

