import { Button } from 'antd'
import { AimOutlined } from '@ant-design/icons'

interface MapControlsProps {
    onFlyToUser: () => void
}

export default function MapControls({ onFlyToUser }: MapControlsProps) {
    return (
        <div className="absolute bottom-6 right-4 z-[1000]">
            <Button
                shape="circle"
                icon={<AimOutlined />}
                onClick={onFlyToUser}
                style={{
                    width: 44,
                    height: 44,
                    fontSize: 20,
                    background: 'white',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    color: '#2563eb',
                }}
                aria-label="Về vị trí của tôi"
            />
        </div>
    )
}
