"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera, RotateCcw, Check, AlertCircle } from "lucide-react"

interface FaceCaptureProps {
  onCapture: (imageData: string) => void
  onCancel: () => void
  attendanceType: "masuk" | "keluar" | null
}

export default function FaceCapture({ onCapture, onCancel, attendanceType }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)

  useEffect(() => {
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      })

      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.onloadedmetadata = () => {
          setIsLoading(false)
        }
      }
    } catch (err) {
      setError("Tidak dapat mengakses kamera. Pastikan Anda memberikan izin akses kamera.")
      setIsLoading(false)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    // Countdown before capture
    setCountdown(3)
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval)
          performCapture()
          return null
        }
        return prev ? prev - 1 : null
      })
    }, 1000)
  }

  const performCapture = () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64
    const imageData = canvas.toDataURL("image/jpeg", 0.8)
    setCapturedImage(imageData)
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setCountdown(null)
  }

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage)
    }
  }

  if (error) {
    return (
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Kamera Tidak Tersedia</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <div className="flex gap-2">
            <Button onClick={startCamera} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Coba Lagi
            </Button>
            <Button onClick={onCancel} variant="ghost" size="sm">
              Batal
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="font-semibold mb-2">
          Verifikasi Wajah - Absen {attendanceType === "masuk" ? "Masuk" : "Keluar"}
        </h3>
        <p className="text-sm text-gray-600">Posisikan wajah Anda di tengah kamera</p>
      </div>

      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Memuat kamera...</p>
                </div>
              </div>
            )}
            {countdown && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="text-6xl font-bold text-white animate-pulse">{countdown}</div>
              </div>
            )}
            {/* Face detection overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-blue-400 rounded-full opacity-50"></div>
            </div>
          </>
        ) : (
          <img
            src={capturedImage || "/placeholder.svg"}
            alt="Captured face"
            className="w-full h-64 object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex gap-2">
        {!capturedImage ? (
          <>
            <Button onClick={capturePhoto} className="flex-1" disabled={isLoading || countdown !== null}>
              <Camera className="w-4 h-4 mr-2" />
              {countdown ? `Bersiap... ${countdown}` : "Ambil Foto"}
            </Button>
            <Button onClick={onCancel} variant="outline">
              Batal
            </Button>
          </>
        ) : (
          <>
            <Button onClick={confirmCapture} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Konfirmasi
            </Button>
            <Button onClick={retakePhoto} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Ulangi
            </Button>
          </>
        )}
      </div>

      <div className="text-xs text-gray-500 text-center">Foto wajah akan disimpan sebagai bukti kehadiran</div>
    </div>
  )
}
