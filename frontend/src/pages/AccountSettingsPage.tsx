import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import { Button, Input } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { updateMyProfile, uploadReportImage } from '../api'

export function AccountSettingsPage() {
  const navigate = useNavigate()
  const { authState, refreshUser } = useAuth()
  const user = authState.status === 'authenticated' ? authState.user : null

  // ── Username ────────────────────────────────────────────────────────────────
  const [username, setUsername] = useState(user?.username ?? '')
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [usernameSuccess, setUsernameSuccess] = useState(false)

  // ── Password ────────────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // ── Profile photo ───────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [photoSuccess, setPhotoSuccess] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profileImageUrl ?? null)

  if (!user) return null

  const displayUsername = user.username ?? `User${user.id}`
  const hasPassword = user.hasPassword

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleSaveUsername(e: React.FormEvent) {
    e.preventDefault()
    setUsernameError(null)
    setUsernameSuccess(false)
    const trimmed = username.trim()
    if (trimmed.length < 3 || trimmed.length > 50) {
      setUsernameError('Username must be between 3 and 50 characters')
      return
    }
    setUsernameLoading(true)
    try {
      await updateMyProfile({ username: trimmed })
      await refreshUser()
      setUsernameSuccess(true)
    } catch (err) {
      setUsernameError(err instanceof Error ? err.message : 'Failed to update username')
    } finally {
      setUsernameLoading(false)
    }
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }
    setPasswordLoading(true)
    try {
      await updateMyProfile({
        currentPassword: currentPassword || undefined,
        newPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSuccess(true)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setPasswordLoading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const previousUrl = previewUrl
    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)
    handleUploadPhoto(file, previousUrl)
  }

  async function handleUploadPhoto(file: File, previousUrl: string | null) {
    setPhotoError(null)
    setPhotoSuccess(false)
    setPhotoLoading(true)
    try {
      const { imageUrl } = await uploadReportImage(file)
      await updateMyProfile({ profileImageUrl: imageUrl })
      await refreshUser()
      setPhotoSuccess(true)
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Failed to upload photo')
      setPreviewUrl(previousUrl)
    } finally {
      setPhotoLoading(false)
    }
  }

  async function handleRemovePhoto() {
    setPhotoError(null)
    setPhotoSuccess(false)
    setPhotoLoading(true)
    try {
      await updateMyProfile({ profileImageUrl: null })
      await refreshUser()
      setPreviewUrl(null)
      setPhotoSuccess(true)
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Failed to remove photo')
    } finally {
      setPhotoLoading(false)
    }
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-6 mt-2 mx-4 mb-8">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="self-start text-base font-medium transition-colors hover:opacity-80"
          style={{ color: 'var(--color-text-body)' }}
        >
          ← Back
        </button>

        <header className="text-center">
          <h1 className="mb-2">Account settings</h1>
          <p className="text-base" style={{ color: 'var(--color-text-muted)' }}>
            Update your profile photo, username, and password.
          </p>
        </header>

        {/* ── Profile photo ─────────────────────────────────────────────── */}
        <section className="card flex flex-col gap-4">
          <h2 className="mb-0">Profile photo</h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Upload a photo for your profile and the leaderboard.
          </p>
          <div className="flex items-start gap-3 sm:items-center sm:gap-4">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile"
                className="h-20 w-20 rounded-full object-cover shrink-0"
                onError={() => setPreviewUrl(null)}
              />
            ) : (
              <div
                className="h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0"
                style={{ backgroundColor: 'var(--color-green-dark)' }}
              >
                {displayUsername.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:flex-none">
              <Button
                variant="secondary"
                type="button"
                disabled={photoLoading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-4 py-2.5 text-[15px]"
              >
                {photoLoading ? 'Uploading…' : 'Change photo'}
              </Button>
              {previewUrl && (
                <Button
                  variant="secondary"
                  type="button"
                  disabled={photoLoading}
                  onClick={handleRemovePhoto}
                  className="w-full sm:w-auto px-4 py-2.5 text-[15px]"
                >
                  Remove
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          {photoError && (
            <p className="text-sm" style={{ color: 'var(--color-red, #dc2626)' }}>
              {photoError}
            </p>
          )}
          {photoSuccess && (
            <p className="text-sm" style={{ color: 'var(--color-green-dark)' }}>
              Photo updated.
            </p>
          )}
        </section>

        {/* ── Username ──────────────────────────────────────────────────── */}
        <section className="card flex flex-col gap-4">
          <h2 className="mb-0">Username</h2>
          <form onSubmit={handleSaveUsername} className="flex flex-col gap-4">
            <Input
              label="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setUsernameSuccess(false)
              }}
              placeholder="Your username"
              minLength={3}
              maxLength={50}
            />
            {usernameError && (
              <p className="text-sm" style={{ color: 'var(--color-red, #dc2626)' }}>
                {usernameError}
              </p>
            )}
            {usernameSuccess && (
              <p className="text-sm" style={{ color: 'var(--color-green-dark)' }}>
                Username updated.
              </p>
            )}
            <Button variant="primary" type="submit" fullWidth disabled={usernameLoading}>
              {usernameLoading ? 'Saving…' : 'Save username'}
            </Button>
          </form>
        </section>

        {/* ── Password ──────────────────────────────────────────────────── */}
        <section className="card flex flex-col gap-4">
          <h2 className="mb-0">Password</h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Signed in as {user.email}
          </p>
          <form onSubmit={handleSavePassword} className="flex flex-col gap-4">
            {hasPassword && (
              <Input
                label="Current password"
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value)
                  setPasswordSuccess(false)
                }}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            )}
            <Input
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                setPasswordSuccess(false)
              }}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <Input
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setPasswordSuccess(false)
              }}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {passwordError && (
              <p className="text-sm" style={{ color: 'var(--color-red, #dc2626)' }}>
                {passwordError}
              </p>
            )}
            {passwordSuccess && (
              <p className="text-sm" style={{ color: 'var(--color-green-dark)' }}>
                Password updated.
              </p>
            )}
            <Button variant="primary" type="submit" fullWidth disabled={passwordLoading}>
              {passwordLoading ? 'Saving…' : 'Save password'}
            </Button>
          </form>
        </section>
      </div>
    </PageShell>
  )
}
