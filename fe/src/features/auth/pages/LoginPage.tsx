import { GoogleLogin } from '@react-oauth/google'
import { theme } from '@/lib/theme'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import { Typography, Flex } from 'antd'

const { Title, Text } = Typography

export const LoginPage = () => {
    const { handleCredential } = useGoogleAuth()

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: theme.gradientHero,
                padding: '40px 20px',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Decorative blurs */}
            <div
                style={{
                    position: 'absolute',
                    top: '10%',
                    left: '15%',
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(239, 108, 0, 0.08) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    pointerEvents: 'none',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '10%',
                    right: '10%',
                    width: 250,
                    height: 250,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 152, 0, 0.06) 0%, transparent 70%)',
                    filter: 'blur(50px)',
                    pointerEvents: 'none',
                }}
            />

            {/* Card */}
            <div
                style={{
                    background: theme.surface,
                    borderRadius: 24,
                    padding: '44px 48px',
                    width: '100%',
                    maxWidth: 440,
                    boxShadow: theme.shadowHover,
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Flex vertical align="center" style={{ marginBottom: 32 }}>
                    <div
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: theme.radius,
                            background: theme.gradientPrimary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 8,
                            fontSize: 24,
                            fontWeight: 800,
                            color: theme.onPrimary,
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            letterSpacing: -1,
                        }}
                    >
                        RR
                    </div>
                    <Title level={3} style={{ margin: 0, color: theme.text }}>
                        Restaurant Review
                    </Title>
                    <Text type="secondary">Sign in to continue</Text>
                </Flex>

                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <GoogleLogin
                        onSuccess={(r) => r.credential && handleCredential(r.credential)}
                        onError={() => { }}
                        width={300}
                        size="large"
                        text="continue_with"
                        shape="rectangular"
                        theme="outline"
                    />
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', gap: 24, marginTop: 32 }}>
                    {['Privacy Policy', 'Terms of Service'].map((l) => (
                        <a
                            key={l}
                            href="#"
                            style={{
                                fontSize: 12,
                                color: theme.textMuted,
                                textDecoration: 'none',
                                fontWeight: 500,
                            }}
                        >
                            {l}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    )
}
