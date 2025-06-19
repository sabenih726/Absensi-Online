"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, User, Calendar, Camera, X } from "lucide-react"
import FaceCapture from "./components/face-capture"

// Tambahkan fungsi helper untuk localStorage
const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}

const loadFromLocalStorage = (key: string) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error("Error loading from localStorage:", error)
    return null
  }
}

interface AttendanceRecord {
  id: string
  name: string
  time: string
  date: string
  location: string
  status: "masuk" | "keluar"
  faceImage?: string
}

export default function AttendanceApp() {
  const [name, setName] = useState("")
  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    if (typeof window !== "undefined") {
      return loadFromLocalStorage("attendance-records") || []
    }
    return []
  })
  const [currentLocation, setCurrentLocation] = useState("Mendeteksi lokasi...")
  const [showFaceCapture, setShowFaceCapture] = useState(false)
  const [pendingAttendance, setPendingAttendance] = useState<"masuk" | "keluar" | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`)
        },
        () => {
          setCurrentLocation("Lokasi tidak dapat dideteksi")
        },
      )
    }
  }, [])

  // Tambahkan useEffect ini setelah useEffect yang sudah ada
  useEffect(() => {
    saveToLocalStorage("attendance-records", records)
  }, [records])

  const handleAttendanceClick = (status: "masuk" | "keluar") => {
    if (!name.trim()) {
      alert("Silakan masukkan nama Anda")
      return
    }

    setPendingAttendance(status)
    setShowFaceCapture(true)
  }

  const handleFaceCapture = (faceImage: string) => {
    if (!pendingAttendance) return

    const now = new Date()
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      name: name.trim(),
      time: now.toLocaleTimeString("id-ID"),
      date: now.toLocaleDateString("id-ID"),
      location: currentLocation,
      status: pendingAttendance,
      faceImage,
    }

    setRecords((prev) => [newRecord, ...prev])
    setName("")
    setShowFaceCapture(false)
    setPendingAttendance(null)
  }

  const handleCancelCapture = () => {
    setShowFaceCapture(false)
    setPendingAttendance(null)
  }

  const handleDeleteRecord = (id: string) => {
    const updatedRecords = records.filter((record) => record.id !== id)
    setRecords(updatedRecords)
    saveToLocalStorage("attendance-records", updatedRecords)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sistem Absensi Online</h1>
          <p className="text-gray-600">Catat kehadiran Anda dengan deteksi wajah</p>
        </div>

        {/* Face Capture Modal */}
        {showFaceCapture && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Verifikasi Wajah</h3>
                <Button variant="ghost" size="sm" onClick={handleCancelCapture}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <FaceCapture
                onCapture={handleFaceCapture}
                onCancel={handleCancelCapture}
                attendanceType={pendingAttendance}
              />
            </div>
          </div>
        )}

        {/* Attendance Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Form Absensi
            </CardTitle>
            <CardDescription>Masukkan nama Anda dan lakukan verifikasi wajah</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                placeholder="Masukkan nama lengkap Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>Lokasi: {currentLocation}</span>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Camera className="w-4 h-4" />
                <span>Sistem akan mengambil foto wajah Anda untuk verifikasi</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => handleAttendanceClick("masuk")}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={showFaceCapture}
              >
                <Clock className="w-4 h-4 mr-2" />
                Absen Masuk
              </Button>
              <Button
                onClick={() => handleAttendanceClick("keluar")}
                variant="destructive"
                className="flex-1"
                disabled={showFaceCapture}
              >
                <Clock className="w-4 h-4 mr-2" />
                Absen Keluar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Time Display */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-gray-900 mb-2">
                {new Date().toLocaleTimeString("id-ID")}
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Riwayat Absensi Hari Ini</CardTitle>
            <CardDescription>Daftar absensi yang telah tercatat dengan foto verifikasi</CardDescription>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Belum ada data absensi hari ini</div>
            ) : (
              <div className="space-y-3">
                {records.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {record.faceImage ? (
                        <img
                          src={record.faceImage || "/placeholder.svg"}
                          alt="Face verification"
                          className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold">{record.name}</div>
                        <div className="text-sm text-gray-600">
                          {record.date} • {record.time}
                        </div>
                        <div className="text-xs text-gray-500">📍 {record.location}</div>
                        {record.faceImage && (
                          <div className="text-xs text-green-600 flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            Terverifikasi
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={record.status === "masuk" ? "default" : "destructive"}
                      className={record.status === "masuk" ? "bg-green-100 text-green-800" : ""}
                    >
                      {record.status === "masuk" ? "Masuk" : "Keluar"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
