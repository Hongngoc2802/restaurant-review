import { apiClient } from '@/lib/axios'

export interface UserInfo {
    id: string
    email: string
    full_name: string
    avatar_url?: string
    role: string
}

export interface AuthResponse {
    access_token: string
    token_type: string
    expires_in: number
    user: UserInfo
}

export const authApi = {
    googleLogin: (credential: string) =>
        apiClient.post<AuthResponse>('/auth/google', { credential }).then((r) => r.data),
}
