import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calendar, ShoppingCart, CreditCard, Printer, DollarSign, Smartphone } from "lucide-react"
import { formatCurrency } from "@/components/utils/format-currency"
import { formatDate } from "@/components/utils/format-date"
import { Transaction } from './cashier-action'

interface TransactionDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
}

export function TransactionDetailModal({
  open,
  onOpenChange,
  transaction,
}: TransactionDetailModalProps) {
  if (!transaction) return null

  const getPaymentMethodBadge = (method: string) => {
    const variants = {
      cash: {
        variant: "default" as const,
        label: "Tunai",
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        icon: DollarSign
      },
      card: {
        variant: "secondary" as const,
        label: "Kartu",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        icon: CreditCard
      },
      digital: {
        variant: "outline" as const,
        label: "Digital",
        color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
        icon: Smartphone
      }
    }
    const config = variants[method as keyof typeof variants] || variants.cash
    const IconComponent = config.icon
    return (
      <Badge variant={config.variant} className={config.color}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: { variant: "default" as const, label: "Selesai", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      cancelled: { variant: "destructive" as const, label: "Dibatalkan", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" }
    }
    const config = variants[status as keyof typeof variants] || variants.completed
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const handlePrintInvoice = () => {
    // TODO: Implement print invoice functionality
    console.log('Print invoice for transaction:', transaction.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="h-5 w-5" />
            Detail Transaksi
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang transaksi penjualan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Transaction Details */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  Informasi Transaksi
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-muted-foreground">No. Transaksi:</span>
                    <span className="text-sm font-mono bg-muted px-2 py-1 rounded text-right">
                      TRX-{String(transaction.id).padStart(4, '0')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Metode Pembayaran:</span>
                    <div className="flex items-center gap-1">
                      {getPaymentMethodBadge(transaction.payment_method)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Status:</span>
                    <div className="flex items-center">
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  Ringkasan
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Jumlah Item:</span>
                    <span className="font-semibold">{transaction.items?.length || 0} produk</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg transition-colors">
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Total Amount:</span>
                    <span className="font-bold text-lg text-green-800 dark:text-green-200 text-right min-w-0 break-words">
                      {formatCurrency(transaction.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Transaction Items */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Item yang Dibeli
            </h3>
            <div className="space-y-2">
              {transaction.items?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{item.product_name}</div>
                    <div className="text-sm text-muted-foreground">
                      Kode: {item.product_code} | Qty: {item.quantity} | Harga Satuan: {formatCurrency(item.price_sell)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(item.total)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Riwayat
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Tanggal Transaksi:</span>
                  <p className="text-sm">{formatDate(transaction.date)}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="default"
              className="cursor-pointer"
              onClick={handlePrintInvoice}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Invoice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}