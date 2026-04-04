import { Tag } from 'antd'
import { EnvironmentOutlined, StarFilled } from '@ant-design/icons'
import type { RestaurantMapItem } from '@/features/map/api'

const categoryColor: Record<string, string> = {
    'Vietnamese restaurant': 'green',
    'Pizza restaurant': 'orange',
    'Hot pot restaurant': 'red',
    'Seafood restaurant': 'blue',
    'Korean restaurant': 'purple',
    'Hotel': 'cyan',
    'Buffet restaurant': 'gold',
}

export const getCategoryColor = (cat: string | null): string => {
    if (!cat) return 'default'
    for (const key of Object.keys(categoryColor)) {
        if (cat.includes(key)) return categoryColor[key]
    }
    return 'default'
}

interface RestaurantCardProps {
    restaurant: RestaurantMapItem
    onClick?: (r: RestaurantMapItem) => void
    compact?: boolean
}

export default function RestaurantCard({ restaurant: r, onClick, compact = false }: RestaurantCardProps) {
    return (
        <div
            className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group border border-transparent hover:border-gray-100"
            onClick={() => onClick?.(r)}
            role="button"
            tabIndex={0}
            aria-label={`Xem chi tiết ${r.name}`}
            onKeyDown={(e) => e.key === 'Enter' && onClick?.(r)}
        >
            {/* Thumbnail */}
            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                {r.featured_image ? (
                    <img
                        src={r.featured_image}
                        alt={r.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '' }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">
                        🍽️
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate leading-tight">{r.name}</p>

                {r.main_category && (
                    <Tag color={getCategoryColor(r.main_category)} className="mt-0.5 text-[10px] leading-none">
                        {r.main_category}
                    </Tag>
                )}

                {r.rating != null && (
                    <div className="flex items-center gap-1 mt-1">
                        <StarFilled className="text-yellow-400 text-xs" />
                        <span className="text-xs font-semibold text-gray-700">{r.rating.toFixed(1)}</span>
                        {!compact && r.reviews_count != null && (
                            <span className="text-xs text-gray-400">({r.reviews_count.toLocaleString()})</span>
                        )}
                    </div>
                )}

                {!compact && r.address && (
                    <div className="flex items-start gap-1 mt-0.5">
                        <EnvironmentOutlined className="text-gray-400 text-[10px] mt-0.5 flex-shrink-0" />
                        <span className="text-[11px] text-gray-400 leading-tight line-clamp-1">{r.address}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
