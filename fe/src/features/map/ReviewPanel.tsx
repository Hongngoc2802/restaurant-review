import { useState } from 'react'
import { Drawer, Rate, List, Avatar, Tag, Button, Spin, Empty, Typography, Divider } from 'antd'
import { UserOutlined, StarFilled, PhoneOutlined, GlobalOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { fetchRestaurantDetail, fetchReviews, type RestaurantMapItem } from './api'

const { Title, Text, Paragraph } = Typography

interface ReviewPanelProps {
    restaurant: RestaurantMapItem | null
    onClose: () => void
}

const ReviewPanel = ({ restaurant, onClose }: ReviewPanelProps) => {
    const [page, setPage] = useState(0)
    const limit = 20

    const { data: detail, isLoading: loadingDetail } = useQuery({
        queryKey: ['restaurant-detail', restaurant?.place_id],
        queryFn: () => fetchRestaurantDetail(restaurant!.place_id),
        enabled: !!restaurant,
    })

    const { data: reviewData, isLoading: loadingReviews } = useQuery({
        queryKey: ['reviews', restaurant?.place_id, page],
        queryFn: () => fetchReviews(restaurant!.place_id, page * limit, limit),
        enabled: !!restaurant,
    })

    const handleClose = () => {
        setPage(0)
        onClose()
    }

    return (
        <Drawer
            title={
                <div className="flex items-center gap-2">
                    <span className="text-base font-semibold truncate max-w-xs">
                        {restaurant?.name ?? 'Nhà hàng'}
                    </span>
                    {restaurant?.rating && (
                        <Tag color="gold" icon={<StarFilled />}>{restaurant.rating}</Tag>
                    )}
                </div>
            }
            placement="right"
            width={420}
            open={!!restaurant}
            onClose={handleClose}
            styles={{ body: { padding: '12px 16px', overflowY: 'auto' } }}
        >
            {loadingDetail ? (
                <div className="flex justify-center py-10"><Spin /></div>
            ) : detail ? (
                <>
                    {detail.featured_image && (
                        <img
                            src={detail.featured_image}
                            alt={detail.name}
                            className="w-full h-44 object-cover rounded-lg mb-3"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                    )}

                    <Title level={5} style={{ margin: '0 0 4px' }}>{detail.name}</Title>

                    <div className="flex items-center gap-2 mb-2">
                        <Rate disabled allowHalf value={detail.rating ?? 0} style={{ fontSize: 14 }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {detail.rating} ({detail.reviews_count?.toLocaleString()} đánh giá)
                        </Text>
                    </div>

                    <div className="space-y-1 mb-3">
                        {detail.main_category && <Tag color="blue">{detail.main_category}</Tag>}
                        {detail.address && (
                            <div className="flex gap-1.5 text-sm text-gray-600 mt-1">
                                <EnvironmentOutlined className="mt-1 text-gray-400" /><span>{detail.address}</span>
                            </div>
                        )}
                        {detail.workday_timing && (
                            <div className="flex gap-1 text-sm text-gray-600">
                                <ClockCircleOutlined /><span>{detail.workday_timing}</span>
                            </div>
                        )}
                        {detail.phone && (
                            <div className="flex gap-1 text-sm text-gray-600">
                                <PhoneOutlined /><span>{detail.phone}</span>
                            </div>
                        )}
                        {detail.website && (
                            <div className="flex gap-1 text-sm text-blue-500">
                                <GlobalOutlined />
                                <a href={detail.website} target="_blank" rel="noreferrer" className="truncate">
                                    {detail.website}
                                </a>
                            </div>
                        )}
                    </div>

                    {detail.description && (
                        <Paragraph ellipsis={{ rows: 3, expandable: true }} className="text-sm text-gray-600 mb-3">
                            {detail.description}
                        </Paragraph>
                    )}

                    <Divider style={{ fontSize: 13, margin: '12px 0 8px' }}>
                        Đánh giá ({reviewData?.total ?? 0})
                    </Divider>

                    {loadingReviews ? (
                        <div className="flex justify-center py-6"><Spin /></div>
                    ) : reviewData && reviewData.items.length > 0 ? (
                        <>
                            <List
                                dataSource={reviewData.items}
                                renderItem={(review) => (
                                    <List.Item style={{ alignItems: 'flex-start', padding: '8px 0' }}>
                                        <List.Item.Meta
                                            avatar={<Avatar icon={<UserOutlined />} size={32} />}
                                            title={
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">{review.reviewer_name || 'Ẩn danh'}</span>
                                                    {review.rating && (
                                                        <Rate disabled allowHalf value={review.rating} style={{ fontSize: 11 }} />
                                                    )}
                                                </div>
                                            }
                                            description={
                                                <div>
                                                    {review.review_date && (
                                                        <div className="text-xs text-gray-400 mb-1">{review.review_date}</div>
                                                    )}
                                                    <div className="text-sm text-gray-700">{review.content || '(Không có nội dung)'}</div>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                            <div className="flex justify-between mt-3">
                                <Button size="small" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                                    Trước
                                </Button>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {page * limit + 1}–{Math.min((page + 1) * limit, reviewData.total)} / {reviewData.total}
                                </Text>
                                <Button
                                    size="small"
                                    disabled={(page + 1) * limit >= reviewData.total}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    Sau
                                </Button>
                            </div>
                        </>
                    ) : (
                        <Empty description="Chưa có đánh giá" />
                    )}
                </>
            ) : null}
        </Drawer>
    )
}

export default ReviewPanel
