import { Tag, Rate, Button } from 'antd'
import { EnvironmentOutlined, StarFilled, ReadOutlined } from '@ant-design/icons'
import type { RestaurantMapItem } from '@/features/map/api'
import { getCategoryColor } from '@/features/restaurants/components/RestaurantCard'

interface SelectedPanelProps {
    restaurant: RestaurantMapItem
    onClose: () => void
    onOpenReviews: () => void
}

export default function SelectedPanel({ restaurant: r, onClose, onOpenReviews }: SelectedPanelProps) {
    return (
        <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-[360px] max-w-[calc(100%-32px)] bg-white rounded-2xl overflow-hidden flex"
            style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.22)' }}
        >
            {r.featured_image && (
                <div className="w-28 flex-shrink-0">
                    <img
                        src={r.featured_image}
                        alt={r.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                </div>
            )}

            <div className="flex-1 p-3 min-w-0 relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-xs font-bold cursor-pointer border-0"
                    aria-label="Đóng"
                >✕</button>

                <p className="font-semibold text-gray-900 text-sm leading-tight pr-5 truncate">{r.name}</p>

                {r.main_category && (
                    <Tag color={getCategoryColor(r.main_category)} className="mt-1 text-[10px]">
                        {r.main_category}
                    </Tag>
                )}

                {r.rating != null && (
                    <div className="flex items-center gap-1 mt-1.5">
                        <StarFilled className="text-yellow-400 text-xs" />
                        <span className="text-xs font-bold text-gray-800">{r.rating.toFixed(1)}</span>
                        <Rate disabled allowHalf value={r.rating} style={{ fontSize: 10 }} />
                        <span className="text-xs text-gray-400">({r.reviews_count?.toLocaleString()})</span>
                    </div>
                )}

                {r.address && (
                    <div className="flex items-start gap-1 mt-1">
                        <EnvironmentOutlined className="text-gray-400 text-[10px] mt-0.5 flex-shrink-0" />
                        <span className="text-[11px] text-gray-500 line-clamp-1">{r.address}</span>
                    </div>
                )}

                <Button
                    type="primary"
                    size="small"
                    icon={<ReadOutlined />}
                    onClick={onOpenReviews}
                    className="mt-2 text-xs h-7"
                    block
                >
                    Xem đánh giá đầy đủ
                </Button>
            </div>
        </div>
    )
}
