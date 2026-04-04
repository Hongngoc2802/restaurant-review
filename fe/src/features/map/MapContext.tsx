import { createContext, useContext, useState, useRef, type ReactNode } from 'react'
import type { RestaurantMapItem } from '@/features/map/api'
import type { Map as LeafletMap } from 'leaflet'

interface MapContextValue {
    panelTarget: RestaurantMapItem | null
    setPanelTarget: (r: RestaurantMapItem | null) => void
    drawerTarget: RestaurantMapItem | null
    setDrawerTarget: (r: RestaurantMapItem | null) => void
    userLocation: [number, number] | null
    setUserLocation: (loc: [number, number] | null) => void
    searchRadius: number
    setSearchRadius: (km: number) => void
    mapRef: React.MutableRefObject<LeafletMap | null>
    flyTo: (lat: number, lng: number, zoom?: number) => void
}

const MapContext = createContext<MapContextValue | null>(null)

export const MapProvider = ({ children }: { children: ReactNode }) => {
    const [panelTarget, setPanelTarget] = useState<RestaurantMapItem | null>(null)
    const [drawerTarget, setDrawerTarget] = useState<RestaurantMapItem | null>(null)
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
    const [searchRadius, setSearchRadius] = useState(3)
    const mapRef = useRef<LeafletMap | null>(null)

    const flyTo = (lat: number, lng: number, zoom = 16) => {
        mapRef.current?.flyTo([lat, lng], zoom, { animate: true, duration: 0.8 })
    }

    return (
        <MapContext.Provider value={{
            panelTarget, setPanelTarget,
            drawerTarget, setDrawerTarget,
            userLocation, setUserLocation,
            searchRadius, setSearchRadius,
            mapRef, flyTo,
        }}>
            {children}
        </MapContext.Provider>
    )
}

export const useMapContext = () => {
    const ctx = useContext(MapContext)
    if (!ctx) throw new Error('useMapContext must be used inside MapProvider')
    return ctx
}
