import { useQuery } from '@tanstack/react-query'
import { Spin, Empty, Tabs, Badge } from 'antd'
import { EnvironmentOutlined, TrophyOutlined, HistoryOutlined } from '@ant-design/icons'
import { fetchNearbyRestaurants, fetchTopRestaurants } from '@/features/map/api'
import RestaurantCard from '@/features/restaurants/components/RestaurantCard'
import { useMapContext } from '@/features/map/MapContext'
import type { RestaurantMapItem } from '@/features/map/api'
import { useEffect, useState } from 'react'

export default function Sidebar() {
    const { userLocation, setPanelTarget, flyTo } = useMapContext()
    const [recentList, setRecentList] = useState<RestaurantMapItem[]>([])

    const { data: nearby = [], isLoading: nearbyLoading } = useQuery({
        queryKey: ['restaurants-nearby', userLocation],
        queryFn: () => fetchNearbyRestaurants(userLocation![0], userLocation![1], 12),
        enabled: !!userLocation,
        staleTime: 5 * 60 * 1000,
    })

    const { data: top = [], isLoading: topLoading } = useQuery({
        queryKey: ['restaurants-top'],
        queryFn: () => fetchTopRestaurants(15),
        staleTime: 5 * 60 * 1000,
    })

    useEffect(() => {
        const raw = sessionStorage.getItem('recent_restaurants')
        if (raw) {
            try { setRecentList(JSON.parse(raw)) } catch { }
        }
    }, [])

    const handleSelect = (r: RestaurantMapItem) => {
        setPanelTarget(r)
        flyTo(r.latitude, r.longitude, 16)

        setRecentList(prev => {
            const filtered = prev.filter(x => x.place_id !== r.place_id)
            const next = [r, ...filtered].slice(0, 10)
            sessionStorage.setItem('recent_restaurants', JSON.stringify(next))
            return next
        })
    }

    const listItems = (items: RestaurantMapItem[], loading: boolean, emptyText: string) => {
        if (loading) return <div className="flex justify-center py-8"><Spin /></div>
        if (items.length === 0) return <Empty description={emptyText} image={Empty.PRESENTED_IMAGE_SIMPLE} className="my-8" />
        return (
            <div className="divide-y divide-gray-50">
                {items.map(r => (
                    <RestaurantCard key={r.place_id} restaurant={r} onClick={handleSelect} />
                ))}
            </div>
        )
    }

    const tabs = [
        {
            key: 'nearby',
            label: (
                <span className="flex items-center gap-1.5 text-xs font-medium">
                    <EnvironmentOutlined />
                    Gần tôi
                    {nearby.length > 0 && <Badge count={nearby.length} size="small" color="#3b82f6" />}
                </span>
            ),
            children: listItems(nearby, nearbyLoading, userLocation ? 'Không có nhà hàng gần đây' : 'Đang chờ vị trí...'),
        },
        {
            key: 'top',
            label: (
                <span className="flex items-center gap-1.5 text-xs font-medium">
                    <TrophyOutlined />
                    Nổi bật
                </span>
            ),
            children: listItems(top, topLoading, 'Không có dữ liệu'),
        },
        {
            key: 'recent',
            label: (
                <span className="flex items-center gap-1.5 text-xs font-medium">
                    <HistoryOutlined />
                    Đã xem
                    {recentList.length > 0 && <Badge count={recentList.length} size="small" color="#6b7280" />}
                </span>
            ),
            children: listItems(recentList, false, 'Chưa xem nhà hàng nào'),
        },
    ]

    return (
        <aside className="w-80 h-full bg-white border-r border-gray-100 flex flex-col overflow-hidden">
            <div className="px-4 pt-4 pb-2 flex-shrink-0">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Khám phá</h3>
                <p className="text-xs text-gray-400">Nhà hàng xung quanh bạn</p>
            </div>
            <div className="flex-1 overflow-y-auto">
                <Tabs
                    defaultActiveKey="nearby"
                    items={tabs}
                    className="sidebar-tabs"
                    tabBarStyle={{ paddingLeft: 16, paddingRight: 16, marginBottom: 0, borderBottom: '1px solid #f3f4f6' }}
                    size="small"
                />
            </div>
        </aside>
    )
}
