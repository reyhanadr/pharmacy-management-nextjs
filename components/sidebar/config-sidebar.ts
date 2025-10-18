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
    {
      title: "Proses Pembayaran",
      url: "/cashier/process-payment",
      icon: CreditCard,
    },
    {
      title: "Batalkan Transaksi",
      url: "/cashier/cancel-transaction",
      icon: XCircle,
    },
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
      url: "/supplier/add-supplier",
      icon: UserPlus,
    },
    // {
    //   title: "Update Supplier",
    //   url: "/supplier/update-supplier",
    //   icon: Edit,
    // },
    // {
    //   title: "Hapus Supplier",
    //   url: "/supplier/delete-supplier",
    //   icon: Trash2,
    // },
    {
      title: "Lihat Daftar Supplier",
      url: "/supplier/supplier-list",
      icon: Eye,
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
      name: "Kelola User",
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