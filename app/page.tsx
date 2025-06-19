"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, User, Calendar, Camera, X, Database } from "lucide-react"
import FaceCapture from "./components/face-capture"
import AdminPanel from "./components/admin-panel"

interface AttendanceRecord {
  id: string
  name: string
  time: string
  date: string
  location: string
  status: "masuk" | "keluar"
  faceImage?: string
}

interface DatabaseViewProps {
  records: AttendanceRecord[]
  onClose: () => void
}

const DatabaseView: React.FC<DatabaseViewProps> = ({ records, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Database Absensi</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        {records.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Belum ada data absensi</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Nama</th>
                <th className="text-left">Waktu</th>
                <th className="text-left">Tanggal</th>
                <th className="text-left">Lokasi</th>
                <th className="text-left">Status</th>
                <th className="text-left">Wajah</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b">
                  <td className="py-2">{record.name}</td>
                  <td className="py-2">{record.time}</td>
                  <td className="py-2">{record.date}</td>
                  <td className="py-2">{record.location}</td>
                  <td className="py-2">{record.status}</td>
                  <td className="py-2">
                    {record.faceImage ? (
                      <img
                        src={record.faceImage || "/placeholder.svg"}
                        alt="Face verification"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      "Tidak ada"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default function AttendanceApp() {
  const [name, setName] = useState("")
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [currentLocation, setCurrentLocation] = useState("Mendeteksi lokasi...")
  const [showFaceCapture, setShowFaceCapture] = useState(false)
  const [pendingAttendance, setPendingAttendance] = useState<"masuk" | "keluar" | null>(null)
  const [showDatabase, setShowDatabase] = useState(false)

  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  const handleAdminLogin = () => {
    if (adminPassword === "admin123") {
      setIsAdmin(true)
      setShowAdminLogin(false)
      setShowDatabase(true)
      setAdminPassword("")
      setLoginError("")
    } else {
      setLoginError("Password admin salah!")
    }
  }

  const handleAdminLogout = () => {
    setIsAdmin(false)
    setShowDatabase(false)
  }

  const handleDatabaseAccess = () => {
    if (isAdmin) {
      setShowDatabase(true)
    } else {
      setShowAdminLogin(true)
    }
  }

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
    setRecords((prev) => prev.filter((record) => record.id !== id))
  }

  const exportAllData = () => {
    const csvContent = [
      ["ID", "Nama", "Tanggal", "Waktu", "Status", "Lokasi", "Verifikasi"],
      ...records.map((record) => [
        record.id,
        record.name,
        record.date,
        record.time,
        record.status,
        record.location,
        record.faceImage ? "Terverifikasi" : "Tidak ada foto",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `semua-absensi-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sistem Absensi Online</h1>
          <p className="text-gray-600">Catat kehadiran Anda dengan deteksi wajah</p>
        </div>

        {/* Admin Access Section */}
        <div className="flex justify-center">
          {isAdmin ? (
            <div className="flex gap-2">
              <Button onClick={() => setShowDatabase(!showDatabase)} className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                {showDatabase ? "Tutup Database" : "Lihat Database Absensi"}
              </Button>
              <Button onClick={handleAdminLogout} variant="outline" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Logout Admin
              </Button>
            </div>
          ) : (
            <Button onClick={handleDatabaseAccess} variant="outline" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Akses Admin Database
            </Button>
          )}
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

        {/* Admin Login Modal */}
        {showAdminLogin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Login Admin</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAdminLogin(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-gray-600">Masukkan password admin untuk mengakses database absensi</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password Admin</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Masukkan password admin"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAdminLogin()}
                  />
                  {loginError && <p className="text-sm text-red-600">{loginError}</p>}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAdminLogin} className="flex-1">
                    Login
                  </Button>
                  <Button onClick={() => setShowAdminLogin(false)} variant="outline">
                    Batal
                  </Button>
                </div>
              </div>
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

        {/* Admin Panel */}
        {showDatabase && isAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Database Admin</h2>
                  <Button variant="ghost" onClick={() => setShowDatabase(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <AdminPanel records={records} onDeleteRecord={handleDeleteRecord} onExportData={exportAllData} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
