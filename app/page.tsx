"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, User, Calendar, Camera, X, Database, Download, Trash2, Search } from "lucide-react"
import FaceCapture from "./components/face-capture"
import { supabase, type AttendanceRecord } from "@/lib/supabase"

export default function AttendanceApp() {
  const [name, setName] = useState("")
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [currentLocation, setCurrentLocation] = useState("Mendeteksi lokasi...")
  const [showFaceCapture, setShowFaceCapture] = useState(false)
  const [pendingAttendance, setPendingAttendance] = useState<"masuk" | "keluar" | null>(null)
  const [showDatabase, setShowDatabase] = useState(false)
  const [loading, setLoading] = useState(true)

  // Admin states
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // Load data from Supabase on component mount
  useEffect(() => {
    loadAttendanceRecords()
  }, [])

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

  const loadAttendanceRecords = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("attendance").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading attendance records:", error)
        return
      }

      const formattedRecords: AttendanceRecord[] = data.map((record) => ({
        id: record.id,
        name: record.name,
        time: record.time,
        date: record.date,
        location: record.location,
        status: record.status,
        face_image: record.face_image,
        created_at: record.created_at,
      }))

      setRecords(formattedRecords)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

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

  const handleAttendanceClick = (status: "masuk" | "keluar") => {
    if (!name.trim()) {
      alert("Silakan masukkan nama Anda")
      return
    }

    setPendingAttendance(status)
    setShowFaceCapture(true)
  }

  const handleFaceCapture = async (faceImage: string) => {
    if (!pendingAttendance) return

    try {
      const now = new Date()
      const newRecord = {
        name: name.trim(),
        time: now.toLocaleTimeString("id-ID"),
        date: now.toLocaleDateString("id-ID"),
        location: currentLocation,
        status: pendingAttendance,
        face_image: faceImage,
      }

      const { data, error } = await supabase.from("attendance").insert([newRecord]).select()

      if (error) {
        console.error("Error saving attendance:", error)
        alert("Gagal menyimpan data absensi. Silakan coba lagi.")
        return
      }

      // Reload data from database
      await loadAttendanceRecords()

      setName("")
      setShowFaceCapture(false)
      setPendingAttendance(null)

      alert(`Absensi ${pendingAttendance} berhasil disimpan!`)
    } catch (error) {
      console.error("Error:", error)
      alert("Terjadi kesalahan. Silakan coba lagi.")
    }
  }

  const handleCancelCapture = () => {
    setShowFaceCapture(false)
    setPendingAttendance(null)
  }

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return

    try {
      const { error } = await supabase.from("attendance").delete().eq("id", id)

      if (error) {
        console.error("Error deleting record:", error)
        alert("Gagal menghapus data. Silakan coba lagi.")
        return
      }

      // Reload data from database
      await loadAttendanceRecords()
      alert("Data berhasil dihapus!")
    } catch (error) {
      console.error("Error:", error)
      alert("Terjadi kesalahan. Silakan coba lagi.")
    }
  }

  const exportAllData = () => {
    const csvContent = [
      ["ID", "Nama", "Tanggal", "Waktu", "Status", "Lokasi", "Verifikasi", "Dibuat"],
      ...records.map((record) => [
        record.id,
        record.name,
        record.date,
        record.time,
        record.status,
        record.location,
        record.face_image ? "Terverifikasi" : "Tidak ada foto",
        record.created_at,
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

  // Filter records based on search term
  const filteredRecords = records.filter(
    (record) =>
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.date.includes(searchTerm) ||
      record.status.includes(searchTerm),
  )

  // Calculate statistics
  const todayRecords = records.filter((record) => record.date === new Date().toLocaleDateString("id-ID"))
  const masukCount = todayRecords.filter((record) => record.status === "masuk").length
  const keluarCount = todayRecords.filter((record) => record.status === "keluar").length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data absensi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ABSENSI LAMAN DAVINDO BAHMAN</h1>
          <p className="text-gray-600">tidak absen gaji akan dipotong</p>
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
                {records.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {record.face_image ? (
                        <img
                          src={record.face_image || "/placeholder.svg"}
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
                        {record.face_image && (
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
                {records.length > 5 && (
                  <div className="text-center text-sm text-gray-500">
                    Dan {records.length - 5} data lainnya... (Lihat semua di Admin Dashboard)
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Panel Modal */}
        {showDatabase && isAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                  <Button variant="ghost" onClick={() => setShowDatabase(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-600">{records.length}</div>
                      <div className="text-sm text-gray-600">Total Absensi</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">{masukCount}</div>
                      <div className="text-sm text-gray-600">Masuk Hari Ini</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-red-600">{keluarCount}</div>
                      <div className="text-sm text-gray-600">Keluar Hari Ini</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-purple-600">{todayRecords.length}</div>
                      <div className="text-sm text-gray-600">Total Hari Ini</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Cari berdasarkan nama, tanggal, atau status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button onClick={exportAllData} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export CSV
                  </Button>
                </div>

                {/* Data Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Semua Data Absensi ({filteredRecords.length} records)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Foto</th>
                            <th className="text-left p-2">Nama</th>
                            <th className="text-left p-2">Tanggal</th>
                            <th className="text-left p-2">Waktu</th>
                            <th className="text-left p-2">Status</th>
                            <th className="text-left p-2">Lokasi</th>
                            <th className="text-left p-2">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRecords.map((record) => (
                            <tr key={record.id} className="border-b hover:bg-gray-50">
                              <td className="p-2">
                                {record.face_image ? (
                                  <img
                                    src={record.face_image || "/placeholder.svg"}
                                    alt="Face"
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-gray-500" />
                                  </div>
                                )}
                              </td>
                              <td className="p-2 font-medium">{record.name}</td>
                              <td className="p-2">{record.date}</td>
                              <td className="p-2">{record.time}</td>
                              <td className="p-2">
                                <Badge
                                  variant={record.status === "masuk" ? "default" : "destructive"}
                                  className={record.status === "masuk" ? "bg-green-100 text-green-800" : ""}
                                >
                                  {record.status === "masuk" ? "Masuk" : "Keluar"}
                                </Badge>
                              </td>
                              <td className="p-2 text-xs text-gray-600 max-w-32 truncate">{record.location}</td>
                              <td className="p-2">
                                <Button
                                  onClick={() => handleDeleteRecord(record.id!)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {filteredRecords.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        {searchTerm ? "Tidak ada data yang sesuai dengan pencarian" : "Belum ada data absensi"}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
