"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, Clock, Calendar, Download, Trash2, Eye, AlertTriangle, X } from "lucide-react"

interface AttendanceRecord {
  id: string
  name: string
  time: string
  date: string
  location: string
  status: "masuk" | "keluar"
  faceImage?: string
}

interface AdminPanelProps {
  records: AttendanceRecord[]
  onDeleteRecord: (id: string) => void
  onExportData: () => void
}

export default function AdminPanel({ records, onDeleteRecord, onExportData }: AdminPanelProps) {
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const getStats = () => {
    const today = new Date().toLocaleDateString("id-ID")
    const todayRecords = records.filter((r) => r.date === today)
    const totalToday = todayRecords.length
    const masukToday = todayRecords.filter((r) => r.status === "masuk").length
    const keluarToday = todayRecords.filter((r) => r.status === "keluar").length

    return {
      totalAll: records.length,
      totalToday,
      masukToday,
      keluarToday,
      withPhoto: records.filter((r) => r.faceImage).length,
    }
  }

  const stats = getStats()

  const handleDelete = (id: string) => {
    onDeleteRecord(id)
    setShowDeleteConfirm(null)
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Panel Admin</h2>
        </div>
        <p className="text-blue-100">Kelola sistem absensi dan data karyawan</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Semua Absensi</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalAll}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Absensi Hari Ini</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalToday}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Masuk Hari Ini</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.masukToday}</p>
              </div>
              <Clock className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Terverifikasi Foto</p>
                <p className="text-2xl font-bold text-purple-600">{stats.withPhoto}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Admin</CardTitle>
          <CardDescription>Kelola data absensi dan sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={onExportData} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Semua Data
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Laporan Bulanan
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Kelola Karyawan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
          <CardDescription>10 absensi terakhir dengan kontrol admin</CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Belum ada data absensi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.slice(0, 10).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {record.faceImage ? (
                      <img
                        src={record.faceImage || "/placeholder.svg"}
                        alt="Face verification"
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold">{record.name}</div>
                      <div className="text-sm text-gray-600">
                        {record.date} • {record.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={record.status === "masuk" ? "default" : "destructive"}
                      className={record.status === "masuk" ? "bg-green-100 text-green-800" : ""}
                    >
                      {record.status === "masuk" ? "Masuk" : "Keluar"}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(record)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(record.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Hapus Data Absensi?</h3>
              <p className="text-gray-600 mb-6">Data yang dihapus tidak dapat dikembalikan. Apakah Anda yakin?</p>
              <div className="flex gap-3">
                <Button onClick={() => handleDelete(showDeleteConfirm)} variant="destructive" className="flex-1">
                  Ya, Hapus
                </Button>
                <Button onClick={() => setShowDeleteConfirm(null)} variant="outline" className="flex-1">
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <strong>ID:</strong> {selectedRecord.id}
                </div>
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
                <div>
                  <strong>Verifikasi:</strong>
                  {selectedRecord.faceImage ? (
                    <span className="text-green-600 ml-2">✓ Terverifikasi</span>
                  ) : (
                    <span className="text-red-600 ml-2">✗ Tidak ada foto</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
