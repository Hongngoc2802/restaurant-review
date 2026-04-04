import { Icon, divIcon } from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import { Rate, Tag, Button } from 'antd'
import { EnvironmentOutlined } from '@ant-design/icons'
import type { RestaurantMapItem } from '@/features/map/api'
import { getCategoryColor } from '@/features/restaurants/components/RestaurantCard'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const ANCHOR = { iconSize: [25, 41] as [number, number], iconAnchor: [12, 41] as [number, number], popupAnchor: [1, -34] as [number, number], shadowSize: [41, 41] as [number, number] }

const defaultIcon = new Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    ...ANCHOR,
})

const makeTeardropIcon = (fill: string, cssClass: string) => divIcon({
    className: cssClass,
    html: `<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 22 12.5 41 12.5 41S25 22 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${fill}" stroke="white" stroke-width="1.5"/>
        <circle cx="12.5" cy="12.5" r="4.5" fill="white"/>
    </svg>`,
    ...ANCHOR,
})

/** Red teardrop — sidebar selected restaurant */
const selectedIcon = makeTeardropIcon('#ef4444', 'selected-map-marker')
/** Orange teardrop — map click highlight */
const clickedIcon = makeTeardropIcon('#f97316', 'clicked-map-marker')

export const userLocationIcon = divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(37,99,235,0.5);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
})

interface MapMarkersProps {
    restaurants: RestaurantMapItem[]
    selectedPlaceId: string | null
    clickedPlaceId: string | null
    onMarkerClick: (placeId: string) => void
    onOpenReviews: (r: RestaurantMapItem) => void
    selectedMarkerRef: React.MutableRefObject<any>
}

export default function MapMarkers({ restaurants, selectedPlaceId, clickedPlaceId, onMarkerClick, onOpenReviews, selectedMarkerRef }: MapMarkersProps) {
    return (
        <>
            {restaurants.map((r) => {
                const isSidebarSelected = selectedPlaceId === r.place_id
                const isMapClicked = !isSidebarSelected && clickedPlaceId === r.place_id
                const icon = isSidebarSelected ? selectedIcon : isMapClicked ? clickedIcon : defaultIcon
                const zIndex = isSidebarSelected ? 9999 : isMapClicked ? 5000 : 0

                return (
                    <Marker
                        key={r.place_id}
                        position={[r.latitude, r.longitude]}
                        icon={icon}
                        zIndexOffset={zIndex}
                        ref={isSidebarSelected ? selectedMarkerRef : undefined}
                        eventHandlers={{ click: () => onMarkerClick(r.place_id) }}
                    >
                        <Popup maxWidth={260}>
                            <div className="space-y-1">
                                {r.featured_image && (
                                    <img
                                        src={r.featured_image}
                                        alt={r.name}
                                        className="w-full h-28 object-cover rounded mb-1"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                    />
                                )}
                                <div className="font-semibold text-sm leading-tight">{r.name}</div>
                                {r.main_category && (
                                    <Tag color={getCategoryColor(r.main_category)} style={{ fontSize: 11 }}>
                                        {r.main_category}
                                    </Tag>
                                )}
                                {r.rating != null && (
                                    <div className="flex items-center gap-1">
                                        <Rate disabled allowHalf value={r.rating} style={{ fontSize: 12 }} />
                                        <span className="text-xs text-gray-500">{r.rating} ({r.reviews_count?.toLocaleString()})</span>
                                    </div>
                                )}
                                {r.address && (
                                    <div className="text-xs text-gray-500 flex gap-1 items-start">
                                        <EnvironmentOutlined className="mt-0.5 text-gray-400" />
                                        <span>{r.address}</span>
                                    </div>
                                )}
                                <Button type="primary" size="small" block onClick={() => onOpenReviews(r)} style={{ marginTop: 6 }}>
                                    Xem đánh giá
                                </Button>
                            </div>
                        </Popup>
                    </Marker>
                )
            })}
        </>
    )
}
