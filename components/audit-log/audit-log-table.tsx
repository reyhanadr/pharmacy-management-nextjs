"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Clock, User, Database, Eye, Search } from "lucide-react"
import type { AuditLog, StockLog } from "./audit-log-action"

interface AuditLogTableProps {
  initialLogs: AuditLog[]
  title: string
  description: string
}

interface StockLogTableProps {
  initialLogs: StockLog[]
  title: string
  description: string
}

export function AuditLogTable({ initialLogs, title, description }: AuditLogTableProps) {
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>(initialLogs)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    let filtered = initialLogs

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(log =>
        log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredLogs(filtered)
  }, [initialLogs, searchTerm])

  const getActionBadge = (action: string) => {
    const variants = {
      insert: { variant: "default" as const, label: "Tambah", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      update: { variant: "secondary" as const, label: "Ubah", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
      delete: { variant: "destructive" as const, label: "Hapus", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" }
    }
    const config = variants[action as keyof typeof variants] || variants.update
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>

        {/* Simple Search */}
        <div className="mt-4 mb-4">
          <Label htmlFor="search">Cari</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Cari berdasarkan tabel, user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Waktu</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
                <TableHead className="text-center">Tabel</TableHead>
                <TableHead className="text-center">Record ID</TableHead>
                <TableHead className="text-center">User</TableHead>
                <TableHead className="text-center">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Tidak ada audit log ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <Clock className="h-4 w-4 mb-1 text-gray-400" />
                        <div className="text-sm">
                          {new Date(log.created_at).toLocaleDateString('id-ID')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.created_at).toLocaleTimeString('id-ID')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getActionBadge(log.action_type)}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {log.table_name}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {log.record_id || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <User className="h-4 w-4 mb-1 text-gray-400" />
                        <div className="text-sm font-medium">
                          {log.user_profile?.full_name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {log.user_profile?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Lihat Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export function StockLogTable({ initialLogs, title, description }: StockLogTableProps) {
  const [filteredLogs, setFilteredLogs] = useState<StockLog[]>(initialLogs)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")

  useEffect(() => {
    let filtered = initialLogs

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(log =>
        log.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.product?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter(log => log.type === selectedType)
    }

    setFilteredLogs(filtered)
  }, [initialLogs, searchTerm, selectedType])

  const getTypeBadge = (type: string) => {
    const variants = {
      in: { variant: "default" as const, label: "Masuk", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      out: { variant: "secondary" as const, label: "Keluar", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" }
    }
    const config = variants[type as keyof typeof variants] || variants.out
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>

        {/* Simple Filters */}
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Cari</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Cari berdasarkan produk, user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Tipe</Label>
              <div className="flex gap-2">
                <Button
                  variant={selectedType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType("all")}
                >
                  Semua
                </Button>
                <Button
                  variant={selectedType === "in" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType("in")}
                >
                  Masuk
                </Button>
                <Button
                  variant={selectedType === "out" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType("out")}
                >
                  Keluar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Waktu</TableHead>
                <TableHead className="text-center">Produk</TableHead>
                <TableHead className="text-center">Tipe</TableHead>
                <TableHead className="text-center">Jumlah</TableHead>
                <TableHead className="text-center">User</TableHead>
                <TableHead className="text-center">Alasan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Tidak ada stock log ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <Clock className="h-4 w-4 mb-1 text-gray-400" />
                        <div className="text-sm">
                          {new Date(log.date).toLocaleDateString('id-ID')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.date).toLocaleTimeString('id-ID')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <div className="font-medium">{log.product?.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{log.product?.code}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getTypeBadge(log.type)}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {log.quantity > 0 ? '+' : ''}{log.quantity}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <User className="h-4 w-4 mb-1 text-gray-400" />
                        <div className="text-sm font-medium">
                          {log.user_profile?.full_name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {log.user_profile?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {log.reason || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
