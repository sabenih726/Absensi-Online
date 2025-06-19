"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Calendar, Clock, MapPin, User, Camera, X, Eye } from "lucide-react"

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

export default function DatabaseView({ records, onClose }: DatabaseViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "masuk" | "keluar">("all")
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)

  const filteredRecords = records.filter((record) => {
    const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || record.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const exportToCSV = () => {
    const csvContent = [
      ["Nama", "Tanggal", "Waktu", "Status", "Lokasi"],
      ...filteredRecords.map((record) => [record.name, record.date, record.time, record.status, record.location]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `absensi-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusStats = () => {
    const masuk = records.filter((r) => r.status === "masuk").length
    const keluar = records.filter((r) => r.status === "keluar").length
    return { masuk, keluar, total: records.length }
  }

  const stats = getStatusStats()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Database Absensi</h2>
            <p className="text-gray-600">Kelola dan lihat semua data kehadiran</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="p-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Absensi</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Absen Masuk</p>
                    <p className="text-2xl font-bold text-green-600">{stats.masuk}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Absen Keluar</p>
                    <p className="text-2xl font-bold text-red-600">{stats.keluar}</p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari nama karyawan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                size="sm"
              >
                Semua
              </Button>
              <Button
                variant={filterStatus === "masuk" ? "default" : "outline"}
                onClick={() => setFilterStatus("masuk")}
                size="sm"
              >
                Masuk
              </Button>
              <Button
                variant={filterStatus === "keluar" ? "default" : "outline"}
                onClick={() => setFilterStatus("keluar")}
                size="sm"
              >
                Keluar
              </Button>
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto p-6">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Tidak ada data absensi yang ditemukan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((record) => (
                <div key={record.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {record.faceImage ? (
                        <img
                          src={record.faceImage || "/placeholder.svg"}
                          alt="Face verification"
                          className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{record.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {record.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {record.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {record.location}
                          </span>
                        </div>
                        {record.faceImage && (
                          <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                            <Camera className="w-3 h-3" />
                            Terverifikasi dengan foto
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={record.status === "masuk" ? "default" : "destructive"}
                        className={record.status === "masuk" ? "bg-green-100 text-green-800" : ""}
                      >
                        {record.status === "masuk" ? "Masuk" : "Keluar"}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(record)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Detail Absensi</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                {selectedRecord.faceImage && (
                  <div className="text-center">
                    <img
                      src={selectedRecord.faceImage || "/placeholder.svg"}
                      alt="Face verification"
                      className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-blue-200"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <div>
                    <strong>Nama:</strong> {selectedRecord.name}
                  </div>
                  <div>
                    <strong>Tanggal:</strong> {selectedRecord.date}
                  </div>
                  <div>
                    <strong>Waktu:</strong> {selectedRecord.time}
                  </div>
                  <div>
                    <strong>Status:</strong>
                    <Badge className="ml-2" variant={selectedRecord.status === "masuk" ? "default" : "destructive"}>
                      {selectedRecord.status === "masuk" ? "Masuk" : "Keluar"}
                    </Badge>
                  </div>
                  <div>
                    <strong>Lokasi:</strong> {selectedRecord.location}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
