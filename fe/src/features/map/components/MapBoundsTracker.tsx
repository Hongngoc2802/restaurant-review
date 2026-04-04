import { useEffect } from 'react'
import { useMapEvents } from 'react-leaflet'
import type { MapBounds } from '@/features/map/api'

interface MapBoundsTrackerProps {
    onBoundsChange: (bounds: MapBounds) => void
}

export default function MapBoundsTracker({ onBoundsChange }: MapBoundsTrackerProps) {
    const map = useMapEvents({
        moveend: () => {
            const b = map.getBounds()
            onBoundsChange({
                min_lat: b.getSouthWest().lat,
                max_lat: b.getNorthEast().lat,
                min_lng: b.getSouthWest().lng,
                max_lng: b.getNorthEast().lng,
            })
        },
    })

    useEffect(() => {
        const b = map.getBounds()
        onBoundsChange({
            min_lat: b.getSouthWest().lat,
            max_lat: b.getNorthEast().lat,
            min_lng: b.getSouthWest().lng,
            max_lng: b.getNorthEast().lng,
        })
    }, [map, onBoundsChange])

    return null
}
