import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { verifyEmail, resendVerification } from '../api'

type ErrorCode = 'EXPIRED' | 'INVALID_LINK' | 'UNKNOWN'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your email...')
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null)
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const email = searchParams.get('email')
  const hasVerified = useRef(false)

  useEffect(() => {
    if (hasVerified.current) return
    hasVerified.current = true

    const token = searchParams.get('token')

    if (!email || !token) {
      setStatus('error')
      setErrorCode('INVALID_LINK')
      setMessage('The verification link is missing required information.')
      return
    }

    verifyEmail(email, token)
      .then((result) => {
        setStatus('success')
        setMessage(result.message || 'Email verified successfully. You can now log in.')
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Email verification failed'
        setStatus('error')
        setMessage(msg)
        if (msg.toLowerCase().includes('expired')) setErrorCode('EXPIRED')
        else if (msg.toLowerCase().includes('invalid')) setErrorCode('INVALID_LINK')
        else setErrorCode('UNKNOWN')
      })
  }, [searchParams])

  async function handleResend() {
    if (!email) return
    setResendStatus('sending')
    try {
      await resendVerification(email)
    } finally {
      setResendStatus('sent')
    }
  }

  const showResend = status === 'error' && email && (errorCode === 'EXPIRED' || errorCode === 'INVALID_LINK')

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-page-bg)' }}>
      <div className="card w-full max-w-md text-center flex flex-col gap-4">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Email Verification
        </h1>

        {status === 'loading' && (
          <p className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>{message}</p>
        )}

        {status === 'success' && (
          <>
            <p className="text-body-sm" style={{ color: 'var(--color-green-dark)' }}>{message}</p>
            <button type="button" className="btn-primary w-full" onClick={() => navigate('/login')}>
              Go to Login
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <p className="text-body-sm" style={{ color: '#b42318' }}>{message}</p>

            {showResend && (
              resendStatus === 'sent' ? (
                <p className="text-body-sm" style={{ color: 'var(--color-green-dark)' }}>
                  A new link has been sent. Check your inbox and spam folder.
                </p>
              ) : (
                <button
                  type="button"
                  className="btn-secondary w-full"
                  onClick={handleResend}
                  disabled={resendStatus === 'sending'}
                >
                  {resendStatus === 'sending' ? 'Sending…' : 'Resend verification email'}
                </button>
              )
            )}

            <button type="button" className="btn-primary w-full" onClick={() => navigate('/login')}>
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  )
}
