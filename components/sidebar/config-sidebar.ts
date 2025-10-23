import {
  LifeBuoy,
  Send,
  Plus,
  CreditCard,
  XCircle,
  History,
  FileText,
  Edit,
  Eye,
  AlertTriangle,
  BarChart3,
  UserPlus,
  Trash2,
  UserCog,
  Wallet,
  Shield,
  Database,
  ShoppingCart,
  Package,
  Receipt,
  TrendingDown,
} from "lucide-react"

export const data = {
  user: {
    name: "Pharmacy Admin",
    email: "admin@pharmacy.com",
    avatar: "/avatars/admin.jpg",
  },
  navTransactions: [
    // Cashier Module
    {
      title: "Tambah Transaksi Penjualan",
      url: "/cashier/new-transaction",
      icon: Plus,
    },
    // {
    //   title: "Proses Pembayaran",
    //   url: "/cashier/process-payment",
    //   icon: CreditCard,
    // },
    // {
    //   title: "Batalkan Transaksi",
    //   url: "/cashier/cancel-transaction",
    //   icon: XCircle,
    // },
    {
      title: "Lihat Riwayat Transaksi",
      url: "/cashier/transaction-history",
      icon: History,
    },
    {
      title: "Cetak Laporan Harian",
      url: "/cashier/daily-report",
      icon: FileText,
    },
  ],
  navInventory: [
    // Inventory Module
    {
      title: "Tambah Barang Baru",
      url: "/inventory/add-item",
      icon: Plus,
    },
    // {
    //   title: "Update Stok Masuk",
    //   url: "/inventory/stock-in",
    //   icon: Edit,
    // },
    // {
    //   title: "Update Stok Keluar",
    //   url: "/inventory/stock-out",
    //   icon: Edit,
    // },
    {
      title: "Lihat Daftar Stok",
      url: "/inventory/inventory-list",
      icon: Eye,
    },
    // {
    //   title: "Peringatan Stok Rendah",
    //   url: "/inventory/low-stock-alerts",
    //   icon: AlertTriangle,
    // },
    {
      title: "Laporan Stok",
      url: "/inventory/inventory-reports",
      icon: BarChart3,
    },
  ],
  navSupplier: [
    // Supplier Module
    {
      title: "Tambah Supplier",
      url: "#", // Modal will be opened instead of navigating to a page
      icon: UserPlus,
    },
    {
      title: "Lihat Daftar Supplier",
      url: "/supplier/supplier-list",
      icon: Eye,
    },
    // Purchase Management
    {
      title: "Buat Purchase Order",
      url: "/supplier/manage-purchase-order/create-purchase-order",
      icon: ShoppingCart,
    },
    {
      title: "Kelola Purchase Order",
      url: "/supplier/manage-purchase-order",
      icon: Package,
    },
    // {
    //   title: "Riwayat Pembelian",
    //   url: "/supplier/purchase-history",
    //   icon: History,
    // },
    // {
    //   title: "Invoice Supplier",
    //   url: "/supplier/supplier-invoices",
    //   icon: Receipt,
    // },
    // Stock Out Management
    // {
    //   title: "Pengeluaran Barang",
    //   url: "/supplier/stock-out",
    //   icon: TrendingDown,
    // },
    // {
    //   title: "Alasan Pengeluaran",
    //   url: "/supplier/out-reasons",
    //   icon: AlertTriangle,
    // },
    {
      title: "Laporan Pengeluaran",
      url: "/supplier/out-reports",
      icon: BarChart3,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  navAdmin: [
    // Admin Module
    {
      name: "Kelola Pegawai",
      url: "/admin/manage-users",
      icon: UserCog,
    },
    {
      name: "Laporan Keuangan",
      url: "/admin/financial-reports",
      icon: Wallet,
    },
    {
      name: "Audit Log",
      url: "/admin/audit-log",
      icon: Shield,
    },
    {
      name: "Backup Data",
      url: "/admin/data-backup",
      icon: Database,
    },
  ],
}