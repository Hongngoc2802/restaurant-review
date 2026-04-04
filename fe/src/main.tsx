import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'

import { ConfigProvider, App as AntdApp } from 'antd'
import enUS from 'antd/locale/en_US'
import { GoogleOAuthProvider } from '@react-oauth/google'

import { router } from '@/app/router'
import { queryClient } from '@/lib/query-client'
import { env } from '@/lib/env'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={env.GOOGLE_CLIENT_ID}>
        <ConfigProvider locale={enUS}>
          <AntdApp>
            <RouterProvider router={router} />
          </AntdApp>
        </ConfigProvider>
      </GoogleOAuthProvider>

    </QueryClientProvider>
  </React.StrictMode>,
)
