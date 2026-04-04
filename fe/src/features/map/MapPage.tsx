import { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Spin, Button } from 'antd'
import { EnvironmentOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { fetchNearbyRestaurants, fetchMapRestaurants, type RestaurantMapItem, type MapBounds } from './api'
import { useMapContext } from './MapContext'
import MapMarkers, { userLocationIcon } from './components/MapMarkers'
import MapControls from './components/MapControls'
import SelectedPanel from './components/SelectedPanel'
import MapBoundsTracker from './components/MapBoundsTracker'

export default function MapPage() {
    const [locationLoaded, setLocationLoaded] = useState(false)
    const [locationError, setLocationError] = useState<string | null>(null)
    const [bounds, setBounds] = useState<MapBounds | undefined>()
    const [allRestaurants, setAllRestaurants] = useState<Record<string, RestaurantMapItem>>({})
    const [clickedPlaceId, setClickedPlaceId] = useState<string | null>(null)

    const { userLocation, setUserLocation, searchRadius, panelTarget, setPanelTarget, setDrawerTarget, mapRef, flyTo } = useMapContext()

    const selectedMarkerRef = useRef<any>(null)

    useEffect(() => {
        if (!panelTarget || !selectedMarkerRef.current) return
        const timer = setTimeout(() => selectedMarkerRef.current?.openPopup?.(), 900)
        return () => clearTimeout(timer)
    }, [panelTarget])

    // 1. Request geolocation once
    useEffect(() => {
        if (!('geolocation' in navigator)) {
            setLocationError('Trình duyệt không hỗ trợ định vị.')
            return
        }
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                setUserLocation([coords.latitude, coords.longitude])
                setLocationLoaded(true)
            },
            (err) => {
                console.error('Geolocation error:', err)
                setLocationError('Không thể lấy vị trí. Vui lòng cấp quyền định vị và thử lại.')
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        )
    }, [setUserLocation])

    // 2. Fly to user location on first acquire
    useEffect(() => {
        if (!userLocation || !mapRef.current) return
        mapRef.current.flyTo(userLocation, 17, { animate: true, duration: 1.2 })
    }, [userLocation, mapRef])

    // 3a. Initial radius-based load around user (respects searchRadius slider)
    const { data: radiusData = [] } = useQuery({
        queryKey: ['restaurants-radius', userLocation, searchRadius],
        queryFn: () => fetchNearbyRestaurants(userLocation![0], userLocation![1], 200, searchRadius),
        enabled: locationLoaded && !!userLocation,
        staleTime: 5 * 60 * 1000,
    })

    // 3b. Bounding-box load when user pans outside initial radius
    const { data: boundsData = [] } = useQuery({
        queryKey: ['restaurants-map', bounds],
        queryFn: () => fetchMapRestaurants(bounds),
        enabled: locationLoaded && !!bounds,
        staleTime: Infinity,
    })

    // Accumulate all fetched restaurants
    const mergeInto = useCallback((items: RestaurantMapItem[]) => {
        if (!items.length) return
        setAllRestaurants(prev => {
            const next = { ...prev }
            let changed = false
            for (const r of items) {
                if (!next[r.place_id]) { next[r.place_id] = r; changed = true }
            }
            return changed ? next : prev
        })
    }, [])

    useEffect(() => { mergeInto(radiusData) }, [radiusData, mergeInto])
    useEffect(() => { mergeInto(boundsData) }, [boundsData, mergeInto])

    // Always ensure panelTarget has a map marker
    useEffect(() => {
        if (!panelTarget) return
        setAllRestaurants(prev => prev[panelTarget.place_id] ? prev : { ...prev, [panelTarget.place_id]: panelTarget })
    }, [panelTarget])

    const restaurants = Object.values(allRestaurants)

    if (locationError) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
                <EnvironmentOutlined style={{ fontSize: 40, color: '#ef4444' }} />
                <p className="text-gray-700 font-medium">{locationError}</p>
                <Button type="primary" onClick={() => window.location.reload()}>Thử lại</Button>
            </div>
        )
    }

    if (!locationLoaded) {
        return (
            <div className="flex items-center justify-center h-full">
                <Spin size="large" tip="Đang lấy vị trí của bạn..." />
            </div>
        )
    }

    return (
        <div className="relative w-full h-full">
            <MapControls onFlyToUser={() => userLocation && flyTo(userLocation[0], userLocation[1], 17)} />

            {panelTarget && (
                <SelectedPanel
                    restaurant={panelTarget}
                    onClose={() => setPanelTarget(null)}
                    onOpenReviews={() => setDrawerTarget(panelTarget)}
                />
            )}

            <MapContainer
                ref={(m) => { if (m) mapRef.current = m }}
                center={userLocation ?? [21.028, 105.854]}
                zoom={17}
                style={{ height: '100%', width: '100%' }}
                zoomControl
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapBoundsTracker onBoundsChange={setBounds} />

                {userLocation && (
                    <Marker position={userLocation} icon={userLocationIcon}>
                        <Popup>Vị trí của bạn</Popup>
                    </Marker>
                )}

                <MapMarkers
                    restaurants={restaurants}
                    selectedPlaceId={panelTarget?.place_id ?? null}
                    clickedPlaceId={clickedPlaceId}
                    onMarkerClick={setClickedPlaceId}
                    onOpenReviews={(r) => setDrawerTarget(r)}
                    selectedMarkerRef={selectedMarkerRef}
                />
            </MapContainer>
        </div>
    )
}
