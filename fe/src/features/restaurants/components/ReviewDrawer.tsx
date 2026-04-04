import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Drawer, Rate, Spin, Divider, Tag, Avatar, Button, Empty, Pagination } from 'antd'
import { EnvironmentOutlined, PhoneOutlined, GlobalOutlined, ClockCircleOutlined, StarFilled, UserOutlined } from '@ant-design/icons'
import { fetchRestaurantDetail, fetchReviews, type RestaurantMapItem } from '@/features/map/api'
import { getCategoryColor } from './RestaurantCard'

const PAGE_SIZE = 20

interface ReviewDrawerProps {
    restaurant: RestaurantMapItem | null
    onClose: () => void
}

export default function ReviewDrawer({ restaurant, onClose }: ReviewDrawerProps) {
    const [page, setPage] = useState(1)

    const { data: detail, isLoading: detailLoading } = useQuery({
        queryKey: ['restaurant-detail', restaurant?.place_id],
        queryFn: () => fetchRestaurantDetail(restaurant!.place_id),
        enabled: !!restaurant,
        staleTime: 5 * 60 * 1000,
    })

    const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
        queryKey: ['restaurant-reviews', restaurant?.place_id],
        queryFn: () => fetchReviews(restaurant!.place_id),
        enabled: !!restaurant,
        staleTime: 5 * 60 * 1000,
    })

    const allReviews = reviewsData?.items ?? []
    const pagedReviews = allReviews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    return (
        <Drawer
            open={!!restaurant}
            onClose={onClose}
            placement="right"
            width={400}
            styles={{
                body: { padding: 0 },
                header: { display: 'none' },
                wrapper: { marginTop: 56 },  // below header (h-14 = 56px)
            }}
            style={{ zIndex: 1500 }}   // below header z-index(2000) but above map
            className="review-drawer"
        >
            {restaurant && (
                <div className="h-full flex flex-col overflow-y-auto">
                    {/* Hero image */}
                    {restaurant.featured_image && (
                        <div className="h-48 relative flex-shrink-0">
                            <img
                                src={restaurant.featured_image}
                                alt={restaurant.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            <Button
                                shape="circle"
                                size="small"
                                className="absolute top-3 left-3 bg-white/80 border-0"
                                onClick={onClose}
                            >✕</Button>
                        </div>
                    )}

                    <div className="p-4 flex-1">
                        {detailLoading ? (
                            <div className="flex justify-center py-8"><Spin /></div>
                        ) : (
                            <>
                                <div className="mb-2">
                                    {!restaurant.featured_image && (
                                        <Button size="small" className="mb-2 border-0 p-0 text-gray-400 hover:text-gray-600" onClick={onClose}>← Đóng</Button>
                                    )}
                                    <h2 className="text-xl font-bold text-gray-900 leading-tight">{restaurant.name}</h2>
                                    {restaurant.main_category && (
                                        <Tag color={getCategoryColor(restaurant.main_category)} className="mt-1">{restaurant.main_category}</Tag>
                                    )}
                                </div>

                                {restaurant.rating != null && (
                                    <div className="flex items-center gap-2 mb-3">
                                        <StarFilled className="text-yellow-400" />
                                        <span className="font-bold text-gray-800">{restaurant.rating.toFixed(1)}</span>
                                        <Rate disabled allowHalf value={restaurant.rating} style={{ fontSize: 13 }} />
                                        <span className="text-sm text-gray-400">({restaurant.reviews_count?.toLocaleString()})</span>
                                    </div>
                                )}

                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                    {(detail?.address || restaurant.address) && (
                                        <div className="flex gap-2 items-start">
                                            <EnvironmentOutlined className="text-blue-400 mt-0.5 flex-shrink-0" />
                                            <span>{detail?.address || restaurant.address}</span>
                                        </div>
                                    )}
                                    {detail?.phone && (
                                        <div className="flex gap-2 items-center">
                                            <PhoneOutlined className="text-green-400" />
                                            <a href={`tel:${detail.phone}`} className="text-blue-600 hover:underline">{detail.phone}</a>
                                        </div>
                                    )}
                                    {detail?.website && (
                                        <div className="flex gap-2 items-center">
                                            <GlobalOutlined className="text-purple-400" />
                                            <a href={detail.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[280px]">
                                                {detail.website}
                                            </a>
                                        </div>
                                    )}
                                    {detail?.workday_timing && (
                                        <div className="flex gap-2 items-start">
                                            <ClockCircleOutlined className="text-orange-400 mt-0.5 flex-shrink-0" />
                                            <span>{detail.workday_timing}</span>
                                        </div>
                                    )}
                                </div>

                                {detail?.description && (
                                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{detail.description}</p>
                                )}
                            </>
                        )}

                        <Divider className="my-3">
                            <span className="text-sm text-gray-500 font-medium">Đánh giá ({reviewsData?.total ?? 0})</span>
                        </Divider>

                        {reviewsLoading ? (
                            <div className="flex justify-center py-6"><Spin /></div>
                        ) : allReviews.length === 0 ? (
                            <Empty description="Chưa có đánh giá" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        ) : (
                            <>
                                <div className="space-y-4 pb-4">
                                    {pagedReviews.map((review, idx) => (
                                        <div key={review.id ?? idx} className="border border-gray-100 rounded-xl p-3 bg-gray-50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Avatar size="small" icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
                                                <span className="text-sm font-medium text-gray-800">{review.reviewer_name || 'Ẩn danh'}</span>
                                                {review.rating != null && (
                                                    <Rate disabled allowHalf value={review.rating} style={{ fontSize: 11 }} className="ml-auto" />
                                                )}
                                            </div>
                                            {review.content && (
                                                <p className="text-sm text-gray-600 leading-relaxed">{review.content}</p>
                                            )}
                                            {review.review_date && (
                                                <p className="text-xs text-gray-400 mt-1">{review.review_date}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {allReviews.length > PAGE_SIZE && (
                                    <div className="flex justify-center pt-2 pb-6">
                                        <Pagination
                                            current={page}
                                            total={allReviews.length}
                                            pageSize={PAGE_SIZE}
                                            onChange={(p) => { setPage(p) }}
                                            showSizeChanger={false}
                                            size="small"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </Drawer>
    )
}
