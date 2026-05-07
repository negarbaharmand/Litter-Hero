import { useEffect, useRef, useState, useCallback } from 'react'

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void
  onClose: () => void
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setCameraError(null)
    setIsReady(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch {
      setCameraError('Could not access camera. Please check your browser permissions and try again.')
    }
  }, [])

  useEffect(() => {
    startCamera(facingMode)
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [facingMode, startCamera])

  function handleCapture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    onCapture(canvas.toDataURL('image/jpeg', 0.85))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {cameraError ? (
        <div className="flex flex-col items-center justify-center h-full text-white p-8 gap-6">
          <svg width="48" height="48" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-center text-lg">{cameraError}</p>
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-full bg-white text-black font-semibold text-sm"
          >
            Go back
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onCanPlay={() => setIsReady(true)}
            className="w-full h-full object-cover"
          />

          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-4 border-white/30 border-t-white animate-spin" />
            </div>
          )}

          {/* Top controls */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 pt-14 pb-4">
            <button
              onClick={onClose}
              aria-label="Close camera"
              className="w-10 h-10 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center"
            >
              <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M14 4L4 14M4 4l10 10" />
              </svg>
            </button>

            <button
              onClick={() => setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'))}
              aria-label="Flip camera"
              className="w-10 h-10 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center"
            >
              <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M1 4v6h6" />
                <path d="M23 20v-6h-6" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
            </button>
          </div>

          {/* Bottom capture bar */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32 flex items-center justify-center"
            style={{ background: 'linear-gradient(to top, #1A5C35, #37C270)' }}
          >
            <button
              onClick={handleCapture}
              disabled={!isReady}
              aria-label="Take photo"
              className="w-16 h-16 rounded-full border-4 border-white/70 bg-white/25 backdrop-blur-sm disabled:opacity-40 active:scale-95 transition-transform"
            />
          </div>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
