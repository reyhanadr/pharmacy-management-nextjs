"use client"

import React from "react"
import type { Transaction } from "@/components/cashier/cashier-action"

interface TransactionHistoryHeaderProps {
  transactions: Transaction[]
}

export function TransactionHistoryHeader({ transactions }: TransactionHistoryHeaderProps) {
  // Calculate summary statistics
  const totalTransactions = transactions.length
  const totalSales = transactions.reduce((sum, t) => sum + t.total, 0)
  const todayTransactions = transactions.filter(t =>
    new Date(t.date).toDateString() === new Date().toDateString()
  ).length
  const todaySales = transactions
    .filter(t => new Date(t.date).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.total, 0)

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Transaksi</h1>
          <p className="text-muted-foreground">
            Riwayat transaksi yang pernah dilakukan
          </p>
        </div>
        {/* Future: Add filters, export buttons, etc. */}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm font-medium text-muted-foreground">Total Transaksi</div>
          <div className="text-2xl font-bold">{totalTransactions}</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm font-medium text-muted-foreground">Total Penjualan</div>
          <div className="text-2xl font-bold text-green-600">
            Rp {totalSales.toLocaleString()}
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm font-medium text-muted-foreground">Transaksi Hari Ini</div>
          <div className="text-2xl font-bold">{todayTransactions}</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm font-medium text-muted-foreground">Penjualan Hari Ini</div>
          <div className="text-2xl font-bold text-green-600">
            Rp {todaySales.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}