import { Avatar, Button, Dropdown, Input, Slider, Tooltip } from 'antd'
import { UserOutlined, LogoutOutlined, SearchOutlined, RadiusSettingOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useMapContext } from '@/features/map/MapContext'

interface HeaderProps {
    onSearch?: (value: string) => void
}

export default function Header({ onSearch }: HeaderProps) {
    const navigate = useNavigate()
    const { searchRadius, setSearchRadius } = useMapContext()

    const userStr = localStorage.getItem('user')
    const user = userStr ? JSON.parse(userStr) : null

    const handleLogout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        window.location.reload()
    }

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: <span className="text-sm">{user?.name || user?.email}</span>,
            disabled: true,
        },
        { type: 'divider' as const },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: handleLogout,
            danger: true,
        },
    ]

    return (
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3 z-[2000] relative shadow-sm">
            {/* Brand */}
            <div className="flex-shrink-0 select-none">
                <span className="font-bold text-gray-900 text-base hidden sm:block">FoodMap</span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-xl mx-auto">
                <Input
                    placeholder="Tìm kiếm nhà hàng, món ăn, địa điểm…"
                    prefix={<SearchOutlined className="text-gray-400" />}
                    allowClear
                    onPressEnter={(e) => onSearch?.((e.target as HTMLInputElement).value)}
                    className="rounded-full border-gray-200 bg-gray-50 hover:bg-white focus:bg-white transition-colors"
                    style={{ height: 38 }}
                />
            </div>

            {/* Radius control */}
            <Tooltip
                title={
                    <div className="px-2 py-1" style={{ width: 200 }}>
                        <div className="flex justify-between mb-2 text-xs">
                            <span>Bán kính tìm kiếm</span>
                            <span className="font-bold text-blue-300">{searchRadius} km</span>
                        </div>
                        <Slider
                            min={1}
                            max={10}
                            step={0.5}
                            value={searchRadius}
                            onChange={setSearchRadius}
                            tooltip={{ open: false }}
                            styles={{ track: { background: '#3b82f6' } }}
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                            <span>1 km</span>
                            <span>10 km</span>
                        </div>
                    </div>
                }
                trigger="click"
                placement="bottomRight"
                color="#1e293b"
                overlayInnerStyle={{ padding: 0 }}
            >
                <Button
                    icon={<RadiusSettingOutlined />}
                    shape="round"
                    className="flex items-center gap-1.5 text-xs h-9 flex-shrink-0"
                    style={{ borderColor: '#e2e8f0' }}
                >
                    <span className="hidden md:inline">{searchRadius} km</span>
                </Button>
            </Tooltip>

            {/* Auth */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {user ? (
                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                        <div
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 pl-2 pr-3 py-1.5 rounded-full transition-colors border border-transparent hover:border-gray-200"
                            aria-label="Tài khoản người dùng"
                            role="button"
                            tabIndex={0}
                        >
                            <Avatar
                                size={30}
                                src={user.picture || user.avatar}
                                icon={<UserOutlined />}
                                className="bg-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate hidden md:block">
                                {user.name || user.email?.split('@')[0]}
                            </span>
                        </div>
                    </Dropdown>
                ) : (
                    <Button
                        type="primary"
                        shape="round"
                        icon={<UserOutlined />}
                        onClick={() => navigate('/login')}
                        className="h-9"
                    >
                        Đăng nhập
                    </Button>
                )}
            </div>
        </header>
    )
}
