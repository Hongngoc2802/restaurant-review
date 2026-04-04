import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Spin } from 'antd'
import { authRoutes } from '@/features/auth/routes'
import AppLayout from '@/components/AppLayout'

const MapPage = lazy(() => import('@/features/map/MapPage'))

const Loading = () => (
    <div className="flex items-center justify-center h-full">
        <Spin size="large" />
    </div>
)

export const router = createBrowserRouter([
    ...authRoutes,

    {
        element: <AppLayout />,
        children: [
            {
                path: '/map',
                element: (
                    <Suspense fallback={<Loading />}>
                        <MapPage />
                    </Suspense>
                ),
            },
        ],
    },
    { path: '/', element: <Navigate to="/map" replace /> },
    { path: '*', element: <Navigate to="/map" replace /> },
])

