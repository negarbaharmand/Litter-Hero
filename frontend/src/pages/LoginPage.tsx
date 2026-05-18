import { useEffect, useRef, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { loginUser, registerUser, googleSignIn } from '../api'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const googleWrapperRef = useRef<HTMLDivElement>(null)
  const [googleBtnWidth, setGoogleBtnWidth] = useState(320)

  useEffect(() => {
    if (!googleWrapperRef.current) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setGoogleBtnWidth(Math.min(Math.round(entry.contentRect.width), 400))
    })
    observer.observe(googleWrapperRef.current)
    return () => observer.disconnect()
  }, [])

  const form = useForm({
    defaultValues: {
      username: '',
      name: '',
      email: '',
      password: '',
      isRegistering: false,
      showPassword: false,
    },
    onSubmit: async ({ value }) => {
      setApiError(null)
      setIsLoading(true)
      try {
        const result = value.isRegistering
          ? await registerUser(value.email, value.password, value.username || undefined, value.name || undefined)
          : await loginUser(value.email, value.password)

        setUser(result.user, result.token)
        navigate('/')
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setIsLoading(false)
      }
    },
  })

  return (
    <div className="login-page login-page__container">
      <div className="login-page__content">
        <form.Subscribe selector={(state) => state.values.isRegistering}>
          {(isRegistering) => (
            <h1 className="login-page__heading">
              {isRegistering ? 'Create new account' : 'Login'}
            </h1>
          )}
        </form.Subscribe>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="login-page__form"
        >
          <form.Subscribe selector={(state) => state.values.isRegistering}>
            {(isRegistering) =>
              isRegistering && (
                <div>
                  <label htmlFor="name" className="login-page__label">Name</label>
                  <form.Field
                    name="name"
                    validators={{
                      onBlur: ({ value }) => (!value ? 'Name is required' : undefined),
                    }}
                  >
                    {(field) => (
                      <>
                        <input
                          id="name"
                          type="text"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="Your name"
                          className="login-page__input"
                        />
                        {field.state.meta.errors[0] && (
                          <p className="login-page__field-error">{field.state.meta.errors[0]}</p>
                        )}
                      </>
                    )}
                  </form.Field>
                </div>
              )
            }
          </form.Subscribe>


          <form.Subscribe selector={(state) => state.values.isRegistering}>
            {(isRegistering) =>
              isRegistering && (
                <div>
                  <label htmlFor="username" className="login-page__label">Username</label>
                  <form.Field
                    name="username"
                    validators={{
                      onBlur: ({ value }) =>
                        !value ? 'Username is required'
                        : value.length < 3 ? 'Username must be at least 3 characters'
                        : undefined,
                    }}
                  >
                    {(field) => (
                      <>
                        <input
                          id="username"
                          type="text"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="Your username"
                          className="login-page__input"
                        />
                        {field.state.meta.errors[0] && (
                          <p className="login-page__field-error">{field.state.meta.errors[0]}</p>
                        )}
                      </>
                    )}
                  </form.Field>
                </div>
              )
            }

          </form.Subscribe>

          <div>
            <label htmlFor="email" className="login-page__label">Email</label>
            <form.Field
              name="email"
              validators={{
                onBlur: ({ value }) =>
                  !value ? 'Email is required'
                  : !/.+@.+\..+/.test(value) ? 'Please enter a valid email'
                  : undefined,
              }}
            >
              {(field) => (
                <>
                  <input
                    id="email"
                    type="email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="your@email.com"
                    className="login-page__input"
                  />
                  {field.state.meta.errors[0] && (
                    <p className="login-page__field-error">{field.state.meta.errors[0]}</p>
                  )}
                </>
              )}
            </form.Field>
          </div>

          <div>
            <label htmlFor="password" className="login-page__label">Password</label>
            <div className="login-page__password-wrapper">
              <form.Subscribe selector={(state) => state.values.showPassword}>
                {(showPassword) => (
                  <>
                    <form.Field
                      name="password"
                      validators={{
                        onBlur: ({ value }) => {
                          if (!value) return 'Password is required'
                          if (form.getFieldValue('isRegistering') && value.length < 8) {
                            return 'Password must be at least 8 characters'
                          }
                          return undefined
                        },
                      }}
                    >
                      {(field) => (
                        <>
                          <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            placeholder="••••••••"
                            className="login-page__input login-page__input--with-toggle"
                          />
                          {field.state.meta.errors[0] && (
                            <p className="login-page__field-error">{field.state.meta.errors[0]}</p>
                          )}
                        </>
                      )}
                    </form.Field>
                    <button
                      type="button"
                      onClick={() => form.setFieldValue('showPassword', !showPassword)}
                      className="login-page__password-toggle"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </>
                )}
              </form.Subscribe>
            </div>
          </div>

          {apiError && (
            <p className="text-sm text-red-500 text-center -mt-1">{apiError}</p>
          )}

          <button type="submit" disabled={isLoading} className="login-page__submit">
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                  <path d="M21 12a9 9 0 1 1-6.22-8.56" />
                </svg>
                Please wait…
              </span>
            ) : (
              <form.Subscribe selector={(state) => state.values.isRegistering}>
                {(isRegistering) => (isRegistering ? 'Create new account' : 'Login')}
              </form.Subscribe>
            )}
          </button>
        </form>

        <form.Subscribe selector={(state) => state.values.isRegistering}>
          {(isRegistering) => (
            <div ref={googleWrapperRef} className="login-page__google-btn-wrapper" hidden={isRegistering}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setApiError('Google sign-in failed')}
                theme="outline"
                size="large"
                shape="rectangular"
                text="continue_with"
                width={googleBtnWidth.toString()}
              />
            </div>
          )}
        </form.Subscribe>

        <form.Subscribe selector={(state) => state.values.isRegistering}>
          {(isRegistering) => !isRegistering ? (
            <>
              <div className="login-page__secondary-actions">
                <button
                  type="button"
                  onClick={() => {
                    form.setFieldValue('username', '')
                    form.setFieldValue('name', '')
                    form.setFieldValue('email', '')
                    form.setFieldValue('password', '')
                    form.setFieldValue('showPassword', false)
                    form.setFieldValue('isRegistering', true)
                  }}
                  className="login-page__secondary-btn"
                >
                  Create new account
                </button>
                <button type="button" onClick={handleGuestContinue} className="login-page__secondary-btn">
                  Continue as guest
                </button>
              </div>

              <p className="login-page__guest-note">
                As a guest you can still report trash but you can't collect points.
              </p>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                form.setFieldValue('username', '')
                form.setFieldValue('name', '')
                form.setFieldValue('email', '')
                form.setFieldValue('password', '')
                form.setFieldValue('showPassword', false)
                form.setFieldValue('isRegistering', false)
              }}
              className="login-page__toggle-link"
            >
              Already have an account? Login
            </button>
          )}
        </form.Subscribe>
      </div>

    </div>
  )

  async function handleGoogleSuccess(credentialResponse: { credential?: string }) {
    if (!credentialResponse.credential) {
      setApiError('Google sign-in failed')
      return
    }
    setApiError(null)
    setIsLoading(true)
    try {
      const result = await googleSignIn(credentialResponse.credential)
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      navigate('/')
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  function handleGuestContinue() {
    navigate('/')
  }
}
