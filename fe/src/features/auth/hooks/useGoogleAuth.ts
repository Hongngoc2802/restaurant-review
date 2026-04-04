import { useMutation } from '@tanstack/react-query'
import { message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api'

export const useGoogleAuth = () => {
    const navigate = useNavigate()

    const { mutate: handleCredential } = useMutation({
        mutationFn: authApi.googleLogin,
        onSuccess: (data) => {
            localStorage.setItem('access_token', data.access_token)
            localStorage.setItem('user', JSON.stringify(data.user))
            message.success('Login successful!')
            navigate('/')
        },
        onError: () => {
            message.error('Login failed, please try again later.')
        },
    })

    return { handleCredential }
}
