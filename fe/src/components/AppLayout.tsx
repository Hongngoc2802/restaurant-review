import { Outlet } from 'react-router-dom'
import Header from '@/components/Header'
import Sidebar from '@/features/sidebar/Sidebar'
import { MapProvider } from '@/features/map/MapContext'
import ReviewDrawer from '@/features/restaurants/components/ReviewDrawer'
import { useMapContext } from '@/features/map/MapContext'

function LayoutInner() {
    const { drawerTarget, setDrawerTarget } = useMapContext()
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 relative overflow-hidden">
                    <Outlet />
                </main>
            </div>
            <ReviewDrawer restaurant={drawerTarget} onClose={() => setDrawerTarget(null)} />
        </div>
    )
}

export default function AppLayout() {
    return (
        <MapProvider>
            <LayoutInner />
        </MapProvider>
    )
}
