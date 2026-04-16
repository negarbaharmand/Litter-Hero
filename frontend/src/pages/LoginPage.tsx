import { useState } from 'react'
import { useForm } from '@tanstack/react-form'

export function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm({
    defaultValues: { name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      if (isRegistering) {
        // TODO: connect to POST /api/users/register
        console.log('Register:', value)
      } else {
        // TODO: connect to POST /api/users/login
        console.log('Login:', { email: value.email, password: value.password })
      }
    },
  })

  const handleGoogleSignIn = () => {
    // TODO: implement Google OAuth
    console.log('Google sign-in clicked')
  }

  const handleGuestContinue = () => {
    // TODO: implement guest mode — navigate to /home and set guest state
    console.log('Continue as guest')
  }

  const toggleMode = () => {
    setIsRegistering(!isRegistering)
    form.reset()
  }

  return (
    <div className="login-page login-page__container">
      <div className="login-page__content">
        <h1 className="login-page__heading">
          {isRegistering ? 'Create new account' : 'Login'}
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="login-page__form"
        >
          {isRegistering && (
            <div>
              <label htmlFor="name" className="login-page__label">
                Name
              </label>
              <form.Field name="name">
                {(field) => (
                  <input
                    id="name"
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Your name"
                    className="login-page__input"
                  />
                )}
              </form.Field>
            </div>
          )}

          <div>
            <label htmlFor="email" className="login-page__label">
              Email
            </label>
            <form.Field name="email">
              {(field) => (
                <input
                  id="email"
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="your@email.com"
                  className="login-page__input"
                />
              )}
            </form.Field>
          </div>

          <div>
            <label htmlFor="password" className="login-page__label">
              Password
            </label>
            <div className="login-page__password-wrapper">
              <form.Field name="password">
                {(field) => (
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="••••••••"
                    className="login-page__input login-page__input--with-toggle"
                  />
                )}
              </form.Field>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
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
            </div>
          </div>

          <button type="submit" className="login-page__submit">
            {isRegistering ? 'Create new account' : 'Login'}
          </button>
        </form>

        {!isRegistering && (
          <>
            <button onClick={handleGoogleSignIn} className="login-page__google-btn">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 5.43l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Login in with Google
            </button>

            <div className="login-page__secondary-actions">
              <button onClick={toggleMode} className="login-page__secondary-btn">
                Create new account
              </button>
              <button onClick={handleGuestContinue} className="login-page__secondary-btn">
                Continue as guest
              </button>
            </div>

            <p className="login-page__guest-note">
              As a guest you can still report trash but you can't collect points.
            </p>
          </>
        )}

        {isRegistering && (
          <button onClick={toggleMode} className="login-page__toggle-link">
            Already have an account? Login
          </button>
        )}
      </div>

      {/* TODO: Replace with shared Navbar component */}
      <nav className="login-page__nav" />
    </div>
  )
}
